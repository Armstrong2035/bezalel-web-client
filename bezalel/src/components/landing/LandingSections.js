import { Box, Container, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function LandingSections() {
  const router = useRouter();

  return (
    <>
      <Box sx={{ py: { xs: 10, md: 14 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "34px", sm: "48px", md: "60px" },
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#1a1a1a",
              fontFamily,
            }}
          >
            Build the product.
          </Typography>
          <Typography
            sx={{
              mt: 2,
              fontSize: { xs: "18px", sm: "22px" },
              lineHeight: 1.5,
              color: "#666666",
              fontFamily,
            }}
          >
            Let Bezalel help you run the business around it.
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            size="large"
            onClick={() => router.push("/auth/signup")}
            sx={{
              mt: 5,
              color: "#ffffff",
              backgroundColor: "#1a1a1a",
              px: 4,
              py: 1.5,
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "7px",
              fontFamily,
              "&:hover": { backgroundColor: "#333333" },
            }}
          >
            Get started
          </Button>
        </Container>
      </Box>

      <Box sx={{ borderTop: "1px solid #f0f0ee", py: 4 }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "13px", color: "#999999", fontFamily }}>
            Currently in beta.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
