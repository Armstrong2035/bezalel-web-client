import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Box,
  Stack,
} from "@mui/material";
import VoteControl from "./Vote";

function StackIndicator({ count, current }) {
  // Dots for each idea, highlight the current one
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
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

export default function IdeaCard({ card, index, total, control }) {
  return (
    <Card
      sx={{
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(40, 40, 40, 0.9)",
      }}
    >
      <CardHeader
        title={
          <Typography
            sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 600 }}
          >
            {card.title}
          </Typography>
        }
        subheader={
          total > 1 ? (
            <StackIndicator count={total} current={index} />
          ) : (
            <Typography
              variant="caption"
              sx={{ color: "#FACC15", fontWeight: 500 }}
            >
              Idea #1 of 1
            </Typography>
          )
        }
      />
      <CardContent>
        <Typography sx={{ mt: 1, color: "rgba(255, 255, 255, 0.7)" }}>
          {card.description}
        </Typography>
        {control === "vote" && <VoteControl />}
      </CardContent>
    </Card>
  );
}
