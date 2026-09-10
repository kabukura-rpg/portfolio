(() => {
  'use strict';
  const mobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const durations = { door: 400, page: 360, game: 560 };
  const overlay = document.createElement('div');
  overlay.className = 'transition-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  const caption = document.createElement('span');
  caption.className = 'transition-caption';
  overlay.append(caption);
  document.body.append(overlay);
  let pending = null;

  function resetNavigation() {
    if (pending) {
      clearTimeout(pending.timer);
      clearTimeout(pending.recovery);
      pending.link.classList.remove('is-entering');
      pending = null;
    }
    overlay.classList.remove('is-visible', 'is-quest');
  }

  function commitNavigation() {
    if (!pending || pending.committed) return;
    pending.committed = true;
    clearTimeout(pending.timer);
    // A slow/offline destination must not leave the current page covered.
    pending.recovery = setTimeout(resetNavigation, 100);
    try { location.assign(pending.url); }
    catch { resetNavigation(); }
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    // Any new ordinary link intent supersedes a pending destination.
    const kind = link.dataset.navigation;
    const target = link.getAttribute('target') || document.querySelector('base[target]')?.getAttribute('target');
    if (!mobile.matches || reduced.matches || !Object.hasOwn(durations, kind) ||
        link.hasAttribute('download') || (target && target.toLowerCase() !== '_self')) {
      resetNavigation();
      return;
    }
    let url;
    try { url = new URL(link.href, location.href); } catch { resetNavigation(); return; }
    const here = new URL(location.href);
    if (!['http:', 'https:'].includes(url.protocol) ||
        (kind !== 'game' && url.origin !== here.origin) ||
        (url.origin === here.origin && url.pathname === here.pathname && url.search === here.search)) {
      resetNavigation();
      return;
    }
    event.preventDefault();
    // Double taps do not restart the timer or launch a second navigation.
    if (pending?.url === url.href) return;
    resetNavigation();
    pending = { link, url: url.href, committed: false };
    link.classList.add('is-entering');
    caption.textContent = kind === 'game' ? 'QUEST START' : 'ENTERING…';
    overlay.classList.toggle('is-quest', kind === 'game');
    overlay.classList.add('is-visible');
    pending.timer = setTimeout(commitNavigation, durations[kind]);
    // Extension point for a future opt-in sound controller; no audio or storage here.
    document.dispatchEvent(new CustomEvent('kabukura:navigation-start', {
      detail: { kind, destination: link.dataset.destination, duration: durations[kind] }
    }));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') resetNavigation();
  });
  window.addEventListener('pagehide', resetNavigation);
  window.addEventListener('pageshow', resetNavigation);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetNavigation();
  });

  // Only below-the-fold content is prepared for a one-time reveal. Without JS
  // or IntersectionObserver every element remains visible in normal document flow.
  const sections = [...document.querySelectorAll(
    '.welcome, .intro-copy, .lore-card, .info-grid, .character-card, .quest-card, .page-end'
  )];
  const revealed = new WeakSet();
  let observer;
  function reveal(section) {
    section.classList.remove('explore-pending');
    revealed.add(section);
    observer?.unobserve(section);
  }
  function configureExploration() {
    observer?.disconnect();
    sections.forEach(section => section.classList.remove('explore-pending'));
    if (!mobile.matches || reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: 0, rootMargin: '0px 0px -16px 0px' });
    sections.forEach(section => {
      section.classList.add('explore-section');
      if (revealed.has(section)) return;
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight || section.contains(document.activeElement)) {
        revealed.add(section);
      } else {
        section.classList.add('explore-pending');
        observer.observe(section);
      }
    });
  }
  document.addEventListener('focusin', event => {
    const section = event.target.closest('.explore-pending');
    if (section) reveal(section);
  });
  function preferenceChanged() {
    if (!mobile.matches || reduced.matches) {
      commitNavigation();
      resetNavigation();
    }
    configureExploration();
  }
  mobile.addEventListener('change', preferenceChanged);
  reduced.addEventListener('change', preferenceChanged);
  window.addEventListener('pageshow', configureExploration);
  configureExploration();
})();
