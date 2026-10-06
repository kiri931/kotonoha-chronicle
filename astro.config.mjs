// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://koukou-jouhou.org',
  base: '/kotonoha-chronicle',
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
