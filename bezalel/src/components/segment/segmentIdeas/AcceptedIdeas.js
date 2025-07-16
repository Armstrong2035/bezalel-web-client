import { Box, Stack, Typography, IconButton } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function AcceptedIdeas({ cards }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {cards.map((card, index) => (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          key={index}
        >
          <IconButton sx={{ color: "white" }}>
            <ArrowDropUpIcon />
          </IconButton>

          <Typography sx={{ color: "white" }}>{card.title}</Typography>

          <IconButton sx={{ color: "white" }}>
            <ArrowDropDownIcon />
          </IconButton>
        </Stack>
      ))}
    </Box>
  );
}
