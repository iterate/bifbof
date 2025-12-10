#!/usr/bin/env bun
import { parseArgs } from "util";
import { loadConfig } from "./config";
import { createServer } from "./server";

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
biffboff - Git-first task management

Usage:
  biffboff [options]

Options:
  -c, --config <path>  Path to config file
  -h, --help           Show this help
  -v, --version        Show version

Config:
  Create biffboff.config.ts in your project root:

  import { defineConfig } from "biffboff";
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
