"use client";

import AuthPage from "@/components/auth/authPage";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { saveOnboardingContext } from "@/firebase/saveDecisionContext";

export default function SignUp() {
  const decisionContext = useOnboardingStore((state) => state.onboardingData);

  const handleAuthSuccess = async (user) => {
    if (user && Object.values(decisionContext).every((value) => value)) {
      await saveOnboardingContext(user.uid, decisionContext);
    }
  };
  return (
    <AuthPage
      heading={"Sign up"}
      cta={"Sign up"}
      sidebarInfo={"Welcome to Bezalel."}
      onSuccess={handleAuthSuccess}
    />
  );
}
