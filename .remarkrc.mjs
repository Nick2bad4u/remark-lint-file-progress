import { createConfig } from "remark-config-nick2bad4u";

import progress from "./dist/plugin.js";

/** @type {import("remark-config-nick2bad4u").RemarkConfig} */
const remarkConfig = createConfig({
    docHeadings: false,
    plugins: [progress],
    settings: {},
});

export default remarkConfig;
