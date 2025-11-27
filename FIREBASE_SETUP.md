# Firebase Setup Guide for DumpIt

## ✅ What's Already Done

1. **Firebase SDK installed** - `firebase` package added
2. **Firebase config file created** - `src/lib/firebase.ts`
3. **Auth migrated to Firebase** - `src/contexts/AuthContext.tsx` uses Firebase Auth
4. **Components updated** - Dashboard, AddResource, Profile all use Firestore
5. **User profile creation** - Profiles auto-created in `users` collection during signup

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

### 6. Update .env File

Create/update `.env` file in project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=dumpit-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dumpit-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=dumpit-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 6.a Firebase Admin (Server) credentials

The server-side code (Firebase Admin SDK) requires service account credentials. Create a service account in the Firebase Console and download the JSON key:

1. Go to **Firebase Console → Project Settings → Service accounts**
2. Click **Generate new private key** and download the JSON file

From the downloaded JSON, set these environment variables on your server or in your local `.env` (do NOT commit):

```env
# Server-only (Firebase Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# Copy the private_key value from the JSON. If your platform requires a single-line env value
# replace actual newlines with the literal \n sequence.
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n"
```

Notes:
- The code in `app/api/_utils/firebaseAdmin.ts` reads these variables and will throw an error if they are missing.
- For many hosting providers you must escape newlines in `FIREBASE_PRIVATE_KEY` (replace real newlines with `\n`). Locally you can keep real newlines by wrapping the value in quotes.

### 7. Create Firestore Indexes (if needed)

If you get index errors when running queries, Firebase will show a link in the console error to auto-create the index. Just click it!

Common indexes you might need:
- Collection: `resources`
- Fields: `user_id` (Ascending), `created_at` (Descending)

### 8. Test the Application

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
- Verify Firebase config in `.env`
- Check that Email/Password provider is enabled
- Clear browser cache and try again

---

## 🔄 Migration Status

- ✅ Firebase Auth (Email/Password)
- ✅ Firestore Database
- ✅ User Profiles
- ✅ Resources CRUD
- ✅ Dashboard
- ✅ Add Resource
- ✅ Profile Management
- ⏳ Shared Dump (needs migration)
- ⏳ Edit Resource (needs migration)

---

## 📝 Next Steps

1. Complete Shared Dump component migration
2. Complete Edit Resource component migration
3. Add Firebase Hosting for deployment
4. Set up production Firestore rules
5. Add error boundary for better error handling

---

**Questions?** Check Firebase documentation: https://firebase.google.com/docs
