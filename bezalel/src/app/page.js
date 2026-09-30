import DigestLanding from "@/components/landing/DigestLanding";

export const metadata = {
  title: "Bezalel — Your AI Business Cofounder",
  description: "A thinking partner for your business. Connect your goals, research, and opportunities, and use your daily digest to decide what matters and what to do next.",
  openGraph: { title: "Bezalel — Your AI Business Cofounder", description: "Know what matters. Build what’s next. A thinking partner for your goals, research, and business decisions." },
  twitter: { title: "Bezalel — Your AI Business Cofounder", description: "Your business, with a little more perspective. Turn research and opportunities into considered next steps." },
};

export default function Home() {
  return <DigestLanding />;
}
