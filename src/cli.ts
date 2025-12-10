#!/usr/bin/env bun
import { parseArgs } from "util";
import { loadConfig } from "../server/config";
import { createServer } from "../server/index";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    config: { type: "string", short: "c" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
  allowPositionals: true,
});

if (values.version) {
  console.log("0.1.0");
  process.exit(0);
}

if (values.help) {
  console.log(`
bifbof - Git-first task management

Usage:
  bifbof [options]

Options:
  -c, --config <path>  Path to config file
  -h, --help           Show this help
  -v, --version        Show version

Config:
  Create bifbof.config.ts in your project root:

  import { defineConfig } from "bifbof";
  export default defineConfig({
    tasksDir: "./tasks",
    port: 3456,
    columns: ["backlog", "todo", "in-progress", "done"]
  });
`);
  process.exit(0);
}

const config = await loadConfig(values.config);
await createServer(config);
