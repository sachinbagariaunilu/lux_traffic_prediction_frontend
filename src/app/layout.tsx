import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

/**
 * Three faces, three jobs -- the split an engineering-studio layout needs:
 *
 *   Space Grotesk  headlines, set uppercase. A techno grotesque: squared bowls,
 *                  flat terminals, and it holds together at 1.0 line-height,
 *                  where a humanist face starts to look cramped.
 *   Inter          body copy at weight 350. Loaded as the variable font, so the
 *                  in-between weight costs nothing extra.
 *   Space Mono     eyebrows, labels, tags. Space Grotesk was drawn from it, so
 *                  the pairing is a family resemblance rather than a contrast.
 *
 * All three are self-hosted by next/font at build time -- no CDN request, no
 * layout shift, no third-party origin in the CSP.
 */
const display = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Traffic Forecasting · Luxembourg",
    template: "%s · Traffic Forecasting",
  },
  description:
    "Hourly traffic forecasts for 273 Luxembourg road counters, from two models kept apart: 2025 predicted by a model trained on 2024 alone and scored against recorded counts, and 2026 to 2028 forecast from both years.",
  applicationName: "Traffic Forecasting",
  keywords: [
    "Luxembourg",
    "traffic forecast",
    "road counters",
    "traffic prediction",
    "mobility data",
  ],
  // src/app/icon.png (the Luxembourg flag roundel) is picked up automatically
  // by the App Router and hashed into the head -- no manual link tag needed.
  openGraph: {
    title: "Traffic Forecasting · Luxembourg",
    description:
      "Two models, two pages: 2025 checked against what the road recorded, 2026 to 2028 forecast — across 273 Luxembourg road counters.",
    type: "website",
    locale: "en_GB",
  },
  // Internal tool against a local API -- keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        {/* Page views only -- no custom events are sent from anywhere in this
            app. It injects nothing outside Vercel, and on a non-Vercel host the
            script simply never loads, so local `next dev` and `next build` are
            unaffected.

            Last in the body rather than in <head>: it is not needed to render
            anything, and the fonts above are deliberately self-hosted to keep
            third-party origins out of the CSP -- this adds one back, so it is
            worth knowing it is here if that policy is ever tightened. */}
        <Analytics />
      </body>
    </html>
  );
}
