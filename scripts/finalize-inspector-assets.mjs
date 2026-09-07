import { constants } from "node:fs";
import { copyFile, readFile, readdir, writeFile } from "node:fs/promises";

const kind = process.argv[2];
if (kind !== "eslint" && kind !== "remark")
    throw new Error("Select the eslint or remark inspector output");
const root = `docs/docusaurus/static/${kind}-inspector/`;
const base = `/remark-lint-file-progress/${kind}-inspector/`;

// These published bundles reapply root-relative icon URLs after hydration.
// Restrict the compatibility rewrite to their known, local icon hrefs.
for (const file of await readdir(root + "_nuxt/")) {
    if (!file.endsWith(".js")) continue;
    const target = root + "_nuxt/" + file;
    const original = await readFile(target, "utf8");
    const updated = original.replace(
        /(href:)(["'`])\/(favicon\.svg|remark\/[a-zA-Z0-9._-]+)\2/gu,
        (_match, prefix, quote, asset) =>
            `${prefix}${quote}${base}${asset}${quote}`
    );
    if (updated !== original) await writeFile(target, updated);
}

// remark-config-inspector 2.2.7 also references a missing favicon alias.
// Keep an upstream-supplied icon intact when the dependency adds it.
if (kind === "remark") {
    try {
        await copyFile(
            root + "remark/favicon.svg",
            root + "remark/logo-square.svg",
            constants.COPYFILE_EXCL
        );
    } catch (error) {
        if (error.code !== "EEXIST") throw error;
    }
}
