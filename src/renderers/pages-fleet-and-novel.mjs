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
 * Simple Markdown-to-HTML converter for novel scenes (strips YAML frontmatter
 * and supports headings, blockquotes, bullet lists, <aac>, and <sms> tags).
 * @param {string} md
 * @returns {string}
 */
function formatInlineMarkdown(raw) {
  let html = escapeHtml(raw);
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
}

function renderMarkdownScene(md) {
  const normalized = String(md || '').replace(/\r\n/g, '\n');
  const fmMatch = normalized.match(/^---\n([\s\S]*?)\n---\n*/);
  let galleryHtml = '';

  if (fmMatch) {
    const fm = fmMatch[1];
    const imgBlockMatch = fm.match(/^image:\n((?:\s+-\s+"[^"]+"\n?)+)/m);
    const altBlockMatch = fm.match(/^image_alt:\n((?:\s+-\s+"[^"]+"\n?)+)/m);
    if (imgBlockMatch) {
      const imgs = [...imgBlockMatch[1].matchAll(/-\s+"([^"]+)"/g)].map((m) => m[1]);
      const alts = altBlockMatch
        ? [...altBlockMatch[1].matchAll(/-\s+"([^"]+)"/g)].map((m) => m[1])
        : [];
      if (imgs.length > 0) {
        const figures = imgs
          .map((relPath, idx) => {
            const cleanRel = relPath
              .replace(/^\{\{CDN\}\}\/?/, '')
              .replace(/^https?:\/\/assets\.raggiesoft\.com\/?/, '')
              .replace(/^\/+/, '');
            const fullUrl = relPath.startsWith('http')
              ? relPath
              : cleanRel.startsWith('raggiesoft-books/') || cleanRel.startsWith('engine-room-records/') || cleanRel.startsWith('stardust-engine/images/')
                ? `https://assets.raggiesoft.com/${cleanRel}`
                : `https://assets.raggiesoft.com/raggiesoft-books/images/${cleanRel}`;
            const altText = alts[idx] || 'Scene illustration from The Stardust Engine novel';
            return `
              <figure style="margin: 0;">
                <img
                  src="${escapeHtml(fullUrl)}"
                  alt="${escapeHtml(altText)}"
                  loading="lazy"
                  style="width: 100%; height: auto; border-radius: 0.75rem; border: 1px solid var(--border-strong); display: block;"
                />
              </figure>
            `;
          })
          .join('');
        galleryHtml = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">${figures}</div>\n`;
      }
    }
  }

  const withoutFrontmatter = normalized.replace(/^---[\s\S]*?---\n*/, '');

  const blocks = withoutFrontmatter
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const renderedBlocks = blocks
    .map((block) => {
      if (block.startsWith('### ')) {
        return `<h4>${formatInlineMarkdown(block.slice(4))}</h4>`;
      }
      if (block.startsWith('## ')) {
        return `<h3>${formatInlineMarkdown(block.slice(3))}</h3>`;
      }
      if (block.startsWith('# ')) {
        return `<h3>${formatInlineMarkdown(block.slice(2))}</h3>`;
      }
      if (block === '---' || block === '***') {
        return `<hr style="border: 0; border-top: 1px solid var(--border-strong); margin: 1.5rem 0;" />`;
      }
      if (block.startsWith('<aac>') && block.endsWith('</aac>')) {
        const inner = block.slice(5, -6).trim();
        return `<div class="callout-box card-accent-cyan" style="margin: 0.85rem 0; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.92rem;"><strong>📟 AAC (mPad Mini):</strong> ${formatInlineMarkdown(inner)}</div>`;
      }
      if (block.startsWith('<sms>') && block.endsWith('</sms>')) {
        const inner = block.slice(5, -6).trim();
        return `<div class="callout-box card-accent-gold" style="margin: 0.85rem 0; padding: 0.75rem 1rem; font-family: monospace; font-size: 0.9rem;"><strong>📱 SMS:</strong> ${formatInlineMarkdown(inner)}</div>`;
      }
      if (block.startsWith('>')) {
        const quoteLines = block
          .split('\n')
          .map((line) => line.replace(/^>\s?/, ''))
          .map((line) => {
            const hasBr = line.endsWith('<br>');
            const cleanLine = hasBr ? line.slice(0, -4) : line;
            return formatInlineMarkdown(cleanLine) + (hasBr ? '<br />' : '');
          })
          .join('\n');
        return `<blockquote style="border-left: 3px solid var(--accent-gold); padding: 0.5rem 1rem; margin: 1rem 0; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 0 0.5rem 0.5rem 0;">${quoteLines}</blockquote>`;
      }
      if (block.startsWith('* ') || block.startsWith('- ')) {
        const items = block
          .split('\n')
          .map((l) => l.replace(/^[*-]\s+/, '').trim())
          .filter(Boolean)
          .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
          .join('');
        return `<ul style="padding-left: 1.25rem; margin: 0.75rem 0;">${items}</ul>`;
      }
      return `<p>${formatInlineMarkdown(block)}</p>`;
    })
    .join('\n');

  return galleryHtml + renderedBlocks;
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
        <span class="eyebrow">Launch Customer Serial #001 (2004) &amp; 2015 Successor • Blacksburg &amp; Campus Shuttles</span>
        <h2 id="rlfd30-heading">2. 2004 &amp; 2015 Prairie Coachworks RLFD30 (Progress Street Shuttles)</h2>
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
            <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 0;">
              <strong>The 2015 Replacement Coach:</strong> When the band returned from hiatus for 2015's <a href="https://music.raggiesoft.com/the-stardust-engine/2015-reignition"><em>Reignition</em></a> and completed the 2015 Delaware corporate restructure into <strong>Stardust Strategic Assets, LLC</strong>, the family purchased a <strong>brand-new 2015 Prairie Coachworks RLFD30</strong> in the same bespoke front-door-only executive spec as their active Blacksburg/CPI shuttle (while preserving the historic 2004 Launch Customer <code>Serial #001</code> coach in climate-controlled storage at Stardust Studios).
            </p>
          </div>
          <div>
            <h3>Progress Street Album Cover &amp; Amber LED Matrix</h3>
            <ul style="font-size: 0.9rem; color: var(--text-secondary); padding-left: 1.25rem;">
              <li><strong>Front ADA Ramp:</strong> Kneeling air suspension + 5-second flip-out aluminum low-floor wheelchair ramp deployed directly from the front boarding door.</li>
              <li><strong>Amber LED Destination Signs:</strong> Overhead front destination sign reading <code>PROGRESS STREET</code> and side boarding sign reading <code>THE STARDUST ENGINE</code>.</li>
              <li><strong>Featured Releases:</strong> The 2004 <code>Serial #001</code> coach is immortalized on the cover of <a href="https://music.raggiesoft.com/the-stardust-engine/2004-progress-street"><em>Progress Street (2004)</em></a>; its 2015 successor carries the family home from The Crucible after <a href="https://music.raggiesoft.com/the-stardust-engine/2016-live-at-the-crucible"><em>Live at the Crucible (2016)</em></a>.</li>
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
          <a href="https://books.raggiesoft.com/erin" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
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
 * Loads books and chapters from `raggiesoft-narratives/books/stardust-engine` and `raggiesoft-narratives/books/erin`.
 * @param {string} narrativesRoot
 * @returns {{ stardustBooks: Array<{ id: string, title: string, description: string, readerUrl: string, chapters: Array<{ id: string, title: string, html: string }> }>, stardustChapters: Array<{ title: string, subtitle: string, html: string, readerUrl: string }>, erinChapters: Array<{ title: string, subtitle: string, html: string, readerUrl: string }> }}
 */
export function loadCosmicNovels(narrativesRoot) {
  const stardustBooks = [];
  const stardustChapters = [];
  const erinChapters = [];

  // 1. Load The Stardust Engine (e001 - e007)
  const seEraReaderUrls = {
    e001: 'https://books.raggiesoft.com/stardust-engine',
    e002: 'https://books.raggiesoft.com/stardust-engine',
    e003: 'https://books.raggiesoft.com/stardust-engine',
    e004: 'https://books.raggiesoft.com/stardust-engine',
    e005: 'https://books.raggiesoft.com/stardust-engine',
    e006: 'https://books.raggiesoft.com/stardust-engine',
    e007: 'https://books.raggiesoft.com/stardust-engine'
  };

  const seDir = path.join(narrativesRoot, 'books', 'stardust-engine');
  if (fs.existsSync(seDir)) {
    const eraDirs = fs
      .readdirSync(seDir)
      .filter((d) => /^e\d+$/.test(d) && fs.statSync(path.join(seDir, d)).isDirectory())
      .sort();

    for (const era of eraDirs) {
      const eraPath = path.join(seDir, era);
      const eraJsonPath = path.join(eraPath, 'ovab.json');
      let eraTitle = era.toUpperCase();
      let summary = '';
      if (fs.existsSync(eraJsonPath)) {
        try {
          const d = JSON.parse(fs.readFileSync(eraJsonPath, 'utf-8'));
          eraTitle = d.title || eraTitle;
          summary = d.description || d.summary || '';
        } catch {}
      }

      const chapDirs = fs
        .readdirSync(eraPath)
        .filter((c) => /^c\d+$/.test(c) && fs.statSync(path.join(eraPath, c)).isDirectory())
        .sort();

      const chapters = [];
      for (const chap of chapDirs) {
        const chapDir = path.join(eraPath, chap);
        const chapJsonPath = path.join(chapDir, 'ovab.json');
        let chapTitle = chap.toUpperCase();
        if (fs.existsSync(chapJsonPath)) {
          try {
            const c = JSON.parse(fs.readFileSync(chapJsonPath, 'utf-8'));
            chapTitle = c.title || chapTitle;
          } catch {}
        }
        const mdFiles = fs
          .readdirSync(chapDir)
          .filter((f) => f.endsWith('.md'))
          .sort();
        const sceneHtml = mdFiles
          .map((f) => renderMarkdownScene(fs.readFileSync(path.join(chapDir, f), 'utf-8')))
          .join('<hr style="border: 0; border-top: 1px solid var(--border-strong); margin: 1.5rem 0;" />');

        chapters.push({
          id: `${era}-${chap}`,
          title: chapTitle,
          html: sceneHtml
        });

        stardustChapters.push({
          title: `${eraTitle} — ${chapTitle}`,
          subtitle: summary,
          html: sceneHtml,
          readerUrl: seEraReaderUrls[era] || 'https://books.raggiesoft.com/stardust-engine'
        });
      }

      stardustBooks.push({
        id: era,
        title: eraTitle,
        description: summary,
        readerUrl: seEraReaderUrls[era] || 'https://books.raggiesoft.com/stardust-engine',
        chapters
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
        readerUrl: 'https://books.raggiesoft.com/erin'
      });
    }
  }

  return { stardustBooks, stardustChapters, erinChapters };
}

/**
 * Renders `/novel` (The Cosmic Novel Reader).
 * @param {string} narrativesRoot
 * @returns {string}
 */
export function renderNovelPage(narrativesRoot) {
  const { stardustBooks, erinChapters } = loadCosmicNovels(narrativesRoot);

  const tocHtml = stardustBooks
    .map(
      (book, idx) => `
      <div class="card" style="padding: 1rem 1.15rem;">
        <span class="badge" style="margin-bottom: 0.35rem;">Book 0${idx + 1} • Ryan O'Connell POV</span>
        <h3 style="font-size: 1.02rem; margin: 0 0 0.35rem;">
          <a href="#book-${escapeHtml(book.id)}" style="color: var(--text-primary); text-decoration: none;">${escapeHtml(book.title)}</a>
        </h3>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0 0 0.65rem;">
          ${escapeHtml(book.description)}
        </p>
        <ul style="font-size: 0.84rem; color: var(--text-secondary); padding-left: 1.15rem; margin: 0;">
          ${book.chapters
            .map(
              (ch) =>
                `<li><a href="#chap-${escapeHtml(ch.id)}">${escapeHtml(ch.title)}</a></li>`
            )
            .join('')}
        </ul>
      </div>`
    )
    .join('\n');

  const seHtml = stardustBooks
    .map(
      (book, bIdx) => `
      <section id="book-${escapeHtml(book.id)}" class="novel-chapter" style="margin-bottom: 2rem;">
        <div class="badge-row">
          <span class="badge">Book 0${bIdx + 1} • Third-Person Limited (Ryan O'Connell)</span>
        </div>
        <h3 style="font-size: 1.35rem; margin-bottom: 0.35rem;">${escapeHtml(book.title)}</h3>
        ${book.description ? `<p style="font-size: 0.92rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 1.15rem;">${escapeHtml(book.description)}</p>` : ''}
        <div style="display: flex; flex-direction: column; gap: 0.9rem;">
          ${book.chapters
            .map(
              (ch, cIdx) => `
              <details id="chap-${escapeHtml(ch.id)}" ${bIdx === 0 && cIdx === 0 ? 'open' : ''} style="border: 1px solid var(--border-strong); border-radius: 0.75rem; padding: 0.9rem 1.15rem; background: rgba(15, 23, 42, 0.32);">
                <summary style="cursor: pointer; font-weight: 700; font-size: 1.05rem; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
                  <span>📖 ${escapeHtml(ch.title)}</span>
                  <span class="badge" style="font-size: 0.75rem;">Click to Expand / Collapse</span>
                </summary>
                <div class="novel-prose" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-strong);">
                  ${ch.html}
                </div>
              </details>`
            )
            .join('\n')}
        </div>
        <div class="btn-row" style="margin-top: 1.15rem;">
          <a href="${escapeHtml(book.readerUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            📚 Read Full Interactive Edition in RaggieSoft Book Reader ↗
          </a>
        </div>
      </section>`
    )
    .join('\n');

  const erinHtml = erinChapters
    .map(
      (ch, idx) => `
      <details class="novel-chapter" ${idx === 0 ? 'open' : ''} style="margin-bottom: 1rem; cursor: pointer;">
        <summary style="font-weight: 700; font-size: 1.08rem; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
          <span>📖 ${escapeHtml(ch.title)}</span>
          <span class="badge">Before the Distance</span>
        </summary>
        ${ch.subtitle ? `<p style="font-size: 0.88rem; color: var(--accent-cyan); font-weight: 700; margin-top: 0.65rem;">${escapeHtml(ch.subtitle)}</p>` : ''}
        <div class="novel-prose" style="margin-top: 0.85rem;">
          ${ch.html}
        </div>
        <div class="btn-row" style="margin-top: 1rem;">
          <a href="${escapeHtml(ch.readerUrl)}" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
            📖 Read Chapter in RaggieSoft Book Reader ↗
          </a>
          <a href="https://music.raggiesoft.com/playlists/john-and-erin" class="btn" target="_blank" rel="noopener noreferrer">
            🎧 Stream Companion Soundtrack ↗
          </a>
        </div>
      </details>`
    )
    .join('\n');

  const bodyHtml = `
    <section class="hero-card" aria-labelledby="novel-heading">
      <span class="eyebrow">Cosmic Literary Sanctuary • Synchronized with books.raggiesoft.com</span>
      <h1 id="novel-heading">The Stardust Engine Cosmic Novel Reader</h1>
      <p class="lead">
        Read <strong>The Stardust Engine: The Story of the Iron Five (1978–2018)</strong>—streamlined across <strong>seven chronological books</strong> and locked strictly into <strong>Ryan O'Connell's Third-Person Limited POV</strong>—alongside the companion CPI novel <strong>Before the Distance: The Story of John &amp; Erin</strong>, or open them in the dedicated <a href="https://books.raggiesoft.com/stardust-engine">RaggieSoft Book Reader (books.raggiesoft.com/stardust-engine)</a>.
      </p>
      <div class="grid-2" style="margin: 1.5rem 0;">
        <div class="card card-accent-gold" style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <img
            src="https://assets.raggiesoft.com/raggiesoft-books/images/covers/2x3/stardust-engine.jpg"
            alt="Cover of The Stardust Engine: The Story of the Iron Five by Michael Ragsdale"
            width="120"
            height="180"
            style="border-radius: 0.6rem; object-fit: cover; border: 1px solid var(--border-strong); flex-shrink: 0;"
            loading="lazy"
          />
          <div style="flex: 1; min-width: 200px;">
            <span class="badge" style="margin-bottom: 0.35rem;">Volume 01 • 7 Chronological Books (1978–2018)</span>
            <h2 style="font-size: 1.2rem; margin: 0 0 0.35rem;">The Stardust Engine</h2>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 0.75rem;">
              From 1978 Blacksburg (` + '`124 Draper Road`' + ` &amp; Aunt Martha's farmhouse on Progress Street NE) to the 1992 Beverly Hills Mansion &amp; <em>Friction</em> trial, 2016's <em>Live at the Crucible</em>, and 2018's <em>The Nine-Figure Refusal</em>.
            </p>
            <div class="btn-row">
              <a href="https://books.raggiesoft.com/stardust-engine" class="btn btn-primary" target="_blank" rel="noopener noreferrer">📚 Open on Book Reader ↗</a>
              <a href="https://assets.raggiesoft.com/raggiesoft-books/books/stardust-engine/stardust-engine.epub" class="btn btn-emerald" target="_blank" rel="noopener noreferrer">⬇ EPUB</a>
              <a href="https://assets.raggiesoft.com/raggiesoft-books/books/stardust-engine/stardust-engine.pdf" class="btn" target="_blank" rel="noopener noreferrer">⬇ PDF</a>
            </div>
          </div>
        </div>
        <div class="card card-accent-cyan" style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <img
            src="https://assets.raggiesoft.com/raggiesoft-books/images/covers/2x3/erin.jpg"
            alt="Cover of Before the Distance: The Story of John & Erin"
            width="120"
            height="180"
            style="border-radius: 0.6rem; object-fit: cover; border: 1px solid var(--border-strong); flex-shrink: 0;"
            loading="lazy"
          />
          <div style="flex: 1; min-width: 200px;">
            <span class="badge" style="margin-bottom: 0.35rem;">Volume 02 • Companion CPI Novel</span>
            <h2 style="font-size: 1.2rem; margin: 0 0 0.35rem;">Before the Distance (John &amp; Erin)</h2>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 0.75rem;">
              Complete 4-chapter companion story portrayed by Ryan and Cassidy O'Connell aboard Blue Ridge Transit at CPI.
            </p>
            <div class="btn-row">
              <a href="https://books.raggiesoft.com/erin" class="btn btn-gold" target="_blank" rel="noopener noreferrer">📖 Open on Book Reader ↗</a>
              <a href="#book-erin" class="btn">Jump to Chapters ↓</a>
            </div>
          </div>
        </div>
      </div>
      <div class="callout-box card-accent-violet" style="margin-top: 1rem;">
        <h3 style="font-size: 1.05rem; margin: 0 0 0.35rem;">🗂️ Streamlined 7-Book Navigation Index (1978–2018)</h3>
        <p style="margin: 0 0 0.85rem; font-size: 0.9rem; color: var(--text-secondary);">
          Select any book or chapter below to jump directly to its collapsible reader section, or open the paginated edition on <code>books.raggiesoft.com/stardust-engine</code>:
        </p>
        <div class="grid-2">
          ${tocHtml}
        </div>
      </div>
    </section>

    <section id="book-stardust" class="section-block" aria-labelledby="book-se-heading">
      <div class="section-header">
        <span class="eyebrow">Volume 01 • The Story of the Iron Five (Ryan O'Connell's Third-Person Limited POV)</span>
        <h2 id="book-se-heading">Book I: The Stardust Engine (7 Chronological Books, 1978–2018)</h2>
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
    description: 'Read The Stardust Engine (1978–2018) and Before the Distance wrapped in a cosmic environment, linked with books.raggiesoft.com.',
    canonicalPath: '/novel',
    ogImage: 'https://assets.raggiesoft.com/raggiesoft-books/images/covers/og/stardust-engine.jpg',
    bodyHtml
  });
}

