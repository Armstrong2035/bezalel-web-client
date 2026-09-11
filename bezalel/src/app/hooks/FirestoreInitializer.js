"use client";

import { useEffect } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuth } from "./useAuth";

/**
 * FirestoreInitializer
 *
 * Runs once on app mount when a user is authenticated.
 * Responsibilities:
 *   1. Store basic user metadata in the onboarding store (uid, name, avatar).
 *   2. Pre-load the user's document list into the document store.
 *
 * Note: segment subscriptions are handled at the document level
 * inside /document/[docId]/page.js to scope them to the active document.
 */
export default function FirestoreInitializer() {
  const { user } = useAuth();
  const setUserData = useOnboardingStore((state) => state.setUserData);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const documents = useDocumentStore((state) => state.documents);

  useEffect(() => {
    if (!user) return;

    // Store user identity
    setUserData({
      uid: user.uid,
      displayName: user.displayName,
      avatar: user.photoURL,
    });

    // Only fetch docs if the store is empty (avoids re-fetching on every mount)
    if (documents.length > 0) return;

    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/documents?userId=${user.uid}`);
        if (res.ok) {
          const { documents: docs } = await res.json();
          setDocuments(docs);
        }
      } catch (err) {
        console.error("FirestoreInitializer: failed to load documents:", err);
      }
    };

    fetchDocuments();
  }, [user, setUserData, setDocuments, documents.length]);

  return null;
}
