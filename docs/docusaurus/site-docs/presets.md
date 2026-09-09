---
sidebar_label: Presets
description: Compare seven Remark progress presets for local terminals, CI, compact activity, and process summaries.
---

# Choose your progress preset

Every preset is a native unified preset. Export it from your remark config or combine it with existing presets in the `plugins` array.

## Choose by workflow

| Preset                                                               | Best for                    | Behavior                                                                      |
| -------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| [🟢 recommended](./presets/recommended.md)                           | Follow each Markdown file   | Show each file using the default display options.                             |
| [🔵 recommended-ci](./presets/recommended-ci.md)                     | Keep CI logs quiet          | Hide all plugin output when CI is exactly true.                               |
| [🟣 recommended-ci-detailed](./presets/recommended-ci-detailed.md)   | Keep a summary in CI        | Hide live output in CI while retaining the detailed process summary.          |
| [🟡 recommended-compact](./presets/recommended-compact.md)           | Show activity without paths | Show generic activity without filenames; redirected output announces it once. |
| [🟠 recommended-detailed](./presets/recommended-detailed.md)         | See process-wide metrics    | Show filenames and the detailed process summary.                              |
| [🩷 recommended-summary-only](./presets/recommended-summary-only.md) | Read the final summary      | Show only the final process summary.                                          |
| [🟦 recommended-tty](./presets/recommended-tty.md)                   | Respect redirected output   | Show output only when stderr is an interactive terminal.                      |

## Use a preset

```js
import recommended from "remark-lint-file-progress/configs/recommended";

export default recommended;
```

Compose existing presets with `plugins: [existingPreset, recommended]`. Each progress preset registers the same callable plugin and adds no lint diagnostics.

## Customize or disable

Add `[progress, options]` to your plugins array after the preset to customize the display, or `[progress, false]` to disable it. Unified merges repeated registrations. See [getting started](./getting-started.md#customize-the-display) and [all options](./activate.md#options).

## CI and terminal behavior

The two CI presets activate their CI behavior only when `CI` is exactly `true`. Outside CI, both display ordinary progress. The TTY preset checks stderr, the default output stream. Summary counts and timing cover the process lifetime; read [compatibility and metrics](./compatibility.md) before interpreting them.

Watch [all preset recordings](./demos.md#presets), explore [option demonstrations](./demos.md#options), or use [troubleshooting](./troubleshooting.md) if your output differs.
