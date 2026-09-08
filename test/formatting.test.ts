import * as path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { describe, expect, it } from "vitest";

import { formatProgress, formatSummary } from "../src/_internal/formatting.js";
import { normalizeSettings } from "../src/_internal/options.js";

describe("eslint presentation parity", () => {
    it.each([
        [
            path.join(
                "src",
                "content",
                "guides",
                "reference",
                "api",
                "examples",
                "frontmatter.test.md"
            ),
            "",
            path.sep,
        ],
        [
            "/project/src/content/guides/reference/api/examples/frontmatter.test.md",
            "/project",
            "/",
        ],
        [
            String.raw`C:\project\src\content\guides\reference\api\examples\frontmatter.test.md`,
            String.raw`C:\project`,
            "\\",
        ],
    ])(
        "cycles directory colors for %s and separates filename emphasis",
        (filename, cwd, separator) => {
            expect.hasAssertions();

            const options = normalizeSettings();
            const output = formatProgress(filename, options, true, cwd);

            for (const [segment, code] of [
                ["api", 33],
                ["content", 36],
                ["examples", 34],
                ["guides", 32],
                ["reference", 35],
                ["src", 34],
            ] as const) {
                expect(output).toContain(
                    `\u{1B}[1m\u{1B}[${code}m${segment}\u{1B}[39m\u{1B}[22m`
                );
            }

            expect(output).toContain(`\u{1B}[2m${separator}\u{1B}[22m`);
            expect(output).toContain(
                "\u{1B}[1m\u{1B}[32mfrontmatter.test\u{1B}[39m\u{1B}[22m\u{1B}[32m.md\u{1B}[39m"
            );
            expect(output).toContain(
                "\u{1B}[1m\u{1B}[36mRFP\u{1B}[39m\u{1B}[22m \u{1B}[2m•\u{1B}[22m \u{1B}[2mlinting\u{1B}[22m"
            );
            expect(stripVTControlCharacters(output)).toBe(
                formatProgress(filename, options, false, cwd)
            );
            expect(formatProgress(filename, options, false, cwd)).not.toContain(
                "\u{1B}"
            );
        }
    );

    it.each([
        "README",
        ".remarkrc",
        "<input>",
    ])("keeps %s entirely bold green", (filename) => {
        expect.hasAssertions();
        expect(
            formatProgress(
                filename,
                normalizeSettings({ hidePrefix: true }),
                true
            )
        ).toBe(`\u{1B}[1m\u{1B}[32m${filename}\u{1B}[39m\u{1B}[22m`);
    });

    it("preserves POSIX backslashes when making an absolute filename relative", () => {
        expect.hasAssertions();

        const output = formatProgress(
            String.raw`/project/foo\bar.md`,
            normalizeSettings({ hidePrefix: true }),
            true,
            "/project"
        );

        expect(output).toBe(
            "\u{1B}[1m\u{1B}[32mfoo\\bar\u{1B}[39m\u{1B}[22m\u{1B}[32m.md\u{1B}[39m"
        );
        expect(stripVTControlCharacters(output)).toBe(String.raw`foo\bar.md`);
    });

    it.each([
        "/docs/guide.md",
        String.raw`\\server\share\guide.md`,
        "src//guide.md",
        "/",
        "",
    ])("preserves separators and roots in %s", (filename) => {
        expect.hasAssertions();

        const output = formatProgress(
            filename,
            normalizeSettings({ hidePrefix: true }),
            true
        );

        expect(stripVTControlCharacters(output)).toBe(filename);
    });

    it("dims the multiline arrow and omits directory colors in basename mode", () => {
        expect.hasAssertions();

        const output = formatProgress(
            "src/guide.md",
            normalizeSettings({
                fileNameOnNewLine: true,
                pathFormat: "basename",
                prefixMark: "→",
            }),
            true
        );

        expect(output).toContain("\u{1B}[2m→\u{1B}[22m");
        expect(output).toContain(
            "\n\u{1B}[2m  ↳\u{1B}[22m \u{1B}[1m\u{1B}[32mguide"
        );
        expect(output).not.toContain("\u{1B}[34m");
        expect(stripVTControlCharacters(output)).toBe(
            "RFP → linting\n  ↳ guide.md"
        );
    });

    it("dims generic notices without exposing filenames or hidden prefixes", () => {
        expect.hasAssertions();
        expect(
            formatProgress(
                "private.md",
                normalizeSettings({ hidePrefix: true, mode: "compact" }),
                true
            )
        ).toBe("\u{1B}[2mlinting project files...\u{1B}[22m");

        const output = formatProgress(
            "private.md",
            normalizeSettings({ hideFileName: true }),
            true
        );

        expect(output).toContain("\u{1B}[2mlinting project files...\u{1B}[22m");
        expect(output).not.toContain("private");
    });

    it("escapes filename controls before applying its own colors", () => {
        expect.hasAssertions();

        const output = formatProgress(
            "/project/evil\u{1B}[31m/first\nsecond.md",
            normalizeSettings({ hidePrefix: true }),
            true,
            "/project"
        );

        expect(output).not.toContain("\u{1B}[31m");
        expect(output).not.toContain("\n");
        expect(stripVTControlCharacters(output)).toBe(
            String.raw`evil/first\nsecond.md`
        );
    });

    it.each([
        [
            "foo/\u{1B}]8;;https://x/y\u{7}bar.md",
            "",
            "foo/bar.md",
        ],
        [
            "/project/foo/\u{1B}]8;;https://x/y\u{7}bar.md",
            "/project",
            "foo/bar.md",
        ],
        [
            "C:\\project\\foo\\\u{1B}]8;;https://x/y\u{7}bar.md",
            String.raw`C:\project`,
            String.raw`foo\bar.md`,
        ],
    ])(
        "strips complete control sequences before parsing %s",
        (filename, cwd, expected) => {
            expect.hasAssertions();

            const options = normalizeSettings({ hidePrefix: true });
            const basenameOptions = normalizeSettings({
                hidePrefix: true,
                pathFormat: "basename",
            });

            expect(
                stripVTControlCharacters(
                    formatProgress(filename, options, true, cwd)
                )
            ).toBe(expected);
            expect(formatProgress(filename, options, false, cwd)).toBe(
                expected
            );
            expect(
                stripVTControlCharacters(
                    formatProgress(filename, basenameOptions, true, cwd)
                )
            ).toBe("bar.md");
        }
    );

    it.each([
        [
            0,
            32,
            "+",
        ],
        [
            2,
            31,
            "!",
        ],
    ])(
        "colors summary values for exit status %i without inventing diagnostics",
        (exitCode, code, mark) => {
            expect.hasAssertions();

            const output = formatSummary(
                { durationMs: 2500, exitCode, filesObserved: 5 },
                normalizeSettings({
                    detailedSuccess: true,
                    failureMark: "!",
                    successMark: "+",
                    successMessage: "Done",
                }),
                true
            );

            expect(output).toContain(
                "\u{1B}[1m\u{1B}[36mRFP\u{1B}[39m\u{1B}[22m\u{1B}[2m:\u{1B}[22m"
            );
            expect(output).toContain(
                `\u{1B}[1m\u{1B}[${code}m${mark}\u{1B}[39m\u{1B}[22m`
            );
            expect(output).toContain(
                "\u{1B}[2m  Files observed:\u{1B}[22m \u{1B}[33m5\u{1B}[39m"
            );
            expect(output).toContain("\u{1B}[33m2.50s\u{1B}[39m");
            expect(output).toContain("\u{1B}[33m2.00 files/s\u{1B}[39m");
            expect(output).toContain(
                `\u{1B}[2m  Process exit code:\u{1B}[22m \u{1B}[${code}m${exitCode}\u{1B}[39m`
            );
            expect(output).not.toContain("Problems:");
            expect(output).not.toContain("warnings");
        }
    );

    it.each([
        [0, "0ms"],
        [12.4, "12ms"],
        [999, "999ms"],
        [1000, "1.00s"],
    ])(
        "formats an observed duration of %i milliseconds",
        (durationMs, expected) => {
            expect.hasAssertions();

            const output = formatSummary(
                { durationMs, exitCode: 0, filesObserved: 2 },
                normalizeSettings({ detailedSuccess: true, hidePrefix: true }),
                false
            );

            expect(output).toContain(`Elapsed since first file: ${expected}`);
            expect(output).not.toContain("\u{1B}");
            expect(output).not.toContain("RFP");
        }
    );
});
