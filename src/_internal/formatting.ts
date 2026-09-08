import * as path from "node:path";
import { stripVTControlCharacters } from "node:util";
import pc from "picocolors";
import { arrayJoin } from "ts-extras";

import type { NormalizedProgressSettings } from "../types.js";

/** Observed process metrics; no inferred lint problem totals. */
export interface SummaryStats {
    readonly durationMs: number;
    readonly exitCode: number;
    readonly filesObserved: number;
}

/** Format an observed filename or generic activity. */
export function formatProgress(
    filename: string,
    options: Readonly<NormalizedProgressSettings>,
    useColor: boolean,
    cwd = ""
): string {
    const colors = pc.createColors(useColor);
    const prefix = options.hidePrefix
        ? ""
        : `${colors.bold(colors.cyan("RFP"))} ${colors.dim(safeText(options.prefixMark))} `;
    if (options.mode === "compact" || options.hideFileName)
        return `${prefix}${colors.dim("linting project files...")}`;
    // Control-sequence payloads can contain path separators. Strip complete
    // sequences first; escape remaining literal controls after segmentation.
    const cleanFilename = stripVTControlCharacters(filename);
    // Select the path grammar before making an absolute filename relative.
    // A backslash is a literal filename character in POSIX paths.
    const paths = pathImplementation(cleanFilename);
    const displayed =
        options.pathFormat === "basename"
            ? paths.basename(cleanFilename)
            : relativePath(cleanFilename, cwd);
    const text = formatPathSegments(displayed, paths, colors);
    if (options.hidePrefix) return text;
    const layout = options.fileNameOnNewLine ? `\n${colors.dim("  ↳")}` : "";
    return `${prefix}${colors.dim("linting")}${layout} ${text}`;
}

/** Format a process-shutdown summary without claiming diagnostic counts. */
export function formatSummary(
    stats: SummaryStats,
    options: Readonly<NormalizedProgressSettings>,
    useColor: boolean
): string {
    const colors = pc.createColors(useColor);
    const prefix = options.hidePrefix
        ? ""
        : `${colors.bold(colors.cyan("RFP"))}${colors.dim(":")} `;
    const statusColor = stats.exitCode === 0 ? colors.green : colors.red;
    const failureMessage = `Process exited with status ${stats.exitCode}.`;
    const status =
        stats.exitCode === 0
            ? `${colors.bold(statusColor(safeText(options.successMark)))} ${statusColor(safeText(options.successMessage))}`
            : `${colors.bold(statusColor(safeText(options.failureMark)))} ${statusColor(failureMessage)}`;
    const title = `${prefix}${status}`;
    if (!options.detailedSuccess) return title;
    const seconds = stats.durationMs / 1000;
    const duration =
        stats.durationMs < 1000
            ? `${Math.round(stats.durationMs)}ms`
            : `${seconds.toFixed(2)}s`;
    const throughput = `${seconds > 0 ? (stats.filesObserved / seconds).toFixed(2) : "0.00"} files/s`;
    return arrayJoin(
        [
            title,
            `${colors.dim("  Files observed:")} ${colors.yellow(String(stats.filesObserved))}`,
            `${colors.dim("  Elapsed since first file:")} ${colors.yellow(duration)}`,
            `${colors.dim("  Observed throughput:")} ${colors.yellow(throughput)}`,
            `${colors.dim("  Process exit code:")} ${statusColor(String(stats.exitCode))}`,
        ],
        "\n"
    );
}

/** Render Windows and POSIX paths consistently, including cross-platform tests. */
export function relativePath(filename: string, cwd: string): string {
    if (!cwd) return filename;
    const paths = pathImplementation(filename);
    if (!paths.isAbsolute(filename)) return filename;
    return paths.relative(cwd, filename) || paths.basename(filename);
}

/** Keep filenames and user messages on their intended terminal lines. */
export function safeText(value: string): string {
    return arrayJoin(
        Array.from(stripVTControlCharacters(value), (character) => {
            const code = character.codePointAt(0) ?? 0;
            if (code >= 127 && code <= 159)
                return String.raw`\u${code.toString(16).padStart(4, "0")}`;
            return code < 32
                ? JSON.stringify(character).slice(1, -1)
                : character;
        }),
        ""
    );
}

function formatFileSegment(
    filename: string,
    colors: Readonly<ReturnType<typeof pc.createColors>>
): string {
    const extensionIndex = filename.lastIndexOf(".");
    const stem = safeText(
        extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename
    );
    const extension =
        extensionIndex > 0
            ? colors.green(safeText(filename.slice(extensionIndex)))
            : "";
    return `${colors.bold(colors.green(stem))}${extension}`;
}

function formatPathSegments(
    filename: string,
    paths: Readonly<typeof path.posix>,
    colors: Readonly<ReturnType<typeof pc.createColors>>
): string {
    const directoryColors = [
        colors.blue,
        colors.cyan,
        colors.green,
        colors.magenta,
        colors.yellow,
    ];
    // eslint-disable-next-line typefest/prefer-ts-extras-string-split -- Regex captures retain separators; ts-extras accepts only string delimiters.
    const segments = filename.split(
        paths === path.win32 ? /(?<separator>[\/\\]+)/v : /(?<separator>\/+)/v
    );
    let directoryIndex = 0;
    return arrayJoin(
        segments.map((segment, index) => {
            if (index === segments.length - 1)
                return formatFileSegment(segment, colors);
            if (index % 2 === 1) return colors.dim(safeText(segment));
            if (segment.length === 0) return "";
            const color =
                directoryColors[directoryIndex % directoryColors.length] ??
                colors.cyan;
            directoryIndex += 1;
            return colors.bold(color(safeText(segment)));
        }),
        ""
    );
}

function pathImplementation(filename: string): typeof path.posix {
    if (path.posix.isAbsolute(filename)) return path.posix;
    return path.win32.isAbsolute(filename) || path.sep === "\\"
        ? path.win32
        : path.posix;
}
