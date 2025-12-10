import { serve, type ServerWebSocket } from "bun";
import index from "../public/index.html";
import { TaskStore } from "./tasks";
import type { BifbofConfig } from "./types";

// Track connected WebSocket clients
const clients = new Set<ServerWebSocket<unknown>>();

export async function createServer(config: BifbofConfig) {
  const store = new TaskStore(config);
  await store.load();
  store.watch();

  // Notify all clients on task changes
  store.onChange((tasks) => {
    const message = JSON.stringify({ type: "tasks", data: tasks });
    clients.forEach((ws) => ws.send(message));
  });

  const server = serve({
    port: config.port,

    routes: {
      // API routes
      "/api/config": {
        GET: () => Response.json({ columns: config.columns }),
      },

      "/api/tasks": {
        GET: () => Response.json(store.getAll()),
      },

      "/api/tasks/:id": {
        GET: (req) => {
          const task = store.get(req.params.id);
          if (!task) {
            return Response.json({ error: "Task not found" }, { status: 404 });
          }
          return Response.json(task);
        },
      },

      // React SPA (catch-all)
      "/*": index,
    },

    // WebSocket handling via fetch for /ws route
    fetch(req, server) {
      const url = new URL(req.url);
      if (url.pathname === "/ws") {
        if (server.upgrade(req)) {
          return undefined;
        }
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      // Let routes handle everything else
      return undefined;
    },

    websocket: {
      open(ws) {
        clients.add(ws);
        ws.send(JSON.stringify({ type: "tasks", data: store.getAll() }));
      },
      close(ws) {
        clients.delete(ws);
      },
      message() {
        // Handle incoming messages if needed
      },
    },

    // Development mode - enables HMR and source maps
    development: process.env.NODE_ENV !== "production" && {
      hmr: true,
      console: true,
    },
  });

  console.log(`Bifbof running at http://localhost:${server.port}`);
  return server;
}
