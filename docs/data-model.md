# Data Model (Firestore)

## `resources` collection
- `id` (doc id)
- `user_id` (string)
- `title` (string)
- `link` (string)
- `note` (nullable string)
- `tag` (string)
- `is_public` (boolean)
- `collection_ids` (array of strings)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## `users` collection
- `id` (uid, doc id)
- `username` (string)
- `email` (string)
- `share_by_default` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## `users/{uid}/collections` subcollection
- `id` (doc id)
- `name`, `description`, `icon`, `color`, `is_shared`, `sort_order`
- Each collection has a `resources` subcollection for membership entries

## `users/{uid}/collections/{collectionId}/resources`
- `resource_id` (string)
- `added_at` (timestamp)

## Indexes
- `resources` queries on `user_id`, `created_at` (order by)
- `collection` group queries on `is_shared` and `sort_order` (collectionGroup)

