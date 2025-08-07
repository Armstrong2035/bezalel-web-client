import { Box, Typography, Grid, Container } from "@mui/material";
import IdeaCard from "./segmentIdeas/IdeaCard";
import { useState } from "react";
import GeneratedIdeas from "./segmentIdeas/GeneratedIdeas";
import AcceptedIdeasList from "./segmentIdeas/AcceptedIdeas";
import SegmentSignals from "./segmentIdeas/SegmentSignals";

export default function Segment({ segment, segmentData }) {
  const [acceptedCards, setAcceptedCards] = useState([]);
  const [rejectedCards, setRejectedCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Start from index 0 for the first card

  const cards = segmentData.options;

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
