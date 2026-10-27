/**
 * @license MIT
 * ============================================================================
 * src/renderers/pages-band.mjs — The Stardust Engine (stardust.raggiesoft.com)
 * ============================================================================
 * Architectural Overview:
 * Renders the core band lore routes of `stardust.raggiesoft.com`:
 * 1. `renderStardustHome` (`/`):
 *    - Cosmic portal overview, 1986 Band Name Canon ("Stardust" = cosmos,
 *      "Engine" = rockets vs. Apex Records' hated 1980s marketing gimmick),
 *      and direct handoffs to `https://music.raggiesoft.com/the-stardust-engine`
 *      and `https://books.raggiesoft.com/books/stardust-engine`.
 * 2. `renderBandMembersPage` (`/band`):
 *    - Detailed biographies & portraits for The Iron Five (Ryan O'Connell,
 *      Cassidy O'Connell, Holly O'Connell, Evan Wright, and Tyler Wright).
 * 3. `renderDiscographyPage` (`/discography`):
 *    - Complete chronological discography from `catalog.json` + curated playlists
 *      with direct links to stream and download free CC BY-SA 4.0 128kbps MP3 ZIPs.
 * 4. `renderDeepLorePage` (`/lore`):
 *    - Deep band lore from 1985 CPI origins through the 1992 Friction walkout,
 *      Echoes in the Wire (replacing If You Walked Away), Starfield Calibration,
 *      and the 2016 Crucible return.
 * ============================================================================
 */

import { escapeHtml, renderCosmicShell } from './shell.mjs';

const BAND_MEMBERS = [
  {
    name: "Ryan O'Connell",
    role: 'Co-Lead Vocals, Lead Electric Guitar & Lyricist',
    badge: 'CPI Class of 1988 • T10 Paraplegic Wheelchair User • Cassidy’s Safe Person',
    portrait: 'https://assets.raggiesoft.com/stardust-engine/images/band-members/ryan.jpg',
    bio: "Born in Blacksburg, Virginia, Ryan co-founded the band with his sister Cassidy at Commonwealth Polytechnic Institute (CPI) in 1985. After surviving the December 1990 I-81 black-ice tour crash as a T10 paraplegic, Ryan refused to surrender the stage—performing from his custom manual wheelchair and anchoring Cassidy as her lifelong safe person.",
    dossierUrl: '/band/ryan-oconnell',
    signatureTrack: 'https://music.raggiesoft.com/the-stardust-engine/1997-hard-reset?track=the-stardust-engine-1997-hard-reset-1-9',
    signatureTrackLabel: '🎧 Hear "Echoes in the Wire" (Ryan & Cassidy)'
  },
  {
    name: "Cassidy O'Connell",
    role: 'Co-Lead Vocals, Analog Synthesizers, Grand Piano & Chief Audio Architect',
    badge: 'Pioneer of The Cosmic Tidal Lock Sound™ • Composer of "Escape Velocity (Ad Astra)"',
    portrait: 'https://assets.raggiesoft.com/stardust-engine/images/band-members/cassidy.jpg',
    bio: "The sonic architect of The Stardust Engine. Operating from the center of her 360-degree circular analog synthesizer rig ('The Engine Room'), Cassidy engineered the zero-gravity Cosmic Tidal Lock Sound™ and composed the 15-minute two-disc magnum opus 'Escape Velocity (Ad Astra)' after escaping Apex Records' coerced pop formulas.",
    dossierUrl: '/band/cassidy-oconnell',
    signatureTrack: 'https://music.raggiesoft.com/playlists/cosmic-tidal-lock-sound',
    signatureTrackLabel: '🎧 Explore The Cosmic Tidal Lock Sound™ Playlist'
  },
  {
    name: "Holly O'Connell, J.D., CFA",
    role: 'Band Manager, Legal Architect & Co-Driver (Class A CDL w/ Passenger & Airbrake)',
    badge: 'Architect of the 1992 Friction Walkout & 1994 Apex Settlement',
    portrait: 'https://assets.raggiesoft.com/stardust-engine/images/band-members/holly.jpg',
    bio: "Ryan and Cassidy's fiercely protective younger sister. When Apex executive Julian Vance attempted to coerce Ryan and Cassidy during the October 14, 1992 'Friction' sessions, Holly pulled the plug, led the 1994 legal victory that reclaimed 100% of the band's master tapes, and earned her Class A CDL alongside Evan and Tyler so no outside driver could ever endanger her family again.",
    dossierUrl: '/band/holly-oconnell',
    signatureTrack: 'https://music.raggiesoft.com/the-stardust-engine/1997-forger-nation-war-chest',
    signatureTrackLabel: '🎧 Stream "Forger Nation: The War Chest (1997)"'
  },
  {
    name: 'Evan Wright',
    role: 'Bass Guitar, Fretless Bass, Moog Taurus Pedals & Co-Driver (Class A CDL)',
    badge: 'Identical Twin Maternal Cousin • Joined at CPI in 1986',
    portrait: 'https://assets.raggiesoft.com/stardust-engine/images/band-members/evan.jpg',
    bio: "Joining Ryan and Cassidy at CPI in 1986 alongside his identical twin brother Tyler, Evan's driving basslines and sub-orbital Moog Taurus pedal sustains form the gravitational floor of The Stardust Engine. Holds a Class A Commercial Driver's License with Passenger and Airbrake endorsements.",
    dossierUrl: '/band/evan-wright',
    signatureTrack: 'https://music.raggiesoft.com/the-stardust-engine/2001-midnight-drivers',
    signatureTrackLabel: '🎧 Stream "Midnight Drivers (2001)"'
  },
  {
    name: 'Tyler Wright',
    role: 'Acoustic & Electronic Drums, Percussion & Lead Fleet Driver (Class A CDL)',
    badge: 'Identical Twin Maternal Cousin • Joined at CPI in 1986',
    portrait: 'https://assets.raggiesoft.com/stardust-engine/images/band-members/tyler.jpg',
    bio: "Evan's identical twin brother and the rhythmic propellant ('Engine') behind every stadium anthem. After the 1990 I-81 crash, Tyler earned his Class A CDL with Passenger and Airbrake endorsements to personally command the wheel of the 2002 Sainte-Claire 45H3 ('The Iron Horse') and the 2004 Prairie Coachworks RLFD30.",
    dossierUrl: '/band/tyler-wright',
    signatureTrack: 'https://music.raggiesoft.com/the-stardust-engine/2004-progress-street',
    signatureTrackLabel: '🎧 Stream "Progress Street (2004)"'
  }
];

