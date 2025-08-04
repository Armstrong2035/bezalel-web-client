// Firebase configuration
export { app } from "./config";

// Authentication functions
export {
  signInWithGoogle,
  sendPasswordlessSignInLink,
  completePasswordlessSignIn,
  signOutUser,
  getCurrentUser,
  onAuthStateChange,
  isSignInLink,
  getEmailForSignIn,
  updateUserProfile,
  auth,
} from "./auth";

// Zustand Store and Components
export { useAuthStore } from "../stores/authStore";
export { AuthInitializer } from "./AuthInitializer";
