import type { NextConfig } from "next";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://tradenexabackend-production.up.railway.app";

let backendHostname = "tradenexabackend-production.up.railway.app";

try {
  backendHostname = new URL(backendUrl).hostname;
} catch {
  // Keep default hostname when env URL is invalid.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: backendHostname,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
