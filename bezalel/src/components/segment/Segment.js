import { Box, Typography, Grid } from "@mui/material";
import IdeaCard from "./segmentIdeas/IdeaCard";
import { useState } from "react";

export default function Segment({ segment }) {
  const [acceptedCards, setAcceptedCards] = useState([]);
  const [rejectedCards, setRejectedCards] = useState([]);
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
    <Box>
      <Typography variant="h4" sx={{ color: "white" }}>
        {segment}
      </Typography>

      <Grid
        container
        sx={{
          position: "relative",
          border: "1px solid white",
        }}
      >
        {cards.map((card, index) => (
          // ideas card with accept and reject buttons.
          <Grid item size={{}} sx={{}}>
            <IdeaCard key={index} card={card} index={index} />
          </Grid>
        ))}

        {cards.map((card, index) => (
          // ideas card with accept and reject bu
          <Grid item size={{}} sx={{}}>
            <IdeaCard key={index} card={card} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
