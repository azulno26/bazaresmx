import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/bazares-en-edomex',
        destination: '/bazares-en-estado-de-mexico',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
