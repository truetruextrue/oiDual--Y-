// ===============================
// 🔥 ORB SYSTEM · CORE UNIFICADO
// ===============================

/**
 * 1. GERADOR UNIVERSAL (Orb 3D)
 */
function makeOrbAvatar(name, size = 36) {
  const safe = String(name || 'DUAL').trim();

  // Seed determinística baseada no nome
  const seed = [...safe].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const h1 = seed % 360;
  const h2 = (seed * 37) % 360;
  
  // Evita colisão de gradient no DOM
  const uid = Math.random().toString(36).slice(2, 7);
  const gradId = `orb-grad-${seed.toString(36)}-${uid}`;

  return `
    <div class="di-orb-root" style="width:${size}px;height:${size}px">
      <svg class="orb-bg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="hsl(${h1},100%,58%)"/>
            <stop offset="100%" stop-color="hsl(${h2},90%,48%)"/>
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" class="orb-ring"/>
        <circle cx="50" cy="50" r="20" fill="url(#${gradId})" class="orb-core-svg"/>
      </svg>

      <div class="orb-3d">
        <div class="orb">
          <div class="orb-core"></div>
        </div>
      </div>
    </div>
  `;
}

// Global Hooks
window.makeOrbAvatar = makeOrbAvatar;
window.makeMiniAvatar = (name) => makeOrbAvatar(name, 24);


/**
 * 2. OBSERVER DO SYMBOL BAR
 */
function di_bindSymbolBarToCard({
  titleSelector = '.arch-name',
  symbolBarSelector = '.symbol-bar .hud-info'
} = {}) {

  const sync = () => {
    const title = document.querySelector(titleSelector);
    const hud = document.querySelector(symbolBarSelector);
    if (!title || !hud) return false;

    hud.textContent = title.textContent.replace(/\s+/g, ' ').trim() || '—';
    return true;
  };

  const bindTitleObserver = () => {
    const title = document.querySelector(titleSelector);
    if (!title) return false;

    const observer = new MutationObserver(sync);
    observer.observe(title, {
      childList: true,
      subtree: true,
      characterData: true
    });

    sync();
    return true;
  };

  if (sync() && bindTitleObserver()) return;

  const bootObserver = new MutationObserver(() => {
    if (sync() && bindTitleObserver()) {
      bootObserver.disconnect();
    }
  });

  bootObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
window.di_bindSymbolBarToCard = di_bindSymbolBarToCard;


/**
 * 3. SYMBOL BAR BUILDER
 */
function di_createSymbolBar({
  title = 'DUAL',
  links = []
} = {}) {
  const bar = document.createElement('div');
  bar.className = 'symbol-bar';

  bar.innerHTML = `
    <div class="hud-info"></div>
    <div class="symbol-bar-links"></div>
  `;

  bar.querySelector('.hud-info').textContent = title;

  const wrap = bar.querySelector('.symbol-bar-links');

  links.forEach((link) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'symbol-button';
    btn.title = link.label || link.url || 'action';
    btn.innerHTML = link.icon || '•';

    btn.addEventListener('click', () => {
      if (typeof link.onClick === 'function') link.onClick();
      if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer');
    });

    wrap.appendChild(btn);
  });

  return bar;
}

function di_orbToSymbolBar({
  orbSelector = '#main-orb',
  mountSelector = null,
  title = null,
  links = []
} = {}) {
  const orb = document.querySelector(orbSelector);
  if (!orb) return null;

  const currentTitle =
    title ||
    document.querySelector('.arch-name')?.textContent?.trim() ||
    'DUAL';

  const bar = di_createSymbolBar({
    title: currentTitle,
    links
  });

  if (mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return null;
    mount.replaceChildren(bar);
  } else {
    orb.replaceWith(bar);
  }

  return bar;
}

window.di_createSymbolBar = di_createSymbolBar;
window.di_orbToSymbolBar = di_orbToSymbolBar;

/**
 * 4. INJEÇÃO SEGURA (Auto-init)
 */
(function injectOrbSafe() {
  const target = document.querySelector('#main-orb');
  if (!target || target.dataset.orbInjected) return;

  try {
    const name = localStorage.getItem('di_userName') || localStorage.getItem('userName') || 'DUAL';
    target.innerHTML = makeOrbAvatar(name, 48);
    target.dataset.orbInjected = "true";
  } catch (e) {
    console.warn('Orb inject fail → fallback mantido', e);
  }
})();
