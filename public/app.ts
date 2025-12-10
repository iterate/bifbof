import { escapeHtml } from "./utils.ts";

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  status: string;
}

interface Config {
  columns: string[];
}

// State
let config: Config = { columns: [] };
let tasks: Task[] = [];
let selectedTask: Task | null = null;

// DOM refs
const board = document.getElementById("board")!;
const panel = document.getElementById("panel")!;
const panelTitle = document.getElementById("panel-title")!;
const panelContent = document.getElementById("panel-content")!;
const panelClose = document.getElementById("panel-close")!;

// Initialize
async function init() {
  // Load config
  const configRes = await fetch("/api/config");
  config = await configRes.json();

  // Connect WebSocket for live updates
  connectWebSocket();

  // Event listeners
  panelClose.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
}

function connectWebSocket() {
  const ws = new WebSocket(`ws://${location.host}/ws`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "tasks") {
      tasks = msg.data;
      render();
    }
  };

  ws.onclose = () => {
    console.log("WebSocket closed, reconnecting...");
    setTimeout(connectWebSocket, 1000);
  };
}

function render() {
  board.innerHTML = "";

  for (const column of config.columns) {
    const columnTasks = tasks.filter((t) => t.status === column);

    const col = document.createElement("div");
    col.className = "column";
    col.innerHTML = `
      <h3 class="column__header">
        ${column} <span class="column__count">(${columnTasks.length})</span>
      </h3>
      <div class="column__body" data-column="${column}">
        ${columnTasks.map((task) => taskCard(task)).join("")}
      </div>
    `;

    board.appendChild(col);
  }

  // Add click handlers to cards
  board.querySelectorAll("[data-task-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const taskId = (card as HTMLElement).dataset.taskId;
      if (taskId) openPanel(taskId);
    });
  });
}

function taskCard(task: Task): string {
  return `
    <div class="card" data-task-id="${task.id}">
      <p class="card__title">${escapeHtml(task.title)}</p>
      <p class="card__id">${escapeHtml(task.id)}</p>
      ${
        task.dependencies.length
          ? `
        <p class="card__deps">
          Depends: ${task.dependencies.join(", ")}
        </p>
      `
          : ""
      }
    </div>
  `;
}

function openPanel(taskId: string) {
  selectedTask = tasks.find((t) => t.id === taskId) ?? null;
  if (!selectedTask) return;

  panelTitle.textContent = selectedTask.title;
  panelContent.innerHTML = `
    <div class="panel__fields">
      <div class="field">
        <label class="field__label">ID</label>
        <p class="field__value field__value--mono">${escapeHtml(selectedTask.id)}</p>
      </div>

      <div class="field">
        <label class="field__label">Status</label>
        <p class="field__value">${escapeHtml(selectedTask.status)}</p>
      </div>

      <div class="field">
        <label class="field__label">Dependencies</label>
        ${
          selectedTask.dependencies.length
            ? `<p class="field__value">${selectedTask.dependencies
                .map((d) => `<span class="field__link">${escapeHtml(d)}</span>`)
                .join(", ")}</p>`
            : `<p class="field__value field__value--muted">None</p>`
        }
      </div>

      <div class="field">
        <label class="field__label">Description</label>
        <pre class="field__pre">${escapeHtml(selectedTask.description)}</pre>
      </div>
    </div>
  `;

  panel.classList.add("panel--open");
}

function closePanel() {
  panel.classList.remove("panel--open");
  selectedTask = null;
}

// Start
init();
