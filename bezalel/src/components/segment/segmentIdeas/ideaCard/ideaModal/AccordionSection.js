import {
  Box,
  Typography,
  Card,
  Grid,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ProgressBar from "./ProgressBar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function AccordionSection({
  title,
  children,
  defaultExpanded = false,
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      sx={{
        backgroundColor: "rgba(51, 51, 51, 0.5)",
        borderRadius: "8px",
        boxShadow: "none",
        "&.Mui-expanded": { margin: "0 0" },
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "whitesmoke" }} />}
        aria-controls={`${title.toLowerCase().replace(/\s/g, "-")}-content`}
        id={`${title.toLowerCase().replace(/\s/g, "-")}-header`}
        sx={{
          minHeight: "auto",
          "& .MuiAccordionSummary-content": { margin: "12px 0" },
          "& .MuiAccordionSummary-content.Mui-expanded": { margin: "12px 0" },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "semibold", color: "whitesmoke" }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}
