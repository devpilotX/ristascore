import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isLiveVerification } from "@/lib/env";

export const metadata: Metadata = {
  title: "RishtaScore, find your life partner with proof",
  description:
    "RishtaScore is a consent based trust score for marriage. Run background checks you agree to, get a 0 to 900 trust badge, and share it with confidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Mulish:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {!isLiveVerification && (
          <div className="demo-banner">
            Demo mode: verification checks are simulated in a sandbox and are not yet confirmed
            against live government sources.
          </div>
        )}
        <NavBar />
        <main id="app">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
