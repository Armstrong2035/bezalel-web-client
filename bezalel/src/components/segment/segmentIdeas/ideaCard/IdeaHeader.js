import { CardHeader, Chip, Typography, Box } from "@mui/material";

export default function IdeaHeader({ card, accepted }) {
  let subheaderContent = null;

  if (accepted) {
    subheaderContent = (
      <Chip
        label="Accepted"
        sx={{
          backgroundColor: "#667eea",
          color: "white",
          fontSize: "12px",
          fontWeight: 600,
          borderRadius: "4px",
        }}
        size="small"
      />
    );
  }

  const titleContent = (
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
  );

  return <CardHeader subheader={subheaderContent} title={titleContent} />;
}
