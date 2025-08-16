import { Poppins } from "next/font/google";
import AppProviders from "./hooks/AppProviders";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
        style={{ backgroundColor: "#000000", padding: 0, margin: 0 }}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
