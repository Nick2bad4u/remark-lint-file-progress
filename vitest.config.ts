import { createVitestConfig } from "vitest-config-nick2bad4u";
import { defineConfig } from "vitest/config";

const sharedConfig = createVitestConfig();

export default defineConfig({
    ...sharedConfig,
    test: {
        ...sharedConfig.test,
        clearMocks: true,
        coverage: {
            ...sharedConfig.test?.coverage,
            include: ["src/**/*.ts"],
            provider: "v8",
            reporter: [
                "text",
                "lcov",
                "html",
                "json-summary",
            ],
            thresholds: {
                branches: 90,
                functions: 90,
                lines: 90,
                statements: 90,
            },
        },
        environment: "node",
        hookTimeout: 30_000,
        include: ["test/**/*.test.ts"],
        restoreMocks: true,
        slowTestThreshold: 1000,
        teardownTimeout: 30_000,
        testTimeout: 30_000,
    },
});
