import { Box, Typography } from "@mui/material";

export default function SegmentHeaders({ isMobile, displayName }) {
  const firstName = displayName?.split(" ")[0] || "there";
  return (
    <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4, md: 5 } }}>
      <Typography
        variant={isMobile ? "h4" : "h3"}
        sx={{
          color: "white",
          fontWeight: 800,
          mb: 1,
          color: "white",
          fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        Hello, {firstName}!
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.7)",
          maxWidth: 600,
          mx: "auto",
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        Build and refine your business model with our interactive canvas.
      </Typography>
    </Box>
  );
}
