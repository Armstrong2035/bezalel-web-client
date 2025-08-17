import { Box, Typography, Stack, Grid, Fab } from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import IdeaCard from "./IdeaCard";
import { useOnboardingStore } from "@/stores/onboardingStore";
import convertOnboardingData from "@/components/onboarding/helpers/covertOnboardingData";
import { useState } from "react";

export default function GeneratedIdeas({ cards, segment }) {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  const userData = useOnboardingStore((state) => state.userData);
  const uid = userData.data.uid;
  const total = cards.length;

  const handleAccepted = async (ideaId, accepted) => {
    if (!uid) {
      console.error("User not authenticated.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/context/canvas/update-option", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uid,
          ideaId,
          accepted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update idea status.");
      }

      const result = await response.json();
      console.log("Update successful:", result);
    } catch (error) {
      console.error("Error updating idea status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // console.log(segment);
  // console.log(uid);

  // console.log(onboardingData);

  const generateIdeas = async () => {
    // console.log("Clicked");
    //console.log(uid);
    if (!uid) {
      setError("Please log in to generate ideas");
      return;
    }

    setLoading(true);
    setError(null);

    const context = await convertOnboardingData(onboardingData);

    try {
      const response = await fetch("/api/context/canvas/prompt", {
        // Replace with your actual route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: context,
          userId: uid,
          segment: segment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate ideas");
      }

      const data = await response.json();
      setIdeas(data.ideas);
      console.log(`Generated ${data.count} ideas successfully`);
      console.log(data.ideas);
    } catch (err) {
      setError(err.message);
      console.error("Error generating ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Grid container justifyContent={"center"} spacing={4}>
        {cards.map((card, index) => (
          <Grid item key={index} size={{ md: 4, sm: 6, xs: 12 }}>
            <IdeaCard
              total={total}
              control={"vote"}
              card={card}
              handleAccepted={handleAccepted}
            />
          </Grid>
        ))}
      </Grid>

      <Box
        onClick={() => generateIdeas()}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Fab color="primary" aria-label="add">
          <ShuffleIcon />
        </Fab>
      </Box>
    </Box>
  );
}
