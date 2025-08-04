import React, { createContext, useContext, useEffect, useState } from "react";
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

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogleHandler = async () => {
    try {
      setError(null);
      const result = await signInWithGoogle();
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const sendPasswordlessLink = async (email) => {
    try {
      setError(null);
      const result = await sendPasswordlessSignInLink(email);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const completePasswordlessSignInHandler = async (email) => {
    try {
      setError(null);
      const result = await completePasswordlessSignIn(email);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOutHandler = async () => {
    try {
      setError(null);
      await signOutUser();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateProfileHandler = async (profileData) => {
    try {
      setError(null);
      await updateUserProfile(profileData);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle: signInWithGoogleHandler,
    sendPasswordlessLink,
    completePasswordlessSignIn: completePasswordlessSignInHandler,
    signOut: signOutHandler,
    updateProfile: updateProfileHandler,
    clearError,
    isSignInLink,
    getEmailForSignIn,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
