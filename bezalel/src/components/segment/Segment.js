import { Box, Typography, Grid } from "@mui/material";
import IdeaCard from "./segmentIdeas/IdeaCard";
import { useState } from "react";
import GeneratedIdeas from "./segmentIdeas/GeneratedIdeas";
import AcceptedIdeas from "./segmentIdeas/AcceptedIdeas";

export default function Segment({ segment }) {
  const [acceptedCards, setAcceptedCards] = useState([]);
  const [rejectedCards, setRejectedCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Start from index 0 for the first card

  const cards = [
    {
      title: "Card Title 1",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut laoreet facilisis, enim urna cursus erat, nec dictum erat urna non sapien.",
    },
    {
      title: "Card Title 2",
      description:
        "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus.",
    },
    {
      title: "Card Title 3",
      description:
        "Suspendisse potenti. Nullam ac urna eu felis dapibus condimentum sit amet a augue. Sed non neque elit.",
    },
  ];

  return (
    <Box sx={{ mt: 5, height: "90vh" }}>
      <Grid container sx={{ px: 2, py: 2, height: "100%" }}>
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            px: { xs: null, md: 13 },
          }}
        >
          <GeneratedIdeas cards={cards} />
        </Grid>

        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            height: "100%",
            px: { xs: null, md: 13 },
          }}
        >
          <AcceptedIdeas cards={cards} />
        </Grid>

        <Grid
          size={{ xs: 12, md: 8 }}
          sx={{
            height: "100%",
            px: { xs: null, md: 13 },
          }}
        >
          <SegmentSignals cards={cards} />
        </Grid>
      </Grid>
    </Box>
  );
}
