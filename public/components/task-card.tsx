import type { Task } from "../types.ts";

interface Props {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-900 rounded p-3 cursor-pointer border-l-4 border-blue-500 hover:bg-gray-700 transition-colors"
    >
      <p className="text-sm font-medium">{task.title}</p>
      <p className="text-xs text-gray-500 mt-1">{task.id}</p>
      {task.dependencies.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          Depends: {task.dependencies.join(", ")}
        </p>
      )}
    </div>
  );
}
