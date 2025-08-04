import { useState, useCallback } from "react";

export const useAuthError = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    let userFriendlyMessage = "An unexpected error occurred. Please try again.";

    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":
          userFriendlyMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          userFriendlyMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          userFriendlyMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          userFriendlyMessage =
            "Password should be at least 6 characters long.";
          break;
        case "auth/email-already-in-use":
          userFriendlyMessage = "An account with this email already exists.";
          break;
        case "auth/popup-closed-by-user":
          userFriendlyMessage = "Sign-in was cancelled. Please try again.";
          break;
        case "auth/popup-blocked":
          userFriendlyMessage =
            "Sign-in popup was blocked. Please allow popups and try again.";
          break;
        case "auth/network-request-failed":
          userFriendlyMessage =
            "Network error. Please check your connection and try again.";
          break;
        case "auth/too-many-requests":
          userFriendlyMessage =
            "Too many failed attempts. Please try again later.";
          break;
        case "auth/operation-not-allowed":
          userFriendlyMessage =
            "This sign-in method is not enabled. Please contact support.";
          break;
        case "auth/invalid-action-code":
          userFriendlyMessage =
            "Invalid or expired sign-in link. Please request a new one.";
          break;
        case "auth/expired-action-code":
          userFriendlyMessage =
            "Sign-in link has expired. Please request a new one.";
          break;
        case "auth/invalid-credential":
          userFriendlyMessage = "Invalid credentials. Please try again.";
          break;
        case "auth/user-disabled":
          userFriendlyMessage =
            "This account has been disabled. Please contact support.";
          break;
        case "auth/account-exists-with-different-credential":
          userFriendlyMessage =
            "An account already exists with this email using a different sign-in method.";
          break;
        default:
          userFriendlyMessage = error.message || userFriendlyMessage;
      }
    } else if (error.message) {
      userFriendlyMessage = error.message;
    }

    setError(userFriendlyMessage);
    return userFriendlyMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
};
