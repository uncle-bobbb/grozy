/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'search.pstatic.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들에서 서버 전용 모듈 제외
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "bcrypt": false,
        "fs": false,
        "aws-sdk": false,
        "mock-aws-s3": false,
        "nock": false,
      };
    }
    
    // node-pre-gyp HTML 파일 처리를 위한 로더 추가
    config.module.rules.push({
      test: /\.html$/,
      loader: 'html-loader',
      include: [/node_modules\/@mapbox\/node-pre-gyp/],
    });

    return config;
  },
}

module.exports = nextConfig 