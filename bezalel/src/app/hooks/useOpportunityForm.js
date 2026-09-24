"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/auth";
import { apiFetch } from "@/firebase/apiFetch";
import { useAuth } from "@/app/hooks/useAuth";
import { useDocumentStore } from "@/stores/documentStore";
import { createOpportunityDraft, defaultOpportunityForm, opportunityDraftKey } from "@/app/lib/opportunityForm.mjs";

// A single queue per document keeps a remount from racing an outstanding save.
const drafts = new Map();

export function useOpportunityForm(documentId, initialForm) {
  const { user } = useAuth();
  const userId = user?.uid;
  const scope = userId && documentId ? opportunityDraftKey(userId, documentId) : null;
  const [state, setState] = useState(() => ({ form: defaultOpportunityForm(), status: "idle" }));
  const [active, setActive] = useState(null);
  useEffect(() => {
    let draft = scope && drafts.get(scope);
    if (!draft) {
      let storage;
      try { storage = window.localStorage; } catch { /* Storage can be disabled. */ }
      draft = createOpportunityDraft({
        initialForm, storage: scope ? storage : null, key: scope,
        save: async form => {
          if (!scope) return;
          if (auth.currentUser?.uid !== userId) throw new Error("Sign in to save.");
          const response = await apiFetch(`/api/documents/${encodeURIComponent(documentId)}/opportunity-form`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, form }),
          });
          if (!response.ok) throw new Error("Could not save form.");
          if (auth.currentUser?.uid === userId) useDocumentStore.getState().updateDocument(documentId, { opportunityForm: form });
        },
      });
      if (scope) drafts.set(scope, draft);
    }
    setActive({ scope, draft });
    setState(draft.getSnapshot());
    const unsubscribe = draft.subscribe(() => setState(draft.getSnapshot()));
    const flush = () => { void draft.flush(); };
    const onHidden = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("online", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);
    flush();
    return () => {
      unsubscribe();
      window.removeEventListener("online", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
      flush();
    };
    // Initial server data seeds a document once; saves update that same document store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
  return {
    ...state, ready: active?.scope === scope, persistent: Boolean(scope),
    change: (field, value) => active?.scope === scope && active.draft.change(field, value),
    retry: () => active?.draft.flush(),
  };
}
