import { Column } from "./column.tsx";
import type { Task } from "../types.ts";

interface Props {
  columns: string[];
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export function Board({ columns, tasks, onSelectTask }: Props) {
  return (
    <div className="flex-1 flex gap-6 p-8 bg-[#fafaf4]">
      {columns.map((column) => (
        <Column
          key={column}
          name={column}
          tasks={tasks.filter((t) => t.status === column)}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  );
}
