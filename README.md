# DumpIt — Your AI Second Brain

DumpIt is an AI-powered knowledge vault for saved links, plain-text notes, and PDF documents. Save useful resources, organize them into collections, and ask questions across your private vault plus public shared resources with cited source cards.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Firebase Auth & Firestore**, **Firebase Admin SDK**, **Google Gemini AI (RAG & Embeddings)**, **@sentry/nextjs**, and **@upstash/ratelimit**.

---

## Features

- **Multi-Format Capture:**
  - **Links:** Auto-enrichment of titles, descriptions, and tags via web scraping.
  - **Notes:** Plain-text ideas, code snippets, and structured thoughts.
  - **PDF Documents:** Fast in-memory text extraction for PDF uploads up to 10MB.
- **AI Search & RAG (Ask DumpIt):**
  - `My Dump`: Query your private indexed vault.
  - `Shared`: Discover public resources saved by the community.
  - `All`: Search across your vault plus community shared resources.
  - Answers include exact citations and source cards.
- **Organization & Curation:**
  - Collections, tags, search filtering, and custom public profiles (`/u/[username]`).
  - Cursor-based pagination on dashboard for high performance at scale.
  - Skeleton shimmer card loading states.
  - Duplicate resource detection.
- **Enterprise Infrastructure & Performance:**
  - Sentry exception monitoring across Client, Server, and Edge runtimes.
  - Upstash Redis API rate limiting (60 req/min auth, 20 req/min public).
  - PostHog telemetry & product analytics.
  - Dynamic SEO generation via Next.js `robots.ts` and dynamic `sitemap.ts`.
  - Browser extension support (Chrome Extension).

---

## How RAG Works

Saving a resource creates a `resources` document in Firestore. AI search relies on server-side background indexing:

1. **Extraction:**
   - **For Links:** Fetches page content and extracts readable text.
   - **For PDFs:** Parses PDF binary in memory via `pdf-parse` and extracts plain text into `captured_text`.
   - **For Notes:** Uses the note content directly.
2. **Chunking & Embedding:**
   - Splits text into contextual chunks.
   - Generates 768-dimensional vector embeddings using Google's Gemini Embedding API.
3. **Storage & Search:**
   - Stores vectorized chunks in Firestore `resource_chunks`.
   - Executes vector similarity searches against user queries.

```mermaid
flowchart TD
    Input["Link / Note / PDF"] --> Extract["Extract Text (Fetch / pdf-parse)"]
    Extract --> Chunk["Chunk Text"]
    Chunk --> Embed["Gemini Embedding (768d)"]
    Embed --> Store["Firestore resource_chunks"]
    Ask["User Question"] --> QueryEmbed["Gemini Query Embedding"]
    QueryEmbed --> Vector["Firestore Vector Search"]
    Store --> Vector
    Vector --> Answer["Gemini Answer with Citations"]
```

---

## Quick Start

```bash
git clone https://github.com/Rayan9064/dumpit.git
cd dumpit
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Chrome Extension

DumpIt includes a Chrome extension for one-click link capturing, side-panel search, and text selection clipping. For setup instructions, see the [Extension README](dumpit-extension/README.md).

---

## Environment Variables

Configure your environment variables in `.env.local` (and in Vercel for production deployments):

```env
# Firebase Client SDK (browser-safe)
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
NEXT_PUBLIC_APP_URL=https://dumpit-three.vercel.app

# Monitoring & Rate Limiting (Optional)
NEXT_PUBLIC_SENTRY_DSN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## Firestore Vector Indexes

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

---

## Commands

```bash
npm run dev        # Run Next.js dev server
npm run typecheck  # TypeScript type checking
npm run build      # Build production bundle
npm test           # Run Vitest unit tests
```

---

## Documentation

- [Deployment Guide](docs/deployment.md)
- [System Design](docs/system-design.md)
- [Data Model](docs/data-model.md)
- [API Spec](docs/api-spec.md)
- [Testing Guide](docs/testing.md)
- [Firebase Setup](FIREBASE_SETUP.md)
