import { readFile, writeFile, mkdir } from "node:fs/promises";
import { configs, configNames, meta } from "../dist/plugin.js";
import { defaultSettings } from "../dist/_internal/options.js";
import { format, resolveConfig } from "prettier";
import { optionDemos } from "./demo-cases.mjs";
import { badges, presetDetails } from "./docs-catalog.mjs";

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
if (Object.keys(presetDetails).length !== configNames.length)
    throw new Error(
        "The documentation preset catalog must match the public exports"
    );
for (const name of configNames) {
    if (
        !manifest.exports[`./configs/${name}`] ||
        !configs[name] ||
        !presetDetails[name]
    )
        throw new Error(`Missing preset export or documentation: ${name}`);
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

const presets = configNames.map((name) => {
    const { audience, description, icon, label, tone } = presetDetails[name];
    return { audience, description, icon, label, name, tone };
});
const presetTable = (base, suffix = "") =>
    [
        "| Preset | Best for | Behavior |",
        "| --- | --- | --- |",
        ...presets.map(
            ({ name, icon, audience, description }) =>
                `| [${icon} ${name}](${base}${name}${suffix}) | ${audience} | ${description} |`
        ),
    ].join("\n");

await mkdir("docs/docusaurus/src/data", { recursive: true });
await sync(
    "docs/docusaurus/src/data/project.json",
    JSON.stringify({
        badges,
        demoCount: configNames.length + optionDemos.length,
        optionCount: Object.keys(defaultSettings).length,
        presets,
    })
);

await mkdir("docs/docusaurus/site-docs/presets", { recursive: true });
await sync(
    "docs/docusaurus/site-docs/presets.md",
    [
        "---",
        "sidebar_label: Presets",
        "description: Compare seven Remark progress presets for local terminals, CI, compact activity, and process summaries.",
        "---",
        "",
        "# Choose your progress preset",
        "",
        "Every preset is a native unified preset. Export it from your remark config or combine it with existing presets in the `plugins` array.",
        "",
        "## Choose by workflow",
        "",
        presetTable("./presets/", ".md"),
        "",
        "## Use a preset",
        "",
        "```js",
        'import recommended from "remark-lint-file-progress/configs/recommended";',
        "",
        "export default recommended;",
        "```",
        "",
        "Compose existing presets with `plugins: [existingPreset, recommended]`. Each progress preset registers the same callable plugin and adds no lint diagnostics.",
        "",
        "## Customize or disable",
        "",
        "Add `[progress, options]` to your plugins array after the preset to customize the display, or `[progress, false]` to disable it. Unified merges repeated registrations. See [getting started](./getting-started.md#customize-the-display) and [all options](./activate.md#options).",
        "",
        "## CI and terminal behavior",
        "",
        "The two CI presets activate their CI behavior only when `CI` is exactly `true`. Outside CI, both display ordinary progress. The TTY preset checks stderr, the default output stream. Summary counts and timing cover the process lifetime; read [compatibility and metrics](./compatibility.md) before interpreting them.",
        "",
        "Watch [all preset recordings](./demos.md#presets), explore [option demonstrations](./demos.md#options), or use [troubleshooting](./troubleshooting.md) if your output differs.",
        "",
    ].join("\n")
);

for (const { name, label, tone, description } of presets) {
    await sync(
        `docs/docusaurus/site-docs/presets/${name}.md`,
        [
            "---",
            `sidebar_label: ${name}`,
            `description: ${description}`,
            "---",
            "",
            `# ${name}`,
            "",
            `<span className="rfp-pill rfp-tone-${tone}">${label}</span>`,
            "",
            description,
            "",
            "## Configuration",
            "",
            "```js",
            `import preset from "remark-lint-file-progress/configs/${name}";`,
            "",
            "export default preset;",
            "```",
            "",
            "Keep your existing shared configs before this preset.",
            "",
            "## Terminal preview",
            "",
            `![${name} colored terminal demonstration](../../static/demos/presets/${name}.gif)`,
            "",
            ...(name.includes("-ci")
                ? [
                      "This recording uses CI=true. Outside CI, the preset displays ordinary progress.",
                      "",
                  ]
                : []),
            "## Make it yours",
            "",
            `See [all options](../activate.md), [compare presets](../presets.md), and [compatibility](../compatibility.md) for summary and terminal behavior. Explore the [demo gallery](../demos.md#${name}) or follow the [setup guide](../getting-started.md).`,
            "",
        ].join("\n")
    );
}

await mkdir("docs/docusaurus/site-docs/developer", { recursive: true });
await sync(
    "docs/docusaurus/site-docs/developer/contributing.md",
    await readFile("CONTRIBUTING.md", "utf8")
);

let readme = await readFile("README.md", "utf8");
const readmeSections = {
    badges: badges
        .map(({ alt, href, src }) => `[![${alt}.](${src})](${href})`)
        .join(" "),
    presets: presetTable(
        "https://nick2bad4u.github.io/remark-lint-file-progress/presets/"
    ),
};
for (const [section, content] of Object.entries(readmeSections)) {
    const startMarker = `<!-- ${section}:start -->`;
    const endMarker = `<!-- ${section}:end -->`;
    const start = readme.indexOf(startMarker);
    const end = readme.indexOf(endMarker);
    if (start < 0 || end < start)
        throw new Error(`README is missing generated ${section} markers`);
    readme =
        readme.slice(0, start + startMarker.length) +
        `\n\n${content}\n\n` +
        readme.slice(end);
}
await sync("README.md", readme);

await sync(
    "docs/docusaurus/site-docs/demos.md",
    [
        "---",
        "sidebar_label: Terminal demos",
        "description: Watch every preset and display option using reproducible recordings from the actual Remark progress controller.",
        "---",
        "",
        "# Colored terminal demos",
        "",
        "These deterministic recordings use the plugin's actual display controller. File events arrive at fixed intervals to make behavior reproducible; the timings illustrate process-wide metrics and do not measure individual file completion. Spinner frames advance with file events, replacing the previous progress block in an interactive terminal. Redirected output uses complete lines.",
        "",
        "Animated GIFs follow the presentation used by eslint-plugin-file-progress-2. For a still image, see the [static terminal poster](../static/img/terminal.svg). The casts preserve selectable terminal text and ANSI colors.",
        "",
        "Jump to [presets](#presets), [options](#options), or [recording instructions](#reproduce-the-recordings). Choose a [preset](./presets.md) or review the [option defaults](./activate.md#options) while comparing output.",
        "",
        "## Presets",
        "",
        ...presets.flatMap(({ name, description }) => [
            `### ${name}`,
            "",
            description,
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
