// next.config.js or next.config.ts
const nextConfig = {
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**', // More permissive for any path on this host
      }

    ],
  },
  // ... other configs
};

// module.exports = nextConfig; // if JS
export default nextConfig; // if TS