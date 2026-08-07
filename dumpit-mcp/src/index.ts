#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

const API_KEY = process.env.DUMPIT_API_KEY;
const BASE_URL = process.env.DUMPIT_BASE_URL || 'https://app.dumpit.page';

if (!API_KEY) {
  console.error('DUMPIT_API_KEY environment variable is required. Generate one from your DumpIt profile.');
  process.exit(1);
}

interface DumpItErrorBody {
  error?: string;
  code?: string;
}

async function callDumpIt(path: string, body: unknown): Promise<any> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({} as DumpItErrorBody));

  if (!response.ok) {
    const errorBody = data as DumpItErrorBody;
    if (response.status === 403 && errorBody.code === 'UPGRADE_REQUIRED') {
      throw new McpError(ErrorCode.InvalidRequest, errorBody.error || 'Upgrade required to use this feature.');
    }
    throw new McpError(ErrorCode.InternalError, errorBody.error || `DumpIt API error (${response.status})`);
  }

  return data;
}

const server = new Server(
  { name: 'dumpit-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'ask_vault',
      description:
        "Ask a natural-language question and get a cited answer grounded in the user's saved DumpIt vault — not general knowledge.",
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The question to ask.' },
          mode: {
            type: 'string',
            enum: ['mine', 'shared', 'all'],
            description: 'Search scope: only your saves, only public shared saves, or both. Defaults to "all".',
          },
        },
        required: ['question'],
      },
    },
    {
      name: 'search_vault',
      description: "Run a raw semantic search over the user's saved DumpIt vault and return matching chunks without generating an answer.",
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query.' },
          mode: {
            type: 'string',
            enum: ['mine', 'shared', 'all'],
            description: 'Search scope: only your saves, only public shared saves, or both. Defaults to "all".',
          },
          limit: { type: 'number', description: 'Maximum number of results to return.' },
        },
        required: ['query'],
      },
    },
    {
      name: 'save_to_vault',
      description: 'Save a link or note to the DumpIt vault so it can be indexed and later retrieved.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title for the saved item.' },
          link: { type: 'string', description: 'A URL starting with http:// or https://. Omit for a plain note.' },
          note: { type: 'string', description: 'Freeform note text. Omit if saving a link without a note.' },
          tag: { type: 'string', description: 'Optional category tag.' },
          is_public: { type: 'boolean', description: 'Whether this item should be publicly visible. Defaults to false.' },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'ask_vault': {
      const data = await callDumpIt('/api/ai/ask', {
        question: args?.question,
        mode: args?.mode,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify({ answer: data.answer, sources: data.sources }, null, 2) }],
      };
    }
    case 'search_vault': {
      const data = await callDumpIt('/api/ai/search', {
        query: args?.query,
        mode: args?.mode,
        limit: args?.limit,
      });
      return { content: [{ type: 'text', text: JSON.stringify(data.results, null, 2) }] };
    }
    case 'save_to_vault': {
      const data = await callDumpIt('/api/resources', {
        title: args?.title,
        link: args?.link,
        note: args?.note,
        tag: args?.tag,
        is_public: args?.is_public,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify({ resourceId: data.resourceId, message: data.message }, null, 2) }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DumpIt MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error running DumpIt MCP server:', error);
  process.exit(1);
});
