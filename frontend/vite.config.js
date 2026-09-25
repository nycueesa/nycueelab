import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "/nycueelab/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 讓 @ 代表 src
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      '/nycueelab/api': {
        target: process.env.API_PROXY_TARGET || 'http://127.0.0.1:11451',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/nycueelab/, ''),
      },
    },
    watch: {
      // 啟用 polling 模式來解決 WSL/Docker 檔案監控問題
      usePolling: true,
      interval: 1000,
      // 忽略 node_modules 來提升效能
      ignored: ["**/node_modules/**"],
    },
    // 確保 HMR 正常運作
    hmr: {
      ...(process.env.VITE_HMR_CLIENT_PORT ? { clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) } : {}),
    },
  },
});
