import React, { useState } from "react";
import { Stack, Typography, IconButton, Grid } from "@mui/material";

import IdeaCard from "./ideaCard/IdeaCard";

export default function AcceptedIdeasList({ cards }) {
  const handleViewDetails = (id) => {
    console.log("View details for:", id);
    // Open modal or load into right-hand panel
  };

  return (
    <Grid container justifyContent={"center"} spacing={4}>
      {cards.map((idea, index) => (
        <Grid item key={index} size={{ md: 4, sm: 6, xs: 12 }}>
          <IdeaCard card={idea} control={"modal"} />
        </Grid>
      ))}
    </Grid>
  );
}
