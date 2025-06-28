import HeroText from "./HeroText";
import GetStarted from "../GetStarted/GetStarted";
import { Box, Container } from "@mui/material";
import Image from "next/image";

export default function Hero() {
  return (
    <Box sx={{ position: "relative" }}>
      {/* Background image positioned underneath hero text, extending from left */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "45%", sm: "45%", md: "45%", lg: "45%" }, // Responsive top positioning
          left: { xs: "-24.5%", sm: "-24.5%", md: "-37%", lg: "-37%" }, // Responsive left positioning
          zIndex: -1, // Behind the content
          opacity: 0.8,
          // Hide on small screens, show on md and up
          display: { xs: "none", sm: "none", md: "block" },
          // Responsive image sizing - bigger on lg screens
          "& img": {
            width: { md: "800px", lg: "1200px" },
            height: { md: "600px", lg: "900px" },
          },
        }}
      >
        <Image
          src="/images/background/2.png"
          alt="Background decoration"
          width={1200}
          height={900}
          style={{
            objectFit: "contain",
            maxWidth: "none", // Allow image to extend beyond container
          }}
        />
      </Box>

      {/* New image positioned at top right beside hero text */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "10%", sm: "8%", md: "5%", lg: "5%" }, // Position at top right
          right: { xs: "-15%", sm: "-10%", md: "-25%", lg: "-25%" }, // Extends outside screen on right
          zIndex: -1, // Behind the content
          opacity: 0.7,
          transform: "rotate(45deg)", // 45-degree forward rotation
          // Hide on small screens, show on md and up
          display: { xs: "none", sm: "none", md: "block" },
          // Responsive image sizing - bigger on lg screens
          "& img": {
            width: { md: "400px", lg: "900px" },
            height: { md: "300px", lg: "675px" },
          },
        }}
      >
        <Image
          src="/images/background/4.png"
          alt="Top right decoration"
          width={900}
          height={675}
          style={{
            objectFit: "contain",
            maxWidth: "none", // Allow image to extend beyond container
          }}
        />
      </Box>

      <Container sx={{ mt: 5 }}>
        <HeroText />

        <GetStarted />
      </Container>
    </Box>
  );
}
