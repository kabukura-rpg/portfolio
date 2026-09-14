(() => {
  'use strict';
  const heading = document.querySelector('[data-page="about"] .page-head');
  if (!heading) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'sakura-layer';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 9; i++) {
    const petal = document.createElement('span');
    petal.className = 'sakura-petal';
    petal.style.cssText = `--left:${(i * 37 + 8) % 94}%;--size:${8 + i % 4 * 2}px;--duration:${18 + i % 5 * 2}s;--delay:-${i * 3.7}s`;
    layer.append(petal);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'sakura-toggle';
  toggle.setAttribute('aria-label', '桜の演出');
  let enabled = !reduced.matches;
  function render() {
    layer.hidden = !enabled || reduced.matches;
    toggle.hidden = reduced.matches;
    toggle.textContent = enabled ? '桜の演出：ON' : '桜の演出：OFF';
    toggle.setAttribute('aria-pressed', String(enabled && !reduced.matches));
  }
  toggle.addEventListener('click', () => { enabled = !enabled; render(); });
  reduced.addEventListener('change', render);
  render();
  document.body.append(layer);
  heading.append(toggle);
})();
