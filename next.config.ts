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
  // Cấu hình cho external images (ảnh demo - CHỈ DÙNG DEV)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'st.ourhtmldemo.com',
        pathname: '/template/organic_store/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'nongsandungha.com',
      },
    ],
  },
};

export default nextConfig;
