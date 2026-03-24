import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  generateBuildId: async () => {
    // Use a build ID from environment or fallback to a timestamp for uniqueness per build
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
};

export default nextConfig;
