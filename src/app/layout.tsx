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
    "Hourly 2025 to 2029 traffic forecasts for 269 Luxembourg road counters, shown against what the road actually recorded.",
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
      "Hourly 2025 to 2029 traffic forecasts for 269 Luxembourg road counters, checked against recorded counts.",
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
