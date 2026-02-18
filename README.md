# Project Organizer

## Overview
This application is designed to help users organize their projects efficiently, providing features for task management, deadline tracking, and collaboration tools. The app works locally with localStorage persistence and optionally syncs to Firebase Firestore when configured.

## Features
- ✅ Create, edit, and delete projects
- ✅ Add and remove tasks for each project
- ✅ localStorage persistence (works offline)
- ✅ Optional Firebase authentication and Firestore sync
- ✅ Responsive design for mobile and desktop

## How to Run Locally

### Option 1: Direct File Access
Simply open `projects.html` in your web browser. The app will work with localStorage persistence without any server.

```bash
# Open in default browser (macOS)
open projects.html

# Open in default browser (Linux)
xdg-open projects.html

# Open in default browser (Windows)
start projects.html
```

### Option 2: Using a Simple HTTP Server
For better compatibility with ES6 modules and Firebase, use a local HTTP server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (with http-server):**
```bash
npm install -g http-server
http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000/projects.html` in your browser.

## Testing

### Local Testing (No Firebase)
1. Open `projects.html` in a browser
2. Add a new project using the form
3. Add tasks to the project
4. Edit project names by double-clicking them
5. Delete projects and tasks using the buttons
6. Reload the page - your data should persist via localStorage

### Firebase Testing (Optional)
1. Configure `firebase-config.js` with your Firebase project credentials (already configured in this repo)
2. Enable Firestore Database in your Firebase console
3. Enable Email/Password authentication in Firebase console
4. Open `projects.html` via HTTP server (not file://)
5. Click "Sign In" and create an account or sign in
6. Add projects and tasks - they will sync to Firestore
7. Open in another browser or device, sign in with the same account
8. Verify that projects sync across devices in real-time

## Optional Firebase Sync Setup

Firebase sync is **completely optional**. The app works perfectly fine with just localStorage. However, if you want to sync your projects across devices:

### Firebase Configuration Setup Instructions
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click on 'Add project' and follow the prompts to create a new project.

2. **Add a Web App**:
   - In your Firebase project, click on the web icon (</>) to add a web app.
   - Register your app and Firebase will provide you with the configuration object.

3. **Enable Firestore Database**:
   - In the Firebase Console, go to Firestore Database
   - Click "Create database"
   - Start in test mode (for development) or production mode
   - Choose a location for your database

4. **Enable Authentication**:
   - In the Firebase Console, go to Authentication
   - Click "Get started"
   - Enable "Email/Password" sign-in method

5. **Update Configuration** (if needed):
   - The `firebase-config.js` file already contains configuration
   - If you want to use your own Firebase project, update the values in `firebase-config.js`
   - **Note**: `firebase-config.js` is not modified by this PR - it's already configured

6. **Deploy or Test Locally**:
   - Use a local HTTP server as described above
   - Or deploy to GitHub Pages (see below)

## Deploying to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select the branch (e.g., `main`) and root folder
   - Click "Save"

2. **Access Your App**:
   - Your app will be available at `https://<username>.github.io/<repository-name>/projects.html`
   - Example: `https://mlaurentUSL.github.io/ProjectOrganizer/projects.html`

3. **Firebase Configuration**:
   - Make sure your Firebase project allows your GitHub Pages domain
   - Add your GitHub Pages URL to Firebase authorized domains in Authentication settings

## File Structure

```
ProjectOrganizer/
├── projects.html          # Main application page
├── projects.js            # Core app logic with localStorage
├── firebase-sync.js       # Optional Firebase sync module (NEW)
├── auth.js               # Firebase authentication helpers
├── firebase-config.js     # Firebase configuration (not modified)
├── styles.css            # Application styles
├── index.html            # Landing page
├── reports.html          # Reports page
└── README.md             # This file
```

## How It Works

### Local Mode (Default)
- Projects are stored in browser's localStorage
- No account or internet connection required
- Data persists across page reloads
- Data is local to your browser only

### Firebase Mode (Optional)
- When you sign in, projects sync to Firestore
- Projects sync in real-time across browsers/devices
- Sign in with email and password
- Data is stored securely in your Firebase project

### Backward Compatibility
The app is designed to work with or without Firebase:
- If Firebase is not configured, the app works with localStorage only
- If Firebase is configured but user is not signed in, the app uses localStorage
- If Firebase is configured and user is signed in, the app syncs to Firestore

## Browser Compatibility
- Modern browsers with ES6 module support
- localStorage support required
- Works best when served via HTTP (for ES6 modules)

## Contributing
Feel free to submit issues or pull requests for any improvements or bug fixes!