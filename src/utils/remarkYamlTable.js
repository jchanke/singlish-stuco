import yaml from "js-yaml";
import { marked } from "marked";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to convert YAML code blocks to HTML tables
 * Automatically infers table headers from YAML object keys
 * Works with any array of objects with consistent structure
 */
export function remarkYamlTable() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      // Only process YAML code blocks
      if (node.lang !== "yaml") {
        return;
      }

      try {
        // Check if YAML has front-matter style headers (separated by ---)
        let customHeaders = null;
        let yamlContent = node.value;

        if (yamlContent.includes("---")) {
          const parts = yamlContent.split("---");
          if (parts.length >= 2) {
            try {
              // Parse the front-matter section
              const frontMatter = yaml.load(parts[0].trim());
              if (frontMatter && frontMatter.headers) {
                customHeaders = frontMatter.headers;
                // Use the content after the --- separator
                yamlContent = parts.slice(1).join("---").trim();
              }
            } catch (frontMatterError) {
              // If front-matter parsing fails, use the original content
              yamlContent = node.value;
            }
          }
        }

        // Parse the YAML content (either original or after front-matter extraction)
        const data = yaml.load(yamlContent);

        // Check if it's an array of objects with consistent structure
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          !Array.isArray(data[0]) &&
          Object.keys(data[0]).length > 0
        ) {
          // Verify all objects have the same structure (same keys)
          const firstKeys = Object.keys(data[0]).sort();
          const isConsistent = data.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item) &&
              Object.keys(item).sort().join(",") === firstKeys.join(",")
          );

          if (isConsistent) {
            // Convert to HTML table
            const htmlTable = generateYamlTable(data, customHeaders);

            // Replace the code block with an HTML node
            const htmlNode = {
              type: "html",
              value: htmlTable,
            };

            parent.children[index] = htmlNode;
          }
        }
      } catch (error) {
        // If YAML parsing fails, leave the code block as is
        console.warn("Failed to parse YAML in code block:", error.message);
      }
    });
  };
}

/**
 * Generate HTML table from array of objects
 * @param {Array} data - Array of objects with consistent structure
 * @param {Object} customHeaders - Optional custom header mappings
 * @returns {string} HTML table string
 */
function generateYamlTable(data, customHeaders = null) {
  // Infer column headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Generate table header
  const tableHeader = headers
    .map((header) => {
      let displayName;

      // Use custom header if provided, otherwise auto-generate
      if (customHeaders && customHeaders[header]) {
        displayName = customHeaders[header];
      } else {
        // Capitalize first letter and replace underscores/dashes with spaces
        displayName = header
          .replace(/[_-]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      }

      return `<th>${escapeHtml(displayName)}</th>`;
    })
    .join("");

  // Generate table rows
  const tableRows = data
    .map((item) => {
      const cells = headers
        .map((header) => {
          const value = item[header];
          const formattedValue = formatText(value);
          return `<td>${formattedValue}</td>`;
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
 * @param {string} text - Text with Markdown formatting
 * @returns {string} Text with HTML formatting
 */
function parseMarkdown(text) {
  if (!text) return "";

  // Use parseInline to only handle inline elements (bold, italic, code, links)
  return marked.parseInline(text);
}

/**
 * Format text content - parse Markdown first, then preserve structure and convert to HTML
 * @param {string} text - Raw text content
 * @returns {string} Formatted HTML
 */
function formatText(text) {
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
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
