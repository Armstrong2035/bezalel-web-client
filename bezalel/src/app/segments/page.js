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
import { subscribeToCanvasSegments } from "@/firebase/subscribeToCanvasSegment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { useAuth } from "../hooks/useAuth";

export default function Segments() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth(); // The user object is handled here.
  const [isLoading, setIsLoading] = useState(true);

  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const setSegments = useSegmentsStore((state) => state.setSegments);
  const segments = useSegmentsStore((state) => state.segments);
  const setUserData = useOnboardingStore((state) => state.setUserData);

  useEffect(() => {
    let unsubscribe = () => {};
    // Only proceed if the user object is valid.
    if (user) {
      const userInfo = {
        uid: user.uid,
        displayName: user.displayName,
        avatar: user.photoURL,
      };
      setUserData(userInfo);

      setIsLoading(true); // Start loading when the user is available.

      const subscribe = async () => {
        unsubscribe = await subscribeToCanvasSegments(user.uid, (data) => {
          setSegments(data);
          setIsLoading(false); // Stop loading once data is received.
        });
      };
      subscribe();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, setSegments, setUserData]);

  // If data is still loading, show a loading message
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
        }}
      >
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  // Once loading is complete, render the main content
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
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
