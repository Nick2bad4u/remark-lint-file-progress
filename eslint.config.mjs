import nick2bad4u from "eslint-config-nick2bad4u";

const config = [
    {
        ignores: [
            "dist/**",
            "coverage/**",
            ".temp/**",
            ".playwright-cli/**",
            "output/playwright/**",
            "reports/**",
            ".lychee.report.md",
            ".lycheecache",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/site-docs/developer/api/**",
            "docs/docusaurus/static/*-inspector/**",
        ],
    },
    ...nick2bad4u.configs.all,
    {
        files: ["docs/docusaurus/src/pages/index.tsx"],
        name: "Docusaurus requires an index page to serve the documentation homepage at the site root",
        rules: { "canonical/filename-no-index": "off" },
    },
    {
        files: [
            "docs/docusaurus/docusaurus.config.ts",
            "docs/docusaurus/sidebars.ts",
            "docs/docusaurus/src/pages/index.tsx",
        ],
        name: "The generated JSON catalog is imported with the explicit extension required by native ESM import attributes",
        rules: {
            "import-x/extensions": [
                "error",
                "ignorePackages",
                { json: "always" },
            ],
        },
    },
    {
        files: ["package.json"],
        name: "Accurate Unicode widths protect reporter rows; fast-string-width 3.0.2 counts zero-width characters as cells (test/terminal.test.ts)",
        rules: {
            "depend/ban-dependencies": ["error", { allowed: ["string-width"] }],
        },
    },
    {
        files: ["src/plugin.ts", "src/types.ts"],
        name: "Public declarations stay self-contained instead of imposing type-fest's ES2025 library globals on consumers",
        rules: {
            "typefest/prefer-type-fest-array-values": "off",
            "typefest/prefer-type-fest-except": "off",
        },
    },
    {
        files: ["src/_internal/controller.ts", "test/process-host.test.ts"],
        name: "Node types declare isTTY as boolean but pipe-backed process streams omit it at runtime",
        rules: {
            "@typescript-eslint/no-unnecessary-type-conversion": "off",
            "unicorn/no-useless-coercion": "off",
        },
    },
    {
        files: ["src/plugin.ts"],
        name: "The public package boundary exports native plugin and option types and attaches static metadata to a function",
        rules: {
            "canonical/no-re-export": "off",
            "no-barrel-files/no-barrel-files": "off",
            "typefest/prefer-ts-extras-object-assign": "off",
        },
    },
    {
        files: ["src/_internal/controller.ts"],
        name: "Prefer the shared class grouping over the conflicting private-method order",
        rules: { "unicorn/consistent-class-member-order": "off" },
    },
    {
        files: ["stylelint.config.mjs"],
        name: "Check commands must never apply fixes; all rules come from the published shared config",
        rules: {
            "stylelint-2/prefer-stylelint-fix": "off",
            "stylelint-2/require-stylelint-rules-object": "off",
        },
    },

    {
        files: ["*.mjs"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                projectService: false,
                tsconfigRootDir: process.cwd(),
            },
        },
        name: "Repository config files belong to the explicit tooling project",
    },
    {
        files: ["eslint.config.mjs"],
        name: "No secret-scanning exclusions; CODEOWNERS supplies dependency review ownership",
        rules: {
            "repo-compliance/require-dependabot-reviewers": "off",
            "repo-compliance/require-secret-scanning-config": "off",
        },
    },
    {
        files: ["docs/docusaurus/package.json"],
        name: "The private docs app is not a published plugin with peer dependencies",
        rules: {
            "package-json/require-peerDependencies": "off",
            "package-json/require-peerDependenciesMeta": "off",
        },
    },
];
export default config;
