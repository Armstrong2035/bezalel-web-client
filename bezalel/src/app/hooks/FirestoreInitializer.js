"use client";

import { useEffect } from "react";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { useAuth } from "./useAuth";
import { subscribeToCanvasSegments } from "@/firebase/subscribeToCanvasSegment";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function FirestoreInitializer() {
  const { user } = useAuth();
  const setSegments = useSegmentsStore((state) => state.setSegments);
  const setUserData = useOnboardingStore((state) => state.setUserData);

  useEffect(() => {
    let unsubscribe = () => {};
    // This hook will re-run if the user object changes (e.g., from null to a user ID).
    if (user) {
      const userInfo = {
        uid: user.uid,
        displayName: user.displayName,
        avatar: user.photoURL,
      };
      setUserData(userInfo);

      // We set up the subscription here. It will run once when the user is available.
      unsubscribe = subscribeToCanvasSegments(user.uid, (data) => {
        setSegments(data);
      });
    }

    return () => {
      // Clean up the subscription when the component unmounts.
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, setSegments, setUserData]);

  // This component doesn't render any UI, it just handles the side effect.
  return null;
}
