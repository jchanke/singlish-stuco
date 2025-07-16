# Remark YAML Table Plugin

This plugin converts YAML code blocks containing arrays of objects into HTML tables with dynamically generated headers.

## Usage

The plugin is automatically configured in `astro.config.mjs` and will process any YAML code blocks that contain an array of objects with consistent structure.

### Example Input

```yaml
- particle: lah
  explanation: |
    Commonly used to strengthen or finalize a statement.
    Can add adamance or reduce bluntness.
  examples: |
    1. Adding adamance:
    "Let's go now lah!"
    
    2. Reducing bluntness:
    "I'm tired lah, can we take a break?"

- particle: leh
  explanation: Used to express mild surprise or gentle agreement.
  examples: |
    A: "How was your exam?"
    B: "Ok leh. Easier than I thought."
```

### Different Data Structure Example

```yaml
- method: flashcards
  effectiveness: high
  time_required: 30 minutes
  difficulty: easy

- method: practice_tests
  effectiveness: very high
  time_required: 60 minutes
  difficulty: medium
```

### Output

The plugin automatically generates HTML tables with:
- **Dynamic Headers**: Column headers are inferred from the object keys
- **Formatted Content**: Text formatting is preserved for complex content
- **Consistent Structure**: Only converts arrays where all objects have the same keys

## Features

- **Dynamic Header Generation**: Automatically creates headers from YAML object keys
- **Flexible Data Support**: Works with any array of objects with consistent structure
- **Smart Detection**: Only processes YAML with valid tabular data structure
- **Header Formatting**: Converts snake_case/kebab-case to Title Case
- **Text Formatting**: Preserves line breaks and adds appropriate HTML formatting
- **Dialogue Support**: Recognizes dialogue patterns (A:, B:, etc.)
- **Numbered Lists**: Handles numbered items (1., 2., etc.)
- **Responsive Design**: Table is mobile-friendly
- **Dark Mode**: Supports dark theme styling

## Detection Rules

The plugin will convert YAML code blocks that meet these criteria:
1. Contains an array of objects
2. All objects have the same keys (consistent structure)
3. Objects are not nested arrays
4. At least one object exists in the array

## Header Formatting

Object keys are automatically formatted for display:
- `particle` → "Particle"
- `time_required` → "Time Required"
- `effectiveness` → "Effectiveness"
- `method` → "Method"

## Text Formatting Rules

- **Simple strings**: Displayed as plain text
- **Multi-line strings**: Formatted with special handling for:
  - **Numbered items** (1., 2., etc.) → `<div class="numbered-item">`
  - **Dialogue speakers** (A:, B:, etc.) → `<div class="dialogue-speaker">`
  - **Dialogue responses** (lines starting with :) → `<div class="dialogue-response">`
  - **Bullet points** (-, *) → `<div class="bullet-item">`
  - **Regular text** → `<div class="text-line">`

## CSS Classes

The plugin generates the following CSS classes for styling:

- `.particle-table` - Main table container
- `.numbered-item` - Numbered list items
- `.dialogue-speaker` - Dialogue speaker labels
- `.dialogue-response` - Dialogue responses
- `.bullet-item` - Bullet point items
- `.text-line` - Regular text lines

## Dependencies

- `js-yaml` - For parsing YAML content
- `unist-util-visit` - For traversing the AST

## Configuration

The plugin is configured in `astro.config.mjs`:

```javascript
import { remarkYamlTable } from "./src/utils/remarkYamlTable.js";

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkYamlTable]
    })
  ],
});
```
