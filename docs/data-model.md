# Data Model (Firestore)

## `resources`
- `id` (doc id)
- `user_id` (string)
- `title` (string)
- `link` (string)
- `note` (nullable string)
- `tag` (string)
- `is_public` (boolean)
- `collection_ids` (array of strings)
- `index_status` (`pending` | `indexed` | `failed` | `skipped`)
- `index_error` (string | null)
- `indexed_at` (timestamp, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## `resource_chunks`
Generated server-side for RAG search. A resource can be saved without being searchable by AI; it becomes useful to Ask DumpIt only after indexing writes one or more `resource_chunks` documents and sets `resources.index_status` to `indexed`.

- `resource_id` (string)
- `user_id` (string)
- `is_public` (boolean)
- `title` (string)
- `source_url` (string)
- `tag` (string)
- `chunk_text` (string)
- `chunk_index` (number)
- `summary` (string)
- `embedding` (Firestore vector, 768 dimensions)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Index status meanings

- `pending`: resource was saved and indexing has not completed yet.
- `indexed`: URL text was extracted, chunked, embedded, and stored in `resource_chunks`.
- `failed`: indexing attempted but failed. Check `index_error`.
- `skipped`: indexing was not possible or not useful, usually because the page had no readable text or could not be fetched.

### RAG limitations

The indexer fetches the URL from the server. It cannot reliably index:

- pages behind login
- pages that block server-side fetches
- pages that render all useful content with client-side JavaScript
- media-only pages without transcripts or readable text
- PDFs or documents that need a dedicated extractor

## `users`
- `id` (uid, doc id)
- `username` (string)
- `email` (string)
- `share_by_default` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## `users/{uid}/collections`
- `id` (doc id)
- `name` (string)
- `description` (string)
- `icon` (string | null)
- `color` (string | null)
- `is_shared` (boolean)
- `sort_order` (number)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## `users/{uid}/collections/{collectionId}/resources`
- `resource_id` (string)
- `added_at` (timestamp)

## Indexes
- `resources`: `user_id`, `created_at`
- `resources`: `is_public`, `user_id`, `created_at`
- collection group `collections`: `is_shared`, `sort_order`
- `resource_chunks`: `user_id` plus vector field `embedding` with 768 dimensions
- `resource_chunks`: `is_public`, `user_id`, plus vector field `embedding` with 768 dimensions

Create the vector indexes with:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```
