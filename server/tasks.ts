import { watch } from "fs";
import { relative, join, basename } from "path";
import { parseTask } from "./parser";
import type { Task, BifbofConfig } from "./types";

const EXCLUDED_FILES = /^(AGENTS|CLAUDE|README)\.md$/i;

function taskToMarkdown(task: Task): string {
  const lines: string[] = ["---"];
  if (task.id) lines.push(`id: ${task.id}`);
  lines.push(`status: ${task.status}`);
  if (task.dependencies.length > 0) {
    lines.push("dependsOn:");
    task.dependencies.forEach((dep) => lines.push(`  - ${dep}`));
  }
  lines.push("---", "", `# ${task.title}`);
  if (task.description) {
    lines.push("", task.description);
  }
  return lines.join("\n");
}

export class TaskStore {
  private tasks = new Map<string, Task>();
  private listeners = new Set<(tasks: Task[]) => void>();

  constructor(private config: BifbofConfig) {}

  async load(): Promise<void> {
    this.tasks.clear();
    const glob = new Bun.Glob("**/*.md");

    for await (const filepath of glob.scan({ cwd: this.config.tasksDir, absolute: true })) {
      const filename = basename(filepath);
      if (EXCLUDED_FILES.test(filename)) continue;

      try {
        const content = await Bun.file(filepath).text();
        const relativePath = relative(this.config.tasksDir, filepath);
        const task = parseTask(relativePath, content);
        this.tasks.set(task.id, task);
      } catch (err) {
        console.error(`Failed to parse ${filepath}:`, err);
      }
    }

    console.log(`Loaded ${this.tasks.size} tasks`);
  }

  getAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  watch(): void {
    console.log(`Watching ${this.config.tasksDir} for changes...`);
    let debounce: Timer | null = null;

    watch(this.config.tasksDir, { recursive: true }, (_, filename) => {
      if (!filename?.endsWith(".md")) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(async () => {
        console.log(`File changed: ${filename}`);
        await this.load();
        this.notify();
      }, 100);
    });
  }

  onChange(fn: (tasks: Task[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async create(task: Omit<Task, "id"> & { id?: string }): Promise<Task> {
    const id = task.id || `task-${Date.now()}`;
    const newTask: Task = {
      id,
      title: task.title,
      description: task.description,
      dependencies: task.dependencies,
      status: task.status,
    };

    const filepath = join(this.config.tasksDir, `${id}.md`);
    await Bun.write(filepath, taskToMarkdown(newTask));

    this.tasks.set(id, newTask);
    this.notify();
    return newTask;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const existing = this.tasks.get(id);
    if (!existing) return null;

    const updated: Task = { ...existing, ...updates, id };
    const filepath = join(this.config.tasksDir, `${id}.md`);
    await Bun.write(filepath, taskToMarkdown(updated));

    this.tasks.set(id, updated);
    this.notify();
    return updated;
  }

  private notify(): void {
    const tasks = this.getAll();
    this.listeners.forEach((fn) => fn(tasks));
  }
}
