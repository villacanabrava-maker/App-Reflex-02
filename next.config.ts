import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recomendado pelo pdf-parse para Next.js/Vercel: mantém o runtime nativo
  // e os arquivos do worker fora do bundle interno do Next.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

export default nextConfig;
