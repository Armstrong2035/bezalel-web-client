import { Typography, Stack } from "@mui/material";

export default function HeroText() {
  return (
    <Stack spacing={3} alignItems="center" sx={{ py: { xs: 8, md: 12 }, maxWidth: 820, mx: "auto" }}>
      <Typography
        component="h1"
        textAlign="center"
        sx={{
          fontSize: { xs: "40px", sm: "56px", md: "72px", lg: "84px" },
          lineHeight: { xs: "46px", sm: "62px", md: "80px", lg: "92px" },
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "#f5f5f2",
        }}
      >
        Your AI Business Co-Founder
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          fontSize: { xs: "18px", sm: "20px", md: "24px" },
          lineHeight: 1.5,
          fontWeight: 400,
          color: "#b8b8b0",
        }}
      >
        For solo operators who are good at building products.
      </Typography>

      <Typography
        textAlign="center"
        sx={{
          fontSize: { xs: "15px", sm: "17px" },
          lineHeight: 1.7,
          fontWeight: 400,
          color: "#8a8a84",
          maxWidth: 620,
        }}
      >
        Bezalel helps research your business, find opportunities, and handle
        customer-facing operations with AI agents.
      </Typography>
    </Stack>
  );
}
