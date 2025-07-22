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
        sx={{
          color: "#6B7280", // default
          "&:hover": {
            color: "#60A5FA", // on hover
            transform: "scale(1.1)",
          },
        }}
      >
        <ThumbUpIcon fontSize="large" />
      </IconButton>

      <IconButton
        fontSize="large"
        sx={{
          color: "#6B7280", // default
          "&:hover": {
            color: "#60A5FA", // on hover
            transform: "scale(1.1)",
          },
        }}
      >
        <ThumbDown fontSize="large" />
      </IconButton>
    </Stack>
  );
}
