/**
 * @license MIT
 * ============================================================================
 * nuxt.config.ts — The Stardust Engine (stardust.raggiesoft.com)
 * ============================================================================
 * Architectural Overview:
 * Configures Nuxt 4 + Vue 3 for 100% zero-database Static Site Generation
 * (`nuxt generate`), outputting static bundles to `.output/public` and `dist`
 * for deployment to `/var/www/stardust.raggiesoft.com` via Jenna & Sarah.
 * ============================================================================
 */

export default {
  compatibilityDate: '2026-10-17',
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/band', '/discography', '/lore', '/fleet', '/novel']
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1'
    }
  }
};

