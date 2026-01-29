/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  swcMinify: true,
  compiler: {
    // enable styled components if needed
  }
}

export default nextConfig