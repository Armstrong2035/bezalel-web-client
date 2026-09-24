"use client";

// components/auth/GoogleAuthProvider.js
import { useState } from "react";
import styles from "./auth.module.css";
import { signInWithGoogle } from "@/firebase/auth";
import { useLoadingRouter as useRouter } from "@/app/hooks/useNavigationLoading";

const errorMessages = {
  "auth/unauthorized-domain":
    "This domain is not authorized for Google sign-in. Add it to your Firebase project's Authorized domains.",
  "auth/popup-closed-by-user":
    "The sign-in window closed before you finished. Please try again.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in window. Please allow pop-ups and try again.",
  "auth/cancelled-popup-request":
    "Sign-in was cancelled. Please try again.",
};

export default function GoogleAuthProvider({ cta }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { user } = await signInWithGoogle();
      if (user) {
        await router.push("/inbox");
      }
      return cta === "Sign up" ? user.uid : null;
    } catch (err) {
      console.error("Google auth failed:", err);
      const code = err?.code;
      setError(errorMessages[code] ?? err?.message ?? "Google sign-in failed.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.provider}>
      <button className={styles.googleButton} onClick={handleGoogleSignIn} disabled={loading} aria-busy={loading}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M21.35 12.25c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.21ZM12 21.75c2.62 0 4.81-.87 6.41-2.29l-3.14-2.44c-.87.58-1.99.93-3.27.93-2.53 0-4.68-1.71-5.45-4.02H3.31v2.52A9.68 9.68 0 0 0 12 21.75ZM6.55 13.93a5.82 5.82 0 0 1 0-3.86V7.55H3.31a9.72 9.72 0 0 0 0 8.9l3.24-2.52ZM12 6.05c1.43 0 2.71.49 3.72 1.46l2.79-2.79A9.33 9.33 0 0 0 12 2.25a9.68 9.68 0 0 0-8.69 5.3l3.24 2.52C7.32 7.76 9.47 6.05 12 6.05Z" />
        </svg>
        <span aria-live="polite">{loading ? "Signing in..." : "Continue with Google"}</span>
      </button>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </div>
  );
}
