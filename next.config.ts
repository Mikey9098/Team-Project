/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // RAWG images
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },

      // Supabase Storage (avatars)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
