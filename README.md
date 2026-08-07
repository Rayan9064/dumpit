<div align="center">

<img src="public/logo-with-text.png" alt="DumpIt" height="72" />

### Save anything. Ask anything. Get answers from your own knowledge — not a stranger's AI.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![CI](https://github.com/Rayan9064/dumpit/actions/workflows/ci.yml/badge.svg)](https://github.com/Rayan9064/dumpit/actions/workflows/ci.yml)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**Live app**](https://www.dumpit.page) · [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Docs](docs/)

</div>

---

DumpIt is an open-source, AI-powered knowledge vault. Save links, notes, and PDFs from wherever you already are — the web app, the browser extension, email, or your phone's share sheet — then ask questions in plain English and get cited answers grounded in what you actually saved, not hallucinated from general knowledge.

## Table of contents

- [Features](#features)
- [Platform](#platform)
- [How RAG works](#how-rag-works)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Firestore vector indexes](#firestore-vector-indexes)
- [Commands](#commands)
- [Documentation](#documentation)
- [Contributing](#contributing)

## Features

- **Capture from anywhere**
  - Links — auto-enriched titles, descriptions, and tags via server-side scraping.
  - Notes — plain-text ideas, code snippets, structured thoughts.
  - PDFs — in-memory text extraction for uploads up to 10MB.
  - Browser extension — one-click save, side-panel review, and text-selection capture (Chrome, Manifest V3).
  - Mobile share sheet — share directly into DumpIt from any Android app (PWA, [Web Share Target](https://developer.mozilla.org/en-US/docs/Web/Manifest/Reference/share_target)).
  - Email-to-save — forward anything to `save@dumpit.page` (built; pending DNS/Resend dashboard setup on our end before it's reachable).
- **AI search & cited Q&A**
  - `My Dump` / `Shared` / `All` search scopes across your private vault and community-shared resources.
  - Answers include inline citations and source cards you can verify.
- **Organization**
  - Collections, tags, filtering, cursor-based pagination, duplicate detection.
  - Public profiles at `/u/[username]` with per-resource visibility control.
- **Developer access**
  - REST API secured by long-lived API keys (generate/revoke from Settings).
  - [MCP server](dumpit-mcp/) — query and save to your vault directly from Claude Desktop or Cursor.
- **Infrastructure**
  - Sentry error monitoring (client, server, edge).
  - Upstash Redis rate limiting on authenticated, public, and AI-query routes.
  - Dodo Payments (Merchant of Record — handles global tax compliance automatically).

## Platform

| Surface | What it's for |
|---|---|
| **Web app** | Full dashboard — search, capture, collections, profile, settings. |
| **[Browser extension](dumpit-extension/)** | One-click save from any tab without leaving the browser. |
| **REST API** | Programmatic add/search/ask, authenticated with an API key from Settings. |
| **[MCP server](dumpit-mcp/)** | `ask_vault`, `search_vault`, `save_to_vault` tools for Claude Desktop / Cursor. |
| **Mobile share sheet** | Share a link straight into your vault from Android's native share menu. |

## How RAG works

Saving a resource creates a `resources` document in Firestore. AI search relies on server-side background indexing:

1. **Extraction**
   - Links — fetches page content and extracts readable text.
   - PDFs — parses the binary in memory via `pdf-parse`.
   - Notes / emails — uses the content directly.
2. **Chunking & embedding** — splits text into contextual chunks, generates 768-dimensional vectors via Gemini's embedding model.
3. **Storage & search** — stores vectors in Firestore `resource_chunks`, runs vector similarity search against user queries, and returns an answer with inline citations.

```mermaid
flowchart TD
    Input["Link / Note / PDF / Email"] --> Extract["Extract Text (Fetch / pdf-parse)"]
    Extract --> Chunk["Chunk Text"]
    Chunk --> Embed["Gemini Embedding (768d)"]
    Embed --> Store["Firestore resource_chunks"]
    Ask["User Question"] --> QueryEmbed["Gemini Query Embedding"]
    QueryEmbed --> Vector["Firestore Vector Search"]
    Store --> Vector
    Vector --> Answer["Gemini Answer with Citations"]
```

## Tech stack

| Layer | What |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS — Zinc palette, Space Grotesk + Inter |
| Auth | Firebase Auth (Google sign-in only) |
| Database | Firebase Admin SDK + Firestore (incl. native vector search) |
| AI | Google Gemini — embeddings & generation |
| Rate limiting | Upstash Redis |
| Error tracking | Sentry (client, server, edge) |
| Email | Resend (inbound save-by-email) |
| Payments | Dodo Payments (Merchant of Record) |
| Deployment | Vercel (web app), Firebase (backend/db) |

## Repository structure

```
app/                   Next.js App Router pages and API routes
  api/                 Server-side route handlers
    resources/         CRUD for saved items (links, notes, PDFs)
    ai/                Search + RAG "ask" endpoints
    webhooks/          Dodo Payments + Resend inbound-email webhooks
    settings/api-keys/ API key generate/list/revoke
  share/               Mobile share-sheet capture page
  u/[username]/        Public user profile pages
dumpit-extension/      Chrome extension (Manifest V3, separate package)
dumpit-mcp/            MCP server for Claude Desktop / Cursor (separate package)
docs/                  Internal documentation
public/                Static assets, PWA manifest
types/                 Shared TypeScript types
```

## Quick start

```bash
git clone https://github.com/Rayan9064/dumpit.git
cd dumpit
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To try the browser extension or MCP server locally, see their own READMEs: [`dumpit-extension/README.md`](dumpit-extension/README.md) · [`dumpit-mcp/README.md`](dumpit-mcp/README.md).

## Environment variables

Configure in `.env.local` (and in Vercel for production):

```env
# Firebase client SDK (browser-safe)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK (server-only)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini AI (server-only)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

# App URL & SEO
NEXT_PUBLIC_APP_URL=https://www.dumpit.page

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring & analytics (optional)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Resend (email-to-save)
RESEND_API_KEY=
RESEND_INBOUND_WEBHOOK_SECRET=

# Dodo Payments
DODO_PAYMENTS_API_KEY=
DODO_WEBHOOK_SECRET=
```

## Firestore vector indexes

Ask DumpIt requires Firestore vector indexes for semantic search:

```bash
# Private search index
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding

# Shared / All search index
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

## Commands

```bash
npm run dev        # Run Next.js dev server
npm run typecheck  # TypeScript type checking
npm run build      # Build production bundle
npm test           # Run Vitest unit tests
```

## Documentation

- [Deployment Guide](docs/deployment.md)
- [System Design](docs/system-design.md)
- [Data Model](docs/data-model.md)
- [API Spec](docs/api-spec.md)
- [Testing Guide](docs/testing.md)
- [Firebase Setup](FIREBASE_SETUP.md)

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup and workflow, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines. DumpIt is [MIT licensed](LICENSE.md).
