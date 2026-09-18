import HeroText from "./HeroText";
import { Box, Container, Button, Typography, Stack } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      {/* Subtle radial glow behind the hero copy */}
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(212,162,78,0.12) 0%, rgba(212,162,78,0) 70%)",
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
        <HeroText />

        <Stack spacing={2.5} alignItems="center" sx={{ pb: { xs: 10, md: 16 } }}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            size="large"
            onClick={() => router.push("/onboarding")}
            sx={{
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

          <Typography
            sx={{
              fontSize: "13px",
              color: "#8a8a84",
              fontWeight: 400,
            }}
          >
            Currently in beta
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
