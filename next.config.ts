import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // 플로팅 버튼 제거
  experimental: {
    // Next.js Learn 버튼 비활성화
  },
  // 개발 모드 오버레이 비활성화
  reactStrictMode: true,
};

export default nextConfig;

