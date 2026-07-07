# API Spec

Authenticated endpoints require:

```txt
Authorization: Bearer <firebase_id_token>
```

Server routes derive `uid` from the verified Firebase token and do not trust client-supplied owner IDs.

## /api/resources
- GET: fetch authenticated user's resources. Optional query: `collectionId`.
- POST: create a resource. Body: `title`, `link`, `note`, `tag`, `is_public`, `collection_ids`, `new_collection`.
- PUT: update an owned resource. Body: `id`, `title`, `link`, `note`, `tag`, `is_public`, `collection_ids`.
- DELETE: delete an owned resource. Query: `id`.
- Create/update performs best-effort indexing and returns an `indexing` object.
- Saved resources are not AI-searchable until indexing writes `resource_chunks` and sets `index_status` to `indexed`.

## /api/collections
- GET: fetch authenticated user's collections, or public shared collections with `?shared=true`.
- POST: create a collection for the authenticated user.
- PUT: update an owned collection. Body: `collectionId`.
- PATCH: reorder owned collections. Body: `orderedIds`.
- DELETE: delete an owned collection. Query: `collectionId`.

## /api/collections/memberships
- POST: add an owned resource to an owned collection. Body: `collectionId`, `resourceId`.
- DELETE: remove an owned resource from an owned collection. Body or query: `collectionId`, `resourceId`.

## /api/public-resources
- GET: fetch public resources from other users. Requires auth.
- POST: copy a public resource to the authenticated user's private dump. Body: `resourceId`.

## /api/user-profile
- POST: create or update authenticated user's profile.
- GET: get authenticated user's profile, or stats with `?type=stats`.
- PUT: update authenticated user's profile.

## /api/enrich
- POST: public metadata extraction. Body: `{ "url": "https://example.com" }`.
- Response: `{ title, description, suggestedTag, favicon }`.

## /api/check-username
- GET or POST: check username uniqueness.

## /api/ai/search
- POST: semantic search across indexed chunks.
- Body: `{ "query": "firebase auth", "mode": "mine" | "shared" | "all", "limit": 8 }`.
- Response: `{ success, results }`.
- Requires Firestore vector indexes for the selected mode.

## /api/ai/ask
- POST: RAG answer generation with citations.
- Body: `{ "question": "What should I read about Firebase auth?", "mode": "mine" | "shared" | "all", "limit": 8 }`.
- Response: `{ success, answer, sources }`.
- Retrieval runs before answer generation. If no matching chunks are found, the API returns an answer explaining that no indexed resources matched.
- Uses `GEMINI_MODEL`, recommended `gemini-2.5-flash`, for answer generation.

## /api/ai/reindex-resource
- POST: retry indexing for an owned resource.
- Body: `{ "resourceId": "..." }`.
- Response: `{ success, status, chunksIndexed, error? }`.
- Use this when `index_status` is `failed`, `skipped`, or stale after changing a resource URL.

## AI Search Modes
- `mine`: private and public resources owned by the authenticated user.
- `shared`: public resources owned by other users.
- `all`: authenticated user's resources plus other users' public resources.

## AI/RAG Operational Requirements

- `GEMINI_API_KEY` must be a valid Google AI Studio / Gemini API key.
- `GEMINI_MODEL=gemini-2.5-flash` is recommended for production v1.
- `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`.
- Firestore vector index for `user_id + embedding` is required for `mine`.
- Firestore vector index for `is_public + user_id + embedding` is required for `shared` and `all`.
- Resource chunks use 768-dimensional embeddings.

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict
- 429: AI provider quota exceeded
- 500: Internal Server Error

Common AI failure causes:

- Invalid Gemini key: replace `GEMINI_API_KEY` with an AI Studio key and redeploy.
- Gemini quota exceeded: use `gemini-2.5-flash` or enable billing/quota.
- Missing Firestore vector index: create the exact index command returned by Firestore.
- No indexed chunks: save/reindex a resource and wait for `index_status=indexed`.
