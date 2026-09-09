---
sidebar_label: Getting started
description: Install Remark File Progress, compose unified presets, and customize terminal output in ESM or CommonJS.
---

# Getting started

Add progress to your existing remark pipeline with one preset. The plugin observes Markdown inputs without changing their trees, messages, output, or exit status.

## Install

```sh
npm install --save-dev remark-cli remark-lint-file-progress
```

The package supports Node.js 22+, unified 11, and remark 15. See [supported runtimes](./compatibility.md#supported-runtimes) for CLI, VFile, and module compatibility.

## Enable a preset

Add the recommended preset to `.remarkrc.mjs`:

```js
import recommended from "remark-lint-file-progress/configs/recommended";

export default recommended;
```

Then run remark:

```sh
npx remark README.md --frail --no-stdout
```

Each file appears when it reaches the progress transformer, followed by a summary at process shutdown. The preset supplies no Markdown lint rules. Compose your existing presets with `plugins: [existingPreset, recommended]` to keep their rules and transforms.

:::tip Choose your level of detail

Use [`recommended-detailed`](./presets/recommended-detailed.md) for process metrics, [`recommended-ci-detailed`](./presets/recommended-ci-detailed.md) for a summary without live output when `CI=true`, or [compare all seven presets](./presets.md).

:::

## Customize the display

Add a plugin tuple after a shared config:

```js
import shared from "remark-config-nick2bad4u";
import progress from "remark-lint-file-progress";

export default {
 plugins: [
  shared,
  [
   progress,
   { pathFormat: "basename", spinnerStyle: "line", detailedSuccess: true },
  ],
 ],
};
```

Version 2.0.0 of the shared remark config already includes progress. Unified merges repeated registrations of the same plugin, including mixed ESM/CommonJS presets from the same installed package version. Later option objects merge with earlier settings. Explore [all options](./activate.md#options) and the [option demos](./demos.md#options).

## Programmatic use

The transformer supports synchronous and asynchronous processing:

```js
import { remark } from "remark";
import progress from "remark-lint-file-progress";

const processor = remark().use(progress, { detailedSuccess: true });
const result = processor.processSync({ path: "README.md", value: "# Hello\n" });
console.log(String(result));
```

Imports, unused processors, and freezing configuration remain quiet. Output starts with the first transformer execution; the summary arrives at shutdown. Place progress before transforms whose failures you want to observe. [Parsing failures before transformation](./compatibility.md#what-an-event-means) cannot produce an event.

## CommonJS

Use the same preset in `.remarkrc.cjs`:

```js
module.exports = require("remark-lint-file-progress/configs/recommended");
```

Programmatic CommonJS consumers require this package normally and dynamically import the ESM-only remark host:

```js
const progress = require("remark-lint-file-progress");

async function main() {
 const { remark } = await import("remark");
 await remark()
  .use(progress)
  .process({ path: "README.md", value: "# Hello\n" });
}

main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});
```

## Keep machine-readable output intact

Default progress uses stderr, leaving Markdown and JSON trees on stdout intact. Remark reporters normally also use stderr. Disable progress when another tool expects that stream to contain only reporter output. Selecting `outputStream: "stdout"` mixes progress into stdout.

CLI `--quiet` and `--silent` affect remark's reporter. Use the plugin's `hide` or `ttyOnly` options to control progress. See [output and exit status](./compatibility.md#output-and-exit-status).

## Disable progress

Disable through unified, including when a shared config enables it:

```js
import shared from "remark-config-nick2bad4u";
import progress from "remark-lint-file-progress";

export default { plugins: [shared, [progress, false]] };
```

On its own, `.use(progress)`, `.use(progress, true)`, and `.use(progress, null)` use defaults. Invalid options throw a configuration TypeError before observation.

## Test a local tarball

From a checkout, use the pinned development Node and npm versions:

```sh
git clone https://github.com/Nick2bad4u/remark-lint-file-progress.git
cd remark-lint-file-progress
npm ci
npm pack
```

In a separate consumer, install the generated archive using its actual filename:

```sh
npm install --save-dev remark-cli /path/to/remark-lint-file-progress-1.0.1.tgz
```

Clean-consumer gates exercise the archive, both module formats, every preset, and exact Node 22.0.0. See [contributing](./developer/contributing.md) for commands.

## Next steps

- [Compare presets](./presets.md) and [watch the recordings](./demos.md).
- [Understand the metrics](./compatibility.md) before interpreting counts and timing.
- [Troubleshoot output](./troubleshooting.md) if files or summaries appear to be missing.
- [Explore inspectors and related projects](./resources.md).
