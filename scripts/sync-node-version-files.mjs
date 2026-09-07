import { readFile, writeFile } from "node:fs/promises";

const version = (
    await readFile(new URL("../.node-version", import.meta.url), "utf8")
).trim();
if (!/^\d+\.\d+\.\d+$/u.test(version))
    throw new Error("Invalid pinned Node version");
await writeFile(new URL("../.nvmrc", import.meta.url), `${version}\n`);
console.log(`Synchronized .nvmrc with Node ${version}.`);
