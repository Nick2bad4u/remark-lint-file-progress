# Working on Remark File Progress

This repository contains a native unified/remark progress plugin. Source lives in `src`, tests in `test`, and the Docusaurus workspace in `docs/docusaurus`.

- Use npm 12.0.2 and the Node version in `.node-version`. Install with `npm ci`; keep the dependency-specific lifecycle allowlist portable.
- Follow the published `nick2bad4u` shared configurations. Make narrow, explained overrides only when a rule conflicts with a demonstrated platform contract.
- Use strict TypeScript and ESM source. `npm run build` produces the ESM/CommonJS package and declarations; do not hand-edit `dist`.
- Preserve the callable plugin, metadata, seven configuration subpaths, and public option types. Validate with real unified/remark processing and packed consumers.
- Progress is observational: never modify Markdown, trees, messages, reporter output, terminal settings, or exit status. Never patch process streams or infer problem totals. Count each transformer execution, including repeated VFiles.
- Both module formats must expose the same plugin function so unified merges duplicate registrations. Copy validated settings at attachment; create the controller and shutdown hook only when a file is observed.
- Imports remain quiet. Summaries are process-scoped, with independent worker state. Do not leave timers or overwrite reporter output.
- Use `npm run sync:rules:write` and `npm run docs:demos:write` for generated content. Check counterparts must not rewrite tracked files.
- Run `npm run release:verify` before release preparation. Do not weaken lint or coverage gates to make checks pass.
- Branch names use `type/description`; commits follow `.github/agent-commit-message-instructions.md`. Use subagents for independent substantial work when available.
- Keep owned reusable workflows at `@main`; pin third-party actions to verified full SHAs with version comments. Publication requires explicit user authorization.
