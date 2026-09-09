import type { JSX } from "react";

import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";

import project from "../data/project.json" with { type: "json" };

const features = [
    {
        description:
            "One transformer. Your existing Markdown, messages, and output.",
        icon: "◆",
        label: "Native unified plugin",
    },
    {
        description:
            "File, compact, and summary modes, with CI and TTY presets.",
        icon: "›_",
        label: "Your terminal, your rules",
    },
    {
        description:
            "Observed files, elapsed time, and throughput at shutdown.",
        icon: "◷",
        label: "Useful process summaries",
    },
];

const paths = [
    {
        description:
            "Install the plugin and add a preset to your existing Remark configuration.",
        icon: "↗",
        label: "Install & configure",
        title: "Get started",
        to: "/getting-started",
        tone: "teal",
    },
    {
        description:
            "Compare seven presets, from everyday filenames to a quiet CI summary.",
        icon: "≋",
        label: "Compare presets",
        title: "Choose your output",
        to: "/presets",
        tone: "violet",
    },
    {
        description:
            "Explore paths, spinner styles, streams, messages, and display thresholds.",
        icon: "{ }",
        label: "Explore the options",
        title: "Make it yours",
        to: "/activate",
        tone: "amber",
    },
];

/** Render the documentation landing page and its generated package catalog. */
export default function Home(): JSX.Element {
    const logo = useBaseUrl("/img/logo.svg");
    const terminal = useBaseUrl("/img/terminal.svg");
    const detailedDemo = useBaseUrl("/demos/presets/recommended-detailed.gif");

    return (
        <Layout
            description="See which Markdown file is being linted. Explore seven Remark presets, colored terminal demos, configurable output, and process summaries."
            title="Live file progress for Remark"
        >
            <main>
                <header className="rfp-hero">
                    <div className="container">
                        <div className="rfp-hero-grid">
                            <div>
                                <p className="rfp-kicker">
                                    <span aria-hidden="true">◆</span> A little
                                    clarity for every lint run
                                </p>
                                <Heading as="h1" className="rfp-hero-title">
                                    Remark
                                    <br />
                                    <span>File Progress</span>
                                </Heading>
                                <p className="rfp-package-name">
                                    remark-lint-file-progress
                                </p>
                                <p className="rfp-hero-description">
                                    See the Markdown file behind the wait. Live
                                    filenames and configurable process summaries
                                    for{" "}
                                    <Link
                                        className="rfp-inline-pill"
                                        href="https://remark.js.org/"
                                    >
                                        Remark
                                    </Link>
                                    , with terminal colors from{" "}
                                    <Link
                                        className="rfp-inline-pill"
                                        href="https://github.com/alexeyraspopov/picocolors"
                                    >
                                        picocolors
                                    </Link>
                                    .
                                </p>
                                <div className="rfp-actions">
                                    <Link
                                        className="button button--lg rfp-primary"
                                        to="/getting-started"
                                    >
                                        Get started{" "}
                                        <span aria-hidden="true">↗</span>
                                    </Link>
                                    <Link
                                        className="button button--lg rfp-secondary"
                                        to="/demos"
                                    >
                                        See it in action{" "}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </div>
                            </div>
                            <aside
                                aria-label="Plugin preview"
                                className="rfp-hero-panel"
                            >
                                <div className="rfp-panel-brand">
                                    <img
                                        alt=""
                                        height="68"
                                        src={logo}
                                        width="68"
                                    />
                                    <div>
                                        <strong>
                                            Small plugin. Clear progress.
                                        </strong>
                                        <span>
                                            Built for your Remark workflow.
                                        </span>
                                    </div>
                                </div>
                                <img
                                    alt="Live remark progress with colored Markdown paths"
                                    className="rfp-terminal-poster"
                                    height="540"
                                    src={terminal}
                                    width="940"
                                />
                                <div className="rfp-panel-tags">
                                    <span>Markdown · GFM · MDX</span>
                                    <Link to="/compatibility">
                                        How observation works →
                                    </Link>
                                </div>
                            </aside>
                        </div>
                        <div className="rfp-feature-grid">
                            {features.map((feature) => (
                                <article
                                    className="rfp-feature"
                                    key={feature.label}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="rfp-feature-icon"
                                    >
                                        {feature.icon}
                                    </span>
                                    <div>
                                        <Heading as="h2">
                                            {feature.label}
                                        </Heading>
                                        <p>{feature.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <ul
                            aria-label="Package and repository status"
                            className="rfp-badges"
                        >
                            {project.badges.map((badge) => (
                                <li key={badge.src}>
                                    <Link href={badge.href}>
                                        <img
                                            alt={badge.alt}
                                            decoding="async"
                                            height="20"
                                            loading="lazy"
                                            src={badge.src}
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </header>

                <section
                    aria-labelledby="explore-title"
                    className="rfp-section container"
                >
                    <div className="rfp-section-heading">
                        <div>
                            <p className="rfp-eyebrow">Start here</p>
                            <Heading as="h2" id="explore-title">
                                Progress that fits your workflow.
                            </Heading>
                        </div>
                        <Link className="rfp-text-link" to="/overview">
                            Meet the plugin →
                        </Link>
                    </div>
                    <div className="rfp-card-grid">
                        {paths.map((path) => (
                            <article
                                className={`rfp-card rfp-tone-${path.tone}`}
                                key={path.to}
                            >
                                <span
                                    aria-hidden="true"
                                    className="rfp-card-icon"
                                >
                                    {path.icon}
                                </span>
                                <Heading as="h3">{path.title}</Heading>
                                <p>{path.description}</p>
                                <Link to={path.to}>{path.label} →</Link>
                            </article>
                        ))}
                    </div>
                    <div className="rfp-metrics">
                        <p>
                            <strong>1</strong> observational transformer
                        </p>
                        <p>
                            <strong>{project.presets.length}</strong>{" "}
                            ready-to-use presets
                        </p>
                        <p>
                            <strong>{project.optionCount}</strong> display
                            options
                        </p>
                        <p>
                            <strong>{project.demoCount}</strong> terminal demos
                        </p>
                    </div>
                </section>

                <section
                    aria-labelledby="demo-title"
                    className="rfp-section rfp-section-tinted"
                >
                    <div className="container rfp-demo-grid">
                        <div>
                            <p className="rfp-eyebrow">
                                A look inside your terminal
                            </p>
                            <Heading as="h2" id="demo-title">
                                Follow the files.
                                <br />
                                Keep the useful details.
                            </Heading>
                            <p>
                                Choose readable filenames while Remark works,
                                then see observed file counts, elapsed time, and
                                throughput in a single process summary.
                            </p>
                            <p>
                                Interactive files update the same terminal block
                                when its position is known. Spinner frames
                                advance with file events, while reporter writes
                                remain visible.
                            </p>
                            <Link className="rfp-text-link" to="/demos">
                                Explore all {project.demoCount} recordings →
                            </Link>
                            <p className="rfp-small">
                                Timings in these reproducible demos illustrate
                                process metrics.{" "}
                                <Link to="/compatibility#what-an-event-means">
                                    What does a file event mean?
                                </Link>
                            </p>
                        </div>
                        <figure className="rfp-demo-frame">
                            <details className="rfp-demo-toggle">
                                <summary>
                                    Play the detailed terminal recording
                                </summary>
                                <img
                                    alt="recommended-detailed animated terminal demonstration"
                                    decoding="async"
                                    loading="lazy"
                                    src={detailedDemo}
                                />
                            </details>
                            <img
                                alt="Live remark progress with colored Markdown paths"
                                className="rfp-demo-still"
                                height="540"
                                loading="lazy"
                                src={terminal}
                                width="940"
                            />
                            <figcaption>
                                <Link to="/presets/recommended-detailed">
                                    recommended-detailed
                                </Link>
                                <span>
                                    Real display controller · reproducible file
                                    events
                                </span>
                            </figcaption>
                        </figure>
                    </div>
                </section>

                <section
                    aria-labelledby="presets-title"
                    className="rfp-section container"
                >
                    <div className="rfp-section-heading">
                        <div>
                            <p className="rfp-eyebrow">
                                Seven ways to show progress
                            </p>
                            <Heading as="h2" id="presets-title">
                                Pick a preset. Get on with your Markdown.
                            </Heading>
                        </div>
                        <Link className="rfp-text-link" to="/presets">
                            View the comparison →
                        </Link>
                    </div>
                    <div className="rfp-preset-grid">
                        {project.presets.map((preset) => (
                            <Link
                                className={`rfp-preset-card rfp-tone-${preset.tone}`}
                                key={preset.name}
                                to={`/presets/${preset.name}`}
                            >
                                <span className="rfp-pill">{preset.label}</span>
                                <Heading as="h3">{preset.name}</Heading>
                                <p>{preset.description}</p>
                                <span className="rfp-preset-link">
                                    View config & demo{" "}
                                    <span aria-hidden="true">↗</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section
                    aria-labelledby="install-title"
                    className="rfp-section rfp-section-tinted"
                >
                    <div className="container rfp-install-grid">
                        <div>
                            <p className="rfp-eyebrow">Ready when you are</p>
                            <Heading as="h2" id="install-title">
                                One install.
                                <br />
                                One config entry.
                            </Heading>
                            <p>
                                Add the progress preset after your existing
                                configs. Your lint rules and Markdown transforms
                                continue to work as usual.
                            </p>
                            <div className="rfp-compat-pills">
                                <Link to="/compatibility">Node.js 22+</Link>
                                <Link to="/compatibility">
                                    unified 11 · remark 15
                                </Link>
                                <Link to="/getting-started#commonjs">
                                    ESM + CommonJS
                                </Link>
                                <Link to="/developer/api">
                                    TypeScript declarations
                                </Link>
                            </div>
                        </div>
                        <div className="rfp-install-code">
                            <CodeBlock language="sh">
                                {
                                    "npm install --save-dev remark-cli remark-lint-file-progress"
                                }
                            </CodeBlock>
                            <CodeBlock language="js" title=".remarkrc.mjs">
                                {
                                    'import recommended from "remark-lint-file-progress/configs/recommended";\n\nexport default recommended;'
                                }
                            </CodeBlock>
                            <Link
                                className="rfp-text-link"
                                to="/getting-started"
                            >
                                Read the setup guide →
                            </Link>
                        </div>
                    </div>
                </section>
                <section
                    aria-labelledby="ecosystem-title"
                    className="rfp-section container rfp-ecosystem"
                >
                    <div>
                        <p className="rfp-eyebrow">Part of the same toolkit</p>
                        <Heading as="h2" id="ecosystem-title">
                            Familiar tools. Connected docs.
                        </Heading>
                        <p>
                            Explore the ESLint and Stylelint counterparts,
                            shared remark config, and the inspectors behind this
                            project.
                        </p>
                    </div>
                    <div className="rfp-ecosystem-links">
                        <Link href="https://nick2bad4u.github.io/eslint-plugin-file-progress-2/">
                            ESLint File Progress ↗
                        </Link>
                        <Link href="https://nick2bad4u.github.io/stylelint-plugin-file-progress/">
                            Stylelint File Progress ↗
                        </Link>
                        <Link href="https://nick2bad4u.github.io/eslint-plugin-typefest/">
                            ESLint Typefest ↗
                        </Link>
                        <Link href="https://github.com/Nick2bad4u/remark-config-nick2bad4u">
                            Shared remark config ↗
                        </Link>
                        <Link to="/resources">
                            Inspectors & project links →
                        </Link>
                    </div>
                </section>
            </main>
        </Layout>
    );
}
