# Colored terminal demos

These deterministic recordings use the plugin's actual display controller. File events arrive at fixed intervals to make behavior reproducible; the timings illustrate process-wide metrics and do not measure individual file completion. Spinner frames advance with file events, and each update leaves a complete line.

Animated GIFs follow the presentation used by eslint-plugin-file-progress-2. For a still image, see the [static terminal poster](../static/img/terminal.svg). The casts preserve selectable terminal text and ANSI colors.

## Presets

### recommended

Show each file using the default display options.

![recommended terminal recording](../static/demos/presets/recommended.gif)

[Preset configuration](./presets/recommended.md) · [Terminal cast](../static/demos/casts/presets-recommended.cast)

### recommended-ci

Hide all plugin output when CI is exactly true.

![recommended-ci terminal recording](../static/demos/presets/recommended-ci.gif)

[Preset configuration](./presets/recommended-ci.md) · [Terminal cast](../static/demos/casts/presets-recommended-ci.cast)

### recommended-ci-detailed

Hide live output in CI while retaining the detailed process summary.

![recommended-ci-detailed terminal recording](../static/demos/presets/recommended-ci-detailed.gif)

[Preset configuration](./presets/recommended-ci-detailed.md) · [Terminal cast](../static/demos/casts/presets-recommended-ci-detailed.cast)

### recommended-compact

Announce generic activity once, without showing filenames.

![recommended-compact terminal recording](../static/demos/presets/recommended-compact.gif)

[Preset configuration](./presets/recommended-compact.md) · [Terminal cast](../static/demos/casts/presets-recommended-compact.cast)

### recommended-detailed

Show filenames and the detailed process summary.

![recommended-detailed terminal recording](../static/demos/presets/recommended-detailed.gif)

[Preset configuration](./presets/recommended-detailed.md) · [Terminal cast](../static/demos/casts/presets-recommended-detailed.cast)

### recommended-summary-only

Show only the final process summary.

![recommended-summary-only terminal recording](../static/demos/presets/recommended-summary-only.gif)

[Preset configuration](./presets/recommended-summary-only.md) · [Terminal cast](../static/demos/casts/presets-recommended-summary-only.cast)

### recommended-tty

Show output only when stderr is an interactive terminal.

![recommended-tty terminal recording](../static/demos/presets/recommended-tty.gif)

[Preset configuration](./presets/recommended-tty.md) · [Terminal cast](../static/demos/casts/presets-recommended-tty.cast)

The two CI recordings use CI=true; recommended-tty uses an interactive stderr stream.

## Options

Pass these options in a native plugin tuple: `plugins: [[progress, options]]`.

### pathFormat

Show basenames instead of relative paths.

```json
{
 "pathFormat": "basename"
}
```

![pathFormat terminal recording](../static/demos/options/pathFormat.gif)

[Terminal cast](../static/demos/casts/options-pathFormat.cast)

### hideDirectoryNames

The deprecated alias still selects basename paths; prefer pathFormat.

```json
{
 "hideDirectoryNames": true
}
```

![hideDirectoryNames terminal recording](../static/demos/options/hideDirectoryNames.gif)

[Terminal cast](../static/demos/casts/options-hideDirectoryNames.cast)

### fileNameOnNewLine

Put the filename on its own indented line.

```json
{
 "fileNameOnNewLine": true
}
```

![fileNameOnNewLine terminal recording](../static/demos/options/fileNameOnNewLine.gif)

[Terminal cast](../static/demos/casts/options-fileNameOnNewLine.cast)

### hideFileName

Announce activity once without listing filenames.

```json
{
 "hideFileName": true
}
```

![hideFileName terminal recording](../static/demos/options/hideFileName.gif)

[Terminal cast](../static/demos/casts/options-hideFileName.cast)

### hidePrefix

Remove the RFP label and prefix mark.

```json
{
 "hidePrefix": true
}
```

![hidePrefix terminal recording](../static/demos/options/hidePrefix.gif)

[Terminal cast](../static/demos/casts/options-hidePrefix.cast)

### prefixMark

Choose a custom prefix mark.

```json
{
 "prefixMark": ">>"
}
```

![prefixMark terminal recording](../static/demos/options/prefixMark.gif)

[Terminal cast](../static/demos/casts/options-prefixMark.cast)

### successMark

Choose the mark used with a zero process exit code.

```json
{
 "successMark": "OK"
}
```

![successMark terminal recording](../static/demos/options/successMark.gif)

[Terminal cast](../static/demos/casts/options-successMark.cast)

### successMessage

Customize the shutdown message.

```json
{
 "successMessage": "Stylesheet pass finished."
}
```

![successMessage terminal recording](../static/demos/options/successMessage.gif)

[Terminal cast](../static/demos/casts/options-successMessage.cast)

### failureMark

A nonzero process exit code selects red failure styling, without inventing problem totals.

```json
{
 "failureMark": "FAIL",
 "detailedSuccess": true
}
```

![failureMark terminal recording](../static/demos/options/failureMark.gif)

