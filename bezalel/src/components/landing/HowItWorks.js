"use client";

import { Box, Container, Typography } from "@mui/material";
import {
  Groups,
  Star,
  Storefront,
  People,
  TrendingUp,
  Inventory,
  Build,
  BusinessCenter,
  AccountBalance,
  Search,
  ViewCarousel,
  Videocam,
  ManageSearch,
} from "@mui/icons-material";

const fontFamily =
  "'Poppins', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const canvasSections = [
  { title: "Customer Segments", description: "For whom are we creating value?", icon: Groups },
  { title: "Value Propositions", description: "What value do we deliver?", icon: Star },
  { title: "Channels", description: "How do we reach our customers?", icon: Storefront },
  { title: "Customer Relationships", description: "What relationship do they expect?", icon: People },
  { title: "Revenue Streams", description: "What will they really pay for?", icon: TrendingUp },
  { title: "Key Resources", description: "What resources do we need?", icon: Inventory },
  { title: "Key Activities", description: "What must we do every day?", icon: Build },
  { title: "Key Partners", description: "Who do we work with?", icon: BusinessCenter },
  { title: "Cost Structure", description: "Where does the money go?", icon: AccountBalance },
];

const inboxItems = [
  { category: "SEO", title: "Low-competition keyword cluster around invoicing", source: "Google Search", time: "2h ago", active: true },
  { category: "Content", title: "Creator-led demo outperforms static onboarding", source: "YouTube", time: "5h ago" },
  { category: "Distribution", title: "Subreddit thread asking for cheaper alternatives", source: "Reddit", time: "1d ago" },
];

const actions = [
  { icon: Search, label: "Build SEO opportunity", reason: "Turn search demand into a keyword cluster and page brief." },
  { icon: ViewCarousel, label: "Create carousel", reason: "Turn this insight into a slide story for Instagram or TikTok." },
  { icon: Videocam, label: "Create AI UGC concept", reason: "Turn the evidence into a creator-led video concept and script." },
  { icon: ManageSearch, label: "Research deeper", reason: "Find more evidence before choosing a distribution surface." },
];

function Frame({ children }) {
  return (
    <Box
      sx={{
        border: "1px solid #e8e8e6",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        backgroundColor: "#ffffff",
      }}
    >
      {children}
    </Box>
  );
}

function CanvasVisual() {
  return (
    <Frame>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {canvasSections.map((section) => {
            const Icon = section.icon;
            return (
              <Box
                key={section.title}
                sx={{ border: "1px solid #e8e8e6", borderRadius: "8px", p: 1.25 }}
              >
                <Icon sx={{ fontSize: 16, color: "#666666" }} />
                <Typography
                  sx={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", mt: 0.5, fontFamily, lineHeight: 1.3 }}
                >
                  {section.title}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: "#999999", mt: 0.25, lineHeight: 1.4, fontFamily }}>
                  {section.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Frame>
  );
}

function InboxVisual() {
  return (
    <Frame>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", fontFamily }}>Inbox</Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: "999px",
              backgroundColor: "#f0f0ee",
              color: "#666666",
              fontSize: 11,
              fontWeight: 600,
              fontFamily,
            }}
          >
            3 new
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {inboxItems.map((item) => (
            <Box
              key={item.title}
              sx={{
                border: item.active ? "1px solid #1a1a1a" : "1px solid #f0f0ee",
                borderRadius: "8px",
                p: 1.25,
                backgroundColor: item.active ? "#fafafa" : "#ffffff",
              }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#999999", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily }}>
                {item.category}
              </Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.35, mt: 0.25, fontFamily }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#999999", mt: 0.5, fontFamily }}>
                {item.source} · {item.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Frame>
  );
}

function ActionVisual() {
  return (
    <Frame>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#999999", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily }}>
          Create from this brief
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", mt: 0.5, mb: 1.5, fontFamily }}>
          Where should this insight go?
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 1,
          }}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Box key={action.label} sx={{ border: "1px solid #e8e8e6", borderRadius: "8px", p: 1.25 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <Icon sx={{ fontSize: 15, color: "#666666" }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", fontFamily }}>{action.label}</Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: "#999999", lineHeight: 1.45, fontFamily }}>{action.reason}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Frame>
  );
}

const steps = [
  {
    number: "01",
    heading: "Know exactly where to focus.",
    body: "Bezalel helps you define your ideal customer, sharpen your positioning, understand the market, and decide where to focus.",
    visual: <CanvasVisual />,
  },
  {
    number: "02",
    heading: "Opportunities find you.",
    body: "It scans the web for SEO, content, and distribution opportunities that match your business.",
    visual: <InboxVisual />,
  },
  {
    number: "03",
    heading: "Turn opportunities into results.",
    body: "When it finds something worth pursuing, Bezalel helps turn the opportunity into action — from content and campaigns to customer-facing AI agents.",
    visual: <ActionVisual />,
  },
];

export default function HowItWorks() {
  return (
    <Box sx={{ borderTop: "1px solid #f0f0ee", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 8, md: 10 } }}>
          {steps.map((step, index) => (
            <Box
              key={step.number}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: index % 2 === 0 ? "row" : "row-reverse" },
                gap: { xs: 4, md: 6 },
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.12em", color: "#999999", mb: 1.5, fontFamily }}
                >
                  {step.number}
                </Typography>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: "26px", sm: "30px", md: "36px" },
                    lineHeight: 1.2,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#1a1a1a",
                    mb: 2,
                    fontFamily,
                  }}
                >
                  {step.heading}
                </Typography>
                <Typography sx={{ fontSize: { xs: "16px", sm: "17px" }, lineHeight: 1.7, color: "#666666", maxWidth: 460, fontFamily }}>
                  {step.body}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>{step.visual}</Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
