/**
 * @license MIT
 * ============================================================================
 * src/renderers/pages-fleet-and-novel.mjs — The Stardust Engine
 * ============================================================================
 * Architectural Overview:
 * Renders:
 * 1. `renderFleetPage` (`/fleet`):
 *    - Detailed visual & technical showcase of the band's barrier-free coaches:
 *      - 2002 Sainte-Claire 45H3 ("The Iron Horse") — 45-foot high-deck stainless
 *        steel cruiser with mid-ship hydraulic wheelchair lift (60" vertical rise).
 *      - 2004 Prairie Coachworks RLFD30 (Serial #001 / Fleet Unit #1985) — 30-foot
 *        low-floor shuttle with front-door flip-out ADA ramp on Progress Street.
 *      - Blue Ridge Transit low-floor campus buses (featured in Before the Distance:
 *        The Story of John & Erin).
 * 2. `renderNovelPage` (`/novel`):
 *    - Cosmic Novel Reader wrapping the Markdown/JSON chapters of
 *      `raggiesoft-narratives/books/stardust-engine` and `raggiesoft-narratives/books/erin`
 *      inside the Exoplanet / Deep Space reading environment, with direct links to
 *      `https://books.raggiesoft.com/books/stardust-engine` and `https://books.raggiesoft.com/books/erin`.
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, renderCosmicShell } from './shell.mjs';

/**
 * Simple Markdown-to-HTML converter for novel scenes (strips YAML frontmatter).
 * @param {string} md
 * @returns {string}
 */
function renderMarkdownScene(md) {
  const withoutFrontmatter = String(md || '')
    .replace(/\r\n/g, '\n')
    .replace(/^---[\s\S]*?---\n*/, '');

  const blocks = withoutFrontmatter
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      if (block.startsWith('### ')) {
        return `<h4>${escapeHtml(block.slice(4))}</h4>`;
      }
      if (block.startsWith('## ')) {
        return `<h3>${escapeHtml(block.slice(3))}</h3>`;
      }
      if (block.startsWith('# ')) {
        return `<h3>${escapeHtml(block.slice(2))}</h3>`;
      }
      if (block === '---' || block === '***') {
        return `<hr style="border: 0; border-top: 1px solid var(--border-strong); margin: 1.5rem 0;" />`;
      }
      let html = escapeHtml(block);
      html = html.replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return `<p>${html}</p>`;
    })
    .join('\n');
}

/**
 * Renders `/fleet` (The Rolling Sanctuary Fleet).
 * @returns {string}
 */
