# The Stardust Engine (`stardust.raggiesoft.com`)

[![License: MIT](https://img.shields.io/badge/Code_License-MIT-0369a1.svg)](./LICENSE)
[![Stack: Nuxt 4 + Vue 3 SSG](https://img.shields.io/badge/Framework-Nuxt_4_%2B_Vue_3_SSG-00dc82.svg)](https://stardust.raggiesoft.com)

Standalone static archive, discography portal, and narrative reader hub for **The Stardust Engine** at `https://stardust.raggiesoft.com` (`301` target of `https://thestardustengine.com`).

## Architecture & Accessibility

- **Tech Stack**: Nuxt 4 + Vue 3 / Node.js Static Site Generation (`npm run build`).
- **Adaptive Dual-Theme CSS (`prefers-color-scheme`)**:
  - **Light Mode**: High-contrast sunlit exoplanet horizon palette (≥ 4.5:1 contrast).
  - **Dark Mode**: Deep-space orbital palette with verified WCAG 2.1 AA contrast tokens.
- **Motion Sensitivity (`prefers-reduced-motion: reduce`)**: Automatically disables ambient starfield and transition animations when reduced motion is requested at the OS level or toggled via the header **"Pause Cosmic Motion"** control.
- **Zero-Database Flat-File Pipeline**: Compiles static HTML routes directly from structured catalog JSON and Markdown narrative manifests (`stardust-engine` and `ad-astra`).

## Licensing
- **Source Code**: MIT License
- **Creative Content**: CC BY-SA 4.0
