// firebase-sync.js
// Optional Firebase sync layer. This file is an ES module and will no-op if Firebase or auth is not configured.
// It exposes window.firebaseSync with the following methods:
// init(), saveProjects(projects), subscribe(onRemoteUpdate), observeAuth(cb), openSignIn(), signOut()

import { db } from './firebase-config.js';
import { observeAuth as observeAuthOrig, signInWithEmail, login as loginOrig, logout as logoutOrig } from './auth.js';
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';

const firebaseSync = {
  _user: null,
  _unsubscribe: null,
  async init() {
    try {
      // observeAuth comes from auth.js
      if (typeof observeAuthOrig === 'function') {
        observeAuthOrig((user) => {
          this._user = user;
          // if signed in and there's a subscription requested, set up doc listener
          if (this._user) {
            // no auto-subscribe here; subscribers can call subscribe()
          } else {
            if (this._unsubscribe) {
              try { this._unsubscribe(); } catch {}
              this._unsubscribe = null;
            }
          }
        });
      }
    } catch (e) {
      // silently fail if auth not configured
    }
  },

  async saveProjects(projects) {
    if (!this._user || !db) return;
    try {
      const ref = doc(db, 'user_projects', this._user.uid);
      await setDoc(ref, { projects, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('firebase-sync saveProjects failed', e);
    }
  },

  // onRemoteUpdate receives remoteProjects array
  subscribe(onRemoteUpdate) {
    if (!db) return;
    if (!this._user) {
      // try to fetch once when not signed in (no-op)
      return;
    }
    try {
      const ref = doc(db, 'user_projects', this._user.uid);
      this._unsubscribe = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data && Array.isArray(data.projects)) {
          onRemoteUpdate(data.projects);
        }
      }, (err) => {
        console.warn('firebase-sync snapshot error', err);
      });
    } catch (e) {
      console.warn('firebase-sync subscribe error', e);
    }
  },

  observeAuth(cb) {
    // expose auth observer
    if (typeof observeAuthOrig === 'function') {
      observeAuthOrig(cb);
    } else {
      // no-op fallback
    }
  },

  openSignIn() {
    // rely on auth.js login function
    if (typeof loginOrig === 'function') {
      // This simple flow assumes you have a UI elsewhere for email/password.
      // Here we just alert the user to use an email/password flow.
      // You can implement a popup sign-in flow or redirect as needed.
      alert('Sign-in flow requires implementation (custom UI). See README for instructions.');
    } else {
      alert('Sign-in not configured.');
    }
  },

  async signOut() {
    if (typeof logoutOrig === 'function') {
      try {
        await logoutOrig();
      } catch (e) { /* ignore */ }
    } else {
      // no-op
    }
  }
};

// initialize quickly
firebaseSync.init();

// attach globally for projects.js to use
window.firebaseSync = firebaseSync;

export default firebaseSync;
