// kob-tts-unified.js
// ES module — unifica: tokens CSS, archetypes, dock component, TTS engine, state, IDE panel hooks.
// Usage: <script type="module" src="/path/kob-tts-unified.js"></script>
// then: <kob-tts-dock></kob-tts-dock>

const STORAGE_KEYS = {
  archetype: 'KOBLLUX_VOICE_ARCHETYPE',
  config: 'KOBLLUX_VOICES_CONFIG_JSON',
  dockPos: 'KOBLLUX_TTS_DOCK_POS'
};

/* ======================
   1) ARQUÉTIPOS BASE
   ====================== */
const ARCHETYPES_BASE = [
  { id:'atlas', name:'Atlas', tone:'Estratégico, metódico', modulation:'Grave, ritmo calculado, dicção nítida.', voice:'Reed', rate:1.0, pitch:0.93, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.18)', colorSecondary:'#0EA5E9' },
  { id:'nova', name:'Nova', tone:'Vibrante, entusiasmado', modulation:'Agudo, entusiasmado, ligeiramente rápido.', voice:'Luciana', rate:1.06, pitch:1.34, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.18)', colorSecondary:'#FDBA74' },
  { id:'vitalis', name:'Vitalis', tone:'Energético, urgente', modulation:'Rápido, intenso, motivacional.', voice:'Rocko', rate:0.96, pitch:1.42, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.18)', colorSecondary:'#4ADE80' },
  { id:'pulse', name:'Pulse', tone:'Emocional, melódico', modulation:'Fluido, tom médio/suave.', voice:'Reed', rate:1.0, pitch:1.14, colorMain:'#EC4899', colorSoft:'rgba(236,72,153,0.18)', colorSecondary:'#F9A8D4' },
  { id:'artemis', name:'Artemis', tone:'Aventureiro, expansivo', modulation:'Curioso, exploratório.', voice:'es_f', rate:1.00, pitch:1.23, colorMain:'#A855F7', colorSoft:'rgba(168,85,247,0.18)', colorSecondary:'#C4B5FD' },
  { id:'serena', name:'Serena', tone:'Calmo, acolhedor', modulation:'Suave, terapêutico, com pausas.', voice:'Joana', rate:0.92, pitch:0.90, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.14)', colorSecondary:'#E0F2FE' },
  { id:'kaos', name:'Kaos', tone:'Desafiador, imprevisível', modulation:'Intenso, ritmo entrecortado.', voice:'Rocko', rate:1.09, pitch:1.28, colorMain:'#FACC15', colorSoft:'rgba(250,204,21,0.18)', colorSecondary:'#FDE68A' },
  { id:'genus', name:'Genus', tone:'Prático, detalhista', modulation:'Tom firme, foco na dicção.', voice:'Reed', rate:0.98, pitch:1.20, colorMain:'#E5E7EB', colorSoft:'rgba(229,231,235,0.12)', colorSecondary:'#9CA3AF' },
  { id:'lumine', name:'Lumine', tone:'Alegre, brincalhão', modulation:'Agudo, vibrante.', voice:'Flo', rate:1.03, pitch:1.55, colorMain:'#FDE047', colorSoft:'rgba(253,224,71,0.18)', colorSecondary:'#FACC15' },
  { id:'solus', name:'Solus', tone:'Sábio, introspectivo', modulation:'Grave, lento, eco sutil.', voice:'es_m', rate:0.88, pitch:0.87, colorMain:'#0EA5E9', colorSoft:'rgba(14,165,233,0.20)', colorSecondary:'#0369A1' },
  { id:'rhea', name:'Rhea', tone:'Profundo, conectivo', modulation:'Calmo, eco sutil.', voice:'Joana', rate:1.02, pitch:0.59, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.16)', colorSecondary:'#16A34A' },
  { id:'aion', name:'Aion', tone:'Futurista, metódico', modulation:'Tom constante, progressivo.', voice:'Monica', rate:0.98, pitch:1.00, colorMain:'#4F46E5', colorSoft:'rgba(79,70,229,0.20)', colorSecondary:'#A5B4FC' },

  { id:'kobllux', name:'KOBLLUX', tone:'Núcleo do sistema, oracular', modulation:'Grave-médio, presença de comando, ritmo estável.', voice:'es_m', rate:0.98, pitch:0.48, colorMain:'#22D3EE', colorSoft:'rgba(34,211,238,0.24)', colorSecondary:'#38BDF8' },
  { id:'uno', name:'UNO', tone:'Essência, origem, foco', modulation:'Tom centrado, poucas variações, pausas marcadas.', voice:'Grandma', rate:0.90, pitch:0.93, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.22)', colorSecondary:'#FDBA74' },
  { id:'dual', name:'DUAL', tone:'Espelho, contraste, jogo', modulation:'Alterna leve entre grave/agudo, ritmo pulsante.', voice:'pt_m', rate:1.02, pitch:1.02, colorMain:'#06B6D4', colorSoft:'rgba(6,182,212,0.22)', colorSecondary:'#22D3EE' },
  { id:'trinity', name:'TRINITY', tone:'Síntese, tríade viva', modulation:'Voz estável com microvariações rítmicas em 3 tempos.', voice:'Sandy', rate:1.04, pitch:1.04, colorMain:'#EC4899', colorSoft:'rgba(236,72,153,0.22)', colorSecondary:'#8B5CF6' },
  { id:'infodose', name:'Infodose', tone:'Didático, carismático, dopamínico', modulation:'Tom amigável, ritmo de recompensa → curiosidade.', voice:'Luciana', rate:1.06, pitch:0.96, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.22)', colorSecondary:'#A7F3D0' },
  { id:'kodux', name:'KODUX', tone:'Criador do pulso, metaconsciência', modulation:'Grave, confiante, pausas longas, intenção forte.', voice:'Reed', rate:0.86, pitch:0.68, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.30)', colorSecondary:'#FACC15' }
];

