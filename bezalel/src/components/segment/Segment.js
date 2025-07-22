import { Box, Typography, Grid, Container } from "@mui/material";
import IdeaCard from "./segmentIdeas/IdeaCard";
import { useState } from "react";
import GeneratedIdeas from "./segmentIdeas/GeneratedIdeas";
import AcceptedIdeasList from "./segmentIdeas/AcceptedIdeas";
import SegmentSignals from "./segmentIdeas/SegmentSignals";

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
    <Container sx={{ mt: 1, height: "90vh" }}>
      <Typography variant="h2" align="center" sx={{ color: "white" }}>
        {segment}
      </Typography>
      <Grid
        container
        spacing={3}
        sx={{
          height: "100%",
          mt: 5,
          // border: "1px solid red"
        }}
      >
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            //  border: "1px solid red",
          }}
        >
          <GeneratedIdeas
            cards={cards}
            currentCardIndex={currentCardIndex}
            segment={segment}
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            //  border: "1px solid red",
          }}
        >
          <AcceptedIdeasList cards={cards} />
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            //  border: "1px solid red",
          }}
        >
          <SegmentSignals cards={cards} />
        </Grid>
      </Grid>
    </Container>
  );
}
