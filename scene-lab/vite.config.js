import { defineConfig } from 'vite';
export default defineConfig({
  base: '/cinema/',
  server: { host: '127.0.0.1', port: 4186, strictPort: true },
  build: {
    outDir: '../cinema',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
  },
});
