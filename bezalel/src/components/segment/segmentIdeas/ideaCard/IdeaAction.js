import { Box } from "@mui/material";
import VoteControl from "./Vote";
import LearnMore from "./LearnMore";

export default function IdeaAction({ card, control, actionHandler }) {
  return (
    <Box>
      {control === "vote" ? (
        <VoteControl handleAccepted={actionHandler} ideaId={card.id} />
      ) : (
        <LearnMore />
      )}
    </Box>
  );
}
