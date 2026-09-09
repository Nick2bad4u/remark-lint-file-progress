import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { stripVTControlCharacters } from "node:util";
import xterm from "@xterm/headless";
import { format, resolveConfig } from "prettier";
import { ProgressController } from "../dist/_internal/controller.js";
import {
    normalizeSettings,
    possibleOptions,
} from "../dist/_internal/options.js";
import { optionDemos } from "./demo-cases.mjs";

const { Terminal } = xterm;

const check = process.argv.includes("--check");
for (const option of Object.keys(possibleOptions))
    assert.ok(
        optionDemos.some((demo) => Object.hasOwn(demo.options, option)),
        `Missing option demo: ${option}`
    );
const root = "docs/docusaurus/static/demos";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const env = { ...process.env, CI: "true" };
delete env.NODE_OPTIONS;
delete env.VSCODE_INSPECTOR_OPTIONS;
// Resolve CI-aware presets in a fresh process, independent of the generator's environment.
const presets = JSON.parse(
    execFileSync(
        process.execPath,
        [
            "--input-type=module",
            "--eval",
            'import { configs } from "./dist/plugin.js"; console.log(JSON.stringify(configs));',
        ],
        { encoding: "utf8", env }
    )
);
const cases = [
    ...Object.entries(presets).map(([name, config]) => ({
        name,
        group: "presets",
        options: config.plugins[0][1],
        ci: name === "recommended-ci" || name === "recommended-ci-detailed",
    })),
    ...optionDemos.map((demo) => ({ ...demo, group: "options" })),
];
const samples = [
    "src/base.md",
    "src/layout.md",
    "src/components/card.md",
    "src/components/button.md",
    "src/theme.md",
    "src/guides/advanced/api/reference/examples/overview.md",
];
const manifest = {};
const recorded = check
    ? JSON.parse(await readFile(`${root}/integrity.json`, "utf8"))
    : {};
if (!check) {
    assert.equal(
        execFileSync("agg", ["--version"], { encoding: "utf8" }).trim(),
        "agg 1.9.0",
        "Install agg 1.9.0 to regenerate the GIFs"
    );
    for (const group of [
        "presets",
        "options",
        "casts",
    ])
        await mkdir(`${root}/${group}`, { recursive: true });
}

async function sync(file, expected) {
    if (check)
        assert.equal(
            await readFile(file, "utf8"),
            expected,
            `Stale demo: ${file}; run npm run docs:demos:write`
        );
    else await writeFile(file, expected);
}

