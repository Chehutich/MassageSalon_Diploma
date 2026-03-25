import path from "node:path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["pg", "bcryptjs", "@prisma/client", ".prisma"],
    },
  },
  resolve: {
    mainFields: ["module", "jsnext:main", "jsnext"],
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
});
