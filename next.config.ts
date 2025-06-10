import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages用の設定
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 環境変数
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  // パフォーマンス最適化
  // experimental: {
  //   optimizeCss: true,
  // }
  // Note: セキュリティヘッダーはCloudflare Pagesの_headers ファイルで設定
};

export default nextConfig;
