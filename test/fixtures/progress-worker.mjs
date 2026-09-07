import { workerData } from "node:worker_threads";
import { remark } from "remark";
import progress from "../../dist/plugin.js";

await remark()
    .use(progress, {
        detailedSuccess: true,
        outputStream: workerData === "stdout" ? "stdout" : "stderr",
    })
    .process({ path: "worker.md", value: "# Title" });
