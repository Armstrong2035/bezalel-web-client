// components/auth/useAuthRedirect.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChange, getUserDocument } from "@/firebase/auth";

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      const pathname = window.location.pathname;

      if (user) {
        // Delay to ensure Firestore updates propagate
        await new Promise((resolve) => setTimeout(resolve, 500));
        const userDoc = await getUserDocument(user.uid);
        const onboardingCompleted = userDoc?.onboardingCompleted || false;

        if (onboardingCompleted && pathname !== "/segments") {
          router.push("/segments");
        } else if (!onboardingCompleted && pathname !== "/onboarding") {
          router.push("/onboarding");
        }
      } else if (
        pathname !== "/onboarding" &&
        pathname !== "/signup" &&
        pathname !== "/signin"
      ) {
        router.push("/onboarding");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return { loading };
}
