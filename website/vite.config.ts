import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import favicons from '@peterek/vite-plugin-favicons'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), tsconfigPaths(),
    favicons('./public/icon.svg'), // Adjust path as needed
  ],
  optimizeDeps: {
    exclude: ["img-to-ico"]
  },
  server: {
    cors: true // Allow all origins for development
  },
  base: '/' // Set base to relative path for GitHub Pages deployment
});