/**
 * Renders the Cosmic Home Page (`/`).
 * @param {Array<any>} stardustAlbums
 * @returns {string}
 */
export function renderStardustHome(stardustAlbums) {
  const totalTracks = stardustAlbums.reduce(
    (sum, a) => sum + Number(a.totalTracksCount || a.tracks?.length || 0),
    0
  );

  const bodyHtml = `
    <section class="hero-card" aria-labelledby="cosmic-hero-heading">
      <span class="eyebrow">Ad Astra • The Official Cosmic Sanctuary of The Stardust Engine</span>
      <h1 id="cosmic-hero-heading">The Cosmos Above. The Rockets to Get You There.</h1>
      <p class="lead">
        Welcome to <a href="https://stardust.raggiesoft.com">stardust.raggiesoft.com</a> (also reachable via <code>thestardustengine.com</code>)—the dedicated cosmic lore portal for <strong>The Stardust Engine</strong>.
        Switch between <strong>Light Mode</strong> (standing on the surface of a distant Earth-like exoplanet looking toward the sunlit horizon) and <strong>Dark Mode</strong> (suspended in the lush vastness of deep space), with full respect for <code>prefers-reduced-motion</code>.
      </p>
      <div class="btn-row">
        <a href="https://music.raggiesoft.com/the-stardust-engine" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          🎧 Stream All ${stardustAlbums.length} Releases (${totalTracks} Songs) in The Listening Room ↗
        </a>
        <a href="/novel" class="btn btn-gold">
          📖 Read the Band Novel in the Cosmic Reader →
        </a>
        <a href="https://books.raggiesoft.com/books/stardust-engine" class="btn btn-emerald" target="_blank" rel="noopener noreferrer">
          📚 Open in RaggieSoft Book Reader ↗
        </a>
      </div>
    </section>

    <!-- THE 1986 BAND NAME CANON -->
    <section class="section-block" aria-labelledby="name-canon-heading">
      <div class="section-header">
        <span class="eyebrow">1986 CPI Origin Canon • Track 13 on Electric Color (1987)</span>
        <h2 id="name-canon-heading">Why We Are Called &ldquo;The Stardust Engine&rdquo;</h2>
      </div>
      <div class="callout-box card-accent-gold">
        <p style="margin: 0 0 0.85rem; font-size: 0.96rem;">
          In <strong>1986</strong>, when identical twin cousins <strong>Evan and Tyler Wright</strong> joined siblings <strong>Cassidy and Ryan O'Connell</strong> at Commonwealth Polytechnic Institute (CPI) in Blacksburg, Virginia, the very first song the four of them wrote together was <a href="https://music.raggiesoft.com/the-stardust-engine/1987-electric-color?track=the-stardust-engine-1987-electric-color-1-13"><strong>&ldquo;The Stardust Engine&rdquo;</strong></a>—celebrating their shared love of the cosmos (<strong>&ldquo;Stardust&rdquo;</strong>) and the rockets to get you there (<strong>&ldquo;Engine&rdquo;</strong>).
        </p>
        <p style="margin: 0; font-size: 0.94rem; color: var(--text-secondary);">
          Too scared to shop the song around at first, they used its title to name the band before finally releasing it in <strong>1987 as Track 13 on <em>Electric Color</em></strong>. When <strong>Apex Records</strong> signed them, Apex executives screwed around and cheaply branded Cassidy as their <em>&ldquo;Stardust&rdquo;</em> and Ryan as their <em>&ldquo;Engine&rdquo;</em>—a 1980s corporate naming gimmick that the band <strong>hates</strong> because it takes away from their genuine love of the cosmos and the rockets to get you there.
        </p>
      </div>
    </section>

    <!-- GATEWAY CARDS -->
    <section class="section-block" aria-labelledby="explore-heading">
      <div class="section-header">
        <span class="eyebrow">Explore the Sanctuary</span>
        <h2 id="explore-heading">Five Portals Into The Stardust Engine Universe</h2>
      </div>
      <div class="grid-3">
        <article class="card card-accent-cyan">
          <div>
            <h3>1. The Iron Five (/band)</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Meet Ryan, Cassidy, and Holly O'Connell and identical twin cousins Evan and Tyler Wright—a five-person family fortress bound by music, accessibility, and sibling sanctuary.
            </p>
          </div>
          <div class="btn-row">
            <a href="/band" class="btn btn-primary">Meet the Band →</a>
          </div>
        </article>

        <article class="card card-accent-gold">
          <div>
            <h3>2. Discography &amp; Playlists (/discography)</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Explore all ${stardustAlbums.length} albums and curated playlists (<em>The Cosmic Tidal Lock Sound™</em> and <em>Before the Distance: The Story of John &amp; Erin</em>), with direct links to stream and download free <strong>CC BY-SA 4.0 128kbps MP3 archives</strong> on <a href="https://music.raggiesoft.com/the-stardust-engine">music.raggiesoft.com</a>.
            </p>
          </div>
          <div class="btn-row">
            <a href="/discography" class="btn btn-gold">Explore Discography →</a>
          </div>
        </article>

        <article class="card card-accent-violet">
          <div>
            <h3>3. Deep Band Lore (/lore)</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              From the 1992 <em>Friction</em> walkout and <em>Echoes in the Wire</em> (replacing <em>If You Walked Away</em>) to the 2011 <em>Starfield Calibration</em> sessions and the 2016 <em>Live at the Crucible</em> return.
            </p>
          </div>
          <div class="btn-row">
            <a href="/lore" class="btn">Read Full Band Lore →</a>
          </div>
        </article>

        <article class="card card-accent-emerald">
          <div>
            <h3>4. Rolling Sanctuary Fleet (/fleet)</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Step aboard the 2002 <strong>Sainte-Claire 45H3 (&ldquo;The Iron Horse&rdquo;)</strong> with its mid-ship hydraulic wheelchair lift and the 2004 <strong>Prairie Coachworks RLFD30 (Serial #001)</strong> low-floor shuttle on Progress Street.
            </p>
          </div>
          <div class="btn-row">
            <a href="/fleet" class="btn btn-emerald">Inspect the Fleet →</a>
          </div>
        </article>

        <article class="card card-accent-gold">
          <div>
            <h3>5. Cosmic Novel Reader (/novel)</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Read the Markdown/JSON chapters of <em>The Stardust Engine</em> and <em>Before the Distance: The Story of John &amp; Erin</em> wrapped in our cosmic environment, or jump directly to <a href="https://books.raggiesoft.com">books.raggiesoft.com</a>.
            </p>
          </div>
          <div class="btn-row">
            <a href="/novel" class="btn btn-gold">Open Cosmic Novel Reader →</a>
          </div>
        </article>

        <article class="card card-accent-cyan">
          <div>
            <h3>6. Corporate Lore Handoff</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">
              Looking for Holly O'Connell's 2015 Delaware corporate ring-fence, <em>Engine Room Records, LLC</em>, and <em>The O'Connell Family Revocable Trust</em>? Visit our sister property at <a href="https://engineroom.raggiesoft.com/corporate">engineroom.raggiesoft.com/corporate</a>.
            </p>
          </div>
          <div class="btn-row">
            <a href="https://engineroom.raggiesoft.com/corporate" class="btn" target="_blank" rel="noopener noreferrer">Corporate Architecture ↗</a>
          </div>
        </article>
      </div>
    </section>
  `;

  return renderCosmicShell({
    title: 'The Stardust Engine | Official Cosmic Band Lore & Portal',
    description: 'Official cosmic lore portal of The Stardust Engine (Blacksburg, VA). Explore the Iron Five, discography, accessible fleet, and cosmic novel.',
    canonicalPath: '/',
    bodyHtml
  });
}

