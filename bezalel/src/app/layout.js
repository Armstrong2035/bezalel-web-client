import { Poppins } from "next/font/google";
import AppProviders from "./hooks/AppProviders";
import LoadingWrapper from "@/components/LoadingWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata = {
  title: "Bezalel - Turn Your Idea Into a Business Plan in 45 Minutes",
  description:
    "Bezalel guides you through a business model canvas and gives you a clear 90-day action plan — so you can go from idea to execution with confidence.",
  metadataBase: new URL("https://bezalel.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bezalel - Turn Your Idea Into a Business Plan in 45 Minutes",
    description:
      "Bezalel guides you through a business model canvas and gives you a clear 90-day action plan — so you can go from idea to execution with confidence.",
    url: "https://bezalel.io",
    siteName: "Bezalel",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dldvbrmzb/image/upload/v1755881168/Mark_dtr0uw.png",
        width: 1200,
        height: 630,
        alt: "Bezalel - AI Business Planning Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // fixed
    title: "Bezalel - Turn Your Idea Into a Business Plan in 45 Minutes",
    description:
      "Bezalel guides you through a business model canvas and gives you a clear 90-day action plan — so you can go from idea to execution with confidence.",
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
        className={poppins.className}
        style={{ backgroundColor: "#000000", padding: 0, margin: 0 }}
      >
        <AppProviders>
          <LoadingWrapper>{children}</LoadingWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
