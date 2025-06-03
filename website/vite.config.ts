import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), tsconfigPaths()
  ],
  optimizeDeps: {
    exclude: ["img-to-ico"]
  },
  server: {
    cors: true // Allow all origins for development
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Chunk for React and React Router
          if (id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }

          // Chunk for UI libraries
          if (id.includes('node_modules/@heroui')) {
            return 'ui-vendor';
          }

          // Chunk for zip.js
          if (id.includes('node_modules/@zip.js')) {
            return 'zip-vendor';
          }

          // Chunk for img-to-ico (WASM)
          if (id.includes('node_modules/img-to-ico')) {
            return 'ico-vendor';
          }

          // Chunk for markdown processing
          if (id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/rehype') ||
            id.includes('node_modules/remark')) {
            return 'markdown-vendor';
          }

          // Chunk for Turnstile and other third-party libs
          if (id.includes('node_modules/@marsidev/react-turnstile')) {
            return 'turnstile-vendor';
          }

          // Add more specific chunks for app components
          if (id.includes('/src/components/ModpackForm')) {
            return 'form';
          }

          // Group utility functions
          if (id.includes('/src/utils/')) {
            if (id.includes('iconConverter.lazy')) {
              return 'icon-converter';
            }
            if (id.includes('zipUtils')) {
              return 'zip-utils';
            }
            if (id.includes('github')) {
              return 'github-utils';
            }
            return 'utils';
          }

          // Keep main page components separate
          if (id.includes('/src/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName) return `page-${pageName}`;
          }
        },
        // Customize chunk filenames
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
          const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
          return `assets/${fileName}-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: true,
    minify: true, // Use Rollup's default minification
  },
  base: '/' // Set base to relative path for GitHub Pages deployment
});
