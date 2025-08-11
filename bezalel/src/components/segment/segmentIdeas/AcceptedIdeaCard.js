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
  Avatar,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";

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
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(40, 40, 40, 0.7)",
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: total === 1 ? 3 : undefined, // subtle shadow if only one idea
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
        title={idea.title}
        action={
          <IconButton
            sx={{
              color: "#6B7280", // default
              transition: "transform 0.2s ease",
              "&:hover": {
                color: "#60A5FA",
                transform: "scale(1.1)",
              },
            }}
          >
            <AspectRatioIcon
              sx={{
                color: "#6B7280", // default
                "&:hover": {
                  color: "#60A5FA", // on hover
                  transform: "scale(1.1)",
                },
              }}
            />
          </IconButton>
        }
      />
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
