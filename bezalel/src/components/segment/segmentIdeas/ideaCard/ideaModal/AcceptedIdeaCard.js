import React from "react";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSection from "./AccordionSection";
import ProgressBar from "./ProgressBar";

const AcceptedIdeaModal = ({ idea }) => {
  if (!idea) {
    return <Box sx={{ color: "text.primary" }}>No idea data provided.</Box>;
  }

  // Define dynamic content based on the idea prop
  const scores = idea.scores || {
    marketFit: { score: 6, description: "Placeholder description." },
    execution: { score: 7, description: "Placeholder description." },
    resources: { score: 8, description: "Placeholder description." },
  };

  const assumptions = idea.assumptions || [];
  const actionPlan = idea.actionPlan || [];
  const dependencies = idea.dependencies || { required: [], blockedBy: [] };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Card
        sx={{
          bgcolor: "#1E1E1E",
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: "672px",
          boxShadow:
            "0px 10px 15px -3px rgba(51, 153, 255, 0.1), 0px 4px 6px -2px rgba(51, 153, 255, 0.05)",
        }}
      >
        {/* Top Section (Header) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label="✅ Accepted"
              size="small"
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.2)",
                color: "#66bb6a",
                fontWeight: "semibold",
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "gray.400", fontFamily: "monospace" }}
            >
              {`ID: ${idea.id}`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ borderBottom: "1px solid #444", mb: 3 }} />
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: "bold", color: "white", mb: 1 }}
        >
          {idea.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "gray.400", lineHeight: 1.6 }}>
          {idea.description}
        </Typography>
        {/* End Header */}

        {/* Scores Section */}
        <Grid container spacing={3} sx={{ my: 4 }}>
          <Grid item xs={12} sm={4}>
            <ProgressBar
              label="📊 Market Fit"
              score={scores.marketFit.score}
              description={scores.marketFit.description}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ProgressBar
              label="🔧 Execution"
              score={scores.execution.score}
              description={scores.execution.description}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ProgressBar
              label="💰 Resources"
              score={scores.resources.score}
              description={scores.resources.description}
            />
          </Grid>
        </Grid>
        {/* End Scores Section */}

        {/* Expandable Sections (Accordions) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AccordionSection title="🧠 Assumptions to Test">
            {assumptions.map((assumption, index) => (
              <Box
                key={index}
                sx={{ borderLeft: "2px solid #4A90E2", pl: 2, mb: 2 }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontFamily: "monospace", color: "gray.400", mb: 0.5 }}
                >
                  HYPOTHESIS
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "gray.300" }}
                >
                  {assumption.hypothesis}
                </Typography>
              </Box>
            ))}
          </AccordionSection>

          <AccordionSection title="📅 4-Week Action Plan">
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                "& li": { display: "flex", alignItems: "flex-start", mb: 1.5 },
              }}
            >
              {actionPlan.map((step, index) => (
                <li key={index}>
                  <Typography
                    variant="body2"
                    sx={{ mr: 1.5, color: "#4A90E2" }}
                  >
                    {`①②③④`[index]}
                  </Typography>
                  <Box>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: "semibold", mr: 0.5 }}
                    >
                      {step.week}:
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ color: "gray.300" }}
                    >
                      {step.task}
                    </Typography>
                  </Box>
                </li>
              ))}
            </Box>
          </AccordionSection>

          <AccordionSection title="🔗 Dependencies">
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                "& li": { display: "flex", alignItems: "center", mb: 1 },
              }}
            >
              {dependencies.required.map((dep, index) => (
                <li key={`req-${index}`}>
                  <Typography sx={{ color: "green.400", mr: 1 }}>✅</Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: "semibold", mr: 0.5 }}
                  >
                    Required:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: "gray.300" }}
                  >
                    {dep}
                  </Typography>
                </li>
              ))}
              {dependencies.blockedBy.map((dep, index) => (
                <li key={`blocked-${index}`}>
                  <Typography sx={{ color: "red.400", mr: 1 }}>🚫</Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: "semibold", mr: 0.5 }}
                  >
                    Blocked By:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: "gray.300" }}
                  >
                    {dep}
                  </Typography>
                </li>
              ))}
            </Box>
          </AccordionSection>
        </Box>
        {/* End Accordions */}
      </Card>
    </Box>
  );
};

export default AcceptedIdeaModal;
