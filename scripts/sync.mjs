import { readFile, writeFile, mkdir } from "node:fs/promises";
import { configs, configNames, meta } from "../dist/plugin.js";
import { defaultSettings } from "../dist/_internal/options.js";
import { format, resolveConfig } from "prettier";
import { optionDemos } from "./demo-cases.mjs";

const badges =
    "[![Project type: Remark plugin.](https://flat.badgen.net/static/type/Remark%20plugin/A21CAF)](https://github.com/Nick2bad4u/remark-lint-file-progress) [![npm publication pending.](https://flat.badgen.net/static/npm/not%20published/0E7490)](https://github.com/Nick2bad4u/remark-lint-file-progress) [![Node.js 22 or later.](https://flat.badgen.net/static/node/%3E%3D22/4D7C0F)](https://nodejs.org/) [![TypeScript declarations.](https://flat.badgen.net/static/types/TypeScript/6D28D9)](https://nick2bad4u.github.io/remark-lint-file-progress/developer/api) [![Codecov coverage.](https://flat.badgen.net/codecov/github/Nick2bad4u/remark-lint-file-progress/main)](https://codecov.io/gh/Nick2bad4u/remark-lint-file-progress/branch/main) [![GitHub Actions checks on main.](https://flat.badgen.net/github/checks/Nick2bad4u/remark-lint-file-progress/main)](https://github.com/Nick2bad4u/remark-lint-file-progress/actions) [![MIT license.](https://flat.badgen.net/static/license/MIT/4338CA)](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/LICENSE)";

const write = process.argv.includes("--write");
async function sync(file, expected) {
    expected = await format(expected, {
        ...(await resolveConfig(file)),
        filepath: file,
    });
    const actual = await readFile(file, "utf8").catch(() => "");
    if (actual === expected) return;
    if (!write)
        throw new Error(`${file} is stale; run npm run sync:rules:write`);
    await writeFile(file, expected);
}
const manifest = JSON.parse(await readFile("package.json", "utf8"));
if (meta.version !== manifest.version)
    throw new Error("Package version and public metadata differ");
if (
    (await readFile(".node-version", "utf8")) !==
    (await readFile(".nvmrc", "utf8"))
)
    throw new Error("Node version files differ");
for (const name of configNames) {
    if (!manifest.exports[`./configs/${name}`] || !configs[name])
        throw new Error(`Missing preset export: ${name}`);
}
let rule = await readFile("docs/rules/activate.md", "utf8");
const table = [
    "| Option | Default |",
    "| --- | --- |",
    ...Object.entries(defaultSettings).map(
        ([key, value]) => `| \`${key}\` | \`${JSON.stringify(value)}\` |`
    ),
].join("\n");
if (!/<!-- options:start -->[\s\S]*?<!-- options:end -->/u.test(rule))
    throw new Error(
        "The rule documentation is missing its generated option markers"
    );
rule = rule.replace(
    /<!-- options:start -->[\s\S]*?<!-- options:end -->/u,
    `<!-- options:start -->\n\n${table}\n\n<!-- options:end -->`
);
await sync("docs/rules/activate.md", rule);
await sync("docs/docusaurus/site-docs/activate.md", rule);
await mkdir("docs/docusaurus/site-docs/presets", { recursive: true });
const descriptions = {
    recommended: "Show each file using the default display options.",
    "recommended-ci": "Hide all plugin output when CI is exactly true.",
    "recommended-ci-detailed":
        "Hide live output in CI while retaining the detailed process summary.",
    "recommended-compact":
        "Announce generic activity once, without showing filenames.",
    "recommended-detailed": "Show filenames and the detailed process summary.",
    "recommended-summary-only": "Show only the final process summary.",
    "recommended-tty":
        "Show output only when stderr is an interactive terminal.",
};
await sync(
    "docs/docusaurus/site-docs/presets.md",
    [
        "# Presets",
        "",
        "Every preset is a native unified preset. Import its subpath and add it to your remark plugins array, or pass it to processor.use().",
        "",
        "| Preset | Behavior |",
        "| --- | --- |",
        ...configNames.map(
            (name) =>
                `| [${name}](./presets/${name}.md) | ${descriptions[name]} |`
        ),
        "",
    ].join("\n")
);
for (const name of configNames)
    await sync(
        `docs/docusaurus/site-docs/presets/${name}.md`,
        `# ${name}\n\n${descriptions[name]}\n\n\x60\x60\x60js\nimport preset from "remark-lint-file-progress/configs/${name}";\n\nexport default preset;\n\x60\x60\x60\n\n![${name} colored terminal demonstration](../../static/demos/presets/${name}.gif)\n\n${name.includes("-ci") ? "This recording uses CI=true. Outside CI, the preset displays ordinary progress.\n\n" : ""}See [all options](../activate.md) and [compatibility](../compatibility.md) for summary and terminal behavior.\n`
    );
