# DumpIt Browser Extension

The DumpIt Chrome Extension is a companion tool that turns your browser into an active Second-Brain. It allows you to save web pages, quotes, snippets, and page contents directly into your DumpIt workspace.

## Core Features

- **One-Click Page Save**: Quick-save the current page URL, title, favicon, and collection info.
- **Context Menu Scraping**: Highlight any text on a web page, right-click, and select **"Save to DumpIt"** to store quotes and research snippets.
- **Smart DOM Content Extraction**: Securely extracts the readable DOM content of dynamic or authenticated webpages directly from your browser tab, bypassing server-side crawling issues.
- **Persistent Side Panel**: Inspect saved pages, write quick notes, manage visibility, select target collections, and ask AI questions about the page in real-time.
- **Web Session Synchronization**: Logs in automatically. Once you authenticate on the DumpIt web app, the session token is securely synchronized in-memory using origin-restricted DOM events.

---

## Local Installation Guide

Since the extension is built from source and not hosted on the Chrome Web Store, follow these steps to load it into your Chrome browser:

### 1. Build the Extension Locally

1. Navigate to the extension folder:
   ```bash
   cd dumpit-extension
   ```
2. Install all development dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration file:
   - Create a file named `.env` in the `dumpit-extension/` directory.
   - Fill in your Firebase config parameters:
     ```env
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```
4. Compile the production extension package:
   ```bash
   npm run build
   ```
   This generates a compiled `dist/` directory containing the `manifest.json`, background service worker, and UI assets.

### 2. Load the Unpacked Extension into Chrome

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions/
   ```
2. In the top-right corner, toggle the **"Developer mode"** switch to **ON**.
3. In the top-left, click the **"Load unpacked"** button.
4. Select the compiled **`dumpit-extension/dist`** directory (do NOT select the root source folder).
5. The **DumpIt Vault** extension is now installed and active! Pin it to your extension toolbar for easy access.

---

## Development Workflow

- Run Vite in developer watch mode with Hot Module Replacement (HMR):
  ```bash
  npm run dev
  ```
- Build the final production extension:
  ```bash
  npm run build
  ```

---

## Authentication Syncing Security
To log in, click **"Sign In via Web App"** in the extension UI. This opens your configured DumpIt web dashboard.
- The web application securely dispatches the Firebase `idToken` to the document via a custom event (`DUMPIT_EXTENSION_AUTH`).
- The extension's content script intercepts this event **only** on trusted matching origins (`http://localhost:3000` or your configured production API domain), verifying and writing the token to the extension's local storage.
- The token is a standard JWT that automatically expires in **1 hour**, keeping your session completely secure.
