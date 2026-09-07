import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const version =
    process.env.RELEASE_VERSION ||
    process.env.GITHUB_REF_NAME?.replace(/^v/u, "");
if (
    !version ||
    !/^\d+\.\d+\.\d+$/u.test(version) ||
    version !== manifest.version
)
    throw new Error("Release version must match the committed package version");
if (
    process.env.GITHUB_EVENT_NAME === "workflow_dispatch" &&
    process.env.GITHUB_REF !== "refs/heads/main"
)
    throw new Error("Manual releases must run on main");
execFileSync(
    "git",
    [
        "merge-base",
        "--is-ancestor",
        "HEAD",
        "origin/main",
    ],
    {
        stdio: "inherit",
    }
);
const tagRef = `refs/tags/v${version}`;
const remoteTags = execFileSync(
    "git",
    [
        "ls-remote",
        "--tags",
        "origin",
        tagRef,
        `${tagRef}^{}`,
    ],
    { encoding: "utf8" }
).trim();
if (remoteTags) {
    const entries = remoteTags
        .split("\n")
        .map((line) => line.trim().split(/\s+/u));
    const tagCommit = (entries.find((entry) => entry[1] === `${tagRef}^{}`) ??
        entries[0])?.[0];
    const selectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
    }).trim();
    if (tagCommit !== selectedCommit)
        throw new Error(
            `Publication blocked: v${version} points at a different commit`
        );
}
const response = await fetch(
    `https://registry.npmjs.org/${manifest.name}/${version}`,
    { signal: AbortSignal.timeout(30000) }
);
if (response.status !== 404)
    throw new Error(
        `Publication blocked: registry returned ${response.status}; only a confirmed absent version may publish`
    );
console.log(`Verified unpublished ${manifest.name}@${version}`);
