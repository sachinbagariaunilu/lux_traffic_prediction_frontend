import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Traffic Forecasting · Luxembourg",
    template: "%s · Traffic Forecasting",
  },
  description:
    "Hourly 2025 traffic forecasts for 270 Luxembourg road counters, shown against what the road actually recorded.",
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
      "Hourly 2025 traffic forecasts for 270 Luxembourg road counters, checked against recorded counts.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
