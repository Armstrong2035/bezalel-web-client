import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { app } from "./config";

// Initialize Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in with Google using popup
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

/**
 * Send passwordless sign-in link to email
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const sendPasswordlessSignInLink = async (email) => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify`,
      handleCodeInApp: true,
      iOS: {
        bundleId: "com.bezalel.app",
      },
      android: {
        packageName: "com.bezalel.app",
        installApp: true,
        minimumVersion: "12",
      },
      dynamicLinkDomain: process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Save email to localStorage for verification
    window.localStorage.setItem("emailForSignIn", email);

    return { success: true };
  } catch (error) {
    console.error("Passwordless sign-in error:", error);
    throw error;
  }
};

/**
 * Complete passwordless sign-in with email link
 * @param {string} email - User's email address
 * @returns {Promise<UserCredential>}
 */
export const completePasswordlessSignIn = async (email) => {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );

      // Clear email from localStorage
      window.localStorage.removeItem("emailForSignIn");

      return result;
    } else {
      throw new Error("Invalid sign-in link");
    }
  } catch (error) {
    console.error("Complete passwordless sign-in error:", error);
    throw error;
  }
};

/**
 * Check if current URL is a sign-in link
 * @returns {boolean}
 */
export const isSignInLink = () => {
  return isSignInWithEmailLink(auth, window.location.href);
};

/**
 * Get email from localStorage for sign-in completion
 * @returns {string|null}
 */
export const getEmailForSignIn = () => {
  return window.localStorage.getItem("emailForSignIn");
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
      await updateProfile(user, profileData);
    } else {
      throw new Error("No user is currently signed in");
    }
  } catch (error) {
    console.error("Update profile error:", error);
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

// Export auth instance for direct access if needed
export { auth };
