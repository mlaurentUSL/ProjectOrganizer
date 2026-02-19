// firebase-sync.js
// Optional Firestore sync layer. ES module. Defensive: if firebase-config or Firestore not available it no-ops.
// Exposes window.firebaseSync with:
// - init(), saveItem(item), subscribeItems(onUpdate),
// - saveActivity(activity), subscribeActivities(projectFullCode, onUpdate),
// - observeAuth(cb), openSignIn(), signOut()
// Uses dev_ prefixed collections when no auth is present.

// Defensive imports: if imports fail, methods will no-op
let db = null;
let collection, doc, setDoc, addDoc, onSnapshot, query, where, orderBy, serverTimestamp;

try {
  const { db: firebaseDb } = await import('./firebase-config.js');
  db = firebaseDb;
  
  const firestoreModule = await import('firebase/firestore');
  ({ collection, doc, setDoc, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } = firestoreModule);
} catch (e) {
  console.warn('firebase-config.js or Firestore not available; firebaseSync will no-op', e);
}

const firebaseSync = {
  _ok: !!db,
  _itemsUnsub: null,
  _activitiesUnsub: null,
  _currentUser: null,
  _authObservers: [],

  init() {
    // No-op for now, but keep for future auth integration
    return;
  },

  // Get collection names based on auth state
  _getItemsCollection() {
    return this._currentUser ? 'projects_data' : 'dev_projects_data';
  },

  _getActivitiesCollection() {
    return this._currentUser ? 'project_activities' : 'dev_project_activities';
  },

  // Save or update an item (client/project/task/subtask)
  // item should include fullCode and type and identifying fields
  async saveItem(item) {
    if (!this._ok) return;
    try {
      const id = item.fullCode || item.name || `${item.clientNumber || 'unknown'}`; // use fullCode as doc id when available
      const collectionName = this._getItemsCollection();
      const ref = doc(db, collectionName, id);
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
      const collectionName = this._getItemsCollection();
      const col = collection(db, collectionName);
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
      const collectionName = this._getActivitiesCollection();
      const col = collection(db, collectionName);
      const payload = { ...activity, createdAt: serverTimestamp() };
      // if caller provided id use setDoc, otherwise addDoc
      if (activity.id) {
        const ref = doc(db, collectionName, activity.id);
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
      const collectionName = this._getActivitiesCollection();
      const col = collection(db, collectionName);
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

  // Auth observation - allows UI to react to auth state changes
  observeAuth(cb) {
    if (typeof cb === 'function') {
      this._authObservers.push(cb);
      // call immediately with current state
      cb(this._currentUser);
    }
  },

  // Notify all observers of auth state change
  _notifyAuthObservers() {
    this._authObservers.forEach(cb => {
      try {
        cb(this._currentUser);
      } catch (e) {
        console.warn('Auth observer error', e);
      }
    });
  },

  openSignIn() {
    alert('Sign-in not configured yet. Using dev collections for now.');
  },

  signOut() {
    this._currentUser = null;
    this._notifyAuthObservers();
  }
};

firebaseSync.init();
window.firebaseSync = firebaseSync;
export default firebaseSync;
