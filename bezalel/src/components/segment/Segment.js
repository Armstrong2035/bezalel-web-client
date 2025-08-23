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
  Breadcrumbs,
} from "@mui/material";
import IdeaCard from "./segmentIdeas/ideaCard/IdeaCard";
import { useState } from "react";
import GeneratedIdeas from "./segmentIdeas/GeneratedIdeas";
import AcceptedIdeasList from "./segmentIdeas/AcceptedIdeas";
import SegmentSignals from "./segmentIdeas/SegmentSignals";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import React from "react";
import { Book } from "@mui/icons-material";
import Link from "next/link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CounterBadge from "../ui/CounterBadge";

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
    <Container
      sx={{
        mt: 1,
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Breadcrumbs
        separator={
          <NavigateNextIcon fontSize="small" sx={{ color: "whitesmoke" }} />
        }
        sx={{ mt: 2 }}
        aria-label="breadcrumb"
      >
        <Link href={"/segments"} style={{ textDecoration: "none" }}>
          <Typography variant="h6" align="center" sx={{ color: "white" }}>
            Segments
          </Typography>
        </Link>

        <Typography
          variant="h6"
          align="center"
          sx={{
            color: "gray", // or whatever inactive color you want
            cursor: "default",
          }}
        >
          {segment}
        </Typography>
      </Breadcrumbs>
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
            <Box key={index}>
              <CounterBadge
                index={index}
                count={i.count}
                icon={i.icon}
                state={activeSection}
                stateHandler={setActiveSection}
              />
            </Box>
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
