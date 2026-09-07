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
    useColor: boolean
): string {
    const colors = pc.createColors(useColor);
    const prefix = options.hidePrefix
        ? ""
        : `${colors.bold(colors.cyan("RFP"))} ${safeText(options.prefixMark)} `;
    if (options.mode === "compact" || options.hideFileName)
        return `${prefix}linting project files...`;
    const displayed =
        options.pathFormat === "basename"
            ? pathImplementation(filename).basename(filename)
            : filename;
    const text = colors.green(safeText(displayed));
    if (options.hidePrefix) return text;
    return `${prefix}linting${options.fileNameOnNewLine ? "\n  ↳" : ""} ${text}`;
}

/** Format a process-shutdown summary without claiming diagnostic counts. */
export function formatSummary(
    stats: SummaryStats,
    options: Readonly<NormalizedProgressSettings>,
    useColor: boolean
): string {
    const colors = pc.createColors(useColor);
    const prefix = options.hidePrefix ? "" : `${colors.cyan("RFP:")} `;
    const status =
        stats.exitCode === 0
            ? colors.green(
                  `${safeText(options.successMark)} ${safeText(options.successMessage)}`
              )
            : colors.red(
                  `${safeText(options.failureMark)} Process exited with status ${stats.exitCode}.`
              );
    const title = `${prefix}${status}`;
    if (!options.detailedSuccess) return title;
    const seconds = stats.durationMs / 1000;
    return arrayJoin(
        [
            title,
            `  Files observed: ${stats.filesObserved}`,
            `  Elapsed since first file: ${seconds.toFixed(2)}s`,
            `  Observed throughput: ${seconds > 0 ? (stats.filesObserved / seconds).toFixed(2) : "0.00"} files/s`,
            `  Process exit code: ${stats.exitCode}`,
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

function pathImplementation(filename: string): typeof path.posix {
    if (path.posix.isAbsolute(filename)) return path.posix;
    return path.win32.isAbsolute(filename) ? path.win32 : path;
}
