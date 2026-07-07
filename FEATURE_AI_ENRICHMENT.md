# AI Features

DumpIt has two server-side AI-assisted workflows:

1. URL metadata enrichment during capture.
2. RAG indexing and Ask DumpIt answers over saved links.

All AI keys are server-only. Do not expose Gemini keys with `NEXT_PUBLIC_`.

## URL Enrichment

The capture flow can enrich a URL before saving it.

Current behavior:

- Client sends `POST /api/enrich` with `{ url }`.
- Server uses `link-preview-js` and fallback HTML parsing to extract metadata.
- Response can include title, description, suggested tag, and favicon.
- The UI can use the response to prefill title, note, and tag.

This endpoint is metadata-oriented. It is not the same as RAG indexing.

## RAG Indexing

After a resource is saved, the server attempts to index the page for AI search.

```text
saved URL -> server fetch -> text extraction -> chunking -> Gemini embeddings -> Firestore resource_chunks
```

The original `resources` document tracks indexing with:

- `index_status`: `pending`, `indexed`, `failed`, or `skipped`
- `index_error`: failure reason, when available
- `indexed_at`: timestamp for successful indexing

Ask DumpIt can retrieve only resources that have indexed chunks.

## Ask DumpIt

Ask DumpIt performs permission-aware semantic search:

- `My Dump`: chunks owned by the current user
- `Shared`: public chunks owned by other users
- `All`: both of the above

Flow:

1. Embed the user's question with Gemini.
2. Run Firestore vector search over `resource_chunks`.
3. Filter chunks by permission.
4. Build context from matching chunks.
5. Generate an answer with citations using Gemini.

## Required Environment Variables

```env
GEMINI_API_KEY=your_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Important:

- `GEMINI_API_KEY` must come from Google AI Studio / Gemini API.
- Do not use the Firebase Web API key for Gemini.
- `gemini-2.5-flash` is recommended for v1.
- `gemini-2.5-pro` may fail on free tier with `429 RESOURCE_EXHAUSTED`.

## Firestore Vector Indexes

Create both indexes before relying on Ask DumpIt in production.

Private search:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

Shared/all search:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

## Limitations

The current indexer fetches pages server-side. It may not index:

- content behind login
- pages that block bots/server fetches
- JavaScript-rendered pages with little server HTML
- PDFs or binary documents
- videos without transcript extraction

Future work can add dedicated extractors for PDFs, YouTube transcripts, Google Docs exports, browser-captured pages, and manual text uploads.

## Troubleshooting

- `API_KEY_INVALID`: replace `GEMINI_API_KEY` with a valid AI Studio key and redeploy.
- `429 RESOURCE_EXHAUSTED`: use `GEMINI_MODEL=gemini-2.5-flash` or enable billing/quota.
- `Missing vector index configuration`: create the Firestore index from the error message.
- No sources found: confirm the resource has `index_status=indexed` and ask a specific question.
