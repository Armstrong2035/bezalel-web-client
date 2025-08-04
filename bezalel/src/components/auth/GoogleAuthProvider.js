// components/auth/GoogleAuthProvider.js
import { Box, Typography, Stack, IconButton } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "@/firebase/auth";

export default function GoogleAuthProvider({ cta, onSuccess }) {
  const handleGoogleSignIn = async () => {
    try {
      const { user } = await signInWithGoogle();
      if (user && onSuccess && cta === "Sign up") {
        onSuccess(user);
      }
    } catch (error) {
      console.error("Google auth failed:", error);
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
        >
          <GoogleIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      </Stack>
    </Box>
  );
}