/**
 * Renders `/band` page (The Iron Five).
 * @returns {string}
 */
export function renderBandMembersPage() {
  const membersHtml = BAND_MEMBERS.map(
    (m) => `
    <article class="card card-accent-gold">
      <div>
        <div class="badge-row" style="margin-bottom: 0.65rem;">
          <span class="badge">${escapeHtml(m.badge)}</span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <img
            src="${escapeHtml(m.portrait)}"
            alt="Portrait of ${escapeHtml(m.name)}"
            class="member-portrait"
            width="80"
            height="80"
            loading="lazy"
          />
          <div style="min-width: 0; flex: 1;">
            <h2 style="font-size: 1.25rem; margin: 0 0 0.2rem; overflow-wrap: break-word;">${escapeHtml(m.name)}</h2>
            <p style="margin: 0; font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); overflow-wrap: break-word;">
              ${escapeHtml(m.role)}
            </p>
          </div>
        </div>
        <p style="font-size: 0.93rem; color: var(--text-secondary); margin: 0 0 1rem;">
          ${escapeHtml(m.bio)}
        </p>
      </div>
      <div class="btn-row">
        <a href="${escapeHtml(m.dossierUrl)}" class="btn btn-gold">
          📄 Full Archival Dossier →
        </a>
        <a href="${escapeHtml(m.signatureTrack)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(m.signatureTrackLabel)} ↗
        </a>
      </div>
    </article>`
  ).join('\n');

  const bodyHtml = `
    <section class="hero-card" aria-labelledby="band-heading">
      <span class="eyebrow">The Iron Five • O'Connell Siblings &amp; Wright Twins</span>
      <h1 id="band-heading">Five Family Members. One Unbreakable Sanctuary.</h1>
      <p class="lead">
        Unlike traditional rock bands assembled by label A&amp;R departments, <strong>The Stardust Engine</strong> is a five-person family unit: siblings <strong>Ryan, Cassidy, and Holly O'Connell</strong> and their identical twin maternal cousins <strong>Evan and Tyler Wright</strong>.
      </p>
      <div class="btn-row">
        <a href="/band/history" class="btn btn-gold">📜 Read Complete Band History (1985–Present) →</a>
        <a href="/band/overview" class="btn">🗂️ View Classic Roster Dossier →</a>
      </div>
    </section>

    <section class="section-block" aria-label="Band Member Dossiers">
      <div class="grid-2">
        ${membersHtml}
      </div>
    </section>
  `;

  return renderCosmicShell({
    title: 'The Iron Five: Band Members | The Stardust Engine',
    description: 'Meet Ryan, Cassidy, and Holly O\'Connell and identical twin cousins Evan and Tyler Wright of The Stardust Engine.',
    canonicalPath: '/band',
    bodyHtml
  });
}

