import React from "react";
import { Typography, Box } from "@mui/material";

export default function Heading({ title, explanation }) {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Typography
        variant="h3"
        sx={{
          color: "white",
          fontWeight: 700,
          fontSize: { xs: "2rem", sm: "2.5rem" },
          mb: explanation ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {explanation && (
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.8)",
            fontSize: { xs: "0.95rem", sm: "1.1rem" },
            lineHeight: 1.6,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          {explanation}
        </Typography>
      )}
    </Box>
  );
}
