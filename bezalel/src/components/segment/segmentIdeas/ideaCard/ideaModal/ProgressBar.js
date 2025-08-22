import React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

export default function ProgressBar({
  label,
  score,
  maxScore = 10,
  description,
}) {
  const progress = (score / maxScore) * 100;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="subtitle1"
        component="h3"
        sx={{ fontWeight: "semibold", color: "whitesmoke" }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        component="p"
        sx={{ fontWeight: "bold", color: "whitesmoke" }}
      >
        {`${score}/${maxScore}`}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "#333",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#4A90E2",
          },
        }}
      />
      <Typography variant="caption" sx={{ color: "whitesmoke", mt: 1 }}>
        {description}
      </Typography>
    </Box>
  );
}
