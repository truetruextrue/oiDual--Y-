const tpl = document.createElement('template');
tpl.innerHTML = /*html*/`
  <style>
    :host {
      position: fixed;
      left: var(--tts-left, 8px);
      bottom: calc(var(--tts-bottom, 240px) + env(safe-area-inset-bottom, 0px));
      z-index: 9999;
      display: block;
      touch-action: none;
      user-select: none;
      transition: 
        left 420ms cubic-bezier(.22, 1, .36, 1),
        bottom 420ms cubic-bezier(.22, 1, .36, 1),
        transform 260ms ease;
    }

    :host(.dragging) {
      transition: none !important;
      transform: scale(1.05);
      cursor: grabbing;
    }

    .dock {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px;
      border-radius: 18px;
      background: var(--tts-glass-bg, rgba(15, 18, 28, 0.38));
      border: 1px solid var(--tts-glass-bd, rgba(255, 255, 255, 0.12));
      backdrop-filter: blur(14px) saturate(160%);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
      cursor: grab;
    }

    .btn {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      font-size: 18px;
      color: var(--tts-ink-dim, #eaffff);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
      color: var(--tts-ink, #fff);
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    .btn:active {
      transform: scale(0.94);
    }

    /* Cores dinâmicas baseadas no arquétipo ativo no body */
    .btn[aria-pressed="true"] {
      color: #fff;
      background: var(--kob-voice-primary, #00ffcc);
      border-color: var(--kob-voice-primary, #00ffcc);
      box-shadow: 0 0 15px var(--tts-glow, rgba(0, 255, 200, 0.4));
    }

    .status {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      opacity: 0.7;
      color: var(--tts-ink, #fff);
      padding-top: 4px;
      font-weight: bold;
    }
  </style>

  <div class="dock" role="toolbar" aria-label="TTS Dock">
    <button class="btn" data-action="play" title="Play">▶</button>
    <button class="btn" data-action="pause" title="Pause">⏸</button>
    <button class="btn" data-action="stop" title="Stop">■</button>
    <div class="status" id="status">READY</div>
  </div>
`;

class KobTtsDock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));

    this.$dock = this.shadowRoot.querySelector('.dock');
    this.$status = this.shadowRoot.getElementById('status');
    this.$buttons = this.shadowRoot.querySelectorAll('.btn');

    this._pos = { left: 8, bottom: 240 };
    this._dragging = false;

    this._onPointerDown = this._onPointerDown.bind(this);
  }

  connectedCallback() {
    this._loadPos();
    this.$dock.addEventListener('pointerdown', this._onPointerDown);
    this.shadowRoot.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) this._handleAction(btn.dataset.action, btn);
    });
  }

  /* --- Posicionamento --- */
  _setPos(left, bottom) {
    this._pos.left = left;
    this._pos.bottom = bottom;
    this.style.setProperty('--tts-left', `${left}px`);
    this.style.setProperty('--tts-bottom', `${bottom}px`);
    this.style.left = `${left}px`;
    this.style.bottom = `${bottom}px`;
  }

  _snap() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = this.getBoundingClientRect();
    const margin = 8;

    const targetLeft = (rect.left + rect.width / 2 < vw / 2) ? margin : (vw - rect.width - margin);
    const targetBottom = Math.min(Math.max(this._pos.bottom, margin), vh - rect.height - margin);

    this._setPos(targetLeft, targetBottom);
    this._savePos();
  }

  /* --- Drag & Drop --- */
  _onPointerDown(e) {
    if (e.target.closest('[data-action]')) return;
    
    this._dragging = true;
    this.classList.add('dragging');

    const startX = e.clientX;
    const startY = e.clientY;
    const { left, bottom } = this._pos;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      this._setPos(left + dx, bottom - dy);
    };

    const onUp = () => {
      this._dragging = false;
      this.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      this._snap();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  /* --- Lógica de Ação --- */
  _handleAction(action, btn) {
    this.$buttons.forEach(b => b.removeAttribute('aria-pressed'));

    const actions = {
      play: () => {
        btn.setAttribute('aria-pressed', 'true');
        this.$status.textContent = 'Playing';
        this._dispatch('play');
      },
      pause: () => {
        btn.setAttribute('aria-pressed', 'true');
        this.$status.textContent = 'Paused';
        this._dispatch('pause');
      },
      stop: () => {
        this.$status.textContent = 'Stopped';
        this._dispatch('stop');
      }
    };

    if (actions[action]) actions[action]();
  }

  _dispatch(type) {
    window.dispatchEvent(new CustomEvent(`kob-tts:${type}`, {
      bubbles: true,
      composed: true,
      detail: { pos: this._pos }
    }));
  }

  /* --- Persistência --- */
  _loadPos() {
    try {
      const saved = localStorage.getItem('kob_tts_pos');
      if (saved) this._pos = JSON.parse(saved);
    } catch (e) {}
    this._setPos(this._pos.left, this._pos.bottom);
  }

  _savePos() {
    localStorage.setItem('kob_tts_pos', JSON.stringify(this._pos));
  }
}

customElements.define('kob-tts-dock', KobTtsDock);

