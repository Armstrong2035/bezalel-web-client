import { create } from "zustand";
import {
  signInWithGoogle,
  sendPasswordlessSignInLink,
  sendPasswordlessSignUpLink,
  completePasswordlessSignIn,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isSignInLink,
  getEmailForSignIn,
  getSignInMode,
  updateUserProfile,
  getUserDocument,
} from "../firebase/auth";

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userDocument: null, // Firestore user document
  loading: true,
  error: null,
  isNewUser: false,

  // Actions
  setUser: (user) => set({ user }),
  setUserDocument: (userDocument) => set({ userDocument }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsNewUser: (isNewUser) => set({ isNewUser }),
  clearError: () => set({ error: null }),

  // Initialize auth state listener
  initializeAuth: () => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          // Fetch user document from Firestore
          const userDocument = await getUserDocument(user.uid);
          set({
            user,
            userDocument,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching user document:", error);
          set({
            user,
            userDocument: null,
            loading: false,
            error: "Failed to load user data",
          });
        }
      } else {
        set({
          user: null,
          userDocument: null,
          loading: false,
          error: null,
          isNewUser: false,
        });
      }
    });
    return unsubscribe;
  },

  // Google Sign In/Up
  signInWithGoogle: async () => {
    try {
      set({ error: null, loading: true });
      const { user, isNewUser, result } = await signInWithGoogle();

      // Fetch user document
      const userDocument = await getUserDocument(user.uid);

      set({
        user,
        userDocument,
        isNewUser,
        loading: false,
      });

      return { user, isNewUser, result };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Google Sign Up (alias for signInWithGoogle since Google handles both)
  signUpWithGoogle: async () => {
    return get().signInWithGoogle();
  },

  // Passwordless Email Sign In
  sendPasswordlessSignInLink: async (email) => {
    try {
      set({ error: null });
      const result = await sendPasswordlessSignInLink(email, false);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Passwordless Email Sign Up
  sendPasswordlessSignUpLink: async (email) => {
    try {
      set({ error: null });
      const result = await sendPasswordlessSignUpLink(email);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Complete Passwordless Sign In/Up
  completePasswordlessSignIn: async (email) => {
    try {
      set({ error: null, loading: true });
      const { user, isNewUser, result } = await completePasswordlessSignIn(
        email
      );

      // Fetch user document
      const userDocument = await getUserDocument(user.uid);

      set({
        user,
        userDocument,
        isNewUser,
        loading: false,
      });

      return { user, isNewUser, result };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      set({ error: null });
      await signOutUser();
      set({
        user: null,
        userDocument: null,
        isNewUser: false,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (profileData) => {
    try {
      set({ error: null });
      await updateUserProfile(profileData);

      // Update local user state
      const currentUser = getCurrentUser();
      if (currentUser) {
        // Fetch updated user document
        const userDocument = await getUserDocument(currentUser.uid);
        set({
          user: currentUser,
          userDocument,
        });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Refresh user document from Firestore
  refreshUserDocument: async () => {
    try {
      const { user } = get();
      if (user) {
        const userDocument = await getUserDocument(user.uid);
        set({ userDocument });
        return userDocument;
      }
    } catch (error) {
      console.error("Error refreshing user document:", error);
      throw error;
    }
  },

  // Utility functions
  isSignInLink: () => isSignInLink(),
  getEmailForSignIn: () => getEmailForSignIn(),
  getSignInMode: () => getSignInMode(),
  getCurrentUser: () => getCurrentUser(),
}));

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  if (error.code) {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters long.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked. Please allow popups and try again.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";
      case "auth/invalid-action-code":
        return "Invalid or expired sign-in link. Please request a new one.";
      case "auth/expired-action-code":
        return "Sign-in link has expired. Please request a new one.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please try again.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method.";
      case "firestore/permission-denied":
        return "Permission denied. Please try again or contact support.";
      case "firestore/unavailable":
        return "Service temporarily unavailable. Please try again.";
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  }
  return error.message || "An unexpected error occurred. Please try again.";
};
