import { AuthInitializer } from "@/firebase";
import { Poppins } from "next/font/google";

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
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
