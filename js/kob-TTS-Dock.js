// src/components/kob-tts-dock.js
const tpl = document.createElement('template');
tpl.innerHTML = /*html*/`
  <style>
    :host { position: fixed; left: var(--tts-left, 8px); bottom: calc(var(--tts-bottom, 240px) + env(safe-area-inset-bottom,0px)); z-index: 9999; display:block; }
    .dock { display:flex; flex-direction:column; gap:8px; padding:6px; border-radius:12px; background:rgba(15,18,28,.38); border:1px solid rgba(255,255,255,.12); box-shadow:0 12px 26px rgba(0,0,0,.35); }
    .btn { width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.18); cursor:pointer; }
    .btn[aria-pressed="true"] { outline:2px solid #00e28b; }
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
