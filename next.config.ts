import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tắt Next.js DevTools
  devIndicators: {
    buildActivity: false, // Tắt indicator build
    appIsrStatus: false,  // Tắt ISR status
  },
  // Tắt error overlay (popup báo lỗi đỏ)
  reactStrictMode: false,
};

export default nextConfig;
