import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

export const ActionPlanList = ({ actionPlan }) => {
  const planSteps = Object.values(actionPlan);
  if (planSteps.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "gray.400" }}>
        No action plan available.
      </Typography>
    );
  }

  return (
    <Box
      component="ul"
      sx={{
        listStyle: "none",
        p: 0,
        m: 0,
        "& li": { display: "flex", alignItems: "flex-start", mb: 1.5 },
      }}
    >
      {planSteps.map((step, index) => (
        <li key={index}>
          <Typography variant="body2" sx={{ mr: 1.5, color: "whitesmoke" }}>
            {`①②③④`[index]}
          </Typography>
          <Box>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: "semibold", mr: 0.5, color: "whitesmoke" }}
            >
              {`Week ${index + 1}`}:
            </Typography>
            <Typography
              variant="body2"
              component="span"
              sx={{ color: "whitesmoke" }}
            >
              {step}
            </Typography>
          </Box>
        </li>
      ))}
    </Box>
  );
};
