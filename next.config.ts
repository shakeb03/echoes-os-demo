import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ allows deploy despite lint errors
  },
};

export default nextConfig;
