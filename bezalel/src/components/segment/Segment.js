import {
  Box,
  Typography,
  Grid,
  Container,
  Badge,
  Stack,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import IdeaCard from "./segmentIdeas/IdeaCard";
import { useState } from "react";
import GeneratedIdeas from "./segmentIdeas/GeneratedIdeas";
import AcceptedIdeasList from "./segmentIdeas/AcceptedIdeas";
import SegmentSignals from "./segmentIdeas/SegmentSignals";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import React from "react";
import { Book } from "@mui/icons-material";

export default function Segment({ segment, segmentData }) {
  const [activeSection, setActiveSection] = useState(0);

  const cards = segmentData;

  const acceptedCards = cards.filter(
    (card) => card.accepted === true && card.segment === segment
  );
  const rejectedCards = cards.filter((card) => card.accepted === false);

  // console.log(cards);

  const navigation = [
    {
      tite: "Generated Ideas",
      icon: <TipsAndUpdatesIcon />,
      count: cards.length || 0,
    },
    {
      tite: "Accepted Ideas",
      icon: <BookmarksIcon />,
      count: acceptedCards.length || 0,
    },
    // {
    //   tite: "Signals",
    //   icon: <CrisisAlertIcon />,
    //   count: 6,
    // },
  ];

  const renderSection = (cards, segment) => {
    if (activeSection === 0) {
      return <GeneratedIdeas cards={cards} segment={segment} />;
    }

    if (activeSection === 1) {
      return <AcceptedIdeasList cards={acceptedCards} segment={segment} />;
    }
    // } else {
    //   return <SegmentSignals cards={cards} segment={segment} />;
    // }
  };

  return (
    <Container sx={{ mt: 1, height: "90vh" }}>
      <Typography variant="h6" align="center" sx={{ color: "white" }}>
        {segment}
      </Typography>
      <Grid
        container
        spacing={5}
        justifyContent={"center"}
        alignItems="flex-start"
        sx={{
          height: "100%",
          mt: 5,
        }}
      >
        <Grid sx={{ display: "flex", gap: 5 }}>
          {navigation.map((i, index) => (
            <Card
              onClick={() => setActiveSection(index)}
              key={index}
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor:
                  activeSection === index
                    ? "rgba(80, 80, 80, 0.9)" // darker or highlighted background
                    : "rgba(40, 40, 40, 0.7)",
                borderRadius: 3,
                p: 2,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1px solid rgba(255,255,255,0.1)",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                },
              }}
            >
              <Badge
                sx={{
                  color: "whitesmoke",
                  "& .MuiBadge-badge": {
                    fontSize: "0.8rem", // size of badge text
                  },
                }}
                badgeContent={<Typography sx={{ ml: 2 }}>{i.count}</Typography>}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {i.icon}
              </Badge>
            </Card>
          ))}
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            height: "100%",
          }}
        >
          {renderSection(cards, segment)}
        </Grid>
      </Grid>
    </Container>
  );
}
