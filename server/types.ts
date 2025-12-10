export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  status: string;
}

export interface Config {
  columns: string[];
}

export interface BifbofConfig {
  tasksDir: string;
  port: number;
  columns: string[];
}

export function defineConfig(config: Partial<BifbofConfig>): BifbofConfig {
  return {
    tasksDir: config.tasksDir ?? "./tasks",
    port: config.port ?? 3456,
    columns: config.columns ?? ["backlog", "todo", "in-progress", "done"],
  };
}
