# Project Organizer

A small web app to help organize projects and tasks. The app supports:
- Creating projects
- Adding tasks to projects
- Editing project names
- Deleting tasks and projects
- Local browser persistence (localStorage)
- Optional cloud sync via Firebase (Firestore) and user authentication
- Activity tracking: time entries, meeting notes, and project notes per project

This README is kept concise and focused on how to run and use the app; it will be updated alongside code changes so it stays accurate.

---

## Quick overview

- Files:
  - `projects.html` — main UI (can be opened directly or served)
  - `projects.js` — client logic (localStorage, UI rendering, activity tracking)
  - `styles.css` — basic styling and responsive layout
  - `firebase-config.js` — Firebase configuration (kept separate; do not commit secrets unless intentional)
  - `auth.js` — small auth helpers (signup, login, logout, observeAuth)
  - `firebase-sync.js` — optional sync layer that uses `firebase-config.js` to save projects and activities to Firestore

- Data persistence:
  - Default: saved locally in your browser under `projectOrganizer.projects` and `projectOrganizer.activities`.
  - Optional: when Firebase is configured, data can sync to Firestore in dev mode (unauthenticated) or authenticated mode.

---

## Run locally (for non‑coders)

Option A — Open file directly (easiest)
1. Ensure `projects.html`, `projects.js`, and `styles.css` are in the same folder.
2. Double-click `projects.html` to open it in your browser.
3. Use the UI to add projects and tasks. Data stays in your browser.

Option B — Use a simple local server (recommended if imports or modules are blocked)
1. Open a terminal/command prompt in the folder.
2. If you have Python 3: run:
   ```
   python3 -m http.server 8000
   ```
3. Open your browser to: `http://localhost:8000/projects.html`

---

## Using the app

### Projects and Tasks
- Add a project using the "Add New Project" form.
- Click a project's "Edit" to rename it (prompt), or "Delete" to remove it (with confirmation).
- Under a project, use the "New task" field to add tasks; tasks have a small delete button.
- Projects and tasks persist between reloads using your browser storage.

### Activity Tracking
- Click on a project name to open the Activity panel.
- The Activity panel has three tabs:
  - **Time Entries**: Log hours worked with descriptions
  - **Meeting Notes**: Record meeting titles and notes
  - **Project Notes**: Add general project notes
- All activities are saved locally in `projectOrganizer.activities` and synced to Firestore if configured.
- Close the Activity panel with the "Close" button.

---

## Optional: Firebase sync (cloud)

- Purpose: sync projects and activities across browsers/devices and support authenticated users.
- Files involved:
  - `firebase-config.js` — your Firebase project configuration (already present in the repo).
  - `auth.js` — helper functions for sign-up/sign-in/sign-out.
  - `firebase-sync.js` — optional layer that saves to Firestore collections based on auth state.

### Firestore Dev Mode (Unauthenticated)

When no user is authenticated, the app uses "dev mode" collections with a `dev_` prefix:
- **dev_projects_data** — stores project items
- **dev_project_activities** — stores activity entries (time, meetings, notes)

This allows testing and development without requiring authentication.

### Firestore Collections

| Collection Name | Auth State | Purpose |
|----------------|------------|---------|
| `dev_projects_data` | Unauthenticated | Projects and tasks in dev mode |
| `dev_project_activities` | Unauthenticated | Activities in dev mode |
| `projects_data` | Authenticated | Projects and tasks for signed-in users |
| `project_activities` | Authenticated | Activities for signed-in users |

### Setup Steps

To enable:
1. Create a Firebase project and enable Firestore.
2. Update `firebase-config.js` with your Firebase config values (apiKey, projectId, etc.) if not already present.
3. Set Firestore security rules (see below).
4. Serve the app via a local server (Python, Node.js, etc.) to allow ES modules to load.
5. Open the app and start using it. In dev mode (no sign-in), data goes to `dev_*` collections.

### Firestore Security Rules

For development/testing (open dev mode):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Dev collections - open for testing (NO AUTH REQUIRED)
    match /dev_projects_data/{document=**} {
      allow read, write: if true;
    }
    match /dev_project_activities/{document=**} {
      allow read, write: if true;
    }
    
    // Authenticated collections - require auth
    match /projects_data/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /project_activities/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Warning**: Dev rules allow anyone to read/write. Use only for development. For production, remove dev rules and require authentication.

### Testing Steps

**Local only (no Firebase)**:
1. Open `projects.html` in a browser (via local server).
2. Create projects and tasks.
3. Click a project to open Activity panel and add time entries, meetings, or notes.
4. Verify data persists in localStorage (check browser DevTools → Application → Local Storage).

**With Firebase (dev rules)**:
1. Add `firebase-config.js` with your project config.
2. Set Firestore rules to dev mode (see above).
3. Open the app via local server.
4. Create a project and add activities.
5. Check Firebase Console → Firestore to confirm documents appear in `dev_projects_data` and `dev_project_activities` collections.

Notes:
- The app will still work fully without Firebase; `firebase-sync.js` is defensive and will no-op if Firebase/auth is not configured.
- Do not commit sensitive credentials publicly unless you intend the config to be public (Firebase web configs are generally safe for client-side apps).
- `firebase-config.js` is not modified by this feature; bring your own config or use the existing one.

---

## GitHub Pages (optional)

To publish:
1. Go to your repository Settings → Pages.
2. Under "Source", select branch `main` and folder `/` (root).
3. Save. After a minute the site will be available at:
   `https://<your-github-username>.github.io/<repo-name>/projects.html`

---

## Contributing / Maintenance

- Keep the README concise. When code changes add a short note here explaining:
  - New files introduced
  - Any changes to running the app locally
  - Any Firebase/auth requirements or breaking changes
- If you want, I (Copilot) can keep this README updated when I make PRs that change the UI or behavior — say “auto-update README” and I’ll include README edits with future UI changes.

---

## License & Contact

- This repo is open for issues and pull requests. Please submit any bugs or feature requests via GitHub Issues.
- If you want me to make a specific change, tell me what to do and I’ll prepare a PR.
