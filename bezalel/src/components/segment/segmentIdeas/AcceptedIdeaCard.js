import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Divider,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function AcceptedIdeaCard({
  idea,
  onVote,
  onViewDetails,
  index,
  total,
}) {
  return (
    <Card
      sx={{
        backgroundColor: "#1E1E1E",
        borderRadius: 2,
        color: "#fff",
        width: "100%",
        boxShadow: total === 1 ? 3 : undefined, // subtle shadow if only one idea
      }}
    >
      <CardHeader title={idea.title} />
      <CardContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
          {idea.summary}
        </Typography>
        <Divider sx={{ my: 1, borderColor: "#333" }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton
              onClick={() => onVote(idea.id, +1)}
              sx={{
                color: "#6B7280", // default
                "&:hover": {
                  color: "#60A5FA", // on hover
                  transform: "scale(1.1)",
                },
              }}
            >
              <ArrowDropUpIcon fontSize="large" />
            </IconButton>

            <IconButton
              onClick={() => onVote(idea.id, -1)}
              sx={{
                color: "#6B7280", // default
                "&:hover": {
                  color: "#60A5FA", // on hover
                  transform: "scale(1.1)",
                },
              }}
            >
              <ArrowDropDownIcon fontSize="large" />
            </IconButton>
          </Stack>

          <IconButton
            onClick={() => onViewDetails(idea.id)}
            sx={{
              ml: 1,
              color: "#6B7280", // default
              "&:hover": {
                color: "#60A5FA", // on hover
                transform: "scale(1.1)",
              },
            }}
            aria-label="View Details"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
