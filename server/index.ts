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
      "/api/tasks": {
        GET: () => Response.json(store.getAll()),
        POST: async (req) => {
          const body = await req.json();
          const task = await store.create(body);
          return Response.json(task);
        },
      },
      "/api/tasks/*": {
        GET: (req) => {
          const id = new URL(req.url).pathname.replace("/api/tasks/", "");
          console.log(`GET /api/tasks/${id}`);
          const task = store.get(id);
          if (!task) {
            console.log(`Task not found: ${id}`);
          }
          return task
            ? Response.json(task)
            : Response.json({ error: "Not found" }, { status: 404 });
        },
        PATCH: async (req) => {
          const id = new URL(req.url).pathname.replace("/api/tasks/", "");
          console.log(`PATCH /api/tasks/${id}`);
          const body = await req.json();
          console.log(`Update body:`, body);
          try {
            const task = await store.update(id, body);
            if (!task) {
              console.log(`Task not found for update: ${id}`);
            } else {
              console.log(`Task updated successfully: ${id}`);
            }
            return task
              ? Response.json(task)
              : Response.json({ error: "Not found" }, { status: 404 });
          } catch (err) {
            console.error(`Error updating task ${id}:`, err);
            return Response.json({ error: String(err) }, { status: 500 });
          }
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
      message() {},
    },
  });

  console.log(`Bifbof running at http://localhost:${server.port}`);
  return server;
}
