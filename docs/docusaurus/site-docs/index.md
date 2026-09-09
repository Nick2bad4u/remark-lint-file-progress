---
slug: /overview
sidebar_position: 1
---

# See the Markdown file behind the wait

Remark File Progress shows files as they reach its native unified transformer. Follow filenames in an interactive terminal, switch to compact activity, or show only a process summary.

![Colored terminal output](../static/demos/presets/recommended-detailed.gif)

## Install the plugin

Install the plugin and remark CLI in your project:

```sh
npm install --save-dev remark-cli remark-lint-file-progress
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
