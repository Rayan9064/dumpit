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
Generated server-side for RAG search.

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
- `resource_chunks`: vector index on `embedding` with 768 dimensions
- `resource_chunks`: vector search with `user_id == <uid>`
- `resource_chunks`: vector search with `is_public == true` and `user_id != <uid>`
