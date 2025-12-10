import type { Task } from "../types.ts";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export function Panel({ task, onClose }: Props) {
  const showId = task && task.id !== task.title;

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
              <h2 className="text-2xl md:text-3xl font-semibold leading-tight pr-8">
                {task.title}
              </h2>
              <button
                onClick={onClose}
                className="text-[#999] hover:text-[#111] text-2xl leading-none p-2 -m-2 transition-colors"
                aria-label="Close"
              >
                &times;
              </button>
            </header>

            <div className="space-y-8">
              {showId && (
                <Field label="id">
                  <span className="font-mono text-sm">{task.id}</span>
                </Field>
              )}

              <Field label="status">
                <span className="text-sm">{task.status}</span>
              </Field>

              {task.dependencies.length > 0 && (
                <Field label="dependencies">
                  <span className="text-sm">{task.dependencies.join(", ")}</span>
                </Field>
              )}

              {task.description && (
                <Field label="description">
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </div>
                </Field>
              )}
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
