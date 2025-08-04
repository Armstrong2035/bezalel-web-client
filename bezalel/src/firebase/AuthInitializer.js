"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { onAuthStateChange, getUserDocument } from "../firebase/auth";

export const AuthInitializer = ({ children }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const unsubscribe = onAuthStateChange(async (user) => {
      const store = useAuthStore.getState();

      if (user) {
        try {
          const userDocument = await getUserDocument(user.uid);
          store.setUser(user);
          store.setUserDocument(userDocument);
          store.setError(null);
        } catch (error) {
          console.error("Error fetching user document:", error);
          store.setUser(user);
          store.setUserDocument(null);
          store.setError("Failed to load user data");
        }
      } else {
        store.setUser(null);
        store.setUserDocument(null);
        store.setError(null);
      }
      store.setLoading(false);
    });

    return unsubscribe;
  }, []); // No dependencies at all

  return children;
};
