/**
 * @license MIT
 * ============================================================================
 * src/renderers/shell.mjs — The Stardust Engine (stardust.raggiesoft.com)
 * ============================================================================
 * Architectural Overview:
 * Renders the outer cosmic HTML5 document shell for `stardust.raggiesoft.com`:
 * 1. Modern Web Guidance `dark-mode` & `dark-mode-toggle`:
 *    - `<meta name="color-scheme" content="light dark">` + synchronous inline
 *      FOUC-prevention script reading `localStorage.getItem('color-scheme')`.
 * 2. Strict Motion Accessibility (`prefers-reduced-motion: reduce`):
 *    - Synchronous inline check for `localStorage.getItem('cosmic-motion')` and
 *      a persistent **"⏸ Pause Cosmic Motion"** toggle in the sticky header.
 * 3. Mandatory OpenGraph (`og:*`) and Twitter Card tags (`title` <= 60 chars,
 *    `description` <= 155 chars).
 * 4. Global Fictitious Persons & Entities Disclaimer and cross-property handoff
 *    links to `https://music.raggiesoft.com`, `https://books.raggiesoft.com`,
 *    and `https://engineroom.raggiesoft.com`.
 * ============================================================================
 */

/**
 * Escapes HTML special characters for safe interpolation.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wraps route body HTML inside the cosmic document shell.
 *
 * @param {Object} opts
 * @param {string} opts.title - Page title (strictly <= 60 characters)
 * @param {string} opts.description - Meta/OG description (strictly <= 155 characters)
 * @param {string} opts.canonicalPath - Route path starting with `/`
 * @param {string} [opts.ogImage] - Full URL to 1200x630 OpenGraph banner
 * @param {string} opts.bodyHtml - Inner `<main id="content">` HTML markup
 * @returns {string}
 */
