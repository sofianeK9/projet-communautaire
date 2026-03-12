import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  images: {
    domains: [],
  },
  webpack: (config) => {
    // Fix for leaflet in SSR
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
