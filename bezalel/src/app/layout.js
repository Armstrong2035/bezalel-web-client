import { Inter } from "next/font/google";
import AppProviders from "./hooks/AppProviders";
import LoadingWrapper from "@/components/LoadingWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Bezalel — Your AI Business Co-Founder",
  description:
    "Bezalel helps research your business, find opportunities, and handle customer-facing operations with AI agents. For solo operators who are good at building products.",
  metadataBase: new URL("https://bezalel-web-client.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bezalel — Your AI Business Co-Founder",
    description:
      "Bezalel helps research your business, find opportunities, and handle customer-facing operations with AI agents. For solo operators who are good at building products.",
    url: "https://bezalel-web-client.vercel.app",
    siteName: "Bezalel",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dldvbrmzb/image/upload/v1755881168/Mark_dtr0uw.png",
        width: 1200,
        height: 630,
        alt: "Bezalel - AI Business Co-Founder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // fixed
    title: "Bezalel — Your AI Business Co-Founder",
    description:
      "Bezalel helps research your business, find opportunities, and handle customer-facing operations with AI agents. For solo operators who are good at building products.",
    images: [
      "https://res.cloudinary.com/dldvbrmzb/image/upload/v1755881168/Mark_dtr0uw.png",
    ],
  },
  icons: {
    icon: "https://res.cloudinary.com/dldvbrmzb/image/upload/v1755881168/Mark_dtr0uw.png",
    apple:
      "https://res.cloudinary.com/dldvbrmzb/image/upload/v1755881168/Mark_dtr0uw.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={inter.className}
        style={{ backgroundColor: "#ffffff", padding: 0, margin: 0 }}
      >
        <AppProviders>
          <LoadingWrapper>{children}</LoadingWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
