import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Add handling for PDF files and workers
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    domains: ['cdnjs.cloudflare.com'], // Allow images from CDN
  },
  async headers() {
    return [
      {
        // Allow CORS for PDFs in the public directory
        source: '/pdfs/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
          { key: 'Content-Type', value: 'application/pdf' },
        ],
      },
    ];
  },
};

export default nextConfig;
