import { serve, type ServerWebSocket } from "bun";
import index from "../public/index.html";
import { TaskStore } from "./tasks";
import type { BifbofConfig } from "./types";

const clients = new Set<ServerWebSocket<unknown>>();

export async function createServer(config: BifbofConfig) {
  const store = new TaskStore(config);
  await store.load();
  store.watch();

  store.onChange((tasks) => {
    const msg = JSON.stringify({ type: "tasks", data: tasks });
    clients.forEach((ws) => ws.send(msg));
  });

  const server = serve({
    port: config.port,
    development: process.env.NODE_ENV !== "production",

    routes: {
      "/api/config": { GET: () => Response.json({ columns: config.columns }) },
      "/api/tasks": { GET: () => Response.json(store.getAll()) },
      "/api/tasks/:id": {
        GET: (req) => {
          const task = store.get(req.params.id);
          return task
            ? Response.json(task)
            : Response.json({ error: "Not found" }, { status: 404 });
        },
      },
      "/*": index,
    },

    fetch(req, server) {
      if (new URL(req.url).pathname === "/ws") {
        return server.upgrade(req) ? undefined : new Response("Upgrade failed", { status: 400 });
      }
    },

    websocket: {
      open(ws) {
        clients.add(ws);
        ws.send(JSON.stringify({ type: "tasks", data: store.getAll() }));
      },
      close(ws) {
        clients.delete(ws);
      },
    },
  });

  console.log(`Bifbof running at http://localhost:${server.port}`);
  return server;
}
