import { create } from "zustand";

// Holds real activity loaded from the authenticated user's inbox.
const useInboxStore = create((set) => ({
  messages: [],

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

}));

export { useInboxStore };
