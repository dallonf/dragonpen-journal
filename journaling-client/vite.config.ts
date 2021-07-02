import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { babel } from "@rollup/plugin-babel";
import env from "./src/env.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
    sourcemap: true,
  },
  plugins: [
    reactRefresh(),
    babel({
      babelHelpers: "bundled",
      include: ["src/**/*"],
      extensions: [".ts", ".tsx"],
    }),
  ],
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
