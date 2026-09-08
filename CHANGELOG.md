<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->

# 📜 Changelog

## ✨ What's Changed in v1.0.0

- <b>Commit Range: ➡️</b> [`74b9ddd...v1.0.0`](https://github.com/Nick2bad4u/remark-lint-file-progress/compare/74b9dddc2f1a12479afb4aeb4b97d59539fd4941...v1.0.0 "View full commit range on GitHub")

### ✨ Features

- [`17b1fbd`](https://github.com/Nick2bad4u/remark-lint-file-progress/commit/17b1fbd2547cb7861ce54fc15d2d62fc38061caf "Diff: 164 files, +50766 | -3") — ✨ [feat] Add native remark file progress and plugin infrastructure (#1)&nbsp;<sub><em>(164&nbsp;files,&nbsp;+50766,&nbsp;-3)</em></sub>
  - ✨ [feat] Add native remark file progress with the established plugin tooling
  - ✨ [feat] Observe unified transformer executions with all progress options and seven presets
- Preserve Markdown, trees, diagnostics, streams, terminal state, and exit status
- Share the callable ESM/CommonJS identity and keep process reporting lazy
  🧪 [test] Verify real remark CLI behavior, packed consumers, and Node 22 compatibility
- Cover worker capture, quiet imports, repeated registrations, colors, and CP437 terminals
- Require 90% runtime coverage and complete public API documentation
  📝 [docs] Add Docusaurus, 31 colored demos, API references, and three config inspectors
  👷 [build] Adapt shared configurations, strict npm lifecycle policy, and GitHub quality workflows
- Prepare trusted publishing of a verified tarball without dispatching a release
  - 🐛 [fix] Repair inspector assets and portable CLI test fixtures
  - Use canonical temporary paths on macOS, replace generated worker code with a static fixture, and verify check commands preserve tracked files. Supply the missing remark inspector favicon alias while keeping upstream assets intact.
  - 🐛 [fix] Isolate package versions and snapshot validated progress options
  - Add regression coverage for accessor-backed settings and independently loaded package versions. Preserve the Windows console writer after source and CP437 verification, complete remark-specific support docs, and repair inspector startup icon base paths. Retain packed-artifact contents and integrity in compatibility evidence.

### 🛠️ Bug Fixes

- [`6399cb2`](https://github.com/Nick2bad4u/remark-lint-file-progress/commit/6399cb2f73f10a15cdae8e339390ea3f3fe2b315 "Diff: 75 files, +896 | -332") — 🐛 [fix] Match progress presentation to the ESLint plugin&nbsp;<sub><em>(75&nbsp;files,&nbsp;+896,&nbsp;-332)</em></sub>
  - 🐛 [fix] Cycle bold directory colors, dim separators and activity labels, and distinguish filename stems from extensions. Align spinner, prefix, status, and metric colors and display subsecond durations in milliseconds.
  - 🧪 [test] Add ANSI contracts for native and cross-platform paths, preserved separators, control escaping, and summaries. Extend real remark reporter comparisons at 80 and 160 columns; all 101 tests pass with 100% statement, line, and function coverage and 95.65% branches.
  - 📝 [docs] Regenerate all 31 demonstrations and refresh static and social previews. Preserve bold and dim ANSI styles in SVG, document presentation behavior, record the ESLint reference, and provide npm installation instructions.
  - 🧹 [chore] Prepare the requested 1.0.0 package and metadata version while retaining Vitest 4 and the existing native remark API and lifecycle guarantees.

- [`7bd275b`](https://github.com/Nick2bad4u/remark-lint-file-progress/commit/7bd275bfe88a4f80870f95770b18b9f099821241 "Diff: 6 files, +44 | -11") — 🐛 [fix] Serve inspector routes directly on GitHub Pages (#2)&nbsp;<sub><em>(6&nbsp;files,&nbsp;+44,&nbsp;-11)</em></sub>
  - 🐛 [fix] Serve inspector routes directly on GitHub Pages
  - 🐛 [fix] Generate HTML entrypoints for static routes declared by all three inspector bundles so direct links and refreshes can load the application.
    🧪 [test] Require every declared route in the documentation output and retain startup icon checks.
    📝 [docs] Explain the Pages routing compatibility step and record the public-site finding in the quality review.
  - 📝 [docs] Synchronize inspector hosting contributor guidance

### 🧹 Chores

- [`74b9ddd`](https://github.com/Nick2bad4u/remark-lint-file-progress/commit/74b9dddc2f1a12479afb4aeb4b97d59539fd4941 "Diff: 2 files, +26 | -0") — 🧹 [chore] Bootstrap Remark File Progress&nbsp;<sub><em>(2&nbsp;files,&nbsp;+26,&nbsp;-0)</em></sub>

### New Contributors

- @Nick2bad4u made their first contribution in [#2](https://github.com/Nick2bad4u/remark-lint-file-progress/pull/2)

## ⭐ Contributors

Thanks to anyone who has 🧑‍💻 [contributed](https://github.com/Nick2bad4u/remark-lint-file-progress/graphs/contributors).

_This changelog was automatically generated with ⛰️ [git-cliff](https://github.com/orhun/git-cliff)._