[Terminal cast](../static/demos/casts/options-failureMark.cast)

### detailedSuccess

Include observed files, elapsed process time, throughput, and exit code.

```json
{
 "detailedSuccess": true
}
```

![detailedSuccess terminal recording](../static/demos/options/detailedSuccess.gif)

[Terminal cast](../static/demos/casts/options-detailedSuccess.cast)

### mode-compact

Emit one activity notice, followed by the shutdown summary.

```json
{
 "mode": "compact"
}
```

![mode-compact terminal recording](../static/demos/options/mode-compact.gif)

[Terminal cast](../static/demos/casts/options-mode-compact.cast)

### mode-summary-only

Wait until process exit before displaying the summary.

```json
{
 "mode": "summary-only"
}
```

![mode-summary-only terminal recording](../static/demos/options/mode-summary-only.gif)

[Terminal cast](../static/demos/casts/options-mode-summary-only.cast)

### hide

Hide both progress and the shutdown summary.

```json
{
 "hide": true
}
```

![hide terminal recording](../static/demos/options/hide.gif)

[Terminal cast](../static/demos/casts/options-hide.cast)

### showSummaryWhenHidden

Keep the process summary when live progress is hidden.

```json
{
 "hide": true,
 "showSummaryWhenHidden": true,
 "detailedSuccess": true
}
```

![showSummaryWhenHidden terminal recording](../static/demos/options/showSummaryWhenHidden.gif)

[Terminal cast](../static/demos/casts/options-showSummaryWhenHidden.cast)

### throttleMs

Limit live displays while still counting every observed file.

```json
{
 "throttleMs": 1000,
 "detailedSuccess": true
}
```

![throttleMs terminal recording](../static/demos/options/throttleMs.gif)

[Terminal cast](../static/demos/casts/options-throttleMs.cast)

### minFilesBeforeShow

Wait for three observed files before showing output.

```json
{
 "minFilesBeforeShow": 3,
 "detailedSuccess": true
}
```

![minFilesBeforeShow terminal recording](../static/demos/options/minFilesBeforeShow.gif)

[Terminal cast](../static/demos/casts/options-minFilesBeforeShow.cast)

### outputStream

Explicitly direct progress to stdout instead of the default stderr.

```json
{
 "outputStream": "stdout"
}
```

![outputStream terminal recording](../static/demos/options/outputStream.gif)

[Terminal cast](../static/demos/casts/options-outputStream.cast)

### ttyOnly

Suppress output when the selected stream is not a terminal.

```json
{
 "ttyOnly": true
}
```

![ttyOnly terminal recording](../static/demos/options/ttyOnly.gif)

[Terminal cast](../static/demos/casts/options-ttyOnly.cast)

### non-tty

Redirected output uses plain lines without spinner frames or color.

```json
{}
```

![non-tty terminal recording](../static/demos/options/non-tty.gif)

[Terminal cast](../static/demos/casts/options-non-tty.cast)

### spinnerStyle-arc

Use arc frames, advancing when files are observed.

```json
{
 "spinnerStyle": "arc"
}
```

![spinnerStyle-arc terminal recording](../static/demos/options/spinnerStyle-arc.gif)

[Terminal cast](../static/demos/casts/options-spinnerStyle-arc.cast)

### spinnerStyle-bounce

Use bounce frames, advancing when files are observed.

```json
{
 "spinnerStyle": "bounce"
}
```

![spinnerStyle-bounce terminal recording](../static/demos/options/spinnerStyle-bounce.gif)

[Terminal cast](../static/demos/casts/options-spinnerStyle-bounce.cast)

### spinnerStyle-clock

Use clock frames, advancing when files are observed.

```json
{
 "spinnerStyle": "clock"
}
```

![spinnerStyle-clock terminal recording](../static/demos/options/spinnerStyle-clock.gif)

[Terminal cast](../static/demos/casts/options-spinnerStyle-clock.cast)

### spinnerStyle-dots

Use dots frames, advancing when files are observed.

```json
{
 "spinnerStyle": "dots"
}
```

![spinnerStyle-dots terminal recording](../static/demos/options/spinnerStyle-dots.gif)

[Terminal cast](../static/demos/casts/options-spinnerStyle-dots.cast)

### spinnerStyle-line

Use line frames, advancing when files are observed.

```json
{
 "spinnerStyle": "line"
}
```

![spinnerStyle-line terminal recording](../static/demos/options/spinnerStyle-line.gif)

[Terminal cast](../static/demos/casts/options-spinnerStyle-line.cast)

## Reproduce the recordings

Install [agg 1.9.0](https://github.com/asciinema/agg/releases/tag/v1.9.0), then run `npm run build` and `npm run docs:demos:write`. The renderer uses the GitHub dark palette. Glyph appearance can vary with the system's monospace and fallback fonts.

`npm run docs:demos:check` regenerates the expected terminal traces in memory and checks every committed cast, GIF integrity hash, gallery entry, and static poster without writing files or requiring agg. Regenerate the recordings whenever output behavior changes.
