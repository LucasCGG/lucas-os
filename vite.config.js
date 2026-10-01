import MillionLint from "@million/lint";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [MillionLint.vite({
    enabled: true
  }), react()],
  build: {
    rollupOptions: {
      output: {
        // Emit .mjs assets (the pdf.js worker) as .js: nginx's default mime.types serves .mjs as
        // application/octet-stream, and browsers refuse to run module workers with that MIME type.
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith(".mjs") ? "assets/[name]-[hash].js" : "assets/[name]-[hash][extname]",
      },
    },
  },
});
