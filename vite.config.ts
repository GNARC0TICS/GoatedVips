import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig({
  // Detect Replit deployment environment
  base: process.env.REPL_SLUG && process.env.NODE_ENV === 'production' 
    ? '/' 
    : '/',
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use
    host: "0.0.0.0", // Expose to network for Replit compatibility
    hmr: {
      clientPort: 443, // For Replit's HTTPS forwarding
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined,
      protocol: 'wss', // Use secure WebSockets for Replit
    },
    watch: {
      usePolling: true, // Better for containerized environments like Replit
      interval: 1000,
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index.html'),
        admin: path.resolve(__dirname, 'client/admin.html'),
      },
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'wouter'],
          'ui': [
            '@/components/ui',
            'framer-motion',
            'vaul',
            'tailwind-merge'
          ]
        }
      }
    },
  },
});