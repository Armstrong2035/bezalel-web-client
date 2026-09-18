import { Box, Container, Typography, Button, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";

const steps = [
  {
    number: "01",
    heading: "It starts with a business model.",
    body: "Bezalel helps you define your ideal customer, sharpen your positioning, understand the market, and decide where to focus.",
  },
  {
    number: "02",
    heading: "Then it keeps researching.",
    body: "It scans the web for SEO, content, and distribution opportunities that match your business.",
  },
  {
    number: "03",
    heading: "From opportunity to action.",
    body: "When it finds something worth pursuing, Bezalel helps turn the opportunity into action — from content and campaigns to customer-facing AI agents.",
  },
];

export default function LandingSections() {
  const router = useRouter();

  return (
    <>
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", py: { xs: 10, md: 16 } }}>
        <Container maxWidth="md">
          <Stack spacing={{ xs: 8, md: 12 }}>
            {steps.map((step) => (
              <Box key={step.number}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "#d4a24e",
                    mb: 1.5,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: "28px", sm: "36px", md: "44px" },
                    lineHeight: 1.2,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#f5f5f2",
                    mb: 2,
                  }}
                >
                  {step.heading}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "16px", sm: "18px" },
                    lineHeight: 1.7,
                    color: "#b8b8b0",
                    maxWidth: 560,
                  }}
                >
                  {step.body}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 12, md: 20 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "34px", sm: "48px", md: "60px" },
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#f5f5f2",
            }}
          >
            Build the product.
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: "18px", sm: "22px" },
              lineHeight: 1.5,
              color: "#b8b8b0",
            }}
          >
            Let Bezalel help you run the business around it.
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            size="large"
            onClick={() => router.push("/onboarding")}
            sx={{
              mt: 5,
              color: "#0a0a0b",
              backgroundColor: "#f5f5f2",
              px: 4,
              py: 1.5,
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "999px",
              "&:hover": { backgroundColor: "#ffffff" },
            }}
          >
            Brief Bezalel
          </Button>
        </Container>
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", py: 4 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#8a8a84" }}>
            Currently in beta.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
