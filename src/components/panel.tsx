import { useState, useEffect } from "react";
import type { Task } from "../types.ts";

interface Props {
  task: Task | null;
  columns: string[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

export function Panel({ task, columns, onClose, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setIsEditing(false);
    }
  }, [task]);

  const showId = task && task.id !== task.title;

  const handleSave = () => {
    if (!task || !title.trim()) return;
    onSave({
      id: task.id,
      title: title.trim(),
      description: description.trim(),
      status,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
    setIsEditing(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/10 z-40 transition-opacity ${
          task ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[min(90vw,720px)] bg-[#fffff8] shadow-[-2px_0_20px_rgba(0,0,0,0.06)] z-50 overflow-y-auto transition-transform duration-200 ${
          task ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {task && (
          <div className="p-10 md:p-16 max-w-[60ch] mx-auto">
            <header className="flex justify-between items-start mb-10">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 text-2xl md:text-3xl font-semibold leading-tight pr-8 bg-transparent border-b border-[#d8d8d0] focus:border-[#999] focus:outline-none"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight pr-8">
                  {task.title}
                </h2>
              )}
              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="text-[#999] hover:text-[#111] text-sm px-3 py-1 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!title.trim()}
                      className="text-sm px-3 py-1 bg-[#111] text-white rounded hover:bg-[#333] transition-colors disabled:opacity-40"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#999] hover:text-[#111] text-sm px-3 py-1 border border-[#d8d8d0] hover:border-[#999] rounded transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-[#999] hover:text-[#111] text-2xl leading-none p-2 -m-2 transition-colors"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </header>

            <div className="space-y-8">
              {showId && (
                <Field label="id">
                  <span className="font-mono text-sm">{task.id}</span>
                </Field>
              )}

              <Field label="status">
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-2 py-1 border border-[#d8d8d0] rounded bg-white focus:outline-none focus:border-[#999] text-sm"
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm">{task.status}</span>
                )}
              </Field>

              {task.dependencies.length > 0 && (
                <Field label="dependencies">
                  <span className="text-sm">{task.dependencies.join(", ")}</span>
                </Field>
              )}

              <Field label="description">
                {isEditing ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-[#d8d8d0] rounded bg-white focus:outline-none focus:border-[#999] text-base leading-relaxed resize-none"
                    placeholder="Task description (optional)"
                  />
                ) : task.description ? (
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </div>
                ) : (
                  <span className="text-sm text-[#999] italic">No description</span>
                )}
              </Field>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-sans font-medium text-[#767676] tracking-wider mb-2">
        {label}
      </label>
      <div className="text-[#111]">{children}</div>
    </div>
  );
}
