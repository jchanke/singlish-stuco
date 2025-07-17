import yaml from "js-yaml";
import { marked } from "marked";
import { visit } from "unist-util-visit";

import type * as CSS from "csstype";
import type { Root } from "mdast";

type TableItem = Partial<Record<string, string>>;

interface TableFrontmatter<Item extends TableItem> {
  headers?: Partial<
    Record<
      keyof Item,
      {
        name?: string;
        style?: CSS.PropertiesHyphen;
      }
    >
  >;
}

/**
 * Remark plugin to convert YAML code blocks to HTML tables
 * Automatically infers table headers from YAML object keys
 * Works with any array of objects with consistent structure
 *
 * *authored by Claude Sonnet 4. thanks, Copilot!*
 */
export const remarkYamlTable = () => {
  return (tree: Root) => {
    // for each node: get its parent and its index in parent's children array
    visit(tree, "code", (node, index, parent) => {
      // only process YAML code blocks
      if (node.lang !== "yaml") {
        return;
      }

      try {
        // check if YAML has front-matter style headers (separated by ---)
        let yamlContent = node.value;
        let customHeaders: TableFrontmatter<TableItem>["headers"] | undefined;

        if (yamlContent.includes("---")) {
          const parts = yamlContent.split("---");
          if (parts.length >= 2) {
            try {
              // parse the front-matter section
              const frontmatter = yaml.load(parts[0].trim());
              if (
                frontmatter &&
                typeof frontmatter === "object" &&
                "headers" in frontmatter &&
                typeof frontmatter.headers === "object"
              ) {
                customHeaders =
                  frontmatter.headers as TableFrontmatter<TableItem>["headers"];

                // use the content after the --- separator
                yamlContent = parts.slice(1).join("---").trim();
              }
            } catch (frontMatterError) {
              // if front-matter parsing fails, use the original content
              yamlContent = node.value;
            }
          }
        }

        // parse the YAML content (either original, or after front-matter extraction)
        const data = yaml.load(yamlContent) as TableItem[];

        // csheck if it's an array of objects with consistent structure
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          !Array.isArray(data[0]) &&
          Object.keys(data[0]).length > 0
        ) {
          // verify all objects have the same structure (same keys)
          const firstKeys = Object.keys(data[0]).sort();
          const isConsistent = data.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              Object.keys(item).sort().join(",") === firstKeys.join(",")
          );

          if (isConsistent) {
            // convert to HTML table
            const htmlTable = generateYamlTable(data, customHeaders);

            // Replace the code block with an HTML node
            const htmlNode = {
              type: "html" as const,
              value: htmlTable,
            };

            if (parent && typeof index === "number") {
              parent.children[index] = htmlNode;
            }
          }
        }
      } catch (error) {
        // If YAML parsing fails, leave the code block as is
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn("Failed to parse YAML in code block:", errorMessage);
      }
    });
  };
};

/**
 * Generate HTML table from array of objects
 */
function generateYamlTable<T extends TableItem>(
  data: T[],
  columnInfo?: TableFrontmatter<T>["headers"]
): string {
  // infer column headers from the first object's keys
  const headers = Object.keys(data[0]) as Array<keyof T>;

  // generate table header
  const tableHeader = headers
    .map((header) => {
      const name = columnInfo && columnInfo[header]?.name;
      const displayName =
        name ||
        // otherwise, stringify the header, capitalizing the first letter
        String(header)
          .replace(/\b\w/g, (char) => char.toUpperCase())
          .replace(/[_-]/g, " "); // replace _/- with " "
      return `<th>${escapeHtml(displayName)}</th>`;
    })
    .join("");

  // generate table rows
  const tableRows = data
    .map((item) => {
      const cells = headers
        .map((header) => {
          const style = columnInfo && columnInfo[header]?.style;
          const cssString = Object.entries(style || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(";");
          const value = item[header];
          const formattedValue = formatText(value || "");
          return style
            ? `<td style=${cssString}}>${formattedValue}</td>`
            : `<td>${formattedValue}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr>
          ${tableHeader}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}

/**
 * Parse Markdown formatting and convert to HTML using marked
 */
function parseMarkdown(text: string): string {
  if (!text) return "";

  // Use parseInline to only handle inline elements (bold, italic, code, links)
  const result = marked.parseInline(text);
  return typeof result === "string" ? result : "";
}

/**
 * Format text content - parse Markdown first, then preserve structure and convert to HTML
 */
function formatText(text: string | undefined): string {
  if (!text) return "";

  // Handle both string and multi-line string formats
  const textString = Array.isArray(text) ? text.join("\n") : String(text);

  // If it's a simple one-line string without special formatting, parse Markdown and return
  if (
    !textString.includes("\n") &&
    !textString.match(/^\d+[\.\)]\s/) &&
    !textString.match(/^[A-Z]:\s/) &&
    !textString.match(/^\s*[-*]\s/)
  ) {
    return parseMarkdown(textString);
  }

  // Otherwise, use the line-by-line approach for dialogue and custom formatting
  return (
    textString
      .replace(/\n\n/g, "\n<br>\n")
      .split("\n")
      .map((line) => line.trim())
      // .filter((line) => line.length > 0)
      .map((line) => {
        // Parse Markdown first, then wrap in appropriate div
        const markdownParsed = parseMarkdown(line);

        // Handle numbered lists (1., 2., etc.) or numbered with parentheses
        if (/^\d+[\.\)]\s/.test(line)) {
          return `<div class="numbered-item">${markdownParsed}</div>`;
        }
        // Handle bullet points or dashes (but only if not already parsed as Markdown)
        if (/^\s*[-*]\s/.test(line)) {
          return `<div class="bullet-item">${markdownParsed}</div>`;
        }
        // Handle lettered lists (A:, B:, etc.)
        if (/^[A-Z]:\s/.test(line)) {
          return `<div class="dialogue-speaker">${markdownParsed}</div>`;
        }
        // Handle <br>
        if (/<br>/.test(line)) {
          return line;
        }
        // Handle regular lines
        return `<div class="text-line">${markdownParsed}</div>`;
      })
      .join("")
  );
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
