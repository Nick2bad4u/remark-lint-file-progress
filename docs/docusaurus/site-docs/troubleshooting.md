---
sidebar_label: Troubleshooting
description: Diagnose missing progress, appended lines, Windows colors, reporter output, and process summaries.
---

# Troubleshooting

## Progress prints on separate lines

Interactive terminals reuse the previous progress block when its position is known. Redirected output uses complete lines without cursor controls. Check that the selected stream is a TTY; VS Code's integrated Terminal and Debug Console are different output surfaces.

Reporter writes, a resized terminal, unknown geometry, or a block taller than the viewport make the controller append instead of clearing an uncertain position. This protects existing output. Compact mode reduces the display height; summary-only mode removes live updates entirely.

Raw descriptor writes from native addons, `fs.writeSync`, or child processes with inherited terminal descriptors bypass stream counters. Embedders using them should disable progress or choose summary-only mode. See [the output contract](./compatibility.md#output-and-exit-status).

## A file is missing

Progress observes transformer executions. Ignored files, host-skipped inputs, parser failures, and errors from earlier transformers cannot produce an event. Put progress earlier in the plugin list to observe files before later transforms run.

`throttleMs` and `minFilesBeforeShow` can hide notifications while counts continue. `hide`, `hideFileName`, compact mode, summary-only mode, and `ttyOnly` also affect visibility. Remark CLI does not provide a built-in cache flag.

Stdin is displayed as `<input>` unless a VFile path is supplied. For the CLI, use `--file-path example.md`.

## CI produces no output

The CI presets check for exactly `CI=true`. `recommended-ci` hides progress and the summary. `recommended-ci-detailed` retains a detailed summary. `recommended-tty` emits nothing when stderr is redirected.

[Compare presets](./presets.md) or [inspect their recordings](./demos.md#presets) to choose the desired behavior.

## Colors or characters look different

Windows writes use Node's Unicode console transport without changing code pages, reporter color settings, or terminal width. `NO_COLOR` disables progress colors. Remark's `--no-color` configures its reporter rather than this plugin.

Spinner shapes depend on the terminal font. Try `spinnerStyle: "line"` for simple frames. Width calculations follow the narrow East Asian Ambiguous presentation used by VS Code's integrated terminal defaults; use summary-only mode if your terminal uses a different width model.

## A reporter or Markdown output contains progress

Default progress shares stderr with remark's usual reporter. Disable the plugin, or use `hide: true` with `showSummaryWhenHidden: false`, when consuming a reporter-only stream. `outputStream: "stdout"` puts progress alongside Markdown or JSON trees.

`--quiet` and `--silent` do not disable this transformer. Use [native plugin configuration](./getting-started.md#disable-progress).

## Counts or summaries are unexpected

Each execution records an event, even when processing the same VFile again. Watch and editor processes aggregate events until shutdown. A frozen processor that never processes a file produces no summary.

The last observed settings control the final summary. A zero exit code can coexist with warnings, and `--frail` changes remark's exit behavior. Progress never infers a problem count. Read [what an event means](./compatibility.md#what-an-event-means) before interpreting throughput.

## Report a reproducible issue

Include package and Node versions, configuration, command, terminal surface, selected stream, and minimal Markdown input. Describe redirection and other writers sharing the terminal. Use the [issue tracker](https://github.com/Nick2bad4u/remark-lint-file-progress/issues) or [support guide](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/SUPPORT.md).
