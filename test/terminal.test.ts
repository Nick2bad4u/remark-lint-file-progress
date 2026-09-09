import { Unicode11Addon } from "@xterm/addon-unicode11";
import { Terminal } from "@xterm/headless";
import { describe, expect, it, onTestFinished } from "vitest";

import type { OutputStream, ProgressSettings } from "../src/types.js";

import { ProgressController } from "../src/_internal/controller.js";
import { normalizeSettings } from "../src/_internal/options.js";

function terminalHarness(columns = 40, rows = 24) {
    const terminal = new Terminal({
        allowProposedApi: true,
        cols: columns,
        convertEol: true,
        rows,
    });
    terminal.loadAddon(new Unicode11Addon());
    terminal.unicode.activeVersion = "11";
    onTestFinished(() => {
        terminal.dispose();
    });
    let revision = 0;
    let isTty = true;
    let isGeometry = true;
    let now = 0;
    let transcript = "";
    const write = (_stream: OutputStream, text: string): void => {
        revision += 1;
        transcript += text;
        terminal.write(text);
    };
    const controller = new ProgressController({
        color: () => true,
        cwd: () => "/project",
        isTTY: () => isTty,
        now: () => now,
        onExit: () => {
            /* Tests call finish explicitly. */
        },
        terminal: () =>
            isGeometry
                ? {
                      columns: terminal.cols,
                      revision: String(revision),
                      rows: terminal.rows,
                  }
                : undefined,
        write,
    });
    return {
        advance: () => {
            now += 100;
        },
        controller,
        disableGeometry: () => {
            isGeometry = false;
        },
        disableTTY: () => {
            isTty = false;
        },
        observe: (file: string, settings: ProgressSettings = {}) => {
            controller.observe(file, normalizeSettings(settings));
        },
        resize: (width: number, height: number) => {
            terminal.resize(width, height);
        },
        screen: async () => {
            await new Promise<void>((resolve) => {
                terminal.write("", resolve);
            });
            const lines: string[] = [];
            const buffer = terminal.buffer.active;
            for (let index = 0; index < buffer.length; index += 1) {
                const line = buffer.getLine(index);
                if (line) lines.push(line.translateToString(true));
            }
            return lines.join("\n").trim();
        },
        transcript: () => transcript,
        write,
    };
}

