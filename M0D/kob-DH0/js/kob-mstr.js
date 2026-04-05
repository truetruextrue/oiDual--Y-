/* ═══════════════════════════════════════════════════════════════
KOB · INLINE INTEGRATION + SYMBOL BAR FULL OVERRIDE
Arquivo standalone — sem <script> tags
Inclui: arquétipos, orb click, idle dock, drag/snap/connect
Uso: <script src="kob-inline-full.js"></script>
═══════════════════════════════════════════════════════════════ */

/* ── 1. INJEÇÃO DO CSS DO SYMBOL BAR ──────────────────────── */
(function injectSymbolBarCSS() {
if (document.getElementById(‘symbolbar-full-override’)) return;
const style = document.createElement(‘style’);
style.id = ‘symbolbar-full-override’;
style.textContent = `
.symbol-bar {
position: fixed !important;
z-index: 9999;
display: flex;
flex-direction: column;
gap: 14px;
padding: 14px;
border-radius: 42px;
background:
linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
rgba(8,10,18,0.66);
backdrop-filter: blur(22px) saturate(150%);
-webkit-backdrop-filter: blur(22px) saturate(150%);
border: 1px solid color-mix(in srgb, var(–kob-voice-primary, #00f0ff) 30%, transparent);
box-shadow:
0 10px 40px rgba(0,0,0,0.65),
inset 0 0 12px rgba(255,255,255,0.03),
0 0 18px color-mix(in srgb, var(–kob-voice-primary, #00f0ff) 22%, transparent);
transition: transform .28s cubic-bezier(.23,1,.32,1), opacity .45s ease, box-shadow .28s ease;
touch-action: none;
user-select: none;
cursor: grab;
}
.symbol-bar.idle {
opacity: .14;
transform: translateY(-50%) scale(.88);
filter: grayscale(.4) brightness(.8);
}
.symbol-bar:hover {
transform: translateY(-50%) scale(1.05);
}
.symbol-bar.dragging {
transition: none !important;
transform: none !important;
cursor: grabbing;
z-index: 10001 !important;
box-shadow:
0 30px 70px rgba(0,0,0,0.75),
inset 0 0 18px rgba(255,255,255,0.04),
0 0 40px color-mix(in srgb, var(–kob-voice-primary, #00f0ff) 40%, transparent);
}
.symbol-bar.horizontal {
flex-direction: row;
gap: 12px;
padding: 10px 14px;
border-radius: 28px;
transform-origin: top center;
}
.symbol-bar.connected {
outline: 1px dashed color-mix(in srgb, var(–kob-voice-primary, #00f0ff) 35%, transparent);
outline-offset: 6px;
}
.symbol-bar.snap {
transition: left .22s cubic-bezier(.2,.9,.3,1), top .22s cubic-bezier(.2,.9,.3,1), transform .22s ease;
}
.symbol-bar.horizontal .symbol-button {
width: 44px;
height: 44px;
border-radius: 12px;
}
.symbol-bar .orb-mini { width: 26px; height: 26px; }
.symbol-bar .magnet-halo {
position: absolute;
inset: -8px;
border-radius: inherit;
pointer-events: none;
opacity: 0;
transition: opacity .16s ease;
}
.symbol-bar.magnet-preview .magnet-halo {
opacity: 1;
background: linear-gradient(90deg, transparent, color-mix(in srgb, var(–kob-voice-primary, #00f0ff) 20%, transparent));
filter: blur(8px);
}
.symbol-bar[data-keep-inside=“true”] { max-width: calc(100vw - 12px); }

/* dock idle */
.kob-tts-dock { transition: transform .35s ease, opacity .65s ease; }
.kob-tts-dock.idle { opacity: .18; transform: scale(.92); }
.kob-tts-dock:hover { opacity: 1; transform: scale(1); }
`;
document.head.appendChild(style);
})();

