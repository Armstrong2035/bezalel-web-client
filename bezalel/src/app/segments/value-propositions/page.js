"use client";
import Segment from "@/components/segment/Segment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { Box } from "@mui/material";
import { Alex_Brush } from "next/font/google";
import { useEffect } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function ValuePropositions() {
  // const segment = "Value Propo";
  const segments = useSegmentsStore((state) => state.segments);
  const userData = useOnboardingStore((state) => state.userData);
  //const uid = userData.data.uid;

  //console.log(userData);

  const valueProposition = segments.segments.valueProposition;

  //console.log(valueProposition);

  return (
    <Box>
      <Segment segment={"valueProposition"} segmentData={valueProposition} />
    </Box>
  );
}
