import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    open: "/login_vendedor", // Abre automaticamente a página de login
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
        login_vendedor: resolve(__dirname, "public/login_vendedor.html"),
        libera_pedido: resolve(__dirname, "public/libera_pedido.html"), // Adiciona a nova página
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
          if (req.url === "/login_vendedor") {
            req.url = "/login_vendedor.html";
          }
          next();
        });
      },
    },
  ],
});
