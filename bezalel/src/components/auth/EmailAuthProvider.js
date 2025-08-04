// components/auth/EmailAuthProvider.js
import { Box, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";
import { signUpWithEmail, signInWithEmail } from "@/firebase/auth";

export default function EmailAuthProvider({ cta, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleEmailAuth = async () => {
    try {
      let res;
      if (cta === "Sign up") {
        res = await signUpWithEmail(email, password);
      } else {
        res = await signInWithEmail(email, password);
      }
      if (res.error) {
        throw res.error;
      }
      if (res.user && onSuccess) {
        onSuccess(res.user);
      }
      setError(null);
    } catch (error) {
      console.error(`${cta} with email failed:`, error);
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        width: "100%",
      }}
    >
      <Typography>Or continue with email</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{
          width: "50%",
          "& .MuiOutlinedInput-root": {
            borderRadius: "70.59px",
            backgroundColor: "#cccccc",
            "& fieldset": { border: "none" },
            "&:hover fieldset": { border: "none" },
            "&.Mui-focused fieldset": { border: "none" },
          },
          "& .MuiInputLabel-root": { color: "#666666" },
          "& .MuiInputBase-input": { color: "#333333" },
        }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          width: "50%",
          "& .MuiOutlinedInput-root": {
            borderRadius: "70.59px",
            backgroundColor: "#cccccc",
            "& fieldset": { border: "none" },
            "&:hover fieldset": { border: "none" },
            "&.Mui-focused fieldset": { border: "none" },
          },
          "& .MuiInputLabel-root": { color: "#666666" },
          "& .MuiInputBase-input": { color: "#333333" },
        }}
      />
      <Button
        variant="contained"
        sx={{
          color: "whitesmoke",
          textAlign: "center",
          mt: 2,
          width: "50%",
          fontSize: { xs: "11px", sm: "16px" },
          lineHeight: "20px",
          p: 2,
          backgroundColor: "#4c4c4c",
          borderRadius: "73.2px",
          border: "1px solid rgba(255, 255, 255, 0.7)",
        }}
        onClick={handleEmailAuth}
      >
        {cta}
      </Button>
    </Box>
  );
}
