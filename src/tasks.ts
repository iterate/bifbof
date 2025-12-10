import { watch } from "fs";
import { readdir } from "fs/promises";
import { join, relative } from "path";
import { parseTask } from "./parser";
import type { Task, BiffboffConfig } from "./types";

export class TaskStore {
  private tasks = new Map<string, Task>();
  private listeners = new Set<(tasks: Task[]) => void>();

  constructor(private config: BiffboffConfig) {}

  async load(): Promise<void> {
    this.tasks.clear();
    const files = await this.findMarkdownFiles(this.config.tasksDir);

    for (const filepath of files) {
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

  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const results: string[] = [];

    async function walk(currentDir: string) {
      const entries = await readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith(".md")) {
          results.push(fullPath);
        }
      }
    }

    await walk(dir);
    return results;
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

    watch(this.config.tasksDir, { recursive: true }, (event, filename) => {
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
