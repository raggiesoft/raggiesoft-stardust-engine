/**
 * @license MIT
 * ============================================================================
 * scripts/build.mjs — The Stardust Engine (stardust.raggiesoft.com)
 * ============================================================================
 * Architectural Overview:
 * Static Site Generation (SSG) compiler for `stardust.raggiesoft.com`.
 * Reads `raggiesoft-assets/engine-room-records/catalog.json` and the Markdown/
 * JSON novels in `raggiesoft-narratives/books/{stardust-engine,erin}` and
 * emits static bundles to both `./dist` and `./.output/public` for deployment
 * via Jenna & Sarah:
 * - `/index.html`
 * - `/band/index.html`
 * - `/discography/index.html`
 * - `/lore/index.html`
 * - `/fleet/index.html`
 * - `/novel/index.html`
 * - `/assets/cosmic.css`
 * - `/assets/cosmic-client.js`
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

import {
  renderStardustHome,
  renderBandMembersPage,
  renderDiscographyPage,
  renderDeepLorePage
} from '../src/renderers/pages-band.mjs';
import {
  renderFleetPage,
  renderNovelPage
} from '../src/renderers/pages-fleet-and-novel.mjs';
import { renderCosmicShell, escapeHtml } from '../src/renderers/shell.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const nitroPublicDir = path.join(projectRoot, '.output', 'public');

/**
 * Resolves the root workspace directory containing `raggiesoft-assets` and `raggiesoft-narratives`.
 * @returns {string}
 */
function resolveWorkspaceRoot() {
  const candidates = [
    path.resolve(projectRoot, '../../..'),
    path.resolve(projectRoot, '../..'),
    '/var/www'
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'raggiesoft-assets'))) {
      return candidate;
    }
  }
  throw new Error('Could not locate workspace root containing raggiesoft-assets.');
}

/**
 * Writes a static file into both `./dist` and `./.output/public`.
 * @param {string} relPath
 * @param {string} content
 */
