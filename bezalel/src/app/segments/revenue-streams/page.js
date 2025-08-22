"use client";
import Segment from "@/components/segment/Segment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { Box } from "@mui/material";
import { Alex_Brush } from "next/font/google";
import { useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { getSegmentIdeas } from "../../../helperFunctions/getSegment";

export default function RevenueStreams() {
  const segments = useSegmentsStore((state) => state.segments);
  const segment = "revenueStreams";
  const revenueStreams = getSegmentIdeas(segment, segments);

  return (
    <Box>
      <Segment segment={segment} segmentData={revenueStreams} />
    </Box>
  );
}