let poster = "";
for (const demo of cases) {
    const settings = normalizeSettings(demo.options);
    const tty = demo.tty !== false;
    let milliseconds = 0;
    let onExit;
    let display = "";
    let preview =
        demo.name === "recommended-detailed"
            ? new Terminal({
                  allowProposedApi: true,
                  cols: 94,
                  convertEol: true,
                  rows: 22,
              })
            : undefined;
    const stream = settings.outputStream;
    const events = [
        [
            0,
            "o",
            "\u001b[?25l",
        ],
    ];
    const emit = (text) => {
        display += text;
        preview?.write(text);
        events.push([
            milliseconds / 1000,
            "o",
            text.replaceAll("\n", "\r\n"),
        ]);
    };
    emit(`\u001b[1;36mRemark File Progress\u001b[0m  /  ${demo.name}\n`);
    emit(
        `\u001b[90m${stream} | ${tty ? "interactive terminal" : "redirected output"}${demo.ci ? " | CI=true" : ""}\u001b[0m\n\n`
    );
    emit("\u001b[36m$\u001b[0m npx remark 'src/**/*.md'\n\n");
    const controller = new ProgressController({
        color: () => tty,
        cwd: () => "/demo",
        isTTY: () => tty,
        now: () => milliseconds,
        onExit: (callback) => {
            onExit = callback;
        },
        terminal: () => ({
            columns: 94,
            revision: String(display.length),
            rows: 22,
        }),
        write: (selected, text) => {
            assert.equal(selected, stream);
            emit(text);
        },
    });
    for (const filename of samples) {
        milliseconds += 380;
        controller.observe(`/demo/${filename}`, settings);
    }
    if (preview) {
        await new Promise((resolve) => preview.write("", resolve));
        // Capture the actual live screen before the summary replaces the filename.
        const lines = [];
        for (let row = 0; row <= preview.buffer.active.cursorY; row += 1) {
            const line = preview.buffer.active.getLine(row);
            let text = "";
            let style = "";
            for (let column = 0; column < preview.cols; column += 1) {
                const cell = line.getCell(column);
                if (cell.getWidth() === 0) continue;
                const color = cell.getFgColor();
                const codes = [0];
                if (cell.isFgPalette())
                    codes.push(color < 8 ? color + 30 : color + 82);
                if (cell.isBold()) codes.push(1);
                if (cell.isDim()) codes.push(2);
                const nextStyle = codes.join(";");
                if (style !== nextStyle) text += `\u001b[${nextStyle}m`;
                style = nextStyle;
                text += cell.getChars() || " ";
            }
            lines.push(text);
        }
        poster = lines.join("\n");
        preview.dispose();
        preview = undefined;
    }
    milliseconds += 700;
    onExit(demo.exitCode ?? 0);
    milliseconds += 400;
    emit("\n\u001b[36m$\u001b[0m ");
    const cast = `${JSON.stringify({ version: 2, width: 94, height: 22, timestamp: 1744070400, env: { TERM: "xterm-256color", SHELL: "/bin/sh" } })}\n${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
    const stem = `${demo.group}-${demo.name}`;
    const castPath = `${root}/casts/${stem}.cast`;
    const gifPath = `${root}/${demo.group}/${demo.name}.gif`;
    await sync(castPath, cast);
    if (!check)
        execFileSync(
            "agg",
            [
                castPath,
                gifPath,
                "--cols",
                "94",
                "--rows",
                "22",
                "--font-size",
                "16",
                "--idle-time-limit",
                "1",
                "--last-frame-duration",
                "1.5",
                "--theme",
                "github-dark",
            ],
            { stdio: "pipe" }
        );
    const gif = await readFile(gifPath);
    assert.equal(gif.subarray(0, 6).toString(), "GIF89a");
    manifest[stem] = { cast: hash(cast), gif: hash(gif) };
    if (check)
        assert.deepEqual(
            manifest[stem],
            recorded[stem],
            `Demo integrity mismatch: ${stem}`
        );
}
assert.equal(Object.keys(manifest).length, 31);
if (check)
    assert.deepEqual(
        Object.keys(manifest).sort(),
        Object.keys(recorded).sort(),
        "Demo inventory differs"
    );
else
    await writeFile(
        `${root}/integrity.json`,
        `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([left], [right]) => (left < right ? -1 : 1))), null, 4)}\n`
    );

// Keep a static, accessible poster for consumers that do not animate images.
const escape = (text) =>
    text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
// Match agg 1.9.0's github-dark palette and its 50% faint text opacity.
const foreground = "#eceff4";
const palette = {
    31: "#f97583",
    32: "#a2fca2",
    33: "#fabb72",
    34: "#7db4f9",
    35: "#c4a0f5",
    36: "#1f6feb",
    90: "#6a737d",
};
const lines = poster
    .split("\n")
    .map((line, index) => {
        let color = foreground;
        let bold = false;
        let dim = false;
        const spans = line
            .split(/(\u001b\[[\d;]*m)/u)
            .map((part) => {
                if (part.startsWith("\u001b[")) {
                    for (const code of part
                        .slice(2, -1)
                        .split(";")
                        .map(Number)) {
                        if (code === 0) {
                            color = foreground;
                            bold = false;
                            dim = false;
                        } else if (code === 39) color = foreground;
                        else if (code === 1) bold = true;
                        else if (code === 2) dim = true;
                        else if (code === 22) {
                            bold = false;
                            dim = false;
                        } else if (palette[code]) color = palette[code];
                    }
                    return "";
                }
                return `<tspan fill="${color}" font-weight="${bold ? 700 : 400}" opacity="${dim ? 0.5 : 1}">${escape(stripVTControlCharacters(part))}</tspan>`;
            })
            .join("");
        // Whitespace between SVG text spans renders as spaces in filenames.
        // Preserve the exact terminal line when formatting this generated SVG.
        return `<!-- prettier-ignore --><text x="26" y="${70 + index * 23}">${spans}</text>`;
    })
    .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="540" viewBox="0 0 940 540" role="img" aria-label="Colored remark live progress showing the latest Markdown filename"><rect width="940" height="540" rx="14" fill="#171b21"/><circle cx="28" cy="25" r="6" fill="#f97583"/><circle cx="48" cy="25" r="6" fill="#fabb72"/><circle cx="68" cy="25" r="6" fill="#a2fca2"/><g font-family="Consolas,monospace" font-size="16">${lines}</g></svg>\n`;
const posterPath = "docs/docusaurus/static/img/terminal.svg";
await sync(
    posterPath,
    await format(svg, {
        ...(await resolveConfig(posterPath)),
        filepath: posterPath,
        parser: "html",
    })
);
console.log(
    `${check ? "Verified" : "Generated"} ${cases.length} colored demos, deterministic casts, integrity hashes, and static poster.`
);
