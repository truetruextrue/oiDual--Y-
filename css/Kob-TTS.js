// src/components/kob-tts-dock.js
const tpl = document.createElement('template');
tpl.innerHTML = /*html*/`
  <style>
    :host {
      position: fixed;
      left: var(--tts-left, 8px);
      bottom: calc(var(--tts-bottom, 240px) + env(safe-area-inset-bottom,0px));
      z-index: 9999;
      display: block;
      touch-action: none;
      user-select: none;
      transition:
        left 420ms cubic-bezier(.22,1,.36,1),
        bottom 420ms cubic-bezier(.22,1,.36,1),
        transform 260ms ease;
    }

    :host(.dragging) {
      transition: none !important;
      transform: scale(1.04);
    }

    .dock {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      border-radius: 14px;
      background: linear-gradient(
        180deg,
        rgba(18,22,38,.55),
        rgba(10,12,22,.35)
      );
      border: 1px solid rgba(255,255,255,.14);
      box-shadow:
        0 20px 40px rgba(0,0,0,.45),
        inset 0 0 0 1px rgba(255,255,255,.04);
      backdrop-filter: blur(14px) saturate(160%);
    }

    .btn {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 18px;
      color: #eaffff;
      background:
        linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.02));
      border: 1px solid rgba(255,255,255,.18);
      cursor: pointer;
      transition:
        transform .18s ease,
        box-shadow .18s ease,
        background .18s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,.35);
    }

    .btn:active {
      transform: scale(.96);
    }

    .btn[aria-pressed="true"] {
      outline: 2px solid #00ffcc;
      box-shadow: 0 0 18px rgba(0,255,200,.45);
    }

    .status {
      font-size: 11px;
      text-align: center;
      opacity: .75;
      padding-top: 2px;
    }
  </style>

  <div class="dock" role="toolbar" aria-label="TTS Dock">
    <button class="btn" data-action="play" title="Play">▶</button>
    <button class="btn" data-action="pause" title="Pause">⏸</button>
    <button class="btn" data-action="stop" title="Stop">■</button>
    <div class="status" id="status">TTS</div>
  </div>
`;

class KobTtsDock extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'}).appendChild(tpl.content.cloneNode(true));

    this.$dock   = this.shadowRoot.querySelector('.dock');
    this.$status = this.shadowRoot.getElementById('status');

    this._pos = { left: 8, bottom: 240 };
    this._dragging = false;

    this._onPointerDown = this._onPointerDown.bind(this);
  }

  connectedCallback(){
    this._loadPos();
    this.$dock.addEventListener('pointerdown', this._onPointerDown);

    this.shadowRoot.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-action]');
      if(!btn) return;
      this._handleAction(btn.dataset.action, btn);
    });
  }

  /* -----------------------
     POSITION + SNAP
  ------------------------ */

  _setPos(left, bottom){
    this._pos.left = left;
    this._pos.bottom = bottom;

    this.style.left = `${left}px`;
    this.style.bottom = `${bottom}px`;

    this.style.setProperty('--tts-left', `${left}px`);
    this.style.setProperty('--tts-bottom', `${bottom}px`);
  }

  _snap(){
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const dockRect = this.getBoundingClientRect();
    const margin = 8;

    const snapLeft  = margin;
    const snapRight = vw - dockRect.width - margin;

    const targetLeft =
      dockRect.left + dockRect.width / 2 < vw / 2
        ? snapLeft
        : snapRight;

    const maxBottom = vh - dockRect.height - margin;
    const targetBottom = Math.min(
      Math.max(this._pos.bottom, margin),
      maxBottom
    );

    this._setPos(targetLeft, targetBottom);
    this._savePos();
  }

  /* -----------------------
     DRAG HANDLING
  ------------------------ */

  _onPointerDown(e){
    if(e.target.closest('[data-action]')) return;

    this._dragging = true;
    this.classList.add('dragging');

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = this._pos.left;
    const startBottom = this._pos.bottom;

    const move = (ev)=>{
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      this._setPos(
        Math.max(4, startLeft + dx),
        Math.max(4, startBottom - dy)
      );
    };

    const up = ()=>{
      this._dragging = false;
      this.classList.remove('dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this._snap();
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  /* -----------------------
     ACTIONS
  ------------------------ */

  _handleAction(action, btn){
    this.shadowRoot
      .querySelectorAll('.btn')
      .forEach(b=>b.removeAttribute('aria-pressed'));

    if(action === 'play'){
      btn.setAttribute('aria-pressed','true');
      this.$status.textContent = 'Playing…';
      window.dispatchEvent(new CustomEvent('kob-tts:play'));
    }

    if(action === 'pause'){
      btn.setAttribute('aria-pressed','true');
      this.$status.textContent = 'Paused';
      window.dispatchEvent(new CustomEvent('kob-tts:pause'));
    }

    if(action === 'stop'){
      this.$status.textContent = 'Stopped';
      window.dispatchEvent(new CustomEvent('kob-tts:stop'));
    }
  }

  /* -----------------------
     STORAGE
  ------------------------ */

  _loadPos(){
    try {
      const raw = localStorage.getItem('kob_tts_pos');
      if(raw) this._pos = JSON.parse(raw);
    } catch(e){}
    this._setPos(this._pos.left, this._pos.bottom);
  }

  _savePos(){
    try {
      localStorage.setItem('kob_tts_pos', JSON.stringify(this._pos));
    } catch(e){}
  }
}

customElements.define('kob-tts-dock', KobTtsDock);
