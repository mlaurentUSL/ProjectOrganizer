// firebase-sync.js
// Optional Firestore sync layer. ES module. Defensive: if firebase-config or Firestore not available it no-ops.
// Exposes window.firebaseSync with:
// - init(), saveItem(item), subscribeItems(onUpdate),
// - saveActivity(activity), subscribeActivities(projectFullCode, onUpdate),
// - observeAuth(cb), openSignIn(), signOut()

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const firebaseSync = {
  _ok: !!db,
  _itemsUnsub: null,
  _activitiesUnsub: null,

  init() {
    // No-op for now, but keep for future auth integration
    return;
  },

  // Save or update an item (client/project/task/subtask)
  // item should include fullCode and type and identifying fields
  async saveItem(item) {
    if (!this._ok) return;
    try {
      const id = item.fullCode || `${item.clientNumber || 'unknown'}`; // use fullCode as doc id when available
      const ref = doc(db, 'projects_data', id);
      const payload = { ...item, updatedAt: serverTimestamp() };
      await setDoc(ref, payload, { merge: true });
    } catch (e) {
      console.warn('firebaseSync.saveItem error', e);
    }
  },

  // Subscribe to all items (or you can extend to scoped queries)
  subscribeItems(onUpdate) {
    if (!this._ok) return;
    try {
      const col = collection(db, 'projects_data');
      if (this._itemsUnsub) this._itemsUnsub();
      this._itemsUnsub = onSnapshot(col, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        onUpdate(arr);
      }, (err) => console.warn('items snapshot error', err));
    } catch (e) {
      console.warn('firebaseSync.subscribeItems error', e);
    }
  },

  // Save an activity (time / meeting / note)
  async saveActivity(activity) {
    if (!this._ok) return;
    try {
      const col = collection(db, 'project_activities');
      const payload = { ...activity, createdAt: serverTimestamp() };
      // if caller provided id use setDoc, otherwise addDoc
      if (activity.id) {
        const ref = doc(db, 'project_activities', activity.id);
        await setDoc(ref, payload, { merge: true });
      } else {
        await addDoc(col, payload);
      }
    } catch (e) {
      console.warn('firebaseSync.saveActivity error', e);
    }
  },

  // Subscribe to activities for a projectFullCode
  subscribeActivities(projectFullCode, onUpdate) {
    if (!this._ok) return;
    try {
      if (this._activitiesUnsub) this._activitiesUnsub();
      const col = collection(db, 'project_activities');
      const q = query(col, where('projectFullCode', '==', projectFullCode), orderBy('createdAt', 'desc'));
      this._activitiesUnsub = onSnapshot(q, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        onUpdate(arr);
      }, (err) => console.warn('activities snapshot error', err));
    } catch (e) {
      console.warn('firebaseSync.subscribeActivities error', e);
    }
  },

  // minimal auth shim (no auth flow for now)
  observeAuth(cb) {
    // no auth implemented yet — call cb(null)
    if (typeof cb === 'function') cb(null);
  },

  openSignIn() {
    alert('Sign-in not configured yet.');
  },

  signOut() {
    // no-op
  }
};

firebaseSync.init();
window.firebaseSync = firebaseSync;
export default firebaseSync;
