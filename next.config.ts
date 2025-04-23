import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["sfxgisidkwmjwfvbekhs.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/instagram/**",
      },
    ],
  },
};

export default nextConfig;
