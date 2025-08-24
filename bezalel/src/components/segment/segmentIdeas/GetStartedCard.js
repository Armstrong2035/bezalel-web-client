import { Card, CardContent, Typography, Box } from "@mui/material";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

export default function GetStartedCard({ segment, functionHandler }) {
  return (
    <Card
      onClick={() => functionHandler(segment)}
      sx={{
        height: "70vh",
        display: "flex",
        width: "80%",
        flexDirection: "column",
        justifyContent: "center", // 👈 Center content vertically
        alignItems: "center", // 👈 Center content horizontally
        position: "relative",
        overflow: "hidden",
        backgroundColor: "rgba(40, 40, 40, 0.7)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255,255,255,0.1)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        },
        "&:active": {
          transform: "translateY(-4px) scale(1.01)",
        },
      }}
    >
      {/* Background Icon Container */}
      <Box
        sx={{
          position: "absolute",
          top: "50%", // Center the icon vertically
          left: "50%", // Center the icon horizontally
          transform: "translate(-50%, -50%)", // Adjust for the icon's size
          opacity: 0.1,
          color: "whitesmoke",

          // The background icon itself does not need a transition
        }}
      >
        <TipsAndUpdatesIcon
          sx={{ fontSize: "20rem", color: "rgba(145, 136, 136, 0.7)" }}
        />
      </Box>

      {/* Foreground Content Container */}
      <CardContent
        sx={{
          zIndex: 1, // Ensure content is above the icon
          textAlign: "center", // Center text within the CardContent box
        }}
      >
        <Typography sx={{ color: "whitesmoke", fontSize: "1.5rem" }}>
          Click to get started
        </Typography>
      </CardContent>
    </Card>
  );
}
