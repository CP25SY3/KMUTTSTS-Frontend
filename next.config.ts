// next.config.ts
import type { NextConfig } from "next";

const isImageUnptimized = process.env.NEXT_IMAGE_UNOPTIMIZED === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Flip this on temporarily if you need to bypass the optimizer while debugging.
    // Usage: NEXT_IMAGE_UNOPTIMIZED=1 next start
    unoptimized: isImageUnptimized,
    domains: ["cp25sy3.sit.kmutt.ac.th", "localhost"],
    // Let Next output AVIF/WebP when the browser supports it.
    formats: ["image/avif", "image/webp"],

    // You only need these if you ever pass ABSOLUTE URLs to <Image />.
    // For RELATIVE paths like "/uploads/abc.png", these are ignored.
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

    // Reasonable defaults; keep the classic device sizes.
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Only set true if you actually serve trusted SVGs from Strapi.
    // If unsure, leave it false for safety.
    // dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
