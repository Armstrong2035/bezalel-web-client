import React, { useState } from "react";
import { Stack, Typography, IconButton, Grid } from "@mui/material";
import AcceptedIdeaCard from "./AcceptedIdeaCard";
import IdeaCard from "./IdeaCard";

export default function AcceptedIdeasList({ cards }) {
  const handleVote = (id, delta) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, votes: idea.votes + delta } : idea
      )
    );
  };

  const handleViewDetails = (id) => {
    console.log("View details for:", id);
    // Open modal or load into right-hand panel
  };

  return (
    <Grid container justifyContent={"center"} spacing={4}>
      {cards.map((idea, index) => (
        <Grid item key={index}>
          <IdeaCard card={idea} />
        </Grid>
      ))}
    </Grid>
  );
}
