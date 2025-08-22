import { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { ArrowForward, Lightbulb } from "@mui/icons-material";
import Image from "next/image";

export default function GetStarted() {
  const [businessIdea, setBusinessIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (businessIdea.trim()) {
      // console.log("Business idea submitted:", businessIdea);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && businessIdea.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: { xs: 4, sm: 5, md: 6 },
        width: "100%",
        maxWidth: { xs: "90%", sm: 600, md: 600 },
        mx: "auto",
        position: "relative",
      }}
    >
      {/* Example: Decorative image positioned absolutely */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -30,
          zIndex: -1,
          opacity: 0.3,
          display: { xs: "none", md: "block" },
        }}
      >
        <Image
          src="/images/globe.svg"
          alt="Decorative element"
          width={100}
          height={100}
        />
      </Box>

      {/* Another example: Image positioned at bottom left */}
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          left: -20,
          zIndex: -1,
          opacity: 0.2,
          display: { xs: "none", md: "block" },
        }}
      >
        <Image
          src="/images/next.svg"
          alt="Decorative element"
          width={80}
          height={80}
        />
      </Box>

      <Paper
        elevation={isFocused ? 8 : 2}
        sx={{
          width: "100%",
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
          transition: "all 0.3s ease",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <TextField
          fullWidth
          value={businessIdea}
          onChange={(e) => setBusinessIdea(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your business idea in one sentence..."
          variant="outlined"
          multiline
          rows={{ xs: 1, sm: 2 }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              fontSize: { xs: "16px", sm: "18px" },
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              "& fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "rgba(255, 255, 255, 0.7)",
              opacity: 1,
              fontFamily: "Poppins, sans-serif",
              fontSize: { xs: "14px", sm: "16px" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lightbulb
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    mr: 1,
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={!businessIdea.trim()}
                  sx={{
                    color: businessIdea.trim()
                      ? "white"
                      : "rgba(255, 255, 255, 0.3)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Typography
        sx={{
          color: "rgba(255, 255, 255, 0.6)",
          textAlign: "center",
          mt: { xs: 1.5, sm: 2 },
          fontSize: { xs: "14px", sm: "16px" },
          lineHeight: { xs: "18px", sm: "20px" },
          fontFamily: "Poppins, sans-serif",
          fontWeight: 400,
        }}
      >
        Press Enter or click the arrow to get started
      </Typography>
    </Box>
  );
}
