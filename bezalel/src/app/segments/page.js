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
  const { user, loading: authLoading } = useAuth();

  const displayName = user ? user.displayName : "User";

  //console.log(user);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ pt: { xs: 3, sm: 4, md: 6 }, pb: { xs: 3, sm: 4 } }}>
          <SegmentHeaders isMobile={isMobile} displayName={displayName} />
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
