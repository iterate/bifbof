import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./hooks/use-websocket.ts";
import { Board } from "./components/board.tsx";
import { Panel } from "./components/panel.tsx";
import { TaskModal } from "./components/task-modal.tsx";
import type { Config, Task } from "./types.ts";

export function App() {
  const [config, setConfig] = useState<Config>({ columns: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);
  const draggedTaskRef = useRef<Task | null>(null);
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
        setNewTaskStatus(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId) ?? null;
    setSelectedTask(task);
  };

  const handleDragStart = (task: Task) => {
    draggedTaskRef.current = task;
  };

  const handleDrop = async (newStatus: string) => {
    const task = draggedTaskRef.current;
    console.log("handleDrop called", { task, newStatus });
    if (!task || task.status === newStatus) {
      draggedTaskRef.current = null;
      return;
    }

    console.log(`Updating task ${task.id} to status ${newStatus}`);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    console.log("Response:", res.status, await res.clone().text());

    draggedTaskRef.current = null;
  };

  const handleAddTask = (status: string) => {
    setNewTaskStatus(status);
  };

  const handleSaveTask = async (task: Partial<Task>) => {
    if (task.id) {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
    }
  };

  const handleCreateTask = async (task: Partial<Task>) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    setNewTaskStatus(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffff8] text-[#111] font-serif">
      <main className="flex-1 flex overflow-hidden">
        <Board
          columns={config.columns}
          tasks={tasks}
          onSelectTask={handleSelectTask}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onAddTask={handleAddTask}
        />
        <Panel
          task={selectedTask}
          columns={config.columns}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
        />
        {newTaskStatus && (
          <TaskModal
            task={{ title: "", description: "", status: newTaskStatus, dependencies: [] }}
            isCreating={true}
            columns={config.columns}
            onSave={handleCreateTask}
            onClose={() => setNewTaskStatus(null)}
          />
        )}
      </main>
    </div>
  );
}
