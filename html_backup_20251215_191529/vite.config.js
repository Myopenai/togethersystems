import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// Cache configuration
const ONE_DAY = 60 * 60 * 24;
const ONE_YEAR = ONE_DAY * 365;

export default defineConfig({
  // Enable incremental builds
  cacheDir: '.vite/cache',
  
  build: {
    // Enable build caching
    rollupOptions: {
      cache: true,
      output: {
        // Better caching for generated assets
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Enable minification
    minify: 'terser',
    // Enable gzip compression
    reportCompressedSize: true,
    // Enable brotli compression
    brotliSize: true,
  },
  
  // Development server configuration
  server: {
    // Enable HMR (Hot Module Replacement)
    hmr: true,
    // Enable filesystem caching
    fs: {
      strict: false,
      cachedChecks: true,
    },
  },
  
  plugins: [
    // PWA support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: ONE_DAY,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    
    // Bundle analyzer
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // Build optimization
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: [],
    // Enable dependency pre-bundling
    force: false,
  },
});
