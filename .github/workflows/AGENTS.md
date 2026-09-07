# Workflow maintenance

- Keep repository scripts as the source of verification commands. Check variants must not rewrite tracked files.
- Owned workflow-template callers intentionally use `@main`; third-party actions use verified full SHAs and version comments.
- Untrusted pull requests run without deployment or publication credentials. Use narrow job permissions and explicit timeouts.
- Keep all three operating systems, coverage thresholds, packed consumers, and documentation checks active.
- Release automation publishes the verified tarball only after identity and duplicate-publication checks. Do not dispatch it without release authorization.
