# Presets

Every preset is a native unified preset. Import its subpath and add it to your remark plugins array, or pass it to processor.use().

| Preset                                                            | Behavior                                                                      |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [recommended](./presets/recommended.md)                           | Show each file using the default display options.                             |
| [recommended-ci](./presets/recommended-ci.md)                     | Hide all plugin output when CI is exactly true.                               |
| [recommended-ci-detailed](./presets/recommended-ci-detailed.md)   | Hide live output in CI while retaining the detailed process summary.          |
| [recommended-compact](./presets/recommended-compact.md)           | Show generic activity without filenames; redirected output announces it once. |
| [recommended-detailed](./presets/recommended-detailed.md)         | Show filenames and the detailed process summary.                              |
| [recommended-summary-only](./presets/recommended-summary-only.md) | Show only the final process summary.                                          |
| [recommended-tty](./presets/recommended-tty.md)                   | Show output only when stderr is an interactive terminal.                      |
