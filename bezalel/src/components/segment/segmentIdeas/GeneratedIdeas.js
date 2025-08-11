import { Box, Typography, Stack, Grid } from "@mui/material";
import IdeaCard from "./IdeaCard";

export default function GeneratedIdeas({ cards, segment }) {
  const total = cards.length;
  return (
    <Grid container justifyContent={"center"} spacing={4}>
      {cards.map((card, index) => (
        <Grid item key={index} size={{ md: 4, sm: 6, xs: 12 }}>
          <IdeaCard total={total} control={"vote"} card={card} />
        </Grid>
      ))}
    </Grid>
  );
}
