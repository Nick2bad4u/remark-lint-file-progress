/** The gallery uses the built plugin's actual options and display controller. */
export const optionDemos = [
    {
        name: "pathFormat",
        options: { pathFormat: "basename" },
        description: "Show basenames instead of relative paths.",
    },
    {
        name: "hideDirectoryNames",
        options: { hideDirectoryNames: true },
        description:
            "The deprecated alias still selects basename paths; prefer pathFormat.",
    },
    {
        name: "fileNameOnNewLine",
        options: { fileNameOnNewLine: true },
        description: "Put the filename on its own indented line.",
    },
    {
        name: "hideFileName",
        options: { hideFileName: true },
        description:
            "Show generic activity without filenames; redirected output announces it once.",
    },
    {
        name: "hidePrefix",
        options: { hidePrefix: true },
        description: "Remove the RFP label and prefix mark.",
    },
    {
        name: "prefixMark",
        options: { prefixMark: ">>" },
        description: "Choose a custom prefix mark.",
    },
    {
        name: "successMark",
        options: { successMark: "OK" },
        description: "Choose the mark used with a zero process exit code.",
    },
    {
        name: "successMessage",
        options: { successMessage: "Stylesheet pass finished." },
        description: "Customize the shutdown message.",
    },
    {
        name: "failureMark",
        options: { failureMark: "FAIL", detailedSuccess: true },
        exitCode: 2,
        description:
            "A nonzero process exit code selects red failure styling, without inventing problem totals.",
    },
    {
        name: "detailedSuccess",
        options: { detailedSuccess: true },
        description:
            "Include observed files, elapsed process time, throughput, and exit code.",
    },
    {
        name: "mode-compact",
        options: { mode: "compact" },
        description:
            "Emit one activity notice, followed by the shutdown summary.",
    },
    {
        name: "mode-summary-only",
        options: { mode: "summary-only" },
        description: "Wait until process exit before displaying the summary.",
    },
    {
        name: "hide",
        options: { hide: true },
        description: "Hide both progress and the shutdown summary.",
    },
    {
        name: "showSummaryWhenHidden",
        options: {
            hide: true,
            showSummaryWhenHidden: true,
            detailedSuccess: true,
        },
        description: "Keep the process summary when live progress is hidden.",
    },
    {
        name: "throttleMs",
        options: { throttleMs: 1000, detailedSuccess: true },
        description:
            "Limit live displays while still counting every observed file.",
    },
    {
        name: "minFilesBeforeShow",
        options: { minFilesBeforeShow: 3, detailedSuccess: true },
        description: "Wait for three observed files before showing output.",
    },
    {
        name: "outputStream",
        options: { outputStream: "stdout" },
        description:
            "Explicitly direct progress to stdout instead of the default stderr.",
    },
    {
        name: "ttyOnly",
        options: { ttyOnly: true },
        tty: false,
        description:
            "Suppress output when the selected stream is not a terminal.",
    },
    {
        name: "non-tty",
        options: {},
        tty: false,
        description:
            "Redirected output uses plain lines without spinner frames or color.",
    },
    ...[
        "arc",
        "bounce",
        "clock",
        "dots",
        "line",
    ].map((spinnerStyle) => ({
        name: `spinnerStyle-${spinnerStyle}`,
        options: { spinnerStyle },
        description: `Use ${spinnerStyle} frames, advancing when files are observed.`,
    })),
];
