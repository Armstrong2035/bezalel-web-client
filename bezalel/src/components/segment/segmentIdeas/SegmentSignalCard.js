import {
  Paper,
  Box,
  Typography,
  Icon,
  Card,
  CardContent,
  CardHeader,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpIcon from "@mui/icons-material/Help";
import LinkIcon from "@mui/icons-material/Link";

export default function SegmentSignalCard({ signal }) {
  const getIcon = (type, sx) => {
    if (type === "contradiction") {
      return <WarningAmberIcon sx={sx} />;
    }
    if (type === "relationship") {
      return <LinkIcon sx={sx} />;
    }
    if (type === "socratic") {
      return <HelpIcon sx={sx} />;
    }
  };

  const getColor = (type) => {
    if (type === "contradiction") {
      return "#db1d20";
    }
    if (type === "relationship") {
      return "#3b65d1";
    }
    if (type === "socratic") {
      return "#FACC15";
    }
  };
  return (
    <Card
      key={signal.id}
      sx={{
        background: "#181818",
        width: "100%",
        borderLeft: `5px solid ${getColor(signal.type)}`,
        backgroundColor: "rgba(40, 40, 40, 0.7)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
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
        title={
          <Typography sx={{ color: "whitesmoke" }}>{signal.label}</Typography>
        }
        subheader={
          <Typography sx={{ color: "whitesmoke" }}>{signal.date}</Typography>
        }
      />
      <CardContent>
        <Typography
          variant="body1"
          sx={{
            color: "#D1D5DB",
          }}
        >
          {signal.message}
        </Typography>
      </CardContent>
    </Card>
  );
}
