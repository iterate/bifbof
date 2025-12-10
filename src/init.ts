import { join, dirname } from "path";
import { mkdir } from "fs/promises";

const INIT_FILES: Record<string, string> = {
  "bunfig.toml": `[serve.static]
plugins = ["bun-plugin-tailwind"]

[serve.development]
sourcemap = "inline"
`,
  "bifbof.config.ts": `import { defineConfig } from "bifbof";

export default defineConfig({
  tasksDir: "./tasks",
  port: 3456,
  columns: ["backlog", "todo", "in-progress", "done"],
});
`,
  "tasks/AGENTS.md": `# Task Management

Tasks = markdown files in this folder. File path without .md = task ID.

## Format
\`\`\`
---
status: backlog|todo|in-progress|done
dependsOn:
  - other-task-id
---
# Title (optional, defaults to filename)

Description here.
\`\`\`

## Usage
- Add task: create \`tasks/my-task.md\`
- Change status: edit \`status\` in frontmatter
- Nest tasks: use folders like \`tasks/feature/subtask.md\`
`,
  "tasks/welcome.md": `Welcome to bifbof! This is your first task.
`,
  "tasks/getting-started/learn-syntax.md": `---
status: todo
---
# Learn task syntax

Tasks are markdown files. Add frontmatter for status/dependencies.
`,
  "tasks/getting-started/explore-features.md": `---
status: backlog
dependsOn:
  - getting-started/learn-syntax
---
# Explore features

Try the kanban board at http://localhost:3456
`,
  "tasks/look-at-this.md": `---
status: in-progress
---
Look at this task - it's in progress!
`,
  "tasks/run-bifbof.md": `---
status: done
---
Run \`bunx bifbof\` to start the server.
`,
};

export async function runInit(): Promise<void> {
  const cwd = process.cwd();

  // Check if already initialized
  if (await Bun.file(join(cwd, "bifbof.config.ts")).exists()) {
    console.error("bifbof already initialized (config file exists)");
    process.exit(1);
  }

  // Create all files
  for (const [path, content] of Object.entries(INIT_FILES)) {
    const fullPath = join(cwd, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await Bun.write(fullPath, content);
    console.log(`Created ${path}`);
  }

  console.log("\nbifbof initialized! Run `bifbof` to start the server.");
}
