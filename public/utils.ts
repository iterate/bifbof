// Helper functions for the frontend

export function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function getPriorityColor(priority: string | undefined): string {
  const colors: Record<string, string> = {
    high: "var(--color-priority-high)",
    medium: "var(--color-priority-medium)",
    low: "var(--color-priority-low)",
  };
  return colors[priority ?? ""] ?? "var(--color-border)";
}