/* ======================
   2) STATE & STORAGE
   ====================== */
const state = {
  activeId: 'kodux',
  configOverrides: null,
  voicesLoaded: false,
  browserVoices: [],
  currentUtterance: null,
  isSpeaking: false
};

function loadStateFromStorage(){
  try{
    const savedArch = localStorage.getItem(STORAGE_KEYS.archetype);
    if(savedArch) state.activeId = savedArch;
    const cfg = localStorage.getItem(STORAGE_KEYS.config);
    if(cfg) state.configOverrides = JSON.parse(cfg);
  }catch(e){ console.warn('[KOBLLUX_VOICES] loadStateFromStorage err', e); }
}
function saveArchetype(id){
  state.activeId = id;
  try{ localStorage.setItem(STORAGE_KEYS.archetype, id); }catch(e){}
  const arch = getArchetypeById(id);
  applyArchetypeTheme(arch);
  updateVoiceStatus();
  document.querySelectorAll('.archetype-badge').forEach(b=>{ applyBadgeColors(b, arch); b.textContent = arch.name; });
  window.dispatchEvent(new CustomEvent('kob-tts:archetype-change', { detail: { id } }));
}
function saveConfigOverrides(jsonStr){
  try{
    const parsed = JSON.parse(jsonStr);
    state.configOverrides = parsed;
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(parsed));
    applyArchetypeTheme(getArchetypeById(state.activeId));
    updateVoiceStatus('Config de vozes salva (IDE).','ok');
    return true;
  }catch(e){
    console.error('[KOBLLUX_VOICES] JSON inválido', e);
    updateVoiceStatus('JSON inválido na IDE.','err');
    return false;
  }
}

/* ======================
   3) RESOLVE ARQUÉTIPO
   ====================== */
function getAllArchetypes(){
  return (state.configOverrides && Array.isArray(state.configOverrides)) ? state.configOverrides : ARCHETYPES_BASE;
}
function getArchetypeById(id){
  const list = getAllArchetypes();
  return list.find(a => a.id === id) || list.find(a => a.id === 'kodux') || list[0];
}

