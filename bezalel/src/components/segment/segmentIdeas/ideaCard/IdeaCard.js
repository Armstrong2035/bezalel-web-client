import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  Box,
  Stack,
  LinearProgress,
  CardActionArea,
} from "@mui/material";
import VoteControl from "./Vote";
import IdeaHeader from "./IdeaHeader";
import IdeaAction from "./IdeaAction";
import { act } from "react";

export default function IdeaCard({
  card,
  index,
  total,
  control,
  actionHandler,
}) {
  const executionScore = () => {
    const ease = card.scores.easeOfExecution.score || 0;
    const fit = card.scores.marketFit.score || 0;
    const alignment = card.scores.resourceAlignment.score || 0;

    const scores = [ease, fit, alignment].sort((a, b) => a - b);
    const median = scores[1] * 10;

    return Math.round(median); // e.g. 8 -> 80%
  };

  console.log("Card Data:", card);

  const ideaId = card.id;
  const accepted = control === "modal" ? true : false;

  return (
    <Card
      sx={{
        // height: "80vh",
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
      {/* Header with title and index */}

      <IdeaHeader card={card} accepted={accepted} />

      {/* Description and reasoning */}
      <CardContent>
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

        {/* Display reasoning for why this idea fits the user */}

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

        {/* Execution Confidence Bar */}

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

        {/* Control Buttons */}

        <IdeaAction
          control={control}
          card={card}
          actionHandler={actionHandler}
        />
      </CardContent>
    </Card>
  );
}
