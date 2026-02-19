// firebase-sync.js
// Optional Firebase synchronization module for ProjectOrganizer
// Provides auth state management and Firestore sync functionality
// Gracefully degrades if Firebase is not configured or unavailable

let currentUser = null;
let unsubscribeSnapshot = null;
let authInitialized = false;
let remoteUpdateCallback = null;
let cachedAuthModule = null;

// Get or load auth module (cached after first load)
async function getAuthModule() {
  if (cachedAuthModule) {
    return cachedAuthModule;
  }
  
  cachedAuthModule = await import('./auth.js').catch(() => null);
  return cachedAuthModule;
}

// Initialize Firebase sync (setup auth observer and subscriptions)
async function init() {
  if (authInitialized) return;
  
  try {
    // Check if auth module is available
    const authModule = await getAuthModule();
    if (!authModule || !authModule.observeAuth) {
      console.log('Firebase auth not available - running in local-only mode');
      return;
    }

    // Setup auth state observer
    authModule.observeAuth((user) => {
      currentUser = user;
      
      if (user) {
        console.log('User signed in:', user.email || user.uid);
        // When user signs in, start syncing
        setupFirestoreSync();
      } else {
        console.log('User signed out');
        // When user signs out, stop syncing
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    });
    
    authInitialized = true;
  } catch (error) {
    console.log('Firebase initialization skipped:', error.message);
  }
}

// Save projects to Firestore (if user is signed in)
async function saveProjects(projects) {
  if (!currentUser) {
    // User not signed in, skip Firebase sync
    return;
  }

  try {
    const { db } = await import('./firebase-config.js');
    const { doc, setDoc } = await import('firebase/firestore');
    
    // Save to user-specific document
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, { projects }, { merge: true });
    
    console.log('Projects synced to Firestore');
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
}

// Setup Firestore real-time sync listener
async function setupFirestoreSync() {
  if (!currentUser || unsubscribeSnapshot) {
    return; // Already subscribed or no user
  }

  try {
    const { db } = await import('./firebase-config.js');
    const { doc, onSnapshot } = await import('firebase/firestore');
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Listen for real-time updates
    unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.projects && remoteUpdateCallback) {
          remoteUpdateCallback(data.projects);
        }
      }
    }, (error) => {
      console.error('Error listening to Firestore:', error);
    });
  } catch (error) {
    console.error('Error setting up Firestore sync:', error);
  }
}

// Subscribe to remote project updates
function subscribe(onRemoteUpdate) {
  if (typeof onRemoteUpdate === 'function') {
    remoteUpdateCallback = onRemoteUpdate;
  }
}

// Observe auth state changes (wrapper for auth.observeAuth)
async function observeAuth(callback) {
  try {
    const authModule = await getAuthModule();
    if (authModule && authModule.observeAuth) {
      return authModule.observeAuth(callback);
    }
  } catch (error) {
    console.log('Auth observation not available:', error.message);
  }
  
  // If auth not available, call callback immediately with null
  if (typeof callback === 'function') {
    callback(null);
  }
}

// Open sign-in flow (prompts for email/password)
async function openSignIn() {
  const authModule = await getAuthModule();
  if (!authModule || !authModule.login) {
    alert('Firebase authentication not configured');
    return;
  }

  try {
    const email = prompt('Enter email:');
    if (!email) return;
    
    const password = prompt('Enter password:');
    if (!password) return;

    await authModule.login(email, password);
    alert('Signed in successfully!');
  } catch (error) {
    console.error('Sign in error:', error);
    
    // If login fails, try signup
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      const trySignup = confirm('Login failed. Would you like to create a new account?');
      if (trySignup && authModule.signup) {
        try {
          const email = prompt('Enter email for new account:');
          if (!email) return;
          
          const password = prompt('Enter password (min 6 characters):');
          if (!password) return;

          await authModule.signup(email, password);
          alert('Account created and signed in successfully!');
        } catch (signupError) {
          alert('Signup failed: ' + signupError.message);
        }
      }
    } else {
      alert('Sign in failed: ' + error.message);
    }
  }
}

// Sign out current user
async function signOut() {
  try {
    const authModule = await getAuthModule();
    if (authModule && authModule.logout) {
      await authModule.logout();
      alert('Signed out successfully');
    }
  } catch (error) {
    console.error('Sign out error:', error);
    alert('Sign out failed: ' + error.message);
  }
}

// Export the firebaseSync API
window.firebaseSync = {
  init,
  saveProjects,
  subscribe,
  observeAuth,
  openSignIn,
  signOut
};

// Auto-initialize on load
init();
