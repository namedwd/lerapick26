/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kr.object.ncloudstorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.ncloudstorage.com',
      },
    ],
  },
  
  // 성능 최적화
  compress: true,
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
