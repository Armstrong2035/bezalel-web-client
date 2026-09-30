import { create } from "zustand";
import { buildSampleMessages } from "./inboxSample";

/**
 * Holds the orchestrator's inbox: the messages that tools (Explorium, Grokbot,
 * Bezalel, OpenAI, Poysis, and future automations) send to the user.
 *
 * This store is intentionally provider-agnostic. A real integration replaces
 * `seedSampleMessages` with a fetch from a durable activity collection and
 * reuses the same `upsertMessage` / `markRead` / `removeMessage` actions.
 */
const useInboxStore = create((set, get) => ({
  messages: [],
  seededUid: null,

  setMessages: (messages) => set({ messages }),

  upsertMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id);
      return {
        messages: exists
          ? state.messages.map((m) => (m.id === message.id ? { ...m, ...message } : m))
          : [message, ...state.messages],
      };
    }),

  markRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id && m.status === "unread" ? { ...m, status: "read" } : m
      ),
    })),

  markUnread: (id) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, status: "unread" } : m)),
    })),

  markAllRead: () =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.status === "unread" ? { ...m, status: "read" } : m
      ),
    })),

  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

  removeMessagesForDocument: (documentId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.documentId !== documentId),
    })),

  seedSampleMessages: (uid, documents) => {
    const { seededUid } = get();
    if (seededUid === uid) return;
    set({ messages: buildSampleMessages(documents ?? []), seededUid: uid });
  },
}));

export { useInboxStore };
