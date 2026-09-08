import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /map was the single page that served both models and switched on the
      // date. It is now two pages, one per model (see
      // features/forecast/lib/products.ts). Any link to /map was a link to the
      // scored comparison, so that is where it lands.
      { source: "/map", destination: "/check-2025", permanent: true },
    ];
  },
};

export default nextConfig;
