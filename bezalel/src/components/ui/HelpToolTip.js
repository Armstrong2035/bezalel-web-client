import { Tooltip, IconButton } from "@mui/material";
import { HelpOutline } from "@mui/icons-material";

export default function HelpToolTip({ explanation }) {
  return (
    <Tooltip
      title={explanation}
      placement="top"
      arrow
      sx={{
        "& .MuiTooltip-tooltip": {
          backgroundColor: "rgba(0,0,0,0.9)",
          color: "white",
          fontSize: { xs: "0.8rem", sm: "0.875rem" },
          maxWidth: 300,
          padding: "12px 16px",
          borderRadius: 2,
          border: "1px solid rgba(255,255,255,0.1)",
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          color: "rgba(255,255,255,0.6)",
          "&:hover": {
            color: "rgba(255,255,255,0.9)",
            backgroundColor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
