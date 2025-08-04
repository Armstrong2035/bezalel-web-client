import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOnboardingStore = create(
  persist(
    (set) => ({
      onboardingData: {
        idea: "",
        journey: "",
        goal: "",
        timeAvailability: "",
        capital: "",
        experienceLevel: "",
        archetype: "",
      },
      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),
      resetOnboardingData: () =>
        set(() => ({
          onboardingData: {
            idea: "",
            journey: "",
            goal: "",
            timeAvailability: "",
            capital: "",
            experienceLevel: "",
            archetype: "",
          },
        })),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
