# API Spec

## /api/resources
- GET: fetch user's resources (query: `uid`, optional `collectionId`, returns list)
- POST: create resource (body: user_id, title, link, note, tag, is_public, collection_ids, new_collection)
- PUT: update resource (body: id, title, link, note, tag, is_public, collection_ids)
- DELETE: delete resource (query: id)

## /api/collections
- GET: fetch collections (query: uid or ?shared=true)
- POST: create collection
- PUT: update collection
- DELETE: delete collection (query: uid, collectionId)

## /api/enrich
- POST: takes `{ url }` and returns `{ title, description, suggestedTag, favicon }`

## /api/public-resources
- GET: fetch public resources (query: `userId` to exclude current user favorites). Returns resources where `is_public` is true and not owned by `userId`.
- POST: save a public resource to your own collection (body: `userId`, `resourceId`). Returns success or conflict if user already has the resource saved.

## /api/collections/memberships
- POST: add a resource to a collection (body: `uid`, `collectionId`, `resourceId`). Returns success on transaction write. Requires `uid` (owner) verification.
- DELETE: remove a resource from a collection (query: `uid`, `collectionId`, `resourceId`). Also updates resource document to remove the collection id. Requires `uid` verification.

## /api/user-profile
- POST: create or update user profile
- GET: get profile or stats (query: `uid`, `type`)
- PUT: update user profile

## /api/check-username
- POST: check username uniqueness


## Authentication
- All endpoints that write data should verify a Firebase ID token
- Ensure token verification before allowing edits

## Auth & Usage Notes
- `GET /api/resources?uid=...` — Currently the route accepts a `uid` query parameter to fetch resources for a user. For security, prefer sending an ID token and server-side verification to ensure the requesting user can access the specified `uid`'s resources.
- `POST /api/resources` — This endpoint creates new resources. It attempts to auto-enrich titles and tags server-side if missing. Clients may also call `POST /api/enrich` first to enrich data and populate the form before creating a resource. Server should verify ID tokens to prevent spoofed `user_id` values.
- `GET /api/collections?uid=...` and `/api/collections?shared=true` — these endpoints return collections for a user or shared collections. The user-facing collections fetch uses caching in the client to avoid repeated load; prefer verifying token when fetching user-specific collections.
- `POST /api/enrich` — This endpoint doesn't require authentication and is safe for client consumption; however, if you want to limit abuse, consider rate-limiting or requiring token presence for high volumes.
- `POST /api/public-resources` — Should require auth to record a saved resource under a user's account.
- `POST/DELETE /api/collections/memberships` — Requires ID token verification; these operations perform transactions that add/remove membership subcollections and update `resource.collection_ids`.

## Missing or Clarified Uses
- `api/public-resources` was missing from the previous docs—it's used by the UI to show other users' public resources and to let a logged-in user save public resources to their own account (the POST route).
- `api/collections/memberships` was missing — it is used to add and remove resource → collection membership entries and is called by client UI actions like adding a resource to a collection from UI.
- `api/enrich` is used both as a manual enrich endpoint (client calls POST /api/enrich on the "enrich" button) and optionally server-side during resource creation (server attempts auto enrichment if title/tag are missing).

## Best Practices / Security Recommendations
- Use Firebase ID token verification for all write endpoints (POST/PUT/DELETE) to prevent spoofing client `uid`s.
- Prefer `uid` inferred from a verified token over a client-supplied `uid` parameter — remove direct reliance on query `uid` if token verified data is available.
- Add rate limiting or abuse protection for `POST /api/enrich` since it fetches arbitrary URLs from the server side.
- Document the expected Firestore collection layout (see `docs/data-model.md`) so consumers understand `resources` vs `users/{uid}/collections` vs `users/{uid}/collections/{collectionId}/resources` membership.

## Error Codes
- 400: Bad Request (missing parameters)
- 401: Unauthorized (token missing/invalid) (TODO add token checks)
- 404: Not Found
- 409: Conflict (e.g., username taken)
- 500: Internal Server Error

## Examples
### POST /api/enrich
Request Body:
```
{ "url": "https://www.npmjs.com/package/link-preview-js" }
```
Response:
```
{ "title": "link-preview-js - npm", "description": "...", "suggestedTag": "npm", "favicon": "https..." }
```

