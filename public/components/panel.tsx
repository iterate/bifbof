import type { Task } from "../types.ts";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export function Panel({ task, onClose }: Props) {
  return (
    <aside
      className={`w-96 border-l border-gray-700 bg-gray-800 fixed right-0 top-16 bottom-0 overflow-y-auto transition-transform duration-200 ${
        task ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {task && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-xl p-2 leading-none"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="ID" value={task.id} mono />
            <Field label="Status" value={task.status} />
            <Field
              label="Dependencies"
              value={
                task.dependencies.length > 0
                  ? task.dependencies.join(", ")
                  : "None"
              }
              muted={task.dependencies.length === 0}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-400">Description</label>
              <pre className="bg-gray-900 rounded p-3 text-sm overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                {task.description || "No description"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function Field({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400">{label}</label>
      <p
        className={`bg-gray-900 rounded px-3 py-2 text-sm ${mono ? "font-mono" : ""} ${muted ? "text-gray-500" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
