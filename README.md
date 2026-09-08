# remark-lint-file-progress

Live filenames and configurable process summaries for remark.

[![Project type: Remark plugin.](https://flat.badgen.net/static/type/Remark%20plugin/A21CAF)](https://github.com/Nick2bad4u/remark-lint-file-progress) [![npm version.](https://flat.badgen.net/npm/v/remark-lint-file-progress)](https://www.npmjs.com/package/remark-lint-file-progress) [![Node.js 22 or later.](https://flat.badgen.net/static/node/%3E%3D22/4D7C0F)](https://nodejs.org/) [![TypeScript declarations.](https://flat.badgen.net/static/types/TypeScript/6D28D9)](https://nick2bad4u.github.io/remark-lint-file-progress/developer/api) [![Codecov coverage.](https://flat.badgen.net/codecov/github/Nick2bad4u/remark-lint-file-progress/main)](https://codecov.io/gh/Nick2bad4u/remark-lint-file-progress/branch/main) [![GitHub Actions checks on main.](https://flat.badgen.net/github/checks/Nick2bad4u/remark-lint-file-progress/main)](https://github.com/Nick2bad4u/remark-lint-file-progress/actions) [![MIT license.](https://flat.badgen.net/static/license/MIT/4338CA)](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/LICENSE)

![Colored per-file progress](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended.gif)

![Detailed process summary](https://raw.githubusercontent.com/Nick2bad4u/remark-lint-file-progress/main/docs/docusaurus/static/demos/presets/recommended-detailed.gif)

[Documentation](https://nick2bad4u.github.io/remark-lint-file-progress/) · [All preset and option demos](https://nick2bad4u.github.io/remark-lint-file-progress/demos)

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
npm install --save-dev remark-cli /path/to/remark-lint-file-progress-1.0.0.tgz
```

## Configuration

Use a native preset in your remark configuration:

```js
import recommended from "remark-lint-file-progress/configs/recommended";

export default recommended;
```

Or add the plugin alongside your existing shared config:

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

- `recommended`: Show each file using the default display options.
- `recommended-ci`: Hide all plugin output when CI is exactly true.
- `recommended-ci-detailed`: Hide live output in CI while retaining the detailed process summary.
- `recommended-compact`: Announce generic activity once, without showing filenames.
- `recommended-detailed`: Show filenames and the detailed process summary.
- `recommended-summary-only`: Show only the final process summary.
- `recommended-tty`: Show output only when stderr is an interactive terminal.

## Compatibility

Node.js 22+, unified 11, VFile 6, remark 15, remark-cli 12, and remark-lint 10. The plugin exports ESM and CommonJS with declarations; CommonJS consumers dynamically import the ESM-only remark host.

Each transformer execution records one event, including repeat processing of one VFile. Progress goes to stderr by default, preserving Markdown and JSON tree output on stdout. Reporters normally share stderr with progress; hide progress when consuming that stream as machine-readable output.

Summaries measure observed events over the process lifetime, without inferred problem counts or per-file completion times. Windows terminal output preserves Unicode and colors through Node's console-aware streams.

See [contributing](CONTRIBUTING.md) for development and verification, and [NOTICE](NOTICE) for attribution.
