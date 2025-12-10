// State
let config = { columns: [] };
let tasks = [];
let selectedTask = null;

// DOM refs
const board = document.getElementById("board");
const panel = document.getElementById("panel");
const panelTitle = document.getElementById("panel-title");
const panelContent = document.getElementById("panel-content");
const panelClose = document.getElementById("panel-close");

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
    col.className = "flex-shrink-0 w-72 bg-gray-800 rounded-lg p-4";
    col.innerHTML = `
      <h3 class="text-sm font-medium text-gray-400 uppercase mb-4">
        ${column} <span class="text-gray-500">(${columnTasks.length})</span>
      </h3>
      <div class="space-y-3 min-h-[200px]" data-column="${column}">
        ${columnTasks.map((task) => taskCard(task)).join("")}
      </div>
    `;

    board.appendChild(col);
  }

  // Add click handlers to cards
  board.querySelectorAll("[data-task-id]").forEach((card) => {
    card.addEventListener("click", () => openPanel(card.dataset.taskId));
  });
}

function taskCard(task) {
  return `
    <div
      class="bg-gray-900 rounded p-3 cursor-pointer hover:bg-gray-850 border-l-4 border-l-blue-500"
      data-task-id="${task.id}"
    >
      <p class="font-medium text-sm">${escapeHtml(task.title)}</p>
      <p class="text-xs text-gray-500 mt-1">${escapeHtml(task.id)}</p>
      ${task.dependencies.length ? `
        <p class="text-xs text-gray-400 mt-2">
          Depends: ${task.dependencies.join(", ")}
        </p>
      ` : ""}
    </div>
  `;
}

function openPanel(taskId) {
  selectedTask = tasks.find((t) => t.id === taskId);
  if (!selectedTask) return;

  panelTitle.textContent = selectedTask.title;
  panelContent.innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">ID</label>
        <p class="text-sm font-mono bg-gray-900 rounded px-3 py-2">${escapeHtml(selectedTask.id)}</p>
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-1">Status</label>
        <p class="text-sm bg-gray-900 rounded px-3 py-2">${escapeHtml(selectedTask.status)}</p>
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-1">Dependencies</label>
        ${selectedTask.dependencies.length
          ? `<p class="text-sm">${selectedTask.dependencies.map(d => `<span class="text-blue-400">${escapeHtml(d)}</span>`).join(", ")}</p>`
          : `<p class="text-sm text-gray-500">None</p>`
        }
      </div>

      <div>
        <label class="block text-sm text-gray-400 mb-1">Description</label>
        <pre class="bg-gray-900 rounded p-3 text-sm overflow-auto max-h-96 whitespace-pre-wrap">${escapeHtml(selectedTask.description)}</pre>
      </div>
    </div>
  `;

  panel.classList.remove("translate-x-full");
}

function closePanel() {
  panel.classList.add("translate-x-full");
  selectedTask = null;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Start
init();
