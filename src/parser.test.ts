import { describe, test, expect } from "bun:test";
import { parseTask } from "./parser";

describe("parseTask", () => {
  test("uses relative path as id when no frontmatter id", () => {
    const content = `# My Task

Some description here.
`;
    const task = parseTask("features/auth/login.md", content);
    expect(task.id).toBe("features/auth/login");
  });

  test("uses frontmatter id when provided", () => {
    const content = `---
id: custom-id
---

# My Task

Some description here.
`;
    const task = parseTask("features/auth/login.md", content);
    expect(task.id).toBe("custom-id");
  });

  test("uses frontmatter title when provided", () => {
    const content = `---
title: Custom Title
---

# Heading Title

Some description.
`;
    const task = parseTask("task.md", content);
    expect(task.title).toBe("Custom Title");
  });

  test("uses first # heading as title when no frontmatter title", () => {
    const content = `# My Heading Title

Some description here.
`;
    const task = parseTask("task.md", content);
    expect(task.title).toBe("My Heading Title");
  });

  test("uses id as title when no frontmatter title and no heading", () => {
    const content = `Just some content without a heading.
`;
    const task = parseTask("my-task.md", content);
    expect(task.title).toBe("my-task");
  });

  test("description is everything after the first heading", () => {
    const content = `---
title: My Task
---

# The Heading

First paragraph.

Second paragraph.

## Subheading

More content.
`;
    const task = parseTask("task.md", content);
    expect(task.description).toBe(`First paragraph.

Second paragraph.

## Subheading

More content.`);
  });

  test("description is entire body when no heading", () => {
    const content = `---
title: My Task
---

Some content here.
More content.
`;
    const task = parseTask("task.md", content);
    expect(task.description).toBe(`Some content here.
More content.`);
  });

  test("parses dependencies from frontmatter", () => {
    const content = `---
depends:
  - task-a
  - task-b
---

# My Task

Description.
`;
    const task = parseTask("task.md", content);
    expect(task.dependencies).toEqual(["task-a", "task-b"]);
  });

  test("returns empty dependencies when not specified", () => {
    const content = `# My Task

Description.
`;
    const task = parseTask("task.md", content);
    expect(task.dependencies).toEqual([]);
  });

  test("handles nested path correctly", () => {
    const content = `# Deep Task

In a nested folder.
`;
    const task = parseTask("infrastructure/monitoring/alerts.md", content);
    expect(task.id).toBe("infrastructure/monitoring/alerts");
    expect(task.title).toBe("Deep Task");
  });

  test("only matches single # headings, not ## or more", () => {
    const content = `## This is a subheading

# This is the real title

Description after title.
`;
    const task = parseTask("task.md", content);
    expect(task.title).toBe("This is the real title");
  });

  test("handles empty content", () => {
    const content = ``;
    const task = parseTask("empty.md", content);
    expect(task.id).toBe("empty");
    expect(task.title).toBe("empty");
    expect(task.description).toBe("");
    expect(task.dependencies).toEqual([]);
    expect(task.status).toBe("backlog");
  });

  test("handles frontmatter only", () => {
    const content = `---
id: only-frontmatter
title: Only Frontmatter
depends:
  - dep1
---
`;
    const task = parseTask("task.md", content);
    expect(task.id).toBe("only-frontmatter");
    expect(task.title).toBe("Only Frontmatter");
    expect(task.description).toBe("");
    expect(task.dependencies).toEqual(["dep1"]);
  });

  // Status tests
  test("uses frontmatter status when provided", () => {
    const content = `---
status: in-progress
---

# My Task

Description.
`;
    const task = parseTask("task.md", content);
    expect(task.status).toBe("in-progress");
  });

  test("defaults to backlog when no status provided", () => {
    const content = `# My Task

Description.
`;
    const task = parseTask("task.md", content);
    expect(task.status).toBe("backlog");
  });

  test("uses custom default status when provided", () => {
    const content = `# My Task

Description.
`;
    const task = parseTask("task.md", content, "todo");
    expect(task.status).toBe("todo");
  });

  test("parses all fields together correctly", () => {
    const content = `---
id: auth-login
title: Implement Login
status: in-progress
depends:
  - setup-db
  - auth-config
---

# Implement Login

Build the login form and authentication flow.

## Requirements

- Email/password login
- OAuth support
`;
    const task = parseTask("features/auth/login.md", content);
    expect(task.id).toBe("auth-login");
    expect(task.title).toBe("Implement Login");
    expect(task.status).toBe("in-progress");
    expect(task.dependencies).toEqual(["setup-db", "auth-config"]);
    expect(task.description).toBe(`Build the login form and authentication flow.

## Requirements

- Email/password login
- OAuth support`);
  });
});
