/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    },

    // Vercel deployment optimization
    output: 'standalone',

    // Image optimization
    images: {
        domains: ['localhost'],
    },
}

module.exports = nextConfig
