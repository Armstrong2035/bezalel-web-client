// Loading messages object
const LOADING_MESSAGES = {
  valuePropositions: [
    "Crafting your unique value...",
    "Identifying what makes you different...",
    "Analyzing your core strengths...",
    "Building your value foundation...",
  ],
  customerSegments: [
    "Mapping your ideal customers...",
    "Analyzing target markets...",
    "Identifying customer personas...",
    "Researching audience insights...",
  ],
  revenueStreams: [
    "Calculating revenue opportunities...",
    "Exploring monetization models...",
    "Analyzing pricing strategies...",
    "Building financial foundations...",
  ],
  keyActivities: [
    "Defining critical operations...",
    "Mapping essential processes...",
    "Identifying core activities...",
    "Structuring your workflow...",
  ],
  keyResources: [
    "Cataloging essential assets...",
    "Identifying required resources...",
    "Mapping capability needs...",
    "Analyzing resource requirements...",
  ],
  keyPartners: [
    "Finding strategic alliances...",
    "Identifying partnership opportunities...",
    "Mapping ecosystem connections...",
    "Building relationship networks...",
  ],
  costStructure: [
    "Calculating operational costs...",
    "Analyzing expense categories...",
    "Optimizing cost efficiency...",
    "Building financial models...",
  ],
  channels: [
    "Mapping distribution paths...",
    "Identifying reach strategies...",
    "Analyzing channel effectiveness...",
    "Building connection bridges...",
  ],
  customerRelationships: [
    "Designing engagement strategies...",
    "Crafting relationship models...",
    "Building loyalty frameworks...",
    "Analyzing interaction patterns...",
  ],
  // Fallback for unknown segments
  default: [
    "Thinking strategically...",
    "Analyzing your business model...",
    "Consulting the Decision Engine...",
    "Processing strategic options...",
  ],
};

// Updated Component
import React, { useState, useEffect } from "react";
import { Box, Typography, keyframes } from "@mui/material";
import Image from "next/image";
import Mark from "../../../public/images/logos/Mark.png";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * A custom loading spinner component that uses a spinning image with segment-specific messages.
 * @param {object} props The component props.
 * @param {string} props.segment The business model canvas segment (e.g., "valuePropositions", "customerSegments").
 * @param {string} props.loadingMessage Optional custom loading message (overrides segment-specific messages).
 */
export default function CustomSpinner({ segment, loadingMessage }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const spinnerImageSrc = Mark;

  // Get messages based on segment
  const getMessagesForSegment = () => {
    if (loadingMessage) {
      return [loadingMessage]; // Use custom message if provided
    }

    // Convert segment to pascal case and get messages
    return LOADING_MESSAGES[segment] || LOADING_MESSAGES.default;
  };

  const messages = getMessagesForSegment();

  useEffect(() => {
    // Only set up interval if there are multiple messages
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % messages.length
        );
      }, 1000); // Switch every 1 second

      return () => clearInterval(interval); // Cleanup
    }
  }, [messages.length]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "50%",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          animation: `${spin} 2s linear infinite`,
        }}
      >
        <Image
          src={spinnerImageSrc}
          alt="Loading Spinner"
          layout="responsive"
          objectFit="contain"
          width={80}
          height={80}
        />
      </Box>
      {messages[currentMessageIndex] && (
        <Typography sx={{ mt: 2, color: "whitesmoke" }}>
          {messages[currentMessageIndex]}
        </Typography>
      )}
    </Box>
  );
}
