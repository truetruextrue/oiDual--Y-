// src/components/kob-tts-dock.js
const tpl = document.createElement('template');
tpl.innerHTML = /*html*/`
  <style>
    :host { position: fixed; left: var(--tts-left, 8px); bottom: calc(var(--tts-bottom, 240px) + env(safe-area-inset-bottom,0px)); z-index: 9999; display:block; }
    .dock { display:flex; flex-direction:column; gap:8px; padding:6px; border-radius:12px; background:rgba(15,18,28,.38); border:1px solid rgba(255,255,255,.12); box-shadow:0 12px 26px rgba(0,0,0,.35); }
    .btn { width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.18); cursor:pointer; }
    .btn[aria-pressed="true"] { outline:2px solid #00e28b; }
  
  :root {
  /* duração da transição de cor / glow */
    --kob-voice-theme-duration: 520ms;
}
/* Quem responde às mudanças de tema de voz */
  body,
  .nebula,
  details.acc,
  .btn,
  #fab,
  .kob-tts-dock,
  .kob-tts-panel.is-dock {
  transition:
      background var(--kob-voice-theme-duration) ease,
      box-shadow var(--kob-voice-theme-duration) ease,
      border-color var(--kob-voice-theme-duration) ease,
      color var(--kob-voice-theme-duration) ease;
}
/* Opcional: marcador visual do arquétipo atual */
  body[data-voice-arch] .nebula::before {
  content: attr(data-voice-arch);
  position:absolute;
  top:10px;
  right:14px;
  padding:4px 8px;
  font-size:11px;
  letter-spacing:.08em;
  text-transform:uppercase;
  border-radius:999px;
  background:rgba(0,0,0,.45);
  border:1px solid rgba(255,255,255,.20);
  color:var(--ink);
  backdrop-filter:blur(6px);
  pointer-events:none;
}
:root {
  --kob-voice-primary:   #78e3ff;
  --kob-voice-secondary: #b978ff;
  --kob-voice-accent:    #ffffff;
  --kob-voice-bg-soft:radial-gradient(900px 700px at 50% 10%,rgba(123,243,255,.06),transparent 80%),
             radial-gradient(600px 600px at 70% 100%,rgba(180,120,255,.04),transparent 80%),
             var(--bg);
  --kob-voice-glow:      0 0 18px rgba(0,216,216,0.55);
}
/* Dock do TTS acompanha a voz atual */
.kob-tts-dock {
  background: var(--kob-voice-bg-soft);
  box-shadow: var(--kob-voice-glow);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
}
.kob-tts-dock button[data-tts-btn="toggle"] {
  border: 1px solid var(--kob-voice-primary);
  color:  var(--kob-voice-accent);
}
.kob-tts-dock button[data-tts-btn="sel"],
.kob-tts-dock button[data-tts-btn="stop"] {
  border: 1px solid rgba(255,255,255,0.16);
}
/* Se você marcar algum bloco como "sendo lido" no futuro */
[data-being-read="true"] {
  outline: 1px solid var(--kob-voice-primary);
  background: var(--kob-voice-bg-soft);
}
/* Tema adicional por arquétipo (opcional, pra brincar com o body) */
body[data-voice-arch="kobllux"] {
  --kob-voice-primary:#00d8d8;
  --kob-voice-secondary:#d800d8;
}
body[data-voice-arch="nova"] {
  --kob-voice-primary:#FF6FB5;
  --kob-voice-secondary:#FFD6E8;
}
body[data-voice-arch="kaos"] {
  --kob-voice-primary:#FF5C8A;
  --kob-voice-secondary:#3D000F;
}
body[data-voice-arch="serena"] {
  --kob-voice-primary:#7AD3A8;
  --kob-voice-secondary:#154734;
}
body[data-voice-arch="vitalis"] {
  --kob-voice-primary:#00F5A0;
  --kob-voice-secondary:#00D9F5;
}
body[data-voice-arch="pulse"] {
  --kob-voice-primary:#A259FF;
  --kob-voice-secondary:#2D1B69;
}
body[data-voice-arch="atlas"] {
  --kob-voice-primary:#6CCFF6;
  --kob-voice-secondary:#1B4965;
}
body[data-voice-arch="lumine"] {
  --kob-voice-primary:#FFE066;
  --kob-voice-secondary:#FF9F1C;
}
body[data-voice-arch="rhea"] {
  --kob-voice-primary:#00B894;
  --kob-voice-secondary:#055E55;
}
body[data-voice-arch="solus"] {
  --kob-voice-primary:#4B6584;
  --kob-voice-secondary:#0B1420;
}
body[data-voice-arch="aion"] {
  --kob-voice-primary:#00A8E8;
  --kob-voice-secondary:#001F54;
}
body[data-voice-arch="cooplux"] {
  --kob-voice-primary:#39FFB6;
  --kob-voice-secondary:#00d8d8;
}
body[data-voice-arch="fitlux"] {
  --kob-voice-primary:#FFC857;
  --kob-voice-secondary:#FFE39A;
}
.kob-tts-dock {
  background:linear-gradient(
    42deg,
    color-mix(in srgb, var(--grad-a) 18%, transparent),
    color-mix(in srgb, var(--grad-b) 18%, transparent)
  ) !important;
  border:1px solid rgba(255,255,255,.10) !important;
  color:var(--ink) !important;
  box-shadow:0 0 18px rgba(0,0,0,.35) !important;
  backdrop-filter:blur(14px) !important;
}
.kob-tts-dock button {
  background:rgba(0,0,0,.25) !important;
  border:1px solid rgba(255,255,255,.18) !important;
  color:var(--ink) !important;
}
.kob-tts-dock {
  transform: scale(0.85);
  transform-origin: bottom right;
  /* ou onde você ancora o dock */
}

/* =======================================================================
     KOBLLUX — TTS Dock (Nebula Pro + Base Madeira)
     MOBILE-FIRST VERTICAL HARD-LOCK
     ======================================================================= */
  /* Destaque do bloco atual lido */
  [data-tts-current] {
  outline:2px dashed var(--cyan,#4cf);
  background:rgba(76,240,255,.06);
  border-radius:8px;
  transition:background .25s ease, outline .25s ease;
}
/* Tokens */
  :root {
  --tts-dock-left: 8px;
  /* ajuste livre */
    --tts-dock-bottom: 269px;
  /* ajuste livre */
    --tts-gap: 10px;
  --tts-glass-bg: rgba(15,18,28,.38);
  --tts-glass-bd: rgba(255,255,255,.12);
  --tts-glow:     rgba(76,240,255,.85);
  /* ciano (Nebula) */
    --tts-ink:      rgba(255,255,255,.92);
  --tts-ink-dim:  rgba(255,255,255,.68);
  --tts-accent:   color-mix(in srgb, #00e28b 55%, var(--tts-glow) 45%);
  /* Base Madeira + ciano */
}
/* Base inline (fallback) */
  .kob-tts-panel {
  display:flex;
  gap:.5rem;
  align-items:center;
  flex-wrap:wrap;
  margin:.5rem 0
}
.kob-tts-panel button {
  padding:.5rem .75rem;
  border:1px solid rgba(255,255,255,.2);
  background:rgba(255,255,255,.05);
  backdrop-filter:saturate(1.2) blur(2px);
  border-radius:10px
}
.kob-tts-panel small {
  opacity:.8
}
/* Dock vertical fixo */
  .kob-tts-panel.is-dock {
  position: fixed;
  left: var(--tts-dock-left);
  bottom: calc(var(--tts-dock-bottom) + env(safe-area-inset-bottom, 0px));
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--tts-gap);
  align-items: stretch;
  padding: .6rem;
  border-radius: 16px;
  background: var(--tts-glass-bg);
  border: 1px solid var(--tts-glass-bd);
  -webkit-backdrop-filter: blur(10px) saturate(1.15);
  backdrop-filter: blur(10px) saturate(1.15);
  box-shadow: 0 12px 26px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.05);
  touch-action: none;
  /* habilita drag suave */
    cursor: grab;
}
.kob-tts-panel.is-dock.is-dragging {
  cursor: grabbing;
  transition: none !important;
}
.kob-tts-panel.is-dock button {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: var(--tts-ink-dim);
  font-size: 20px;
  line-height: 1;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,.18);
  background:
      linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02)) padding-box,
      linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.05)) border-box;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, color .16s ease, background .16s ease;
}
.kob-tts-panel.is-dock button:hover {
  transform: translateY(-1px);
  color: var(--tts-ink);
  box-shadow: 0 8px 18px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,255,255,.10);
}
.kob-tts-panel.is-dock button:active {
  transform: translateY(0);
}
.kob-tts-panel.is-dock button[aria-pressed="true"] {
  color: var(--tts-ink);
  background:
      radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--tts-glow), transparent 65%) 0%, transparent 60%) padding-box,
      linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.08)) border-box;
  outline: 2px solid color-mix(in srgb, var(--tts-glow) 70%, var(--tts-accent) 30%);
  box-shadow:
      0 0 18px -2px color-mix(in srgb, var(--tts-glow) 70%, var(--tts-accent) 30%),
      0 10px 26px rgba(0,0,0,.38),
      inset 0 0 0 1px rgba(255,255,255,.10);
}
/* micro-ripple sem JS */
  .kob-tts-panel.is-dock button::after {
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  opacity:0;
  box-shadow: 0 0 0 0 var(--tts-glow);
  transition: box-shadow .4s ease, opacity .4s ease;
}
.kob-tts-panel.is-dock button:active::after {
  opacity:.4;
  box-shadow: 0 0 0 10px transparent;
}
.kob-tts-panel.is-dock small[data-tts-status] {
  margin-top: .15rem;
  font-size: 11px;
  letter-spacing: .2px;
  opacity: .78;
  color: var(--tts-ink);
  max-width: 172px;
  text-wrap: balance;
}
.kob-tts-panel.is-dock button:focus-visible {
  outline: 2px solid var(--tts-accent);
  outline-offset: 2px;
}
@supports not ((backdrop-filter: blur(10px))) {
  .kob-tts-panel.is-dock {
  background: rgba(20,22,28,.85);
}
}
@media (prefers-reduced-motion: reduce) {
  .kob-tts-panel.is-dock, .kob-tts-panel.is-dock button {
  transition: none !important;
}
}
@media print {
  .kob-tts-panel.is-dock {
  display:none !important;
}
}
/* Espaço opcional no conteúdo quando o dock existir */
  body.kob-tts-dock-padding {
  padding-left: calc(var(--tts-dock-left) + 72px);
}
  </style>
  <div class="dock" role="toolbar" aria-label="TTS Dock">
    <button class="btn" data-action="play" title="Play">▶</button>
    <button class="btn" data-action="stop" title="Stop">■</button>
    <small id="status">TTS</small>
  </div>
`;

