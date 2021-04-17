import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import env from "./src/env.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  define: {
    global: "globalThis",
    "process.cwd": "(()=>'/')",
    "process.env": {},
  },
  server: {
    proxy: {
      "/graphql": {
        target: env.gqlUrl,
        changeOrigin: true,
        prependPath: false,
      },
    },
  },
});
