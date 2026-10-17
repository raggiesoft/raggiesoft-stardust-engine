# The Stardust Engine (`stardust.raggiesoft.com`)

Official cosmic band lore, rolling sanctuary fleet dossier, discography handoff, and cosmic novel reader for **The Stardust Engine**, housed at [`/raggiesoft.com/subdomains/stardust`](file:///Users/michael/Library/CloudStorage/OneDrive-raggiesoft.com/raggiesoft-servers/raggiesoft.com/subdomains/stardust) (`https://stardust.raggiesoft.com`, with `https://thestardustengine.com` 301-redirecting).

## Architecture & Visual Design
- **Tech Stack**: Nuxt 4 + Vue 3 Static SSG (`npm run build` / `npm run generate`).
- **Dual Cosmic Environment (`prefers-color-scheme`)**:
  - **Light Mode**: Standing on the surface of a distant Earth-like exoplanet looking toward a sunlit golden horizon.
  - **Dark Mode**: Suspended in the lush vastness of deep space with twinkling starlight, nebulae, and orbital accents.
- **Strict Motion Accessibility (`prefers-reduced-motion: reduce`)**: Automatically disables all star-twinkling and transitions when reduced motion is requested by the OS or via the header **"⏸ Pause Cosmic Motion"** button.
- **Zero-Database Architecture**: Reads directly from `raggiesoft-assets/engine-room-records/catalog.json` and `raggiesoft-narratives/books/{stardust-engine,erin}`.

## Licensing
- **Code**: MIT License
- **Creative Content**: CC BY-SA 4.0

