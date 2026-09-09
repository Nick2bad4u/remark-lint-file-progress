import { remark } from "remark";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it, vi } from "vitest";

import type { ProgressSettings, SpinnerStyle } from "../src/types.js";

import {
    ProgressController,
    type ProgressHost,
} from "../src/_internal/controller.js";
import {
    formatProgress,
    formatSummary,
    relativePath,
    safeText,
} from "../src/_internal/formatting.js";
import {
    defaultSettings,
    normalizeSettings,
    validateSettings,
} from "../src/_internal/options.js";
import plugin, { configNames, configs, meta } from "../src/plugin.js";

describe("native remark contract", () => {
    it("snapshots accessor-backed options before validation and normalization", () => {
        expect.hasAssertions();

        let reads = 0;
        const settings = validateSettings({
            get outputStream() {
                reads += 1;
                return reads === 1 ? "stderr" : "invalid";
            },
        });

        expect(settings.outputStream).toBe("stderr");
        expect(reads).toBe(1);
    });

    it("reuses the canonical attacher when the module is evaluated again", async () => {
        expect.hasAssertions();

        vi.resetModules();
        const reloaded = await import("../src/plugin.js");

        expect(reloaded.default).toBe(plugin);
        expect(reloaded.configs).toBe(configs);
        expect(reloaded.meta).toBe(meta);
    });

    it("exports a callable plugin and seven unified presets", () => {
        expect.hasAssertions();
        expect(plugin).toBeTypeOf("function");
        expect(plugin.name).toBe("remarkLintFileProgress");
        expect(meta.name).toBe("remark-lint-file-progress");
        expect(Object.keys(configs)).toStrictEqual(configNames);
        expect(plugin.configs).toBe(configs);

        for (const preset of Object.values(configs)) {
            expect(preset.plugins?.[0]).toStrictEqual([
                plugin,
                expect.any(Object),
            ]);
        }
    });

    it.each([
        "on",
        0,
        [],
        new URL("https://example.com"),
        { mode: "invalid" },
        { unknownOption: true },
        { throttleMs: -1 },
        { throttleMs: Infinity },
        { throttleMs: 1.5 },
        { minFilesBeforeShow: Number.MAX_SAFE_INTEGER + 1 },
        { successMark: " " },
        { ttyOnly: "true" },
        { mode: null },
    ])("rejects invalid settings %j without messages", (options) => {
        expect.hasAssertions();
        expect(() => validateSettings(options)).toThrow(TypeError);
        expect(() => validateSettings(options)).toThrow(
            "remark-lint-file-progress:"
        );
    });

    it("accepts native activation and null defaults", () => {
        expect.hasAssertions();

        for (const options of [
            null,
            undefined,
            true,
        ]) {
            expect(validateSettings(options)).toStrictEqual(defaultSettings);
        }

        expect(plugin.call(unified(), false)).toBeUndefined();
        expect(validateSettings(Object.create(null))).toStrictEqual(
            defaultSettings
        );
    });

    it("observes repeated VFiles once per run without changing trees or messages", async () => {
        expect.hasAssertions();

        const observe = vi
            .spyOn(ProgressController.prototype, "observe")
            .mockReturnValue(undefined);
        const file = new VFile({ path: "README.md", value: "# Title\n" });
        file.message("Existing warning");
        const processor = remark().use(plugin, { hide: true });
        const tree = processor.parse(file);
        const before = structuredClone(tree);
        const messages = [...file.messages];

        await expect(processor.run(tree, file)).resolves.toBe(tree);
        expect(processor.runSync(tree, file)).toBe(tree);

        await Promise.all([processor.process(file), processor.process(file)]);

        expect(observe).toHaveBeenCalledTimes(4);
        expect(observe).toHaveBeenLastCalledWith(
            "README.md",
            normalizeSettings({ hide: true })
        );
        expect(tree).toStrictEqual(before);
        expect(file.messages).toStrictEqual(messages);
        expect(String(file)).toBe("# Title\n");
    });

    it("merges repeated registrations and snapshots each processor's settings", async () => {
        expect.hasAssertions();

        const observe = vi
            .spyOn(ProgressController.prototype, "observe")
            .mockReturnValue(undefined);
        const processor = remark()
            .use(plugin, { hide: true })
            .use(plugin, { mode: "compact" });
        await processor.process("# Title\n");
        await processor().use(plugin, { mode: "file" }).process("# Child\n");
        await processor.process("# Original\n");

        expect(observe.mock.calls.map((call) => call[1].mode)).toStrictEqual([
            "compact",
            "file",
            "compact",
        ]);
        expect(observe.mock.calls.map((call) => call[0])).toStrictEqual([
            "<input>",
            "<input>",
            "<input>",
        ]);
    });

    it("keeps disabled and unused processors quiet", () => {
        expect.hasAssertions();

        const observe = vi.spyOn(ProgressController.prototype, "observe");
        const configured = remark().use(plugin);
        configured.freeze();
        const disabled = remark().use(plugin, false).processSync("# Title\n");

        expect(observe).not.toHaveBeenCalled();
        expect(String(disabled)).toBe("# Title\n");
        expect(disabled.messages).toStrictEqual([]);
    });
});

