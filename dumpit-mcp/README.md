# dumpit-mcp

MCP server for [DumpIt](https://dumpit.page) — query and save to your DumpIt vault directly from Claude Desktop, Cursor, or any MCP-compatible client.

## Setup

1. Generate an API key from your DumpIt profile page (Settings → API Keys).
2. Add this to your MCP client config (e.g. `~/.claude/mcp.json` for Claude Desktop):

```json
{
  "mcpServers": {
    "dumpit": {
      "command": "npx",
      "args": ["-y", "dumpit-mcp"],
      "env": {
        "DUMPIT_API_KEY": "dk_live_...",
        "DUMPIT_BASE_URL": "https://app.dumpit.page"
      }
    }
  }
}
```

## Tools

- **ask_vault** — ask a natural-language question, get a cited answer grounded in your saved vault.
- **search_vault** — raw semantic search over your saved vault, no answer generation.
- **save_to_vault** — save a link or note to your vault.

## Local development

```bash
npm install
npm run build
DUMPIT_API_KEY=dk_live_... DUMPIT_BASE_URL=http://localhost:3000 npm start
```
