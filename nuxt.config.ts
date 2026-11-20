/**
 * @license MIT
 * ============================================================================
 * nuxt.config.ts — The Stardust Engine (stardust.raggiesoft.com)
 * ============================================================================
 * PLAIN-ENGLISH OVERVIEW (100-LEVEL JAVASCRIPT & NUXT 4 GUIDE):
 * What is this file?
 *   This is the central configuration file for Nuxt 4 (a Static Site Generation
 *   and Server-Side Rendering framework built on Vue 3). Even though the file
 *   extension is `.ts` (TypeScript, which is JavaScript with optional type
 *   checking), valid JavaScript is 100% valid TypeScript—so this file exports a
 *   clean, human-readable ES Module configuration object (`export default { ... }`).
 *
 * How does it fit into the build lifecycle?
 *   - Declares how Nuxt 4 and its server/build engine ("Nitro") pre-render all
 *     cosmic band routes into pure static HTML files with zero backend database.
 *   - Paired with `scripts/build.mjs` (`npm run build`), which reads `catalog.json`,
 *     `master-catalog.json`, `ported-pages.json`, and the Markdown novels in
 *     `raggiesoft-narratives/books/{stardust-engine,erin}` and writes identical
 *     static bundles into BOTH `./dist` and Nuxt Nitro's `./.output/public`
 *     directory for deployment via `jenna-sync.sh` and `sarah-deploy.sh`.
 * ============================================================================
 */

// Export the Nuxt 4 configuration object as the module's default export.
export default {
  // Locks Nuxt/Nitro behavior to a specific release date so future minor updates
  // never silently change build defaults behind our backs.
  compatibilityDate: '2026-10-17',

  // `ssr: true` enables Server-Side / Build-Time HTML rendering so visitors and
  // search engines receive complete, readable HTML immediately instead of a blank page.
  ssr: true,

  // `nitro` configures Nuxt 4's underlying build & output engine.
  nitro: {
    // `'static'` tells Nitro to emit 100% static `.html` files into `.output/public`
    // rather than compiling a Node.js server process.
    preset: 'static',

    // Pre-rendering rules instructing the static crawler which routes to build at compile time.
    prerender: {
      // Automatically discover and pre-render internal `<a href="/...">` links found on pages.
      crawlLinks: true,
      // Explicit seed routes for the 6 primary portals of `stardust.raggiesoft.com`.
      routes: ['/', '/band', '/discography', '/lore', '/fleet', '/novel']
    }
  },

  // Global HTML `<head>` defaults applied across the application.
  app: {
    head: {
      // Sets `<html lang="en">` for screen-reader pronunciation and WCAG 3.1.1 compliance.
      htmlAttrs: { lang: 'en' },
      // Standard UTF-8 character encoding and mobile-first responsive viewport scaling.
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1'
    }
  }
};

