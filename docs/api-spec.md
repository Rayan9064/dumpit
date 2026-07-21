# API Spec

Authenticated endpoints require:

```txt
Authorization: Bearer <firebase_id_token>
```

Server routes derive `uid` from the verified Firebase token and do not trust client-supplied owner IDs. All routes enforce rate-limiting via `@upstash/ratelimit` when configured (60 requests/minute for authenticated users, 20 requests/minute for public queries).

---

## /api/resources
- **GET:** Fetch authenticated user's resources or public profile resources.
  - Query Params:
    - `collectionId` (optional): Filter resources by collection ID.
    - `username` + `public=true` (optional): Fetch public resources for user `@username`.
    - `cursor` (optional): Document ID for cursor-based pagination.
    - `limit` (optional): Number of items to return (default: 20, max: 100).
  - Response: `{ success, resources, nextCursor }`.
- **POST:** Create a link or text note resource.
  - Body: `{ title, link?, note?, tag?, is_public?, collection_ids?, new_collection?, captured_text? }`.
  - Duplicate detection: Returns `409 Conflict` if the link URL was already saved by the user.
- **PUT:** Update an owned resource. Body: `{ id, title, link, note, tag, is_public, collection_ids }`.
- **DELETE:** Delete an owned resource. Query: `?id=<resource_id>`.

---

## /api/resources/pdf
- **POST:** Upload and parse a PDF document.
  - Request format: `multipart/form-data`.
  - Fields:
    - `file`: PDF binary file (max size: 10MB).
    - `title` (optional): Custom document title (defaults to filename).
    - `note` (optional): Custom description or notes.
    - `is_public` (optional): `'true'` | `'false'`.
    - `collection_ids` (optional): JSON array string of collection IDs.
  - Processing: Parses PDF in memory via `pdf-parse`, extracts text (up to 50,000 characters), creates a resource with `tag: 'PDF'`, and queues background RAG indexing.
  - Response: `{ success, resource }`.

---

## /api/collections
- **GET:** Fetch authenticated user's collections, or public shared collections with `?shared=true`.
- **POST:** Create a collection for the authenticated user.
- **PUT:** Update an owned collection. Body: `collectionId`.
- **PATCH:** Reorder owned collections. Body: `orderedIds`.
- **DELETE:** Delete an owned collection. Query: `collectionId`.

---

## /api/collections/memberships
- **POST:** Add an owned resource to an owned collection. Body: `{ collectionId, resourceId }`.
- **DELETE:** Remove an owned resource from an owned collection. Body or query: `{ collectionId, resourceId }`.

---

## /api/public-resources
- **GET:** Fetch public resources from other users. Requires auth.
- **POST:** Copy a public resource to the authenticated user's private dump. Body: `{ resourceId }`.

---

## /api/user-profile
- **GET:** Get authenticated user's profile, or stats with `?type=stats`.
- **POST:** Create or update authenticated user's profile.
- **PUT:** Update authenticated user's profile.

---

## /api/enrich
- **POST:** Public link metadata extraction. Body: `{ "url": "https://example.com" }`.
- **Response:** `{ title, description, suggestedTag, favicon }`.

---

## /api/check-username
- **GET or POST:** Check username availability.

---

## /api/ai/search
- **POST:** Semantic vector search across indexed chunks.
- **Body:** `{ "query": "firebase auth", "mode": "mine" | "shared" | "all", "limit": 8 }`.
- **Response:** `{ success, results }`.

---

## /api/ai/ask
- **POST:** RAG answer generation with citations.
- **Body:** `{ "question": "What should I read about Firebase auth?", "mode": "mine" | "shared" | "all", "limit": 8 }`.
- **Response:** `{ success, answer, sources }`.

---

## /api/ai/reindex-resource
- **POST:** Retry indexing for an owned resource.
- **Body:** `{ "resourceId": "..." }`.
- **Response:** `{ success, status, chunksIndexed, error? }`.

---

## Error Codes
- **400:** Bad Request / Missing Fields
- **401:** Unauthorized
- **404:** Not Found
- **409:** Conflict / Duplicate Link
- **422:** Unprocessable Entity (e.g. Scanned / Image-only PDF)
- **429:** Rate limit / AI provider quota exceeded
- **500:** Internal Server Error
