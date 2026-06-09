import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        venueEditor: path.resolve(__dirname, 'src/renderer/windows/venue-editor/index.html'),
        stageLibrary: path.resolve(__dirname, 'src/renderer/windows/stage-library/index.html'),
        schedule: path.resolve(__dirname, 'src/renderer/windows/schedule/index.html'),
        audience: path.resolve(__dirname, 'src/renderer/windows/audience/index.html'),
        ticketing: path.resolve(__dirname, 'src/renderer/windows/ticketing/index.html'),
        rehearsal: path.resolve(__dirname, 'src/renderer/windows/rehearsal/index.html'),
        playback: path.resolve(__dirname, 'src/renderer/windows/playback/index.html')
      }
    }
  }
});
