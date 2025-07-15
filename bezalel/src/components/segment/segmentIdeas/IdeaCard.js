import { Card, CardContent, Typography } from "@mui/material";
import VoteControl from "./Vote";

export default function IdeaCard({ card, index, control }) {
  return (
    <Card
      sx={{
        height: "70%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        backgroundColor: "rgba(40, 40, 40, 0.9)",
      }}
    >
      <CardContent>
        <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          <strong>{card.title}</strong>
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255, 255, 255, 0.7)" }}>
          {card.description}
        </Typography>
        {control === "vote" && <VoteControl />}
      </CardContent>
    </Card>
  );
}
