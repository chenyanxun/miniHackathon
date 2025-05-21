import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // 构建时忽略所有 ESLint 错误和警告
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 构建时忽略所有 TypeScript 错误（包括 any 类型）
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aggregator.walrus-testnet.walrus.space",
      },
    ],
  },
};

export default nextConfig;
