import { watch } from "fs";
import { relative } from "path";
import { parseTask } from "./parser";
import type { Task, BifbofConfig } from "./types";

export class TaskStore {
  private tasks = new Map<string, Task>();
  private listeners = new Set<(tasks: Task[]) => void>();

  constructor(private config: BifbofConfig) {}

  async load(): Promise<void> {
    this.tasks.clear();
    const glob = new Bun.Glob("**/*.md");

    for await (const filepath of glob.scan({ cwd: this.config.tasksDir, absolute: true })) {
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

  private notify(): void {
    const tasks = this.getAll();
    this.listeners.forEach((fn) => fn(tasks));
  }
}
