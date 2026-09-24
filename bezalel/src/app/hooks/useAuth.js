"use client";
import { useSyncExternalStore } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { useDocumentStore } from "@/stores/documentStore";
import { useSegmentsStore } from "@/stores/segmentsStore";

const initialSnapshot = { user: null, loading: true };
let snapshot = initialSnapshot;
let workspaceUserId;
let unsubscribe;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  if (!unsubscribe) {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid ?? null;
      if (workspaceUserId !== uid) {
        workspaceUserId = uid;
        useDocumentStore.setState({ documents: [], documentsLoaded: false, activeDocumentId: null, openSectionKey: null });
        useSegmentsStore.setState({ segments: {}, acceptedIdeas: [] });
      }
      snapshot = { user, loading: false };
      listeners.forEach(notify => notify());
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      unsubscribe?.();
      unsubscribe = undefined;
      snapshot = initialSnapshot;
    }
  };
}

export const useAuth = () => useSyncExternalStore(subscribe, () => snapshot, () => initialSnapshot);