function harness(isTTY = false, useColor = false) {
    let now = 0;
    const write = vi.fn<ProgressHost["write"]>();
    const onExit = vi.fn<ProgressHost["onExit"]>();
    const host: ProgressHost = {
        color: () => useColor,
        cwd: () => "/project",
        isTTY: () => isTTY,
        now: () => now,
        onExit,
        terminal: () => ({ columns: 80, revision: "0", rows: 24 }),
        write,
    };
    return {
        advance: (ms: number) => {
            now += ms;
        },
        controller: new ProgressController(host),
        onExit,
        write,
    };
}

describe("observational progress", () => {
    it("does nothing until the first file and counts repeated processing events", () => {
        expect.hasAssertions();

        const h = harness();

        expect(h.write).not.toHaveBeenCalled();
        expect(h.onExit).not.toHaveBeenCalled();

        h.controller.observe("/project/a.md", { ...defaultSettings });
        h.controller.observe("/project/a.md", { ...defaultSettings });
        h.controller.observe(
            "/project/a.md",
            normalizeSettings({ detailedSuccess: true })
        );

        expect(h.onExit).toHaveBeenCalledTimes(1);
        expect(h.write).toHaveBeenCalledTimes(3);

        h.advance(2000);
        h.onExit.mock.calls[0]?.[0](0);

        expect(h.write.mock.calls.at(-1)?.[1]).toContain("Files observed: 3");
        expect(h.write.mock.calls.at(-1)?.[1]).toContain("1.50 files/s");

        h.controller.finish(2);
        h.controller.observe("b.md", { ...defaultSettings });

        expect(h.write).toHaveBeenCalledTimes(4);
    });

    it("never claims a problem count from exit status", () => {
        expect.hasAssertions();

        for (const exitCode of [0, 2]) {
            const h = harness();
            h.controller.observe(
                "a.md",
                normalizeSettings({ detailedSuccess: true })
            );
            h.controller.finish(exitCode);
            const summary = h.write.mock.calls.at(-1)?.[1];

            expect(summary).toContain(`Process exit code: ${exitCode}`);
            expect(summary).not.toContain("Problems:");
        }
    });

    it.each<ProgressSettings>([
        { hide: true },
        { ttyOnly: true },
        { minFilesBeforeShow: 3 },
    ])("suppresses output for %j", (settings) => {
        expect.hasAssertions();

        const h = harness();
        h.controller.observe("a.md", normalizeSettings(settings));
        h.controller.finish(0);

        expect(h.write).not.toHaveBeenCalled();
    });

    it("supports hidden summaries, summary-only mode, and last-file settings", () => {
        expect.hasAssertions();

        for (const settings of [
            { hide: true, showSummaryWhenHidden: true },
            { mode: "summary-only" as const },
        ]) {
            const h = harness();
            h.controller.observe("a.md", normalizeSettings(settings));

            expect(h.write).not.toHaveBeenCalled();

            h.controller.finish(0);

            expect(h.write).toHaveBeenCalledTimes(1);
        }
        const h = harness();
        h.controller.observe(
            "a.md",
            normalizeSettings({ outputStream: "stdout" })
        );
        h.controller.observe("b.md", normalizeSettings({ hide: true }));
        h.controller.finish(0);

        expect(h.write.mock.calls).toMatchObject([
            [
                "stdout",
                expect.stringContaining("a.md"),
                false,
            ],
        ]);
    });

    it("counts throttled files and waits for the minimum count", () => {
        expect.hasAssertions();

        const h = harness();
        const settings = normalizeSettings({
            detailedSuccess: true,
            minFilesBeforeShow: 2,
            throttleMs: 100,
        });
        h.controller.observe("a.md", settings);
        h.controller.observe("b.md", settings);
        h.advance(20);
        h.controller.observe("c.md", settings);
        h.advance(100);
        h.controller.observe("d.md", settings);
        h.controller.finish(0);

        expect(h.write).toHaveBeenCalledTimes(3);
        expect(h.write.mock.calls.at(-1)?.[1]).toContain("Files observed: 4");
    });

    it.each<ProgressSettings>([{ mode: "compact" }, { hideFileName: true }])(
        "only announces generic activity once for %j",
        (settings) => {
            expect.hasAssertions();

            const h = harness();
            h.controller.observe("a.md", normalizeSettings(settings));
            h.controller.observe("b.md", normalizeSettings(settings));

            expect(h.write).toHaveBeenCalledTimes(1);
            expect(h.write.mock.calls[0]?.[1]).toContain(
                "linting project files..."
            );
        }
    );

    it.each<SpinnerStyle>([
        "arc",
        "bounce",
        "clock",
        "dots",
        "line",
    ])("renders %s frames only on a terminal", (spinnerStyle) => {
        expect.hasAssertions();

        const h = harness(true, true);
        h.controller.observe(
            "a.md",
            normalizeSettings({ spinnerStyle, ttyOnly: true })
        );
        h.controller.finish(0);

        expect(h.write.mock.calls[0]?.[1]).toContain("\u{1B}[");
        expect(h.write.mock.calls[0]?.[1]).toMatch(/\n$/v);
    });

    // eslint-disable-next-line test-signal/no-mock-call-only-tests -- Absence of output is the lifecycle contract before the first file.
    it("handles finishing before any files", () => {
        expect.hasAssertions();

        const h = harness();
        h.controller.finish(0);

        expect(h.write).not.toHaveBeenCalled();
    });
});

