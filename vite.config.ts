
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    cors: true,
    strictPort: true,
    hmr: {
      host: '0.0.0.0',
      clientPort: 443,
      protocol: 'wss'
    },
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      '32227c5c-bbf5-490b-9302-a351e215f0e5-00-bv3r7s9hkx0y.spock.replit.dev',
      '.replit.dev',
      '.repl.co',
      'localhost',
      '0.0.0.0',
      'all'
    ]
  },
});
