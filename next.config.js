/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["crypto-js", "jsonwebtoken"],
  },
};

module.exports = nextConfig;
