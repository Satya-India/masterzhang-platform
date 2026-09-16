// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  /**
   * Production origin — drives canonical URLs, OpenGraph, sitemap and JSON-LD.
   * Change this to your custom domain when it is provisioned.
   */
  site: 'https://masterzhang.ca',

  /**
   * Static-first (SSG) architecture: every page is prerendered at build time
   * for zero-TTFB delivery on Cloudflare's edge. Only routes that explicitly
   * opt out with `export const prerender = false` (e.g. /api/quote) run as
   * serverless functions.
   */
  output: 'static',

  adapter: cloudflare({
    // "compile" runs sharp at build time for prerendered pages (best LCP),
    // and passes through on-demand routes on the edge.
    imageService: 'compile',
    // Exposes Cloudflare bindings/env in `astro dev` via `locals.runtime`.
    platformProxy: { enabled: true },
  }),

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-CA', zh: 'zh-CN' },
      },
      changefreq: 'weekly',
      priority: 0.8,
    }),
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false, // English at "/", Chinese at "/zh/"
      redirectToDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
