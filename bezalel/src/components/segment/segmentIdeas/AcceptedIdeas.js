import React, { useState } from "react";

import { Stack, Typography, IconButton, Grid, Modal } from "@mui/material";

import IdeaCard from "./ideaCard/IdeaCard";

import AcceptedIdeaModal from "./ideaCard/ideaModal/AcceptedIdeaCard";

export default function AcceptedIdeasList({ cards }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleModalOpen = (idea) => {
    setSelectedIdea(idea);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedIdea(null);
  };

  return (
    <Grid container justifyContent={"center"} spacing={4}>
      {cards.map((idea, index) => (
        <Grid item key={index} size={{ md: 4, sm: 6, xs: 12 }}>
          <IdeaCard
            card={idea}
            control={"modal"}
            actionHandler={() => handleModalOpen(idea)}
          />
        </Grid>
      ))}

      <Modal open={modalOpen} onClose={handleModalClose}>
        <AcceptedIdeaModal
          idea={selectedIdea}
          handleModalClose={handleModalClose}
        />
      </Modal>
    </Grid>
  );
}