/* ── 2. ARQUÉTIPOS · ORB CLICK · IDLE DOCK ───────────────── */
(function () {
const ARCHS = [
‘kobllux’,‘kodux’,‘atlas’,‘nova’,‘vitalis’,‘pulse’,
‘artemis’,‘serena’,‘kaos’,‘genus’,‘lumine’,‘solus’,
‘rhea’,‘aion’,‘uno’,‘dual’,‘trinity’,‘infodose’,‘horus’
];

function setVoiceArch(name) {
if (!name) return;
document.body.dataset.voiceArch = name;
const neb = document.querySelector(’.nebula’);
if (neb) neb.dataset.voiceArch = name;
const hud = document.getElementById(‘hudStatus’);
if (hud) hud.textContent = ‘KOBLLUX · ’ + name.toUpperCase();
const dock = document.querySelector(’.kob-tts-dock, .symbol-bar’);
if (dock) dock.animate(
[{ transform: ‘scale(1)’ }, { transform: ‘scale(1.03)’ }, { transform: ‘scale(1)’ }],
{ duration: 420, easing: ‘ease-out’ }
);
}

function initOrb() {
const orbBtn = document.getElementById(‘btn-arch’);
let archIndex = ARCHS.indexOf(document.body.dataset.voiceArch || ‘kobllux’);
if (archIndex < 0) archIndex = 0;

```
if (orbBtn) {
  orbBtn.addEventListener('click', () => {
    archIndex = (archIndex + 1) % ARCHS.length;
    setVoiceArch(ARCHS[archIndex]);
    document.body.dataset.archActive = '78knveeeb';
  }, { passive: true });

  let pressTimer;
  orbBtn.addEventListener('pointerdown', () => {
    pressTimer = setTimeout(() => {
      archIndex = (archIndex - 1 + ARCHS.length) % ARCHS.length;
      setVoiceArch(ARCHS[archIndex]);
    }, 450);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
    orbBtn.addEventListener(ev, () => clearTimeout(pressTimer));
  });
}

// Particles (se disponível)
try {
  if (window.particlesJS) {
    particlesJS('particles-js', {
      particles: {
        number: { value: 46, density: { enable: true, value_area: 700 } },
        color: {
          value: [
            getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-primary').trim() || '#00ffff',
            getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-secondary').trim() || '#ff00ff'
          ]
        },
        shape: { type: 'circle' },
        opacity: { value: 0.45, random: true },
        size: { value: 3, random: true },
        move: { enable: true, speed: 1.5, random: true, out_mode: 'out', attract: { enable: true, rotateX: 500, rotateY: 1000 } }
      },
      retina_detect: true
    });
  }
} catch (err) { console.warn('particles init failed', err); }

// Idle dock
const dock = document.querySelector('.kob-tts-dock') || document.querySelector('.symbol-bar');
let idleTimer;
function resetIdle() {
  if (!dock) return;
  dock.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => dock.classList.add('idle'), 1870);
}
['pointerdown', 'pointermove', 'touchstart', 'mousemove', 'keydown']
  .forEach(ev => document.addEventListener(ev, resetIdle, { passive: true }));
resetIdle();

// Arco inicial
const initial = document.body.dataset.voiceArch || 'kobllux';
setVoiceArch(initial);
document.body.dataset.archActive = document.body.dataset.archActive || '78knveeeb';

// Play toggle
document.getElementById('btn-play')?.addEventListener('click', () => {
  document.body.classList.toggle('speaking');
});

// Botões data-url (click abre em nova aba — fallback se kob-glue não estiver presente)
document.querySelectorAll('.symbol-button[data-url]').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    if (url && url !== 'about:blank') window.open(url, '_blank');
  });
});
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, initOrb);
} else {
initOrb();
}
})();

/* ── 3. SYMBOL BAR · DRAG / SNAP / CONNECT / PERSISTENCE ─── */
(function () {
const STORAGE_KEY       = ‘di_symbol_positions_v1’;
const SNAP_MARGIN       = 72;
const TOP_THRESHOLD     = 80;
const CONNECT_THRESHOLD = 72;
const EDGE_PADDING      = 12;

function init() {
const bars = Array.from(document.querySelectorAll(’.symbol-bar’));
if (!bars.length) return;

```
bars.forEach((bar, idx) => {
  if (!bar.dataset.sbId) bar.dataset.sbId = `symbolbar_${idx + 1}`;
  if (!bar.querySelector('.magnet-halo')) {
    const halo = document.createElement('div');
    halo.className = 'magnet-halo';
    bar.appendChild(halo);
  }
});

const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
})();

bars.forEach(bar => {
  const pos = saved[bar.dataset.sbId];
  if (pos && typeof pos === 'object') {
    bar.style.left  = pos.left + 'px';
    bar.style.top   = pos.top  + 'px';
    bar.style.right = 'auto';
    bar.classList.toggle('horizontal', !!pos.horizontal);
  }
  if (!bar.hasAttribute('data-keep-inside')) bar.setAttribute('data-keep-inside', 'true');
});

/* helpers */
const vp       = () => ({ w: window.innerWidth, h: window.innerHeight });
const dist     = (a, b) => Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
const clamp    = (v, a, b) => Math.max(a, Math.min(b, v));

function savePosition(bar) {
  try {
    const r     = bar.getBoundingClientRect();
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    store[bar.dataset.sbId] = { left: Math.round(r.left), top: Math.round(r.top), horizontal: bar.classList.contains('horizontal') };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) { /* ignore */ }
}

function resetPosition(bar) {
  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  delete store[bar.dataset.sbId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  bar.style.left = bar.style.top = bar.style.right = '';
  bar.style.transform = 'translateY(-50%)';
  bar.classList.remove('horizontal', 'connected', 'snap', 'dragging', 'magnet-preview');
}

function finalizeSnap(bar) {
  const v    = vp();
  const rect = bar.getBoundingClientRect();
  let x = rect.left, y = rect.top;

  if (rect.left <= SNAP_MARGIN)           { x = EDGE_PADDING; bar.classList.remove('horizontal'); }
  else if (rect.right >= v.w - SNAP_MARGIN) { x = v.w - rect.width - EDGE_PADDING; bar.classList.remove('horizontal'); }

  if (rect.top <= TOP_THRESHOLD) {
    bar.classList.add('horizontal');
    x = clamp(x, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
    y = EDGE_PADDING + 6;
  } else {
    bar.classList.remove('horizontal');
    y = clamp(y, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
  }

  /* inter-dock connect */
  const myC = { x: x + rect.width/2, y: y + rect.height/2 };
  let nearest = null, nearestDist = Infinity;
  bars.forEach(other => {
    if (other === bar) return;
    const o = other.getBoundingClientRect();
    const d = dist(myC, { x: o.left + o.width/2, y: o.top + o.height/2 });
    if (d < nearestDist) { nearestDist = d; nearest = other; }
  });

  if (nearest && nearestDist <= CONNECT_THRESHOLD) {
    const o = nearest.getBoundingClientRect();
    if (nearest.classList.contains('horizontal')) {
      x = clamp(o.left, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
      y = clamp(o.top + o.height + 8, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
    } else {
      x = myC.x >= o.left + o.width/2
        ? clamp(o.left + o.width + 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING)
        : clamp(o.left - rect.width - 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
      y = clamp(o.top, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
    }
    bar.classList.add('connected');
    nearest.classList.add('connected');
  } else {
    bars.forEach(b => b.classList.remove('connected'));
    bar.classList.remove('connected');
  }

  bar.classList.add('snap');
  bar.style.left  = Math.round(x) + 'px';
  bar.style.top   = Math.round(y) + 'px';
  bar.style.right = 'auto';
  setTimeout(() => bar.classList.remove('snap'), 300);
  savePosition(bar);
}

function checkMagnetPreview(activeBar) {
  const r = activeBar.getBoundingClientRect();
  const v = vp();
  let preview = r.left <= SNAP_MARGIN || r.right >= v.w - SNAP_MARGIN || r.top <= TOP_THRESHOLD;
  if (!preview) {
    for (const other of bars) {
      if (other === activeBar) continue;
      const o = other.getBoundingClientRect();
      if (dist({ x: r.left + r.width/2, y: r.top + r.height/2 }, { x: o.left + o.width/2, y: o.top + o.height/2 }) <= CONNECT_THRESHOLD) { preview = true; break; }
    }
  }
  activeBar.classList.toggle('magnet-preview', preview);
  const halo = activeBar.querySelector('.magnet-halo');
  if (halo) halo.style.opacity = preview ? '0.95' : '0';
}

/* drag per bar */
bars.forEach(bar => {
  let dragging = false, pointerId = null;
  let startX = 0, startY = 0, barStartLeft = 0, barStartTop = 0;

  function ensureAbsoluteCoords() {
    const rect = bar.getBoundingClientRect();
    if (!bar.style.left) bar.style.left = rect.left + 'px';
    if (!bar.style.top)  bar.style.top  = rect.top  + 'px';
    bar.style.transform = 'none';
  }

  bar.addEventListener('pointerdown', (e) => {
    if (e.button === 2) return;
    /* Não inicia drag do bar se o alvo é um symbol-button com data-url
       (esses pertencem ao drag-to-materialize) */
    if (e.target.closest('.symbol-button[data-url]')) return;

    dragging    = true;
    pointerId   = e.pointerId;
    try { bar.setPointerCapture(pointerId); } catch(_) {}
    bar.classList.add('dragging', 'magnet-preview');
    ensureAbsoluteCoords();

    const rect    = bar.getBoundingClientRect();
    startX        = e.clientX;
    startY        = e.clientY;
    barStartLeft  = rect.left;
    barStartTop   = rect.top;

    let latest = null;
    const moveHandler = ev => { latest = ev; };

    function frame() {
      if (!dragging) return;
      if (latest) {
        bar.style.left = Math.round(clamp(barStartLeft + latest.clientX - startX, EDGE_PADDING - 2000, window.innerWidth  - 40)) + 'px';
        bar.style.top  = Math.round(clamp(barStartTop  + latest.clientY - startY, EDGE_PADDING - 2000, window.innerHeight - 40)) + 'px';
        checkMagnetPreview(bar);
        latest = null;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    bar.addEventListener('pointermove', moveHandler);

    function upHandler(ev) {
      if (!dragging) return;
      dragging = false;
      bar.removeEventListener('pointermove', moveHandler);
      document.removeEventListener('pointerup',     upHandler);
      document.removeEventListener('pointercancel', upHandler);
      try { bar.releasePointerCapture(pointerId); } catch(_) {}
      bar.classList.remove('dragging', 'magnet-preview');
      finalizeSnap(bar);
    }
    document.addEventListener('pointerup',     upHandler);
    document.addEventListener('pointercancel', upHandler);

  }, { passive: true });

  bar.addEventListener('dblclick',  (e) => { e.stopPropagation(); resetPosition(bar); });
  bar.addEventListener('keydown',   (e) => { if (e.key === 'Escape') { bar.classList.remove('dragging', 'magnet-preview'); finalizeSnap(bar); } });
});

/* resize clamp */
window.addEventListener('resize', () => {
  bars.forEach(bar => {
    const r = bar.getBoundingClientRect(), v = vp();
    bar.style.left = clamp(r.left, EDGE_PADDING, v.w - r.width  - EDGE_PADDING) + 'px';
    bar.style.top  = clamp(r.top,  EDGE_PADDING, v.h - r.height - EDGE_PADDING) + 'px';
    savePosition(bar);
  });
});

/* limpa .connected fora das bars */
document.addEventListener('pointerdown', ev => {
  if (!ev.target.closest('.symbol-bar'))
    setTimeout(() => bars.forEach(b => b.classList.remove('connected')), 120);
});

/* API pública */
window.DI_SYMBOL_BAR = {
  resetAll:  () => bars.forEach(resetPosition),
  saveAll:   () => bars.forEach(savePosition),
  getState:  () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; } }
};

/* clamp inicial */
setTimeout(() => {
  bars.forEach(bar => {
    if (!bar.style.left && !bar.style.top) return;
    const r = bar.getBoundingClientRect(), v = vp();
    bar.style.left  = clamp(parseFloat(bar.style.left || r.left), EDGE_PADDING, v.w - r.width  - EDGE_PADDING) + 'px';
    bar.style.top   = clamp(parseFloat(bar.style.top  || r.top),  EDGE_PADDING, v.h - r.height - EDGE_PADDING) + 'px';
    bar.style.right = 'auto';
  });
}, 100);
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}
})();