describe("interactive terminal rendering", () => {
    it.each([false, true])(
        "replaces successive files and the final summary (multiline: %s)",
        async (fileNameOnNewLine) => {
            expect.hasAssertions();

            const h = terminalHarness();
            h.write("stdout", "Existing command output");
            h.observe("old.md", { fileNameOnNewLine });
            h.observe("new.md", { fileNameOnNewLine });
            const live = await h.screen();

            expect(live).toContain("Existing command output");
            expect(live).toContain("new.md");
            expect(live).not.toContain("old.md");
            expect(live.match(/RFP/gv)).toHaveLength(1);

            h.controller.finish(0);
            const final = await h.screen();

            expect(final).toContain("Existing command output");
            expect(final).toContain("Lint complete.");
            expect(final).not.toContain("new.md");

            h.controller.finish(1);

            await expect(h.screen()).resolves.toBe(final);
        }
    );

    it.each([
        `${"folder/".repeat(15)}long.md`,
        `${"界".repeat(38)}/élève.md`,
        `${"a".repeat(38)}界.md`,
        `${"e\u{301}".repeat(80)}.md`,
        `${"a\u{200B}".repeat(80)}.md`,
        `${"🕛".repeat(35)}.md`,
    ])(
        "clears wrapped Unicode paths without leaving stale characters: %s",
        async (filename) => {
            expect.hasAssertions();

            const h = terminalHarness();
            h.write("stderr", "KEEP THIS LINE\n");
            h.observe(filename, { hidePrefix: true });
            h.observe("x.md", { hidePrefix: true });

            await expect(h.screen()).resolves.toBe("KEEP THIS LINE\n\n⠙ x.md");
        }
    );

    it.each(["stderr", "stdout"] as const)(
        "preserves interleaved colored %s reporter output, including a partial line",
        async (stream) => {
            expect.hasAssertions();

            const h = terminalHarness(80);
            h.observe("a.md");
            h.write(
                stream,
                "\u{1B}[33mWarning: keep this diagnostic\u{1B}[39m"
            );
            h.observe("b.md");
            h.observe("c.md");
            h.write(stream, "\u{1B}[31mFatal: keep this too\u{1B}[39m\n");
            h.controller.finish(1);
            const screen = await h.screen();

            expect(screen).toContain("Warning: keep this diagnostic");
            expect(screen).toContain("Fatal: keep this too");
            expect(screen).toContain("Process exited with status 1.");
            expect(screen).not.toContain("b.md");
            expect(h.transcript()).toContain("\u{1B}[33mWarning:");
        }
    );

    it.each([
        {
            change: (h: ReturnType<typeof terminalHarness>) => {
                h.resize(60, 24);
            },
            name: "resize",
            rows: 24,
        },
        {
            change: (h: ReturnType<typeof terminalHarness>) => {
                h.disableGeometry();
            },
            name: "missing geometry",
            rows: 24,
        },
        {
            change: (h: ReturnType<typeof terminalHarness>) => {
                h.disableTTY();
            },
            name: "lost TTY",
            rows: 24,
        },
        {
            change: (_h: ReturnType<typeof terminalHarness>) => {
                /* Already taller than the viewport. */
            },
            name: "too tall",
            rows: 3,
        },
    ])("abandons redraw ownership after $name", async ({ change, rows }) => {
        expect.hasAssertions();

        const h = terminalHarness(40, rows);
        h.observe(`old-${"a".repeat(100)}.md`);
        await h.screen();
        change(h);
        h.observe("new.md");

        expect(h.transcript()).not.toContain("\u{1B}[2K");
        await expect(h.screen()).resolves.toContain("new.md");
    });

    it("keeps redirected output free of cursor controls", async () => {
        expect.hasAssertions();

        const h = terminalHarness();
        h.disableTTY();
        h.observe("first.md");
        h.observe("second.md");
        h.controller.finish(0);

        expect(h.transcript()).not.toContain("\u{1B}[2K");
        await expect(h.screen()).resolves.toContain(
            "first.md\nRFP • linting second.md"
        );
    });

    it.each<ProgressSettings>([{ mode: "compact" }, { hideFileName: true }])(
        "advances generic activity frames in a TTY: %j",
        async (settings) => {
            expect.hasAssertions();

            const h = terminalHarness();
            h.observe("a.md", settings);
            const first = await h.screen();
            h.observe("b.md", settings);
            const second = await h.screen();

            expect(first).toContain("⠋");
            expect(second).toContain("⠙");
            expect(second.match(/linting project files/gv)).toHaveLength(1);
        }
    );

    it("counts throttled files and removes owned progress when the final settings hide the summary", async () => {
        expect.hasAssertions();

        const h = terminalHarness();
        h.observe("a.md", { throttleMs: 100 });
        h.observe("b.md", { throttleMs: 100 });

        await expect(h.screen()).resolves.toContain("a.md");

        h.advance();
        h.observe("c.md", { throttleMs: 100 });

        await expect(h.screen()).resolves.toContain("⠹");

        h.observe("d.md", { hide: true });
        h.controller.finish(0);

        await expect(h.screen()).resolves.toBe("");
    });

    it("clears the old stream before switching to another stream", async () => {
        expect.hasAssertions();

        const h = terminalHarness();
        h.observe("a.md");
        h.observe("b.md", { outputStream: "stdout" });
        const screen = await h.screen();

        expect(screen).not.toContain("a.md");
        expect(screen).toContain("b.md");
    });
});