/**
 * Renders `/discography` page from `catalog.json`, grouped into Studio Albums,
 * Live Concert Recordings, and Compilations & Archival Anthologies.
 * @param {Array<any>} stardustAlbums
 * @returns {string}
 */
export function renderDiscographyPage(stardustAlbums) {
  const renderAlbumCard = (album) => {
    const streamUrl = `https://music.raggiesoft.com/${album.artistSlug}/${album.slug}`;
    return `
        <article class="card card-accent-cyan">
          <div>
            <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 0.9rem;">
              <img
                src="${escapeHtml(album.artwork)}"
                alt="Cover art for ${escapeHtml(album.title)}"
                width="84"
                height="84"
                style="border-radius: 0.6rem; object-fit: cover; border: 1px solid var(--border-strong); flex-shrink: 0;"
                loading="lazy"
              />
              <div>
                <div class="badge-row" style="margin-bottom: 0.25rem;">
                  <span class="badge">${escapeHtml(album.year || 'Lore Era')}</span>
                  <span class="badge">${escapeHtml(album.albumTypeLabel || 'Album')}</span>
                  <span class="badge">${Number(album.totalTracksCount || 0)} Songs</span>
                </div>
                <h3 style="margin: 0 0 0.2rem; font-size: 1.15rem;">${escapeHtml(album.title)}</h3>
                ${
                  album.subtitle
                    ? `<p style="margin: 0; font-size: 0.8rem; font-weight: 700; color: var(--accent-gold);">${escapeHtml(album.subtitle)}</p>`
                    : ''
                }
              </div>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 0.75rem;">
              ${escapeHtml(album.description)}
            </p>
          </div>
          <div class="btn-row">
            <a href="${escapeHtml(streamUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
              🎧 Stream &amp; Lyrics on music.raggiesoft.com ↗
            </a>
            ${
              album.freeArchiveUrl
                ? `<a href="${escapeHtml(album.freeArchiveUrl)}" class="btn btn-emerald" download target="_blank" rel="noopener noreferrer">⬇ Free 128kbps MP3 (.zip)</a>`
                : ''
            }
          </div>
        </article>`;
  };

  const categoryDefs = [
    {
      id: 'studio',
      eyebrow: 'Studio Releases • 1987–2015',
      title: '🎙️ Studio Albums & Singles',
      description: 'Original studio albums, concept suites, and singles recorded across Blacksburg, The Fortress, and the Planetarium.'
    },
    {
      id: 'live',
      eyebrow: 'Concert Recordings • 1990–2016',
      title: '⚡ Live Concert Recordings',
      description: 'Full-length live concert albums from Chicago, Charlottesville, Virginia Beach, Norfolk, and The Crucible in Blacksburg.'
    },
    {
      id: 'compilation',
      eyebrow: 'Vault Anthologies • 1997–2016',
      title: '💿 Compilations & Archival Anthologies',
      description: 'Curated war chests, Apex-era rarities (Lost Sounds), and the 30th-Anniversary CPI & Blacksburg archival anthology (The Forger\'s Call).'
    }
  ];

  const sectionsHtml = categoryDefs
    .map((cat) => {
      const items = stardustAlbums.filter((a) => (a.albumType || 'studio') === cat.id);
      if (items.length === 0) return '';
      return `
    <section class="section-block" aria-labelledby="discog-cat-${cat.id}">
      <div class="section-header">
        <span class="eyebrow">${escapeHtml(cat.eyebrow)} (${items.length})</span>
        <h2 id="discog-cat-${cat.id}">${escapeHtml(cat.title)}</h2>
        <p style="margin: 0; color: var(--text-secondary);">${escapeHtml(cat.description)}</p>
      </div>
      <div class="grid-2">
        ${items.map(renderAlbumCard).join('\n')}
      </div>
    </section>`;
    })
    .join('\n');

  const bodyHtml = `
    <section class="hero-card" aria-labelledby="discog-heading">
      <span class="eyebrow">Chronological Catalog (1987–2016) • CC BY-SA 4.0 Free Downloads</span>
      <h1 id="discog-heading">Complete Discography &amp; Curated Story Playlists</h1>
      <p class="lead">
        All audio playback, synchronized WebVTT lyrics, and free <strong>CC BY-SA 4.0 128kbps MP3 downloads</strong> (both full album <code>.zip</code> archives and individual track MP3s) are hosted in <a href="https://music.raggiesoft.com/the-stardust-engine">The Listening Room</a>.
      </p>
      <div class="btn-row">
        <a href="https://music.raggiesoft.com/playlists/cosmic-tidal-lock-sound" class="btn btn-gold" target="_blank" rel="noopener noreferrer">
          🪐 Curated Playlist: The Cosmic Tidal Lock Sound™ ↗
        </a>
        <a href="https://music.raggiesoft.com/playlists/john-and-erin" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
          🚌 Curated Playlist: Before the Distance (John &amp; Erin) ↗
        </a>
      </div>
    </section>

    ${sectionsHtml}
  `;

  return renderCosmicShell({
    title: 'Discography & Playlists | The Stardust Engine',
    description: 'Explore all albums and curated playlists by The Stardust Engine, with direct streaming and CC BY-SA 4.0 MP3 downloads on music.raggiesoft.com.',
    canonicalPath: '/discography',
    bodyHtml
  });
}

