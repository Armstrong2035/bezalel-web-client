"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Container,
  IconButton,
  Fade,
  Chip,
  Stack,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

import { useRouter } from "next/navigation";
import { canvasSections } from "./canvasSection";
import CanvasItem from "@/components/segment/canvasItem/CanvasItem";
import SegmentHeaders from "@/components/segment/SegmentHeader";
import { useEffect, useState } from "react";
import { subscribeToCanvasSegment } from "@/firebase/subscribeToCanvasSegment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { useAuth } from "../hooks/useAuth";

export default function Segments() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const setSegments = useSegmentsStore((state) => state.setSegments);
  const segments = useSegmentsStore((state) => state.segments);
  const setUserData = useOnboardingStore((state) => state.setUserData);

  if (user) {
    const userInfo = {
      uid: user.uid,
      displayName: user.displayName,
      avatar: user.photoURL,
    };

    setUserData(userInfo);
  }

  // const uid = "RmEYVngSaka33Iab5y1s";

  // useEffect(() => {
  //   let unsubscribe = () => {}; // Default empty unsubscribe function
  //   const subscribe = async () => {
  //     unsubscribe = await subscribeToCanvasSegment(uid, setSegments);
  //   };
  //   subscribe();
  //   return () => {
  //     unsubscribe(); // Cleanup on unmount
  //   };
  // }, [uid]);
  //console.log(onboardingData);

  //console.log(segments);

  // let valuePropositionsData = segments.segments.valueProposition;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        // background:
        //   "linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)",
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ pt: { xs: 3, sm: 4, md: 6 }, pb: { xs: 3, sm: 4 } }}>
          <SegmentHeaders isMobile={isMobile} />
          <Grid container spacing={3} sx={{ maxWidth: 1200, mx: "auto" }}>
            {canvasSections.map((item) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={item.order}
                sx={{
                  display: "flex",
                  "& > *": { width: "100%" },
                }}
              >
                <CanvasItem
                  title={item.title}
                  index={item.order}
                  url={item.url}
                  icon={item.icon}
                  description={item.description}
                  isCore={item.isCore}
                  isMobile={isMobile}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
