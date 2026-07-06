# DumpIt - Personal Resource Vault

A modern, full-featured web application for saving, organizing, and sharing your valuable links and resources. Built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## ✨ Features

### Core Functionality
- **🔐 User Authentication**: Secure sign up and login with Firebase Auth
- **📚 Resource Management**: Create, read, update, and delete your resources
- **🤖 Ask DumpIt**: Ask questions across indexed private and shared resources with cited source links
- **🤖 AI-Powered Auto-Enrichment**: Automatically fetch titles, generate descriptions, and suggest tags from URLs
   - Uses `link-preview-js` on the server to extract metadata
Running tests
-------------
Unit tests are configured using `vitest`. After installing dependencies run:

```powershell
npm install
npm test
```

- **🏷️ Tag Organization**: Categorize resources with predefined tags (Tutorial, Article, Video, Tool, etc.)
- **🔍 Search & Filter**: Quickly find resources with search and tag filtering
- **🌍 Public/Private Toggle**: Share resources publicly or keep them private
- **✏️ Edit Resources**: Update any of your saved resources anytime
- **👥 Shared Dump**: Discover and save public resources from other users
- **📊 Profile Dashboard**: View statistics and manage account settings

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient designs with smooth animations
- **Loading States**: Clear feedback during async operations
- **Error Handling**: User-friendly error messages
- **Success Notifications**: Visual confirmation of actions




<h1 align="center">🚀 Quick Start — Next.js + Firebase</h1>

<p align="center">
  <b>Modern web app using Next.js 14 App Router & Firebase for Authentication, Firestore Database, and optional Gemini AI integration.</b>
</p>

---

## 🧾 **Prerequisites**

Make sure you have the following installed before you start:

| Tool                    | Version | Description                   |
| ----------------------- | ------- | ----------------------------- |
| 🟢 **Node.js**          | 18+     | Required for Next.js          |
| 📦 **npm** or **yarn**  | Latest  | Package manager               |
| 🔥 **Firebase Project** | —       | For authentication & database |

---

## ⚙️ **Setup Steps**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rayan9064/dumpit.git
cd dumpit
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Set Up Firebase

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Create a **new Firebase project**
3. Enable **Email/Password Authentication**
   → *Navigate to* **Build → Authentication → Sign-in method**
4. Create a **Firestore Database**
   → *Start in test mode* for local development

---

### 4️⃣ Configure Environment Variables

Copy the example env file and populate the values. The repo includes a committed ` .env.example` with the variables used by the project.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Unix / macOS:

```bash
cp .env.example .env
```

Then open `.env` and fill in the values. Notes:
- Client-side vars should be `NEXT_PUBLIC_*` (used by Next.js in `src/lib/firebase.ts`). Some files and comments reference `VITE_*`; if you use a Vite-based workflow, the example includes those variants as well.
- Server-side (Admin) vars are required for Firebase Admin SDK and must never be exposed to the browser. These are:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (must contain newlines; in many hosts you should replace real newlines with `\n`)

Example values you should populate in `.env`:

```env
# Client (public) - set these for the browser
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server (admin) - keep these secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Optional: Gemini AI (server-side only)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
```

> ⚠️ **Important:** Do not share or commit your `.env` file. `.gitignore` already excludes `.env` and `.env.local`.

---

### 5️⃣ Run the Development Server

```bash
npm run dev
```

---

### 6️⃣ Open in Browser 🌐

