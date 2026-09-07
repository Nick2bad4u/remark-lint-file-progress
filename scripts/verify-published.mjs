import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";

const manifest = JSON.parse(await readFile("package.json", "utf8"));
const files = (await readdir("release")).filter((file) =>
    file.endsWith(".tgz")
);
assert.equal(files.length, 1, "Expected the single verified package artifact");
const integrity = `sha512-${createHash("sha512")
    .update(await readFile(`release/${files[0]}`))
    .digest("base64")}`;
const response = await fetch(
    `https://registry.npmjs.org/${manifest.name}/${manifest.version}`,
    { signal: AbortSignal.timeout(30000) }
);
assert.ok(response.ok, `Published package lookup failed: ${response.status}`);
const published = await response.json();
assert.equal(
    published.dist.integrity,
    integrity,
    "npm must serve the exact CI-verified tarball"
);
assert.ok(
    published.dist.attestations?.provenance,
    "npm provenance attestation must be present"
);
console.log(
    `Verified npm artifact integrity and provenance for ${manifest.name}@${manifest.version}.`
);