export function renderFleetPage() {
  const bodyHtml = `
    <section class="hero-card" aria-labelledby="fleet-heading">
      <span class="eyebrow">Stardust Strategic Assets, LLC • Class A CDL Family Fleet</span>
      <h1 id="fleet-heading">The Rolling Sanctuary Fleet</h1>
      <p class="lead">
        After the December 1990 I-81 black-ice tour bus crash left Ryan O'Connell paralyzed at T10, the family vowed that no outside contractor would ever control their safety or accessibility again. <strong>Tyler Wright, Evan Wright, and Holly O'Connell</strong> all earned their <strong>Class A Commercial Driver's Licenses (with Passenger and Airbrake endorsements)</strong> to personally pilot the band's custom barrier-free fleet.
      </p>
    </section>

    <section class="section-block" aria-labelledby="iron-horse-heading">
      <div class="section-header">
        <span class="eyebrow">Interstate Touring Flagship • Forged in Sainte-Claire, Québec</span>
        <h2 id="iron-horse-heading">1. 2002 Sainte-Claire 45H3 — &ldquo;The Iron Horse&rdquo;</h2>
      </div>
      <div class="card card-accent-gold">
        <img
          src="https://assets.raggiesoft.com/stardust-engine/images/fleet/2002-sainte-claire-45h3-iron-horse.jpg"
          alt="2002 Sainte-Claire 45H3 brushed stainless steel motorcoach with mid-ship hydraulic wheelchair lift deployed"
          class="fleet-photo"
          loading="lazy"
        />
        <div class="grid-2">
          <div>
            <h3>60-Inch Mid-Ship Hydraulic Wheelchair Platform Lift</h3>
            <p style="font-size: 0.92rem; color: var(--text-secondary);">
              Inspired by the high-deck tri-axle motorcoaches built in Sainte-Claire, Québec, <strong>The Iron Horse</strong> is an unpainted brushed stainless-steel monolith engineered as a rolling zero-gravity sanctuary. Because its main cabin deck sits 60 inches above the pavement over massive underfloor equipment bays, a custom mid-ship vertical accessibility door houses a heavy-duty hydraulic platform lift that raises Ryan's manual wheelchair effortlessly into the main lounge.
            </p>
          </div>
          <div>
            <h3>Onboard Sanctuary &amp; Studio Telemetry</h3>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); padding-left: 1.25rem;">
              <li><strong>Widened 36-Inch Center Aisle:</strong> Zero-threshold turning radius from the front co-pilot chairs through the galley and rear stateroom.</li>
              <li><strong>Acoustic Isolation Bunks:</strong> Whisper-quiet sensory-safe sleeper bunks and an onboard DAW node linked to Cassidy's synth rack.</li>
              <li><strong>Featured Release:</strong> <a href="https://music.raggiesoft.com/the-stardust-engine/2001-midnight-drivers"><em>Midnight Drivers (2001)</em></a> &amp; <a href="https://music.raggiesoft.com/the-stardust-engine/2003-mile-marker-98"><em>Mile Marker 98 (2003)</em></a>.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block" aria-labelledby="rlfd30-heading">
      <div class="section-header">
        <span class="eyebrow">Launch Customer Serial #001 • Blacksburg &amp; Campus Shuttle</span>
        <h2 id="rlfd30-heading">2. 2004 Prairie Coachworks RLFD30 (Progress Street Shuttle)</h2>
      </div>
      <div class="card card-accent-cyan">
        <img
          src="https://assets.raggiesoft.com/stardust-engine/images/fleet/2004-prairie-coachworks-rlfd30.jpg"
          alt="2004 Prairie Coachworks RLFD30 30-foot low-floor shuttle bus parked on Progress Street at dusk with front-door ADA ramp deployed"
          class="fleet-photo"
          loading="lazy"
        />
        <div class="grid-2">
          <div>
            <h3>Front-Door-Only Low-Floor Architecture &amp; Kneeling Ramp</h3>
            <p style="font-size: 0.92rem; color: var(--text-secondary);">
              When navigating narrow campus streets in Blacksburg, Virginia around <strong>Progress Street</strong> and CPI, a 45-foot interstate motorcoach is impractical. In 2004, The Stardust Engine became the launch customer for <strong>Serial #001 of the Prairie Coachworks RLFD30</strong>—a 30-foot Restyled Low-Floor Diesel shuttle ordered in a custom <strong>front-door-only</strong> executive layout (eliminating the rear transit exit door to maximize interior lounge seating and wheelchair securement space).
            </p>
          </div>
          <div>
            <h3>Progress Street Album Cover &amp; Luminator LED Matrix</h3>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); padding-left: 1.25rem;">
              <li><strong>Front ADA Ramp:</strong> Kneeling air suspension + flip-out aluminum low-floor wheelchair ramp deployed directly from the front boarding door.</li>
              <li><strong>Luminator Amber LED Signs:</strong> Overhead front destination sign reading <code>PROGRESS STREET</code> and side boarding sign reading <code>THE STARDUST ENGINE</code>.</li>
              <li><strong>Featured Release:</strong> Immortalized on the cover of <a href="https://music.raggiesoft.com/the-stardust-engine/2004-progress-street"><em>Progress Street (2004)</em></a>.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block" aria-labelledby="brt-heading">
      <div class="section-header">
        <span class="eyebrow">CPI Campus Transit • Before the Distance: The Story of John &amp; Erin</span>
        <h2 id="brt-heading">3. Blue Ridge Transit (CPI Campus Low-Floor Fleet)</h2>
      </div>
      <div class="callout-box card-accent-emerald">
        <p style="margin: 0 0 0.75rem; font-size: 0.94rem;">
          In the companion story and curated soundtrack <a href="https://music.raggiesoft.com/playlists/john-and-erin"><strong>Before the Distance: The Story of John &amp; Erin</strong></a> (portrayed by Ryan and Cassidy O'Connell), fraternal twins John and Erin navigate the steep limestone hills of Commonwealth Polytechnic Institute (CPI) in motorized power wheelchairs—boarding a <strong>Blue Ridge Transit</strong> low-floor campus bus via its <strong>front-door ADA wheelchair ramp</strong> in the pouring autumn rain.
        </p>
        <div class="btn-row">
          <a href="https://music.raggiesoft.com/playlists/john-and-erin" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            🎧 Stream John &amp; Erin Playlist on music.raggiesoft.com ↗
          </a>
          <a href="https://books.raggiesoft.com/books/erin" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
            📖 Read Before the Distance on Book Reader ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return renderCosmicShell({
    title: 'Rolling Sanctuary Fleet | The Stardust Engine',
    description: 'Explore The Stardust Engine\'s barrier-free coaches: the 2002 Sainte-Claire 45H3 (The Iron Horse) and 2004 Prairie Coachworks RLFD30.',
    canonicalPath: '/fleet',
    ogImage: 'https://assets.raggiesoft.com/stardust-engine/images/fleet/2004-prairie-coachworks-rlfd30.jpg',
    bodyHtml
  });
}

/**
 * Loads chapters from `raggiesoft-narratives/books/stardust-engine` and `raggiesoft-narratives/books/erin`.
 * @param {string} narrativesRoot
 * @returns {{ stardustChapters: Array<{ title: string, subtitle: string, html: string, readerUrl: string }>, erinChapters: Array<{ title: string, subtitle: string, html: string, readerUrl: string }> }}
 */
export function loadCosmicNovels(narrativesRoot) {
  const stardustChapters = [];
  const erinChapters = [];

  // 1. Load The Stardust Engine (e001 - e005)
  const seDir = path.join(narrativesRoot, 'books', 'stardust-engine');
  if (fs.existsSync(seDir)) {
    const landingPath = path.join(seDir, 'landing.md');
    if (fs.existsSync(landingPath)) {
      stardustChapters.push({
        title: 'Prologue & Archive Overview',
        subtitle: 'The Stardust Engine: The Story of the Iron Five',
        html: renderMarkdownScene(fs.readFileSync(landingPath, 'utf-8')),
        readerUrl: 'https://books.raggiesoft.com/books/stardust-engine'
      });
    }
    for (const era of ['e001', 'e002', 'e003', 'e004', 'e005', 'e006']) {
      const eraJsonPath = path.join(seDir, era, 'ovab.json');
      const chapDir = path.join(seDir, era, 'c001');
      const chapJsonPath = path.join(chapDir, 'ovab.json');
      let eraTitle = era.toUpperCase();
      let chapTitle = 'Chapter 1';
      let summary = '';
      if (fs.existsSync(eraJsonPath)) {
        try {
          const d = JSON.parse(fs.readFileSync(eraJsonPath, 'utf-8'));
          eraTitle = d.title || eraTitle;
          summary = d.description || d.summary || '';
        } catch {}
      }
      if (fs.existsSync(chapJsonPath)) {
        try {
          const c = JSON.parse(fs.readFileSync(chapJsonPath, 'utf-8'));
          chapTitle = c.title || chapTitle;
          if (!summary) summary = c.description || c.summary || '';
        } catch {}
      }
      let sceneHtml = '';
      if (fs.existsSync(chapDir)) {
        const mdFiles = fs
          .readdirSync(chapDir)
          .filter((f) => f.endsWith('.md'))
          .sort();
        if (mdFiles.length > 0) {
          sceneHtml = mdFiles
            .map((f) => renderMarkdownScene(fs.readFileSync(path.join(chapDir, f), 'utf-8')))
            .join('<hr style="border: 0; border-top: 1px solid var(--border-strong); margin: 1.5rem 0;" />');
        }
      }
      if (!sceneHtml && summary) {
        sceneHtml = `<p>${escapeHtml(summary)}</p>`;
      }
      stardustChapters.push({
        title: `${eraTitle} — ${chapTitle}`,
        subtitle: summary,
        html: sceneHtml,
        readerUrl: 'https://books.raggiesoft.com/stardust-engine'
      });
    }
  }

  // 2. Load Before the Distance: The Story of John & Erin (e001/c001 - c004)
  const erinDir = path.join(narrativesRoot, 'books', 'erin', 'e001');
  if (fs.existsSync(erinDir)) {
    for (const chap of ['c001', 'c002', 'c003', 'c004']) {
      const cDir = path.join(erinDir, chap);
      if (!fs.existsSync(cDir)) continue;
      let chapTitle = chap.toUpperCase();
      let chapSub = '';
      const ovabPath = path.join(cDir, 'ovab.json');
      if (fs.existsSync(ovabPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(ovabPath, 'utf-8'));
          chapTitle = meta.title || chapTitle;
          chapSub = meta.subtitle || meta.description || '';
        } catch {}
      }
      const scenes = fs
        .readdirSync(cDir)
        .filter((f) => f.endsWith('.md'))
        .sort()
        .map((f) => renderMarkdownScene(fs.readFileSync(path.join(cDir, f), 'utf-8')))
        .join('<hr style="border: 0; border-top: 1px solid var(--border-strong); margin: 1.5rem 0;" />');

      erinChapters.push({
        title: chapTitle,
        subtitle: chapSub,
        html: scenes,
        readerUrl: `https://books.raggiesoft.com/books/erin/e001/${chap}`
      });
    }
  }

  return { stardustChapters, erinChapters };
}

