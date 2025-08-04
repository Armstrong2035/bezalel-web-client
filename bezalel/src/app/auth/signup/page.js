// pages/signup.js
"use client";

import AuthPage from "@/components/auth/authPage";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const { onboardingData, resetOnboardingData } = useOnboardingStore();

  return (
    <AuthPage
      heading="Sign up"
      cta="Sign up"
      sidebarInfo="Welcome to Bezalel."
    />
  );
}
