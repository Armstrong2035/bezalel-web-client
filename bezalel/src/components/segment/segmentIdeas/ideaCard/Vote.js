import { IconButton, Stack } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { ThumbDown } from "@mui/icons-material";
import { useUpdateIdeaStatus } from "@/app/hooks/useUpdateIdeaStatus";

export default function VoteControl({ ideaId }) {
  const { updateIdeaStatus, isUpdating } = useUpdateIdeaStatus();

  console.log(ideaId);

  const handleThumbUp = () => {
    updateIdeaStatus(ideaId, true);
  };

  const handleThumbDown = () => {
    updateIdeaStatus(ideaId, false);
  };

  return (
    <Stack direction={"row"} spacing={3}>
      <IconButton
        fontSize="large"
        onClick={handleThumbUp}
        disabled={isUpdating} // Disable buttons while updating
        sx={{
          color: "#6B7280",
          "&:hover": {
            color: "#60A5FA",
            transform: "scale(1.1)",
          },
        }}
      >
        <ThumbUpIcon fontSize="large" />
      </IconButton>

      <IconButton
        fontSize="large"
        onClick={handleThumbDown} // Correctly handle the downvote
        disabled={isUpdating}
        sx={{
          color: "#6B7280",
          "&:hover": {
            color: "#60A5FA",
            transform: "scale(1.1)",
          },
        }}
      >
        <ThumbDown fontSize="large" />
      </IconButton>
    </Stack>
  );
}
