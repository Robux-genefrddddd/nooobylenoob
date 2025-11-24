import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, "./client"),
        path.resolve(__dirname, "./shared"),
      ],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  let app: any;

  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      app = createServer();

      // Add Express app as middleware BEFORE Vite's default middlewares
      // This ensures our API routes are handled before Vite tries to serve them as files
      return () => {
        server.middlewares.use((req, res, next) => {
          // Only let Express handle /api routes and skip Vite's 404 handling
          if (req.url.startsWith("/api/")) {
            app(req, res, next);
          } else {
            next();
          }
        });
      };
    },
    resolveId(id) {
      // Make sure we don't try to resolve our API routes as modules
      if (id.startsWith("/api/")) {
        return false;
      }
    },
  };
}
