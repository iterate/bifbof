import { TaskCard } from "./task-card.tsx";
import type { Task } from "../types.ts";

interface Props {
  name: string;
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export function Column({ name, tasks, onSelectTask }: Props) {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase mb-4">
        {name}{" "}
        <span className="text-gray-500">({tasks.length})</span>
      </h3>
      <div className="flex flex-col gap-3 min-h-48">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onSelectTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
