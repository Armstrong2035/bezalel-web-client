import React, { useState } from "react";
import { Grid } from "@mui/material";
import ProgressBar from "./ProgressBar";

export default function IdeaScores({ scores }) {
  return (
    <Grid container spacing={3} sx={{ my: 4, overflowY: "auto" }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="📊 Market Fit"
          score={scores.marketFit.score}
          description={scores.marketFit.description}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="🔧 Execution"
          score={scores.easeOfExecution.score}
          description={scores.easeOfExecution.description}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="💰 Resources"
          score={scores.resourceAlignment.score}
          description={scores.resourceAlignment.description}
        />
      </Grid>
    </Grid>
  );
}
