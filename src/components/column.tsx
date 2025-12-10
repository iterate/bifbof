import { useState } from "react";
import { TaskCard } from "./task-card.tsx";
import type { Task } from "../types.ts";

interface Props {
  name: string;
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onDragStart: (task: Task) => void;
  onDrop: (status: string) => void;
  onAddTask: (status: string) => void;
}

export function Column({ name, tasks, onSelectTask, onDragStart, onDrop, onAddTask }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(name);
  };

  return (
    <div
      className={`flex-1 min-w-[200px] max-w-[320px] flex flex-col transition-colors ${
        isDragOver ? "bg-[#f0f0e8]" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="text-sm font-serif font-normal text-[#333] tracking-wide uppercase pb-3 mb-4 border-b border-[#d8d8d0]">
        {name} <span className="text-[#888] font-light">({tasks.length})</span>
      </h3>
      <div className="flex flex-col gap-3 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onSelectTask(task.id)}
            onDragStart={() => onDragStart(task)}
          />
        ))}
      </div>
      <button
        onClick={() => onAddTask(name)}
        className="mt-4 py-2 text-[#999] hover:text-[#666] transition-colors text-sm flex items-center justify-center gap-1 opacity-40 hover:opacity-100"
      >
        <span className="text-lg leading-none">+</span>
        <span>Add task</span>
      </button>
    </div>
  );
}