/**
 * Renders `/novel` (The Cosmic Novel Reader).
 * @param {string} narrativesRoot
 * @returns {string}
 */
export function renderNovelPage(narrativesRoot) {
  const { stardustChapters, erinChapters } = loadCosmicNovels(narrativesRoot);

  const seHtml = stardustChapters
    .map(
      (ch) => `
      <article class="novel-chapter">
        <div class="badge-row">
          <span class="badge">The Stardust Engine Novel Archive</span>
        </div>
        <h3>${escapeHtml(ch.title)}</h3>
        ${ch.subtitle ? `<p style="font-size: 0.88rem; color: var(--accent-gold); font-weight: 700;">${escapeHtml(ch.subtitle)}</p>` : ''}
        <div class="novel-prose">
          ${ch.html}
        </div>
        <div class="btn-row">
          <a href="${escapeHtml(ch.readerUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            📚 Open Full Interactive Edition on RaggieSoft Book Reader ↗
          </a>
        </div>
      </article>`
    )
    .join('\n');

  const erinHtml = erinChapters
    .map(
      (ch) => `
      <article class="novel-chapter">
        <div class="badge-row">
          <span class="badge">Before the Distance: The Story of John &amp; Erin</span>
        </div>
        <h3>${escapeHtml(ch.title)}</h3>
        ${ch.subtitle ? `<p style="font-size: 0.88rem; color: var(--accent-cyan); font-weight: 700;">${escapeHtml(ch.subtitle)}</p>` : ''}
        <div class="novel-prose">
          ${ch.html}
        </div>
        <div class="btn-row">
          <a href="${escapeHtml(ch.readerUrl)}" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
            📖 Read Chapter in RaggieSoft Book Reader ↗
          </a>
          <a href="https://music.raggiesoft.com/playlists/john-and-erin" class="btn" target="_blank" rel="noopener noreferrer">
            🎧 Stream Companion Soundtrack ↗
          </a>
        </div>
      </article>`
    )
    .join('\n');

  const bodyHtml = `
    <section class="hero-card" aria-labelledby="novel-heading">
      <span class="eyebrow">Cosmic Literary Sanctuary • Synchronized with books.raggiesoft.com</span>
      <h1 id="novel-heading">The Stardust Engine Cosmic Novel Reader</h1>
      <p class="lead">
        Because our novels are authored in pure flat-file Markdown and JSON inside <code>/raggiesoft-narratives</code>, you can read both <strong>The Stardust Engine: The Story of the Iron Five</strong> and <strong>Before the Distance: The Story of John &amp; Erin</strong> right here inside our Exoplanet / Deep Space environment—or open them in the full <a href="https://books.raggiesoft.com">RaggieSoft Book Reader (books.raggiesoft.com)</a>.
      </p>
      <div class="btn-row">
        <a href="https://books.raggiesoft.com/books/stardust-engine" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          📚 The Stardust Engine on books.raggiesoft.com ↗
        </a>
        <a href="https://books.raggiesoft.com/books/erin" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
          📖 Before the Distance (John &amp; Erin) on books.raggiesoft.com ↗
        </a>
        <a href="#book-erin" class="btn">
          Jump to Before the Distance (4 Chapters) ↓
        </a>
      </div>
    </section>

    <section id="book-stardust" class="section-block" aria-labelledby="book-se-heading">
      <div class="section-header">
        <span class="eyebrow">Volume 01 • The Story of the Iron Five</span>
        <h2 id="book-se-heading">Book I: The Stardust Engine (Narrative Eras &amp; Excerpts)</h2>
      </div>
      ${seHtml}
    </section>

    <section id="book-erin" class="section-block" aria-labelledby="book-erin-heading">
      <div class="section-header">
        <span class="eyebrow">Volume 02 • Complete 4-Chapter Companion Novel</span>
        <h2 id="book-erin-heading">Book II: Before the Distance — The Story of John &amp; Erin</h2>
        <p style="margin: 0; color: var(--text-secondary);">
          Portrayed by Ryan and Cassidy O'Connell: the complete four-chapter narrative of fraternal twins John and Erin navigating Commonwealth Polytechnic Institute (CPI) in motorized power wheelchairs.
        </p>
      </div>
      ${erinHtml}
    </section>
  `;

  return renderCosmicShell({
    title: 'Cosmic Novel Reader | The Stardust Engine',
    description: 'Read The Stardust Engine and Before the Distance (John & Erin) wrapped in a cosmic environment, linked with books.raggiesoft.com.',
    canonicalPath: '/novel',
    bodyHtml
  });
}

