import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const fromDocusaurus = createRequire(require.resolve("@docusaurus/mdx-loader"));
const parser = fromDocusaurus.resolve("image-size/fromFile");
const directory = await mkdtemp(join(tmpdir(), "rfp-image-regressions-"));
const env = { ...process.env };
delete env.NODE_OPTIONS;
delete env.VSCODE_INSPECTOR_OPTIONS;

function box(name, body, size = body.length + 8) {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(size);
    header.write(name, 4, "ascii");
    return Buffer.concat([header, body]);
}

const fixtures = [
    ["zero-entry.icns", Buffer.from("69636e73000000106973333200000000", "hex")],
    [
        "zero-partial.jxl",
        Buffer.concat([
            box("JXL ", Buffer.from("0d0a870a", "hex")),
            box("ftyp", Buffer.from("6a786c20000000006a786c20", "hex")),
            box("jxlp", Buffer.alloc(4), 0),
        ]),
    ],
    [
        "zero-property.heif",
        Buffer.concat([
            box("ftyp", Buffer.from("6176696600000000", "hex")),
            box(
                "meta",
                Buffer.concat([
                    Buffer.alloc(4),
                    box(
                        "iprp",
                        box(
                            "ipco",
                            box(
                                "ispe",
                                Buffer.from("000000000000000100000001", "hex"),
                                0
                            )
                        )
                    ),
                ])
            ),
        ]),
    ],
    [
        "valid.svg",
        Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="17"/>'
        ),
        { width: 23, height: 17 },
    ],
    [
        "valid.gif",
        Buffer.from(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            "base64"
        ),
        { width: 1, height: 1 },
    ],
    [
        "valid.png",
        Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFwAAAABJRU5ErkJggg==",
            "base64"
        ),
        { width: 1, height: 1 },
    ],
];

try {
    for (const [
        name,
        bytes,
        expected,
    ] of fixtures) {
        const file = join(directory, name);
        await writeFile(file, bytes);
        // The parser runs in another process: an infinite loop cannot hang the test runner.
        const child = spawnSync(
            process.execPath,
            [
                "--max-old-space-size=64",
                "--eval",
                'const { imageSizeFromFile } = require(process.argv[1]); imageSizeFromFile(process.argv[2]).then(value => console.log(JSON.stringify(value)), () => console.log("rejected"));',
                parser,
                file,
            ],
            { encoding: "utf8", env, timeout: 5000 }
        );
        assert.ifError(child.error);
        assert.equal(
            child.status,
            0,
            `${name}: parser crashed or failed to terminate`
        );
        const output = child.stdout.trim();
        if (expected) {
            const dimensions = JSON.parse(output);
            assert.equal(dimensions.width, expected.width, name);
            assert.equal(dimensions.height, expected.height, name);
        } else {
            // A zero-size BMFF box can validly extend to EOF; rejection or finite dimensions are acceptable.
            assert.ok(
                output === "rejected" ||
                    Number.isFinite(JSON.parse(output).width),
                name
            );
        }
    }
    console.log(
        "Docusaurus image parser: 3 malformed-file regressions and SVG/GIF/PNG dimensions passed."
    );
} finally {
    await rm(directory, { recursive: true, force: true });
}
