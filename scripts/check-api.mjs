import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const coverage = JSON.parse(
    await readFile(
        "docs/docusaurus/site-docs/developer/api/coverage.json",
        "utf8"
    )
);
assert.ok(coverage.expected > 0, "TypeDoc must discover public API members");
assert.deepEqual(
    coverage.notDocumented,
    [],
    "Every public API member needs TSDoc"
);
assert.equal(
    coverage.actual,
    coverage.expected,
    "Public API documentation must be complete"
);
assert.equal(coverage.percent, 100);
console.log(
    `Public API documentation: ${coverage.actual}/${coverage.expected} members (100%).`
);
