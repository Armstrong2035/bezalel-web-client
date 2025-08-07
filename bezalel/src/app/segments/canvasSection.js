import {
  BusinessCenter,
  Build,
  Inventory,
  Star,
  Storefront,
  People,
  Groups,
  AccountBalance,
  TrendingUp,
} from "@mui/icons-material";

export const canvasSections = [
  {
    title: "Customer Segments",
    order: 1,
    url: "customer-segments",
    icon: Groups,
    description: "For whom are we creating value?",
  },
  {
    title: "Value Propositions",
    order: 2,
    url: "value-propositions",
    icon: Star,
    description: "What value do we deliver to the customer?",
  },
  {
    title: "Channels",
    order: 3,
    url: "channels",
    icon: Storefront,
    description: "Through which channels do we reach our customers?",
  },
  {
    title: "Customer Relationships",
    order: 4,
    url: "customer-relationships",
    icon: People,
    description: "What type of relationship does each customer segment expect?",
  },
  {
    title: "Revenue Streams",
    order: 5,
    url: "revenue-streams",
    icon: TrendingUp,
    description: "For what value are our customers really willing to pay?",
  },
  {
    title: "Key Resources",
    order: 6,
    url: "key-resources",
    icon: Inventory,
    description: "What key resources does your value proposition require?",
  },
  {
    title: "Key Activities",
    order: 7,
    url: "key-activities",
    icon: Build,
    description: "What key activities does your value proposition require?",
  },
  {
    title: "Key Partners",
    order: 8,
    url: "key-partners",
    icon: BusinessCenter,
    description: "Who are your key partners and suppliers?",
  },
  {
    title: "Cost Structure",
    order: 9,
    url: "cost-structure",
    icon: AccountBalance,
    description:
      "What are the most important costs inherent in our business model?",
  },
];
