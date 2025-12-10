import { useState, useEffect } from "react";
import { useWebSocket } from "./hooks/use-websocket.ts";
import { Board } from "./components/board.tsx";
import { Panel } from "./components/panel.tsx";
import type { Config, Task } from "./types.ts";

export function App() {
  const [config, setConfig] = useState<Config>({ columns: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { tasks } = useWebSocket();

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedTask(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId) ?? null;
    setSelectedTask(task);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="border-b border-gray-700 px-6 h-16 flex items-center">
        <h1 className="text-xl font-semibold">Bifbof</h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <Board
          columns={config.columns}
          tasks={tasks}
          onSelectTask={handleSelectTask}
        />
        <Panel task={selectedTask} onClose={() => setSelectedTask(null)} />
      </main>
    </div>
  );
}
