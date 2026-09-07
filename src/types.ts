/** Fully resolved display settings. */
export type NormalizedProgressSettings = Required<
    Omit<ProgressSettings, "hideDirectoryNames">
>;
/** Writable stream for progress output. */
export type OutputStream = "stderr" | "stdout";
/** Live display modes. */
export type ProgressMode =
    | "compact"
    | "file"
    | "summary-only";
/** Filename presentation. */
export type ProgressPathFormat = "basename" | "relative";

/** Public option alias matching the progress plugin family. */
export type ProgressRuleOptions = ProgressSettings;

/** Display options accepted by the remark progress plugin. */
export interface ProgressSettings {
    /** Include observed-file counts and process timing in summaries. */
    detailedSuccess?: boolean;
    /** Mark preceding a nonzero process exit summary. */
    failureMark?: string;
    /** Place the filename below the progress prefix. */
    fileNameOnNewLine?: boolean;
    /** Suppress output, unless showSummaryWhenHidden is enabled. */
    hide?: boolean;
    /** @deprecated Use pathFormat: "basename". */
    hideDirectoryNames?: boolean;
    /** Display generic activity instead of paths. */
    hideFileName?: boolean;
    /** Omit the RFP prefix. */
    hidePrefix?: boolean;
    /** Minimum observed events before output is shown. */
    minFilesBeforeShow?: number;
    /** Default: file. */
    mode?: ProgressMode;
    /** Default: stderr, preserving formatted stdout. */
    outputStream?: OutputStream;
    /** Default: relative; explicit values override the deprecated alias. */
    pathFormat?: ProgressPathFormat;
    /** Separator following the RFP prefix. */
    prefixMark?: string;
    /** Allow a summary while hide is enabled. */
    showSummaryWhenHidden?: boolean;
    /** Default: dots. */
    spinnerStyle?: SpinnerStyle;
    /** Mark preceding a zero process exit summary. */
    successMark?: string;
    /** Text for a zero process exit; not an assertion of zero warnings. */
    successMessage?: string;
    /** Minimum milliseconds between displayed filenames. */
    throttleMs?: number;
    /** Suppress all output when the selected stream is not a terminal. */
    ttyOnly?: boolean;
}
/** Supported spinner frames. */
export type SpinnerStyle =
    | "arc"
    | "bounce"
    | "clock"
    | "dots"
    | "line";
