import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  clearScreen: false,
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 1430,
    strictPort: true,
  },
});

export default config;
