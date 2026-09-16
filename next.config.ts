import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: '/dws0cy8xg/image/upload/**',
      }

    ],
    // Temporarily bypass Next.js image optimization.
    // Cloudinary will serve the images directly.
    unoptimized: true,
  }
};

export default nextConfig;
