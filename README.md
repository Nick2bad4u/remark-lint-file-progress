# remark-lint-file-progress

<p align="center">
  <img src="https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/img/logo.svg" alt="Remark File Progress terminal logo" width="112" height="112" />
</p>

<p align="center"><strong>See the Markdown file behind the wait.</strong><br />Live filenames and configurable process summaries for remark.</p>

<!-- badges:start -->

[![Latest npm version.](https://flat.badgen.net/npm/v/remark-lint-file-progress?color=0E7490)](https://www.npmjs.com/package/remark-lint-file-progress) [![Native unified plugin.](https://flat.badgen.net/static/plugin/unified/BE185D)](https://unifiedjs.com/learn/guide/using-plugins/) [![Supported Node.js versions.](https://flat.badgen.net/npm/node/remark-lint-file-progress?color=4D7C0F)](https://www.npmjs.com/package/remark-lint-file-progress) [![Bundled TypeScript declarations.](https://flat.badgen.net/npm/types/remark-lint-file-progress?color=6D28D9)](https://www.npmjs.com/package/remark-lint-file-progress) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/remark-lint-file-progress?color=0F766E)](https://github.com/Nick2bad4u/remark-lint-file-progress/releases) [![Codecov coverage.](https://flat.badgen.net/codecov/github/Nick2bad4u/remark-lint-file-progress)](https://codecov.io/gh/Nick2bad4u/remark-lint-file-progress) [![GitHub Actions checks on main.](https://flat.badgen.net/github/checks/Nick2bad4u/remark-lint-file-progress/main)](https://github.com/Nick2bad4u/remark-lint-file-progress/actions) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/remark-lint-file-progress?color=B45309)](https://github.com/Nick2bad4u/remark-lint-file-progress/stargazers) [![MIT license.](https://flat.badgen.net/npm/license/remark-lint-file-progress?color=4338CA)](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/LICENSE)

<!-- badges:end -->

<p align="center">
  <a href="https://nick2bad4u.github.io/remark-lint-file-progress/">Documentation</a> ·
  <a href="https://nick2bad4u.github.io/remark-lint-file-progress/getting-started">Getting started</a> ·
  <a href="https://nick2bad4u.github.io/remark-lint-file-progress/presets">Presets</a> ·
  <a href="https://nick2bad4u.github.io/remark-lint-file-progress/demos">Terminal demos</a> ·
  <a href="https://nick2bad4u.github.io/remark-lint-file-progress/activate">Plugin & options</a>
</p>

## A little clarity for every lint run

- **Native Remark integration.** One synchronous transformer that leaves Markdown, trees, messages, and exit status intact.
- **Output that fits your workflow.** File, compact, and summary modes, with presets for CI and interactive terminals.
- **Useful process summaries.** Observed file counts, elapsed time, throughput, and exit-code appearance.
- **Your terminal, your preferences.** Progress updates in place, with colored paths, spinner frames, marks, messages, streams, and display thresholds.
- **Typed and portable.** ESM and CommonJS exports, TypeScript declarations, and seven configuration subpaths.

![Colored per-file progress](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended.gif)

<details>
<summary>Watch the detailed process summary</summary>

![Detailed process summary](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended-detailed.gif)

</details>

[Explore every preset and option demo](https://nick2bad4u.github.io/remark-lint-file-progress/demos). These reproducible recordings use the actual display controller; their timings illustrate process metrics.

## Installation

Install the plugin and remark CLI in your project:

```sh
npm install --save-dev remark-cli remark-lint-file-progress
```

To test a local checkout before a release, build a tarball:

```sh
git clone https://github.com/Nick2bad4u/remark-lint-file-progress.git
cd remark-lint-file-progress
npm ci
npm pack
```

In your consumer project, install remark-cli and the generated tarball using its actual path:

```sh
npm install --save-dev remark-cli /path/to/remark-lint-file-progress-1.0.1.tgz
```

## Configuration

Use a native preset in your remark configuration:

```js
import recommended from "remark-lint-file-progress/configs/recommended";

export default recommended;
```

Or customize progress alongside your existing shared config (version 2.0.0 already includes it; unified merges the repeated registration):

```js
import shared from "remark-config-nick2bad4u";
import progress from "remark-lint-file-progress";

export default {
 plugins: [shared, [progress, { detailedSuccess: true }]],
};
```

```sh
npx remark README.md --frail --no-stdout
```

The callable plugin also works with `remark().use(progress, options)`. Pass `false` to disable it; omitted options, `true`, and `null` use the defaults.

## Options and presets

[All display options](docs/rules/activate.md) preserve the Stylelint/ESLint progress names and defaults.

<!-- presets:start -->

| Preset                                                                                                                 | Best for                    | Behavior                                                                      |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| [🟢 recommended](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended)                           | Follow each Markdown file   | Show each file using the default display options.                             |
| [🔵 recommended-ci](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-ci)                     | Keep CI logs quiet          | Hide all plugin output when CI is exactly true.                               |
| [🟣 recommended-ci-detailed](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-ci-detailed)   | Keep a summary in CI        | Hide live output in CI while retaining the detailed process summary.          |
| [🟡 recommended-compact](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-compact)           | Show activity without paths | Show generic activity without filenames; redirected output announces it once. |
| [🟠 recommended-detailed](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-detailed)         | See process-wide metrics    | Show filenames and the detailed process summary.                              |
| [🩷 recommended-summary-only](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-summary-only) | Read the final summary      | Show only the final process summary.                                          |
| [🟦 recommended-tty](https://nick2bad4u.github.io/remark-lint-file-progress/presets/recommended-tty)                   | Respect redirected output   | Show output only when stderr is an interactive terminal.                      |

<!-- presets:end -->

## Compatibility

Node.js 22+, unified 11, VFile 6, remark 15, remark-cli 12, and remark-lint 10. The plugin exports ESM and CommonJS with declarations; CommonJS consumers dynamically import the ESM-only remark host.

Each transformer execution records one event, including repeat processing of one VFile. Progress goes to stderr by default, preserving Markdown and JSON tree output on stdout. Reporters normally share stderr with progress; hide progress when consuming that stream as machine-readable output.

Summaries measure observed events over the process lifetime, without inferred problem counts or per-file completion times. Windows terminal output preserves Unicode and colors through Node's console-aware streams.

Interactive terminals reuse the previous progress block when stream activity and terminal geometry allow it. Redirected output uses complete lines. Embedders using raw descriptor writes should use summary-only mode or disable progress. Read [compatibility](https://nick2bad4u.github.io/remark-lint-file-progress/compatibility) and [troubleshooting](https://nick2bad4u.github.io/remark-lint-file-progress/troubleshooting) for the precise output boundaries.

## Explore the project

- [Setup guide](https://nick2bad4u.github.io/remark-lint-file-progress/getting-started) and [API reference](https://nick2bad4u.github.io/remark-lint-file-progress/developer/api).
- [Remark Inspector](https://nick2bad4u.github.io/remark-lint-file-progress/remark-inspector/), [ESLint Inspector](https://nick2bad4u.github.io/remark-lint-file-progress/eslint-inspector/), and [Stylelint Inspector](https://nick2bad4u.github.io/remark-lint-file-progress/stylelint-inspector/).
- [ESLint File Progress](https://nick2bad4u.github.io/eslint-plugin-file-progress-2/), [Stylelint File Progress](https://nick2bad4u.github.io/stylelint-plugin-file-progress/), and [ESLint Typefest](https://nick2bad4u.github.io/eslint-plugin-typefest/).
- [Shared remark config](https://github.com/Nick2bad4u/remark-config-nick2bad4u), [releases](https://github.com/Nick2bad4u/remark-lint-file-progress/releases), and [changelog](CHANGELOG.md).
- [Issues](https://github.com/Nick2bad4u/remark-lint-file-progress/issues), [support](SUPPORT.md), and [security policy](SECURITY.md).

## Contributing and attribution

See [contributing](CONTRIBUTING.md) for development and verification, and [NOTICE](NOTICE) for attribution.
