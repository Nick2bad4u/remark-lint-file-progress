import { writeSync } from "node:fs";
import { platform } from "node:os";
import { performance } from "node:perf_hooks";
import { isMainThread } from "node:worker_threads";
import pc from "picocolors";
import { isFinite } from "ts-extras";

import type {
    NormalizedProgressSettings,
    OutputStream,
    SpinnerStyle,
} from "../types.js";

import { formatProgress, formatSummary } from "./formatting.js";

/** Injectable process boundary for deterministic lifecycle and terminal tests. */
export interface ProgressHost {
    readonly color: (stream: OutputStream) => boolean;
    readonly cwd: () => string;
    readonly isTTY: (stream: OutputStream) => boolean;
    readonly now: () => number;
    readonly onExit: (callback: (code: number) => void) => void;
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
    #finished = false;
    readonly #host: ProgressHost;
    #rendered = -Infinity;
    #settings: NormalizedProgressSettings | undefined;
    #started = 0;

    public constructor(host: ProgressHost) {
        this.#host = host;
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
        )
            return;
        const text = formatSummary(
            {
                durationMs: Math.max(0, this.#host.now() - this.#started),
                exitCode: code,
                filesObserved: this.#count,
            },
            settings,
            this.#host.color(settings.outputStream)
        );
        this.#host.write(settings.outputStream, `${text}\n`, true);
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
        // File-driven frames leave a complete line: no timer can overwrite remark's reporter.
        this.#host.write(settings.outputStream, `${frame}${text}\n`, false);
    }

    #canShow(settings: Readonly<NormalizedProgressSettings>): boolean {
        return (
            this.#count >= settings.minFilesBeforeShow &&
            (!settings.ttyOnly || this.#host.isTTY(settings.outputStream))
        );
    }
}

const streamWrites: Record<OutputStream, number> = { stderr: 0, stdout: 0 };
const onStreamOutputError = (): void => {
    /* Output is best effort. */
};

/** Keep one temporary error listener while stream writes are pending. */
function writeStreamOutput(stream: OutputStream, text: string): void {
    const output = process[stream];
    if (streamWrites[stream] === 0) output.on("error", onStreamOutputError);
    streamWrites[stream] += 1;
    const complete = (): void => {
        streamWrites[stream] -= 1;
        if (streamWrites[stream] === 0)
            output.removeListener("error", onStreamOutputError);
    };
    try {
        output.write(text, () => {
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
    write: (stream, text) => {
        // Progress must not crash linting when a downstream pipe closes.

        if (
            !isMainThread ||
            (platform() === "win32" && process[stream].isTTY)
        ) {
            // Worker streams use message ports; numeric descriptors bypass captured output.
            // Windows terminals need Node's Unicode and ANSI console handling;
            // raw descriptor writes use the console code page and corrupt UTF-8.
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
