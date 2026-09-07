import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run npm run release:check-tarball");
const files = (await readdir("release", { withFileTypes: true })).filter(
    (file) => file.isFile() && file.name.endsWith(".tgz")
);
if (files.length !== 1)
    throw new Error("Expected one verified package tarball");
const result = spawnSync(
    process.execPath,
    [
        npmCli,
        "publish",
        `./release/${files[0].name}`,
        "--dry-run",
        "--access=public",
        "--provenance=false",
        "--ignore-scripts",
    ],
    {
        // npm run can export the machine's global lifecycle policy.
        env: Object.fromEntries(
            Object.entries(process.env).filter(
                ([name]) => name.toLowerCase() !== "npm_config_allow_scripts"
            )
        ),
        stdio: "inherit",
        timeout: 120000,
    }
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
