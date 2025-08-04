import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, // Added this import for email sign-in
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "./config"; // Assuming your firebase config is in './config.js'

// --- INITIALIZE SERVICES ---
// These are exported so they can be used throughout your application
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- GOOGLE AUTH PROVIDER ---
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// --- HELPER FUNCTIONS ---

/**
 * Creates a user document in Firestore after sign-up or first sign-in.
 * @param {Object} user - The Firebase user object from auth.
 * @param {Object} [additionalData={}] - Optional additional data to store.
 * @returns {Promise<void>}
 */

// Rest of auth.js unchanged
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  // Get a reference to the document for this user
  const userDocRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userDocRef);

  // If the document doesn't exist, create it
  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();

    try {
      await setDoc(userDocRef, {
        displayName: displayName || `User-${user.uid.substring(0, 5)}`,
        email,
        photoURL: photoURL || null,
        createdAt,
        updatedAt: createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      // Re-throw the error to be caught by the calling function
      throw error;
    }
  }
};

/**
 * Signs up a new user with email and password and creates their user document.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's chosen password.
 * @returns {Promise<{user: Object|null, error: Object|null}>} An object containing the user or an error.
 */
export const signUpWithEmail = async (email, password) => {
  try {
    // Create the user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create the user document in Firestore
    await createUserDocument(user);

    // Return the user and no error
    return { user, error: null };
  } catch (error) {
    console.error("Error during email sign up:", error.message);
    // Return no user and the error object
    return { user: null, error };
  }
};

/**
 * Signs in an existing user with email and password.
 * If the user document doesn't exist (edge case), it creates one.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<{user: Object|null, error: Object|null}>} An object containing the user or an error.
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Sign in the user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Ensure the user document exists in Firestore (in case it was missing)
    await createUserDocument(user);

    // Return the user and no error
    return { user, error: null };
  } catch (error) {
    console.error("Error during email sign in:", error.message);
    // Return no user and the error object
    return { user: null, error };
  }
};

/**
 * Sign in/up with Google using popup.
 * This handles both sign-in (existing users) and sign-up (new users).
 * Creates user document if it's a new user.
 * @returns {Promise<{user: User, isNewUser: boolean}>}
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists to determine if this is a new user
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);
    const isNewUser = !userSnapshot.exists();

    // Create user document if it doesn't exist
    await createUserDocument(user, {
      signInMethod: "google",
      provider: "google.com",
    });

    return { user, isNewUser, result };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Update Firebase Auth profile
      await updateProfile(user, profileData);

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      throw new Error("No user is currently signed in");
    }
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

/**
 * Get user document from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getUserDocument = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      return { id: userSnapshot.id, ...userSnapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Get user document error:", error);
    throw error;
  }
};

/**
 * Get current user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user authentication state
 * @returns {Promise<User|null>}
 */
export const getAuthState = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};
