const packageName = "remark-lint-file-progress";
const repository = `https://github.com/Nick2bad4u/${packageName}`;
const npm = `https://www.npmjs.com/package/${packageName}`;
const badgeOrigin = "https://flat.badgen.net";

export const badges = [
    {
        alt: "Latest npm version",
        href: npm,
        src: `${badgeOrigin}/npm/v/${packageName}?color=0E7490`,
    },
    {
        alt: "Native unified plugin",
        href: "https://unifiedjs.com/learn/guide/using-plugins/",
        src: `${badgeOrigin}/static/plugin/unified/BE185D`,
    },
    {
        alt: "Supported Node.js versions",
        href: npm,
        src: `${badgeOrigin}/npm/node/${packageName}?color=4D7C0F`,
    },
    {
        alt: "Bundled TypeScript declarations",
        href: npm,
        src: `${badgeOrigin}/npm/types/${packageName}?color=6D28D9`,
    },
    {
        alt: "Latest GitHub release",
        href: `${repository}/releases`,
        src: `${badgeOrigin}/github/release/Nick2bad4u/${packageName}?color=0F766E`,
    },
    {
        alt: "Codecov coverage",
        href: `https://codecov.io/gh/Nick2bad4u/${packageName}`,
        src: `${badgeOrigin}/codecov/github/Nick2bad4u/${packageName}`,
    },
    {
        alt: "GitHub Actions checks on main",
        href: `${repository}/actions`,
        src: `${badgeOrigin}/github/checks/Nick2bad4u/${packageName}/main`,
    },
    {
        alt: "GitHub stars",
        href: `${repository}/stargazers`,
        src: `${badgeOrigin}/github/stars/Nick2bad4u/${packageName}?color=B45309`,
    },
    {
        alt: "MIT license",
        href: `${repository}/blob/main/LICENSE`,
        src: `${badgeOrigin}/npm/license/${packageName}?color=4338CA`,
    },
];

export const presetDetails = {
    recommended: {
        label: "Everyday progress",
        icon: "🟢",
        tone: "teal",
        audience: "Follow each Markdown file",
        description: "Show each file using the default display options.",
    },
    "recommended-ci": {
        label: "Quiet in CI",
        icon: "🔵",
        tone: "blue",
        audience: "Keep CI logs quiet",
        description: "Hide all plugin output when CI is exactly true.",
    },
    "recommended-ci-detailed": {
        label: "CI with a summary",
        icon: "🟣",
        tone: "violet",
        audience: "Keep a summary in CI",
        description:
            "Hide live output in CI while retaining the detailed process summary.",
    },
    "recommended-compact": {
        label: "Compact activity",
        icon: "🟡",
        tone: "amber",
        audience: "Show activity without paths",
        description:
            "Show generic activity without filenames; redirected output announces it once.",
    },
    "recommended-detailed": {
        label: "Detailed progress",
        icon: "🟠",
        tone: "orange",
        audience: "See process-wide metrics",
        description: "Show filenames and the detailed process summary.",
    },
    "recommended-summary-only": {
        label: "Summary only",
        icon: "🩷",
        tone: "pink",
        audience: "Read the final summary",
        description: "Show only the final process summary.",
    },
    "recommended-tty": {
        label: "Interactive terminals",
        icon: "🟦",
        tone: "cyan",
        audience: "Respect redirected output",
        description: "Show output only when stderr is an interactive terminal.",
    },
};
