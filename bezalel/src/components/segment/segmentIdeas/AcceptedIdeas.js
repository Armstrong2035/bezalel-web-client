import React, { useState } from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import AcceptedIdeaCard from "./AcceptedIdeaCard";

const initialIdeas = [
  {
    id: "1",
    title: "Partner with local gyms",
    summary: "Offer discounted meal plans through fitness centers.",
    votes: 5,
  },
  {
    id: "2",
    title: "Free trials for influencers",
    summary: "Leverage local influencers to promote your product.",
    votes: 3,
  },
];

export default function AcceptedIdeasList() {
  const [ideas, setIdeas] = useState(initialIdeas);

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
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="h6" align="left" sx={{ color: "white", mb: 2 }}>
        Focus Ideas
      </Typography>
      {ideas.map((idea) => (
        <AcceptedIdeaCard
          key={idea.id}
          idea={idea}
          onVote={handleVote}
          onViewDetails={handleViewDetails}
        ></AcceptedIdeaCard>
      ))}
    </Stack>
  );
}
