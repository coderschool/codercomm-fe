import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import process from "process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(dirname(fileURLToPath(import.meta.url)), "src"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    cors: {
      credentials: true,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[tj]sx?$/,
  },
});
