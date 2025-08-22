import { Box, Button } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

export default function LearnMore({ card, control, actionHandler }) {
  return (
    <Box>
      <Button endIcon={<OpenInFullIcon />} onClick={() => actionHandler(card)}>
        Learn More
      </Button>
    </Box>
  );
}
