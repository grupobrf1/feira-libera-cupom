import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
    port: 3001,
    open: "/login", // Abre automaticamente a página de login
    proxy: {
      "/api": {
        target: "https://api-feira.azurewebsites.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        login: resolve(__dirname, "public/login.html"),
        libera_pedido: resolve(__dirname, "public/libera_pedido.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    {
      name: "html-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/libera_pedido") {
            req.url = "/libera_pedido.html";
          }
          if (req.url === "/login") {
            req.url = "/login.html";
          }
          next();
        });
      },
    },
  ],
});
