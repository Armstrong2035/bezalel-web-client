import React from "react";
import { Box, Typography } from "@mui/material";

export const DependencyList = ({ dependencies }) => {
  const hasDependencies =
    dependencies.required.length > 0 || dependencies.blockedBy.length > 0;
  if (!hasDependencies) {
    return (
      <Typography variant="body2" sx={{ color: "gray.400" }}>
        No dependencies listed.
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
        "& li": { display: "flex", alignItems: "center", mb: 1 },
      }}
    >
      {dependencies.required.map((dep, index) => (
        <li key={`req-${index}`}>
          <Typography sx={{ color: "green.400", mr: 1 }}>✅</Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: "semibold", mr: 0.5, color: "whitesmoke" }}
          >
            Required:
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "whitesmoke" }}
          >
            {dep}
          </Typography>
        </li>
      ))}
      {dependencies.blockedBy.map((dep, index) => (
        <li key={`blocked-${index}`}>
          <Typography sx={{ color: "red.400", mr: 1 }}>🚫</Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: "semibold", mr: 0.5 }}
          >
            Blocked By:
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "whitesmoke" }}
          >
            {dep}
          </Typography>
        </li>
      ))}
    </Box>
  );
};
