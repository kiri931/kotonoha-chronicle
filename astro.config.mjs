// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://koukou-jouhou.org',
  base: '/kotonoha-chronicle',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
