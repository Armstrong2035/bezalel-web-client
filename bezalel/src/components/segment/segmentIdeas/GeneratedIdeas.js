import { Box, Typography, Stack } from "@mui/material";
import IdeaCard from "./IdeaCard";

function StackIndicator({ count, current }) {
  // Dots for each idea, highlight the current one
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 16,
            borderRadius: 4,
            backgroundColor: i === current ? "#FACC15" : "#444",
            opacity: i === current ? 1 : 0.5,
            transition: "background 0.2s, opacity 0.2s",
          }}
        />
      ))}
    </Stack>
  );
}

export default function GeneratedIdeas({ cards, currentCardIndex, segment }) {
  const total = cards.length;
  return (
    <Stack>
      <Typography variant="h6" align="left" sx={{ color: "white", mb: 2 }}>
        Recommended Ideas
      </Typography>
      {cards[currentCardIndex] && (
        <Box>
          <IdeaCard
            key={currentCardIndex}
            card={cards[currentCardIndex]}
            index={currentCardIndex}
            total={total}
            control={"vote"}
          />
        </Box>
      )}
    </Stack>
  );
}
