"use client";

import { Box } from "@mui/material";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/hero/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingSections from "@/components/landing/LandingSections";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function Home() {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        color: "#1a1a1a",
        minHeight: "100vh",
        fontFamily,
      }}
    >
      <LandingNav />
      <Hero />
      <HowItWorks />
      <LandingSections />
    </Box>
  );
}