/* ======================
   4) THEME / CSS INJECTION
   ====================== */
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
.archetype-badge{ display:inline-grid; gap:6px; align-items:center; padding:.35rem .6rem; border-radius:10px; font-weight:700; font-size:.85rem; margin-left:8px; }
.block-tts-btn{ margin-left:8px; border-radius:6px; padding:.25rem .45rem; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); cursor:pointer; }
.block-tts-btn.speaking{ box-shadow:0 0 12px var(--tts-glow); transform:scale(1.04); }
#kobVoiceStatus, #iaStatusText{ font-size:.9rem; padding:.35rem .5rem; border-radius:8px; display:inline-block; }
`;
  const s = document.createElement('style');
  s.id = 'kob-voice-theme-css';
  s.textContent = css;
  document.head.appendChild(s);
}

/* helper: hex -> rgba */
function hexToRgba(hex, alpha=1){
  if(!hex) return `rgba(0,0,0,${alpha})`;
  let c = hex.replace('#','');
  if(c.length===3) c = c.split('').map(ch=>ch+ch).join('');
  const num = parseInt(c,16);
  const r=(num>>16)&255, g=(num>>8)&255, b=num&255;
  return `rgba(${r},${g},${b},${alpha})`;
}
function applyArchetypeTheme(arch){
  if(!arch) arch = getArchetypeById(state.activeId);
  const root = document.documentElement;
  const primary = arch.colorMain || '#00f5ff';
  const secondary = arch.colorSecondary || '#ff4bff';
  const soft = arch.colorSoft || 'rgba(0,245,255,0.18)';
  root.style.setProperty('--kob-voice-primary', primary);
  root.style.setProperty('--kob-voice-secondary', secondary);
  root.style.setProperty('--kob-voice-bg-soft', soft);
  root.style.setProperty('--accent', primary);
  root.style.setProperty('--accent-soft', soft);
  root.style.setProperty('--kob-voice-glow', `0 0 18px ${hexToRgba(primary,0.70)}`);
}
function applyBadgeColors(badgeEl, arch){
  const p = arch.colorMain || '#00f5ff'; const soft = arch.colorSoft || 'rgba(0,245,255,0.22)';
  badgeEl.style.border = `1px solid ${hexToRgba(p,0.85)}`;
  badgeEl.style.color = p;
  badgeEl.style.background = soft;
  badgeEl.style.boxShadow = `0 0 14px ${hexToRgba(p,0.55)}`;
}

/* ======================
   5) BROWSER VOICES + TTS HELPERS
   ====================== */
function loadBrowserVoices(){
  let voices = window.speechSynthesis?.getVoices() || [];
  if(voices && voices.length){
    state.browserVoices = voices;
    state.voicesLoaded = true;
  }
}
function pickBrowserVoice(prefName){
  const voices = state.browserVoices;
  if(!voices || !voices.length) return null;
  if(prefName){
    const exact = voices.find(v => v.name === prefName);
    if(exact) return exact;
    const loose = voices.find(v => v.name.toLowerCase().includes(prefName.toLowerCase()));
    if(loose) return loose;
  }
  let v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt-br'));
  if(v) return v;
  v = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
  return v || voices[0];
}
function stopSpeaking(){
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  state.isSpeaking = false;
  state.currentUtterance = null;
  toggleVoiceBtn(false);
}
function speakText(text, archetypeId){
  if(!('speechSynthesis' in window)){ updateVoiceStatus('Este dispositivo não suporta TTS nativo.','warn'); return; }
  if(!text || !text.trim()) return;
  const arch = getArchetypeById(archetypeId || state.activeId);
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickBrowserVoice(arch.voice);
  utter.lang = 'pt-BR';
  if(voice) utter.voice = voice;
  utter.rate = arch.rate || 1.0;
  utter.pitch = arch.pitch || 1.0;

  utter.onstart = () => {
    state.isSpeaking = true; state.currentUtterance = utter; toggleVoiceBtn(true);
    updateVoiceStatus(`Falando como ${arch.name}…`, 'ok');
  };
  utter.onend = () => { state.isSpeaking = false; state.currentUtterance = null; toggleVoiceBtn(false); };
  utter.onerror = (e)=>{ console.error('[KOBLLUX_VOICES] speak error', e); state.isSpeaking=false; state.currentUtterance=null; toggleVoiceBtn(false); updateVoiceStatus('Erro ao falar o texto.','err'); };

  stopSpeaking();
  window.speechSynthesis.speak(utter);
}

/* ======================
   6) DOM HELPERS (badges, blocks)
   ====================== */
function qs(sel, root=document){ return root.querySelector(sel); }
function updateVoiceStatus(msg, kind){
  const el = qs('#kobVoiceStatus') || qs('#iaStatusText');
  if(!el) return;
  if(!msg){ const arch = getArchetypeById(state.activeId); msg = `Arquétipo ativo: ${arch.name}`; }
  el.textContent = msg;
  el.classList.remove('ok','warn','err');
  if(kind) el.classList.add(kind); else el.classList.add('ok');
}
function toggleVoiceBtn(isSpeaking){
  const btn = qs('#voiceBtn');
  if(!btn) return;
  if(isSpeaking) btn.classList.add('speaking'); else btn.classList.remove('speaking');
}
function enhanceResponseBlocks(root=document){
  const blocks = root.querySelectorAll('.response-block');
  blocks.forEach(block=>{
    if(block.dataset.kobTtsInit === '1') return;
    block.dataset.kobTtsInit = '1';
    if(!block.dataset.rawText) block.dataset.rawText = block.innerText || block.textContent || '';
    if(!block.querySelector('.archetype-badge')){
      const badge = document.createElement('div'); badge.className = 'archetype-badge';
      const arch = getArchetypeById(state.activeId);
      badge.textContent = arch.name; applyBadgeColors(badge, arch);
      block.appendChild(badge);
    }
    if(!block.querySelector('.block-tts-btn')){
      const btn = document.createElement('button'); btn.type='button'; btn.className='block-tts-btn'; btn.title='Ouvir este trecho'; btn.textContent='◎';
      block.appendChild(btn);
    }
  });
}
function attachBlocksObserver(){
  const pagesWrapper = qs('.pages-wrapper') || document.body;
  const mo = new MutationObserver(muts=>{
    for(const m of muts){
      if(m.addedNodes && m.addedNodes.length){
        m.addedNodes.forEach(node=>{
          if(node.nodeType === 1) enhanceResponseBlocks(node);
        });
      }
    }
  });
  mo.observe(pagesWrapper, { childList:true, subtree:true });
}
function attachTtsClickHandler(){
  document.addEventListener('click', ev=>{
    const ttsBtn = ev.target.closest('.block-tts-btn');
    if(ttsBtn){
      const block = ttsBtn.closest('.response-block');
      if(!block) return;
      block.classList.add('clicked'); setTimeout(()=>block.classList.remove('clicked'), 280);
      const txt = block.dataset.rawText || block.innerText || '';
      speakText(txt, state.activeId);
    }
  });
}

/* ======================
   7) Voice IDE panel
   ====================== */
function buildVoiceIdePanel(){
  const panel = qs('#iaConfigPanel'); if(!panel) return;
  let body = panel.querySelector('.ia-config-body'); if(!body){ body = document.createElement('div'); body.className='ia-config-body'; panel.appendChild(body); }
  const fieldArch = document.createElement('div'); fieldArch.className='ia-field';
  fieldArch.innerHTML = `
    <label for="kobArchetypeSelect">Voz arquétipa ativa (KOBLLUX)</label>
    <select id="kobArchetypeSelect"></select>
    <div id="kobVoiceStatus" class="ia-status ok"></div>
  `;
  body.appendChild(fieldArch);
  const select = fieldArch.querySelector('#kobArchetypeSelect');
  getAllArchetypes().forEach(a=>{ const opt=document.createElement('option'); opt.value=a.id; opt.textContent=`${a.name} · ${a.tone}`; select.appendChild(opt); });
  select.value = state.activeId;
  select.addEventListener('change', ()=> saveArchetype(select.value));
  const fieldIde = document.createElement('div'); fieldIde.className='ia-field';
  fieldIde.innerHTML = `
    <label for="kobVoicesIde">IDE de Vozes (JSON arquétipos · opcional)</label>
    <textarea id="kobVoicesIde" rows="6" style="width:100%;border-radius:8px;border:1px solid rgba(0,255,255,.3);background:rgba(0,0,0,.7);color:inherit;font-size:.75rem;padding:6px 7px;resize:vertical;"></textarea>
    <div class="ia-actions">
      <button type="button" class="pill-btn" id="kobVoicesSaveBtn">Salvar IDE</button>
      <button type="button" class="pill-btn secondary" id="kobVoicesResetBtn">Reset IDE</button>
    </div>
  `;
  body.appendChild(fieldIde);
  const ideTextarea = fieldIde.querySelector('#kobVoicesIde');
  const btnSave = fieldIde.querySelector('#kobVoicesSaveBtn');
  const btnReset = fieldIde.querySelector('#kobVoicesResetBtn');
  const currentCfg = state.configOverrides || ARCHETYPES_BASE;
  ideTextarea.value = JSON.stringify(currentCfg, null, 2);
  btnSave.addEventListener('click', ()=>{ const ok = saveConfigOverrides(ideTextarea.value); if(ok) updateVoiceStatus('IDE salva. Atualize a página se mudar muitos arquétipos.','ok'); });
  btnReset.addEventListener('click', ()=>{ state.configOverrides = null; localStorage.removeItem(STORAGE_KEYS.config); ideTextarea.value = JSON.stringify(ARCHETYPES_BASE, null, 2); applyArchetypeTheme(getArchetypeById(state.activeId)); updateVoiceStatus('Config de vozes resetada para o padrão.','warn'); });
  updateVoiceStatus();
}

/* ======================
   8) KOB TTS DOCK (web component)
   ====================== */

const tpl = document.createElement('template');
tpl.innerHTML = /*html*/`
  <style>
    :host{ position:fixed; left:var(--tts-left,8px); bottom:calc(var(--tts-bottom,240px)+env(safe-area-inset-bottom,0px)); z-index:9999; display:block; touch-action:none; user-select:none; transition:left 420ms cubic-bezier(.22,1,.36,1), bottom 420ms cubic-bezier(.22,1,.36,1), transform 260ms ease; --dock-scale:.85; transform:scale(var(--dock-scale)); }
    :host(.dragging){ transition:none!important; transform:scale(1.04); }
    .dock{ display:flex; flex-direction:column; gap:8px; padding:8px; border-radius:14px; background:var(--tts-glass-bg,linear-gradient(180deg, rgba(18,22,38,.55), rgba(10,12,22,.35))); border:1px solid var(--tts-glass-bd, rgba(255,255,255,.14)); box-shadow:var(--tts-shadow, 0 20px 40px rgba(0,0,0,.45)); backdrop-filter:blur(14px) saturate(160%); align-items:center; min-width:62px; }
    .row{ display:flex; gap:8px; align-items:center; }
    .btn{ width:48px; height:48px; border-radius:12px; display:grid; place-items:center; font-size:18px; color:var(--tts-ink,#eaffff); background:var(--tts-btn-bg, linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.02))); border:1px solid var(--tts-btn-bd, rgba(255,255,255,.18)); cursor:pointer; transition:transform .18s ease, box-shadow .18s ease, background .18s ease; }
    .btn:hover{ transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,.35); } .btn:active{ transform:scale(.96); }
    .btn[aria-pressed="true"]{ outline:2px solid var(--tts-accent,#00ffcc); box-shadow:0 0 18px var(--tts-glow, rgba(0,255,200,.45)); }
    .status{ font-size:11px; text-align:center; opacity:.85; padding-top:2px; color:var(--tts-ink,#eaffff); min-width:72px; }
    .btn:focus{ outline:2px dashed color-mix(in srgb, var(--tts-accent,#00ffcc) 45%, transparent); outline-offset:4px; }
    @media (prefers-reduced-motion: reduce){ :host, .dock, .btn{ transition:none!important; } }
  </style>
  <div class="dock" role="toolbar" aria-label="TTS Dock">
    <div class="row" part="controls">
      <button class="btn" data-action="play" title="Play" aria-label="Play">▶</button>
      <button class="btn" data-action="pause" title="Pause" aria-label="Pause">⏸</button>
      <button class="btn" data-action="stop" title="Stop" aria-label="Stop">■</button>
    </div>
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
    this._dragging = false; this._pointerId = null;
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
  }
  connectedCallback(){
    const saved = localStorage.getItem(STORAGE_KEYS.dockPos);
    if(saved) try{ this._pos = JSON.parse(saved); }catch(e){}
    const { left, bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
    this._setPos(left, bottom);

    this.$dock.addEventListener('pointerdown', this._onPointerDown);
    this.shadowRoot.addEventListener('click', (e)=>{ const btn = e.target.closest('[data-action]'); if(!btn) return; this._handleAction(btn.dataset.action, btn); });
    this.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onWindowResize);
    if(!this.hasAttribute('tabindex')) this.setAttribute('tabindex','0');
  }
  disconnectedCallback(){
    this.$dock.removeEventListener('pointerdown', this._onPointerDown);
    this.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onWindowResize);
  }
  _setPos(l,b){ this._pos.left = Math.round(l); this._pos.bottom = Math.round(b); const c = this._ensureWithinBounds(this._pos.left, this._pos.bottom); this.style.left = `${c.left}px`; this.style.bottom = `${c.bottom}px`; this.style.setProperty('--tts-left', `${c.left}px`); this.style.setProperty('--tts-bottom', `${c.bottom}px`); }
  _ensureWithinBounds(left, bottom){
    const margin = 6;
    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth);
    const vh = Math.max(200, window.innerHeight || document.documentElement.clientHeight);
    const rect = this.getBoundingClientRect();
    const w = rect.width || 80; const h = rect.height || 80;
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
    const snapLeft  = margin; const snapRight = Math.max(margin, vw - dockRect.width - margin);
    const mid = dockRect.left + dockRect.width/2;
    const targetLeft = mid < vw/2 ? snapLeft : snapRight;
    const { bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom);
    this._setPos(targetLeft, bottom); localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos));
  }
  _onPointerDown(e){
    if(e.target.closest('[data-action]')) return;
    e.preventDefault();
    this._dragging=true; this.classList.add('dragging'); this._pointerId = e.pointerId; try{ this.setPointerCapture?.(e.pointerId); }catch(_) {}
    const startX = e.clientX; const startY = e.clientY; const startLeft = this._pos.left; const startBottom = this._pos.bottom;
    const move = (ev)=>{ if(this._pointerId !== ev.pointerId) return; const dx = ev.clientX - startX; const dy = ev.clientY - startY; this._setPos(Math.max(4, startLeft + dx), Math.max(4, startBottom - dy)); };
    const up = (ev)=>{ if(this._pointerId !== ev.pointerId) return; this._dragging=false; this.classList.remove('dragging'); try{ this.releasePointerCapture?.(this._pointerId); }catch(_){} window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); this._pointerId = null; this._snap(); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  }
  _onKeyDown(e){
    const step = (e.shiftKey ? 24 : 8);
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){ e.preventDefault(); let {left,bottom} = this._pos; if(e.key==='ArrowLeft') left -= step; if(e.key==='ArrowRight') left += step; if(e.key==='ArrowUp') bottom += step; if(e.key==='ArrowDown') bottom -= step; this._setPos(left,bottom); localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos)); return; }
    if(e.key===' ' || e.key==='Enter'){ e.preventDefault(); const playBtn = this.shadowRoot.querySelector('[data-action="play"]'); playBtn?.click(); }
  }
  _onWindowResize(){ const { left, bottom } = this._ensureWithinBounds(this._pos.left, this._pos.bottom); this._setPos(left,bottom); localStorage.setItem(STORAGE_KEYS.dockPos, JSON.stringify(this._pos)); }
  _handleAction(action, btn){
    this.shadowRoot.querySelectorAll('.btn').forEach(b=>b.removeAttribute('aria-pressed'));
    if(action==='play'){ btn.setAttribute('aria-pressed','true'); this.$status.textContent='Playing…'; window.dispatchEvent(new CustomEvent('kob-tts:play', { bubbles:true })); }
    else if(action==='pause'){ btn.setAttribute('aria-pressed','true'); this.$status.textContent='Paused'; window.dispatchEvent(new CustomEvent('kob-tts:pause', { bubbles:true })); }
    else if(action==='stop'){ this.$status.textContent='Stopped'; window.dispatchEvent(new CustomEvent('kob-tts:stop', { bubbles:true })); }
  }
}
customElements.define('kob-tts-dock', KobTtsDock);

