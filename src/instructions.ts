export function printInstructions(): void {
  console.log(`This repo uses bifbof for git-first task management

Tasks are just markdown files anywhere in the tasks/ folder (including subfolders).

With optional frontmatter. A markdown file with some words in it is a valid task.

File path without .md = task ID.

Format (frontmatter is optional):
  ---
  status: backlog|todo|in-progress|done
  dependsOn:
    - other-task-id
  ---
  # Title (optional - default to filename without .md)

  Description here.


Usage:
  - Add task: create tasks/my-task.md
  - Change status: edit status in frontmatter
  - Nest tasks: use folders like tasks/feature/subtask.md
  - If during a task you think of other work that should be done, just make more tasks (but check with your human)

`);
}
