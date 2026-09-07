# Compatibility and metric boundaries

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

Every display ends with a newline. Spinner frames advance on file events, and redirected output uses plain lines without cursor animation. Windows terminals use Node's console-aware streams to preserve Unicode filenames, marks, frames, and ANSI colors, including the shutdown summary. Console code pages, terminal width, and reporter settings remain unchanged.

The default stderr stream preserves Markdown and JSON trees written to stdout. Choosing stdout mixes progress into that stream. Reporters usually share stderr with progress; disable the plugin or use `hide: true` with `showSummaryWhenHidden: false` when a consumer requires reporter-only output.

CLI `--quiet`, `--silent`, and `--no-color` configure remark's reporter, not this plugin. Use the plugin's `hide`/`ttyOnly` settings and the standard `NO_COLOR` environment variable for its output. Throttling affects displayed paths while counts continue; compact mode announces generic activity once.

The process exit code determines summary styling. A zero exit code can coexist with warnings; `remark --frail` changes the host's warning exit behavior. Programmatic callers manage their own exit status. The plugin neither counts diagnostics nor changes their severity.
