import { Box, Typography } from "@mui/material";
import IdeaCard from "./IdeaCard";
export default function GeneratedIdeas({ cards, currentCardIndex, segment }) {
  return (
    <Box sx={{ height: "100%" }}>
      <Typography variant="h6" align="center" sx={{ color: "white", mb: 2 }}>
        Recommended Ideas
      </Typography>
      {cards[currentCardIndex] && (
        <IdeaCard
          key={currentCardIndex}
          card={cards[currentCardIndex]}
          index={currentCardIndex}
          control={"vote"}
        />
      )}
    </Box>
  );
}
