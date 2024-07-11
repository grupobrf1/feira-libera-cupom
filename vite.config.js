import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  base: './',
  server: {
    host: true,
    port: 3001,
    open: "/login", // Abre automaticamente a página de login
    proxy: {
      "/api": {
        target: "https://sga.grupobrf1.com:10000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: resolve(__dirname, "src/index.html"),
        libera_pedido: resolve(__dirname, "src/libera_pedido.html"),
        dark_mode: resolve(__dirname, "src/dark-mode-toggle.css"),
        libera_pedido_js: resolve(__dirname, "src/libera_pedido.js"),
        login_js: resolve(__dirname, "src/login.js"),
        brf1ico: resolve(__dirname, "public/brf1.ico"),
        eye: resolve(__dirname, "src/icons/eye.svg"),
        eye_off: resolve(__dirname, "src/icons/eye-off.svg"),
        style: resolve(__dirname, "src/style.css"),
        sound: resolve(__dirname, "src/sound.mp3"),
        proibido: resolve(__dirname, "src/pagina_erro_403.html")
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
