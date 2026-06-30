import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
  clearScreen: false,
  plugins: [
    tanstackStart({
      router: { entry: "router" },
      serverFns: { disableCsrfMiddlewareWarning: true },
      srcDirectory: "src",
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: "127.0.0.1",
    port: 1430,
    strictPort: true,
  },
});

export default config;
