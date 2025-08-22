import React from "react";
import { Box, Typography } from "@mui/material";

export const AssumptionsList = ({ assumptions }) => {
  if (!assumptions || assumptions.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "gray.400" }}>
        No assumptions to test.
      </Typography>
    );
  }

  return (
    <Box>
      {assumptions.map((assumption, index) => (
        <Box key={index} sx={{ borderLeft: "2px solid #4A90E2", pl: 2, mb: 4 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", color: "whitesmoke", mb: 0.5 }}
          >
            HYPOTHESIS
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "whitesmoke", mb: 1 }}
          >
            {assumption.assumption}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", color: "whitesmoke", mb: 0.5 }}
          >
            SUCCESS CRITERIA
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "whitesmoke", mb: 1 }}
          >
            {assumption.successCriteria}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", color: "whitesmoke", mb: 0.5 }}
          >
            VALIDATION METHOD
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "whitesmoke" }}
          >
            {assumption.validationMethod}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
