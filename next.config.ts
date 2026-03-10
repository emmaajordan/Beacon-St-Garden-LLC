/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zcjkbrfiqelulixqjsjx.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;