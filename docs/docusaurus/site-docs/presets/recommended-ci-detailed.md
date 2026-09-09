---
sidebar_label: recommended-ci-detailed
description: Hide live output in CI while retaining the detailed process summary.
---

# recommended-ci-detailed

<span className="rfp-pill rfp-tone-violet">CI with a summary</span>

Hide live output in CI while retaining the detailed process summary.

## Configuration

```js
import preset from "remark-lint-file-progress/configs/recommended-ci-detailed";

export default preset;
```

Keep your existing shared configs before this preset.

## Terminal preview

![recommended-ci-detailed colored terminal demonstration](../../static/demos/presets/recommended-ci-detailed.gif)

This recording uses CI=true. Outside CI, the preset displays ordinary progress.

## Make it yours

See [all options](../activate.md), [compare presets](../presets.md), and [compatibility](../compatibility.md) for summary and terminal behavior. Explore the [demo gallery](../demos.md#recommended-ci-detailed) or follow the [setup guide](../getting-started.md).
