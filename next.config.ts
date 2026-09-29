import type { NextConfig } from "next";

const RAILWAY_BACKEND = "https://tradenexabackend-production.up.railway.app";

const nextConfig: NextConfig = {
  // Allow LAN access (mobile, other PCs) for dev server HMR without cross-origin blocking
  allowedDevOrigins: [
    "localhost:3001",
    "127.0.0.1:3001",
    "192.168.1.103:3001",
    "192.168.1.103",
    "192.168.*.*",
    "localhost",
    "127.0.0.1",
  ],

  // Proxy /api/v1/* → Railway backend (server-side, no CORS in browser)
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${RAILWAY_BACKEND}/api/v1/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "t3.storageapi.dev" },
      { protocol: "https", hostname: "tradenexabackend-dev.up.railway.app" },
      { protocol: "https", hostname: "tradenexabackend-production.up.railway.app" },
      { protocol: "https", hostname: "**.railway.app" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
