// components/auth/GoogleAuthProvider.js
import { useState } from "react";
import { Box, Typography, Stack, IconButton } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "@/firebase/auth";
import { useRouter } from "next/navigation";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack direction="column" alignItems="center">
        <Typography>Continue with Google:</Typography>
        <IconButton
          size="large"
          sx={{ borderRadius: "50%", color: "black" }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <GoogleIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      </Stack>
      {error && (
        <Typography
          color="error"
          sx={{ fontSize: "0.9rem", textAlign: "center", maxWidth: 420 }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
