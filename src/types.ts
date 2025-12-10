export interface BifbofConfig {
  tasksDir: string;
  port: number;
  columns: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  status: string;
}

export function defineConfig(config: Partial<BifbofConfig>): BifbofConfig {
  return {
    tasksDir: "./tasks",
    port: 3456,
    columns: ["backlog", "todo", "in-progress", "done"],
    ...config,
  };
}
