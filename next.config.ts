// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === "1" ||
      process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
    domains: ["cp25sy3.sit.kmutt.ac.th", "localhost"],
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      {
        protocol: "http",
        hostname: "cp25sy3.sit.kmutt.ac.th",
        pathname: "/uploads/**",
      },
      {
        // Dev Strapi (if you ever point <Image> at http://localhost:1337/uploads/...)
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],

    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
