import { useState } from "react";
import { Box, Typography, Stack, Grid, Fab, Backdrop } from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import IdeaCard from "./ideaCard/IdeaCard";
import { useOnboardingStore } from "@/stores/onboardingStore";
import convertOnboardingData from "../../onboarding/helpers/covertOnboardingData";
import { useAuth } from "@/app/hooks/useAuth";
import LoadingPage from "../../loading/LoadingPage";
import GetStartedCard from "./GetStartedCard";

// This component displays generated business ideas and handles user actions
export default function GeneratedIdeas({ cards, segment }) {
  // Consolidate all loading states into a single variable for clarity
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Access the current onboarding data from the Zustand store
  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  // Access user authentication state
  const { user, loading: authLoading } = useAuth();
  const uid = user ? user.uid : null;

  const handleAccepted = async (ideaId, accepted) => {
    if (!uid) {
      console.error("User not authenticated. Cannot update idea status.");
      return;
    }

    // Use a single loading state for all async operations
    setIsLoading(true);

    try {
      const response = await fetch("/api/update-option", {
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
      // console.log("Update successful:", result);
    } catch (error) {
      console.error("Error updating idea status:", error);
    } finally {
      // Always turn off loading state, regardless of success or failure
      setIsLoading(false);
    }
  };

  const generateIdeas = async () => {
    if (!uid) {
      setError("Please log in to generate ideas");
      return;
    }

    // Set loading state at the beginning of the API call
    setIsLoading(true);
    setError(null);

    const context = await convertOnboardingData(onboardingData);

    try {
      const response = await fetch("/api/prompt", {
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

      // We need to parse the JSON response to use it
      const data = await response.json();

      // The store should handle updating the ideas, so we just log the success
      // console.log(`Generated ${data.count} ideas successfully`);
      // console.log(data.ideas);
    } catch (err) {
      setError(err.message);
      console.error("Error generating ideas:", err);
    } finally {
      // Always set loading state to false at the end of the API call
      setIsLoading(false);
    }
  };

  const clickCard = () => {
    return <GetStartedCard segment={segment} functionHandler={generateIdeas} />;
  };
  if (authLoading) {
    return <LoadingPage segment={segment} />;
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Grid container justifyContent={"center"} spacing={4}>
        {cards.length === 0 ? (
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GetStartedCard segment={segment} functionHandler={generateIdeas} />
          </Grid>
        ) : (
          cards.map((card, index) => (
            <Grid item key={index} size={{ md: 4, sm: 6, xs: 12 }}>
              <IdeaCard
                control={"vote"}
                card={card}
                actionHandler={handleAccepted}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* Overlay LoadingPage when isLoading is true */}
      {isLoading && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
          open={isLoading}
        >
          <LoadingPage segment={segment} />
        </Backdrop>
      )}
    </Box>
  );
}
