---
slug: /
sidebar_position: 1
---

# See the Markdown file behind the wait

Remark File Progress shows files as they reach its native unified transformer. Keep a readable trail of filenames, switch to compact activity, or show only a process summary.

![Colored terminal output](../static/demos/presets/recommended-detailed.gif)

## Try the unpublished package

Version 0.1.0 has not been published to npm. Clone the repository, select the Node version in `.node-version`, and use npm 12.0.2:

```sh
git clone https://github.com/Nick2bad4u/remark-lint-file-progress.git
cd remark-lint-file-progress
npm ci
npm pack
```

Install remark-cli and the resulting tarball in your project:

```sh
npm install --save-dev remark-cli /path/to/remark-lint-file-progress-0.1.0.tgz
```

Add the recommended preset to your remark configuration:

```js
import recommended from "remark-lint-file-progress/configs/recommended";

export default recommended;
```

Existing unified presets compose through `plugins: [existingPreset, recommended]`. Run `npx remark README.md --frail --no-stdout` to check Markdown. The plugin leaves messages, Markdown output, and exit status under remark's control.

## Pick your display

- [Watch the colored demos](./demos.md): all presets, options, and spinner styles.
- [Configure progress](./activate.md): filenames, streams, marks, frames, and throttling.
- [Choose a preset](./presets.md): seven configurations matching the progress plugin family.
- [Understand the metrics](./compatibility.md): process summaries, skipped files, and custom syntax.
- [Develop the plugin](./developer/contributing.md): local checks, clean consumers, and generated docs.

Default progress goes to stderr, leaving Markdown and JSON tree output on stdout untouched. Reporters also normally write to stderr; hide progress when you need that stream to contain only a machine-readable report.
