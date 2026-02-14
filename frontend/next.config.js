/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Vercel deployment optimization
    output: 'standalone',

    // Image optimization - allow Google profile pics
    images: {
        domains: ['localhost', 'lh3.googleusercontent.com'],
    },
}

module.exports = nextConfig
