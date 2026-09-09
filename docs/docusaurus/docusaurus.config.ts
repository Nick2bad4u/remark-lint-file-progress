import type { Config } from "@docusaurus/types";

import project from "./src/data/project.json" with { type: "json" };

const config = {
    baseUrl: "/remark-lint-file-progress/",
    baseUrlIssueBanner: true,
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.svg",
    markdown: { format: "detect", hooks: { onBrokenMarkdownLinks: "throw" } },
    onBrokenAnchors: "throw",
    onBrokenLinks: "throw",
    onDuplicateRoutes: "throw",
    organizationName: "Nick2bad4u",
    plugins: [
        [
            "@docusaurus/plugin-pwa",
            {
                // eslint-disable-next-line n/no-process-env -- PWA debug is an explicit build-time opt-in.
                debug: process.env.DOCUSAURUS_PWA_DEBUG === "true",
                offlineModeActivationStrategies: [
                    "appInstalled",
                    "standalone",
                    "queryString",
                ],
                pwaHead: [
                    {
                        href: "/remark-lint-file-progress/site.webmanifest",
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: "#10bfae",
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        href: "/remark-lint-file-progress/img/favicon.svg",
                        rel: "icon",
                        tagName: "link",
                    },
                ],
            },
        ],
    ],
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: {
                    editUrl: ({ docPath }: Readonly<{ docPath: string }>) => {
                        if (docPath.startsWith("developer/api/"))
                            return undefined;
                        const source =
                            docPath === "activate.md"
                                ? "docs/rules/activate.md"
                                : docPath === "developer/contributing.md"
                                  ? "CONTRIBUTING.md"
                                  : docPath === "presets.md" ||
                                      docPath === "demos.md" ||
                                      docPath.startsWith("presets/")
                                    ? "scripts/sync.mjs"
                                    : `docs/docusaurus/site-docs/${docPath}`;
                        return `https://github.com/Nick2bad4u/remark-lint-file-progress/edit/main/${source}`;
                    },
                    path: "site-docs",
                    routeBasePath: "/",
                    sidebarPath: "./sidebars.ts",
                },
                theme: { customCss: "./src/css/custom.css" },
            },
        ],
    ],
    projectName: "remark-lint-file-progress",
    tagline: "Know which Markdown file is being processed.",
    themeConfig: {
        colorMode: { defaultMode: "dark", respectPrefersColorScheme: true },
        docs: { sidebar: { autoCollapseCategories: false, hideable: true } },
        footer: {
            copyright:
                '© 2026 <a class="rfp-footer-link" href="https://github.com/Nick2bad4u">Nick2bad4u</a> · MIT licensed · Built with <a class="rfp-footer-link" href="https://docusaurus.io/">Docusaurus</a>.',
            links: [
                {
                    items: [
                        { label: "Overview", to: "/overview" },
                        { label: "Getting started", to: "/getting-started" },
                        { label: "Compare presets", to: "/presets" },
                        { label: "Plugin & options", to: "/activate" },
                        { label: "Terminal demos", to: "/demos" },
                        { label: "Troubleshooting", to: "/troubleshooting" },
                    ],
                    title: "📚 Explore",
                },
                {
                    items: [
                        {
                            href: "https://github.com/Nick2bad4u/remark-lint-file-progress",
                            label: "GitHub repository",
                        },
                        {
                            href: "https://www.npmjs.com/package/remark-lint-file-progress",
                            label: "npm package",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/remark-lint-file-progress/releases",
                            label: "Releases & changelog",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/remark-lint-file-progress/issues",
                            label: "Report an issue",
                        },
                        {
                            label: "Project & ecosystem links",
                            to: "/resources",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/remark-lint-file-progress/security/policy",
                            label: "Security policy",
                        },
                    ],
                    title: "📦 Project",
                },
                {
                    items: [
                        {
                            label: "Contributing",
                            to: "/developer/contributing",
                        },
                        { label: "API reference", to: "/developer/api" },
                        {
                            label: "Compatibility & metrics",
                            to: "/compatibility",
                        },
                        {
                            label: "ESLint inspector",
                            target: "_self",
                            to: "pathname:///eslint-inspector/",
                        },
                        {
                            label: "Stylelint inspector",
                            target: "_self",
                            to: "pathname:///stylelint-inspector/",
                        },
                        {
                            label: "Remark inspector",
                            target: "_self",
                            to: "pathname:///remark-inspector/",
                        },
                    ],
                    title: "🛠 Development",
                },
            ],
            style: "dark",
        },
        image: "img/social-card.png",
        navbar: {
            items: [
                {
                    items: [
                        { label: "Overview", to: "/overview" },
                        { label: "Getting started", to: "/getting-started" },
                        { label: "Plugin & options", to: "/activate" },
                        {
                            label: "Compatibility & metrics",
                            to: "/compatibility",
                        },
                        { label: "Troubleshooting", to: "/troubleshooting" },
                    ],
                    label: "📚 Docs",
                    position: "left",
                    type: "dropdown",
                },
                {
                    items: [
                        { label: "Compare all presets", to: "/presets" },
                        ...project.presets.map((preset) => ({
                            label: `${preset.icon} ${preset.label}`,
                            to: `/presets/${preset.name}`,
                        })),
                    ],
                    label: "⚙ Presets",
                    position: "left",
                    type: "dropdown",
                },
                { label: "▶ Demos", position: "left", to: "/demos" },
                {
                    items: [
                        {
                            label: "Contributing",
                            to: "/developer/contributing",
                        },
                        { label: "API reference", to: "/developer/api" },
                        {
                            label: "Quality review",
                            to: "/developer/quality-review",
                        },
                        { label: "Inspectors & resources", to: "/resources" },
                    ],
                    label: "🛠 Dev",
                    position: "right",
                    type: "dropdown",
                },
                {
                    href: "https://github.com/Nick2bad4u/remark-lint-file-progress",
                    label: "GitHub",
                    position: "right",
                },
            ],
            logo: { alt: "", src: "img/logo.svg" },
            title: "Remark File Progress",
        },
        prism: {
            additionalLanguages: [
                "bash",
                "json",
                "markdown",
            ],
            theme: {
                plain: { backgroundColor: "#182431", color: "#e3edf7" },
                styles: [
                    {
                        style: { color: "#b0c1d2" },
                        types: [
                            "comment",
                            "prolog",
                            "doctype",
                            "cdata",
                        ],
                    },
                    {
                        style: { color: "#d6b8ff" },
                        types: [
                            "keyword",
                            "tag",
                            "selector",
                            "atrule",
                        ],
                    },
                    {
                        style: { color: "#ffc27e" },
                        types: [
                            "boolean",
                            "number",
                            "constant",
                            "symbol",
                        ],
                    },
                    {
                        style: { color: "#91d4ff" },
                        types: [
                            "function",
                            "class-name",
                            "property",
                            "attr-name",
                        ],
                    },
                    {
                        style: { color: "#9df1df" },
                        types: [
                            "string",
                            "char",
                            "attr-value",
                            "regex",
                        ],
                    },
                    {
                        style: { color: "#c3d4e6" },
                        types: ["punctuation", "operator"],
                    },
                ],
            },
        },
    },
    themes: [
        [
            "@easyops-cn/docusaurus-search-local",
            {
                docsDir: "site-docs",
                docsRouteBasePath: "/",
                hashed: "filename",
                highlightSearchTermsOnTargetPage: true,
                indexBlog: false,
                indexDocs: true,
                indexPages: true,
                language: "en",
                searchBarShortcut: true,
                searchBarShortcutHint: true,
                searchResultContextMaxLength: 96,
            },
        ],
    ],
    title: "Remark File Progress",
    trailingSlash: false,
    url: "https://nick2bad4u.github.io",
} satisfies Config;
export default config;
