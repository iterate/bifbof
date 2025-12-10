import { defineConfig } from "./server/types";

export default defineConfig({
  tasksDir: "./tasks",
  port: 3456,
  columns: ["backlog", "todo", "in-progress", "done"],
});
