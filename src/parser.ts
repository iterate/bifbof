import type { Task } from "./types";

interface Frontmatter {
  id?: string;
  title?: string;
  status?: string;
  depends?: string[];
}

/**
 * Parse YAML-like frontmatter from markdown content.
 * Supports simple key: value pairs and arrays with - item syntax.
 */
function parseFrontmatter(content: string): { attributes: Frontmatter; body: string } {
  const attributes: Frontmatter = {};

  // Check if content starts with frontmatter delimiter
  if (!content.startsWith("---")) {
    return { attributes, body: content };
  }

  // Find the closing delimiter
  const endIndex = content.indexOf("\n---", 3);
  if (endIndex === -1) {
    return { attributes, body: content };
  }

  const frontmatterBlock = content.slice(4, endIndex); // Skip opening "---\n"
  const body = content.slice(endIndex + 4).trim(); // Skip closing "\n---"

  // Parse the frontmatter lines
  const lines = frontmatterBlock.split("\n");
  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    // Array item: "  - value"
    const arrayMatch = line.match(/^\s+-\s+(.+)$/);
    if (arrayMatch && currentKey) {
      if (!currentArray) {
        currentArray = [];
      }
      currentArray.push(arrayMatch[1].trim());
      continue;
    }

    // If we were building an array, save it
    if (currentKey && currentArray) {
      (attributes as any)[currentKey] = currentArray;
      currentArray = null;
    }

    // Key-value pair: "key: value" or "key:"
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value) {
        (attributes as any)[currentKey] = value;
        currentKey = null; // Not expecting array items
      }
      // If no value, might be followed by array items
    }
  }

  // Save any pending array
  if (currentKey && currentArray) {
    (attributes as any)[currentKey] = currentArray;
  }

  return { attributes, body };
}

/**
 * Parse a task from its relative path and file contents.
 *
 * ID: from frontmatter `id` field, or relative path without .md extension
 * Title: from frontmatter `title` field, or first # heading, or same as id
 * Description: everything after the first # heading line (or entire body if no heading)
 * Dependencies: from frontmatter `depends` field
 * Status: from frontmatter `status` field, defaults to "backlog"
 */
export function parseTask(relativePath: string, content: string, defaultStatus = "backlog"): Task {
  const { attributes, body } = parseFrontmatter(content);

  // ID: frontmatter id, or relative path without .md
  const id = attributes.id ?? relativePath.replace(/\.md$/, "");

  // Parse title and description from body
  const lines = body.split("\n");
  let title: string | undefined = attributes.title;
  let descriptionStartIndex = 0;

  // Look for first # heading (single # only)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^#\s+(.+)$/);
    if (match) {
      if (!title) {
        title = match[1].trim();
      }
      descriptionStartIndex = i + 1;
      break;
    }
  }

  // If no title found, use id
  if (!title) {
    title = id;
  }

  // Description is everything after the heading line
  const description = lines
    .slice(descriptionStartIndex)
    .join("\n")
    .trim();

  // Dependencies from frontmatter
  const dependencies = attributes.depends ?? [];

  // Status from frontmatter, default to defaultStatus
  const status = attributes.status ?? defaultStatus;

  return {
    id,
    title,
    description,
    dependencies,
    status,
  };
}
