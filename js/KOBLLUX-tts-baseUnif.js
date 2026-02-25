/**
 * KOB TTS UNIFIED
 * Unifica: Tokens CSS, Arquétipos, Componente Dock e Motor de Voz.
 */

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
  } catch(e){ console.warn('[KOBLLUX_VOICES] loadStateFromStorage err', e); }
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
  try{
    const parsed = JSON.parse(jsonStr);
    state.configOverrides = parsed;
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(parsed));
    applyArchetypeTheme(getArchetypeById(state.activeId));
    updateVoiceStatus('Config de vozes salva (IDE).','ok');
    return true;
  } catch(e){
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
:root {
  --kob-voice-theme-duration: 520ms;
  --tts-dock-left: 8px; --tts-dock-bottom: 269px; --tts-gap: 10px;
  --tts-glass-bg: rgba(15, 18, 28, .38);
  --tts-glass-bd: rgba(255, 255, 255, .12);
  --tts-shadow: 0 12px 26px rgba(0, 0, 0, .35);
  --tts-glow: rgba(76, 240, 255, .85);
  --tts-ink: rgba(255, 255, 255, .92);
  --tts-ink-dim: rgba(255, 255, 255, .68);
  --tts-accent: #00ffcc;
}
.archetype-badge { display:inline-grid; align-items:center; padding:.35rem .6rem; border-radius:10px; font-weight:700; font-size:.85rem; margin-left:8px; transition: all 0.3s ease; }
.block-tts-btn { margin-left:8px; border-radius:6px; padding:.25rem .45rem; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); cursor:pointer; color: white; transition: all 0.2s; }
.block-tts-btn:hover { background: rgba(255,255,255,0.1); }
.block-tts-btn.speaking { box-shadow: 0 0 12px var(--tts-glow); transform: scale(1.1); background: var(--tts-accent); color: black; }
#kobVoiceStatus { font-size: 0.8rem; margin-top: 5px; opacity: 0.8; }
`;
  const s = document.createElement('style');
  s.id = 'kob-voice-theme-css';
  s.textContent = css;
  document.head.appendChild(s);
}

function hexToRgba(hex, alpha=1){
  let c = hex.replace('#','');
  if(c.length===3) c = c.split('').map(ch=>ch+ch).join('');
  const num = parseInt(c,16);
  return `rgba(${(num>>16)&255}, ${(num>>8)&255}, ${num&255}, ${alpha})`;
}

function applyArchetypeTheme(arch){
  const root = document.documentElement;
  const p = arch.colorMain || '#00f5ff';
  root.style.setProperty('--kob-voice-primary', p);
  root.style.setProperty('--kob-voice-bg-soft', arch.colorSoft || 'rgba(0,0,255,0.1)');
  root.style.setProperty('--tts-accent', p);
  root.style.setProperty('--tts-glow', hexToRgba(p, 0.6));
}

function applyBadgeColors(badgeEl, arch){
  const p = arch.colorMain || '#00f5ff';
  badgeEl.style.border = `1px solid ${hexToRgba(p,0.8)}`;
  badgeEl.style.color = p;
  badgeEl.style.background = arch.colorSoft || 'rgba(0,0,0,0.3)';
}

/* ======================
   5) TTS BROWSER HELPERS
   ====================== */
function loadBrowserVoices(){
  const voices = window.speechSynthesis?.getVoices() || [];
  if(voices.length){
    state.browserVoices = voices;
    state.voicesLoaded = true;
  }
}

function pickBrowserVoice(prefName){
  const voices = state.browserVoices;
  if(!voices.length) return null;
  const match = voices.find(v => v.name.toLowerCase().includes(prefName.toLowerCase()));
  if(match) return match;
  return voices.find(v => v.lang.startsWith('pt')) || voices[0];
}

function stopSpeaking(){
  window.speechSynthesis.cancel();
  state.isSpeaking = false;
  toggleVoiceBtn(false);
}

function speakText(text, archetypeId){
  if(!text) return;
  stopSpeaking();
  const arch = getArchetypeById(archetypeId || state.activeId);
  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = pickBrowserVoice(arch.voice);
  utter.rate = arch.rate || 1.0;
  utter.pitch = arch.pitch || 1.0;
  utter.lang = 'pt-BR';

  utter.onstart = () => { state.isSpeaking = true; toggleVoiceBtn(true); };
  utter.onend = () => { state.isSpeaking = false; toggleVoiceBtn(false); };
  
  window.speechSynthesis.speak(utter);
}

/* ======================
   6) DOM HELPERS
   ====================== */
function qs(sel){ return document.querySelector(sel); }
function updateVoiceStatus(msg, kind){
  const el = qs('#kobVoiceStatus');
  if(!el) return;
  const arch = getArchetypeById(state.activeId);
  el.textContent = msg || `Arquétipo: ${arch.name}`;
  el.style.color = kind === 'err' ? '#ff4444' : 'var(--tts-accent)';
}

function toggleVoiceBtn(isSpeaking){
  document.querySelectorAll('.block-tts-btn').forEach(b => {
    b.classList.remove('speaking');
    if(isSpeaking && b.dataset.active === 'true') b.classList.add('speaking');
  });
}

function enhanceResponseBlocks(root=document){
  root.querySelectorAll('.response-block').forEach(block => {
    if(block.dataset.kobTtsInit) return;
    block.dataset.kobTtsInit = '1';
    
    // Badge
    const arch = getArchetypeById(state.activeId);
    const badge = document.createElement('div');
    badge.className = 'archetype-badge';
    badge.textContent = arch.name;
    applyBadgeColors(badge, arch);
    block.prepend(badge);

    // Botão
    const btn = document.createElement('button');
    btn.className = 'block-tts-btn';
    btn.innerHTML = '◎';
    btn.onclick = () => {
      document.querySelectorAll('.block-tts-btn').forEach(b => b.dataset.active = 'false');
      btn.dataset.active = 'true';
      speakText(block.innerText, state.activeId);
    };
    block.appendChild(btn);
  });
}

/* ======================
   7) DOCK COMPONENT
   ====================== */
class KobTtsDock extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'}).innerHTML = `
      <style>
        :host { position:fixed; left:var(--tts-left,8px); bottom:var(--tts-bottom,240px); z-index:9999; }
        .dock { display:flex; gap:8px; padding:10px; background:rgba(0,0,0,0.6); backdrop-filter:blur(10px); border-radius:15px; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        button { width:40px; height:40px; border-radius:10px; border:none; background:rgba(255,255,255,0.1); color:white; cursor:pointer; font-size:1.2rem; }
        button:hover { background:rgba(255,255,255,0.2); }
      </style>
      <div class="dock">
        <button id="play">▶</button>
        <button id="pause">⏸</button>
        <button id="stop">■</button>
      </div>
    `;
  }
  connectedCallback(){
    this.shadowRoot.getElementById('play').onclick = () => window.dispatchEvent(new CustomEvent('kob-tts:play'));
    this.shadowRoot.getElementById('pause').onclick = () => window.dispatchEvent(new CustomEvent('kob-tts:pause'));
    this.shadowRoot.getElementById('stop').onclick = () => window.dispatchEvent(new CustomEvent('kob-tts:stop'));
  }
}
customElements.define('kob-tts-dock', KobTtsDock);

/* ======================
   8) ENGINE & INIT
   ====================== */
class KobTtsEngine {
  constructor(){
    window.addEventListener('kob-tts:play', () => {
      const lastBlock = document.querySelector('.response-block:last-of-type');
      if(lastBlock) speakText(lastBlock.innerText);
    });
    window.addEventListener('kob-tts:pause', () => window.speechSynthesis.pause());
    window.addEventListener('kob-tts:stop', () => stopSpeaking());
  }
}

function initAll(){
  injectGlobalCssOnce();
  loadStateFromStorage();
  loadBrowserVoices();
  window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
  applyArchetypeTheme(getArchetypeById(state.activeId));
  enhanceResponseBlocks();
  attachBlocksObserver();
  
  if(!window.kobTtsEngineInstance) window.kobTtsEngineInstance = new KobTtsEngine();
  
  // Expor API
  window.KOBLLUXVoices = {
    speak: speakText,
    stop: stopSpeaking,
    getActiveArchetype: () => getArchetypeById(state.activeId),
    setActiveArchetype: (id) => saveArchetype(id)
  };
}

function attachBlocksObserver(){
  const observer = new MutationObserver(muts => enhanceResponseBlocks());
  observer.observe(document.body, { childList:true, subtree:true });
}

document.addEventListener('DOMContentLoaded', initAll);
if(document.readyState !== 'loading') initAll();