export function renderCosmicShell({
  title,
  description,
  canonicalPath = '/',
  ogImage = 'https://assets.raggiesoft.com/engine-room-records/artists/the-stardust-engine/social-preview.jpg',
  bodyHtml
}) {
  const safeTitle = escapeHtml(title.slice(0, 60));
  const safeDesc = escapeHtml(description.slice(0, 155));
  const canonicalUrl = `https://stardust.raggiesoft.com${canonicalPath === '/' ? '' : canonicalPath}`;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/band', label: 'The Band' },
    { href: '/discography', label: 'Discography' },
    { href: '/lore', label: 'Lore' },
    { href: '/story', label: 'Story (64)' },
    { href: '/fleet', label: 'Fleet' },
    { href: '/novel', label: 'Novel' }
  ];

  const navHtml = navItems
    .map((item) => {
      const isCurrent = item.href === canonicalPath || (item.href !== '/' && canonicalPath.startsWith(item.href + '/'));
      return `<li><a href="${item.href}" class="nav-link"${isCurrent ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a></li>`;
    })
    .join('\n            ');

  return `<!doctype html>
<html lang="en" data-bs-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <script>
      try {
        var storedScheme = localStorage.getItem('color-scheme');
        document.querySelector('meta[name="color-scheme"]').content = storedScheme ?? 'light dark';
        var resolvedBsTheme = (storedScheme === 'light' || storedScheme === 'dark')
          ? storedScheme
          : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-bs-theme', resolvedBsTheme);
        if (localStorage.getItem('cosmic-motion') === 'paused') {
          document.documentElement.setAttribute('data-cosmic-motion', 'paused');
        }
      } catch (e) {}
    </script>
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="The Stardust Engine" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <link rel="icon" type="image/png" href="https://assets.raggiesoft.com/engine-room-records/artists/the-stardust-engine/band-logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Black+Ops+One&family=Great+Vibes&family=Herr+Von+Muellerhoff&family=Mrs+Saint+Delafield&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Titillium+Web:wght@400;600;700&family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://kit.fontawesome.com/ec060982d4.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/common/css/raggiesoft-grid.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/common/css/raggiesoft-logo.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/stardust-engine/css/webawesome/root.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/stardust-engine/css/webawesome/extras.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/stardust-engine/css/webawesome/safety-net.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/stardust-engine/css/cosmic.css" />
    <link rel="stylesheet" href="https://assets.raggiesoft.com/common/css/raggiesoft-network.css" />
  </head>
  <body>
    <div class="cosmos-sky" aria-hidden="true"></div>
    <a href="#content" class="skip-link">Skip to main content</a>

    <nav class="rs-network-bar" aria-label="RaggieSoft Ecosystem Network">
      <div class="rs-network-bar-inner">
        <span class="rs-network-label">✦ RaggieSoft Network:</span>
        <ul class="rs-network-links">
          <li><a href="https://raggiesoft.com">🌐 Hub</a></li>
          <li><a href="https://nebulae.raggiesoft.com">🌌 Nebulae</a></li>
          <li><a href="https://music.raggiesoft.com">🎧 Music</a></li>
          <li><a href="https://books.raggiesoft.com">📚 Books</a></li>
          <li><a href="https://stardust.raggiesoft.com" aria-current="page" class="is-active">🚀 Stardust</a></li>
          <li><a href="https://engineroom.raggiesoft.com">⚙️ Engine Room</a></li>
          <li><a href="https://lore.raggiesoft.com">🏛️ Lore</a></li>
          <li><a href="https://corporate.raggiesoft.com">🏢 Corporate</a></li>
          <li><a href="https://storetrainer.raggiesoft.com">💾 StoreTrainer</a></li>
          <li><a href="https://michaelpragsdale.com">👔 Michael P. Ragsdale</a></li>
        </ul>
      </div>
    </nav>

    <header class="site-header" role="banner">
      <div class="container header-inner">
        <a href="/" class="brand-link" aria-label="The Stardust Engine Cosmic Home">
          <img
            src="https://assets.raggiesoft.com/engine-room-records/artists/the-stardust-engine/band-logo.png"
            alt="The Stardust Engine Rocket-and-Gear emblem"
            class="brand-logo"
            width="36"
            height="36"
          />
          <span class="brand-text">
            <span class="brand-title">The Stardust Engine</span>
            <span class="brand-subtitle">Ad Astra • Blacksburg, VA</span>
          </span>
        </a>

        <button
          type="button"
          class="mobile-menu-toggle"
          id="mobile-menu-toggle"
          aria-expanded="false"
          aria-controls="primary-navigation"
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <nav id="primary-navigation" class="primary-nav" aria-label="Primary Cosmic Navigation">
          <ul class="nav-links">
            ${navHtml}
            <li>
              <a href="https://music.raggiesoft.com/the-stardust-engine" class="nav-cta" target="_blank" rel="noopener noreferrer">
                🎧 Listen ↗
              </a>
            </li>
            <li>
              <button
                type="button"
                id="theme-toggle"
                class="control-btn"
                aria-label="Toggle between Exoplanet Light Mode and Deep Space Dark Mode"
                title="Switch between Exoplanet Surface (Light) and Deep Space (Dark)"
              >
                <span id="theme-toggle-label">🪐 Theme</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                id="motion-toggle"
                class="control-btn"
                aria-pressed="false"
                aria-label="Pause or resume cosmic starfield animations"
                title="Pause or resume twinkling starfield motion"
              >
                <span id="motion-toggle-label">⏸ Motion</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="content" class="container" tabindex="-1">
      ${bodyHtml}
    </main>

    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="grid-3" style="margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1rem; margin-bottom: 0.5rem;">The Stardust Engine (ERR-001)</h2>
            <p style="margin: 0 0 0.5rem; font-size: 0.83rem;">
              Named after the very first song Ryan, Cassidy, Evan, and Tyler wrote together at CPI in <strong>1986</strong>—celebrating their shared love of the cosmos (<strong>&ldquo;Stardust&rdquo;</strong>) and the rockets to get you there (<strong>&ldquo;Engine&rdquo;</strong>).
            </p>
            <p style="margin: 0; font-size: 0.8rem;">
              <a href="/about">📜 About</a> • <a href="/story">🗂️ 64 Story Dossiers</a> • <a href="/dsp-verification">🔍 DSP Verification</a> • <a href="/license">⚖️ Licensing</a> • <a href="/contact">✉️ Contact</a>
            </p>
          </div>
          <div>
            <h2 style="font-size: 1rem; margin-bottom: 0.5rem;">RaggieSoft Ecosystem Directory</h2>
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.83rem; display: grid; gap: 0.3rem;">
              <li><a href="https://music.raggiesoft.com/the-stardust-engine">🎧 The Listening Room (music.raggiesoft.com)</a></li>
              <li><a href="https://books.raggiesoft.com/books/stardust-engine">📚 RaggieSoft Book Reader (books.raggiesoft.com)</a></li>
              <li><a href="https://engineroom.raggiesoft.com">⚙️ Engine Room Records (engineroom.raggiesoft.com)</a></li>
              <li><a href="https://lore.raggiesoft.com">🏛️ Universe Lore Omnibus (lore.raggiesoft.com)</a></li>
              <li><a href="https://nebulae.raggiesoft.com">🌌 The RaggieSoft Nebulae (nebulae.raggiesoft.com)</a></li>
              <li><a href="https://raggiesoft.com">🌐 RaggieSoft Hub (raggiesoft.com)</a></li>
              <li><a href="https://corporate.raggiesoft.com">🏢 RaggieSoft Media (corporate.raggiesoft.com)</a></li>
              <li><a href="https://storetrainer.raggiesoft.com">💾 StoreTrainer Utility (storetrainer.raggiesoft.com)</a></li>
              <li><a href="https://michaelpragsdale.com">👔 Michael P. Ragsdale (michaelpragsdale.com)</a></li>
            </ul>
          </div>
          <div>
            <h2 style="font-size: 1rem; margin-bottom: 0.5rem;">Real-World Imprint Disclosure</h2>
            <p style="margin: 0 0 0.5rem; font-size: 0.83rem;">
              In real life, all music by <strong>The Stardust Engine</strong> is produced and published by <strong>Michael P. Ragsdale</strong> under his real-world creative brand <strong>Engine Room Records</strong> (never &ldquo;Engine Room Records, LLC&rdquo;).
            </p>
            <p style="margin: 0; font-size: 0.8rem;">
              <a href="https://corporate.raggiesoft.com/licensing/commercial">🏢 Commercial Sync Licensing</a> • <a href="https://michaelpragsdale.com">👔 Executive Systems Dossier</a>
            </p>
          </div>
        </div>

        <div class="disclaimer-box" role="note" aria-label="Fictitious Persons and Entities Disclaimer">
          <strong>Fictitious Persons, Bands &amp; Entities Disclaimer:</strong> All narrative characters (including Ryan, Cassidy, and Holly O'Connell, Evan and Tyler Wright, John and Erin, and Julian Vance), bands (including The Stardust Engine), universities (including Commonwealth Polytechnic Institute / CPI, The Forgers, and The Crucible), corporations (including OmniCorp, Apex Records, Prairie Coachworks, and Sainte-Claire), transit agencies (Blue Ridge Transit), in-universe legal filings, and any entity with <strong>&ldquo;LLC&rdquo;</strong>, <strong>&ldquo;Trust&rdquo;</strong>, or <strong>&ldquo;Holdings&rdquo;</strong> in its name (including <em>Engine Room Records, LLC</em>, <em>The O'Connell Family Revocable Trust</em>, <em>The O'Connell Family, LLC</em>, <em>Artists First Management, LLC</em>, <em>Stardust Properties, LLC</em>, <em>Stardust Blacksburg, LLC</em>, <em>Stardust Strategic Assets, LLC</em>, <em>Pacific Rim Properties, LLC</em>, <em>Jessica Miller Center, LLC</em>, and <em>Aethelgard Holdings, LLC</em>) are works of fiction. Any resemblance to actual persons (living or dead), businesses, institutions, or events is purely coincidental.
        </div>

        <p style="margin: 0.75rem 0 0; font-size: 0.8rem; color: var(--text-muted);">
          &copy; 2026 Michael P. Ragsdale / Engine Room Records. Code licensed under the
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.
          Creative narrative &amp; 128kbps web audio archives licensed under
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
        </p>
      </div>
    </footer>

    <script src="https://assets.raggiesoft.com/stardust-engine/js/cosmic-client.js" defer></script>
    <script src="https://assets.raggiesoft.com/common/js/raggiesoft-network.js" defer></script>
  </body>
</html>`;
}

