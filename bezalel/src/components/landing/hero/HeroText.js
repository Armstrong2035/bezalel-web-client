import { Box, Typography, Stack } from "@mui/material";

export default function HeroText() {
  const heroText = {
    title:
      "Turn your idea into a viable business plan in just 45 minutes, with AI",
    subtitle:
      "Bezalel guides you through a business model canvas and gives you a clear 90-day action plan — so you can go from idea to execution with confidence.",
  };

  return (
    <Stack spacing={4} alignItems="center" sx={{ py: 10 }}>
      <Typography
        textAlign="center"
        sx={{
          // Responsive typography - smaller on mobile, larger on desktop
          fontSize: {
            xs: "32px", // Mobile: 32px
            sm: "48px", // Small tablet: 48px
            md: "60px", // Medium: 60px
            lg: "71px", // Desktop: 71px (original size)
          },
          lineHeight: {
            xs: "36px", // Mobile: 36px
            sm: "54px", // Small tablet: 54px
            md: "67px", // Medium: 67px
            lg: "79px", // Desktop: 79px (original line height)
          },
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          color: "whitesmoke",
        }}
      >
        {heroText.title}
      </Typography>
      <Typography
        textAlign="center"
        sx={{
          // Responsive subtext typography
          fontSize: {
            xs: "16px", // Mobile: 16px
            sm: "20px", // Small tablet: 20px
            md: "24px", // Medium: 24px
            lg: "28px", // Desktop: 28px (original size)
          },
          lineHeight: {
            xs: "18px", // Mobile: 18px
            sm: "22px", // Small tablet: 22px
            md: "27px", // Medium: 27px
            lg: "31px", // Desktop: 31px (original line height)
          },
          fontFamily: "Poppins, sans-serif",
          fontWeight: 400,
          color: "whitesmoke",
        }}
      >
        {heroText.subtitle}
      </Typography>
    </Stack>
  );
}
