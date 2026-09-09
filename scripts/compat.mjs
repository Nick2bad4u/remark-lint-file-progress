import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this command through npm run test:compat");
const environment = Object.fromEntries(
    Object.entries(process.env).filter(
        ([name]) =>
            ![
                "npm_config_allow_scripts",
                "node_options",
                "vscode_inspector_options",
            ].includes(name.toLowerCase())
    )
);
const workspace = await mkdtemp(
    path.join(tmpdir(), "remark-progress-consumer-")
);
const npmConfig = path.join(workspace, "empty.npmrc");
await writeFile(npmConfig, "");
const globalNpmConfig = path.join(workspace, "global.npmrc");
await writeFile(globalNpmConfig, "");
const childEnvironment = {
    ...environment,
    npm_config_userconfig: npmConfig,
    npm_config_globalconfig: globalNpmConfig,
};
function execute(executable, args, cwd = root) {
    const result = spawnSync(executable, args, {
        cwd,
        encoding: "utf8",
        env: childEnvironment,
        timeout: 180000,
    });
    if (result.status !== 0)
        throw new Error(
            `${executable} ${args.join(" ")}: ${result.error || result.stdout || result.stderr}\n${result.stderr}`
        );
    return result.stdout;
}
const npm = (args, cwd) => execute(process.execPath, [npmCli, ...args], cwd);
const profiles = [
    {
        name: "minimum",
        unified: "11.0.0",
        vfile: "6.0.0",
        remark: "15.0.0",
        cli: "12.0.0",
        lint: "10.0.0",
    },
    {
        name: "current",
        unified: "11.0.5",
        vfile: "6.0.3",
        remark: "15.0.1",
        cli: "12.0.1",
        lint: "10.0.1",
    },
];
const results = [];
const windowsConsole = process.argv.includes("--windows-console");
if (windowsConsole && process.platform !== "win32")
    throw new Error(
        "The Windows console regression requires a Windows terminal"
    );
