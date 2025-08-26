import React, { useState } from "react";
import { Grid } from "@mui/material";
import ProgressBar from "./ProgressBar";

export default function IdeaScores({ scores }) {
  console.log(scores);
  return (
    <Grid container spacing={3} sx={{ my: 4, overflowY: "auto" }}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="📊 Market Fit"
          score={scores.marketFit.score}
          reasoning={scores.marketFit.reasoning}
          explanation={
            "How well is the founder's idea aligned with the market?"
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="🔧 Execution"
          score={scores.easeOfExecution.score}
          reasoning={scores.easeOfExecution.reasoning}
          explanation={
            "Given the founder's skills, capital, and experience, how well can they execute this plan?"
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ProgressBar
          label="💰 Resources"
          score={scores.resourceAlignment.score}
          reasoning={scores.resourceAlignment.reasoning}
          explanation={
            "Given the founder's current resources and capital, how feasible it is to execute this?"
          }
        />
      </Grid>
    </Grid>
  );
}
