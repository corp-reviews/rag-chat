// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

const rootDir = process.cwd();

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        rootDir,
        path.join(rootDir, 'src'),
        path.join(rootDir, '.svelte-kit'),
        path.join(rootDir, 'node_modules'),
      ]
    }
  }
});