/* ======================
   9) ENGINE — KobTtsEngine
   ====================== */
class KobTtsEngine {
  constructor(){
    this.synth = window.speechSynthesis;
    this.isPaused = false;
    this._init();
  }
  _init(){
    loadBrowserVoices();
    if(this.synth && this.synth.onvoiceschanged !== undefined){
      this.synth.onvoiceschanged = ()=>{ loadBrowserVoices(); };
    }
    window.addEventListener('kob-tts:play', () => this.speak());
    window.addEventListener('kob-tts:pause', () => this.pause());
    window.addEventListener('kob-tts:stop', () => this.stop());
    window.addEventListener('kob-tts:archetype-change', ()=> applyArchetypeTheme(getArchetypeById(state.activeId)));
  }
  _getActiveArch(){ return getArchetypeById(state.activeId) || { name:'Padrão', rate:1, pitch:1, voice:'' }; }
  _getBestVoice(preferredName){ const voices = this.synth.getVoices(); if(!voices.length) return null; if(preferredName){ const match = voices.find(v => v.name.toLowerCase().includes(preferredName.toLowerCase())); if(match) return match; } return voices.find(v => v.lang && v.lang.includes('pt')) || voices[0]; }
  speak(){
    if(this.synth.paused && this.isPaused){ this.synth.resume(); this.isPaused = false; return; }
    this.stop();
    const contentEl = document.querySelector('.response-block:last-of-type') || document.querySelector('main') || document.body;
    const text = contentEl ? (contentEl.innerText || contentEl.textContent) : '';
    if(!text) { updateVoiceStatus('Nada pra ler ainda.','warn'); return; }
    const arch = this._getActiveArch();
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = this._getBestVoice(arch.voice);
    utter.rate = arch.rate || 1.0;
    utter.pitch = arch.pitch || 1.0;
    utter.lang = 'pt-BR';
    utter.onstart = ()=>{ this.isPaused=false; console.log(`%c KOBLLUX falando como: ${arch.name}`, `color: ${arch.colorMain || '#fff'}`); window.dispatchEvent(new CustomEvent('kob-tts:started', { detail:{ arch } })); };
    utter.onend = ()=>{ window.dispatchEvent(new CustomEvent('kob-tts:stop')); };
    utter.onerror = (err)=>{ console.error('Erro no TTS:', err); this.stop(); };
    this.synth.speak(utter);
  }
  pause(){ if(this.synth.speaking && !this.synth.paused){ this.synth.pause(); this.isPaused = true; } }
  stop(){ this.synth.cancel(); this.isPaused = false; }
}

/* ======================
   10) INIT
   ====================== */
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
  if('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = ()=> loadBrowserVoices();
  applyArchetypeTheme(getArchetypeById(state.activeId));
  enhanceResponseBlocks(document);
  attachBlocksObserver();
  attachTtsClickHandler();
  attachVoiceBtnHandler();
  buildVoiceIdePanel();
  window.KOBLLUXVoices = {
    speak: speakText,
    stop: stopSpeaking,
    getActiveArchetype: ()=> getArchetypeById(state.activeId),
    setActiveArchetype: saveArchetype,
    getAllArchetypes,
    getRawConfig: ()=> ARCHETYPES_BASE,
    getOverrides: ()=> state.configOverrides,
    saveOverrides: (json) => saveConfigOverrides(json)
  };
  if(!window.kobTtsEngineInstance) window.kobTtsEngineInstance = new KobTtsEngine();
}

/* auto-init */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

/* export for module usage */
export default {
  init: initAll,
  api: () => window.KOBLLUXVoices
};