function writeStaticOutput(relPath, content) {
  for (const base of [distDir, nitroPublicDir]) {
    const full = path.join(base, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf-8');
  }
}

/**
 * Builds `/assets/cosmic-client.js` implementing:
 * 1. Modern Web Guidance `dark-mode-toggle` (two-state override reverting to
 *    System default when matching OS `prefers-color-scheme`) + Bootstrap `data-bs-theme` sync.
 * 2. Cosmic Motion Pause/Resume control respecting `prefers-reduced-motion: reduce`.
 * @returns {string}
 */
function buildCosmicClientJs() {
  return `/**
 * @license MIT
 * cosmic-client.js — Client Progressive Enhancement for stardust.raggiesoft.com
 * Implements Modern Web Guidance dark-mode-toggle (Exoplanet Light vs. Deep Space Dark),
 * strict prefers-reduced-motion + manual Pause Cosmic Motion controls, and mobile menu toggle.
 */
(function () {
  var meta = document.querySelector('meta[name="color-scheme"]');
  var themeBtn = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-toggle-label');
  var motionBtn = document.getElementById('motion-toggle');
  var motionLabel = document.getElementById('motion-toggle-label');
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var primaryNav = document.getElementById('primary-navigation');

  if (mobileToggle && primaryNav) {
    mobileToggle.addEventListener('click', function () {
      var expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      primaryNav.classList.toggle('is-open', !expanded);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('is-open');
        mobileToggle.focus();
      }
    });
  }

  function getSystemScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getRenderedScheme() {
    var stored = null;
    try {
      stored = localStorage.getItem('color-scheme');
    } catch (e) {}
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return getSystemScheme();
  }

  function updateThemeLabel() {
    var current = getRenderedScheme();
    document.documentElement.setAttribute('data-bs-theme', current);
    if (!themeLabel) return;
    themeLabel.textContent = current === 'dark' ? '🌌 Deep Space' : '🪐 Exoplanet';
  }

  if (themeBtn && meta) {
    updateThemeLabel();
    themeBtn.addEventListener('click', function () {
      var current = getRenderedScheme();
      var target = current === 'dark' ? 'light' : 'dark';
      var sys = getSystemScheme();
      try {
        if (target === sys) {
          localStorage.removeItem('color-scheme');
          meta.content = 'light dark';
        } else {
          localStorage.setItem('color-scheme', target);
          meta.content = target;
        }
      } catch (e) {
        meta.content = target;
      }
      updateThemeLabel();
    });

    window.addEventListener('storage', function (e) {
      if (e.key === 'color-scheme') {
        meta.content = e.newValue || 'light dark';
        updateThemeLabel();
      }
    });
  }

  // Cosmic Motion Control (respects prefers-reduced-motion: reduce)
  var osReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMotionPaused() {
    if (osReducedMotion) return true;
    return document.documentElement.getAttribute('data-cosmic-motion') === 'paused';
  }

  function updateMotionLabel() {
    if (!motionLabel || !motionBtn) return;
    var paused = isMotionPaused();
    motionBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    motionLabel.textContent = paused ? '▶ Motion' : '⏸ Motion';
  }

  if (motionBtn) {
    if (osReducedMotion) {
      document.documentElement.setAttribute('data-cosmic-motion', 'paused');
    }
    updateMotionLabel();
    motionBtn.addEventListener('click', function () {
      var currentlyPaused = document.documentElement.getAttribute('data-cosmic-motion') === 'paused';
      if (currentlyPaused) {
        document.documentElement.removeAttribute('data-cosmic-motion');
        try {
          localStorage.setItem('cosmic-motion', 'active');
        } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-cosmic-motion', 'paused');
        try {
          localStorage.setItem('cosmic-motion', 'paused');
        } catch (e) {}
      }
      updateMotionLabel();
    });
  }
})();
`;
}

/**
 * Generates an interactive directory card grid for all 64 ported dossiers.
 * @param {Array<Object>} portedPages
 * @returns {string}
 */
function renderMasterArchiveDirectoryHtml(portedPages) {
  const groups = [
    {
      title: 'The Iron Five — Band Member Dossiers & History',
      filter: (p) => p.route.startsWith('/band/') || p.route === '/about' || p.route === '/contact' || p.route === '/license'
    },
    {
      title: 'Archival Liner Notes & Rolling Sanctuary Fleet Logs',
      filter: (p) => p.route.startsWith('/discography/') || p.route.startsWith('/fleet/')
    },
    {
      title: 'Core Band Lore, CPI Origins, Friction & Ad Astra Voyage',
      filter: (p) => p.route.startsWith('/story') && !p.route.startsWith('/story/nine-figure-refusal')
    },
    {
      title: 'The Nine-Figure Refusal — Complete 19-Exhibit Forensic & Bankruptcy Dossier',
      filter: (p) => p.route.startsWith('/story/nine-figure-refusal')
    }
  ];

  return `
    <section class="section-block mt-5 pt-4 border-top border-secondary-subtle" aria-labelledby="complete-dossier-index-heading">
      <div class="section-header">
        <span class="eyebrow">Master Archival Index • 64 Verified Dossiers</span>
        <h2 id="complete-dossier-index-heading">Complete Stardust Engine Lore &amp; Forensic Exhibit Directory</h2>
        <p style="margin: 0; color: var(--text-secondary);">
          Every single biographical profile, liner-note story, CPI transit log, Ad Astra voyage entry, and bankruptcy exhibit ported 1:1 into the cosmic archive.
        </p>
      </div>
      ${groups
        .map((g) => {
          const items = portedPages.filter(g.filter);
          return `
            <div class="mb-4">
              <h3 class="h5 mb-3" style="color: var(--accent-gold);">${escapeHtml(g.title)} (${items.length})</h3>
              <div class="grid-3">
                ${items
                  .map(
                    (item) => `
                  <article class="card card-accent-cyan">
                    <div>
                      <div class="badge-row">
                        <span class="badge">${escapeHtml(item.route)}</span>
                      </div>
                      <h4 class="h6 fw-bold mb-2"><a href="${item.route}" style="text-decoration: none; color: var(--text-primary);">${escapeHtml(item.title)}</a></h4>
                      <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.85rem;">${escapeHtml(item.description)}</p>
                    </div>
                    <div>
                      <a href="${item.route}" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Open Dossier →</a>
                    </div>
                  </article>`
                  )
                  .join('\n')}
              </div>
            </div>`;
        })
        .join('\n')}
    </section>`;
}

function buildStardustSite() {
  const workspaceRoot = resolveWorkspaceRoot();
  const catalogPath = path.join(
    workspaceRoot,
    'raggiesoft-assets',
    'engine-room-records',
    'catalog.json'
  );
  const narrativesRoot = path.join(workspaceRoot, 'raggiesoft-narratives');
  const portedPagesPath = path.join(projectRoot, 'src', 'data', 'ported-pages.json');

  const catalog = fs.existsSync(catalogPath)
    ? JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
    : [];
  const stardustAlbums = catalog.filter((a) => a.artistSlug === 'the-stardust-engine');
  const portedPages = fs.existsSync(portedPagesPath)
    ? JSON.parse(fs.readFileSync(portedPagesPath, 'utf-8'))
    : [];

  const portedByRoute = new Map(portedPages.map((p) => [p.route, p]));
  const archiveIndexHtml = renderMasterArchiveDirectoryHtml(portedPages);

  fs.rmSync(distDir, { recursive: true, force: true });
  fs.rmSync(nitroPublicDir, { recursive: true, force: true });

  const cssContent = fs.readFileSync(path.join(projectRoot, 'src', 'styles', 'cosmic.css'), 'utf-8');
  const clientJsContent = buildCosmicClientJs();
  writeStaticOutput('assets/cosmic.css', cssContent);
  writeStaticOutput('assets/cosmic-client.js', clientJsContent);

  // Sync CSS & JS into raggiesoft-assets/stardust-engine/ for https://assets.raggiesoft.com/ delivery
  const cdnCssDir = path.join(workspaceRoot, 'raggiesoft-assets', 'stardust-engine', 'css');
  const cdnJsDir = path.join(workspaceRoot, 'raggiesoft-assets', 'stardust-engine', 'js');
  fs.mkdirSync(cdnCssDir, { recursive: true });
  fs.mkdirSync(cdnJsDir, { recursive: true });
  fs.writeFileSync(path.join(cdnCssDir, 'cosmic.css'), cssContent, 'utf-8');
  fs.writeFileSync(path.join(cdnJsDir, 'cosmic-client.js'), clientJsContent, 'utf-8');

  const masterCatalogPath = path.join(
    workspaceRoot,
    'raggiesoft-assets',
    'engine-room-records',
    'json',
    'master-catalog.json'
  );
  const masterCatalog = fs.existsSync(masterCatalogPath)
    ? JSON.parse(fs.readFileSync(masterCatalogPath, 'utf-8'))
    : [];
  const stardustTracks = Array.isArray(masterCatalog)
    ? masterCatalog.filter((t) => t.artistSlug === 'the-stardust-engine')
    : [];

  // 1. Primary Cosmic Overview Routes (augmented with deep archive directory links)
  writeStaticOutput('index.html', renderStardustHome(stardustAlbums));
  writeStaticOutput('band/index.html', renderBandMembersPage());
  writeStaticOutput('discography/index.html', renderDiscographyPage(stardustAlbums));
  writeStaticOutput(
    'lore/index.html',
    renderDeepLorePage().replace('</main>', `${archiveIndexHtml}\n    </main>`)
  );
  writeStaticOutput('fleet/index.html', renderFleetPage());
  writeStaticOutput('novel/index.html', renderNovelPage(narrativesRoot));
  writeStaticOutput(
    'dsp-verification/index.html',
    renderCosmicShell({
      title: 'DSP Identity & Copyright Verification | The Stardust Engine',
      description:
        'Official DSP artist profile claim and ISRC chain-of-custody verification for The Stardust Engine (Michael P. Ragsdale / Engine Room Records).',
      canonicalPath: '/dsp-verification',
      bodyHtml: `
        <section class="hero-card" aria-labelledby="stardust-dsp-heading">
          <span class="eyebrow">Official Artist Claim &amp; Chain-of-Custody Verification</span>
          <h1 id="stardust-dsp-heading">DSP Identity &amp; Copyright Verification: The Stardust Engine</h1>
          <p class="lead">
            <strong>Notice to Platform Verification Teams (DistroKid, Apple Music for Artists, Spotify for Artists, Amazon Music, YouTube Music):</strong>
            This official portal confirms that <strong>Michael P. Ragsdale</strong> (<code>mpragsdale@raggiesoft.com</code>) is the sole real-world human creator, songwriter, producer, copyright owner, and authorized claimant for <strong>The Stardust Engine</strong> (${stardustTracks.length} registered sound recordings under the <strong>Engine Room Records</strong> imprint).
          </p>
          <div style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-radius: 0.75rem; border: 1px solid rgba(255, 215, 0, 0.45); background: rgba(255, 215, 0, 0.08);">
            <h2 style="font-size: 1rem; margin: 0 0 0.4rem 0; color: var(--stardust-gold, #ffd700);">
              🛡️ Dual Timelines Policy (In-Universe Lore Dates vs. Real-World 2026 Production Dates)
            </h2>
            <p style="margin: 0; font-size: 0.92rem; line-height: 1.55;">
              <strong>The Stardust Engine</strong> is a multimedia Rock Opera concept project set between <strong>1986 and 2016</strong>. Historical years in album URLs and lore descriptions (such as <strong>2001</strong> for <em>Midnight Drivers</em> and <strong>2011</strong> for <em>Starfield Calibration</em>) represent fictional <strong>In-Universe Narrative Lore Eras</strong> (<code>schema:temporalCoverage</code>). <strong>100% of all sound recordings, lyrics, vocal melodies, and studio masters were created and produced in 2026</strong> (<code>schema:datePublished: 2026</code>) by <strong>Michael P. Ragsdale</strong> under commercial license, with zero third-party samples or stems.
            </p>
          </div>
          <div class="btn-row">
            <a href="https://engineroom.raggiesoft.com/dsp-verification?artist=the-stardust-engine" class="btn btn-primary">
              🏛️ Open Full Engine Room Records Master DSP Ledger (?artist=the-stardust-engine) →
            </a>
            <button type="button" class="btn btn-gold" onclick="window.print()">
              🖨️ Print / Save Official PDF Verification Dossier
            </button>
          </div>
        </section>

        <section class="section-block" aria-labelledby="horizon-line-verification-heading" style="border: 1px solid rgba(102, 252, 241, 0.4); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; background: rgba(11, 12, 16, 0.75);">
          <div class="section-header" style="margin-bottom: 1rem;">
            <span class="eyebrow">First-Party Remaster Chain of Custody • DistroKid Ref: Z0MB5RT4</span>
            <h2 id="horizon-line-verification-heading">Chain-of-Custody Verification: &ldquo;The Horizon Line&rdquo; (2001 Lore Original &amp; 2011 Lore Remaster)</h2>
            <p style="margin-top: 0.5rem;">
              Track 13 of <em>Starfield Calibration</em> (<strong>&ldquo;The Horizon Line&rdquo; — Cosmic Tidal Lock Mix</strong>, Catalog ID <code>ERR-001-2011-113</code>, Album UPC <code>700299965607</code>) is a 100% first-party studio remaster of Michael P. Ragsdale&rsquo;s own original song <strong>&ldquo;The Horizon Line&rdquo;</strong> from <em>Midnight Drivers</em> (Catalog ID <code>ERR-001-2001-105</code>, DistroKid ISRC <code>QZWFW2601360</code>, Album UPC <code>825324114857</code>), which was distributed via DistroKid on <strong>May 1, 2026</strong>—53 days prior to an unrelated third-party instrumental track of the same title uploaded by <code>coffeeandpop</code> on June 23, 2026 (UPC <code>882518230267</code>).
            </p>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Version / Mix</th>
                  <th scope="col">ERR-ID</th>
                  <th scope="col">ISRC</th>
                  <th scope="col">Album &amp; UPC</th>
                  <th scope="col">Lore Era vs. Real Release</th>
                  <th scope="col">Audio &amp; Lyrics Verification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Original Studio Master</strong><br><small>Track 5 — &ldquo;The Horizon Line&rdquo; (4:26)</small></td>
                  <td><code>ERR-001-2001-105</code></td>
                  <td><code>QZWFW2601360</code></td>
                  <td><em>Midnight Drivers</em><br><span class="badge">UPC: 825324114857</span></td>
                  <td>Lore Era: <strong>2001</strong><br>Real Release: <strong>2026-05-01</strong></td>
                  <td>
                    <a href="https://music.raggiesoft.com/the-stardust-engine/2001-midnight-drivers/?track=1-05-the-horizon-line" class="btn btn-primary" style="padding:0.3rem 0.65rem;font-size:0.78rem;">🎧 Listen &amp; View Lyrics (2001 Original) ↗</a>
                  </td>
                </tr>
                <tr>
                  <td><strong>Cosmic Tidal Lock Mix (Remaster)</strong><br><small>Track 13 — &ldquo;The Horizon Line&rdquo; (4:01)</small></td>
                  <td><code>ERR-001-2011-113</code></td>
                  <td><em>Pending Assignment (Ref: Z0MB5RT4)</em></td>
                  <td><em>Starfield Calibration</em><br><span class="badge">UPC: 700299965607</span></td>
                  <td>Lore Era: <strong>2011</strong><br>Real Production: <strong>2026</strong></td>
                  <td>
                    <a href="https://music.raggiesoft.com/the-stardust-engine/2011-starfield-calibration/?track=1-13-the-horizon-line" class="btn btn-gold" style="padding:0.3rem 0.65rem;font-size:0.78rem;">🎧 Listen &amp; View Lyrics (2011 Remaster) ↗</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="section-block" aria-labelledby="stardust-isrc-heading">
          <div class="section-header">
            <span class="eyebrow">Registered Works • DistroKid &amp; Suno Commercial Pro Clearance</span>
            <h2 id="stardust-isrc-heading">The Stardust Engine Master ISRC &amp; UPC Registry (${stardustTracks.length} Tracks)</h2>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">ERR-ID</th>
                  <th scope="col">ISRC</th>
                  <th scope="col">Track Title</th>
                  <th scope="col">Album &amp; UPC</th>
                  <th scope="col">Lore / Real Date</th>
                  <th scope="col">Verification Links</th>
                </tr>
              </thead>
              <tbody>
                ${stardustTracks
                  .map(
                    (t) => `
                  <tr>
                    <td><code>${escapeHtml(t.err_id || '')}</code></td>
                    <td><code>${escapeHtml(t.isrc || 'Pending')}</code></td>
                    <td><strong>${escapeHtml(t.trackTitle || '')}</strong></td>
                    <td>${escapeHtml(t.albumTitle || '')} <span class="badge">${escapeHtml(t.albumUPC || '')}</span></td>
                    <td>Lore: ${escapeHtml(String(t.loreYear || ''))}<br><small>Real: ${escapeHtml(t.realReleaseDate || '2026')}</small></td>
                    <td style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                      <a href="https://music.raggiesoft.com/the-stardust-engine/${encodeURIComponent(t.albumSlug || '')}/?track=${encodeURIComponent(t.trackSlug || '')}" class="btn" style="padding:0.25rem 0.55rem;font-size:0.75rem;">🎧 Audio ↗</a>
                      <a href="https://engineroom.raggiesoft.com/dsp-verification?artist=the-stardust-engine&album=${encodeURIComponent(t.albumSlug || '')}&track=${encodeURIComponent(t.trackSlug || '')}" class="btn" style="padding:0.25rem 0.55rem;font-size:0.75rem;">📄 Affidavit ↗</a>
                    </td>
                  </tr>`
                  )
                  .join('\n')}
              </tbody>
            </table>
          </div>
        </section>`
    })
  );

  // 2. Render all ported routes from src/data/ported-pages.json
  let portedRenderedCount = 0;
  for (const page of portedPages) {
    if (page.route === '/' || page.route === '/band' || page.route === '/discography') {
      // Also preserve raw legacy overview pages under /archive-overview, /band/overview, /discography/overview
      const altRoute = page.route === '/' ? '/archive-overview' : `${page.route}/overview`;
      const altRelFile = `${altRoute.slice(1)}/index.html`;
      writeStaticOutput(
        altRelFile,
        renderCosmicShell({
          title: page.title,
          description: page.description,
          canonicalPath: altRoute,
          ogImage: page.ogImage || undefined,
          bodyHtml: page.html
        })
      );
      portedRenderedCount++;
      continue;
    }

    const relFile = `${page.route.slice(1)}/index.html`;
    const bodyContent =
      page.route === '/story' ? `${page.html}\n${archiveIndexHtml}` : page.html;

    writeStaticOutput(
      relFile,
      renderCosmicShell({
        title: page.title,
        description: page.description,
        canonicalPath: page.route,
        ogImage: page.ogImage || undefined,
        bodyHtml: bodyContent
      })
    );
    portedRenderedCount++;
  }

  console.log(
    `✅ Built stardust.raggiesoft.com static bundle in ${distDir} and ${nitroPublicDir} (${stardustAlbums.length} Stardust Engine albums + ${portedRenderedCount} deep lore dossiers compiled).`
  );
}

buildStardustSite();

if (process.argv.includes('--serve')) {
  const port = Number(process.env.PORT || 3005);
  const server = http.createServer((req, res) => {
    const urlPath = (req.url || '/').split('?')[0];
    let filePath = path.join(distDir, urlPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!path.extname(filePath) && fs.existsSync(`${filePath}/index.html`)) {
      filePath = `${filePath}/index.html`;
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const mime =
      ext === '.css'
        ? 'text/css; charset=utf-8'
        : ext === '.js'
          ? 'application/javascript; charset=utf-8'
          : 'text/html; charset=utf-8';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
  });
  server.listen(port, () => {
    console.log(`🚀 Stardust Engine preview server running at http://localhost:${port}`);
  });
}

