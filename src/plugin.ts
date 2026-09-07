import type { Root } from "mdast";
import type { Plugin, Preset, Transformer } from "unified";

import { safeCastTo } from "ts-extras";

import type { ProgressSettings } from "./types.js";

import { processHost, ProgressController } from "./_internal/controller.js";
import { validateSettings } from "./_internal/options.js";

/** Available configuration subpaths. */
export const configNames = [
    "recommended",
    "recommended-ci",
    "recommended-ci-detailed",
    "recommended-compact",
    "recommended-detailed",
    "recommended-summary-only",
    "recommended-tty",
] as const;

/** A native unified preset that enables progress. */
export type FileProgressConfig = Preset;
/** Public preset names. */
export type FileProgressConfigName = (typeof configNames)[number];
/** Static identity of the published plugin. */
export interface FileProgressMetadata {
    /** Published npm package name. */
    readonly name: "remark-lint-file-progress";
    /** Progress feature namespace. */
    readonly namespace: "file-progress";
    /** Package version, checked against package.json. */
    readonly version: string;
}

/** Callable unified plugin with discoverable metadata and presets. */
export type FileProgressPlugin = Plugin<
    [options?: ProgressPluginOptions],
    Root
> & {
    /** Seven native unified presets keyed by public configuration name. */
    readonly configs: Record<FileProgressConfigName, FileProgressConfig>;
    /** Package identity and build version. */
    readonly meta: FileProgressMetadata;
};

/** Display settings, default activation, or explicit deactivation. */
export type ProgressPluginOptions =
    | boolean
    | null
    | Readonly<ProgressSettings>;

const version = "0.1.0";
const registryKey = Symbol.for(
    `remark-lint-file-progress.registry.v1@${version}`
);
const registryHost = safeCastTo<
    typeof globalThis & {
        [registryKey]?: {
            controller?: ProgressController;
            plugin?: FileProgressPlugin;
        };
    }
>(globalThis);
// Both module formats register the same function with unified, which deduplicates attachers.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The process registry is absent before either module format is imported.
registryHost[registryKey] ??= {};
const registry = registryHost[registryKey];

/** Create metadata and presets once without installing process listeners. */
function createPlugin(): FileProgressPlugin {
    // eslint-disable-next-line n/no-process-env -- CI-aware presets intentionally resolve the standard CI environment flag.
    const isCi = process.env.CI === "true";
    const options: Record<FileProgressConfigName, ProgressSettings> = {
        recommended: {},
        "recommended-ci": { hide: isCi },
        "recommended-ci-detailed": {
            detailedSuccess: true,
            hide: isCi,
            showSummaryWhenHidden: isCi,
        },
        "recommended-compact": { mode: "compact" },
        "recommended-detailed": { detailedSuccess: true },
        "recommended-summary-only": { mode: "summary-only" },
        "recommended-tty": { ttyOnly: true },
    };
    const makeConfig = (name: FileProgressConfigName): FileProgressConfig => ({
        plugins: [[remarkLintFileProgress, options[name]]],
    });
    return Object.assign(remarkLintFileProgress, {
        configs: {
            recommended: makeConfig("recommended"),
            "recommended-ci": makeConfig("recommended-ci"),
            "recommended-ci-detailed": makeConfig("recommended-ci-detailed"),
            "recommended-compact": makeConfig("recommended-compact"),
            "recommended-detailed": makeConfig("recommended-detailed"),
            "recommended-summary-only": makeConfig("recommended-summary-only"),
            "recommended-tty": makeConfig("recommended-tty"),
        },
        meta: {
            name: "remark-lint-file-progress" as const,
            namespace: "file-progress" as const,
            version,
        },
    });
}

/** Observe each transformer execution without changing its tree or file. */
function remarkLintFileProgress(
    options?: ProgressPluginOptions
): Transformer<Root> | undefined {
    if (options === false) return undefined;
    const settings = validateSettings(options);
    return (_tree, file) => {
        registry.controller ??= new ProgressController(processHost);
        registry.controller.observe(file.path || "<input>", settings);
    };
}

registry.plugin ??= createPlugin();
/** Native remark plugin; importing it does not start reporting. */
const plugin: FileProgressPlugin = registry.plugin;
/** Static package identity shared by both module formats. */
export const meta: FileProgressMetadata = plugin.meta;
/** Seven shareable configurations; importing one does not start reporting. */
export const configs: Record<FileProgressConfigName, FileProgressConfig> =
    plugin.configs;

export type {
    OutputStream,
    ProgressMode,
    ProgressPathFormat,
    ProgressRuleOptions,
    ProgressSettings,
    SpinnerStyle,
} from "./types.js";
export default plugin;
