# Project Organizer

A small web app to help organize projects and tasks. The app supports:
- Creating projects
- Adding tasks to projects
- Editing project names
- Deleting tasks and projects
- Local browser persistence (localStorage)
- Optional cloud sync via Firebase (Firestore) and user authentication

This README is kept concise and focused on how to run and use the app; it will be updated alongside code changes so it stays accurate.

---

## Quick overview

- Files:
  - `projects.html` — main UI (can be opened directly or served)
  - `projects.js` — client logic (localStorage, UI rendering)
  - `styles.css` — basic styling and responsive layout
  - `firebase-config.js` — Firebase configuration (kept separate; do not commit secrets unless intentional)
  - `auth.js` — small auth helpers (signup, login, logout, observeAuth)
  - `firebase-sync.js` — optional sync layer that uses `firebase-config.js` + `auth.js` to save projects to Firestore

- Data persistence:
  - Default: saved locally in your browser under `projectOrganizer.projects`.
  - Optional: when Firebase is configured and user is signed in, data can sync to Firestore.

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

- Add a project using the "Add New Project" form.
- Click a project's "Edit" to rename it (prompt), or "Delete" to remove it (with confirmation).
- Under a project, use the "New task" field to add tasks; tasks have a small delete button.
- Projects and tasks persist between reloads using your browser storage.

---

## Optional: Firebase sync (cloud)

- Purpose: sync projects across browsers/devices and support authenticated users.
- Files involved:
  - `firebase-config.js` — your Firebase project configuration (already present in the repo).
  - `auth.js` — helper functions for sign-up/sign-in/sign-out.
  - `firebase-sync.js` — optional layer that listens for auth and reads/writes `user_projects/{uid}` in Firestore.

To enable:
1. Create a Firebase project and enable Firestore.
2. Update `firebase-config.js` with your Firebase config values (apiKey, projectId, etc.) if not already present.
3. Make sure Firestore rules allow authenticated users to read/write their own document.
4. Sign in via the app header controls (note: the repo includes helpers; you may need to add a small sign-in form for email/password or OAuth).
5. Once signed in, the app will attempt to save projects to Firestore and subscribe to remote changes.

Notes:
- The app will still work fully without Firebase; `firebase-sync.js` is defensive and will no-op if Firebase/auth is not configured.
- Do not commit sensitive credentials publicly unless you intend the config to be public (Firebase web configs are generally safe for client-side apps).

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
