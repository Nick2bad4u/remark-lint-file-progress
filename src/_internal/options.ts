import type { UnknownRecord } from "type-fest";

import {
    isDefined,
    isPresent,
    isSafeInteger,
    objectAssign,
    objectEntries,
    objectKeys,
} from "ts-extras";

import type { NormalizedProgressSettings, ProgressSettings } from "../types.js";

/** Defaults shared with the ESLint progress display. */
export const defaultSettings: Readonly<NormalizedProgressSettings> =
    Object.freeze({
        detailedSuccess: false,
        failureMark: "✖",
        fileNameOnNewLine: false,
        hide: false,
        hideFileName: false,
        hidePrefix: false,
        minFilesBeforeShow: 0,
        mode: "file",
        outputStream: "stderr",
        pathFormat: "relative",
        prefixMark: "•",
        showSummaryWhenHidden: false,
        spinnerStyle: "dots",
        successMark: "✔",
        successMessage: "Lint complete.",
        throttleMs: 0,
        ttyOnly: false,
    });

const isCount = (value: unknown): boolean =>
    typeof value === "number" && isSafeInteger(value) && value >= 0;
const isText = (value: unknown): boolean =>
    typeof value === "string" && value.trim().length > 0;

/** Accepted values for every public display option. */
export const possibleOptions: Record<
    keyof ProgressSettings,
    (
        | ((value: unknown) => boolean)
        | boolean
        | string
    )[]
> = {
    detailedSuccess: [true, false],
    failureMark: [isText],
    fileNameOnNewLine: [true, false],
    hide: [true, false],
    hideDirectoryNames: [true, false],
    hideFileName: [true, false],
    hidePrefix: [true, false],
    minFilesBeforeShow: [isCount],
    mode: [
        "compact",
        "file",
        "summary-only",
    ],
    outputStream: ["stderr", "stdout"],
    pathFormat: ["basename", "relative"],
    prefixMark: [isText],
    showSummaryWhenHidden: [true, false],
    spinnerStyle: [
        "arc",
        "bounce",
        "clock",
        "dots",
        "line",
    ],
    successMark: [isText],
    successMessage: [isText],
    throttleMs: [isCount],
    ttyOnly: [true, false],
};

/** Resolve already validated options, including the legacy path alias. */
export function normalizeSettings(
    options: Readonly<ProgressSettings> = {}
): NormalizedProgressSettings {
    const resolved = { ...defaultSettings };
    for (const key of objectKeys(defaultSettings)) {
        const value = options[key];
        if (isDefined(value)) objectAssign(resolved, { [key]: value });
    }

    // eslint-disable-next-line sonarjs/deprecation, @typescript-eslint/no-deprecated -- Read the supported deprecated alias at the normalization boundary.
    const isLegacyBasename = options.hideDirectoryNames === true;
    resolved.pathFormat =
        options.pathFormat ?? (isLegacyBasename ? "basename" : "relative");
    return resolved;
}

/**
 * Validate configuration before observing files; never emit lint diagnostics.
 *
 * @throws TypeError when display settings are invalid.
 */
export function validateSettings(options: unknown): NormalizedProgressSettings {
    if (options === true || !isPresent(options)) return normalizeSettings();
    if (typeof options !== "object" || !isSettingsRecord(options))
        throw new TypeError(
            "remark-lint-file-progress: expected a display settings object, true, false, or null"
        );

    // Accessors are evaluated once so normalization cannot read unvalidated values.
    const snapshot = { ...options };
    for (const [name, value] of objectEntries(snapshot)) {
        const key = objectKeys(possibleOptions).find(
            (candidate) => candidate === name
        );
        if (
            !isDefined(key) ||
            possibleOptions[key].every(
                (validator) =>
                    !(typeof validator === "function"
                        ? validator(value)
                        : validator === value)
            )
        )
            throw new TypeError(
                `remark-lint-file-progress: invalid option ${name}`
            );
    }
    return normalizeSettings(snapshot);
}

/** Accept ordinary option records and records without a prototype. */
function isSettingsRecord(value: object): value is UnknownRecord {
    return (
        !Array.isArray(value) &&
        (Object.getPrototypeOf(value) === Object.prototype ||
            Object.getPrototypeOf(value) === null)
    );
}
