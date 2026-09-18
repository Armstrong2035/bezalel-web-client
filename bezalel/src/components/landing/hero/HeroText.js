import { Typography, Stack } from "@mui/material";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function HeroText() {
  return (
    <Stack
      spacing={3}
      alignItems="center"
      sx={{ py: { xs: 6, md: 8 }, maxWidth: 780, mx: "auto" }}
    >
      <Typography
        component="h1"
        textAlign="center"
        sx={{
          fontSize: { xs: "38px", sm: "52px", md: "64px", lg: "72px" },
          lineHeight: { xs: "44px", sm: "58px", md: "70px", lg: "78px" },
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#1a1a1a",
          fontFamily,
        }}
      >
        Your AI Business Co-Founder
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          fontSize: { xs: "18px", sm: "20px", md: "22px" },
          lineHeight: 1.5,
          fontWeight: 400,
          color: "#666666",
          fontFamily,
        }}
      >
        For solo operators who are good at building products.
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          fontSize: { xs: "15px", sm: "16px" },
          lineHeight: 1.7,
          fontWeight: 400,
          color: "#999999",
          maxWidth: 600,
          fontFamily,
        }}
      >
        Bezalel helps research your business, find opportunities, and handle
        customer-facing operations with AI agents.
      </Typography>
    </Stack>
  );
}
