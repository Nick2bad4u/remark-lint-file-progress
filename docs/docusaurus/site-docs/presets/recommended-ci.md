# recommended-ci

Hide all plugin output when CI is exactly true.

```js
import preset from "remark-lint-file-progress/configs/recommended-ci";

export default preset;
```

![recommended-ci colored terminal demonstration](../../static/demos/presets/recommended-ci.gif)

This recording uses CI=true. Outside CI, the preset displays ordinary progress.

See [all options](../activate.md) and [compatibility](../compatibility.md) for summary and terminal behavior.
