# DumpIt

DumpIt is an AI knowledge vault for saved links. Save useful resources, organize them into collections, and ask questions across your private dump plus public shared resources with cited source cards.

Built with Next.js 14, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Admin SDK, and Gemini.

## Features

- Firebase authentication with email/password and Google sign-in.
- Private resource library with tags, notes, collections, search, and visibility controls.
- Shared Dump for discovering public resources from other users.
- URL capture and metadata enrichment.
- Server-side RAG indexing for saved links:
  - fetch URL content
  - extract readable text
  - chunk text
  - create Gemini embeddings
  - store chunks in Firestore `resource_chunks`
- Ask DumpIt AI search modes:
  - `My Dump`: your indexed resources
  - `Shared`: public resources from other users
  - `All`: your resources plus shared public resources
- Answers include citations and source cards when matching indexed chunks exist.

## How RAG Works

Saving a link creates a `resources` document, but AI search depends on indexing. The server fetches the saved URL, extracts readable page text, chunks it, embeds each chunk with Gemini, and writes vectorized chunks to Firestore.

```mermaid
flowchart TD
    URL["Saved URL"] --> Fetch["Server fetches page"]
    Fetch --> Extract["Extract readable text"]
    Extract --> Chunk["Chunk text"]
    Chunk --> Embed["Gemini embedding"]
    Embed --> Store["Firestore resource_chunks"]
    Ask["User question"] --> QueryEmbed["Gemini query embedding"]
    QueryEmbed --> Vector["Firestore vector search"]
    Store --> Vector
    Vector --> Answer["Gemini answer with citations"]
```

A saved resource is useful to Ask DumpIt only after `index_status` becomes `indexed`.

Indexing can fail or be skipped when:

- the page blocks server-side fetches
- content is behind login
- content is rendered only by client-side JavaScript
- the page has little readable text
- Gemini or Firestore configuration is missing

## Quick Start

```bash
git clone https://github.com/Rayan9064/dumpit.git
cd dumpit
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Use Firebase variables for Firebase only, and Gemini variables for AI only. Do not reuse Firebase keys as Gemini keys.

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
```

Important:

- `GEMINI_API_KEY` must come from Google AI Studio / Gemini API.
- `NEXT_PUBLIC_FIREBASE_API_KEY` is the Firebase Web SDK key and is not valid for Gemini.
- Keep `GEMINI_MODEL=gemini-2.5-flash` for v1. `gemini-2.5-pro` may have no free-tier quota and can return 429 errors.
- Set Gemini variables in Vercel without quotes or `Bearer`.
- Redeploy Vercel after changing environment variables.

## Firestore Vector Indexes

Ask DumpIt requires Firestore vector indexes for the query shapes used by the app.

Create the private search index:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

Create the shared/all search index:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

Monitor index creation:

```bash
gcloud firestore operations list --project=YOUR_PROJECT_ID
```

Wait for `state: SUCCESSFUL` and `state: READY` before testing AI search.

## Commands

```bash
npm run dev
npm run typecheck
npm test -- --run
npm run build
npm run secret-scan
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for the Vercel, Firebase, Gemini, and Firestore index runbook.

Production checklist:

- Firebase Auth enabled.
- Firestore enabled.
- Firebase Admin service account variables set in Vercel.
- Gemini API key from AI Studio set as `GEMINI_API_KEY`.
- `GEMINI_MODEL=gemini-2.5-flash`.
- Both Firestore vector indexes are `READY`.
- Save a resource and confirm it becomes `indexed`.
- Test Ask DumpIt in `My Dump`, then `Shared`, then `All`.

## Documentation

- [Deployment Guide](docs/deployment.md)
- [System Design](docs/system-design.md)
- [Data Model](docs/data-model.md)
- [API Spec](docs/api-spec.md)
- [Testing Guide](docs/testing.md)
- [Firebase Setup](FIREBASE_SETUP.md)
