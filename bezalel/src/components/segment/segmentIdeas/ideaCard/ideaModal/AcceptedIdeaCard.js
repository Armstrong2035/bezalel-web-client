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
  IconButton,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionSection from "./AccordionSection";
import ProgressBar from "./ProgressBar";
import { AssumptionsList } from "./accordionContent/AssumptionsList";
import { ActionPlanList } from "./accordionContent/ActionPlanList";
import { DependencyList } from "./accordionContent/DependenciesList";
import IdeaScores from "./IdeaScores";
import CancelIcon from "@mui/icons-material/Cancel";

const AcceptedIdeaModal = ({ idea, handleModalClose }) => {
  if (!idea) {
    return <Box sx={{ color: "text.primary" }}>No idea data provided.</Box>;
  }

  // Define dynamic content based on the idea prop
  const scores = idea.scores;

  const assumptions = idea.assumptionsToTest || [];
  const actionPlan = idea.actionPlan || [];
  const dependencies = idea.dependencies || { required: [], blockedBy: [] };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "90vh",
        p: { xs: 2, sm: 3 },
        backgroundColor: "transparent",
        color: "text.primary",
      }}
    >
      <Container>
        <Card
          sx={{
            bgcolor: "#1E1E1E",
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            width: "100%",
            height: "90%",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#444 #1E1E1E",

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Chip
                label="✅ Accepted"
                size="small"
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.2)",
                  color: "#66bb6a",
                  fontWeight: "semibold",
                }}
              />
            </Box>

            <Box>
              <IconButton>
                <CancelIcon
                  sx={{ color: "whitesmoke" }}
                  onClick={() => handleModalClose()}
                />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ borderBottom: "1px solid #444", mb: 3 }} />
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: "bold", color: "whitesmoke", mb: 1 }}
          >
            {idea.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "whitesmoke", lineHeight: 1.6, mb: 2 }}
          >
            {idea.description}
          </Typography>

          <IdeaScores scores={scores} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <AccordionSection title="🧠 Assumptions to Test">
              <AssumptionsList assumptions={assumptions} />
            </AccordionSection>

            <AccordionSection title="📅 4-Week Action Plan">
              <ActionPlanList actionPlan={actionPlan} />
            </AccordionSection>

            <AccordionSection title="🔗 Dependencies">
              <DependencyList dependencies={dependencies} />
            </AccordionSection>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default AcceptedIdeaModal;
