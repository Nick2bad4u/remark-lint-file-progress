# Progress options

Observe each Markdown input when the progress transformer runs. The plugin leaves the tree, VFile messages, Markdown output, and process exit status intact.

## Configuration

```js
import progress from "remark-lint-file-progress";

export default {
 plugins: [
  [
   progress,
   {
    outputStream: "stderr",
    pathFormat: "relative",
    detailedSuccess: true,
   },
  ],
 ],
};
```

Pass `false` in place of the options to disable progress. Omitted options, `true`, and `null` use defaults. Invalid options throw a configuration TypeError before that processing attempt produces progress. Severity labels and remark-lint message-control comments do not configure this observational plugin.

## Options

<!-- options:start -->

| Option                  | Default            |
| ----------------------- | ------------------ |
| `detailedSuccess`       | `false`            |
| `failureMark`           | `"✖"`              |
| `fileNameOnNewLine`     | `false`            |
| `hide`                  | `false`            |
| `hideFileName`          | `false`            |
| `hidePrefix`            | `false`            |
| `minFilesBeforeShow`    | `0`                |
| `mode`                  | `"file"`           |
| `outputStream`          | `"stderr"`         |
| `pathFormat`            | `"relative"`       |
| `prefixMark`            | `"•"`              |
| `showSummaryWhenHidden` | `false`            |
| `spinnerStyle`          | `"dots"`           |
| `successMark`           | `"✔"`              |
| `successMessage`        | `"Lint complete."` |
| `throttleMs`            | `0`                |
| `ttyOnly`               | `false`            |

<!-- options:end -->

`hideDirectoryNames: true` is a deprecated alias for `pathFormat: "basename"`. An explicit `pathFormat` takes precedence. Marks and filenames are escaped before printing control characters.

- `mode` accepts `"file"`, `"compact"`, or `"summary-only"`.
- `pathFormat` accepts `"relative"` (relative to the process working directory) or `"basename"`.
- `spinnerStyle` accepts `"arc"`, `"bounce"`, `"clock"`, `"dots"`, or `"line"`. Frames are shown only on a terminal.
- `outputStream` accepts `"stderr"` or `"stdout"`. Choosing stdout mixes progress into that stream, including Markdown and JSON tree output.
- `minFilesBeforeShow` and `throttleMs` are nonnegative safe integers. The first controls the observed-file threshold; the second sets the minimum milliseconds between displayed updates.
- `hide` suppresses progress and summaries; `showSummaryWhenHidden` restores the final summary while still honoring the file threshold and `ttyOnly`.
- `hideFileName` uses a generic activity notice. `hidePrefix` shows just the filename in file mode. `fileNameOnNewLine` places the filename below the progress prefix.
- `prefixMark`, `successMark`, `failureMark`, and `successMessage` accept nonempty strings. `detailedSuccess` adds the process metrics to both successful and unsuccessful shutdown summaries.

Each notification uses its validated file settings. The last observed valid settings determine the final summary.

## Process summaries

A summary is printed once at process shutdown after at least one observed input. Detailed mode includes the number of observed file-processing events, elapsed time since the first observed file, derived throughput, and process exit code. Zero elapsed time reports zero throughput instead of inventing a rate.

Durations below one second use rounded milliseconds; longer durations use seconds with two decimal places.

The success message follows a zero process exit code. It does not imply that remark reported no warnings. No problem totals are inferred.

## Terminal behavior

Terminal output advances the chosen spinner frame when a file is displayed, then ends the line. No background animation or active timer runs to interfere with remark's report. Redirected output uses plain lines without frames or color.

On color-capable terminals, the spinner and bold `RFP` prefix are cyan. Directory names cycle through bold blue, cyan, green, magenta, and yellow, with dim separators. The filename stem is bold green and its extension is green. Activity labels, the prefix mark, and the multiline arrow are dim. Summaries use green or red for process status, dim metric labels, and yellow counts, durations, and throughput. These styles follow ESLint File Progress 2 while preserving remark's reporter colors and terminal settings.

Throttling limits displayed paths, not observed counts. Compact mode emits one generic activity notice. `ttyOnly` suppresses both progress and summaries when the selected stream is not a terminal, including when `showSummaryWhenHidden` is enabled.
