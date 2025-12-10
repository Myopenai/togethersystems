import { defineConfig } from 'vite';
import sourceMapConfig from './source-map-config.json';

export default defineConfig({
  build: {
    sourcemap: true, // Generiert separate .map Dateien
    sourcemapIgnoreList: false,
    rollupOptions: {
      output: {
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
          // Source Maps werden relativ zum publicPath gehostet
          return sourceMapConfig.hosting.local.url + '/' + relativeSourcePath;
        }
      }
    }
  },
  server: {
    port: 9323,
    open: true
  }
});

