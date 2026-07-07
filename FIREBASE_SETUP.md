# Firebase Setup Guide

DumpIt uses Firebase for authentication and Firestore data storage. Server-side routes use Firebase Admin SDK so private reads/writes are authorized from verified Firebase ID tokens.

Gemini is separate from Firebase. Firebase keys are not valid Gemini keys.

## Credential Types

| Variable | Side | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Browser | Firebase Web SDK config for Auth |
| `FIREBASE_PROJECT_ID` | Server | Firebase Admin project |
| `FIREBASE_CLIENT_EMAIL` | Server | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Server | Firebase Admin private key |
| `GEMINI_API_KEY` | Server | Google AI Studio / Gemini API |

## Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create or select a project.
3. Enable Authentication.
4. Enable Email/Password and Google sign-in providers as needed.
5. Enable Firestore Database.

## Firebase Web App Config

1. Firebase Console -> Project Settings.
2. In "Your apps", create or select a Web app.
3. Copy the Firebase config into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

These values are browser-safe Firebase config. They are not service account credentials.

## Firebase Admin SDK

Server APIs require a service account.

1. Firebase Console -> Project Settings -> Service accounts.
2. Click "Generate new private key".
3. Copy the JSON values into `.env.local`:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Important:

- Keep Admin credentials server-only.
- Never use `NEXT_PUBLIC_` for Admin credentials.
- Preserve private key newlines as `\n` in hosted environments such as Vercel.
- Restart the dev server after changing `.env.local`.

## Firestore Security Rules

Server routes use Admin SDK, but client-side access should still be constrained.

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

Firestore may ask for standard composite indexes as queries are used. Create the suggested indexes from Firebase Console or `gcloud`.

For Ask DumpIt, create both vector indexes for `resource_chunks`:

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

Check index build status:

```bash
gcloud firestore operations list --project=YOUR_PROJECT_ID
```

## Gemini Setup

Gemini is configured separately from Firebase.

```env
GEMINI_API_KEY=your_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

Use an API key from Google AI Studio / Gemini API. Do not use `NEXT_PUBLIC_FIREBASE_API_KEY`.

## Local Verification

```powershell
npm install
npm run typecheck
npm test -- --run
npm run build
npm run dev
```

Manual checks:

1. Landing page loads without authenticated API calls.
2. Sign up or log in.
3. Save a resource.
4. Confirm it appears in Firestore `resources`.
5. Confirm `index_status` becomes `indexed`, `failed`, or `skipped`.
6. Ask a specific question in `My Dump`.

## Troubleshooting

### API routes return 500

- Check `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
- Confirm private key formatting.
- Restart server after changing env vars.

### Gemini says API key invalid

- Replace `GEMINI_API_KEY` with an AI Studio key.
- Do not use Firebase API keys for Gemini.
- Redeploy after changing Vercel env vars.

### Gemini says quota exceeded

- Use `GEMINI_MODEL=gemini-2.5-flash`.
- Avoid `gemini-2.5-pro` unless billing/quota is enabled.

### Firestore says missing vector index

- Run the exact `gcloud` command from the error.
- Wait for the index state to become `READY`.

### Ask DumpIt finds no resources

- Confirm target resources have `index_status=indexed`.
- Use a specific semantic question.
- Check whether the source page is fetchable by the server.
