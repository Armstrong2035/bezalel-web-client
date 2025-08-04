"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  Stack,
  Paper,
  Container,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Segments() {
  const router = useRouter();

  const onboardingData = useOnboardingStore((state) => state.onboardingData);
  console.log("Onboarding Data:", onboardingData);

  const canvasSections = {
    section1: [
      { title: "Key Partners", order: 1, url: "key-partners" },
      { title: "Key Activities", order: 2, url: "key-activities" },
      { title: "Key Resources", order: 3, url: "key-resources" },
    ],
    section2: [
      { title: "Value Propositions", order: 4, url: "value-propositions" },
    ],
    section3: [
      { title: "Channels", order: 5, url: "channels" },
      {
        title: "Customer Relationships",
        order: 6,
        url: "customer-relationships",
      },
      { title: "Customer Segments", order: 7, url: "customer-segments" },
    ],
    section4: [
      { title: "Cost Structure", order: 8, url: "cost-structure" },
      { title: "Revenue Streams", order: 9, url: "revenue-streams" },
    ],
  };

  const CanvasItem = ({ title, index, url }) => (
    <Paper
      elevation={2}
      onClick={() => {
        router.push(`/segments/${url}`);
      }}
      sx={{
        height: "100%",
        backgroundColor: "rgba(40, 40, 40, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Tooltip
        title={index}
        placement="top"
        arrow
        sx={{
          m: 3,
          "& .MuiTooltip-tooltip": {
            backgroundColor: "rgba(0,0,0,0.9)",
            color: "white",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            maxWidth: 300,
            padding: "12px 16px",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <Typography variant="h6" textAlign={"center"} sx={{ color: "white" }}>
        {title}
      </Typography>
    </Paper>
  );

  const typeOneGrid = () => {
    return (
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid item size={{ lg: 6, sm: 12 }}>
          <CanvasItem
            title={canvasSections.section1[0].title}
            index={canvasSections.section1[0].order}
            url={canvasSections.section1[0].url}
          />
        </Grid>

        <Grid item size={{ lg: 6, sm: 12 }} sx={{ height: "100%" }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <CanvasItem
              title={canvasSections.section1[1].title}
              index={canvasSections.section1[1].order}
              url={canvasSections.section1[1].url}
              sx={{ flex: 1 }}
            />
            <CanvasItem
              title={canvasSections.section1[2].title}
              index={canvasSections.section1[2].order}
              url={canvasSections.section1[2].url}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Grid>
      </Grid>
    );
  };

  const typeTwoGrid = () => {
    return (
      <Box sx={{ height: "100%" }}>
        <CanvasItem
          title={canvasSections.section2[0].title}
          index={canvasSections.section2[0].order}
          url={canvasSections.section2[0].url}
        />
      </Box>
    );
  };

  const typeThreeGrid = () => {
    return (
      <Grid container spacing={2} sx={{ height: "100%" }}>
        <Grid item size={{ lg: 6, sm: 12 }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            <CanvasItem
              title={canvasSections.section3[0].title}
              index={canvasSections.section3[0].order}
              url={canvasSections.section3[0].url}
              sx={{ flex: 1 }}
            />
            <CanvasItem
              title={canvasSections.section3[1].title}
              index={canvasSections.section3[1].order}
              url={canvasSections.section3[1].url}
              sx={{ flex: 1 }}
            />
          </Stack>
        </Grid>
        <Grid item size={{ lg: 6, sm: 12 }}>
          <CanvasItem
            title={canvasSections.section3[2].title}
            index={canvasSections.section3[2].order}
            url={canvasSections.section3[2].url}
          />
        </Grid>
      </Grid>
    );
  };

  const typeFourGrid = () => {
    return (
      <Grid container spacing={2} sx={{ width: "100%", height: "100%" }}>
        {canvasSections.section4.map((item) => (
          <Grid item size={{ lg: 6, sm: 6 }} key={item.order}>
            <CanvasItem title={item.title} index={item.order} url={item.url} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 5,
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", color: "white", mb: 3 }}
      >
        Good Morning, Armstrong!
      </Typography>

      <Grid
        container
        alignItems="center"
        justifyContent="center"
        sx={{
          height: "80%",
          width: "100%",
        }}
      >
        <Grid item sx={{ height: "80%", width: "100%" }}>
          <Grid container sx={{ height: "100%" }}>
            <Grid
              item
              size={{ lg: 5 }}
              sx={{ height: "100%", width: "100%", p: 1 }}
            >
              {typeOneGrid()}
            </Grid>
            <Grid
              item
              size={{ lg: 2 }}
              sx={{ height: "100%", width: "100%", p: 1 }}
            >
              {typeTwoGrid()}
            </Grid>
            <Grid
              item
              size={{ lg: 5 }}
              sx={{ height: "100%", width: "100%", p: 1 }}
            >
              {typeThreeGrid()}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          size={{ lg: 12 }}
          sx={{ height: "20%", width: "100%", p: 1 }}
        >
          {typeFourGrid()}
        </Grid>
      </Grid>
    </Box>
  );
}
