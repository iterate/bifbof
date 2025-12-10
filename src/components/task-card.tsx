import type { Task } from "../types.ts";

interface Props {
  task: Task;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({ task, onClick, onDragStart }: Props) {
  const showId = task.id !== task.title;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(e, task);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="py-3 pl-4 pr-3 border-l-2 border-[#a00000] cursor-grab bg-white hover:bg-[#f5f5ef] transition-colors active:cursor-grabbing"
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
