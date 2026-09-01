import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  publicDir: resolve(process.cwd(), 'node_modules/qr-tree-engine/public'),
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
