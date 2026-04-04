/**

- ╔══════════════════════════════════════════════════════════╗
- ║   KOBLLUX · DRAG-TO-MATERIALIZE CONTROLLER              ║
- ║   symbol-button → float → snap:dock | center:window     ║
- ║   Versão: DM-1.0 · Compatível com kard-m0d-BASE         ║
- ╚══════════════════════════════════════════════════════════╝
- 
- COMO USAR:
- Cole este <script> no final do body, APÓS os scripts externos.
- 
- FLUXO:
- 1. Toque/clique no .symbol-button → inicia timer de 1.2s
- 1. Segurou 1.2s → estado ARMADO (feedback visual no botão)
- 1. Moveu > 10px enquanto armado → DRAG ativo (ghost flutua)
- 1. Solto em zona lateral (< 80px da borda) → DOCK (snap)
- 1. Solto no centro → MATERIALIZA janela session-window
- 
- CLASSES CSS USADAS (adicione no seu CSS ou deixe o script injetar):
- .floating   — ghost e janela flutuante
- .snap-left  — indicador snap esquerda
- .snap-right — indicador snap direita
- .sw-active  — janela materializada ativa
  */

(function () {
‘use strict’;

/* ── CONFIGURAÇÃO ─────────────────────────── */
const CFG = {
HOLD_MS:        1200,   // ms de hold para armar o drag
MOVE_THRESHOLD: 10,     // px de movimento para confirmar drag
SNAP_ZONE:      80,     // px da borda para ativar snap/dock
WIN_W:          320,    // largura padrão da janela materializada
WIN_H:          480,    // altura padrão
Z_BASE:         9000,   // z-index base das janelas materializadas
};

/* ── ESTADO INTERNO ───────────────────────── */
let state = {
armed:       false,
dragging:    false,
holdTimer:   null,
srcBtn:      null,
ghost:       null,
offsetX:     0,
offsetY:     0,
startX:      0,
startY:      0,
zCounter:    CFG.Z_BASE,
};

/* ── INJEÇÃO DE CSS NECESSÁRIO ────────────── */
function injectStyles() {
if (document.getElementById(‘kdm-styles’)) return;
const s = document.createElement(‘style’);
s.id = ‘kdm-styles’;
s.textContent = `
/* Ghost flutuante */
#kdm-ghost {
position: fixed;
z-index: 99999;
pointer-events: none;
display: flex;
align-items: center;
justify-content: center;
border-radius: 16px;
font-size: 22px;
color: #fff;
background: rgba(0, 240, 255, 0.18);
border: 1.5px solid rgba(0, 240, 255, 0.7);
box-shadow: 0 0 24px rgba(0,240,255,0.5);
transition: box-shadow 0.18s, border-color 0.18s;
will-change: left, top;
}
#kdm-ghost.snap-left,
#kdm-ghost.snap-right {
border-color: rgba(0, 255, 180, 0.9);
box-shadow: 0 0 32px rgba(0,255,180,0.6), 0 0 8px rgba(0,255,180,0.3) inset;
}

```
  /* Indicador de zona snap */
  #kdm-snap-indicator {
    position: fixed;
    top: 0; bottom: 0;
    width: 60px;
    background: linear-gradient(to right, rgba(0,255,180,0.12), transparent);
    pointer-events: none;
    z-index: 99990;
    opacity: 0;
    transition: opacity 0.2s;
    border-right: 1px solid rgba(0,255,180,0.2);
  }
  #kdm-snap-indicator.right {
    right: 0; left: auto;
    background: linear-gradient(to left, rgba(0,255,180,0.12), transparent);
    border-right: none;
    border-left: 1px solid rgba(0,255,180,0.2);
  }
  #kdm-snap-indicator.visible { opacity: 1; }

  /* Janela materializada */
  .kdm-window {
    position: fixed;
    display: flex;
    flex-direction: column;
    background: rgba(8, 14, 30, 0.88);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border: 1px solid rgba(0, 240, 255, 0.25);
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 0 40px rgba(0,240,255,0.12),
      0 24px 64px rgba(0,0,0,0.7);
    animation: kdm-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: height 0.28s cubic-bezier(0.16,1,0.3,1),
                opacity 0.22s, transform 0.22s;
  }
  .kdm-window.focus {
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.06) inset,
      0 0 50px rgba(0,240,255,0.2),
      0 24px 64px rgba(0,0,0,0.8);
  }
  .kdm-window.collapsed { height: 44px !important; }
  .kdm-window.collapsed .kdm-body { display: none !important; }
  .kdm-window.closing {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }

  /* Header da janela */
  .kdm-header {
    height: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    cursor: grab;
    user-select: none;
    background: rgba(0,240,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .kdm-header:active { cursor: grabbing; }
  .kdm-header.dragging { cursor: grabbing; }

  .kdm-title {
    font-family: 'JetBrains Mono', 'Orbitron', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: rgba(0, 240, 255, 0.85);
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .kdm-controls { display: flex; gap: 6px; flex-shrink: 0; }
  .kdm-btn {
    width: 22px; height: 22px;
    border-radius: 50%; border: 0;
    cursor: pointer; font-size: 9px; font-weight: 900;
    display: grid; place-items: center;
    transition: filter 0.15s, transform 0.15s;
  }
  .kdm-btn:hover { filter: brightness(1.3); transform: scale(1.12); }
  .kdm-btn-collapse { background: rgba(255, 165, 0, 0.7); color: rgba(0,0,0,0.8); }
  .kdm-btn-close    { background: rgba(255, 55, 55, 0.7); color: rgba(0,0,0,0.8); }

  /* Body/iframe */
  .kdm-body {
    flex: 1;
    position: relative;
    background: #000;
    overflow: hidden;
  }
  .kdm-body iframe {
    width: 100%; height: 100%;
    border: 0; display: block;
  }
  .kdm-body .kdm-drag-shield {
    position: absolute; inset: 0;
    z-index: 10; display: none;
  }

  /* Dock bubble */
  .kdm-dock-bubble {
    width: 42px; height: 42px;
    border-radius: 50%;
    display: grid; place-items: center;
    cursor: pointer; font-size: 18px;
    background: rgba(0,240,255,0.12);
    border: 1px solid rgba(0,240,255,0.3);
    transition: 0.28s cubic-bezier(0.16,1,0.3,1);
    animation: kdm-in 0.28s cubic-bezier(0.16,1,0.3,1) both;
    position: relative;
    flex-shrink: 0;
  }
  .kdm-dock-bubble:hover {
    transform: translateY(-8px) scale(1.12);
    background: rgba(0,240,255,0.25);
    box-shadow: 0 8px 20px rgba(0,240,255,0.25);
  }
  .kdm-dock-bubble::after {
    content: '';
    position: absolute; bottom: -4px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: rgba(0,240,255,0.8);
    box-shadow: 0 0 6px rgba(0,240,255,0.8);
  }

  /* Animação de entrada */
  @keyframes kdm-in {
    from { opacity: 0; transform: scale(0.82); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* Feedback visual no botão quando armado */
  .symbol-button.kdm-armed {
    box-shadow: 0 0 18px rgba(0,240,255,0.5) !important;
    border-color: rgba(0,240,255,0.6) !important;
    transform: scale(1.12) !important;
  }
`;
document.head.appendChild(s);
```

}

/* ── HELPERS ──────────────────────────────── */
function nextZ() {
return ++state.zCounter;
}

function focusWindow(win) {
document.querySelectorAll(’.kdm-window’).forEach(w => w.classList.remove(‘focus’));
win.style.zIndex = nextZ();
win.classList.add(‘focus’);
}

function getDock() {
// Tenta o #dock nativo, se não houver cria um container simples
let dock = document.getElementById(‘dock’);
if (!dock) {
dock = document.createElement(‘div’);
dock.id = ‘dock’;
dock.style.cssText = `position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; padding: 10px 18px; border-radius: 40px; background: rgba(0,0,0,0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); z-index: 9998; transition: 0.3s; flex-wrap: nowrap;`;
document.body.appendChild(dock);
}
return dock;
}

/* ── GHOST ────────────────────────────────── */
function spawnGhost(btn) {
const rect = btn.getBoundingClientRect();
const g = document.createElement(‘div’);
g.id = ‘kdm-ghost’;
g.innerHTML = btn.innerHTML;
g.style.left   = rect.left + ‘px’;
g.style.top    = rect.top  + ‘px’;
g.style.width  = rect.width  + ‘px’;
g.style.height = rect.height + ‘px’;
document.body.appendChild(g);
return g;
}

/* ── SNAP INDICATOR ───────────────────────── */
function getSnapIndicator() {
let ind = document.getElementById(‘kdm-snap-indicator’);
if (!ind) {
ind = document.createElement(‘div’);
ind.id = ‘kdm-snap-indicator’;
document.body.appendChild(ind);
}
return ind;
}

function updateSnap(clientX) {
const g   = state.ghost;
const ind = getSnapIndicator();
const W   = window.innerWidth;

```
if (clientX < CFG.SNAP_ZONE) {
  g.classList.add('snap-left');
  g.classList.remove('snap-right');
  ind.className = 'visible';
} else if (clientX > W - CFG.SNAP_ZONE) {
  g.classList.add('snap-right');
  g.classList.remove('snap-left');
  ind.className = 'right visible';
} else {
  g.classList.remove('snap-left', 'snap-right');
  ind.className = '';
}
```

}

function hideSnap() {
const ind = document.getElementById(‘kdm-snap-indicator’);
if (ind) ind.className = ‘’;
}

/* ── CLEANUP ──────────────────────────────── */
function cleanup() {
clearTimeout(state.holdTimer);
state.holdTimer = null;
state.armed    = false;
state.dragging = false;

```
if (state.ghost) { state.ghost.remove(); state.ghost = null; }
if (state.srcBtn) {
  state.srcBtn.style.opacity  = '';
  state.srcBtn.classList.remove('kdm-armed');
}
state.srcBtn = null;
hideSnap();
```

}

/* ── MATERIALIZAR JANELA ──────────────────── */
function materializeWindow(btn, dropX, dropY) {
const url   = btn.dataset.url || ‘about:blank’;
const id    = ‘kdm-win-’ + (btn.dataset.id || Date.now());
const label = btn.getAttribute(‘data-title’) || btn.title || btn.dataset.id || ‘APP’;
const icon  = btn.textContent.trim() || ‘◌’;

```
// Se já existe janela para esse ID, só restaura
const existing = document.getElementById(id);
if (existing) {
  existing.classList.remove('collapsed');
  focusWindow(existing);
  return;
}

// Posição: centralizado no drop, sem sair da tela
const left = Math.max(8, Math.min(dropX - CFG.WIN_W / 2, window.innerWidth  - CFG.WIN_W  - 8));
const top  = Math.max(30, Math.min(dropY - 30,           window.innerHeight - CFG.WIN_H - 8));

const win = document.createElement('div');
win.className = 'kdm-window focus';
win.id = id;
win.style.cssText = `
  width: ${CFG.WIN_W}px;
  height: ${CFG.WIN_H}px;
  left: ${left}px;
  top: ${top}px;
  z-index: ${nextZ()};
`;

win.innerHTML = `
  <div class="kdm-header">
    <div class="kdm-title">
      <span style="font-size:16px">${icon}</span>
      <span>${label}</span>
    </div>
    <div class="kdm-controls">
      <button class="kdm-btn kdm-btn-collapse" title="Colapsar">—</button>
      <button class="kdm-btn kdm-btn-close" title="Fechar">✕</button>
    </div>
  </div>
  <div class="kdm-body">
    <iframe
      src="${url}"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      allow="fullscreen; clipboard-write; accelerometer"
      loading="lazy">
    </iframe>
    <div class="kdm-drag-shield"></div>
  </div>
`;

document.body.appendChild(win);

// Foco ao clicar
win.addEventListener('pointerdown', () => focusWindow(win));

// Botões
win.querySelector('.kdm-btn-collapse').addEventListener('click', (e) => {
  e.stopPropagation();
  win.classList.toggle('collapsed');
});
win.querySelector('.kdm-btn-close').addEventListener('click', (e) => {
  e.stopPropagation();
  win.classList.add('closing');
  setTimeout(() => win.remove(), 240);
});

// Drag da janela materializada
makeWindowDraggable(win);
```

}

/* ── DOCK ─────────────────────────────────── */
function dockSymbol(btn) {
const dock = getDock();
const id   = ‘kdm-bubble-’ + (btn.dataset.id || Date.now());

```
// Evita duplicata
if (document.getElementById(id)) return;

const bubble = document.createElement('div');
bubble.className = 'kdm-dock-bubble';
bubble.id = id;
bubble.innerHTML = btn.innerHTML;
bubble.title = 'Restaurar ' + (btn.getAttribute('data-title') || btn.dataset.id || '');

bubble.addEventListener('click', () => {
  const dropX = window.innerWidth / 2;
  const dropY = window.innerHeight / 2;
  bubble.remove();
  materializeWindow(btn, dropX, dropY);
});

dock.appendChild(bubble);
```

}

/* ── DRAG DA JANELA MATERIALIZADA ─────────── */
function makeWindowDraggable(win) {
const header = win.querySelector(’.kdm-header’);
const shield = win.querySelector(’.kdm-drag-shield’);
let dragging = false, ox = 0, oy = 0;

```
header.addEventListener('pointerdown', (e) => {
  if (e.target.closest('button')) return;
  if (win.classList.contains('maximized') || win.classList.contains('collapsed')) return;
  dragging = true;
  ox = e.clientX - win.offsetLeft;
  oy = e.clientY - win.offsetTop;
  header.setPointerCapture(e.pointerId);
  header.classList.add('dragging');
  if (shield) shield.style.display = 'block';
  focusWindow(win);
});

header.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  let nx = e.clientX - ox;
  let ny = e.clientY - oy;
  ny = Math.max(0, ny); // Não sai pelo topo
  win.style.left = nx + 'px';
  win.style.top  = ny + 'px';
});

const stopDrag = () => {
  dragging = false;
  header.classList.remove('dragging');
  if (shield) shield.style.display = 'none';
};
header.addEventListener('pointerup',    stopDrag);
header.addEventListener('pointercancel', stopDrag);
```

}

/* ── LISTENERS PRINCIPAIS ─────────────────── */
function onPointerDown(e) {
const btn = e.target.closest(’[data-url].symbol-button, [data-url].symbol-btn’);
if (!btn || !btn.dataset.url) return;

```
// Ignore botões de controle
if (e.target.closest('button:not(.symbol-button):not(.symbol-btn)')) return;

state.srcBtn = btn;
state.startX = e.clientX;
state.startY = e.clientY;
state.armed  = false;
state.dragging = false;

// Arma após HOLD_MS de segurar
state.holdTimer = setTimeout(() => {
  if (!state.srcBtn) return;
  state.armed = true;
  state.srcBtn.classList.add('kdm-armed');
}, CFG.HOLD_MS);
```

}

function onPointerMove(e) {
if (!state.srcBtn) return;

```
const dx   = e.clientX - state.startX;
const dy   = e.clientY - state.startY;
const dist = Math.sqrt(dx * dx + dy * dy);

// Se ainda está no timer e moveu muito → cancela tudo (foi scroll/toque rápido)
if (!state.armed && dist > CFG.MOVE_THRESHOLD * 2) {
  cleanup();
  return;
}

// Armado + movimento suficiente → ativa drag
if (state.armed && !state.dragging && dist > CFG.MOVE_THRESHOLD) {
  state.dragging = true;

  // Cancela o long-press URL editor nativo (manda Escape)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  const rect = state.srcBtn.getBoundingClientRect();
  state.offsetX = e.clientX - rect.left;
  state.offsetY = e.clientY - rect.top;

  state.ghost = spawnGhost(state.srcBtn);
  state.srcBtn.style.opacity = '0.3';
}

// Move o ghost
if (state.dragging && state.ghost) {
  const nx = e.clientX - state.offsetX;
  const ny = e.clientY - state.offsetY;
  state.ghost.style.left = nx + 'px';
  state.ghost.style.top  = ny + 'px';
  updateSnap(e.clientX);
}
```

}

function onPointerUp(e) {
if (!state.srcBtn) return;

```
if (!state.dragging) {
  // Apenas um hold ou toque normal → limpa sem fazer nada
  cleanup();
  return;
}

const snapLeft  = state.ghost && state.ghost.classList.contains('snap-left');
const snapRight = state.ghost && state.ghost.classList.contains('snap-right');
const btn       = state.srcBtn;
const dropX     = e.clientX;
const dropY     = e.clientY;

cleanup();

if (snapLeft || snapRight) {
  // → DOCK
  dockSymbol(btn);
} else {
  // → MATERIALIZAR JANELA
  materializeWindow(btn, dropX, dropY);
}
```

}

function onPointerCancel() {
cleanup();
}

/* ── INIT ─────────────────────────────────── */
function init() {
injectStyles();

```
// Usa capture para interceptar antes dos listeners existentes
document.addEventListener('pointerdown',  onPointerDown,  { capture: false, passive: true });
document.addEventListener('pointermove',  onPointerMove,  { capture: false, passive: true });
document.addEventListener('pointerup',    onPointerUp,    { capture: false });
document.addEventListener('pointercancel', onPointerCancel, { capture: false, passive: true });

// Touch: previne comportamento nativo de scroll durante drag
document.addEventListener('touchmove', (e) => {
  if (state.dragging) e.preventDefault();
}, { passive: false });

console.log('[KDM] Drag-to-Materialize Controller · Ativo ✓');
```

}

if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}

})();