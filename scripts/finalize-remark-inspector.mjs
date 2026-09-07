import { constants } from "node:fs";
import { copyFile } from "node:fs/promises";

// remark-config-inspector 2.2.7 references this missing favicon alias at startup.
// Reuse its bundled SVG; preserve the upstream asset when a later version supplies it.
const icons = "docs/docusaurus/static/remark-inspector/remark/";
try {
    await copyFile(
        `${icons}favicon.svg`,
        `${icons}logo-square.svg`,
        constants.COPYFILE_EXCL
    );
} catch (error) {
    if (error.code !== "EEXIST") throw error;
}