await mkdir("docs/docusaurus/site-docs/developer", { recursive: true });
await sync(
    "docs/docusaurus/site-docs/developer/contributing.md",
    await readFile("CONTRIBUTING.md", "utf8")
);
const readme = [
    "# remark-lint-file-progress",
    "",
    "Live filenames and configurable process summaries for remark.",
    "",
    badges,
    "",
    "![Colored per-file progress](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended.gif)",
    "",
    "![Detailed process summary](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended-detailed.gif)",
    "",
    "[Documentation](https://nick2bad4u.github.io/remark-lint-file-progress/) \u00b7 [All preset and option demos](https://nick2bad4u.github.io/remark-lint-file-progress/demos)",
    "",
    "## Installation before publication",
    "",
    "Version {{VERSION}} is prepared for review and has not been published to npm. Build a local artifact:",
    "",
    "```sh",
    "git clone https://github.com/Nick2bad4u/remark-lint-file-progress.git",
    "cd remark-lint-file-progress",
    "npm ci",
    "npm pack",
    "```",
    "",
    "In your consumer project, install remark-cli and the generated tarball using its actual path:",
    "",
    "```sh",
    "npm install --save-dev remark-cli /path/to/remark-lint-file-progress-{{VERSION}}.tgz",
    "```",
    "",
    "## Configuration",
    "",
    "Use a native preset in your remark configuration:",
    "",
    "```js",
    'import recommended from "remark-lint-file-progress/configs/recommended";',
    "",
    "export default recommended;",
    "```",
    "",
    "Or add the plugin alongside your existing shared config:",
    "",
    "```js",
    'import shared from "remark-config-nick2bad4u";',
    'import progress from "remark-lint-file-progress";',
    "",
    "export default {",
    "    plugins: [shared, [progress, { detailedSuccess: true }]],",
    "};",
    "```",
    "",
    "```sh",
    "npx remark README.md --frail --no-stdout",
    "```",
    "",
    "The callable plugin also works with `remark().use(progress, options)`. Pass `false` to disable it; omitted options, `true`, and `null` use the defaults.",
    "",
    "## Options and presets",
    "",
    "[All display options](docs/rules/activate.md) preserve the Stylelint/ESLint progress names and defaults.",
    "",
    ...configNames.map((name) => "- `" + name + "`: " + descriptions[name]),
    "",
    "## Compatibility",
    "",
    "Node.js 22+, unified 11, VFile 6, remark 15, remark-cli 12, and remark-lint 10. The plugin exports ESM and CommonJS with declarations; CommonJS consumers dynamically import the ESM-only remark host.",
    "",
    "Each transformer execution records one event, including repeat processing of one VFile. Progress goes to stderr by default, preserving Markdown and JSON tree output on stdout. Reporters normally share stderr with progress; hide progress when consuming that stream as machine-readable output.",
    "",
    "Summaries measure observed events over the process lifetime, without inferred problem counts or per-file completion times. Windows terminal output preserves Unicode and colors through Node's console-aware streams.",
    "",
    "See [contributing](CONTRIBUTING.md) for development and verification, and [NOTICE](NOTICE) for attribution.",
]
    .join("\n")
    .replaceAll("{{VERSION}}", manifest.version);
await sync("README.md", readme);

await sync(
    "docs/docusaurus/site-docs/demos.md",
    [
        "# Colored terminal demos",
        "",
        "These deterministic recordings use the plugin's actual display controller. File events arrive at fixed intervals to make behavior reproducible; the timings illustrate process-wide metrics and do not measure individual file completion. Spinner frames advance with file events, and each update leaves a complete line.",
        "",
        "Animated GIFs follow the presentation used by eslint-plugin-file-progress-2. For a still image, see the [static terminal poster](../static/img/terminal.svg). The casts preserve selectable terminal text and ANSI colors.",
        "",
        "## Presets",
        "",
        ...configNames.flatMap((name) => [
            `### ${name}`,
            "",
            descriptions[name],
            "",
            `![${name} terminal recording](../static/demos/presets/${name}.gif)`,
            "",
            `[Preset configuration](./presets/${name}.md) · [Terminal cast](../static/demos/casts/presets-${name}.cast)`,
            "",
        ]),
        "The two CI recordings use CI=true; recommended-tty uses an interactive stderr stream.",
        "",
        "## Options",
        "",
        "Pass these options in a native plugin tuple: `plugins: [[progress, options]]`.",
        "",
        ...optionDemos.flatMap((demo) => [
            `### ${demo.name}`,
            "",
            demo.description,
            "",
            "```json",
            JSON.stringify(demo.options, null, 4),
            "```",
            "",
            `![${demo.name} terminal recording](../static/demos/options/${demo.name}.gif)`,
            "",
            `[Terminal cast](../static/demos/casts/options-${demo.name}.cast)`,
            "",
        ]),
        "## Reproduce the recordings",
        "",
        "Install [agg 1.9.0](https://github.com/asciinema/agg/releases/tag/v1.9.0), then run `npm run build` and `npm run docs:demos:write`. The renderer uses the GitHub dark palette. Glyph appearance can vary with the system's monospace and fallback fonts.",
        "",
        "`npm run docs:demos:check` regenerates the expected terminal traces in memory and checks every committed cast, GIF integrity hash, gallery entry, and static poster without writing files or requiring agg. Regenerate the recordings whenever output behavior changes.",
        "",
    ].join("\n")
);
