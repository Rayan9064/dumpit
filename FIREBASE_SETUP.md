# Firebase Setup Guide for DumpIt

## ✅ What's Already Done

1. **Firebase SDK installed** - `firebase` package added
2. **Firebase config file created** - `app/lib/firebase.ts`
3. **Auth migrated to Firebase** - `app/contexts/AuthContext.tsx` uses Firebase Auth
4. **Components updated** - Dashboard, AddResource, Profile all use Firestore
5. **User profile creation** - Profiles auto-created in `users` collection during signup
6. **Server API routes** - All admin operations use server-side Firebase Admin SDK

## 🔑 Environment Variables Overview

DumpIt uses **two separate sets** of Firebase credentials:

| Variable Prefix | Side | Purpose |
|----------------|------|---------|
| `NEXT_PUBLIC_FIREBASE_*` | **Client** | Browser-safe config for Firebase Auth & client Firestore |
| `FIREBASE_*` | **Server** | Admin SDK credentials for API routes (never exposed to browser) |

## 🚀 What You Need To Do

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "DumpIt" (or any name)
4. Disable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Authentication

1. In Firebase Console → **Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Save

### 3. Create Firestore Database

1. In Firebase Console → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a region (closest to you)
5. Enable

### 4. Set Up Firestore Security Rules

Replace the default rules with these (Firestore Database → Rules):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
    }
    
    // Resources - users can manage their own resources, read public ones
    match /resources/{resourceId} {
      allow read: if request.auth != null && 
        (resource.data.user_id == request.auth.uid || resource.data.is_public == true);
      allow create: if request.auth != null && 
        request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

### 5. Get Firebase Configuration

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (</>) to add a web app
4. Register app with nickname "DumpIt Web"
5. Copy the `firebaseConfig` object

### 6. Update .env.local File

Create/update `.env.local` file in project root with your Firebase config. This file is gitignored and should NOT be committed.

#### 6a. Client-Side (Browser) Credentials

These are **public** credentials for Firebase Auth and client-side Firestore access:

```env
# Client-side Firebase (safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dumpit-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dumpit-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dumpit-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### 6b. Server-Side (Admin SDK) Credentials ⚠️ REQUIRED

The server API routes (`/api/collections`, `/api/resources`, `/api/user-profile`, etc.) use the **Firebase Admin SDK** which requires service account credentials. **Without these, API routes will return 500 errors.**

**To generate these credentials:**

1. Go to **Firebase Console → Project Settings → Service accounts**
2. Click **Generate new private key** and download the JSON file
3. Open the downloaded JSON and copy these values to your `.env.local`:

```env
# Server-only (Firebase Admin SDK) — NEVER commit these!
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...(your key)...\n-----END PRIVATE KEY-----\n"
```

**Important notes for `FIREBASE_PRIVATE_KEY`:**

- **Wrap the entire value in double quotes**
- **Replace actual newlines with `\n`** (literal backslash-n)
- The key starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----\n`
- Example of how the key should look in `.env.local`:
  ```
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n...many lines...\n-----END PRIVATE KEY-----\n"
  ```

#### 6c. Optional: Using Firebase Emulator (Recommended for Local Dev)

If you prefer not to use production credentials locally, you can run the Firebase Emulator:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators (select Firestore)
firebase init emulators

# Start emulators
firebase emulators:start
```

Then set `FIREBASE_PROJECT_ID` in `.env.local` and the Admin SDK will connect to the emulator.

### 7. Verify Your Setup

After setting up credentials, verify everything works:

```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Start dev server
npm run dev
```

Then test:
1. Visit `http://localhost:3000` — landing page should load with **no** API calls
2. Log in and visit `/dashboard` — should see collections and resources load
3. Check browser DevTools Network tab — API calls should return 200, not 500

### 8. Create Firestore Indexes (if needed)

If you get index errors when running queries, Firebase will show a link in the console error to auto-create the index. Just click it!

Common indexes you might need:
- Collection: `resources`
- Fields: `user_id` (Ascending), `created_at` (Descending)

### 9. Test the Application

```bash
npm run dev
```

Test flow:
1. **Sign Up** with new email → profile should be created in `users` collection
2. **Add Resource** → should appear in `resources` collection  
3. **View Dashboard** → should see your resources
4. **Check Profile** → should see your username, email, and stats

---

## 📊 Firestore Data Structure

### Collections:

#### `users` Collection
```javascript
{
  id: "firebase_uid",
  username: "johndoe",
  email: "john@example.com",
  share_by_default: false,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

#### `resources` Collection
```javascript
{
  user_id: "firebase_uid",
  title: "React Documentation",
  link: "https://react.dev",
  note: "Official React docs",
  tag: "Documentation",
  is_public: false,
  created_at: Timestamp
}
```

---

## 🐛 Troubleshooting

### Profile not showing?
- Check Firebase Console → Firestore → `users` collection
- Verify document ID matches your Firebase Auth UID
- Check browser console for errors

### Can't add resources?
- Verify Firestore security rules are set correctly
- Check browser console for permission errors
- Make sure you're logged in

### Authentication not working?
- Verify Firebase config in `.env.local`
- Check that Email/Password provider is enabled
- Clear browser cache and try again

### API routes returning 500 errors?
- Check that `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are set in `.env.local`
- Verify the private key is properly formatted (wrapped in quotes, `\n` for newlines)
- Restart the dev server after changing `.env.local`
- Check server logs for specific error messages

### Unnecessary API calls on landing page?
- Ensure `CollectionsProvider` is only used in the dashboard route, not in `RootLayoutClient`
- Check that `fetchOnMount={true}` is passed to `CollectionsProvider` only where needed

---

## 🔄 Migration Status

- ✅ Firebase Auth (Email/Password)
- ✅ Firestore Database
- ✅ User Profiles
- ✅ Resources CRUD
- ✅ Dashboard
- ✅ Add Resource
- ✅ Profile Management
- ✅ Shared Dump
- ✅ Edit Resource
- ✅ Collections Context (manual fetch pattern)
- ✅ Server API routes for admin operations

---

## 📝 Architecture Notes

### Client vs Server

| Operation | Location | Credentials Used |
|-----------|----------|-----------------|
| User authentication | Client | `NEXT_PUBLIC_FIREBASE_*` |
| Dashboard data fetching | Server API routes | `FIREBASE_*` (Admin SDK) |
| Resource CRUD | Server API routes | `FIREBASE_*` (Admin SDK) |
| Collection management | Server API routes | `FIREBASE_*` (Admin SDK) |
| URL enrichment/metadata | Server API routes | Server-side fetch (no CORS) |

### Provider Hierarchy

```
RootLayoutClient
├── ThemeProvider (global)
└── AuthProvider (global)
    └── [app routes]
        └── /dashboard
            └── CollectionsProvider (dashboard-only, fetchOnMount=true)
```

This ensures:
- Landing page makes NO API calls
- Collections are only fetched when user visits dashboard
- All sensitive operations go through server API routes

---

**Questions?** Check Firebase documentation: https://firebase.google.com/docs