try {
    const packed = JSON.parse(
        npm(
            [
                "pack",
                "--json",
                "--ignore-scripts",
                "--pack-destination",
                workspace,
            ],
            root
        )
    );
    const item = Array.isArray(packed)
        ? packed[0]
        : packed.filename
          ? packed
          : Object.values(packed)[0];
    assert.equal(typeof item.filename, "string");
    assert.equal(path.basename(item.filename), item.filename);
    const packageContents = item.files.map((file) => file.path);
    assert.ok(
        packageContents.every((file) =>
            /^(?:dist\/|docs\/rules\/|package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$|NOTICE$)/u.test(
                file
            )
        ),
        "The artifact must contain only runtime output, declarations, and package documentation"
    );
    const tarball = path.join(workspace, item.filename);
    const manifest = JSON.parse(await readFile("package.json", "utf8"));
    const presetNames = Object.keys(manifest.exports)
        .filter((key) => key.startsWith("./configs/"))
        .map((key) => key.slice(10));
    assert.equal(presetNames.length, 7);
    for (const profile of profiles) {
        const consumer = path.join(workspace, profile.name);
        await mkdir(consumer);
        await writeFile(
            path.join(consumer, "package.json"),
            JSON.stringify({
                name: "remark-progress-consumer",
                private: true,
                type: "module",
                allowScripts: {},
            })
        );
        await writeFile(
            path.join(consumer, ".npmrc"),
            "strict-allow-scripts=true\n"
        );
        npm(
            [
                "install",
                "--ignore-scripts",
                "--no-audit",
                "--no-fund",
                tarball,
                `unified@${profile.unified}`,
                `vfile@${profile.vfile}`,
                `remark@${profile.remark}`,
                `remark-cli@${profile.cli}`,
                `remark-lint@${profile.lint}`,
                "remark-lint-heading-increment@4.0.1",
                "@types/node@22",
            ],
            consumer
        );
        await writeFile(
            path.join(consumer, "verify.mjs"),
            `
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {remark} from 'remark';
import {VFile} from 'vfile';
import lint from 'remark-lint';
import heading from 'remark-lint-heading-increment';
import progress, {configs, meta} from 'remark-lint-file-progress';
const require=createRequire(import.meta.url);
const common=require('remark-lint-file-progress');
assert.equal(progress,common);
assert.equal(meta.version,${JSON.stringify(manifest.version)});
assert.equal(common.configs,configs);
for(const entry of [progress,common]) {
    const file=new VFile({path:'same.md',value:'# First\\n\\n### Skipped\\n'});
    const processor=remark().use(lint).use(entry,{hide:true}).use(heading);
    const first=await processor.process(file);
    assert.equal(first.messages.length,1);
    assert.equal(String(first),'# First\\n\\n### Skipped\\n');
}
for(const name of ${JSON.stringify(presetNames)}) {
    const esm=await import('remark-lint-file-progress/configs/'+name);
    const commonPreset=require('remark-lint-file-progress/configs/'+name);
    assert.equal(esm.default,commonPreset);
    for(const preset of [esm.default,commonPreset,configs[name]]) {
        const file=remark().use(preset).use(progress,{hide:true,showSummaryWhenHidden:false}).processSync('# Title\\n');
        assert.equal(file.messages.length,0);
        assert.equal(String(file),'# Title\\n');
    }
}
console.log('Verified root, seven presets, ESM/CommonJS identity, and preserved diagnostics on '+process.version);
`
        );
        for (const kind of ["mts", "cts"]) {
            const imports =
                kind === "mts"
                    ? "import progress from 'remark-lint-file-progress';"
                    : "import progress = require('remark-lint-file-progress');";
            const presets = presetNames
                .map((name, index) =>
                    kind === "mts"
                        ? `import preset${index} from 'remark-lint-file-progress/configs/${name}';`
                        : `import preset${index} = require('remark-lint-file-progress/configs/${name}');`
                )
                .join("\n");
            await writeFile(
                path.join(consumer, `types.${kind}`),
                `${imports}\n${presets}\n
import type {ProgressSettings, ProgressPluginOptions, FileProgressMetadata, FileProgressConfigName} from 'remark-lint-file-progress';
import type {Plugin, Preset} from 'unified';
import type {Root} from 'mdast';
const plugin: Plugin<[options?: ProgressPluginOptions],Root> = progress;
const options: ProgressSettings = {mode:'file',outputStream:'stderr',spinnerStyle:'dots'};
const name: FileProgressConfigName = 'recommended';
const metadata: FileProgressMetadata = progress.meta;
const presets: Preset[] = [${presetNames.map((_, index) => `preset${index}`).join(",")}];
// @ts-expect-error Invalid display modes remain type errors.
const invalid: ProgressSettings = {mode:'invalid'};
// @ts-expect-error Unknown presets remain type errors.
const missing: FileProgressConfigName = 'missing';
void [plugin,options,name,metadata,presets,invalid,missing];\n`
            );
        }
        execute(
            process.execPath,
            [
                path.join(root, "node_modules/typescript/bin/tsc"),
                "--noEmit",
                "--strict",
                "--module",
                "nodenext",
                "--target",
                "es2022",
                "types.mts",
                "types.cts",
            ],
            consumer
        );
        const verification = execute(
            process.execPath,
            ["verify.mjs"],
            consumer
        ).trim();
        await writeFile(
            path.join(consumer, "remarkrc.cjs"),
            "module.exports={plugins:[[require('remark-lint-file-progress'),{hide:true}]]};\n"
        );
        await writeFile(path.join(consumer, "sample.md"), "# Title\n");
        execute(
            process.execPath,
            [
                "node_modules/remark-cli/cli.js",
                "sample.md",
                "--rc-path",
                "remarkrc.cjs",
                "--no-ignore",
                "--no-stdout",
            ],
            consumer
        );
        let minimumVerification;
        if (process.argv.includes("--minimum-node")) {
            const platform =
                process.platform === "win32" ? "win" : process.platform;
            const binaryPackage = `node-${platform}-${process.arch}`;
            npm(
                [
                    "install",
                    "--ignore-scripts",
                    "--no-audit",
                    "--no-fund",
                    `${binaryPackage}@22.0.0`,
                ],
                consumer
            );
            const executable = path.join(
                consumer,
                "node_modules",
                binaryPackage,
                "bin",
                process.platform === "win32" ? "node.exe" : "node"
            );
            minimumVerification = execute(
                executable,
                ["verify.mjs"],
                consumer
            ).trim();
            execute(
                executable,
                [
                    "node_modules/remark-cli/cli.js",
                    "sample.md",
                    "--rc-path",
                    "remarkrc.cjs",
                    "--no-ignore",
                    "--no-stdout",
                ],
                consumer
            );
            if (windowsConsole) {
                await writeFile(
                    path.join(consumer, "console.mjs"),
                    `
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {remark} from 'remark';
import progress from 'remark-lint-file-progress';
assert.equal(process.version,'v22.0.0');
assert.equal(process.stdout.isTTY,true,'Run in a real terminal');
assert.equal(process.stderr.isTTY,true,'Run in a real terminal');
const codePage=()=>execFileSync('cmd.exe',['/d','/c','chcp'],{encoding:'utf8'}).trim();
assert.match(codePage(),/437$/u,'Select code page 437 before this probe');
const stream=process.argv[2];
const output=process[stream];
const originalWrite=output.write;
const columns=output.columns;
output.write('\\u001b[35mReporter before: élève / 東京 / ✔\\u001b[0m\\n');
remark().use(progress,{outputStream:stream,detailedSuccess:true,pathFormat:'basename'}).processSync({path:'élève-東京.md',value:'# Title\\n'});
remark().use(progress,{outputStream:stream,detailedSuccess:true,fileNameOnNewLine:true}).processSync({path:'docs/東京/élève-final.md',value:'# Final\\n'});
output.write('\\u001b[35mReporter after: élève / 東京 / ✔\\u001b[0m\\n');
assert.equal(output.write,originalWrite);
assert.equal(output.columns,columns);
assert.match(codePage(),/437$/u);
`
                );
                const consoleEnvironment = Object.fromEntries(
                    Object.entries(childEnvironment).filter(
                        ([name]) => name.toLowerCase() !== "no_color"
                    )
                );
                for (const stream of ["stdout", "stderr"]) {
                    const consoleResult = spawnSync(
                        executable,
                        ["console.mjs", stream],
                        {
                            cwd: consumer,
                            env: { ...consoleEnvironment, FORCE_COLOR: "1" },
                            stdio: "inherit",
                            timeout: 30000,
                        }
                    );
                    assert.equal(consoleResult.status, 0);
                }
            }
        }
        results.push({
            ...profile,
            verification,
            minimumVerification,
            ...(windowsConsole
                ? {
                      windowsConsole:
                          "Node 22.0.0, CP437, Unicode and ANSI on both TTY streams; reporter transport and columns unchanged",
                  }
                : {}),
        });
        console.log(JSON.stringify(results.at(-1)));
    }
    await mkdir(path.join(root, "reports"), { recursive: true });
    await writeFile(
        path.join(
            root,
            "reports",
            windowsConsole
                ? "compat-windows-console.json"
                : process.argv.includes("--minimum-node")
                  ? "compat-minimum.json"
                  : "compat.json"
        ),
        JSON.stringify(
            {
                version: manifest.version,
                artifact: {
                    filename: item.filename,
                    integrity: item.integrity,
                    size: item.size,
                    unpackedSize: item.unpackedSize,
                    files: packageContents,
                },
                results,
            },
            null,
            2
        ) + "\n"
    );
} finally {
    assert.equal(path.dirname(workspace), path.resolve(tmpdir()));
    assert.ok(path.basename(workspace).startsWith("remark-progress-consumer-"));
    await rm(workspace, { recursive: true, force: true });
}
