import HeroText from "./HeroText";
import { Container, Button, Typography, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function Hero() {
  const router = useRouter();
  return (
    <Container>
      <HeroText />

      <Stack spacing={2.5} alignItems="center" sx={{ pb: { xs: 6, md: 8 } }}>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          size="large"
          onClick={() => router.push("/auth/signup")}
          sx={{
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

        <Typography sx={{ fontSize: "13px", color: "#999999", fontFamily }}>
          Currently in beta
        </Typography>
      </Stack>
    </Container>
  );
}
