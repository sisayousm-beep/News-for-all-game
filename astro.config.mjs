// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL / SITE_BASE are set by the deploy workflow (e.g. GitHub Pages serves under /<repo>/).
export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE ?? '/',
  trailingSlash: 'always',
  output: 'static',
});