describe("formatting and settings", () => {
    it("retains the supplied path when the working directory is unavailable", () => {
        expect.hasAssertions();
        expect(relativePath("/removed/project/styles.md", "")).toBe(
            "/removed/project/styles.md"
        );
    });

    it("resolves defaults and deprecated alias precedence", () => {
        expect.hasAssertions();

        expect(normalizeSettings()).toStrictEqual(defaultSettings);
        expect(normalizeSettings({ hideDirectoryNames: true }).pathFormat).toBe(
            "basename"
        );
        expect(
            normalizeSettings({
                hideDirectoryNames: true,
                pathFormat: "relative",
            }).pathFormat
        ).toBe("relative");
    });

    it.each([
        [
            "/project/a.md",
            "/project",
            "a.md",
        ],
        [
            "a.md",
            "/project",
            "a.md",
        ],
        [
            "<input>",
            "/project",
            "<input>",
        ],
        [
            String.raw`C:\project\a.md`,
            String.raw`C:\project`,
            "a.md",
        ],
        [
            "/project/a.md",
            "/project/a.md",
            "a.md",
        ],
    ])("normalizes %s", (file, cwd, expected) => {
        expect.hasAssertions();
        expect(relativePath(file, cwd)).toBe(expected);
    });

    it("preserves POSIX backslashes and escapes C1 terminal controls", () => {
        expect.hasAssertions();

        const options = normalizeSettings({ pathFormat: "basename" });

        expect(
            formatProgress(String.raw`/project/foo\bar.md`, options, false)
        ).toBe(String.raw`RFP • linting foo\bar.md`);
        expect(
            formatProgress(String.raw`C:\project\bar.md`, options, false)
        ).toBe("RFP • linting bar.md");
        expect(safeText("a\u{85}b\u{9F}c\u{7F}")).toBe(
            String.raw`a\u0085b\u009fc\u007f`
        );
    });

    it("formats path, prefixes, multiline layouts, generic notices, and control characters", () => {
        expect.hasAssertions();

        expect(
            formatProgress(
                "src/a.md",
                normalizeSettings({ pathFormat: "basename" }),
                false
            )
        ).toBe("RFP • linting a.md");
        expect(
            formatProgress(
                "src/a.md",
                normalizeSettings({ fileNameOnNewLine: true }),
                false
            )
        ).toContain("\n  ↳ src/a.md");
        expect(
            formatProgress(
                "a.md",
                normalizeSettings({ hidePrefix: true }),
                false
            )
        ).toBe("a.md");
        expect(
            formatProgress(
                "a.md",
                normalizeSettings({ hidePrefix: true, mode: "compact" }),
                false
            )
        ).toBe("linting project files...");
        expect(safeText("a\n\u{1B}[31mb.md")).toBe(String.raw`a\nb.md`);
        expect(safeText("\u{1B}[31mred")).not.toContain("\u{1B}");
        expect(
            formatSummary(
                { durationMs: 0, exitCode: 0, filesObserved: 1 },
                normalizeSettings({
                    detailedSuccess: true,
                    hidePrefix: true,
                    successMark: "+",
                    successMessage: "Done",
                }),
                false
            )
        ).toContain("+ Done");
        expect(
            formatSummary(
                { durationMs: 0, exitCode: 1, filesObserved: 1 },
                normalizeSettings({ failureMark: "!" }),
                true
            )
        ).toContain("Process exited");
    });
});