/**
 * Renders `/lore` page (Deep Band Lore 1985–2016).
 * @returns {string}
 */
export function renderDeepLorePage() {
  const bodyHtml = `
    <section class="hero-card" aria-labelledby="lore-heading">
      <span class="eyebrow">Canonical Band History • 1985–2016</span>
      <h1 id="lore-heading">Deep Lore of The Stardust Engine</h1>
      <p class="lead">
        This archive documents the personal, musical, and acoustic journey of Ryan, Cassidy, Holly, Evan, and Tyler—from their 1986 dorm-room songwriting at CPI through their emancipation from Apex Records and the birth of <em>The Cosmic Tidal Lock Sound™</em>.
      </p>
    </section>

    <section class="section-block" aria-labelledby="era-1-heading">
      <div class="section-header">
        <span class="eyebrow">Era 01 • 1985–1990 (CPI &amp; The Apex Years)</span>
        <h2 id="era-1-heading">1. 1986: The First Song (&ldquo;The Stardust Engine&rdquo;) &amp; The Apex Gimmick</h2>
      </div>
      <div class="grid-2">
        <article class="card card-accent-gold">
          <h3>The True Meaning of &ldquo;Stardust&rdquo; + &ldquo;Engine&rdquo;</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary);">
            In 1986, when identical twins Evan and Tyler Wright joined Cassidy and Ryan O'Connell at Commonwealth Polytechnic Institute (CPI), the very first song the four of them wrote together was <a href="https://music.raggiesoft.com/the-stardust-engine/1987-electric-color?track=the-stardust-engine-1987-electric-color-1-13"><em>The Stardust Engine</em></a>. Too nervous to shop the track around at first, they adopted its title as their band name before releasing it as Track 13 on 1987's <a href="https://music.raggiesoft.com/the-stardust-engine/1987-electric-color"><em>Electric Color</em></a>. To the family, <strong>&ldquo;Stardust&rdquo;</strong> celebrates the wonder of the cosmos, and <strong>&ldquo;Engine&rdquo;</strong> celebrates the rockets to get you there.
          </p>
        </article>
        <article class="card card-accent-violet">
          <h3>Why the Band Hated Apex Records' 1980s Branding</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary);">
            When Apex Records signed the group for <a href="https://music.raggiesoft.com/the-stardust-engine/1987-electric-color"><em>Electric Color</em></a> (1987) and <a href="https://music.raggiesoft.com/the-stardust-engine/1989-neon-hearts"><em>Neon Hearts</em></a> (1989), Apex marketing executives twisted the band's name into a cheap 1980s corporate persona gimmick—branding Cassidy as their <em>&ldquo;Stardust&rdquo;</em> and Ryan as their <em>&ldquo;Engine&rdquo;</em>, while forcing them to record manufactured heartbreak ballads like <a href="https://music.raggiesoft.com/the-stardust-engine/1989-neon-hearts?track=the-stardust-engine-1989-neon-hearts-1-4"><em>If You Walked Away</em></a>.
          </p>
        </article>
      </div>
    </section>

    <section class="section-block" aria-labelledby="era-2-heading">
      <div class="section-header">
        <span class="eyebrow">Era 02 • 1990–1997 (I-81 Crash, Friction Walkout &amp; Hard Reset)</span>
        <h2 id="era-2-heading">2. From the 1992 <em>Friction</em> Walkout to <em>Echoes in the Wire</em> (1997)</h2>
      </div>
      <div class="grid-2">
        <article class="card card-accent-cyan">
          <h3>December 1990 &amp; October 14, 1992 (&ldquo;The Fatal Assumption&rdquo;)</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary);">
            In December 1990, following <a href="https://music.raggiesoft.com/the-stardust-engine/1990-live-in-chicago"><em>Live in Chicago</em></a>, a black-ice tour bus crash on I-81 left Ryan with a permanent T10 spinal cord injury. During the October 14, 1992 sessions for the unreleased album <em>Friction</em>, Apex executive Julian Vance attempted to exploit Ryan and Cassidy's sibling closeness with a coerced, fabricated tabloid romance narrative. Holly O'Connell terminated the session on the spot, launching the two-year legal war that liberated their masters in 1994.
          </p>
        </article>
        <article class="card card-accent-emerald">
          <h3>How <em>Echoes in the Wire</em> Replaced <em>If You Walked Away</em></h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary);">
            On 1997's <a href="https://music.raggiesoft.com/the-stardust-engine/1997-hard-reset"><em>Hard Reset</em></a> (and later on 2011's <a href="https://music.raggiesoft.com/the-stardust-engine/2011-starfield-calibration?track=the-stardust-engine-2011-starfield-calibration-1-10"><em>Starfield Calibration</em></a>), the band permanently retired Apex's coerced 1989 ballad <em>If You Walked Away</em> and replaced it in their canon and live setlists with <a href="https://music.raggiesoft.com/the-stardust-engine/1997-hard-reset?track=the-stardust-engine-1997-hard-reset-1-9"><strong>&ldquo;Echoes in the Wire&rdquo;</strong></a>. Rather than a fake corporate breakup song, <em>Echoes in the Wire</em> tells the true story of Cassidy finding immediate comfort, grounding, and safety when her brother Ryan is hugging her tightly in the quiet of the studio.
          </p>
        </article>
      </div>
    </section>

    <section class="section-block" aria-labelledby="era-3-heading">
      <div class="section-header">
        <span class="eyebrow">Era 03 • 2001–2016 (Sanctuary Zero-G, Progress Street &amp; Starfield Calibration)</span>
        <h2 id="era-3-heading">3. <em>Starfield Calibration</em> (2011): Why the Lyrics Evolved</h2>
      </div>
      <div class="callout-box card-accent-gold">
        <p style="margin: 0 0 0.75rem; font-size: 0.95rem;">
          When Cassidy and Ryan returned to the dome studio in 2011 to record <a href="https://music.raggiesoft.com/the-stardust-engine/2011-starfield-calibration"><strong>Starfield Calibration</strong></a>, they rebuilt their classic catalog around two foundational pillars:
        </p>
        <ol style="margin: 0; padding-left: 1.4rem; color: var(--text-secondary); font-size: 0.92rem; display: grid; gap: 0.5rem;">
          <li><strong>Celebrating Freedom from Apex Records:</strong> Stripping away the last remnants of 1980s executive interference so every lyric reflects the Iron Five's true voice.</li>
          <li><strong>Acoustic &amp; Phonetic Vowel Extensions (The 74% Cover Protocol):</strong> Opening clipped phrasing into sustained vowel harmonics (<code>ooh</code>, <code>aah</code>, <code>ee</code>, <code>oh</code>) calibrated at a precise 74% audio influence ratio so the vocals float effortlessly inside Cassidy's zero-gravity analog synth field.</li>
        </ol>
      </div>
    </section>
  `;

  return renderCosmicShell({
    title: 'Deep Band Lore (1985–2016) | The Stardust Engine',
    description: 'Canonical history of The Stardust Engine: 1986 CPI origins, the 1992 Friction walkout, Echoes in the Wire, and 2011 Starfield Calibration.',
    canonicalPath: '/lore',
    bodyHtml
  });
}

