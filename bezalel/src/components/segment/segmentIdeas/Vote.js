import { IconButton, Stack } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { ThumbDown } from "@mui/icons-material";

export default function VoteControl() {
  return (
    <Stack
      direction={"row"}
      //   justifyContent={"center"}
      //   alignItems={"center"}
      spacing={3}
    >
      <IconButton
        fontSize="large"
        sx={{ color: "#ffd766", backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <ThumbUpIcon fontSize="large" />
      </IconButton>

      <IconButton
        fontSize="large"
        sx={{ color: "#ffd766", backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <ThumbDown fontSize="large" />
      </IconButton>
    </Stack>
  );
}
