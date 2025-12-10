import { useState, useEffect, useCallback, useRef } from "react";
import type { Task } from "../types.ts";

export function useWebSocket() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(`ws://${location.host}/ws`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "tasks") {
        setTasks(msg.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 1 second
      setTimeout(connect, 1000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { tasks, connected };
}
