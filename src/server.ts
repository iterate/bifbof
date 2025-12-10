import { Elysia } from "elysia";
import { join } from "path";
import { TaskStore } from "./tasks";
import type { BiffboffConfig } from "./types";

export async function createServer(config: BiffboffConfig) {
  const store = new TaskStore(config);
  await store.load();
  store.watch();

  // Track connected WebSocket clients
  const clients = new Set<any>();

  // Notify all clients on task changes
  store.onChange((tasks) => {
    const message = JSON.stringify({ type: "tasks", data: tasks });
    clients.forEach((ws) => ws.send(message));
  });

  const publicDir = join(import.meta.dir, "../public");

  const app = new Elysia()
    // API routes
    .get("/api/config", () => ({ columns: config.columns }))

    .get("/api/tasks", () => store.getAll())

    .get("/api/tasks/:id", ({ params }) => {
      const task = store.get(params.id);
      if (!task) throw new Error("Task not found");
      return task;
    })

    // WebSocket for live updates
    .ws("/ws", {
      open(ws) {
        clients.add(ws);
        ws.send(JSON.stringify({ type: "tasks", data: store.getAll() }));
      },
      close(ws) {
        clients.delete(ws);
      },
      message(ws, message) {},
    })

    // Static files
    .get("/", async () => {
      const content = await Bun.file(join(publicDir, "index.html")).text();
      return new Response(content, { headers: { "Content-Type": "text/html" } });
    })
    .get("/app.js", async () => {
      const content = await Bun.file(join(publicDir, "app.js")).text();
      return new Response(content, { headers: { "Content-Type": "application/javascript" } });
    })
    .get("/styles.css", async () => {
      const content = await Bun.file(join(publicDir, "styles.css")).text();
      return new Response(content, { headers: { "Content-Type": "text/css" } });
    })

    .listen(config.port);

  console.log(`Biffboff running at http://localhost:${config.port}`);
  return app;
}
