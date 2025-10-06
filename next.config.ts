import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
      }
    ],
    domains: ["*"], // allow all domains for image optimization
  }
};

export default nextConfig;
