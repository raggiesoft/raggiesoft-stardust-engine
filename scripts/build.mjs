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
 * Implements Modern Web Guidance dark-mode-toggle (Exoplanet Light vs. Deep Space Dark)
 * and strict prefers-reduced-motion + manual Pause Cosmic Motion controls.
 */
(function () {
  var meta = document.querySelector('meta[name="color-scheme"]');
  var themeBtn = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-toggle-label');
  var motionBtn = document.getElementById('motion-toggle');
  var motionLabel = document.getElementById('motion-toggle-label');

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
    var stored = null;
    try {
      stored = localStorage.getItem('color-scheme');
    } catch (e) {}
    if (stored === 'light' || stored === 'dark') {
      themeLabel.textContent = current === 'dark' ? '🌌 Deep Space (Pinned)' : '🪐 Exoplanet Day (Pinned)';
    } else {
      themeLabel.textContent = current === 'dark' ? '🌌 System (Deep Space)' : '🪐 System (Exoplanet)';
    }
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
    motionLabel.textContent = paused ? '▶ Resume Motion' : '⏸ Pause Motion';
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
  writeStaticOutput('assets/cosmic.css', cssContent);
  writeStaticOutput('assets/cosmic-client.js', buildCosmicClientJs());

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

