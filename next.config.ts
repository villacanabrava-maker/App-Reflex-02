import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O parser PDF roda somente no backend e deve permanecer fora do bundle
  // interno do Next.js para preservar seu runtime Node nativo.
  serverExternalPackages: ["pdf-parse"],
  eslint: {
    // Ignora checagens de lint durante o build para garantir que builds não travem
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
