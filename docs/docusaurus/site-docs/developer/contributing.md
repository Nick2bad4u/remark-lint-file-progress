# Contributing

Use the Node version in `.node-version` and npm 12.0.2. Install dependencies with `npm ci`; the committed lifecycle allowlist is authoritative.

## Development

Run `npm run build`, `npm run typecheck`, and `npm test` while changing the runtime. Source is strict TypeScript; generated ESM, CommonJS, declarations, and preset modules live in `dist`.

Run `npm run lint:all` for shared-config checks. Use `npm run lint:fix` and `npm run lint:prettier:fix` only when intentionally rewriting files. Native actionlint is required for workflow checks; Gitleaks and Lychee support the additional security and link commands.

Run `npm run sync:rules:write` and `npm run docs:demos:write` when changing options or presets. These commands build current source first; GIF regeneration requires [agg 1.9.0](https://github.com/asciinema/agg/releases/tag/v1.9.0). Their check counterparts compare output without modifying tracked files. Run `npm run docs:build` to compile the Docusaurus site and all three config inspectors. Every public API reflection must have TSDoc; the documentation build enforces 100% coverage.

## Validation

`npm run release:verify` runs the full local gate, including packed consumers on the minimum and current unified/remark boundaries. It does not publish. CI also exercises Linux, Windows, and macOS; minimum Node consumers are tested separately from the development install.

Use a `type/description` branch and the emoji/bracket commit convention in `.github/agent-commit-message-instructions.md`. Changes should include evidence that Markdown, trees, diagnostics, and exit codes remain unchanged.

On Windows, reproduce the console regression in a real PowerShell terminal with the code below. It tests the packed artifact on Node 22.0.0 with both host-version profiles, both output streams, Unicode filenames, ANSI colors, and shutdown summaries. The probe checks that reporter write methods and terminal columns stay unchanged. Inspect the output for intact `élève-東京.md`, spinner frames, and colored marks; the original code page is restored afterward.

```powershell
$progressEncoding = [Console]::OutputEncoding
try {
    [Console]::OutputEncoding = [Text.Encoding]::GetEncoding(437)
    npm run test:compat:windows-console
} finally {
    [Console]::OutputEncoding = $progressEncoding
}
```

## Release preparation

Keep the package version and exported metadata synchronized. Generate changelog history using the shared git-cliff configuration. The release workflow accepts an already committed version and protects against duplicate npm publication. Publication is a separately authorized operation. Configure npm trusted publishing for this repository, workflow `release.yml`, and environment `npm` when binding an environment. Dispatch the committed version from `main`; do not pass a token or disable provenance. If npm publication succeeds but the final GitHub Release job fails, rerun only failed jobs so artifact verification and release creation resume without repeating publication.

## Dependency overrides

The docs toolchain currently pins vulnerable transitive ranges. Overrides select patched `serialize-javascript` and `qs`, and the CommonJS-compatible `uuid` 11 line used by SockJS only for `v4()`. Recheck these overrides when Docusaurus updates its dependencies. Docusaurus alone receives `image-size-next@2.1.1` as an exact npm alias for `image-size`. The [reviewed fork delta](https://github.com/lcf2212dev/image-size-next/compare/v2.0.2...v2.1.1) adds bounds and forward-progress checks for CVE-2025-71329 and CVE-2025-71330. It preserves the `imageSizeFromFile` API and MIT license, adds no runtime dependencies or install hooks, and is locked by tarball integrity. `npm run test:docs-images` exercises the actual Docusaurus-resolved parser against malformed ICNS/JXL/HEIF inputs in timeout-protected subprocesses and checks SVG/GIF/PNG dimensions. This override affects documentation builds only; remove it when Docusaurus adopts a maintained, patched parser.
