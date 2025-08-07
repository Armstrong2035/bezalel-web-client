import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Box,
  Stack,
  LinearProgress,
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
  const executionScore = () => {
    const ease = card.scores.easeOfExecution.score || 0;
    const fit = card.scores.marketFit.score || 0;
    const alignment = card.scores.resourceAlignment.score || 0;

    const scores = [ease, fit, alignment].sort((a, b) => a - b);
    const median = scores[1] * 10;

    return Math.round(median); // e.g. 8 -> 80%
  };

  return (
    <Card
      sx={{
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(40, 40, 40, 0.7)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255,255,255,0.1)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          "& .arrow-icon": {
            transform: "translate(4px, -4px)",
            opacity: 1,
          },
          "& .card-content": {
            transform: "translateY(-4px)",
          },
        },
        "&:active": {
          transform: "translateY(-4px) scale(1.01)",
        },
      }}
    >
      <CardHeader
        // title={

        // }
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
        <Typography
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "20px",
            fontWeight: 700,
            margin: "16px 0 8px 0",
            lineHeight: 1.3,
          }}
        >
          {card.title}
        </Typography>
        <Typography
          sx={{
            mt: 1,
            color: "#ccc",
            fontSize: "14px",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          {card.description}
        </Typography>

        <Box
          sx={{
            backgroundColor: "#252525",
            p: 2,
            borderRadius: 3,
            borderLeft: "3px solid #667eea",
          }}
        >
          <Typography
            sx={{
              fontSize: "11px",
              color: "#667eea",
              fontWeight: 600,
              marginBottom: "4px",
              letterSpacing: "0.5px",
            }}
          >
            WHY THIS FITS YOU
          </Typography>
          <Typography
            sx={{ color: "#ddd", fontSize: "12px", lineHeight: "1.4" }}
          >
            {card.scores.resourceAlignment.reasoning}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2, // adds spacing between the two boxes
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: 2,
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "11px",
                color: "#888",
                fontWeight: 500,
                marginBottom: 1,
              }}
            >
              Execution Confidence
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={executionScore()}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  color: "#333", // track color
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #4ade80, #22c55e)", // fill color
                    transition: "width 0.3s ease",
                    borderRadius: 2, // round corners on fill as well
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 500,
                  width: 32,
                  textAlign: "right",

                  color: "#4ade80",
                }}
              >
                {executionScore()}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {control === "vote" && <VoteControl />}
      </CardContent>
    </Card>
  );
}
