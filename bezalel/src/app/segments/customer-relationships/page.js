"use client";
import Segment from "@/components/segment/Segment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { Box } from "@mui/material";
import { Alex_Brush } from "next/font/google";
import { useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { getSegmentIdeas } from "../../../helperFunctions/getSegment";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ValuePropositions() {
  const segments = useSegmentsStore((state) => state.segments);
  const segment = "customerRelationships";
  const customerRelationships = getSegmentIdeas(segment, segments);

  return (
    <DashboardLayout>
      <Box>
        <Segment segment={segment} segmentData={customerRelationships} />
      </Box>
    </DashboardLayout>
  );
}
