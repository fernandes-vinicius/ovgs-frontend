import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone: imagem Docker enxuta (só o necessário pra rodar,
  // sem precisar copiar node_modules inteiro) — ver Dockerfile/docker-compose.yml.
  output: "standalone",
};

export default nextConfig;
