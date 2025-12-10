import type { Task } from "../types.ts";

interface Props {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: Props) {
  const showId = task.id !== task.title;

  return (
    <div
      onClick={onClick}
      className="py-3 pl-4 pr-3 border-l-2 border-[#a00000] cursor-pointer hover:bg-[#f4f4ee] transition-colors"
    >
      <p className="text-base font-medium leading-snug">{task.title}</p>
      {showId && (
        <p className="text-xs font-mono text-[#999] mt-1">{task.id}</p>
      )}
      {task.dependencies.length > 0 && (
        <p className="text-xs font-sans text-[#767676] mt-2">
          depends on {task.dependencies.join(", ")}
        </p>
      )}
    </div>
  );
}
