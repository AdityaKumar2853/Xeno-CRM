/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Remove rewrites for Vercel deployment - API will be handled by vercel.json
}

module.exports = nextConfig
