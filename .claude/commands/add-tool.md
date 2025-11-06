---
description: Add a new tool to the Obsidian Tools knowledge base
globs: ""
alwaysApply: false
---

# Add Tool to Knowledge Base

You are helping the user add a new tool to their Tools knowledge base in Obsidian.

## Workflow

Follow these steps in order:

### 1. Gather Information

Ask the user for the following information (ask all questions at once):
- **Tool name** (e.g., "Docker", "Burp Suite", "n8n")
- **Source URL** (where they found it, article, GitHub, etc.)
- **Category** (homelab / security / automation / development)
- **Priority** (high / medium / low)
- **Brief description** (one sentence about what it does)

### 2. Check for Duplicates

**Before creating the tool:**
1. Read `C:\Users\selin\Obsidian\The Beginning\Knowledge Base\Tools\_Index.md`
2. Search for the tool name (case-insensitive) in the index
3. Also check if a file exists at the expected path

**If tool already exists:**
- Inform the user: "This tool is already in your knowledge base at [[ToolName]]"
- Ask if they want to:
  - **View** the existing tool page
  - **Update** the existing tool page with new information
  - **Skip** (tool already captured)
  - **Create anyway** (if it's actually a different tool)

**If duplicate found, stop here unless user chooses to proceed.**

### 3. Create Tool File

Using the template at `C:\Users\selin\Obsidian\The Beginning\Templates\Tool-Template.md`:

1. Read the template
2. Create new file at: `C:\Users\selin\Obsidian\The Beginning\Knowledge Base\Tools\[ToolName].md`
   - Use kebab-case for multi-word tools (e.g., "Burp-Suite.md", "GitHub-Actions.md")
3. Fill in the metadata frontmatter:
   - status: to-explore
   - category: [from user input]
   - priority: [from user input]
   - source: [from user input]
   - date_added: [today's date in YYYY-MM-DD format]
4. Fill in the tool name and basic information
5. Add the brief description to the Overview section

### 4. Update Index

Read `C:\Users\selin\Obsidian\The Beginning\Knowledge Base\Tools\_Index.md` and update:

1. **High Priority section** - If priority is "high", add to this section
2. **By Category section** - Add to appropriate category with format:
   ```
   - [[ToolName]] - Brief description
   ```
3. **By Status section** - Add to "🔍 To Explore" section with format:
   ```
   - [[ToolName]] - Brief description
   ```
4. Update the "Last Updated" date at the top

### 5. Confirm Completion

Provide the user with:
- Link to the new tool file
- Confirmation of category and priority
- Next steps suggestion (e.g., "You can now explore this tool and update its page with your findings")

## Important Notes

- **Always check for duplicates first** - Prevents adding the same tool twice
- Always use the Tool-Template.md as the base
- Maintain consistent formatting with existing tools
- Use proper Obsidian wiki-link format: `[[ToolName]]`
- For tool names with spaces, use hyphens in filenames but spaces in wiki links
- Keep descriptions brief and actionable in the index
- Ensure metadata frontmatter is valid YAML

## Example

User input:
- Tool: Portainer
- Source: https://www.portainer.io/
- Category: homelab
- Priority: medium
- Description: Web-based Docker management interface

Workflow:
1. Check index - Portainer not found ✓
2. Creates file: `C:\Users\selin\Obsidian\The Beginning\Knowledge Base\Tools\Portainer.md`
3. Adds to index under "Homelab & Infrastructure"
4. Adds to "To Explore" status section
5. Fills template with provided information
