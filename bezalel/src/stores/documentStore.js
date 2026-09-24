import { create } from "zustand";

/**
 * Manages the list of user's business model documents and which one is active.
 * Each document represents one full business model canvas.
 *
 * Context is stored *inside* each document object under the `context` key,
 * so documents[n].context holds the per-doc business context answers.
 */
const useDocumentStore = create((set, get) => ({
  // All documents belonging to the current user
  documents: [],
  documentsLoaded: false,
  setDocuments: (docs) => set({ documents: docs, documentsLoaded: true }),
  upsertDocument: (doc) => set((state) => ({
    documents: state.documents.some((item) => item.id === doc.id)
      ? state.documents.map((item) => item.id === doc.id ? doc : item)
      : [...state.documents, doc],
  })),
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),

  // Convenience: set just the context for one document
  setDocumentContext: (docId, context) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === docId ? { ...d, context } : d
      ),
    })),

  // Convenience getter — returns the context object for a given docId
  getDocumentContext: (docId) => {
    const doc = get().documents.find((d) => d.id === docId);
    return doc?.context ?? null;
  },

  // The currently open document
  activeDocumentId: null,
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),

  // Which section's right-panel is open ("customerSegments", "context", or null)
  openSectionKey: null,
  setOpenSectionKey: (key) => set({ openSectionKey: key }),
}));

export { useDocumentStore };
