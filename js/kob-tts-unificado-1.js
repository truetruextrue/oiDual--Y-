/**
 * KOB TTS UNIFIED — revisado
 * Unifica: Tokens CSS, Arquétipos, Componente Dock (drag+snap+keyboard) e Motor TTS.
 *
 * Use: incluir no HTML (ou importar como módulo) e colocar <kob-tts-dock></kob-tts-dock>
 */

(function UMD_KOB_TTS_UNIFIED(root){
  'use strict';

  const STORAGE_KEYS = {
    archetype: 'KOBLLUX_VOICE_ARCHETYPE',
    config:    'KOBLLUX_VOICES_CONFIG_JSON',
    dockPos:   'KOBLLUX_TTS_DOCK_POS'
  };

  /* ---------------------------
     1) ARQUÉTIPOS BASE
     --------------------------- */
  const ARCHETYPES_BASE = [
    { id:'atlas',   name:'Atlas',   tone:'Estratégico, metódico', modulation:'Grave, ritmo calculado, dicção nítida.', voice:'Reed',  rate:1.0, pitch:0.93, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.18)', colorSecondary:'#0EA5E9' },
    { id:'nova',    name:'Nova',    tone:'Vibrante, entusiasmado', modulation:'Agudo, entusiasmado, ligeiramente rápido.', voice:'Luciana', rate:1.06, pitch:1.34, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.18)', colorSecondary:'#FDBA74' },
    { id:'vitalis', name:'Vitalis', tone:'Energético, urgente', modulation:'Rápido, intenso, motivacional.', voice:'Rocko', rate:0.96, pitch:1.42, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.18)', colorSecondary:'#4ADE80' },
    { id:'pulse',   name:'Pulse',   tone:'Emocional, melódico', modulation:'Fluido, tom médio/suave.', voice:'Reed', rate:1.0, pitch:1.14, colorMain:'#EC4899', colorSoft:'rgba(236,72,153,0.18)', colorSecondary:'#F9A8D4' },
    { id:'artemis', name:'Artemis', tone:'Aventureiro, expansivo', modulation:'Curioso, exploratório.', voice:'es_f',  rate:1.00, pitch:1.23, colorMain:'#A855F7', colorSoft:'rgba(168,85,247,0.18)', colorSecondary:'#C4B5FD' },
    { id:'serena',  name:'Serena',  tone:'Calmo, acolhedor', modulation:'Suave, terapêutico, com pausas.', voice:'Joana', rate:0.92, pitch:0.90, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.14)', colorSecondary:'#E0F2FE' },
    { id:'kaos',    name:'Kaos',    tone:'Desafiador, imprevisível', modulation:'Intenso, ritmo entrecortado.', voice:'Rocko', rate:1.09, pitch:1.28, colorMain:'#FACC15', colorSoft:'rgba(250,204,21,0.18)', colorSecondary:'#FDE68A' },
    { id:'genus',   name:'Genus',   tone:'Prático, detalhista', modulation:'Tom firme, foco na dicção.', voice:'Reed', rate:0.98, pitch:1.20, colorMain:'#E5E7EB', colorSoft:'rgba(229,231,235,0.12)', colorSecondary:'#9CA3AF' },
    { id:'lumine',  name:'Lumine',  tone:'Alegre, brincalhão', modulation:'Agudo, vibrante.', voice:'Flo', rate:1.03, pitch:1.55, colorMain:'#FDE047', colorSoft:'rgba(253,224,71,0.18)', colorSecondary:'#FACC15' },
    { id:'solus',   name:'Solus',   tone:'Sábio, introspectivo', modulation:'Grave, lento, eco sutil.', voice:'es_m', rate:0.88, pitch:0.87, colorMain:'#0EA5E9', colorSoft:'rgba(14,165,233,0.20)', colorSecondary:'#0369A1' },
    { id:'rhea',    name:'Rhea',    tone:'Profundo, conectivo', modulation:'Calmo, eco sutil.', voice:'Joana', rate:1.02, pitch:0.59, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.16)', colorSecondary:'#16A34A' },
    { id:'aion',    name:'Aion',    tone:'Futurista, metódico', modulation:'Tom constante, progressivo.', voice:'Monica', rate:0.98, pitch:1.00, colorMain:'#4F46E5', colorSoft:'rgba(79,70,229,0.20)', colorSecondary:'#A5B4FC' },
    { id:'kobllux', name:'KOBLLUX', tone:'Núcleo do sistema, oracular', modulation:'Grave-médio, presença de comando, ritmo estável.', voice:'es_m', rate:0.98, pitch:0.48, colorMain:'#22D3EE', colorSoft:'rgba(34,211,238,0.24)', colorSecondary:'#38BDF8' },
    { id:'uno',     name:'UNO',     tone:'Essência, origem, foco', modulation:'Tom centrado, poucas variações, pausas marcadas.', voice:'Grandma', rate:0.90, pitch:0.93, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.22)', colorSecondary:'#FDBA74' },
    { id:'dual',    name:'DUAL',    tone:'Espelho, contraste, jogo', modulation:'Alterna leve entre grave/agudo, ritmo pulsante.', voice:'pt_m', rate:1.02, pitch:1.02, colorMain:'#06B6D4', colorSoft:'rgba(6,182,212,0.22)', colorSecondary:'#22D3EE' },
    { id:'trinity', name:'TRINITY', tone:'Síntese, tríade viva', modulation:'Voz estável com microvariações rítmicas em 3 tempos.', voice:'Sandy', rate:1.04, pitch:1.04, colorMain:'#EC4899', colorSoft:'rgba(236,72,153,0.22)', colorSecondary:'#8B5CF6' },
    { id:'infodose',name:'Infodose',tone:'Didático, carismático, dopamínico', modulation:'Tom amigável, ritmo de recompensa → curiosidade.', voice:'Luciana', rate:1.06, pitch:0.96, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.22)', colorSecondary:'#A7F3D0' },
    { id:'kodux',   name:'KODUX',   tone:'Criador do pulso, metaconsciência', modulation:'Grave, confiante, pausas longas, intenção forte.', voice:'Reed', rate:0.86, pitch:0.68, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.30)', colorSecondary:'#FACC15' }
  ];

  /* ---------------------------
     2) STATE & STORAGE
     --------------------------- */
  const state = {
    activeId: 'kodux',
    configOverrides: null,
    voicesLoaded: false,
    browserVoices: [],
    currentUtterance: null,
    isSpeaking: false,
    activeBlockBtn: null
  };

  /* ---------------------------
     Helpers utilitários
     --------------------------- */
  const safeJSONparse = (str, fallback=null) => { try { return JSON.parse(str); } catch(e){ return fallback; } };
  const debounce = (fn, wait=120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=>fn.apply(this, args), wait); };
  };

  /* ---------------------------
     3) STORAGE helpers
     --------------------------- */
  function loadStateFromStorage(){
    try{
      const savedArch = localStorage.getItem(STORAGE_KEYS.archetype);
      if(savedArch) state.activeId = savedArch;
      const cfg = localStorage.getItem(STORAGE_KEYS.config);
      if(cfg) state.configOverrides = safeJSONparse(cfg, state.configOverrides);
    } catch(e){
      console.warn('[KOBLLUX_VOICES] loadStateFromStorage err', e);
    }
  }

  function saveArchetype(id){
    state.activeId = id;
    try{ localStorage.setItem(STORAGE_KEYS.archetype, id); } catch(e){}
    const arch = getArchetypeById(id);
    applyArchetypeTheme(arch);
    updateVoiceStatus();
    document.querySelectorAll('.archetype-badge').forEach(b => {
      applyBadgeColors(b, arch);
      b.textContent = arch.name;
    });
    window.dispatchEvent(new CustomEvent('kob-tts:archetype-change', { detail: { id } }));
  }

  function saveConfigOverrides(jsonStr){
    const parsed = safeJSONparse(jsonStr, null);
    if(!parsed){
      updateVoiceStatus('JSON inválido na IDE.', 'err');
      return false;
    }
    state.configOverrides = parsed;
    try{ localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(parsed)); } catch(e){}
    applyArchetypeTheme(getArchetypeById(state.activeId));
    updateVoiceStatus('Config de vozes salva (IDE).','ok');
    return true;
  }

  /* ---------------------------
     4) ARQUÉTIPOS resolution
     --------------------------- */
  function getAllArchetypes(){
    return (state.configOverrides && Array.isArray(state.configOverrides)) ? state.configOverrides : ARCHETYPES_BASE;
  }
  function getArchetypeById(id){
    const list = getAllArchetypes();
    return list.find(a => a.id === id) || list.find(a => a.id === 'kodux') || list[0];
  }

  /* ---------------------------
     5) THEME / CSS INJECTION
     --------------------------- */
  function injectGlobalCssOnce(){
    if(document.getElementById('kob-voice-theme-css')) return;
    const css = `
:root{
  --kob-voice-theme-duration:520ms;
  --tts-dock-left:8px; --tts-dock-bottom:269px; --tts-gap:10px;
  --tts-glass-bg: rgba(15,18,28,.38);
  --tts-glass-bd: rgba(255,255,255,.12);
  --tts-shadow: 0 12px 26px rgba(0,0,0,.35);
  --tts-glow: rgba(76,240,255,.85);
  --tts-ink: rgba(255,255,255,.92);
  --tts-ink-dim: rgba(255,255,255,.68);
  --tts-accent: #00ffcc;
}
body.kob-tts-dock-padding{ padding-left: calc(var(--tts-dock-left,8px) + 72px); }
.archetype-badge{ display:inline-grid; align-items:center; padding:.35rem .6rem; border-radius:10px; font-weight:700; font-size:.85rem; margin-left:8px; transition: all .22s ease; }
.block-tts-btn{ margin-left:8px; border-radius:6px; padding:.25rem .45rem; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); cursor:pointer; color: white; transition: all .18s; }
.block-tts-btn:hover{ background: rgba(255,255,255,0.08); }
.block-tts-btn.speaking{ box-shadow: 0 0 12px var(--tts-glow); transform: scale(1.06); background: var(--tts-accent); color: black; }
#kobVoiceStatus{ font-size:.85rem; margin-top:6px; opacity:.88; display:inline-block; padding:.18rem .4rem; border-radius:8px; background: rgba(0,0,0,0.22); }
`;
    const s = document.createElement('style');
    s.id = 'kob-voice-theme-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function hexToRgba(hex, alpha=1){
    if(!hex) return `rgba(0,0,0,${alpha})`;
    let c = hex.replace('#','');
    if(c.length===3) c = c.split('').map(ch=>ch+ch).join('');
    const num = parseInt(c,16);
    return `rgba(${(num>>16)&255}, ${(num>>8)&255}, ${num&255}, ${alpha})`;
  }

  function applyArchetypeTheme(arch){
    if(!arch) arch = getArchetypeById(state.activeId);
    const root = document.documentElement;
    const p = arch.colorMain || '#00f5ff';
    const soft = arch.colorSoft || 'rgba(0,0,255,0.08)';
    root.style.setProperty('--kob-voice-primary', p);
    root.style.setProperty('--kob-voice-bg-soft', soft);
    root.style.setProperty('--tts-accent', p);
    root.style.setProperty('--tts-glow', hexToRgba(p, 0.6));
  }

  function applyBadgeColors(badgeEl, arch){
    const p = arch.colorMain || '#00f5ff';
    badgeEl.style.border = `1px solid ${hexToRgba(p,0.85)}`;
    badgeEl.style.color = p;
    badgeEl.style.background = arch.colorSoft || 'rgba(0,0,0,0.12)';
    badgeEl.style.boxShadow = `0 0 10px ${hexToRgba(p,0.25)}`;
  }

  /* ---------------------------
     6) BROWSER VOICES + TTS HELPERS
     --------------------------- */
  function loadBrowserVoices(){
    // try immediate, if empty leave voicesLoaded false and rely on onvoiceschanged
    try {
      const voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
      if(voices && voices.length){
        state.browserVoices = voices;
        state.voicesLoaded = true;
      }
    } catch(e) {
      console.warn('[KOBLLUX_VOICES] loadBrowserVoices', e);
    }
  }

  // safer pick: if prefName falsy or not found, prefer pt-BR -> pt -> any
  function pickBrowserVoice(prefName){
    const voices = state.browserVoices || [];
    if(!voices.length) return null;

    if(prefName && typeof prefName === 'string'){
      const exact = voices.find(v => v.name && v.name.toLowerCase() === prefName.toLowerCase());
      if(exact) return exact;
      const loose = voices.find(v => v.name && v.name.toLowerCase().includes(prefName.toLowerCase()));
      if(loose) return loose;
    }

    let v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt-br'));
    if(v) return v;
    v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
    return v || voices[0];
  }

  function stopSpeaking(){
    try {
      if(window.speechSynthesis) window.speechSynthesis.cancel();
    } catch(e){
      console.warn('stopSpeaking error', e);
    }
    state.isSpeaking = false;
    state.currentUtterance = null;
    state.activeBlockBtn = null;
    toggleVoiceBtn(false);
    window.dispatchEvent(new CustomEvent('kob-tts:stopped'));
    updateVoiceStatus();
  }

  // speakText exposed to API. archetypeId optional.
  function speakText(text, archetypeId){
    if(!text || !text.trim()) {
      updateVoiceStatus('Nada para ler.', 'warn');
      return;
    }
    if(!('speechSynthesis' in window)){
      updateVoiceStatus('TTS não suportado neste dispositivo.', 'err');
      return;
    }

    stopSpeaking(); // garante limpeza antes de novo utter

    const arch = getArchetypeById(archetypeId || state.activeId);
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickBrowserVoice(arch.voice);

    if(voice) try { utter.voice = voice; } catch(e){ /* fallback */ }
    utter.rate = (typeof arch.rate === 'number') ? arch.rate : 1.0;
    utter.pitch = (typeof arch.pitch === 'number') ? arch.pitch : 1.0;
    utter.lang = arch.lang || 'pt-BR';

    utter.onstart = () => {
      state.isSpeaking = true;
      state.currentUtterance = utter;
      toggleVoiceBtn(true);
      updateVoiceStatus(`Falando como ${arch.name}…`, 'ok');
      window.dispatchEvent(new CustomEvent('kob-tts:started', { detail: { arch } }));
    };

    utter.onend = () => {
      state.isSpeaking = false;
      state.currentUtterance = null;
      toggleVoiceBtn(false);
      window.dispatchEvent(new CustomEvent('kob-tts:ended', { detail: { arch } }));
      updateVoiceStatus(`Finalizado (${arch.name})`);
    };

    utter.onerror = (e) => {
      console.error('[KOBLLUX_VOICES] speak error', e);
      state.isSpeaking = false;
      state.currentUtterance = null;
      toggleVoiceBtn(false);
      updateVoiceStatus('Erro ao falar o texto.', 'err');
      window.dispatchEvent(new CustomEvent('kob-tts:error', { detail: { error: e } }));
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch(e){
      console.error('speechSynthesis.speak failed', e);
      updateVoiceStatus('Erro ao iniciar o TTS.', 'err');
    }
  }

  /* ---------------------------
     7) DOM HELPERS
     --------------------------- */
  function qs(sel, root=document){ return root.querySelector(sel); }

  function updateVoiceStatus(msg, kind){
    const el = qs('#kobVoiceStatus') || qs('#iaStatusText');
    if(!el) return;
    if(!msg){
      const arch = getArchetypeById(state.activeId);
      msg = `Arquétipo: ${arch.name}`;
    }
    el.textContent = msg;
    el.classList.remove('ok','warn','err');
    if(kind) el.classList.add(kind); else el.classList.add('ok');
    el.style.color = (kind === 'err') ? '#ff5c5c' : 'var(--tts-accent)';
  }

  function toggleVoiceBtn(isSpeaking){
    document.querySelectorAll('.block-tts-btn').forEach(b => {
      b.classList.remove('speaking');
      if(isSpeaking && b.dataset.active === 'true') b.classList.add('speaking');
    });
  }

  // enhance blocks: add badge (prepend) and button (append). mark once by dataset.
  function enhanceResponseBlocks(root = document){
    const blocks = (root.querySelectorAll && root.querySelectorAll('.response-block')) || [];
    blocks.forEach(block => {
      if(block.dataset.kobTtsInit === '1') return;
      block.dataset.kobTtsInit = '1';

      if(!block.dataset.rawText) block.dataset.rawText = (block.innerText || block.textContent || '').trim();

      // Badge (prepend)
      const arch = getArchetypeById(state.activeId);
      const badge = document.createElement('div');
      badge.className = 'archetype-badge';
      badge.textContent = arch.name;
      applyBadgeColors(badge, arch);
      block.prepend(badge);

      // Button (append)
      const btn = document.createElement('button');
      btn.className = 'block-tts-btn';
      btn.title = 'Ouvir este trecho';
      btn.type = 'button';
      btn.innerText = '◎';
      btn.dataset.active = 'false';

      btn.addEventListener('click', (ev) => {
        // limpar marcações
        document.querySelectorAll('.block-tts-btn').forEach(b => b.dataset.active = 'false');
        btn.dataset.active = 'true';
        state.activeBlockBtn = btn;
        const txt = block.dataset.rawText || block.innerText || '';
        speakText(txt, state.activeId);
      });

      block.appendChild(btn);
    });
  }

  // debounce wrapper for observer
  const debouncedEnhance = debounce((root) => enhanceResponseBlocks(root), 80);

  function attachBlocksObserver(){
    if(window.__KOB_TTS_OBSERVER_ATTACHED) return;
    const observer = new MutationObserver((muts) => {
      // apenas schedule enhance
      debouncedEnhance(document);
    });
    observer.observe(document.body, { childList:true, subtree:true });
    window.__KOB_TTS_OBSERVER_ATTACHED = true;
  }

  /* ---------------------------
     8) DOCK: web component com drag + snap + keyboard
     --------------------------- */
  (function defineDock(){
    const tpl = document.createElement('template');
    tpl.innerHTML = /*html*/`
      <style>
        :host{ position:fixed; left:var(--tts-left,8px); bottom:calc(var(--tts-bottom,240px) + env(safe-area-inset-bottom,0px)); z-index:99999; display:block; touch-action:none; user-select:none; transition:left 360ms cubic-bezier(.22,1,.36,1), bottom 360ms cubic-bezier(.22,1,.36,1), transform 240ms ease; --dock-scale:.92; transform: scale(var(--dock-scale)); }
        :host(.dragging){ transition:none!important; transform: scale(1.02); }
        .dock{ display:flex; gap:8px; padding:8px; border-radius:12px; background:var(--tts-glass-bg, rgba(10,12,20,.66)); border:1px solid var(--tts-glass-bd, rgba(255,255,255,.08)); box-shadow: var(--tts-shadow, 0 18px 36px rgba(0,0,0,.45)); backdrop-filter: blur(10px) saturate(1.1); align-items:center; min-width:80px; }
        button{ width:44px; height:44px; border-radius:10px; display:grid; place-items:center; font-size:18px; color: var(--tts-ink, #eafcff); background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border:1px solid rgba(255,255,255,0.12); cursor:pointer; }
        button[aria-pressed="true"]{ outline:2px solid var(--tts-accent, #00ffcc); box-shadow: 0 0 18px var(--tts-glow, rgba(0,255,200,.35)); }
        .status{ font-size:12px; min-width:84px; text-align:center; color:var(--tts-ink,#eaffff); opacity:.9; }
      </style>
      <div class="dock" role="toolbar" aria-label="KOB TTS Dock">
        <button id="play" data-action="play" aria-label="Tocar">▶</button>
        <button id="pause" data-action="pause" aria-label="Pausar">⏸</button>
        <button id="stop" data-action="stop" aria-label="Parar">■</button>
        <div class="status" id="status" aria-live="polite">TTS</div>
      </div>
    `;

    class KobTtsDock extends HTMLElement {
      constructor(){
        super();
        this.attachShadow({mode:'open'}).appendChild(tpl.content.cloneNode(true));
        this.$dock = this.shadowRoot.querySelector('.dock');
        this.$status = this.shadowRoot.getElementById('status');
        this._pos = { left: 8, bottom: 240 };
        this._dragging = false;
        this._pointerId = null;
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onResize = this._onResize.bind(this);
      }

      connectedCallback(){
        // restore pos
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.dockPos);
          if(raw) {
            const parsed = safeJSONparse(raw, null);
            if(parsed && typeof parsed.left === 'number' && typeof parsed.bottom === 'number') this._pos = parsed;
          }
        } catch(e){}

        const { left, bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
        this._setPos(left, bottom);

        this.$dock.addEventListener('pointerdown', this._onPointerDown);
        this.shadowRoot.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-action]');
          if(!btn) return;
          this._handleAction(btn.dataset.action, btn);
        });

        this.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('resize', this._onResize);
        if(!this.hasAttribute('tabindex')) this.setAttribute('tabindex','0');

        // react to engine events
        window.addEventListener('kob-tts:started', (e) => {
          this.$status.textContent = `Falando: ${e.detail?.arch?.name || ''}`;
        });
        window.addEventListener('kob-tts:ended', () => {
          this.$status.textContent = 'TTS';
          this.shadowRoot.querySelectorAll('button').forEach(b => b.removeAttribute('aria-pressed'));
        });
        window.addEventListener('kob-tts:stopped', () => {
          this.$status.textContent = 'Parado';
          this.shadowRoot.querySelectorAll('button').forEach(b => b.removeAttribute('aria-pressed'));
        });
      }

      disconnectedCallback(){
        this.$dock.removeEventListener('pointerdown', this._onPointerDown);
        this.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('resize', this._onResize);
      }

      _setPos(l, b){
        this._pos.left = Math.round(l); this._pos.bottom = Math.round(b);
        const clamped = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
        this.style.left = `${clamped.left}px`;
        this.style.bottom = `${clamped.bottom}px`;
        this.style.setProperty('--tts-left', `${clamped.left}px`);
        this.style.setProperty('--tts-bottom', `${clamped.bottom}px`);
      }

      _ensureWithinBounds(left, bottom){
        const margin = 8;
        const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth);
        const vh = Math.max(200, window.innerHeight || document.documentElement.clientHeight);
        const rect = this.getBoundingClientRect();
        const w = rect.width || 96;
        const h = rect.height || 56;
        const maxLeft = Math.max(margin, vw - w - margin);
        const maxBottom = Math.max(margin, vh - h - margin);
        const clampedLeft = Math.min(Math.max(margin, left), maxLeft);
        const clampedBottom = Math.min(Math.max(margin, bottom), maxBottom);
        return { left: clampedLeft, bottom: clampedBottom };
      }

      _snap(){
        const vw = (window.innerWidth || document.documentElement.clientWidth);
        const dockRect = this.getBoundingClientRect();
        const margin = 8;
        const snapLeft  = margin;
        const snapRight = Math.max(margin, vw - dockRect.width - margin);
        const mid = dockRect.left + dockRect.width/2;
        const targetLeft = mid < vw/2 ? snapLeft : snapRight;
        const { bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
        this._setPos(targetLeft, bottom);
        localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos));
      }

      _onPointerDown(e){
        // don't start drag when clicking the buttons
        if(e.target.closest('[data-action]')) return;
        e.preventDefault();
        this._dragging = true;
        this.classList.add('dragging');
        this._pointerId = e.pointerId;
        try { this.setPointerCapture?.(e.pointerId); } catch(_) {}

        const startX = e.clientX, startY = e.clientY;
        const startLeft = this._pos.left, startBottom = this._pos.bottom;

        const move = (ev) => {
          if(this._pointerId !== ev.pointerId) return;
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          this._setPos(Math.max(4, startLeft + dx), Math.max(4, startBottom - dy));
        };

        const up = (ev) => {
          if(this._pointerId !== ev.pointerId) return;
          this._dragging = false;
          this.classList.remove('dragging');
          try { this.releasePointerCapture?.(this._pointerId); } catch(_) {}
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          this._pointerId = null;
          this._snap();
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }

      _onKeyDown(e){
        const step = (e.shiftKey ? 24 : 8);
        let handled = false;
        if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
          e.preventDefault();
          let { left, bottom } = this._pos;
          if(e.key === 'ArrowLeft') left -= step;
          if(e.key === 'ArrowRight') left += step;
          if(e.key === 'ArrowUp') bottom += step;
          if(e.key === 'ArrowDown') bottom -= step;
          this._setPos(left, bottom);
          localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos));
          handled = true;
        }
        if(e.key === ' ' || e.key === 'Enter'){
          e.preventDefault();
          const playBtn = this.shadowRoot.querySelector('[data-action="play"]');
          playBtn?.click();
          handled = true;
        }
        if(handled) return;
      }

      _onResize(){
        const { left, bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
        this._setPos(left, bottom);
        localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos));
      }

      _handleAction(action, btn){
        // toggle aria-pressed
        this.shadowRoot.querySelectorAll('button[data-action]').forEach(b => b.removeAttribute('aria-pressed'));
        if(action === 'play'){
          btn.setAttribute('aria-pressed','true');
          this.$status.textContent = 'Playing…';
          window.dispatchEvent(new CustomEvent('kob-tts:play', { bubbles:true, detail:{ source:'dock' } }));
        } else if(action === 'pause'){
          btn.setAttribute('aria-pressed','true');
          this.$status.textContent = 'Paused';
          window.dispatchEvent(new CustomEvent('kob-tts:pause', { bubbles:true, detail:{ source:'dock' } }));
        } else if(action === 'stop'){
          this.$status.textContent = 'Stopped';
          window.dispatchEvent(new CustomEvent('kob-tts:stop', { bubbles:true, detail:{ source:'dock' } }));
        }
      }
    }

    if(!customElements.get('kob-tts-dock')) customElements.define('kob-tts-dock', KobTtsDock);
  })();

  /* ---------------------------
     9) ENGINE
     --------------------------- */
  class KobTtsEngine {
    constructor(){
      this.synth = window.speechSynthesis;
      this.isPaused = false;
      this._init();
    }

    _init(){
      loadBrowserVoices();
      if(this.synth && typeof this.synth.onvoiceschanged !== 'undefined'){
        // add without clobbering
        const prev = this.synth.onvoiceschanged;
        this.synth.onvoiceschanged = () => { try{ loadBrowserVoices(); }catch(e){} if(typeof prev === 'function') try{ prev(); }catch(_){} };
      }
      window.addEventListener('kob-tts:play', (e) => {
        // if event provided text in detail, speak it; otherwise pick last response-block
        const detailText = e?.detail?.text;
        if(detailText && String(detailText).trim()) { speakText(String(detailText), state.activeId); return; }
        const lastBlock = document.querySelector('.response-block:last-of-type');
        if(lastBlock && (lastBlock.dataset.rawText || lastBlock.innerText)) {
          // mark the corresponding button active if exists
          const btn = lastBlock.querySelector('.block-tts-btn');
          if(btn) {
            document.querySelectorAll('.block-tts-btn').forEach(b => b.dataset.active = 'false');
            btn.dataset.active = 'true';
            state.activeBlockBtn = btn;
          }
          speakText(lastBlock.dataset.rawText || lastBlock.innerText, state.activeId);
        } else {
          updateVoiceStatus('Nada pra ler ainda.', 'warn');
        }
      });

      window.addEventListener('kob-tts:pause', () => {
        try { if(this.synth.speaking && !this.synth.paused) { this.synth.pause(); this.isPaused = true; } } catch(e){}
      });
      window.addEventListener('kob-tts:stop', () => stopSpeaking());
    }
  }

  /* ---------------------------
     10) Voice IDE panel builder (opcional)
     --------------------------- */
  function buildVoiceIdePanel(){
    const panel = qs('#iaConfigPanel');
    if(!panel) return;
    if(panel._kobBuilt) return;
    panel._kobBuilt = true;

    let body = panel.querySelector('.ia-config-body');
    if(!body){ body = document.createElement('div'); body.className='ia-config-body'; panel.appendChild(body); }

    const fieldArch = document.createElement('div');
    fieldArch.className = 'ia-field';
    fieldArch.innerHTML = `
      <label for="kobArchetypeSelect">Voz arquétipa ativa (KOBLLUX)</label>
      <select id="kobArchetypeSelect" style="width:100%;margin-top:6px;padding:6px;border-radius:8px;"></select>
      <div id="kobVoiceStatus" style="margin-top:8px;"></div>
    `;
    body.appendChild(fieldArch);

    const select = fieldArch.querySelector('#kobArchetypeSelect');
    getAllArchetypes().forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.name} · ${a.tone}`;
      select.appendChild(opt);
    });
    select.value = state.activeId;
    select.addEventListener('change', () => saveArchetype(select.value));

    const fieldIde = document.createElement('div'); fieldIde.className = 'ia-field';
    fieldIde.style.marginTop = '12px';
    fieldIde.innerHTML = `
      <label for="kobVoicesIde">IDE de Vozes (JSON arquétipos · opcional)</label>
      <textarea id="kobVoicesIde" rows="6" style="width:100%;border-radius:8px;border:1px solid rgba(0,255,255,.12);background:rgba(0,0,0,.6);color:inherit;font-size:.85rem;padding:8px;resize:vertical;margin-top:6px;"></textarea>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button id="kobVoicesSaveBtn" class="pill-btn">Salvar IDE</button>
        <button id="kobVoicesResetBtn" class="pill-btn secondary">Reset IDE</button>
      </div>
    `;
    body.appendChild(fieldIde);

    const ideTextarea = fieldIde.querySelector('#kobVoicesIde');
    const btnSave = fieldIde.querySelector('#kobVoicesSaveBtn');
    const btnReset = fieldIde.querySelector('#kobVoicesResetBtn');

    const currentCfg = state.configOverrides || ARCHETYPES_BASE;
    ideTextarea.value = JSON.stringify(currentCfg, null, 2);

    btnSave.addEventListener('click', () => {
      const ok = saveConfigOverrides(ideTextarea.value);
      if(ok) updateVoiceStatus('IDE salva. Atualize a página se mudar muitos arquétipos.','ok');
    });

    btnReset.addEventListener('click', () => {
      state.configOverrides = null;
      try { localStorage.removeItem(STORAGE_KEYS.config); } catch(e){}
      ideTextarea.value = JSON.stringify(ARCHETYPES_BASE, null, 2);
      applyArchetypeTheme(getArchetypeById(state.activeId));
      updateVoiceStatus('Config de vozes resetada para o padrão.','warn');
    });

    updateVoiceStatus();
  }

  /* ---------------------------
     11) INIT
     --------------------------- */
  function attachVoiceBtnHandler(){
    const voiceBtn = qs('#voiceBtn');
    if(!voiceBtn) return;
    voiceBtn.addEventListener('click', ()=>{
      if(state.isSpeaking){ stopSpeaking(); return; }
      const blocks = Array.from(document.querySelectorAll('.response-block'));
      if(!blocks.length){ updateVoiceStatus('Nada pra ler ainda.', 'warn'); return; }
      const last = blocks[blocks.length - 1];
      const txt = last.dataset.rawText || last.innerText || '';
      speakText(txt, state.activeId);
    });
  }

  function initAll(){
    injectGlobalCssOnce();
    loadStateFromStorage();
    loadBrowserVoices();
    if('speechSynthesis' in window){
      // ensure we don't overwrite user handler — attach gracefully above
      try { window.speechSynthesis.onvoiceschanged = window.speechSynthesis.onvoiceschanged || window.speechSynthesis.onvoiceschanged; } catch(e){}
    }
    applyArchetypeTheme(getArchetypeById(state.activeId));
    enhanceResponseBlocks(document);
    attachBlocksObserver();
    attachVoiceBtnHandler();
    buildVoiceIdePanel();

    // expose
    window.KOBLLUXVoices = {
      speak: speakText,
      stop: stopSpeaking,
      getActiveArchetype: () => getArchetypeById(state.activeId),
      setActiveArchetype: (id) => saveArchetype(id),
      getAllArchetypes,
      getOverrides: () => state.configOverrides,
      saveOverrides: (json) => saveConfigOverrides(json)
    };

    if(!window.kobTtsEngineInstance) window.kobTtsEngineInstance = new KobTtsEngine();

    // ensure voices are loaded a little later (some browsers populate asynchronously)
    setTimeout(loadBrowserVoices, 300);
    setTimeout(loadBrowserVoices, 1200);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // export nominal (if used as module bundler)
  root.KOB_TTS_UNIFIED = {
    init: initAll,
    api: () => window.KOBLLUXVoices
  };

})(typeof window !== 'undefined' ? window : this);
