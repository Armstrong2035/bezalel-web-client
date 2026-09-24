"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "./useAuth";

// Document lists load on /documents; open documents hydrate their own data.
// Avoid loading the entire document list on every signed-in route.
export default function FirestoreInitializer() {
  const { user } = useAuth();
  const setUserData = useOnboardingStore((state) => state.setUserData);
  useEffect(() => {
    setUserData(user ? {
      uid: user.uid,
      displayName: user.displayName,
      avatar: user.photoURL,
    } : {});
  }, [user, setUserData]);
  return null;
}
