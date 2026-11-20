/**
 * @license MIT
 * ============================================================================
 * cosmic-client.js — Client Progressive Enhancement (stardust.raggiesoft.com)
 * ============================================================================
 * PLAIN-ENGLISH OVERVIEW (100-LEVEL JAVASCRIPT GUIDE):
 * What is this file?
 *   This client-side script runs in the visitor's browser after HTML parsing
 *   completes (via the defer attribute). Built by buildCosmicClientJs() in
 *   scripts/build.mjs and mirrored 1:1 to both /assets/cosmic-client.js and
 *   raggiesoft-assets/stardust-engine/js/cosmic-client.js.
 *
 * What UI controls does it power?
 *   1. Mobile Hamburger Menu (#mobile-menu-toggle): Expands/collapses the
 *      navigation links on phones/tablets and closes on Escape key press.
 *   2. Exoplanet Light / Deep Space Dark Toggle (#theme-toggle): Updates
 *      meta[name="color-scheme"], html[data-bs-theme], and localStorage so
 *      CSS switches seamlessly between sunlit Exoplanet Horizon and Deep Space.
 *   3. Pause / Resume Cosmic Motion (#motion-toggle): Checks the operating
 *      system's prefers-reduced-motion accessibility setting and lets visitors
 *      toggle html[data-cosmic-motion="paused"] to freeze starfield twinkling.
 * ============================================================================
 */
// Wrap all browser variables inside an IIFE so nothing leaks onto window.
(function () {
  // --- 1. QUERY HEADER & ACCESSIBILITY CONTROL ELEMENTS ---
  var meta = document.querySelector('meta[name="color-scheme"]');
  var themeBtn = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-toggle-label');
  var motionBtn = document.getElementById('motion-toggle');
  var motionLabel = document.getElementById('motion-toggle-label');
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var primaryNav = document.getElementById('primary-navigation');

  // --- 2. MOBILE NAVIGATION DRAWER & ESCAPE KEY HANDLER ---
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

  // --- 3. EXOPLANET (LIGHT) VS. DEEP SPACE (DARK) THEME TOGGLE ---
  // Reads whether the visitor's OS prefers Dark Mode via CSS MediaQueryList.
  function getSystemScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // Returns any explicit user override saved in localStorage, or falls back to OS preference.
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

  // Syncs html[data-bs-theme] for Bootstrap utility contrast rules and updates the button badge.
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
        // Two-state auto-revert: if the newly chosen theme matches the OS setting,
        // remove the stored override so future OS schedule changes take effect naturally.
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

    // Synchronize theme changes across multiple open tabs of stardust.raggiesoft.com.
    window.addEventListener('storage', function (e) {
      if (e.key === 'color-scheme') {
        meta.content = e.newValue || 'light dark';
        updateThemeLabel();
      }
    });
  }

  // --- 4. STARFIELD MOTION ACCESSIBILITY CONTROL (prefers-reduced-motion) ---
  // Check whether the visitor enabled "Reduce Motion" in macOS / Windows / iOS / Android settings.
  var osReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Motion is considered paused if EITHER the OS requests reduced motion OR the
  // html element carries data-cosmic-motion="paused".
  function isMotionPaused() {
    if (osReducedMotion) return true;
    return document.documentElement.getAttribute('data-cosmic-motion') === 'paused';
  }

  // Updates aria-pressed ('true' when paused) for screen readers and swaps the Play/Pause icon.
  function updateMotionLabel() {
    if (!motionLabel || !motionBtn) return;
    var paused = isMotionPaused();
    motionBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    motionLabel.textContent = paused ? '▶ Motion' : '⏸ Motion';
  }

  if (motionBtn) {
    // Automatically stamp data-cosmic-motion="paused" on startup if OS reduced-motion is active.
    if (osReducedMotion) {
      document.documentElement.setAttribute('data-cosmic-motion', 'paused');
    }
    updateMotionLabel();
    // Toggle between paused and active starfield motion on click and persist in localStorage.
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
