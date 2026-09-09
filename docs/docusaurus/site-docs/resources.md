---
sidebar_label: Inspectors and project links
description: Explore all three config inspectors, related plugins, source code, releases, and support paths.
---

# Inspectors and project links

## Explore the configuration

The inspectors show configurations used to develop this repository, captured when the documentation site builds.

- [Remark Config Inspector](pathname:///remark-inspector/) shows the Markdown pipeline, shared preset, and file progress settings.
- [ESLint Config Inspector](pathname:///eslint-inspector/) shows TypeScript and tooling rules.
- [Stylelint Config Inspector](pathname:///stylelint-inspector/) shows the documentation stylesheet configuration.

Configure your own progress using the [setup guide](./getting-started.md), [preset comparison](./presets.md), and [option reference](./activate.md).

## Package and source

| Resource                                                                                    | What you will find                         |
| ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [npm package](https://www.npmjs.com/package/remark-lint-file-progress)                      | Installation, versions, and metadata.      |
| [GitHub repository](https://github.com/Nick2bad4u/remark-lint-file-progress)                | Source, tests, documentation, and tooling. |
| [Releases](https://github.com/Nick2bad4u/remark-lint-file-progress/releases)                | Published notes and artifacts.             |
| [Changelog](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/CHANGELOG.md) | Full project history.                      |
| [Issue tracker](https://github.com/Nick2bad4u/remark-lint-file-progress/issues)             | Bugs, feedback, and feature requests.      |
| [Security policy](https://github.com/Nick2bad4u/remark-lint-file-progress/security/policy)  | How to report a security concern.          |

## Progress across the toolkit

| Project                                                                                 | Native integration                         | Observed event                                 |
| --------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| [Remark File Progress](./index.md)                                                      | Callable unified transformer and presets.  | Every execution, including reused VFiles.      |
| [Stylelint File Progress](https://nick2bad4u.github.io/stylelint-plugin-file-progress/) | `file-progress/activate` rule and configs. | One observation per PostCSS processing result. |
| [ESLint File Progress](https://nick2bad4u.github.io/eslint-plugin-file-progress-2/)     | ESLint rule and flat configs.              | Files reaching the progress rule.              |

The packages share display options, seven preset names, colored paths, and process summaries. Their adapters follow their hosts' observation boundaries. This package's [compatibility notes](./compatibility.md) explain plugin ordering, output, and process-wide aggregation.

## Related projects

- [ESLint Typefest](https://nick2bad4u.github.io/eslint-plugin-typefest/) provides rules for type-fest and ts-extras patterns.
- [remark-config-nick2bad4u](https://github.com/Nick2bad4u/remark-config-nick2bad4u) supplies this repository's shared Markdown config and includes progress from version 2.0.0.
- [remark](https://remark.js.org/) documents the Markdown ecosystem; [unified](https://unifiedjs.com/learn/guide/using-plugins/) explains composition.
- [remark-cli](https://github.com/remarkjs/remark/tree/main/packages/remark-cli) documents configuration, reporters, and flags.

## Contribute

Read the [contributing guide](./developer/contributing.md) for validation and documentation generation. The [API reference](https://nick2bad4u.github.io/remark-lint-file-progress/developer/api) comes from public TypeScript declarations. See the [quality review](./developer/quality-review.md), [NOTICE](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/NOTICE), and [MIT license](https://github.com/Nick2bad4u/remark-lint-file-progress/blob/main/LICENSE).
