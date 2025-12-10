#!/usr/bin/env bun
import { parseArgs } from "util";
import { createInterface } from "readline";
import { loadConfig, configExists } from "../server/config";
import { createServer } from "../server/index";
import { runInit } from "./init";
import { printInstructions } from "./instructions";

const { values, positionals } = parseArgs({
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
  bifbof [command] [options]

Commands:
  (none)        Start server (prompts to init if no config)
  init          Initialize bifbof in current directory
  server        Start server without init prompt
  instructions  Show task format and usage

Options:
  -c, --config <path>  Path to config file
  -h, --help           Show this help
  -v, --version        Show version
`);
  process.exit(0);
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function startServer(configPath?: string): Promise<void> {
  const config = await loadConfig(configPath);
  await createServer(config);
}

async function defaultCommand(configPath?: string): Promise<void> {
  if (await configExists()) {
    await startServer(configPath);
    return;
  }

  console.log(`No bifbof config found. Initialize bifbof in this directory?

This will create:
  - bifbof.config.ts
  - tasks/AGENTS.md
  - tasks/welcome.md
  - tasks/getting-started/ (example tasks)
`);

  const answer = await prompt("Initialize? [y/N] ");

  if (answer === "y" || answer === "yes") {
    await runInit();
    console.log("\nStarting server...\n");
    await startServer();
  } else {
    console.log("\nStarting server with defaults (empty task list)...\n");
    await startServer(configPath);
  }
}

const command = positionals[2]; // First positional after "bun" and script path

switch (command) {
  case "init":
    await runInit();
    break;
  case "server":
    await startServer(values.config);
    break;
  case "instructions":
    printInstructions();
    break;
  default:
    await defaultCommand(values.config);
}
