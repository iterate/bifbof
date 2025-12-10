import { useState, useEffect } from "react";
import type { Task } from "../types.ts";

interface Props {
  task: Partial<Task> | null;
  isCreating: boolean;
  columns: string[];
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}

export function TaskModal({ task, isCreating, columns, onSave, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || columns[0] || "backlog");
    }
  }, [task, columns]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...task,
      title: title.trim(),
      description: description.trim(),
      status,
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <form
          onSubmit={handleSubmit}
          className="bg-[#fffff8] shadow-xl rounded-lg w-full max-w-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-[#d8d8d0]">
            <h2 className="text-xl font-semibold">
              {isCreating ? "New Task" : "Edit Task"}
            </h2>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-sans font-medium text-[#767676] tracking-wider mb-2">
                title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#d8d8d0] rounded bg-white focus:outline-none focus:border-[#999] transition-colors"
                placeholder="Task title"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#767676] tracking-wider mb-2">
                status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#d8d8d0] rounded bg-white focus:outline-none focus:border-[#999] transition-colors"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-sans font-medium text-[#767676] tracking-wider mb-2">
                description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-[#d8d8d0] rounded bg-white focus:outline-none focus:border-[#999] transition-colors resize-none"
                placeholder="Task description (optional)"
              />
            </div>
          </div>

          <div className="p-6 border-t border-[#d8d8d0] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#666] hover:text-[#111] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm bg-[#111] text-white rounded hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreating ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
