import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSegmentsStore = create((set) => ({
  segments: {},
  setSegments: (data) =>
    set((state) => ({
      segments: { ...state.segments, ...data },
    })),

  acceptedIdeas: [],
  setAcceptedIdeas: (data) =>
    set((state) => ({ acceptedIdeas: [...state.acceptedIdeas, data] })),
}));

export { useSegmentsStore };
