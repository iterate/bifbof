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
    <div className="min-h-screen flex flex-col bg-[#fffff8] text-[#111] font-serif">
      <header className="px-8 py-5 border-b border-[#e8e8e0]">
        <h1 className="text-lg font-normal tracking-tight">bifbof</h1>
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
