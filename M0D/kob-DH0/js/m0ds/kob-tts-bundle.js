/* kob-tts-bundle.js
   Single-file bundle: Voice Engine + Glue (HUD) — ready to use
   Drop into a page or include via <script src="..."></script>
*/
(function(){
  'use strict';
  if(window.__KOBLLUX_TTS_BUNDLE_INIT__) { console.log('KOBLLUX TTS bundle already init'); return; }
  window.__KOBLLUX_TTS_BUNDLE_INIT__ = true;

  /* -----------------------------
     Small DOM helpers & toast
     ----------------------------- */
  const $ = (q,r=document)=> r && r.querySelector ? r.querySelector(q) : null;
  const $$ = (q,r=document)=> r && r.querySelectorAll ? [...r.querySelectorAll(q)] : [];
  function createEl(tag, props={}) { const e = document.createElement(tag); Object.assign(e, props); return e; }
  function safeJSONParse(s, def=null){ try{ return JSON.parse(s); }catch(e){ return def; } }
  const toastElId = 'kob-tts-toast';
  function toast(msg, ms=1400){
    try{
      let el = document.getElementById(toastElId);
      if(!el){
        el = createEl('div',{ id: toastElId, className: 'kob-tts-toast' });
        Object.assign(el.style, {
          position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
          background:'rgba(10,11,19,0.9)', color:'#fff', padding:'8px 14px', borderRadius:'20px',
          zIndex:10001, opacity: '0', transition: 'opacity .28s ease'
        });
        document.body.appendChild(el);
      }
      el.textContent = String(msg||'');
      el.style.opacity = '1';
      clearTimeout(toast._t);
      toast._t = setTimeout(()=> el.style.opacity = '0', ms);
    }catch(e){ console.log('KOBLLUX.toast:', msg); }
  }

  /* -----------------------------
     ARCHETYPES (unified)
     ----------------------------- */
  const ARCHETYPES = [

{
id:'kobllux',
name:'KOBLLUX',
voice:'Reed',
lang:'pt-BR',
rate:0.98,
pitch:0.48,
theme:{
  primary:'#22D3EE',
  secondary:'#7dd3fc',
  soft:'rgba(34,211,238,.08)',
  glow:'0 0 18px rgba(34,211,238,.55)',
  accent:'#ffffff'
}
},

{
id:'kodux',
name:'KODUX',
voice:'Reed',
lang:'pt-BR',
rate:0.86,
pitch:0.68,
theme:{
  primary:'#F97316',
  secondary:'#fb923c',
  soft:'rgba(249,115,22,.08)',
  glow:'0 0 18px rgba(249,115,22,.55)',
  accent:'#ffffff'
}
},

{
id:'atlas',
name:'ATLAS',
voice:'Reed',
lang:'en-US',
rate:1.00,
pitch:0.93,
theme:{
  primary:'#78e3ff',
  secondary:'#b978ff',
  soft:'rgba(120,227,255,.07)',
  glow:'0 0 18px rgba(120,227,255,.55)',
  accent:'#ffffff'
}
},

{
id:'nova',
name:'NOVA',
voice:'Luciana',
lang:'pt-BR',
rate:1.06,
pitch:1.34,
theme:{
  primary:'#ff6b6b',
  secondary:'#ffb347',
  soft:'rgba(255,107,107,.08)',
  glow:'0 0 18px rgba(255,107,107,.55)',
  accent:'#ffffff'
}
},

{
id:'vitalis',
name:'VITALIS',
voice:'Rocko',
lang:'pt-BR',
rate:0.96,
pitch:1.42,
theme:{
  primary:'#4ecdc4',
  secondary:'#45b7d1',
  soft:'rgba(78,205,196,.08)',
  glow:'0 0 18px rgba(78,205,196,.55)',
  accent:'#ffffff'
}
},

{
id:'pulse',
name:'PULSE',
voice:'Reed',
lang:'pt-BR',
rate:1.00,
pitch:1.14,
theme:{
  primary:'#a8e6cf',
  secondary:'#d4a5a5',
  soft:'rgba(168,230,207,.08)',
  glow:'0 0 18px rgba(168,230,207,.55)',
  accent:'#ffffff'
}
},

{
id:'artemis',
name:'ARTEMIS',
voice:'Paulina',
lang:'es-MX',
rate:1.00,
pitch:1.23,
theme:{
  primary:'#ffd93d',
  secondary:'#ff9f1c',
  soft:'rgba(255,217,61,.08)',
  glow:'0 0 18px rgba(255,217,61,.55)',
  accent:'#ffffff'
}
},

{
id:'serena',
name:'SERENA',
voice:'Joana',
lang:'pt-BR',
rate:0.92,
pitch:0.90,
theme:{
  primary:'#b8e1ff',
  secondary:'#a0b9ff',
  soft:'rgba(184,225,255,.08)',
  glow:'0 0 18px rgba(184,225,255,.55)',
  accent:'#ffffff'
}
},

{
id:'kaos',
name:'KAOS',
voice:'Rocko',
lang:'pt-BR',
rate:1.09,
pitch:1.28,
theme:{
  primary:'#ff8066',
  secondary:'#b624ff',
  soft:'rgba(255,128,102,.08)',
  glow:'0 0 18px rgba(255,128,102,.55)',
  accent:'#ffffff'
}
},

{
id:'genus',
name:'GENUS',
voice:'Reed',
lang:'pt-BR',
rate:0.98,
pitch:1.23,
theme:{
  primary:'#95e1d3',
  secondary:'#f38181',
  soft:'rgba(149,225,211,.08)',
  glow:'0 0 18px rgba(149,225,211,.55)',
  accent:'#ffffff'
}
},

{
id:'lumine',
name:'LUMINE',
voice:'Flo',
lang:'fr-FR',
rate:1.03,
pitch:1.55,
theme:{
  primary:'#f9f3b2',
  secondary:'#ffe69b',
  soft:'rgba(249,243,178,.08)',
  glow:'0 0 18px rgba(249,243,178,.55)',
  accent:'#ffffff'
}
},

{
id:'solus',
name:'SOLUS',
voice:'Satu',
lang:'fi-FI',
rate:0.99,
pitch:0.87,
theme:{
  primary:'#ffb347',
  secondary:'#ff8c42',
  soft:'rgba(255,179,71,.08)',
  glow:'0 0 18px rgba(255,179,71,.55)',
  accent:'#ffffff'
}
},

{
id:'rhea',
name:'RHEA',
voice:'Alice',
lang:'it-IT',
rate:1.02,
pitch:0.59,
theme:{
  primary:'#b5eaea',
  secondary:'#80b3ff',
  soft:'rgba(181,234,234,.08)',
  glow:'0 0 18px rgba(181,234,234,.55)',
  accent:'#ffffff'
}
},

{
id:'aion',
name:'AION',
voice:'Milena',
lang:'ru-RU',
rate:0.88,
pitch:0.30,
theme:{
  primary:'#c79aff',
  secondary:'#9f7aff',
  soft:'rgba(199,154,255,.08)',
  glow:'0 0 18px rgba(199,154,255,.55)',
  accent:'#ffffff'
}
},

{
id:'uno',
name:'UNO',
voice:'Grandma',
lang:'en-US',
rate:0.90,
pitch:0.93,
theme:{
  primary:'#f97316',
  secondary:'#fb923c',
  soft:'rgba(249,115,22,.08)',
  glow:'0 0 18px rgba(249,115,22,.55)',
  accent:'#ffffff'
}
},

{
id:'dual',
name:'DUAL',
voice:'Reed',
lang:'pt-BR',
rate:1.02,
pitch:1.02,
theme:{
  primary:'#06b6d4',
  secondary:'#67e8f9',
  soft:'rgba(6,182,212,.08)',
  glow:'0 0 18px rgba(6,182,212,.55)',
  accent:'#ffffff'
}
},

{
id:'trinity',
name:'TRINITY',
voice:'Sandy',
lang:'en-US',
rate:1.04,
pitch:1.04,
theme:{
  primary:'#ec4899',
  secondary:'#f472b6',
  soft:'rgba(236,72,153,.08)',
  glow:'0 0 18px rgba(236,72,153,.55)',
  accent:'#ffffff'
}
},

{
id:'infodose',
name:'INFODOSE',
voice:'Luciana',
lang:'pt-BR',
rate:1.06,
pitch:0.96,
theme:{
  primary:'#22c55e',
  secondary:'#4ade80',
  soft:'rgba(34,197,94,.08)',
  glow:'0 0 18px rgba(34,197,94,.55)',
  accent:'#ffffff'
}
},

{
id:'horus',
name:'HORUS',
voice:'Majed',
lang:'ar-001',
rate:0.94,
pitch:0.82,
theme:{
  primary:'#f59e0b',
  secondary:'#fbbf24',
  soft:'rgba(245,158,11,.08)',
  glow:'0 0 18px rgba(245,158,11,.55)',
  accent:'#ffffff'
}
}

  ]; // end ARCHETYPES

  /* -----------------------------
     Voice Engine (internal) — exposes window.KOBLLUX_VOICE_ENGINE
     ----------------------------- */
  const VoiceEngine = {
    _internal: {
      archetypes: ARCHETYPES.slice(),
      currentArch: null,
      synth: (typeof window !== 'undefined' && 'speechSynthesis' in window) ? window.speechSynthesis : null,
      _voicesLoaded: false,
      _voicesCallbacks: [],
      interruptOnSpeak: true // configurable
    }
  };

  function registerArchetypes(list = []) {
    if (!Array.isArray(list)) return;
    VoiceEngine._internal.archetypes = list.slice();
  }

  function getArchetypeById(id) {
    if (!id) return null;
    return VoiceEngine._internal.archetypes.find(a => a.id === id) || null;
  }

  function injectVoiceThemeCSS() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('KOB_VOICE_THEME_CSS_PATCH')) return;

    const patch = document.createElement('style');
    patch.id = 'KOB_VOICE_THEME_CSS_PATCH';
    patch.textContent = `
:root{ --kob-tts-theme-duration: 520ms; }
body, .nebula, details.acc, .btn, #fab, .kob-tts-dock, .kob-tts-panel.is-dock {
  transition: background var(--kob-tts-theme-duration) ease, box-shadow var(--kob-tts-theme-duration) ease, border-color var(--kob-tts-theme-duration) ease, color var(--kob-tts-theme-duration) ease;
}
.kob-tts-toast { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
`;
    document.head.appendChild(patch);

    if (!document.getElementById('KOBLLUX_VOICE_THEME_CSS')) {
      const style = document.createElement('style');
      style.id = 'KOBLLUX_VOICE_THEME_CSS';
      style.textContent = `
:root{
  --kob-tts-primary: #78e3ff;
  --kob-tts-secondary: #b978ff;
  --kob-tts-accent: #ffffff;
  --kob-tts-soft: rgba(0,0,0,0.06);
  --kob-tts-glow: 0 0 18px rgba(0,216,216,0.55);
}
.kob-tts-dock{ background:var(--kob-tts-soft); box-shadow:var(--kob-tts-glow); border-radius:12px; backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.06); }
`;
      document.head.appendChild(style);
    }
  }

  function _ensureVoicesLoaded(cb) {
    const synth = VoiceEngine._internal.synth;
    if (!synth) { cb && cb([]); return; }

    const voices = synth.getVoices() || [];
    if (voices.length) {
      VoiceEngine._internal._voicesLoaded = true;
      cb && cb(voices);
      return;
    }

    // queue callback until onvoiceschanged fires
    VoiceEngine._internal._voicesCallbacks.push(cb);
    if (!VoiceEngine._internal._voicesLoaded) {
      const handler = () => {
        const vs = synth.getVoices() || [];
        VoiceEngine._internal._voicesLoaded = true;
        try {
          VoiceEngine._internal._voicesCallbacks.forEach(fn => { try{ fn(vs); }catch(e){} });
        } finally {
          VoiceEngine._internal._voicesCallbacks.length = 0;
        }
        try { synth.removeEventListener && synth.removeEventListener('voiceschanged', handler); } catch(e){}
      };
      try { synth.addEventListener ? synth.addEventListener('voiceschanged', handler) : (synth.onvoiceschanged = handler); } catch(e){}
      // safari quirk: trigger getVoices to prompt load
      try { synth.getVoices && synth.getVoices(); } catch(e){}
    }
  }

  function findVoiceByNamePart(name) {
    const synth = VoiceEngine._internal.synth;
    if (!synth) return null;
    const voices = synth.getVoices() || [];
    if (!voices.length) return null;
    if (!name) return voices[0] || null;
    const needle = String(name||'').toLowerCase();
    const byName = voices.find(v => v.name && v.name.toLowerCase().includes(needle));
    if (byName) return byName;
    // fallback by more specific lang matches
    const br = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt-br'));
    if (br) return br;
    const pt = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
    if (pt) return pt;
    return voices[0] || null;
  }

  function applyVoiceTheme(arch) {
    if (typeof document === 'undefined' || !arch) return;
    injectVoiceThemeCSS();
    const theme = arch.theme || {};
    const root = document.documentElement;
    const body = document.body || document.documentElement;
    try {
      root.style.setProperty('--kob-tts-primary', theme.primary || arch.color || '#22D3EE');
      root.style.setProperty('--kob-tts-secondary', theme.secondary || theme.primary || arch.color || '#22D3EE');
      root.style.setProperty('--kob-tts-soft', theme.soft || theme.bgSoft || 'rgba(34,211,238,0.06)');
      root.style.setProperty('--kob-tts-glow', theme.glow || '0 0 12px rgba(34,211,238,0.45)');
      root.style.setProperty('--kob-tts-accent', theme.accent || '#ffffff');
      body.setAttribute && body.setAttribute('data-voice-arch', arch.id);
      try {
        window.dispatchEvent(new CustomEvent('KOB_VOICE_COLOR', { detail:{ id: arch.id, theme: theme } }));
      } catch(e){}
    } catch(e){}
  }

  function speak(text, arch, hooks = {}) {
    if (!text) return false;
    const synth = VoiceEngine._internal.synth;
    if (!synth) return false;

    const utter = new SpeechSynthesisUtterance(String(text).trim());

    // cancel behavior: only interrupt if configured or forced
    try {
      if (VoiceEngine._internal.interruptOnSpeak) {
        try { synth.cancel(); } catch(e){}
      }
    } catch(e){}

    const setVoiceAndSpeak = (voices) => {
      const voice = (arch && arch.voice) ? (voices.find(v => v.name && v.name.toLowerCase().includes(String(arch.voice).toLowerCase())) || voices.find(v => /pt/i.test(v.lang)) || voices[0]) : (voices.find(v => /pt/i.test(v.lang)) || voices[0]);
      if (voice) utter.voice = voice;
      if (arch && arch.lang) utter.lang = arch.lang;
      utter.rate = (arch && typeof arch.rate === 'number') ? arch.rate : 1;
      utter.pitch = (arch && typeof arch.pitch === 'number') ? arch.pitch : 1;

      if (hooks.onStart) utter.onstart = hooks.onStart;
      if (hooks.onEnd) utter.onend = hooks.onEnd;
      if (hooks.onError) utter.onerror = hooks.onError;

      try { synth.speak(utter); } catch(e) { console.warn('speak error', e); }
    };

    const voices = synth.getVoices && synth.getVoices();
    if (voices && voices.length) {
      setVoiceAndSpeak(voices);
      return true;
    }

    // voices not ready yet — wait for them then speak
    _ensureVoicesLoaded((vs) => {
      try { setVoiceAndSpeak(vs || []); } catch(e){ console.warn(e); }
    });

    return true;
  }

  function activateArchetype(idOrArch) {
    const arch = (typeof idOrArch === 'string') ? getArchetypeById(idOrArch) : idOrArch;
    if (!arch) return null;
    VoiceEngine._internal.currentArch = arch;
    try { applyVoiceTheme(arch); } catch(e){ console.warn('applyVoiceTheme failed', e); }
    try { window.dispatchEvent(new CustomEvent('KOB_ARCHETYPE_CHANGE', { detail: arch })); } catch(e){}
    return arch;
  }

  function speakWithCurrentArchetype(text, hooks = {}) {
    if (!VoiceEngine._internal.currentArch) return false;
    return speak(text, VoiceEngine._internal.currentArch, hooks);
  }

  // expose API (global fallback)
  const VE_API = {
    registerArchetypes,
    getArchetypeById,
    activateArchetype,
    applyVoiceTheme,
    injectVoiceThemeCSS,
    speak,
    speakWithCurrentArchetype,
    _internal: VoiceEngine._internal
  };
  if (typeof window !== 'undefined') window.KOBLLUX_VOICE_ENGINE = VE_API;

  /* -----------------------------
     Glue / HUD / Reader (monolithic glue refactored)
     ----------------------------- */
  const HUD = {
    state: {
      archIdx: 0,
      isSpeaking: false,
      blocks: [],
      currentBlockIdx: 0,
      isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
    },
    elems: {}
  };

  // selectors tolerant
  HUD.elems.bar = $('#symbolBar');
  HUD.elems.toggleBtn = $('#toggleBtn');
  HUD.elems.frame = $('#content-frame') || $('#frame') || document.querySelector('iframe');
  HUD.elems.root = $('#root') || document.body;
  HUD.elems.hudStatus = $('#hudStatus');
  HUD.elems.outline = $('#kob-tts-outline') || (() => {
    const el = createEl('div', { id: 'kob-tts-outline' });
    Object.assign(el.style, { position: 'absolute', pointerEvents: 'none', display: 'none', zIndex:10000, borderRadius:'6px' });
    document.body.appendChild(el);
    return el;
  })();
  HUD.elems.BTN_PLAY = $('#btn-play');
  HUD.elems.BTN_NEXT = $('#btn-next');
  HUD.elems.BTN_PREV = $('#btn-prev');
  HUD.elems.BTN_ARCH = $('#btn-arch');

  const KOB_NS = 'kob_tts::v1::';
  const PST = k => KOB_NS + k;
  const StorageSafe = {
    get(k,d=null){ try{ const v = localStorage.getItem(PST(k)); return v==null? d : JSON.parse(v); }catch{return d} },
    set(k,v){ try{ localStorage.setItem(PST(k), JSON.stringify(v)); }catch{} }
  };

  // small util
  function hexToRgba(hex,a){ const c=(hex||'#000').replace('#',''); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16); return `rgba(${r},${g},${b},${a})`; }

  // apply theme from ARCHETYPES using the voice engine contract (kob-tts vars)
  function applyArchThemeByIndex(idx){
    HUD.state.archIdx = (typeof idx === 'number') ? (idx % ARCHETYPES.length) : 0;
    const arch = ARCHETYPES[HUD.state.archIdx] || ARCHETYPES[0];
    // prefer voice engine apply if available
    try{
      if(window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.activateArchetype === 'function'){
        window.KOBLLUX_VOICE_ENGINE.activateArchetype(arch.id);
      } else {
        // local apply
        const theme = arch.theme || {};
        document.documentElement.style.setProperty('--kob-tts-primary', theme.primary || arch.color || '#22D3EE');
        document.documentElement.style.setProperty('--kob-tts-secondary', theme.secondary || theme.primary || arch.color || '#22D3EE');
        document.documentElement.style.setProperty('--kob-tts-soft', theme.soft || theme.bgSoft || hexToRgba(theme.primary||arch.color||'#22D3EE',0.06));
        document.documentElement.style.setProperty('--kob-tts-glow', theme.glow || '0 0 12px rgba(34,211,238,0.45)');
        document.documentElement.style.setProperty('--kob-tts-accent', theme.accent || '#ffffff');
        if(document.body) document.body.setAttribute('data-voice-arch', arch.id);
      }
    }catch(e){ console.warn('applyArchThemeByIndex fail', e); }

    try{
      const primary = (arch.theme && arch.theme.primary) || arch.color || '#22D3EE';
      HUD.elems.outline.style.border = `1px solid ${primary}`;
      HUD.elems.outline.style.boxShadow = `0 0 12px ${hexToRgba(primary,0.45)}, inset 0 0 8px ${hexToRgba(primary,0.2)}`;
      HUD.elems.outline.style.background = hexToRgba(primary,0.06);
    }catch(e){}

    if(HUD.state.isSpeaking){ HUD.stopSpeech(); HUD.startSpeech(); }
    if(HUD.elems.hudStatus) HUD.elems.hudStatus.textContent = arch.name;
  }

  // expose a thin wrapper
  function updateArchetype(idx){ applyArchThemeByIndex(idx); }

  /* -----------------------------
     Blocks scanning & status (optimized TreeWalker fallback)
     ----------------------------- */
  function scanBlocks(){
    const sel = 'h1,h2,h3,p,li,blockquote,pre,td,th';
    // try frame first (if same-origin)
    try{
      const frame = HUD.elems.frame;
      if(frame && frame.contentWindow){
        const doc = frame.contentDocument || frame.contentWindow.document;
        if(doc && doc.body){
          const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, {
            acceptNode(node){
              if(!node.matches) return NodeFilter.FILTER_SKIP;
              if(!node.matches(sel)) return NodeFilter.FILTER_SKIP;
              const t = (node.textContent||'').trim();
              if(!t) return NodeFilter.FILTER_SKIP;
              // keep short titles too
              return NodeFilter.FILTER_ACCEPT;
            }
          });
          const nodes = [];
          while(walker.nextNode()) nodes.push(walker.currentNode);
          if(nodes.length){ HUD.state.blocks = nodes; HUD.state.currentBlockIdx = 0; return; }
        }
      }
    }catch(e){ /* cross-origin or other — fallback to local */ }

    // local document
    try{
      const root = HUD.elems.root || document.body;
      const walker = (root && root.ownerDocument) ? root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node){
          if(!node.matches) return NodeFilter.FILTER_SKIP;
          if(!node.matches(sel)) return NodeFilter.FILTER_SKIP;
          const t = (node.textContent||'').trim();
          if(!t) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      }) : null;
      const nodes = [];
      if(walker){
        while(walker.nextNode()) nodes.push(walker.currentNode);
      } else {
        // fallback selector
        const list = [...(root.querySelectorAll ? root.querySelectorAll(sel) : [])];
        list.forEach(n=> { if((n.textContent||'').trim()) nodes.push(n); });
      }
      HUD.state.blocks = nodes;
      HUD.state.currentBlockIdx = 0;
    }catch(e){ HUD.state.blocks = []; HUD.state.currentBlockIdx = 0; }
  }

  function setStatus(){
    const el = $('#tts-status');
    if(!el) return;
    if(!HUD.state.blocks.length) el.textContent='0/0';
    else el.textContent = `${Math.min(HUD.state.currentBlockIdx+1, HUD.state.blocks.length)}/${HUD.state.blocks.length}`;
  }

  function showOutlineFor(node){
    const outline = HUD.elems.outline;
    if(!outline || !node){ outline.style.display='none'; return; }
    try{
      const rect = node.getBoundingClientRect();
      const frame = HUD.elems.frame;
      if(node.ownerDocument !== document && frame){
        const fRect = frame.getBoundingClientRect();
        outline.style.left = (fRect.left + rect.left) + 'px';
        outline.style.top = (fRect.top + rect.top) + 'px';
      } else {
        outline.style.left = (rect.left + window.scrollX) + 'px';
        outline.style.top = (rect.top + window.scrollY) + 'px';
      }
      outline.style.width = (rect.width + 8) + 'px';
      outline.style.height = (rect.height + 8) + 'px';
      outline.style.display = 'block';
      outline.style.transform = 'translateZ(0)';
    }catch(e){ outline.style.display = 'none'; }
  }
  function hideOutline(){ try{ HUD.elems.outline.style.display = 'none'; }catch(e){} }

  /* -----------------------------
     speakCurrent / start / stop
     ----------------------------- */
  function speakCurrent(){
    if(!HUD.state.blocks.length) scanBlocks();
    if(HUD.state.currentBlockIdx >= HUD.state.blocks.length){ HUD.stopSpeech(); toast('Fim da leitura'); return; }

    const el = HUD.state.blocks[HUD.state.currentBlockIdx];
    const arch = ARCHETYPES[HUD.state.archIdx] || ARCHETYPES[0];
    const txt = (el && (el.textContent||el.innerText)) ? (el.textContent||el.innerText).trim() : '';
    if(!txt){ HUD.state.currentBlockIdx++; setStatus(); return speakCurrent(); }

    // try engine
    try{
      const engine = window.KOBLLUX_VOICE_ENGINE || VE_API;
      if(engine && typeof engine.activateArchetype === 'function' && typeof engine.speakWithCurrentArchetype === 'function'){
        engine.activateArchetype(arch.id);
        const ok = engine.speakWithCurrentArchetype(txt, {
          onStart(){
            showOutlineFor(el);
            setStatus();
          },
          onEnd(){
            if(HUD.state.isSpeaking){
              HUD.state.currentBlockIdx++;
              setTimeout(speakCurrent, 140);
            }
          },
          onError(){
            HUD.state.currentBlockIdx++;
            speakCurrent();
          }
        });
        if(ok) return;
      }
    }catch(e){ console.warn('voice engine call failed, falling back:', e); }

    // fallback to local speak using VoiceEngine.speak
    try{
      const engine2 = VE_API;
      applyArchThemeByIndex(HUD.state.archIdx);
      engine2.speak(txt, ARCHETYPES[HUD.state.archIdx], {
        onStart(){ showOutlineFor(el); setStatus(); },
        onEnd(){ if(HUD.state.isSpeaking){ HUD.state.currentBlockIdx++; setStatus(); setTimeout(()=>speakCurrent(), 140); } },
        onError(){ HUD.state.currentBlockIdx++; speakCurrent(); }
      });
    }catch(e){
      console.warn('fallback speak failed', e);
      HUD.state.isSpeaking = false;
      setStatus();
    }
  }

  function startSpeech(){
    if(!HUD.state.blocks.length) scanBlocks();
    if(!HUD.state.blocks.length){ toast('Nada para ler'); return; }
    HUD.state.isSpeaking = true;
    HUD.elems.BTN_PLAY && (HUD.elems.BTN_PLAY.textContent = '■');
    speakCurrent();
  }

  function stopSpeech(){
    HUD.state.isSpeaking = false;
    try{ VoiceEngine._internal.synth && VoiceEngine._internal.synth.cancel(); }catch(e){}
    HUD.elems.BTN_PLAY && (HUD.elems.BTN_PLAY.textContent = '▶');
    hideOutline();
    setStatus();
  }

  // click selection read
  function sanitize(txt){ return String(txt||'').replace(/\bCopiar\b/g,' ').replace(/\s{2,}/g,' ').trim(); }
  function readSelection(arch){
    const s = String(window.getSelection && window.getSelection());
    if (!s || !s.trim()) return toast('Selecione um trecho para ler.');
    try{
      const engine = window.KOBLLUX_VOICE_ENGINE || VE_API;
      engine.activateArchetype(arch.id);
      const ok = engine.speakWithCurrentArchetype(s.trim(), { onStart(){}, onEnd(){}, onError(){} });
      if(ok) return true;
    }catch(e){ console.warn('engine speakWithCurrentArchetype failed', e); }
    // fallback local
    try { VoiceEngine._internal.synth.cancel(); } catch(e){}
    VE_API.speak(String(sanitize(s)), arch);
    return true;
  }

  /* -----------------------------
     attach handlers: HUD bar buttons & clicks
     ----------------------------- */
  (function attachHandlers(){
    const bar = HUD.elems.bar;
    if(!bar) return;

    // cleanup previous if needed (best-effort)
    try{ bar.removeEventListener && bar.removeEventListener('click', ()=>{}); }catch(e){}

    bar.addEventListener('click', (ev) => {
      const btn = ev.target.closest ? ev.target.closest('.symbol-button') : null;
      if(!btn) return;

      // URL buttons
      if(btn.dataset && btn.dataset.url){
        const url = String(btn.dataset.url).trim();
        if(url){
          try{
            const frame = HUD.elems.frame;
            if(frame && ('src' in frame)) frame.src = url;
            localStorage.setItem('kob_last_url', url);
            toast('Abrindo ' + url);
          }catch(e){
            console.warn('Erro ao abrir iframe:', e);
            toast('Erro ao abrir URL');
          }
        }
        return;
      }

      const bid = (btn.id || btn.dataset.id || btn.dataset.action || '').toString();
      switch(bid){
        case 'btn-play':
          if(HUD.state.isSpeaking) HUD.stopSpeech(); else HUD.startSpeech();
          break;
        case 'btn-next':
          HUD.state.currentBlockIdx = Math.min((HUD.state.blocks||[]).length-1, HUD.state.currentBlockIdx + 1);
          if(HUD.state.isSpeaking) speakCurrent(); else showOutlineFor(HUD.state.blocks[HUD.state.currentBlockIdx]); setStatus();
          break;
        case 'btn-prev':
          HUD.state.currentBlockIdx = Math.max(0, HUD.state.currentBlockIdx - 1);
          if(HUD.state.isSpeaking) speakCurrent(); else showOutlineFor(HUD.state.blocks[HUD.state.currentBlockIdx]); setStatus();
          break;
        case 'btn-arch':
          if(ev.shiftKey){
            // shift+click -> mute/unmute visual indicator toggle
            const cur = HUD.state.archIdx || 0;
            HUD.state.isMuted = !HUD.state.isMuted;
            toast(HUD.state.isMuted ? 'Microfone Mudo' : 'Microfone Ativo');
            window.postMessage({ type:'voice:toggle', active: !HUD.state.isMuted }, '*');
          } else {
            updateArchetype((HUD.state.archIdx||0) + 1);
          }
          break;
        default:
          if(btn.dataset && btn.dataset.action === 'open-menu') HUD.elems.toggleBtn && HUD.elems.toggleBtn.click();
          break;
      }
    }, { passive: true });

    // selection click read
    document.addEventListener('click', (ev) => {
      const selector = 'h1,h2,h3,p,li,blockquote,pre,td,th';
      const target = ev.target.closest ? ev.target.closest(selector) : null;
      if(!target) return;
      if(target.closest && (target.closest('#symbolBar') || target.closest('.kob-tts-dock'))) return;
      scanBlocks();
      // find exact node index
      let idx = HUD.state.blocks.findIndex(b => b === target);
      if(idx < 0){
        const ttext = (target.textContent || target.innerText || '').trim();
        idx = HUD.state.blocks.findIndex(b => ((b.textContent||b.innerText||'').trim() === ttext));
      }
      if(idx >= 0) HUD.state.currentBlockIdx = idx;
      showOutlineFor(HUD.state.blocks[HUD.state.currentBlockIdx]);
      if(!HUD.state.isSpeaking) setStatus();
      const prefs = StorageSafe.get('prefs', {outline:true, clickToSpeak:true});
      if(prefs.clickToSpeak){ HUD.state.isSpeaking = true; startSpeech(); }
    }, { passive:true });

    // attach small API buttons if exist
    $('#tts-on') && $('#tts-on').addEventListener('click', ()=> { if(HUD.state.isSpeaking) HUD.stopSpeech(); else HUD.startSpeech(); });
    $('#tts-next') && $('#tts-next').addEventListener('click', ()=> { HUD.state.currentBlockIdx = Math.min(HUD.state.blocks.length-1, HUD.state.currentBlockIdx + 1); if(HUD.state.isSpeaking) speakCurrent(); else showOutlineFor(HUD.state.blocks[HUD.state.currentBlockIdx]); setStatus(); });
    $('#tts-prev') && $('#tts-prev').addEventListener('click', ()=> { HUD.state.currentBlockIdx = Math.max(0, HUD.state.currentBlockIdx - 1); if(HUD.state.isSpeaking) speakCurrent(); else showOutlineFor(HUD.state.blocks[HUD.state.currentBlockIdx]); setStatus(); });
    $('#tts-stop') && $('#tts-stop').addEventListener('click', ()=> HUD.stopSpeech());
    $('#tts-reset') && $('#tts-reset').addEventListener('click', ()=> { HUD.state.currentBlockIdx = 0; scanBlocks(); setStatus(); });
    $('#tts-reread') && $('#tts-reread').addEventListener('click', ()=> { HUD.state.currentBlockIdx = 0; HUD.startSpeech(); });
    $('#tts-sel') && $('#tts-sel').addEventListener('click', ()=> { const arch = ARCHETYPES[HUD.state.archIdx] || ARCHETYPES[0]; readSelection(arch); });
    $('#tts-grid') && $('#tts-grid').addEventListener('click', ()=> {
      const prefs = StorageSafe.get('prefs', {});
      prefs.outline = !prefs.outline;
      StorageSafe.set('prefs', prefs);
      toast(prefs.outline ? 'Outline ativado' : 'Outline desativado');
    });

  })(); // end attachHandlers

  /* -----------------------------
     Expose public API & init
     ----------------------------- */
  const KOB_API = {
    startSpeech: startSpeech,
    stopSpeech: stopSpeech,
    rebuildBlocks: scanBlocks,
    updateArchetype: updateArchetype,
    getState: () => HUD.state,
    getArchetypes: () => ARCHETYPES.slice(),
    setArchetypes: (arr) => { if(Array.isArray(arr)){ while(ARCHETYPES.length) ARCHETYPES.pop(); arr.forEach(a=>ARCHETYPES.push(a)); } },
    applyArchThemeByIndex
  };

  // attach voice engine registration as convenience
  KOB_API.registerArchetypes = registerArchetypes;
  KOB_API.activateArchetype = activateArchetype;
  KOB_API.speakText = function(txt, opts){
    try{
      const text = String(txt || '').trim();
      if(!text) return false;
      if(window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype === 'function'){
        if(opts && opts.arch) window.KOBLLUX_VOICE_ENGINE.activateArchetype(opts.arch);
        return window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype(text, {
          onStart: opts && opts.onStart,
          onEnd:   opts && opts.onEnd,
          onError: opts && opts.onError
        });
      }
      // fallback to internal VE_API
      const voiceName = (opts && opts.voice) || (ARCHETYPES[HUD.state.archIdx] && ARCHETYPES[HUD.state.archIdx].voice) || null;
      const arch = (opts && opts.arch) ? getArchetypeById(opts.arch) : (ARCHETYPES[HUD.state.archIdx] || ARCHETYPES[0]);
      return VE_API.speak(text, arch, {
        onStart: opts && opts.onStart,
        onEnd:   opts && opts.onEnd,
        onError: opts && opts.onError
      });
    }catch(e){ console.warn('KOBLLUX.speakText failed', e); return false; }
  };

  window.KOBLLUX = window.KOBLLUX || {};
  Object.assign(window.KOBLLUX, KOB_API);
  window.KOBLLUX_VOICE_ENGINE = window.KOBLLUX_VOICE_ENGINE || VE_API;

  // register default archetypes in the VoiceEngine internal registry
  try{ registerArchetypes(ARCHETYPES); activateArchetype(ARCHETYPES[0].id); }catch(e){}

  // initial scan and CSS injection
  try{ scanBlocks(); setStatus(); injectVoiceThemeCSS(); }catch(e){ console.warn('init scan fail', e); }

  console.log('KOBLLUX TTS bundle init ✓');
  toast('KOBLLUX pronto ✓', 900);

})(); // end bundle IIFE
