import { access, readFile, readdir } from "node:fs/promises";
import { configNames } from "../dist/plugin.js";
import { optionDemos } from "./demo-cases.mjs";

const root = "docs/docusaurus/build/";
for (const route of [
    "index.html",
    "overview.html",
    "getting-started.html",
    "troubleshooting.html",
    "resources.html",
    "activate.html",
    "presets.html",
    "compatibility.html",
    "demos.html",
    "developer/api.html",
    "developer/quality-review.html",
    ...configNames.map((name) => `presets/${name}.html`),
    "eslint-inspector/index.html",
    "stylelint-inspector/index.html",
    "remark-inspector/index.html",
]) {
    await access(root + route);
}
const demos = await readFile(root + "demos.html", "utf8");
for (const { name, group } of [
    ...configNames.map((name) => ({ name, group: "presets" })),
    ...optionDemos.map(({ name }) => ({ name, group: "options" })),
]) {
    // Markdown image imports receive hashed URLs from webpack.
    if (!demos.includes(`alt="${name} terminal recording"`))
        throw new Error(`Demo page is missing ${name}`);
    await access(root + `demos/${group}/${name}.gif`);
}
const homepage = await readFile(root + "index.html", "utf8");
for (const name of configNames) {
    if (!homepage.includes(`href="/remark-lint-file-progress/presets/${name}"`))
        throw new Error(`Homepage is missing preset link: ${name}`);
}
if (!(await readdir(root)).some((file) => /^search-index.*\.json$/u.test(file)))
    throw new Error("The local search index was not generated");
for (const icon of [
    "favicon.svg",
    "logo-square.svg",
    "favicon.png",
])
    await access(root + "remark-inspector/remark/" + icon);
for (const kind of [
    "eslint",
    "stylelint",
    "remark",
]) {
    const assets = root + kind + "-inspector/_nuxt/";
    for (const route of [
        "configs",
        "files",
        "rules",
    ])
        await access(root + kind + "-inspector/" + route + ".html");
    for (const file of await readdir(assets)) {
        if (!file.endsWith(".js")) continue;
        const source = await readFile(assets + file, "utf8");
        if (/href:[`"']\/(?:favicon\.svg|remark\/|stylelint\/)/u.test(source))
            throw new Error(
                `Inspector icon URL ignores the Pages base: ${kind}/${file}`
            );
        for (const match of source.matchAll(/\bpath:(["'`])\/([a-z-]+)\1/gu))
            await access(root + kind + "-inspector/" + match[2] + ".html");
    }
}
const inspector = root + "stylelint-inspector/";
for (const icon of [
    "favicon.svg",
    "stylelint/stylelint-icon-black.svg",
    "stylelint/stylelint-icon-white-512.png",
])
    await access(inspector + icon);
if (
    !homepage.includes("Remark File Progress") ||
    homepage.includes("stylelint-plugin-font")
)
    throw new Error("Documentation identity mismatch");
console.log(
    "Verified documentation routes, inspector entrypoints, and package identity."
);
