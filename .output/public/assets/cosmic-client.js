/**
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
