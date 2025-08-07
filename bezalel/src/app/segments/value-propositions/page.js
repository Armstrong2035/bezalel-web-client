"use client";
import Segment from "@/components/segment/Segment";
import { useSegmentsStore } from "@/stores/segmentsStore";
import { Box } from "@mui/material";
import { Alex_Brush } from "next/font/google";
import { useEffect } from "react";

export default function ValuePropositions() {
  const segment = "Value Propositions";
  const segments = useSegmentsStore((state) => state.segments);

  const valueProposition = segments.segments.valueProposition;

  console.log(valueProposition);

  return (
    <Box>
      <Segment segment={segment} segmentData={valueProposition} />
    </Box>
  );
}
