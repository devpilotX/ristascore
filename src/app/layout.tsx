import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { isLiveVerification } from "@/lib/env";

// Self-hosted, optimized fonts (no layout shift, no runtime request to Google).
// These expose CSS variables that globals.css wires into --serif and --sans.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "RishtaScore, find your life partner with proof",
  description:
    "RishtaScore is a consent based trust score for marriage. Run background checks you agree to, get a 0 to 900 trust badge, and share it with confidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${mulish.variable}`}>
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
