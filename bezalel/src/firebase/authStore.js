import { create } from "zustand";
import {
  signInWithGoogle,
  sendPasswordlessSignInLink,
  completePasswordlessSignIn,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isSignInLink,
  getEmailForSignIn,
  updateUserProfile,
} from "./auth";

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  loading: true,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Initialize auth state listener
  initializeAuth: () => {
    const unsubscribe = onAuthStateChange((user) => {
      set({ user, loading: false, error: null });
    });
    return unsubscribe;
  },

  // Google Sign In
  signInWithGoogle: async () => {
    try {
      set({ error: null });
      const result = await signInWithGoogle();
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Passwordless Email Sign In
  sendPasswordlessLink: async (email) => {
    try {
      set({ error: null });
      const result = await sendPasswordlessSignInLink(email);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Complete Passwordless Sign In
  completePasswordlessSignIn: async (email) => {
    try {
      set({ error: null });
      const result = await completePasswordlessSignIn(email);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Sign Out
  signOut: async () => {
    try {
      set({ error: null });
      await signOutUser();
      set({ user: null });
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
        set({ user: currentUser });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  // Utility functions
  isSignInLink: () => isSignInLink(),
  getEmailForSignIn: () => getEmailForSignIn(),
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
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  }
  return error.message || "An unexpected error occurred. Please try again.";
};
