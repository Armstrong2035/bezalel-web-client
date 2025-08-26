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
  Stack,
} from "@mui/material";
import HelpToolTip from "@/components/ui/HelpToolTip";

export default function ProgressBar({
  label,
  score,
  maxScore = 10,
  reasoning,
  explanation,
}) {
  const progress = (score / maxScore) * 100;

  //  console.log(description);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
        }}
      >
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{ fontWeight: "semibold", color: "whitesmoke" }}
        >
          {label}
        </Typography>

        <HelpToolTip explanation={explanation} />
      </Box>
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
        {reasoning}
      </Typography>
    </Box>
  );
}
