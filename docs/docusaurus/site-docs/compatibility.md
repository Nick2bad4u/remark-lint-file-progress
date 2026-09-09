# Compatibility and metric boundaries

Each installed package version keeps its own registry and process summary. ESM and CommonJS imports of the same version share one plugin identity and one controller; separate installed versions cannot replace each other's metadata or behavior.

## Supported runtimes

The package supports Node.js 22 and later, unified 11, VFile 6, remark 15, remark-cli 12, and remark-lint 10. It works with plain unified/remark without enabling lint rules. Its exports include ESM, directly callable CommonJS, declarations, and all seven preset subpaths.

CommonJS consumers require the plugin and dynamically import the ESM-only remark host:

```js
const progress = require("remark-lint-file-progress");

async function main() {
 const { remark } = await import("remark");
 await remark()
  .use(progress)
  .process({ path: "README.md", value: "# Title\n" });
}

main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});
```

Development uses the pinned Node version and npm 12.0.2. Clean consumers test Node 22.0.0 separately from those development requirements. TypeScript consumers should use `node16`, `nodenext`, or `bundler` module resolution.

## What an event means

Each execution of the progress transformer records an event. It does not measure the beginning or completion of all lint rules. Place the plugin early in a pipeline to observe files before later transformers can fail. Parsing errors and errors from an earlier transformer cannot produce an event for that attempt.

Repeated processing of the same path, tree, or VFile records a new event. Unified merges repeated registrations, including registration through both module formats or overlapping presets. Each processor snapshots its validated options when it freezes.

The filename comes from VFile.path, falling back to `<input>`. `remark --file-path example.md` supplies a name for stdin. Windows and POSIX paths use the same relative/basename handling as the Stylelint progress package.

Ignored files and files skipped by an embedding application are absent from counts. remark-cli 12 has no built-in cache option. CommonMark, GFM, frontmatter, directives, math, and MDX work when their parser plugins are configured; this package does not install syntax extensions into your processor.

## Long-lived processes

Summaries span the process lifetime after its first observed event. Watch processes and editor integrations can accumulate multiple runs. The last observed valid settings control the final summary, and each worker thread has independent state and its own summary.

Imports, unused processors, and freezing configuration produce no progress output or shutdown hook. No active animation timers keep the process alive. Counts and throughput describe observed events; the package has no session API, exact input total, percentage, ETA, or individual-file completion timer.

## Output and exit status

Interactive terminals replace the previous progress display, including multiline layouts and wrapped Unicode paths. Spinner frames advance on file events without animation timers. Each update ends on a fresh line for reporters. The controller checks both process streams' byte counts and terminal dimensions before clearing its own display; intervening writes or resizing cause it to leave the old display intact. Unknown terminal geometry and displays taller than the viewport also use appended lines. Direct file-descriptor writes bypass stream byte counters; applications using those writes should disable live progress. Redirected output uses plain lines without cursor controls. Windows terminals use Node's console-aware streams to preserve Unicode filenames, marks, frames, and ANSI colors, including the shutdown summary. Console code pages, terminal width, and reporter settings remain unchanged.

The default stderr stream preserves Markdown and JSON trees written to stdout. Choosing stdout mixes progress into that stream. Reporters usually share stderr with progress; disable the plugin or use `hide: true` with `showSummaryWhenHidden: false` when a consumer requires reporter-only output.

Redraw tracking covers Node's stdout/stderr stream writes. A native addon, `fs.writeSync`, or child process with inherited terminal descriptors can move the cursor without updating those counters. Embedders using those writers must choose `mode: "summary-only"` or disable progress; live redraw cannot safely track them without controlling the host's output transport. Redirecting the other stream to a regular file remains supported and does not prevent terminal redraw.

Width calculations use the standard narrow presentation of East Asian Ambiguous characters, matching VS Code's integrated terminal defaults. Terminals configured to render those characters wide may retain earlier progress rows after wrapping. Use summary-only mode when the terminal's character widths differ from that model. The plugin does not change locale, fonts, width preferences, or terminal dimensions.

CLI `--quiet`, `--silent`, and `--no-color` configure remark's reporter, not this plugin. Use the plugin's `hide`/`ttyOnly` settings and the standard `NO_COLOR` environment variable for its output. Throttling affects displayed paths while counts continue; compact mode updates a generic activity frame in terminals and announces activity once in redirected output.

The process exit code determines summary styling. A zero exit code can coexist with warnings; `remark --frail` changes the host's warning exit behavior. Programmatic callers manage their own exit status. The plugin neither counts diagnostics nor changes their severity.
