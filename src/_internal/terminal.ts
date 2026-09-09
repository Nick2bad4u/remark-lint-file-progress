import { stripVTControlCharacters } from "node:util";
import stringWidth from "string-width";
import { stringSplit } from "ts-extras";

import type { OutputStream } from "../types.js";
import type { ProgressHost } from "./controller.js";

/** Read-only terminal geometry and the combined stdout/stderr write position. */
export interface TerminalSnapshot {
    readonly columns: number;
    readonly revision: string;
    readonly rows: number;
}

interface OwnedDisplay {
    readonly height: number;
    readonly snapshot: TerminalSnapshot;
    readonly stream: OutputStream;
}

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Replace only a terminal region still owned by this controller. */
export class TerminalDisplay {
    readonly #host: ProgressHost;
    #owned: null | OwnedDisplay = null;

    public constructor(host: ProgressHost) {
        this.#host = host;
    }

    /** Relinquish ownership after other output or a terminal resize. */
    public clear(isFinal: boolean): OutputStream | undefined {
        const owned = this.#owned;
        this.#owned = null;
        if (!owned) return undefined;
        const current = this.#host.terminal(owned.stream);
        if (
            current?.columns !== owned.snapshot.columns ||
            current.rows !== owned.snapshot.rows ||
            current.revision !== owned.snapshot.revision ||
            !this.#host.isTTY(owned.stream)
        )
            return undefined;
        this.#host.write(
            owned.stream,
            "\u{1B}[1A\u{1B}[2K\r".repeat(owned.height),
            isFinal
        );
        return owned.stream;
    }

    /** End each update on a fresh line so reporters can write normally. */
    public write(stream: OutputStream, text: string, isFinal: boolean): void {
        const cleared = this.clear(isFinal);
        const isTty = this.#host.isTTY(stream);
        // A fresh region must not share a row with another writer's partial line.
        const separator = isTty && cleared !== stream ? "\n" : "";
        this.#host.write(stream, `${separator}${text}\n`, isFinal);
        const snapshot = this.#host.terminal(stream);
        if (!isTty || isFinal || !snapshot || snapshot.columns < 2) return;
        const height = displayHeight(text, snapshot.columns);
        // Scrolled-off content cannot safely be reclaimed with cursor movement.
        if (height < snapshot.rows) this.#owned = { height, snapshot, stream };
    }
}

/** Count physical rows, including wide characters that wrap before the margin. */
function displayHeight(text: string, columns: number): number {
    let height = 0;
    const lines = stringSplit(stripVTControlCharacters(text), "\n");
    for (const line of lines) {
        height += 1;
        let column = 0;
        for (const { segment } of graphemes.segment(line)) {
            const width = stringWidth(segment);
            if (column + width > columns) {
                height += 1;
                column = 0;
            }
            column += width;
        }
    }
    return height;
}
