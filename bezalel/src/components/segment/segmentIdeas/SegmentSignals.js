import { Box, Typography } from "@mui/material";

export default function SegmentSignals({ cards }) {
  return (
    <Box>
      {cards.map((card, index) => (
        <Box key={index}>
          <Typography variant="h6">{card.title}</Typography>
        </Box>
      ))}
    </Box>
  );
}
