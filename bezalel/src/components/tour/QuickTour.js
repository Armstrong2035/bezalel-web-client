"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  HelpOutline,
  Close,
  ArrowBack,
  ArrowForward,
  Description,
  BusinessCenter,
  Search,
  Campaign,
  Slideshow,
} from "@mui/icons-material";

const tourSteps = [
  {
    icon: Description,
    title: "Create a document",
    body: "Each document is a full business model canvas for one idea. Start one for whatever you are building.",
    action: "Go to documents",
    href: "/documents",
  },
  {
    icon: BusinessCenter,
    title: "Build your business model",
    body: "Define your ideal customer, sharpen your positioning, and choose where to focus.",
    action: "Open the canvas",
    href: "/segments",
  },
  {
    icon: Search,
    title: "Review your research",
    body: "Open a document and check its Inbox for the SEO, content, and distribution opportunities Bezalel finds.",
    action: "Go to documents",
    href: "/documents",
  },
  {
    icon: Campaign,
    title: "Turn research into action",
    body: "From any opportunity, generate briefs, campaigns, and customer-facing agents.",
    action: "Go to documents",
    href: "/documents",
  },
  {
    icon: Slideshow,
    title: "Pitch your business",
    body: "Export a polished pitch deck when you are ready to show your idea.",
    action: "Open pitch deck",
    href: "/pitchdeck",
  },
];

export default function QuickTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const current = tourSteps[step];
  const isLast = step === tourSteps.length - 1;
  const Icon = current.icon;

  const close = () => setOpen(false);

  const openTour = () => {
    setStep(0);
    setOpen(true);
  };

  const go = () => {
    router.push(current.href);
    close();
  };

  const next = () => setStep((s) => Math.min(s + 1, tourSteps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <>
      <Tooltip title="Quick tour">
        <Fab
          size="medium"
          onClick={openTour}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1200,
            backgroundColor: "#1a1a1a",
            color: "#f5f5f5",
            "&:hover": { backgroundColor: "#333333" },
          }}
        >
          <HelpOutline />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          <Typography component="span" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Quick tour
          </Typography>
          <IconButton onClick={close} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1a1a1a",
              color: "#f5f5f5",
              mb: 2,
            }}
          >
            <Icon />
          </Box>

          <Typography
            component="h3"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1, color: "#1a1a1a" }}
          >
            {current.title}
          </Typography>

          <Typography sx={{ color: "#666", lineHeight: 1.6, mb: 2.5 }}>
            {current.body}
          </Typography>

          <Button
            variant="contained"
            onClick={go}
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: "#1a1a1a",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#333333" },
            }}
          >
            {current.action}
          </Button>
        </DialogContent>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.5,
            borderTop: "1px solid #eee",
          }}
        >
          <Box sx={{ display: "flex", gap: 0.75 }}>
            {tourSteps.map((s, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: i === step ? "#1a1a1a" : "#d9d9d9",
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={back}
              disabled={step === 0}
              startIcon={<ArrowBack />}
              sx={{ textTransform: "none", color: "#666" }}
            >
              Back
            </Button>
            {isLast ? (
              <Button
                onClick={close}
                variant="contained"
                sx={{
                  backgroundColor: "#1a1a1a",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                onClick={next}
                endIcon={<ArrowForward />}
                sx={{ textTransform: "none", fontWeight: 600, color: "#1a1a1a" }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