Visit 👉 [http://localhost:3000](http://localhost:3000)

> 🧠 Create an account and start saving your favorite resources instantly!

---

### 🧩 **Project Features**

| Feature                      | Description                                  |
| ---------------------------- | -------------------------------------------- |
| 🔐 **Authentication**        | Secure Email/Password Login                  |
| 💾 **Firestore**             | Real-time database for data storage          |
| ⚙️ **Firebase Admin SDK**    | Server-side configuration for secure actions |
| 🤖 **Gemini AI (Optional)**  | RAG search, answers, and resource indexing   |
| 🧱 **Next.js 14 App Router** | Modern routing and server components         |

---

### 🛠️ **Development Commands**

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Run production build     |
| `npm install`   | Install dependencies     |

---


## 🚀 Deployment

This Next.js application can be deployed to any platform that supports Node.js:

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms
- **Netlify**: Use `npm run build` and deploy the `.next` folder
- **Railway**: Connect repository and set environment variables
- **Render**: Use the Node.js runtime with build command `npm run build`

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- `NEXT_PUBLIC_FIREBASE_*` variables for client-side Firebase config
- `FIREBASE_*` variables for server-side Admin SDK
- `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_EMBEDDING_MODEL` for AI/RAG features

### AI/RAG Notes
DumpIt indexes saved resources by fetching link content server-side, chunking readable text, creating Gemini embeddings, and storing vectors in Firestore `resource_chunks`.

The dashboard's **AI Search** tab supports:
- `My Dump`: private resources owned by the signed-in user
- `Shared`: public resources shared by other users
- `All`: the user's private resources plus shared public resources

Create the Firestore vector indexes described in [docs/deployment.md](docs/deployment.md) before relying on AI search in production.

For detailed Firebase setup steps, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

### Migration Note
Supabase files have been removed from the codebase as part of the migration to Firebase. If you see any references to Supabase, please open an issue.

## 📖 Usage

### Adding Resources
1. Click "Add Resource" in the navigation
2. Fill in the title, link, and optional note
3. Select a tag category
4. Toggle public/private visibility
5. Click "Add Resource"

### Editing Resources
1. Go to your Dashboard
2. Find the resource you want to edit
3. Click the edit icon (✏️) on the resource card
4. Update the fields in the modal
5. Click "Save Changes"

### Managing Your Profile
1. Click "Profile" in the navigation
2. View your resource statistics
3. Update your username
4. Set default privacy preference for new resources

### Discovering Resources
1. Click "Shared Dump" to see public resources from the community
2. Search and filter to find what you need
3. Click "Save to My Dump" to add them to your collection

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Firebase (Auth + Firestore + Admin SDK)
- **Build Tool**: Next.js (built-in)
- **Linting**: ESLint

## 🏗️ Architecture

This application uses **Next.js 14 with App Router** for a modern, full-stack React experience:

### Frontend Features
- **App Router**: File-based routing with nested layouts
- **Server Components**: Optimized performance with selective client components
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Features (API Routes)
- **Server-Side API Routes**: Secure database operations with Firebase Admin SDK
- **Username Validation**: Server-side uniqueness checking
- **Resource Management**: Full CRUD operations via RESTful API
- **User Profile Management**: Secure profile updates and statistics
- **Public Resource Discovery**: Optimized queries for community features

### Security Features
- **Client-Side Auth**: Firebase Auth for user authentication
- **Server-Side Validation**: All database operations validated server-side
- **Secure API Keys**: Environment variables properly scoped (NEXT_PUBLIC_ for client, server-only for sensitive data)
- **Input Sanitization**: Server-side validation for all user inputs

## 🔄 Recent Updates

### v1.2.0 - Security & API Migration
- ✅ **Migrated to Secure API Routes**: Moved all Firestore operations from client-side to secure server-side API routes
- ✅ **Firebase Admin SDK Integration**: Server-side database access with proper authentication
- ✅ **User-Friendly Error Messages**: Replaced technical Firebase errors with clear, actionable messages
- ✅ **Enhanced Security**: No direct client database access, all operations validated server-side

### v1.1.0 - Edit Resource Feature
- ✅ Added ability to edit existing resources
- ✅ New EditResource component with modal interface
- ✅ Edit button on resource cards in Dashboard
- ✅ Full CRUD operations now supported
- ✅ Maintains all resource properties (title, link, note, tag, visibility)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Rayan9064**
- GitHub: [@Rayan9064](https://github.com/Rayan9064)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Authentication & Database by [Firebase](https://firebase.google.com/)

