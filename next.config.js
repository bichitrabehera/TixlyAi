/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["143.110.248.235"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;