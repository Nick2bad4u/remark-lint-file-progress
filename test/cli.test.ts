import { spawnSync } from "node:child_process";
import { once } from "node:events";
import {
    copyFileSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    realpathSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { text } from "node:stream/consumers";
import { pathToFileURL } from "node:url";
import { stripVTControlCharacters } from "node:util";
import { Worker } from "node:worker_threads";
import { afterEach, describe, expect, it } from "vitest";

import { meta } from "../src/plugin.js";

type Environment = Record<string, string | undefined>;
const require = createRequire(import.meta.url);
const entry = pathToFileURL(path.resolve("dist/plugin.js")).href;
const commonEntry = path.resolve("dist/plugin.cjs");
const headingRule = pathToFileURL(
    require.resolve("remark-lint-heading-increment")
).href;
const remarkEntry = pathToFileURL(require.resolve("remark")).href;
const cliEntry = path.resolve("node_modules/remark-cli/cli.js");
const folders: string[] = [];
// Canonical paths keep /var and /private/var aligned in macOS fixtures.
const fixtureRoot = realpathSync(tmpdir());

function environment(overrides: Readonly<Environment> = {}): Environment {
    // eslint-disable-next-line n/no-process-env -- Child-process output must exclude inherited debugger instrumentation.
    const inherited = process.env;
    const childEnvironment = {
        ...Object.fromEntries(
            Object.entries(inherited).filter(
                ([name]) =>
                    name.toUpperCase() !== "NODE_OPTIONS" &&
                    name.toUpperCase() !== "VSCODE_INSPECTOR_OPTIONS"
            )
        ),
        FORCE_COLOR: "0",
        NO_COLOR: "1",
        ...overrides,
    };
    if (overrides.FORCE_COLOR === "1")
        Reflect.deleteProperty(childEnvironment, "NO_COLOR");
    return childEnvironment;
}

function evaluate(source: string, overrides: Readonly<Environment> = {}) {
    return spawnSync(
        process.execPath,
        [
            "--input-type=module",
            "--eval",
            source,
        ],
        {
            encoding: "utf8",
            env: environment(overrides),
            timeout: 20_000,
        }
    );
}

function fixture(
    options: Record<string, unknown> = {},
    syntax?: string
): string {
    const folder = mkdtempSync(path.join(fixtureRoot, "remark-progress-cli-"));
    folders.push(folder);
    writeFileSync(path.join(folder, "a.md"), "# First\n\n### Skipped\n");
    writeFileSync(path.join(folder, "b.md"), "# Second\n");
    for (const isEnabled of [true, false]) {
        const syntaxImport =
            syntax === undefined
                ? ""
                : `import syntax from ${JSON.stringify(pathToFileURL(require.resolve(syntax)).href)};`;
        writeFileSync(
            path.join(folder, isEnabled ? "enabled.mjs" : "disabled.mjs"),
            `import progress from ${JSON.stringify(entry)};\nimport heading from ${JSON.stringify(headingRule)};\n${syntaxImport}\nexport default {plugins: [${syntax === undefined ? "" : "syntax,"}[progress, ${isEnabled ? JSON.stringify({ detailedSuccess: true, ...options }) : "false"}], heading]};\n`
        );
    }
    return folder;
}

function run(
    folder: string,
    args: string[] = ["a.md"],
    isEnabled = true,
    input?: string,
    overrides: Readonly<Environment> = {},
    preload?: string
) {
    return spawnSync(
        process.execPath,
        [
            ...(preload === undefined
                ? []
                : ["--import", pathToFileURL(preload).href]),
            cliEntry,
            "--rc-path",
            path.join(folder, isEnabled ? "enabled.mjs" : "disabled.mjs"),
            "--no-ignore",
            ...args,
        ],
        {
            cwd: folder,
            encoding: "utf8",
            env: environment(overrides),
            input,
            timeout: 20_000,
        }
    );
}

describe("remark integration", () => {
    // eslint-disable-next-line vitest/no-hooks -- Clean task-owned temporary fixtures after every assertion outcome.
    afterEach(() => {
        for (const folder of folders.splice(0)) {
            if (
                path.dirname(folder) !== fixtureRoot ||
                !path.basename(folder).startsWith("remark-progress-cli-")
            )
                throw new Error("Unsafe fixture cleanup path");
            rmSync(folder, { force: true, recursive: true });
        }
    });

    describe("remark CLI behavior", () => {
        it.each([{ flags: [] }, { flags: ["--frail"] }])(
            "preserves warnings, Markdown, and exit status with %j",
            ({ flags }) => {
                expect.hasAssertions();

                const folder = fixture();
                const plain = run(folder, ["a.md", ...flags], false);
                const progress = run(folder, ["a.md", ...flags]);

                expect(plain.status).toBe(flags.length > 0 ? 1 : 0);
                expect(progress.status).toBe(plain.status);
                expect(progress.stdout).toBe(plain.stdout);
                expect(progress.stderr).toContain(plain.stderr);
                expect(progress.stderr).toContain("linting a.md");
                expect(
                    progress.stderr.match(/Files observed: 1/gv)
                ).toHaveLength(1);
                expect(progress.stderr).not.toContain("Problems:");
            }
        );

        it("handles passing files and emits one summary after the reporter", () => {
            expect.hasAssertions();

            const result = run(fixture(), ["b.md", "--no-stdout"]);

            expect(result.status).toBe(0);
            expect(result.stderr).toContain("linting b.md");
            expect(result.stderr.match(/Lint complete\./gv)).toHaveLength(1);
            expect(result.stderr.indexOf("Lint complete.")).toBeGreaterThan(
                result.stderr.indexOf("no issues found")
            );
        });

        it.each([undefined, "stdin-élève.md"])(
            "preserves stdin with filename %s",
            (filename) => {
                expect.hasAssertions();

                const folder = fixture();
                const args =
                    filename === undefined ? [] : ["--file-path", filename];
                const plain = run(folder, args, false, "# stdin\n");
                const progress = run(folder, args, true, "# stdin\n");

                expect(progress.status).toBe(plain.status);
                expect(progress.stdout).toBe(plain.stdout);
                expect(progress.stderr).toContain(
                    `linting ${filename ?? "<input>"}`
                );
                expect(
                    progress.stderr.match(/Files observed: 1/gv)
                ).toHaveLength(1);
            }
        );

        it("preserves JSON trees and custom reporter results", () => {
            expect.hasAssertions();

            const folder = fixture();
            const reporter = path.join(folder, "reporter.mjs");
            writeFileSync(
                reporter,
                "export default files => JSON.stringify(files.map(file => file.messages.map(message => ({reason: message.reason, fatal: message.fatal, ruleId: message.ruleId}))));\n"
            );
            const args = [
                "a.md",
                "--tree-out",
                "--report",
                reporter,
            ];
            const plain = run(folder, args, false);
            const progress = run(folder, args);

            expect(progress.status).toBe(plain.status);
            expect(progress.stdout).toBe(plain.stdout);
            expect(JSON.parse(progress.stdout)).toHaveProperty("type", "root");
            expect(progress.stderr).toContain(plain.stderr);
        });

        it.each(["--quiet", "--silent"])(
            "preserves reporter behavior with %s",
            (flag) => {
                expect.hasAssertions();

                const folder = fixture();
                const plain = run(
                    folder,
                    [
                        "a.md",
                        flag,
                        "--frail",
                    ],
                    false
                );
                const progress = run(folder, [
                    "a.md",
                    flag,
                    "--frail",
                ]);

                expect(progress.status).toBe(plain.status);
                expect(progress.stdout).toBe(plain.stdout);
                expect(progress.stderr).toContain(plain.stderr);
            }
        );

        it("preserves remark's file rewriting", () => {
            expect.hasAssertions();

            const folder = fixture();
            const markdown = "# Title\n\n* item\n";
            writeFileSync(path.join(folder, "a.md"), markdown);
            const plain = run(folder, ["a.md", "--output"], false);
            const expected = readFileSync(path.join(folder, "a.md"), "utf8");
            writeFileSync(path.join(folder, "a.md"), markdown);
            const progress = run(folder, ["a.md", "--output"]);

            expect(progress.status).toBe(plain.status);
            expect(readFileSync(path.join(folder, "a.md"), "utf8")).toBe(
                expected
            );
            expect(progress.stderr).toContain(plain.stderr);
        });

        it("does not observe ignored files", () => {
            expect.hasAssertions();

            const folder = fixture();
            writeFileSync(path.join(folder, ".remarkignore"), "a.md\n");
            const result = run(folder, [
                "*.md",
                "--ignore",
                "--silently-ignore",
                "--ignore-path",
                path.join(folder, ".remarkignore"),
                "--no-stdout",
            ]);

            expect(result.status).toBe(0);
            expect(result.stderr).not.toContain("linting a.md");
            expect(result.stderr).toContain("linting b.md");
            expect(result.stderr).toContain("Files observed: 1");
        });

        it.each([
            ["remark-gfm", "| a | b |\n| - | - |\n| 1 | 2 |\n"],
            ["remark-frontmatter", "---\ntitle: Test\n---\n\n# Title\n"],
            ["remark-directive", "::note[Example]\n"],
            ["remark-math", "$x^2$\n"],
            ["remark-mdx", "<Component value={1} />\n"],
        ])("preserves %s output", (syntax, markdown) => {
            expect.hasAssertions();

            const folder = fixture({}, syntax);
            const plain = run(folder, [], false, markdown);
            const progress = run(folder, [], true, markdown);

            expect(progress.status).toBe(0);
            expect(progress.stdout).toBe(plain.stdout);
            expect(progress.stderr).toContain(plain.stderr);
            expect(progress.stderr).toContain("Files observed: 1");
        });

        it("keeps syntax failures and invalid configuration free of invented events", () => {
            expect.hasAssertions();

            const malformed = fixture({}, "remark-mdx");
            const plain = run(malformed, [], false, "<Component value={\n");
            const progress = run(malformed, [], true, "<Component value={\n");

            expect(progress.status).toBe(1);
            expect(progress.stderr).toBe(plain.stderr);

            const invalid = run(fixture({ mode: "invalid" }));

            expect(invalid.status).toBe(1);
            expect(invalid.stderr).toContain(
                "remark-lint-file-progress: invalid option mode"
            );
            expect(invalid.stderr).not.toContain("RFP");
        });

        it.each([80, 160])(
            "preserves colored reporter content and %i terminal columns",
            (columns) => {
                expect.hasAssertions();

                const folder = fixture();
                const preload = path.join(folder, "terminal.mjs");
                writeFileSync(
                    preload,
                    `import assert from 'node:assert/strict';\nfor (const output of [process.stdout,process.stderr]) {Object.defineProperty(output,'isTTY',{value:true,configurable:true});Object.defineProperty(output,'columns',{value:${columns},configurable:true});const write=output.write;process.on('exit',()=>{assert.equal(output.write,write);assert.equal(output.columns,${columns});assert.equal(output.isTTY,true);});}\n`
                );
                const env = { FORCE_COLOR: "1" };
                const args = [
                    "a.md",
                    "--color",
                    "--frail",
                    "--no-stdout",
                ];
                const plain = run(folder, args, false, undefined, env, preload);
                const progress = run(
                    folder,
                    args,
                    true,
                    undefined,
                    env,
                    preload
                );

                expect(progress.status).toBe(1);
                expect(progress.status).toBe(plain.status);
                expect(plain.stderr).toContain("\u{1B}[");
                expect(progress.stderr).toContain(plain.stderr);
                expect(progress.stderr).toContain("\u{1B}[36m⠋\u{1B}[39m");
                expect(progress.stderr).toContain(
                    "\u{1B}[1m\u{1B}[32ma\u{1B}[39m\u{1B}[22m\u{1B}[32m.md\u{1B}[39m"
                );
                expect(progress.stderr).toContain("\u{1B}[33m1\u{1B}[39m");
                expect(
                    stripVTControlCharacters(progress.stderr).match(
                        /Files observed: 1/gv
                    )
                ).toHaveLength(1);
            }
        );
    });

    describe("process lifecycle", () => {
        it("keeps metadata and behavior independent across installed versions", () => {
            expect.hasAssertions();

            const folder = fixture();
            const alternate = path.join(folder, "alternate.cjs");
            const colors = path.join(folder, "node_modules", "picocolors");
            mkdirSync(colors, { recursive: true });
            copyFileSync(
                require.resolve("picocolors"),
                path.join(colors, "index.js")
            );
            const source = readFileSync(commonEntry, "utf8");
            const alternateVersion = `${meta.version}-fixture`;
            writeFileSync(
                alternate,
                source.replaceAll(JSON.stringify(meta.version), () =>
                    JSON.stringify(alternateVersion)
                )
            );
            const result = evaluate(
                `import assert from 'node:assert/strict';import { createRequire } from 'node:module';const require=createRequire(import.meta.url);const alternate=require(${JSON.stringify(alternate)});const current=require(${JSON.stringify(commonEntry)});assert.equal(alternate.meta.version,${JSON.stringify(alternateVersion)});assert.equal(current.meta.version,${JSON.stringify(meta.version)});assert.notEqual(alternate,current);`
            );

            expect(result.status).toBe(0);
            expect(result.stdout).toBe("");
            expect(result.stderr).toBe("");
        });

        it("keeps imports, disabled processors, and configuration quiet", () => {
            expect.hasAssertions();

            const result = evaluate(
                `import { remark } from ${JSON.stringify(remarkEntry)};\nconst before=process.listenerCount('exit');const {default:plugin}=await import(${JSON.stringify(entry)});remark().use(plugin).freeze();remark().use(plugin,false).processSync('# Title');console.log(JSON.stringify({before,after:process.listenerCount('exit')}));`
            );

            expect(result.status).toBe(0);

            const counts: { after: number; before: number } = JSON.parse(
                result.stdout
            );

            expect(counts.after).toBe(counts.before);
            expect(result.stderr).toBe("");
            expect(result.stderr).not.toContain("Files observed:");
        });

        it("shares ESM/CommonJS identity and counts repeated files until shutdown", () => {
            expect.hasAssertions();

            const result = evaluate(
                String.raw`import assert from 'node:assert/strict';import { createRequire } from 'node:module';import { remark } from ${JSON.stringify(remarkEntry)};import plugin from ${JSON.stringify(entry)};const common=createRequire(import.meta.url)(${JSON.stringify(commonEntry)});assert.equal(common,plugin);assert.equal(common.configs,plugin.configs);const processor=remark().use(plugin,{detailedSuccess:true}).use(common,{detailedSuccess:true});const file=await processor.process({path:'same.md',value:'# Title'});await processor.process(file);await new Promise(resolve=>setImmediate(resolve));process.stderr.write('PROCESS RETURNED\n');`
            );

            expect(result.status).toBe(0);
            expect(result.stderr.match(/linting same\.md/gv)).toHaveLength(2);
            expect(result.stderr.match(/Files observed: 2/gv)).toHaveLength(1);
            expect(result.stderr.indexOf("Lint complete.")).toBeGreaterThan(
                result.stderr.indexOf("PROCESS RETURNED")
            );
        });

        it.each(["stderr", "stdout"] as const)(
            "captures worker progress and final output on %s",
            async (stream) => {
                expect.hasAssertions();

                const worker = new Worker(
                    new URL("fixtures/progress-worker.mjs", import.meta.url),
                    {
                        env: environment(),
                        stderr: true,
                        stdout: true,
                        workerData: stream,
                    }
                );
                const [
                    exit,
                    stdout,
                    stderr,
                ] = await Promise.all([
                    once(worker, "exit"),
                    text(worker.stdout),
                    text(worker.stderr),
                ]);
                const result = { stderr, stdout };

                expect(exit[0]).toBe(0);
                expect(result[stream]).toContain("linting worker.md");
                expect(
                    result[stream].match(/Files observed: 1/gv)
                ).toHaveLength(1);
                expect(result[stream === "stderr" ? "stdout" : "stderr"]).toBe(
                    ""
                );
            }
        );

        it.each([
            "true",
            "false",
            "1",
        ])("resolves CI presets only for CI=%s", (ci) => {
            expect.hasAssertions();

            const result = evaluate(
                `import {configs} from ${JSON.stringify(entry)};console.log(JSON.stringify({ci:configs['recommended-ci'].plugins[0][1],detailed:configs['recommended-ci-detailed'].plugins[0][1]}));`,
                { CI: ci }
            );

            expect(result.status).toBe(0);
            expect(JSON.parse(result.stdout)).toStrictEqual({
                ci: { hide: ci === "true" },
                detailed: {
                    detailedSuccess: true,
                    hide: ci === "true",
                    showSummaryWhenHidden: ci === "true",
                },
            });
            expect(result.stderr).toBe("");
            expect(result.stderr).not.toContain("Files observed:");
        });
    });
});
