import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import { ArrowForward, Lightbulb } from "@mui/icons-material";
import { typographyStyles } from "../../../typographyStyles/typography";

export default function GetStarted() {
  const [businessIdea, setBusinessIdea] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (businessIdea.trim()) {
      // TODO: Handle the business idea submission
      console.log("Business idea submitted:", businessIdea);
      // Navigate to the next step or process the idea
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
        mt: 3,
        height: "60vh",
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        border: "1px solid #282828",
        borderRadius: "40px",
        py: 5,

        backgroundColor: "rgba(40, 40, 40, 0.38)",
      }}
    >
      <Paper
        elevation={isFocused ? 8 : 2}
        sx={{
          width: "80%",
          borderRadius: "56.66px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          backgroundColor: "rgba(40, 40, 40, 0.70)",
          backdropFilter: "blur(10px)",
          height: "100%",
        }}
      >
        <TextField
          fullWidth
          value={businessIdea}
          onChange={(e) => setBusinessIdea(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder="Get started by describing your business idea in a few sentences..."
          variant="outlined"
          multiline
          rows={2}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              fontSize: { xs: "11px", sm: "18px" },
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
          }}
        />
      </Paper>

      <Button
        variant="contained"
        sx={{
          color: "whitesmoke",
          textAlign: "center",
          mt: 2,
          fontSize: { xs: "11px", sm: "16px" },
          lineHeight: "20px",
          p: 2,
          backgroundColor: "#000000",
          borderRadius: "73.2px",
          border: "1px solid rgba(255, 255, 255, 0.7)",
        }}
      >
        Continue
      </Button>
    </Box>
  );
}
