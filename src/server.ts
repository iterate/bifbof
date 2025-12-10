import { join } from "path";
import { watch } from "fs";
import { TaskStore } from "./tasks";
import type { BifbofConfig } from "./types";

// Track connected WebSocket clients
const clients = new Set<any>();

// Build frontend TypeScript with source maps
async function buildFrontend(publicDir: string): Promise<boolean> {
  const entrypoint = join(publicDir, "app.ts");
  const outdir = join(publicDir, "dist");

  const result = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    sourcemap: "inline",
    target: "browser",
    splitting: true,
  });

  if (!result.success) {
    console.error("Frontend build failed:");
    for (const log of result.logs) {
      console.error(log);
    }
    return false;
  }

  console.log("Frontend built successfully");
  return true;
}

// Watch frontend TypeScript files for changes
function watchFrontend(publicDir: string) {
  let debounce: Timer | null = null;

  watch(publicDir, { recursive: true }, (event, filename) => {
    if (!filename?.endsWith(".ts") || filename.includes("dist")) return;

    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(async () => {
      console.log(`Frontend file changed: ${filename}`);
      await buildFrontend(publicDir);
    }, 100);
  });
}

export async function createServer(config: BifbofConfig) {
  const store = new TaskStore(config);
  await store.load();
  store.watch();

  // Notify all clients on task changes
  store.onChange((tasks) => {
    const message = JSON.stringify({ type: "tasks", data: tasks });
    clients.forEach((ws) => ws.send(message));
  });

  const publicDir = join(import.meta.dir, "../public");

  // Build frontend on startup
  await buildFrontend(publicDir);

  // Watch for frontend changes
  watchFrontend(publicDir);

  const server = Bun.serve({
    port: config.port,

    fetch(req, server) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // WebSocket upgrade
      if (pathname === "/ws") {
        if (server.upgrade(req)) {
          return undefined;
        }
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      // API routes
      if (pathname === "/api/config") {
        return Response.json({ columns: config.columns });
      }

      if (pathname === "/api/tasks") {
        return Response.json(store.getAll());
      }

      if (pathname.startsWith("/api/tasks/") && req.method === "GET") {
        const id = pathname.slice("/api/tasks/".length);
        const task = store.get(id);
        if (!task) {
          return Response.json({ error: "Task not found" }, { status: 404 });
        }
        return Response.json(task);
      }

      // Static files
      if (pathname === "/" || pathname === "/index.html") {
        return serveFile(join(publicDir, "index.html"), "text/html");
      }

      if (pathname === "/styles.css") {
        return serveFile(join(publicDir, "styles.css"), "text/css");
      }

      // Serve built JavaScript from dist/
      if (pathname.startsWith("/dist/") && pathname.endsWith(".js")) {
        const filePath = join(publicDir, pathname.slice(1)); // Remove leading /
        return serveFile(filePath, "application/javascript");
      }

      // 404 for everything else
      return new Response("Not Found", { status: 404 });
    },

    websocket: {
      open(ws) {
        clients.add(ws);
        ws.send(JSON.stringify({ type: "tasks", data: store.getAll() }));
      },
      close(ws) {
        clients.delete(ws);
      },
      message(ws, message) {
        // Handle incoming messages if needed
      },
    },
  });

  console.log(`Bifbof running at http://localhost:${config.port}`);
  return server;
}

async function serveFile(path: string, contentType: string): Promise<Response> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return new Response("Not Found", { status: 404 });
  }
  const content = await file.text();
  return new Response(content, {
    headers: { "Content-Type": contentType },
  });
}
