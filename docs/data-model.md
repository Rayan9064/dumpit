# Data Model (Firestore)

## `resources`
- `id` (doc id)
- `user_id` (string)
- `title` (string)
- `link` (nullable string, optional for notes and PDFs)
- `note` (nullable string)
- `tag` (string: `Article`, `Tutorial`, `PDF`, `Note`, `Video`, etc.)
- `is_public` (boolean)
- `collection_ids` (array of strings)
- `captured_text` (nullable string, used for notes and extracted PDF text)
- `pdf_metadata` (optional object: `{ file_name, file_size, num_pages }`)
- `index_status` (`pending` | `indexed` | `failed` | `skipped`)
- `index_error` (string | null)
- `indexed_at` (timestamp, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

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
- `indexed`: text was extracted (via web scraper, PDF parser, or direct note text), chunked, embedded, and stored in `resource_chunks`.
- `failed`: indexing attempted but failed. Check `index_error`.
- `skipped`: indexing was not possible or not useful, usually because the web page had no readable text or blocked server requests.

---

## `users`
- `id` (uid, doc id)
- `username` (string)
- `email` (string)
- `share_by_default` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

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

---

## `users/{uid}/collections/{collectionId}/resources`
- `resource_id` (string)
- `added_at` (timestamp)

---

## Indexes & Vector Config

Vector search requires two composite indexes on `resource_chunks`:

```bash
# Private vector search index
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding

# Shared / All vector search index
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```
