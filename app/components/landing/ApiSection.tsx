const codeSnippet = `# Claude MCP config (~/.claude/mcp.json)
{
  "mcpServers": {
    "dumpit": {
      "command": "npx",
      "args": ["-y", "dumpit-mcp"],
      "env": { "DUMPIT_API_KEY": "dk_live_..." }
    }
  }
}

# REST API — add a resource
curl -X POST https://app.dumpit.app/api/resources \\
  -H "Authorization: Bearer dk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"link": "https://example.com/article"}'
# → { "success": true, "resourceId": "r_abc123" }

# REST API — semantic search
curl -X POST https://app.dumpit.app/api/ai/search \\
  -H "Authorization: Bearer dk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"query": "RAG citation patterns"}'
# → { "success": true, "results": [...] }`

const ApiSection = () => {
  return (
    <section id="api" className="scroll-mt-20 border-b border-zinc-200 bg-stone-50 py-24 dark:border-zinc-800 dark:bg-[#0b0f17]">
      <div className="mx-auto max-w-7xl gap-12 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-8">
        {/* Left */}
        <div>
          <span className="app-chip mb-4">API & MCP</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Build on your vault.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            DumpIt exposes a REST API and a Claude MCP integration so you can query your second brain programmatically — from your own tools, scripts, or AI agents.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { title: 'REST API', body: 'Add resources, search by natural language query, retrieve chunks. 1,000 calls/month on Pro.' },
              { title: 'Claude MCP', body: 'Connect DumpIt to Claude Desktop. Ask your vault directly from your AI conversation.' },
              { title: 'Webhooks (roadmap)', body: 'Get notified when indexing completes or a resource is added by the extension.' },
            ].map((item) => (
              <li key={item.title} className="app-panel p-4">
                <div className="font-semibold text-zinc-900 dark:text-white">{item.title}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{item.body}</div>
              </li>
            ))}
          </ul>
          <a
            href="#pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            API included in Pro
          </a>
        </div>

        {/* Right — code block */}
        <div className="mt-10 lg:mt-0">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="ml-2 text-xs font-medium text-zinc-400">DumpIt API + MCP</span>
            </div>
            <pre className="overflow-x-auto p-5 text-xs leading-6 text-zinc-300">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ApiSection
