import { TaskCard } from "./task-card.tsx";
import type { Task } from "../types.ts";

interface Props {
  name: string;
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export function Column({ name, tasks, onSelectTask }: Props) {
  return (
    <div className="flex-1 min-w-[200px] max-w-[320px]">
      <h3 className="text-xs font-sans font-medium text-[#767676] tracking-wider pb-4 mb-4 border-b border-[#e8e8e0]">
        {name} <span className="text-[#999]">({tasks.length})</span>
      </h3>
      <div className="flex flex-col gap-3">
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
