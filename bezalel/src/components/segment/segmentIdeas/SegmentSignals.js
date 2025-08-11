import { Stack, Typography, Paper, Box, Grid } from "@mui/material";
import SegmentSignalCard from "./SegmentSignalCard";

const signals = [
  {
    id: "s1",
    type: "contradiction",
    label: "Contradiction",
    message: "Low-budget’ contradicts ‘High-touch service’",
    date: "2024-06-01",
  },
  {
    id: "s2",
    type: "socratic",
    label: "Socratic Prompt",
    message: "How will you generate recurring revenue from this model?",
    date: "2024-06-02",
  },
  {
    id: "s3",
    type: "relationship",
    label: "Related Insight",
    message:
      "Your Revenue Streams depend on a Channel you haven’t defined yet.",
    date: "2024-06-03",
  },
];

export default function SegmentSignals() {
  return (
    <Grid
      container
      justifyContent={"center"}
      spacing={4}
      sx={{ px: { md: 20, xs: 3 } }}
    >
      {signals.map((signal, index) => (
        <Grid item key={index}>
          <SegmentSignalCard signal={signal} />
        </Grid>
      ))}
    </Grid>
  );
}
