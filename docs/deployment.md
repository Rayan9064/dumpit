# Deployment Guide

DumpIt deploys as a Next.js app on Vercel with Firebase Auth, Firestore, Firebase Admin SDK, and Gemini for AI/RAG.

## Required Services

- Vercel project connected to the GitHub repository.
- Firebase project with Authentication and Firestore enabled.
- Firebase Admin service account for server-side API routes.
- Google AI Studio / Gemini API key for embeddings and answer generation.
- Firestore vector indexes for `resource_chunks`.

## Environment Variables

Set these locally in `.env.local` and in Vercel Project Settings -> Environment Variables.

```bash
# Firebase Client SDK Configuration (public browser config)
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

Notes:

- `NEXT_PUBLIC_*` values are safe browser config for the Firebase Web SDK.
- `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PROJECT_ID` are server secrets for Firebase Admin.
- `GEMINI_API_KEY` must be an AI Studio / Gemini API key, not a Firebase Web API key.
- Do not prefix Gemini keys with `Bearer`, and do not wrap the value in quotes in Vercel.
- Use `GEMINI_MODEL=gemini-2.5-flash` for v1. `gemini-2.5-pro` can return `429 RESOURCE_EXHAUSTED` on the free tier.
- Redeploy Vercel after changing environment variables.

## Firebase Setup

1. Create or select a Firebase project.
2. Enable Firestore Database.
3. Enable Authentication.
4. Enable Email/Password and Google sign-in providers if both are desired.
5. Generate a Firebase Admin service account key:
   - Firebase Console -> Project Settings -> Service Accounts
   - Generate new private key
   - Map JSON fields to env vars:
     - `project_id` -> `FIREBASE_PROJECT_ID`
     - `client_email` -> `FIREBASE_CLIENT_EMAIL`
     - `private_key` -> `FIREBASE_PRIVATE_KEY`

## Firestore Security Rules

Server APIs use Firebase Admin SDK and verify Firebase ID tokens. Client-side direct access should remain constrained.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /resources/{resourceId} {
      allow read: if resource.data.is_public == true || isOwner(resource.data.user_id);
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if isOwner(resource.data.user_id);
    }

    match /resource_chunks/{chunkId} {
      allow read: if resource.data.is_public == true || isOwner(resource.data.user_id);
      allow write: if false;
    }

    match /users/{userId} {
      allow read, create, update: if isOwner(userId);

      match /collections/{collectionId} {
        allow read, write: if isOwner(userId);

        match /resources/{resourceId} {
          allow read, write: if isOwner(userId);
        }
      }
    }
  }
}
```

## Firestore Indexes

### Standard Composite Indexes

Create the standard indexes Firestore asks for in the Firebase Console or with `gcloud` when query errors provide a command.

Expected query shapes include:

- `resources`: `user_id` plus `created_at`
- `resources`: public resource discovery filters
- collection group `collections`: `is_shared` plus `sort_order`

### Vector Indexes for RAG

DumpIt stores embeddings in `resource_chunks.embedding` with 768 dimensions. Firestore vector search requires separate indexes for each filter combination.

Private search (`My Dump`) uses:

```text
user_id == currentUser
nearest embedding
```

Create the private vector index:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

Shared search (`Shared` and part of `All`) uses:

```text
is_public == true
user_id != currentUser
nearest embedding
```

Create the shared vector index:

```bash
gcloud firestore indexes composite create \
  --project=YOUR_PROJECT_ID \
  --collection-group=resource_chunks \
  --query-scope=COLLECTION \
  --field-config=order=ASCENDING,field-path=is_public \
  --field-config=order=ASCENDING,field-path=user_id \
  --field-config=vector-config='{"dimension":"768","flat": "{}"}',field-path=embedding
```

Monitor index operations:

```bash
gcloud firestore operations list --project=YOUR_PROJECT_ID
```

The index is usable after the operation reports `state: SUCCESSFUL` and the index response shows `state: READY`.

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Add all required environment variables for Production, Preview, and Development as needed.
3. Deploy from `main`.
4. After any environment variable change, redeploy the latest production deployment.

Default build settings:

- Build command: `npm run build`
- Install command: `npm install`
- Output directory: `.next`

## RAG Verification

1. Save a normal public web page in DumpIt.
2. Open Resources and confirm `index_status` becomes `indexed`.
3. Ask a specific question in `My Dump`, for example:

```text
What does my Firebase Authentication resource explain?
```

4. Test `Shared`.
5. Test `All`.

If a resource remains `pending`, `failed`, or `skipped`, Ask DumpIt cannot use it.

## Troubleshooting

### Gemini: API key not valid

Symptoms:

```text
API_KEY_INVALID
API key not valid. Please pass a valid API key.
```

Fix:

- Create a key in Google AI Studio / Gemini API.
- Set it as `GEMINI_API_KEY`.
- Do not use `NEXT_PUBLIC_FIREBASE_API_KEY`.
- Redeploy Vercel.

### Gemini: quota exceeded

Symptoms:

```text
429 RESOURCE_EXHAUSTED
model: gemini-2.5-pro
```

Fix:

- Set `GEMINI_MODEL=gemini-2.5-flash`.
- Redeploy Vercel.
- Use billing/quota only if you intentionally want Pro models.

### Firestore: missing vector index

Symptoms:

```text
FAILED_PRECONDITION: Missing vector index configuration
```

Fix:

- Run the exact `gcloud firestore indexes composite create ...` command from the error.
- For DumpIt production, create both vector indexes listed above.
- Wait for `READY`.

### Ask DumpIt returns no indexed resources

Symptoms:

```text
I could not find indexed resources for that question yet.
```

Fix:

- Confirm the target resource has `index_status=indexed`.
- Ask a specific semantic question instead of a single keyword.
- Check whether the source page blocks server fetches or hides text behind login/client-side rendering.

### Firebase Admin initialization failed

Fix:

- Confirm `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
- Preserve private key newlines as `\n` in hosted env vars.
- Do not expose Admin credentials as `NEXT_PUBLIC_*`.

## Production Checklist

- [ ] Firebase Auth enabled.
- [ ] Firestore enabled.
- [ ] Firebase Admin env vars configured in Vercel.
- [ ] Gemini env vars configured in Vercel.
- [ ] `GEMINI_MODEL=gemini-2.5-flash`.
- [ ] Standard Firestore composite indexes created.
- [ ] Private vector index is `READY`.
- [ ] Shared vector index is `READY`.
- [ ] Vercel redeployed after env var changes.
- [ ] `npm run secret-scan` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test -- --run` passes.
- [ ] `npm run build` passes.
- [ ] A saved resource reaches `index_status=indexed`.
- [ ] Ask DumpIt works in `My Dump`, `Shared`, and `All`.
