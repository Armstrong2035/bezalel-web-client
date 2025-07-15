import { Card, CardContent, Typography } from "@mui/material";

export default function IdeaCard({ card, index }) {
  return (
    <Card
      sx={{
        position: "absolute",
        top: index * 10, // offset each card by 10px
        left: index * 5, // optional: horizontal offset
        zIndex: index,
        width: "30%",
        transition: "transform 0.2s",
        height: "60vh",
        // Add hover/focus effects if you want
      }}
    >
      <CardContent>
        <Typography>{card.title}</Typography>
      </CardContent>
    </Card>
  );
}