class KobTtsDock extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'}).appendChild(tpl.content.cloneNode(true));
    this.$dock = this.shadowRoot.querySelector('.dock');
    this.$status = this.shadowRoot.getElementById('status');
    this._dragging = false;
    this._pos = {left: 8, bottom: 240};
    this._onPointerDown = this._onPointerDown.bind(this);
  }

  connectedCallback(){
    this._loadPos();
    this.$dock.addEventListener('pointerdown', this._onPointerDown);
    this.shadowRoot.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action]');
      if(!btn) return;
      const act = btn.dataset.action;
      this._handleAction(act, btn);
    });
  }

  _setStyleFromPos(){
    // aplica via inline style para permitir override via CSS custom props
    this.style.left = `${this._pos.left}px`;
    this.style.bottom = `${this._pos.bottom}px`;
    // também espelha para css var se alguém quiser query
    this.style.setProperty('--tts-left', `${this._pos.left}px`);
    this.style.setProperty('--tts-bottom', `${this._pos.bottom}px`);
  }

  _loadPos(){
    try {
      const raw = localStorage.getItem('kob_tts_pos');
      if(raw) this._pos = JSON.parse(raw);
    } catch(e){}
    this._setStyleFromPos();
  }

  _savePos(){
    try { localStorage.setItem('kob_tts_pos', JSON.stringify(this._pos)); } catch(e){}
  }

  _onPointerDown(e){
    // apenas drag na própria dock (não nos botões)
    if(e.target.closest('[data-action]')) return;
    this._dragging = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = this._pos.left;
    const startBottom = this._pos.bottom;
    const move = (ev)=>{
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // invert Y porque armazenamos bottom
      this._pos.left = Math.max(6, startLeft + dx);
      this._pos.bottom = Math.max(6, startBottom - dy);
      this._setStyleFromPos();
    };
    const up = ()=>{
      this._dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this._savePos();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  _handleAction(action, btn){
    if(action === 'play') {
      this.$status.textContent = 'Playing…';
      btn.setAttribute('aria-pressed', 'true');
      window.dispatchEvent(new CustomEvent('kob-tts:play'));
    } else if(action==='stop') {
      this.$status.textContent = 'Stopped';
      this.shadowRoot.querySelector('[data-action="play"]')?.removeAttribute('aria-pressed');
      window.dispatchEvent(new CustomEvent('kob-tts:stop'));
    }
  }
}

customElements.define('kob-tts-dock', KobTtsDock);
