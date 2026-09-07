import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.resolve(root, "dist");
if (path.dirname(dist) !== path.resolve(root))
    throw new Error("Invalid build output path");
await rm(dist, { recursive: true, force: true });
execFileSync(
    process.execPath,
    [
        path.join(root, "node_modules/typescript/bin/tsc"),
        "-p",
        "tsconfig.build.json",
    ],
    { cwd: root, stdio: "inherit" }
);
await build({
    entryPoints: ["src/plugin.ts"],
    outfile: "dist/plugin.cjs",
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node22",
    external: ["picocolors"],
    footer: {
        js: "module.exports = Object.assign(module.exports.default, module.exports);",
    },
});
await writeFile(
    path.join(dist, "plugin.d.cts"),
    'import type plugin from "./plugin.js";\nimport type * as api from "./plugin.js";\ndeclare const entry: typeof plugin & typeof api;\ndeclare namespace entry {\n    export type FileProgressConfig = api.FileProgressConfig;\n    export type FileProgressConfigName = api.FileProgressConfigName;\n    export type FileProgressMetadata = api.FileProgressMetadata;\n    export type FileProgressPlugin = api.FileProgressPlugin;\n    export type OutputStream = api.OutputStream;\n    export type ProgressMode = api.ProgressMode;\n    export type ProgressPathFormat = api.ProgressPathFormat;\n    export type ProgressPluginOptions = api.ProgressPluginOptions;\n    export type ProgressRuleOptions = api.ProgressRuleOptions;\n    export type ProgressSettings = api.ProgressSettings;\n    export type SpinnerStyle = api.SpinnerStyle;\n}\nexport = entry;\n'
);
const manifest = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8")
);
await mkdir(path.join(dist, "configs"), { recursive: true });
for (const subpath of Object.keys(manifest.exports).filter((key) =>
    key.startsWith("./configs/")
)) {
    const name = subpath.slice("./configs/".length);
    await writeFile(
        path.join(dist, "configs", `${name}.js`),
        `import { configs } from "../plugin.js";\nexport default configs[${JSON.stringify(name)}];\n`
    );
    await writeFile(
        path.join(dist, "configs", `${name}.cjs`),
        `module.exports = require("../plugin.cjs").configs[${JSON.stringify(name)}];\n`
    );
    await writeFile(
        path.join(dist, "configs", `${name}.d.ts`),
        'import type { FileProgressConfig } from "../plugin.js";\ndeclare const config: FileProgressConfig;\nexport default config;\n'
    );
    await writeFile(
        path.join(dist, "configs", `${name}.d.cts`),
        'import type { FileProgressConfig } from "../plugin.js";\ndeclare const config: FileProgressConfig;\nexport = config;\n'
    );
}
