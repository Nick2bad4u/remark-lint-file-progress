import { writeSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { isMainThread } from "node:worker_threads";
import pc from "picocolors";
import { isFinite, isSafeInteger } from "ts-extras";

import type {
    NormalizedProgressSettings,
    OutputStream,
    SpinnerStyle,
} from "../types.js";

import { formatProgress, formatSummary } from "./formatting.js";
import { TerminalDisplay, type TerminalSnapshot } from "./terminal.js";

/** Injectable process boundary for deterministic lifecycle and terminal tests. */
export interface ProgressHost {
    readonly color: (stream: OutputStream) => boolean;
    readonly cwd: () => string;
    readonly isTTY: (stream: OutputStream) => boolean;
    readonly now: () => number;
    readonly onExit: (callback: (code: number) => void) => void;
    readonly terminal: (stream: OutputStream) => TerminalSnapshot | undefined;
    readonly write: (
        stream: OutputStream,
        text: string,
        isFinal: boolean
    ) => void;
}

const frames: Record<SpinnerStyle, readonly string[]> = {
    arc: [
        "◜",
        "◠",
        "◝",
        "◞",
        "◡",
        "◟",
    ],
    bounce: [
        "▖",
        "▘",
        "▝",
        "▗",
    ],
    clock: [
        "🕛",
        "🕐",
        "🕑",
        "🕒",
        "🕓",
        "🕔",
        "🕕",
        "🕖",
        "🕗",
        "🕘",
        "🕙",
        "🕚",
    ],
    dots: [
        "⠋",
        "⠙",
        "⠹",
        "⠸",
        "⠼",
        "⠴",
        "⠦",
        "⠧",
        "⠇",
        "⠏",
    ],
    line: [
        "|",
        "/",
        "-",
        "\\",
    ],
};

/**
 * Per-process output state. Instantiation and module import have no side
 * effects.
 */
export class ProgressController {
    #count = 0;
    readonly #display: TerminalDisplay;
    #finished = false;
    readonly #host: ProgressHost;
    #rendered = -Infinity;
    #settings: NormalizedProgressSettings | undefined;
    #started = 0;

    public constructor(host: ProgressHost) {
        this.#host = host;
        this.#display = new TerminalDisplay(host);
    }

    /**
     * Finish once at process exit; this is deliberately not a public session
     * API.
     */
    public finish(code: number): void {
        if (this.#finished) return;
        this.#finished = true;
        const settings = this.#settings;
        if (
            !settings ||
            !this.#canShow(settings) ||
            (settings.hide && !settings.showSummaryWhenHidden)
        ) {
            this.#display.clear(true);
            return;
        }
        const text = formatSummary(
            {
                durationMs: Math.max(0, this.#host.now() - this.#started),
                exitCode: code,
                filesObserved: this.#count,
            },
            settings,
            this.#host.color(settings.outputStream)
        );
        this.#display.write(settings.outputStream, text, true);
    }

    /**
     * Record a processing event, retaining the last valid settings for
     * shutdown.
     */
    public observe(
        filename: string,
        settings: Readonly<NormalizedProgressSettings>
    ): void {
        if (this.#finished) return;
        this.#settings = settings;
        if (this.#count === 0) {
            this.#started = this.#host.now();
            this.#host.onExit((code) => {
                this.finish(code);
            });
        }
        this.#count += 1;
        if (
            !this.#canShow(settings) ||
            settings.hide ||
            settings.mode === "summary-only"
        )
            return;
        const now = this.#host.now();
        if (now - this.#rendered < settings.throttleMs) return;
        // Compact output is an activity notice, not one identical line per file.
        if (
            (settings.mode === "compact" || settings.hideFileName) &&
            !this.#host.isTTY(settings.outputStream) &&
            isFinite(this.#rendered)
        )
            return;
        this.#rendered = now;
        const frameSet = frames[settings.spinnerStyle];
        const useColor = this.#host.color(settings.outputStream);
        const frame = this.#host.isTTY(settings.outputStream)
            ? `${pc.createColors(useColor).cyan(frameSet[(this.#count - 1) % frameSet.length] ?? "•")} `
            : "";
        const text = formatProgress(
            filename,
            settings,
            useColor,
            settings.pathFormat === "basename" ? "" : this.#host.cwd()
        );
        this.#display.write(settings.outputStream, `${frame}${text}`, false);
    }

    #canShow(settings: Readonly<NormalizedProgressSettings>): boolean {
        return (
            this.#count >= settings.minFilesBeforeShow &&
            (!settings.ttyOnly || this.#host.isTTY(settings.outputStream))
        );
    }
}

const streamWrites: Record<OutputStream, number> = { stderr: 0, stdout: 0 };
const streamErrors: Record<OutputStream, WeakSet<Readonly<Error>>> = {
    stderr: new WeakSet(),
    stdout: new WeakSet(),
};
const streamErrorHandlers: Record<
    OutputStream,
    (error: Readonly<Error>) => void
> = {
    stderr: (error) => {
        handleStreamOutputError("stderr", error);
    },
    stdout: (error) => {
        handleStreamOutputError("stdout", error);
    },
};

/**
 * Only absorb errors reported by our own write callbacks.
 *
 * @throws The original error when an unrelated stream failure has no host
 *   listener.
 */
function handleStreamOutputError(
    stream: OutputStream,
    error: Readonly<Error>
): void {
    if (
        !streamErrors[stream].delete(error) &&
        process[stream].listenerCount("error") === 1
    )
        // eslint-disable-next-line unicorn/prefer-error-is-error -- Error.isError is unavailable on the advertised Node 22.0.0 minimum.
        throw error instanceof Error
            ? error
            : new Error("Unhandled output stream error", { cause: error });
}

/** Keep one temporary error listener while stream writes are pending. */
function writeStreamOutput(stream: OutputStream, text: string): void {
    const output = process[stream];
    const onStreamOutputError = streamErrorHandlers[stream];
    if (streamWrites[stream] === 0) output.on("error", onStreamOutputError);
    streamWrites[stream] += 1;
    const complete = (): void => {
        streamWrites[stream] -= 1;
        if (streamWrites[stream] === 0)
            output.removeListener("error", onStreamOutputError);
    };
    try {
        output.write(text, (error) => {
            // Node calls the write callback before emitting the corresponding error.
            if (error) streamErrors[stream].add(error);
            queueMicrotask(complete);
        });
    } catch {
        complete();
    }
}

/**
 * Real process boundary preserving Windows console encoding and worker capture.
 */
export const processHost: ProgressHost = {
    color: (stream) => pc.isColorSupported && Boolean(process[stream].isTTY),
    cwd: () => {
        try {
            return process.cwd();
        } catch {
            // A watched directory can disappear while an API process stays alive.
            return "";
        }
    },
    isTTY: (stream) => Boolean(process[stream].isTTY),
    now: () => performance.now(),
    onExit: (callback) => {
        process.once("exit", callback);
    },
    terminal: (stream) => {
        const { columns, rows } = process[stream];
        // A redirected stream cannot move the selected terminal's cursor, and
        // regular-file SyncWriteStreams do not expose bytesWritten.
        const stdout = process.stdout.isTTY ? process.stdout.bytesWritten : 0;
        const stderr = process.stderr.isTTY ? process.stderr.bytesWritten : 0;
        if (
            ![
                columns,
                rows,
                stdout,
                stderr,
            ].every(isSafeInteger) ||
            columns < 2 ||
            rows < 2
        )
            return undefined;
        return { columns, revision: `${stdout}:${stderr}`, rows };
    },
    write: (stream, text) => {
        // Progress must not crash linting when a downstream pipe closes.

        if (!isMainThread || process[stream].isTTY) {
            // Worker streams use message ports; numeric descriptors bypass captured output.
            // Windows terminals need Node's Unicode handling instead of raw code-page writes.
            // TTY stream writes also expose byte counts for reporter-safe redraws.
            writeStreamOutput(stream, text);
            return;
        }
        try {
            // eslint-disable-next-line n/no-sync -- Exit handlers cannot await asynchronous writes.
            writeSync(stream === "stderr" ? 2 : 1, text);
        } catch {
            /* Output is best effort. */
        }
    },
};
