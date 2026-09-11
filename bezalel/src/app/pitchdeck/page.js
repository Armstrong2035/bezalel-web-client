"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function PitchDeck() {
  return (
    <DashboardLayout>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#000000", p: 3 }}>
        <Typography variant="h4" sx={{ color: "#f5f5f5", mb: 2 }}>
          Pitch Deck
        </Typography>
        <Typography sx={{ color: "#aaaaaa" }}>
          This page is not built yet. The pitch deck engine already gathers
          your accepted ideas at /api/pitchdeck.
        </Typography>
      </Box>
    </DashboardLayout>
  );
}
