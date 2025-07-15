import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

export default function ProgressBar({ progress, currentStep, totalSteps }) {
  return (
    <Box sx={{ mb: 4 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.1)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#ffffff",
          },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
        }}
      >
        {currentStep} of {totalSteps}
      </Typography>
    </Box>
  );
}
