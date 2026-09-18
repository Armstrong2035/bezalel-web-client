"use client";

import { Box } from "@mui/material";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/hero/Hero";
import LandingSections from "@/components/landing/LandingSections";

export default function Home() {
  return (
    <Box sx={{ bgcolor: "#0a0a0b", color: "#f5f5f2", minHeight: "100vh" }}>
      <LandingNav />
      <Hero />
      <LandingSections />
    </Box>
  );
}
