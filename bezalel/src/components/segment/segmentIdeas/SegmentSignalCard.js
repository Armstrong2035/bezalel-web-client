import {
  Paper,
  Box,
  Typography,
  Icon,
  Card,
  CardContent,
  CardHeader,
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
      }}
    >
      <CardHeader
        //avatar={<Icon>{getIcon(signal.type, { color: "white" })}</Icon>}
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
