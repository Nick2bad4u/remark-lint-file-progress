import sharedConfig from "stylelint-config-nick2bad4u";
import { defineConfig } from "stylelint-define-config";

export default defineConfig({
    ...sharedConfig,
    cache: true,
    fix: false,
    formatter: "string",
    reportDescriptionlessDisables: true,
    reportDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
    reportUnscopedDisables: true,
});
