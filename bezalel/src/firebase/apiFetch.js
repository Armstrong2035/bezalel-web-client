import { auth } from "./auth";

// Firebase caches valid ID tokens and refreshes them when needed.
export async function apiFetch(input, options = {}) {
  if (typeof input !== "string" || !input.startsWith("/api/")) {
    throw new Error("apiFetch only supports same-origin API paths.");
  }
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to continue.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...options, headers });
}
