// Toast provisório para feedback visual
window.toast = (msg) => {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;z-index:10000;font-family:sans-serif;font-size:14px;box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};

(()=>{ 
  if(window.__KOB_TTS_V33_ACTIVE) return; 
  window.__KOB_TTS_V33_ACTIVE = true;

  /* ---------- Constantes & Preferências do Dock ---------- */
  const POS_KEY  = 'kob_tts_pos_standalone';
  const PREF_KEY = 'kob_tts_prefs_standalone';
  const ROOTS    = ['#root', 'body'];
  const BLOCK_SEL= ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th'].join(',');

  /* ---------- Base de Arquétipos KOBLLUX ---------- */
  const STORAGE_KEYS = {
    archetype: 'KOBLLUX_VOICE_ARCHETYPE',
    config: 'KOBLLUX_VOICES_CONFIG_JSON'
  };

  const ARCHETYPES_BASE = [
    { id:'kodux', name:'KODUX', tone:'Criador do pulso', voice:'Reed', rate:0.86, pitch:0.68, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.30)', colorSecondary:'#FACC15' },
    { id:'kobllux', name:'KOBLLUX', tone:'Núcleo do sistema', voice:'es_m', rate:0.98, pitch:0.48, colorMain:'#22D3EE', colorSoft:'rgba(34,211,238,0.24)', colorSecondary:'#38BDF8' },
    { id:'atlas', name:'Atlas', tone:'Estratégico, metódico', voice:'Reed', rate:1.0, pitch:0.93, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.18)', colorSecondary:'#0EA5E9' },
    { id:'nova', name:'Nova', tone:'Vibrante, entusiasmado', voice:'Luciana', rate:1.06, pitch:1.34, colorMain:'#F97316', colorSoft:'rgba(249,115,22,0.18)', colorSecondary:'#FDBA74' },
    { id:'vitalis', name:'Vitalis', tone:'Energético, urgente', voice:'Rocko', rate:0.96, pitch:1.42, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.18)', colorSecondary:'#4ADE80' },
    { id:'pulse', name:'Pulse', tone:'Emocional, melódico', voice:'Reed', rate:1.0, pitch:1.14, colorMain:'#EC4899', colorSoft:'rgba(236,72,153,0.18)', colorSecondary:'#F9A8D4' },
    { id:'serena', name:'Serena', tone:'Calmo, acolhedor', voice:'Joana', rate:0.92, pitch:0.90, colorMain:'#38BDF8', colorSoft:'rgba(56,189,248,0.14)', colorSecondary:'#E0F2FE' },
    { id:'kaos', name:'Kaos', tone:'Desafiador, imprevisível', voice:'Rocko', rate:1.09, pitch:1.28, colorMain:'#FACC15', colorSoft:'rgba(250,204,21,0.18)', colorSecondary:'#FDE68A' },
    { id:'solus', name:'Solus', tone:'Sábio, introspectivo', voice:'es_m', rate:0.88, pitch:0.87, colorMain:'#0EA5E9', colorSoft:'rgba(14,165,233,0.20)', colorSecondary:'#0369A1' },
    { id:'infodose', name:'Infodose', tone:'Didático, carismático', voice:'Luciana', rate:1.06, pitch:0.96, colorMain:'#22C55E', colorSoft:'rgba(34,197,94,0.22)', colorSecondary:'#A7F3D0' }
  ];

  /* ---------- Estado Global ---------- */
  const state = {
    activeId: 'kodux',
    configOverrides: null,
    browserVoices: [],
    prefs: Object.assign({ outline: true, clickToSpeak: true }, readPrefs())
  };

  const $  = (q, r=document)=> r.querySelector(q);
  const $$ = (q, r=document)=> [...r.querySelectorAll(q)];
  const setCSS = (v,val)=> document.documentElement.style.setProperty(v,val);
  const getRoot= ()=> { for(const s of ROOTS){ const el=document.querySelector(s); if(el) return el; } return document.body; };

  /* ---------- Funções de Arquétipo e Tema ---------- */
  function loadArchetypeState(){
    try{
      const savedArch = localStorage.getItem(STORAGE_KEYS.archetype);
      if(savedArch) state.activeId = savedArch;
      const cfg = localStorage.getItem(STORAGE_KEYS.config);
      if(cfg) state.configOverrides = JSON.parse(cfg);
    }catch(e){}
  }

  function getAllArchetypes(){
    return (state.configOverrides && Array.isArray(state.configOverrides)) ? state.configOverrides : ARCHETYPES_BASE;
  }

  function getArchetypeById(id){
    const list = getAllArchetypes();
    return list.find(a => a.id === id) || list.find(a => a.id === 'kodux') || list[0];
  }

  function hexToRgba(hex, alpha){
    if(!hex) return `rgba(0,0,0,${alpha||1})`;
    let c = hex.replace('#','');
    if(c.length === 3) c = c.split('').map(ch => ch+ch).join('');
    const num = parseInt(c,16);
    return `rgba(${(num>>16)&255},${(num>>8)&255},${num&255},${alpha||1})`;
  }

  function applyArchetypeTheme(arch){
    if(!arch) arch = getArchetypeById(state.activeId);
    const primary = arch.colorMain || '#00f5ff';
    setCSS('--kob-voice-primary',  primary);
    setCSS('--kob-voice-secondary', arch.colorSecondary || '#ff4bff');
    setCSS('--kob-voice-bg-soft', arch.colorSoft || 'rgba(0,245,255,0.18)');
    
    // Opcional: Colorir a borda do outline com a cor do arquétipo
    if(outline) {
      outline.style.borderColor = primary;
      outline.style.boxShadow = `0 0 10px ${hexToRgba(primary, 0.5)}, inset 0 0 10px ${hexToRgba(primary, 0.2)}`;
    }
  }

  function cycleArchetype(){
    const list = getAllArchetypes();
    let idx = list.findIndex(a => a.id === state.activeId);
    idx = (idx + 1) % list.length;
    state.activeId = list[idx].id;
    try{ localStorage.setItem(STORAGE_KEYS.archetype, state.activeId); }catch(e){}
    applyArchetypeTheme(list[idx]);
    window.toast(`Voz Ativa: ${list[idx].name} (${list[idx].tone})`);
  }

  /* ---------- Criação Dinâmica do Dock ---------- */
  const dock = document.querySelector('.kob-tts-dock') || (()=> {
    const d = document.createElement('div');
    d.className = 'kob-tts-dock';
    // Adicionando um leve estilo inline base para o dock herdar as cores, caso você não tenha no CSS externo
    d.style.cssText = 'position:fixed; z-index:9999; display:flex; gap:4px; padding:8px; background:var(--kob-voice-bg-soft, rgba(0,0,0,0.8)); border:1px solid var(--kob-voice-primary, #333); border-radius:12px; backdrop-filter:blur(10px); color:#fff; align-items:center; transition: border-color 0.3s, background 0.3s;';
    
    d.innerHTML = `
      <button id="tts-on" title="Voz On/Off" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">🔊</button>
      <button id="tts-prev" title="Anterior" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">◀</button>
      <button id="tts-next" title="Próximo" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">▶</button>
      <button id="tts-sel" title="Ler seleção" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">✂︎</button>
      <button id="tts-stop" title="Parar" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">■</button>
      <button id="tts-reread" title="Re-Ler do início" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">⟳</button>
      <button id="tts-reset" title="Reset + próxima seção" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">↻</button>
      <button id="tts-grid" title="Outline / Click-to-Speak" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">⌗</button>
      <button id="tts-voice" title="Trocar Arquétipo (Voz)" style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:16px;">🎙</button>
      <small id="tts-status" style="margin-left:8px;font-family:monospace;font-size:12px;opacity:0.8;">Pronto.</small>
    `;
    document.body.appendChild(d);
    return d;
  })();

  const outline = document.getElementById('kob-tts-outline') || (()=> {
    const o = document.createElement('div');
    o.id='kob-tts-outline';
    o.style.cssText = 'position:absolute; pointer-events:none; border:2px solid var(--kob-voice-primary, #00f5ff); border-radius:6px; z-index:9998; transition:all 0.3s ease; display:none; background:var(--kob-voice-bg-soft, rgba(0,245,255,0.1));';
    document.body.appendChild(o);
    return o;
  })();

  /* ---------- Drag e Posição ---------- */
  applySavedPos();
  (()=>{ 
    let sx=0,sy=0,sl=0,sb=0,drag=false;
    const onDown=(ev)=>{ 
      if(ev.target.tagName === 'BUTTON') return;
      const e=ev.touches?ev.touches[0]:ev; drag=true; dock.classList.add('is-drag'); sx=e.clientX; sy=e.clientY;
      const cs=getComputedStyle(document.documentElement);
      sl=parseFloat(cs.getPropertyValue('--tts-left'))||16;
      sb=parseFloat(cs.getPropertyValue('--tts-bottom'))||20;
      addEventListener('pointermove',onMove,{passive:false});
      addEventListener('pointerup',onUp,{passive:false});
      addEventListener('touchmove',onMove,{passive:false});
      addEventListener('touchend',onUp,{passive:false});
    };
    const onMove=(ev)=>{ 
      if(!drag) return; const e=ev.touches?ev.touches[0]:ev;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      setCSS('--tts-left', Math.max(0, sl+dx)+'px');
      setCSS('--tts-bottom', Math.max(0, sb-dy)+'px');
      dock.style.left = `var(--tts-left)`;
      dock.style.bottom = `var(--tts-bottom)`;
    };
    const onUp=()=>{ if(!drag) return; drag=false; dock.classList.remove('is-drag'); savePos(); };
    dock.addEventListener('pointerdown',onDown); dock.addEventListener('touchstart',onDown);
  })();

  /* ---------- Speech & Vozes ---------- */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth){ console.warn('[TTS] SpeechSynthesis indisponível'); return; }
  try{ synth.cancel(); }catch{}

  function loadBrowserVoices(){
    let voices = synth.getVoices() || [];
    if(voices && voices.length) state.browserVoices = voices;
  }
  synth.onvoiceschanged = ()=> loadBrowserVoices();
  loadBrowserVoices();

  function pickBrowserVoice(prefName){
    const voices = state.browserVoices;
    if(!voices || !voices.length) return null;
    if(prefName){
      const exact = voices.find(v => v.name === prefName);
      if(exact) return exact;
      const loose = voices.find(v => v.name.toLowerCase().includes(prefName.toLowerCase()));
      if(loose) return loose;
    }
    let v = voices.find(v => v.lang.toLowerCase().startsWith('pt-br')) || voices.find(v => v.lang.toLowerCase().startsWith('pt'));
    return v || voices[0];
  }

  /* ---------- Estado da Leitura ---------- */
  let blocks=[], idx=0, speaking=false;

  function setStatus(t){ const el=$('#tts-status',dock); if(el) el.textContent=String(t); }
  function setStatusProgress(){ 
    const el=$('#tts-status',dock); if(!el) return;
    if(!blocks.length){ el.textContent='0/0'; return; }
    el.textContent = `${Math.min(idx+1,blocks.length)}/${blocks.length}`;
  }

  function sanitize(txt){ return String(txt||'').replace(/\bCopiar\b/g, ' ').replace(/\s{2,}/g,' ').trim(); }

  function rebuild(){
    const root = getRoot();
    const nodes = $$(BLOCK_SEL, root);
    const out=[];
    for(const node of nodes){
      let raw = node.innerText.trim();
      if(raw) out.push({ node, raw });
    }
    blocks = out; idx = 0;
    setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
  }

  /* ---------- Outline / Destaque ---------- */
  function hideOutline(){ outline.style.display='none'; }
  function showOutlineFor(node){
    if(!state.prefs.outline || !node) return hideOutline();
    const r=node.getBoundingClientRect();
    outline.style.display='block';
    outline.style.left  =(scrollX+r.left-6)+'px';
    outline.style.top   =(scrollY+r.top -6)+'px';
    outline.style.width =(r.width+12)+'px';
    outline.style.height=(r.height+12)+'px';
  }
  function highlight(){
    $$('[data-tts-current]').forEach(el=>el.removeAttribute('data-tts-current'));
    const b=blocks[idx]; if(!b) return;
    b.node.setAttribute('data-tts-current','true');
    try{ b.node.scrollIntoView({behavior:'smooth', block:'center'});}catch{}
    showOutlineFor(b.node);
  }
  addEventListener('scroll', ()=>{ const b=blocks[idx]; if(state.prefs.outline && b) showOutlineFor(b.node); }, {passive:true});
  addEventListener('resize', ()=>{ const b=blocks[idx]; if(state.prefs.outline && b) showOutlineFor(b.node); });

  /* ---------- Lógica de Fala (TTS) ---------- */
  function speakCurrent(){
    if(!blocks.length) rebuild();
    if(idx<0) idx=0;
    if(idx>=blocks.length){ stop(); window.toast('Fim da leitura.'); return; }

    const b = blocks[idx];
    const text = sanitize(b.raw);
    if(!text){ idx++; setStatusProgress(); return speakCurrent(); }

    try{ synth.cancel(); }catch{}
    
    // Puxa as configurações do ARQUÉTIPO ATUAL
    const arch = getArchetypeById(state.activeId);
    const voice = pickBrowserVoice(arch.voice);
    const u = new SpeechSynthesisUtterance(text);
    
    if(voice) u.voice = voice;
    u.lang = 'pt-BR';
    u.rate = arch.rate || 1.0;
    u.pitch = arch.pitch || 1.0;
    u.volume = 1;

    u.onend   = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };
    u.onerror = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };

    highlight();
    setStatusProgress();
    synth.speak(u);
  }

  function play(){ speaking=true; if(!blocks.length) rebuild(); speakCurrent(); }
  function stop(){ speaking=false; try{ synth.cancel(); }catch{} setStatus(blocks.length?`${Math.min(idx+1,blocks.length)}/${blocks.length}`:'Pausado.'); hideOutline(); }
  function toggle(){ speaking ? stop() : play(); }
  function next(){ if(!blocks.length) rebuild(); speaking=true; idx++; setStatusProgress(); speakCurrent(); }
  function prev(){ if(!blocks.length) rebuild(); speaking=true; idx=Math.max(0,idx-1); setStatusProgress(); speakCurrent(); }

  /* ---------- Botões do Dock ---------- */
  $('#tts-on',dock)?.addEventListener('click', e=>{ e.preventDefault(); toggle(); });
  $('#tts-prev',dock)?.addEventListener('click', e=>{ e.preventDefault(); prev(); });
  $('#tts-next',dock)?.addEventListener('click', e=>{ e.preventDefault(); next(); });
  $('#tts-stop',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); });
  $('#tts-reread',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); rebuild(); idx=0; play(); });
  $('#tts-reset',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); rebuild(); idx=0; setStatusProgress(); });

  // Seleção livre com a voz do Arquétipo
  $('#tts-sel',dock)?.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = String(window.getSelection && window.getSelection()).trim();
    if(!t){ window.toast('Selecione um trecho para ler.'); return; }
    try{ synth.cancel(); }catch{}
    
    const arch = getArchetypeById(state.activeId);
    const voice = pickBrowserVoice(arch.voice);
    const uu = new SpeechSynthesisUtterance(sanitize(t));
    
    if(voice) uu.voice=voice;
    uu.lang='pt-BR';
    uu.rate = arch.rate || 1.0;
    uu.pitch = arch.pitch || 1.0;
    
    synth.speak(uu);
  });

  // Outline toggle
  $('#tts-grid',dock)?.addEventListener('click', e=>{
    e.preventDefault();
    state.prefs.outline = !state.prefs.outline;
    state.prefs.clickToSpeak = state.prefs.outline;
    savePrefs();
    if(!state.prefs.outline) hideOutline(); else { const b=blocks[idx]; b && showOutlineFor(b.node); }
    window.toast(state.prefs.outline ? 'Outline Ativado' : 'Outline Desativado');
  });

  // Trocar Arquétipo (substitui o antigo "Trocar Voz PT-BR")
  $('#tts-voice',dock)?.addEventListener('click', e=>{
    e.preventDefault(); 
    cycleArchetype();
    // Se estiver falando, reinicia a fala com a nova voz
    if(speaking){
      try{ synth.cancel(); }catch{}
      speakCurrent();
    }
  });

  /* ---------- Click-to-Speak ---------- */
  document.addEventListener('click', (ev)=>{
    const blk = ev.target.closest(BLOCK_SEL);
    if(!blk || ev.target.closest('.kob-tts-dock')) return;
    const i = blocks.findIndex(b=> b.node===blk);
    if(i<0) return;
    idx=i;
    if(state.prefs.outline) showOutlineFor(blk);
    if(state.prefs.clickToSpeak){
      speaking=true; 
      speakCurrent();
    }else{
      setStatusProgress();
    }
  }, {passive:false});

  /* ---------- Boot & Storage ---------- */
  function readPrefs(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY)||'{}'); }catch{ return {}; } }
  function savePrefs(){ try{ localStorage.setItem(PREF_KEY, JSON.stringify(state.prefs)); }catch{} }
  function applySavedPos(){
    try{
      const s=JSON.parse(localStorage.getItem(POS_KEY)||'null');
      if(s){ 
        setCSS('--tts-left', s.left); setCSS('--tts-bottom', s.bottom); 
        dock.style.left = s.left; dock.style.bottom = s.bottom;
      }
    }catch{}
  }
  function savePos(){
    try{
      localStorage.setItem(POS_KEY, JSON.stringify({
        left: dock.style.left || '16px',
        bottom: dock.style.bottom || '20px'
      }));
    }catch{}
  }

  // Init Geral
  loadArchetypeState();
  applyArchetypeTheme();
  rebuild();
  setStatusProgress();

})();
