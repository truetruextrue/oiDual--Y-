// KOBLLUX — Unidade Sistêmica Completa (TTS + Fractais + Acordeão + HUD)
(function(){
  'use strict';
  if(window.__KOBLLUX_FULL_INIT__) return;
  window.__KOBLLUX_FULL_INIT__ = true;

  /* =========================================
     UTILITÁRIOS GLOBAIS
     ========================================= */
  const $ = (q,r=document)=> r?.querySelector?.(q) || null;
  const $$ = (q,r=document)=> [...(r?.querySelectorAll?.(q) || [])];

  function toast(msg, ms=1400){
    const toastEl = $('#kx_toast');
    if(!toastEl){ console.log('KOBLLUX.toast:', msg); return; }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toastEl.style.opacity='0', ms);
  }

  /* =========================================
     ARCHETYPES — Fonte Única de Verdade
     ========================================= */
  const ARCHETYPES = [
    { id:'kobllux', name:'KOBLLUX', voice:'Luciana',   lang:'pt-BR', rate:0.98, pitch:0.48, color:'#22D3EE' },
    { id:'kodux',   name:'KODUX',   voice:'Luciana',   lang:'pt-BR', rate:0.86, pitch:0.68, color:'#F97316' },
    { id:'atlas',   name:'ATLAS',   voice:'Reed',      lang:'en-US', rate:1.00, pitch:0.93, color:'#38BDF8' },
    { id:'nova',    name:'NOVA',    voice:'Luciana',   lang:'pt-BR', rate:1.06, pitch:1.34, color:'#F97316' },
    { id:'vitalis', name:'VITALIS', voice:'Rocko',     lang:'pt-BR', rate:0.96, pitch:1.42, color:'#22C55E' },
    { id:'pulse',   name:'PULSE',   voice:'Reed',      lang:'pt-BR', rate:1.00, pitch:1.14, color:'#EC4899' },
    { id:'artemis', name:'ARTEMIS', voice:'Paulina',   lang:'es-MX', rate:1.00, pitch:1.23, color:'#A855F7' },
    { id:'serena',  name:'SERENA',  voice:'Joana',     lang:'pt-BR', rate:0.92, pitch:0.90, color:'#38BDF8' },
    { id:'kaos',    name:'KAOS',    voice:'Rocko',     lang:'pt-BR', rate:1.09, pitch:1.28, color:'#FACC15' },
    { id:'genus',   name:'GENUS',   voice:'Reed',      lang:'pt-BR', rate:0.98, pitch:1.23, color:'#E5E7EB' },
    { id:'lumine',  name:'LUMINE',  voice:'Flo',       lang:'fr-FR', rate:1.03, pitch:1.55, color:'#FDE047' },
    { id:'solus',   name:'SOLUS',   voice:'Satu',      lang:'fi-FI', rate:0.96, pitch:0.87, color:'#0EA5E9' },
    { id:'rhea',    name:'RHEA',    voice:'Alice',     lang:'it-IT', rate:1.02, pitch:0.59, color:'#22C55E' },
    { id:'aion',    name:'AION',    voice:'Monica',    lang:'es-ES', rate:0.88, pitch:0.30, color:'#4F46E5' },
    { id:'uno',     name:'UNO',     voice:'Grandma',   lang:'en-US', rate:0.90, pitch:0.93, color:'#F97316' },
    { id:'dual',    name:'DUAL',    voice:'Milena',    lang:'ru-RU', rate:1.02, pitch:1.02, color:'#06B6D4' },
    { id:'trinity', name:'TRINITY', voice:'Sandy',     lang:'en-US', rate:1.04, pitch:1.04, color:'#EC4899' },
    { id:'infodose',name:'INFODOSE',voice:'Luciana',  lang:'pt-BR', rate:1.06, pitch:0.96, color:'#22C55E' },
    { id:'horus',   name:'HORUS',   voice:'Majed',     lang:'ar-001',rate:0.94, pitch:0.82, color:'#F59E0B' }
  ];

  // Injetar Archetype do usuário (se existir)
  const userName = localStorage.getItem("di_userName") || "";
  if(userName) {
    const userArch = {
      id: userName.toLowerCase(),
      name: userName,
      voice: 'Luciana',
      lang: 'pt-BR',
      rate: 0.98,
      pitch: 0.48,
      color: '#FFB347'   // cor diferenciada para o usuário
    };
    ARCHETYPES.push(userArch);
  }

  // Mapa de nomes para exibição
  const ARCH_NAMES = Object.fromEntries(ARCHETYPES.map(a => [a.id, a.name]));

  /* =========================================
     TTS ENGINE (kob-glue-dh10.js adaptado)
     ========================================= */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  const bar = $('#symbolBar');
  const toggleBtn = $('#toggleBtn');
  const frame = $('#content-frame') || $('#frame') || document.querySelector('iframe');
  const root = $('#root') || document.body;
  const hudStatus = $('#hudStatus');
  const outline = (() => {
    const el = document.createElement('div');
    el.id = 'kob-tts-outline';
    Object.assign(el.style, {
      position: 'absolute',
      pointerEvents: 'none',
      display: 'none',
      border: '2px solid',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    });
    document.querySelector('.content')?.appendChild(el);
    return el;
  })();

  let state = {
    archIdx: 0,
    isSpeaking: false,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  // Storage helpers
  const PST = k => `kob_tts::v1::${k}`;
  const Storage = {
    get(k,d=null){ try{ const v = localStorage.getItem(PST(k)); return v==null? d : JSON.parse(v); }catch{ return d; } },
    set(k,v){ try{ localStorage.setItem(PST(k), JSON.stringify(v)); }catch{} }
  };

  // Funções auxiliares TTS
  function hexToRgba(hex,a){ const c=(hex||'#000').replace('#',''); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16); return `rgba(${r},${g},${b},${a})`; }

  function applyVoiceTheme(arch){
    if(!arch) return;
    const root = document.documentElement;
    const primary = arch.color || '#22D3EE';
    const soft = hexToRgba(primary, 0.14);
    root.style.setProperty('--kob-voice-primary', primary);
    root.style.setProperty('--kob-voice-secondary', primary);
    root.style.setProperty('--kob-voice-bg-soft', soft);
    root.style.setProperty('--kob-voice-glow', `0 0 18px ${hexToRgba(primary,0.55)}`);
    document.body.setAttribute('data-voice-arch', arch.id);
    if(outline){
      outline.style.borderColor = primary;
      outline.style.boxShadow = `0 0 12px ${hexToRgba(primary,0.45)}`;
    }
    if(hudStatus) hudStatus.textContent = arch.name;
  }

  function updateArchetype(idx){
    state.archIdx = (idx % ARCHETYPES.length + ARCHETYPES.length) % ARCHETYPES.length;
    const arch = ARCHETYPES[state.archIdx];
    applyVoiceTheme(arch);
    if(state.isSpeaking){ stopSpeech(); startSpeech(); }
  }

  // Leitura de blocos
  function scanBlocks(){
    try{
      const sel = 'h1,h2,h3,p,li,blockquote,pre,td,th';
      if(frame?.contentWindow){
        const doc = frame.contentDocument || frame.contentWindow.document;
        const nodes = [...doc.querySelectorAll(sel)].filter(n=> n.innerText.trim().length > 0);
        if(nodes.length){ state.blocks = nodes; state.currentBlockIdx = 0; return; }
      }
    }catch(e){ /* cross‑origin */ }
    const localNodes = [...root.querySelectorAll(sel)].filter(n=> n.innerText.trim().length > 0);
    state.blocks = localNodes;
    state.currentBlockIdx = 0;
  }

  function setStatus(){
    const el = $('#tts-status');
    if(!el) return;
    if(!state.blocks.length) el.textContent='0/0';
    else el.textContent = `${Math.min(state.currentBlockIdx+1, state.blocks.length)}/${state.blocks.length}`;
  }

  function showOutlineFor(node){
    if(!outline || !node) return outline && (outline.style.display='none');
    try{
      const rect = node.getBoundingClientRect();
      if(node.ownerDocument !== document && frame){
        const fRect = frame.getBoundingClientRect();
        outline.style.left = fRect.left + rect.left + 'px';
        outline.style.top = fRect.top + rect.top + 'px';
      } else {
        outline.style.left = rect.left + window.scrollX + 'px';
        outline.style.top = rect.top + window.scrollY + 'px';
      }
      outline.style.width = rect.width + 8 + 'px';
      outline.style.height = rect.height + 8 + 'px';
      outline.style.display = 'block';
    }catch(e){ outline.style.display='none'; }
  }

  function hideOutline(){ if(outline) outline.style.display='none'; }

  // Voz (fallback)
  function findVoiceByNamePart(part){
    if(!synth) return null;
    const voices = synth.getVoices() || [];
    const v = voices.find(x => x.name.toLowerCase().includes(String(part||'').toLowerCase()));
    return v || voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
  }

  // Fala
  function speakCurrent(){
    if(!state.blocks.length) rebuildBlocks();
    if(state.currentBlockIdx >= state.blocks.length){ stopSpeech(); toast('Fim da leitura'); return; }

    const el = state.blocks[state.currentBlockIdx];
    const arch = ARCHETYPES[state.archIdx];
    const txt = el?.innerText?.trim() || '';
    if(!txt){ state.currentBlockIdx++; setStatus(); return speakCurrent(); }

    // Tenta usar engine global se existir
    const engine = window.KOBLLUX_VOICE_ENGINE;
    if(engine?.activateArchetype && engine?.speakWithCurrentArchetype){
      try{
        engine.activateArchetype(arch.id);
        const ok = engine.speakWithCurrentArchetype(txt, {
          onStart: () => { showOutlineFor(el); setStatus(); },
          onEnd: () => { if(state.isSpeaking){ state.currentBlockIdx++; setTimeout(speakCurrent,120); } },
          onError: () => { state.currentBlockIdx++; speakCurrent(); }
        });
        if(ok) return;
      }catch(e){ console.warn('engine fallback',e); }
    }

    // Fallback nativo
    if(!synth){ toast('TTS indisponível'); return; }
    try{ synth.cancel(); }catch(e){}
    const u = new SpeechSynthesisUtterance(txt);
    const voice = findVoiceByNamePart(arch.voice);
    if(voice) u.voice = voice;
    u.lang = arch.lang;
    u.rate = arch.rate;
    u.pitch = arch.pitch;
    u.onstart = () => { showOutlineFor(el); setStatus(); };
    u.onend = () => { if(state.isSpeaking){ state.currentBlockIdx++; setTimeout(speakCurrent,120); } };
    u.onerror = () => { if(state.isSpeaking){ state.currentBlockIdx++; speakCurrent(); } };
    synth.speak(u);
  }

  function startSpeech(){
    if(!state.blocks.length) rebuildBlocks();
    if(!state.blocks.length){ toast('Nada para ler'); return; }
    state.isSpeaking = true;
    const playBtn = $('#btn-play');
    if(playBtn) playBtn.textContent = '■';
    speakCurrent();
  }

  function stopSpeech(){
    state.isSpeaking = false;
    try{ synth?.cancel(); }catch(e){}
    const playBtn = $('#btn-play');
    if(playBtn) playBtn.textContent = '▶';
    hideOutline();
    setStatus();
  }

  function rebuildBlocks(){ scanBlocks(); setStatus(); }

  // Injeção de CSS para transições suaves
  function injectVoiceThemeCSS(){
    if(document.getElementById('KOB_VOICE_THEME_CSS')) return;
    const style = document.createElement('style');
    style.id = 'KOB_VOICE_THEME_CSS';
    style.textContent = `
      :root{ --kob-voice-theme-duration: 520ms; }
      body, .nebula, details.acc, .btn, #fab, .kob-tts-dock, .kob-tts-panel.is-dock {
        transition: background var(--kob-voice-theme-duration) ease,
                    box-shadow var(--kob-voice-theme-duration) ease,
                    border-color var(--kob-voice-theme-duration) ease,
                    color var(--kob-voice-theme-duration) ease;
      }
      .kob-tts-dock{
        background: var(--kob-voice-bg-soft);
        box-shadow: var(--kob-voice-glow);
        border-radius: 12px;
        backdrop-filter: blur(16px);
        border:1px solid rgba(255,255,255,0.06);
      }
    `;
    document.head.appendChild(style);
  }

  // Configuração do HUD arrastável
  function setupHUD(){
    if(!bar) return;
    let dragging=false, start={x:0,y:0,ox:0,oy:0};
    bar.addEventListener('pointerdown', e => {
      if(e.target.closest('.symbol-button')) return;
      dragging = true;
      bar.classList.add('is-dragging');
      const rect = bar.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, ox: e.clientX - rect.left, oy: e.clientY - rect.top };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if(!dragging) return;
      bar.style.transition = 'none';
      applyPosition(e.clientX - start.ox, e.clientY - start.oy);
    });
    bar.addEventListener('pointerup', e => {
      if(!dragging) return;
      dragging = false;
      bar.classList.remove('is-dragging');
      bar.releasePointerCapture(e.pointerId);
      snapToEdges();
    });
    toggleBtn?.addEventListener('click', ()=>{
      state.isCollapsed = !state.isCollapsed;
      bar.classList.toggle('collapsed', state.isCollapsed);
      localStorage.setItem('kob_collapsed', state.isCollapsed);
      setTimeout(snapToEdges, 320);
    });
    window.addEventListener('mousemove', resetIdleTimer, {passive:true});
    window.addEventListener('touchstart', resetIdleTimer, {passive:true});
    resetIdleTimer();
  }

  function applyPosition(x,y){
    if(!bar) return;
    const maxX = window.innerWidth - bar.offsetWidth;
    const maxY = window.innerHeight - bar.offsetHeight;
    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));
    bar.style.left = x + 'px';
    bar.style.top = y + 'px';
    bar.classList.remove('snap-side','snap-side-right','snap-top','floating');
    if(y <= 40) bar.classList.add('snap-top');
    else if(x <= 40) bar.classList.add('snap-side');
    else if(x >= maxX - 40) bar.classList.add('snap-side-right');
    else bar.classList.add('floating');
    try{ localStorage.setItem('kob_hud_pos', JSON.stringify({x,y})); }catch(e){}
  }

  function snapToEdges(){
    if(!bar) return;
    bar.style.transition = 'all .36s cubic-bezier(.175,.885,.32,1.275)';
    const r = bar.getBoundingClientRect();
    let x = r.left, y = r.top;
    if(y < 40){ y = 0; x = (window.innerWidth - r.width)/2; }
    else {
      if(x < 40) x = 0;
      if(x > window.innerWidth - r.width - 40) x = window.innerWidth - r.width;
    }
    applyPosition(x,y);
    setTimeout(()=> bar.style.transition = '', 420);
  }

  const IDLE_TIME = 9000;
  let idleTimer = null;
  function resetIdleTimer(){
    if(!bar) return;
    bar.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(()=> { if(!state.isCollapsed) bar.classList.add('idle'); }, IDLE_TIME);
  }

  // Restaurar posição do HUD
  (function restorePos(){
    if(!bar) return;
    try{
      const saved = JSON.parse(localStorage.getItem('kob_hud_pos') || '{"x":20,"y":120}');
      applyPosition(saved.x, saved.y);
    }catch(e){ applyPosition(20,120); }
    if(state.isCollapsed) bar.classList.add('collapsed');
  })();

  // Barra de símbolos (controles TTS)
  (function attachSymbolBarHandler(){
    if(!bar) return;
    bar.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.symbol-button');
      if(!btn) return;
      if(btn.dataset?.url){
        const url = btn.dataset.url.trim();
        if(url && frame && 'src' in frame){
          frame.src = url;
          localStorage.setItem('kob_last_url', url);
          toast('Abrindo ' + url);
        }
        return;
      }
      const bid = (btn.id || btn.dataset.id || btn.dataset.action || '').toString();
      const callTTS = (fnName) => {
        try{
          if(window.KOB_TTS?.[fnName]){ window.KOB_TTS[fnName](); return true; }
          if(window.KOBLLUX?.[fnName]){ window.KOBLLUX[fnName](); return true; }
          return false;
        }catch(e){ return false; }
      };
      switch(bid){
        case 'btn-play': callTTS('toggle') || callTTS('play') || callTTS('startSpeech') || toast('TTS indisponível'); break;
        case 'btn-next': callTTS('next') || (()=>{ if(state.blocks.length){ state.currentBlockIdx = Math.min(state.blocks.length-1, state.currentBlockIdx+1); if(state.isSpeaking) speakCurrent(); } })(); break;
        case 'btn-prev': callTTS('prev') || (()=>{ if(state.blocks.length){ state.currentBlockIdx = Math.max(0, state.currentBlockIdx-1); if(state.isSpeaking) speakCurrent(); } })(); break;
        case 'btn-arch': callTTS('cycleArchetype') || updateArchetype(state.archIdx+1); break;
        default: if(btn.dataset?.action === 'open-menu') toggleBtn?.click(); break;
      }
    });
  })();

  // Listeners dos botões extras (se existirem)
  $('#tts-on')?.addEventListener('click', ()=> state.isSpeaking ? stopSpeech() : startSpeech());
  $('#tts-next')?.addEventListener('click', ()=> { if(state.blocks.length) state.currentBlockIdx = Math.min(state.blocks.length-1, state.currentBlockIdx+1); if(state.isSpeaking) speakCurrent(); else showOutlineFor(state.blocks[state.currentBlockIdx]); setStatus(); });
  $('#tts-prev')?.addEventListener('click', ()=> { if(state.blocks.length) state.currentBlockIdx = Math.max(0, state.currentBlockIdx-1); if(state.isSpeaking) speakCurrent(); else showOutlineFor(state.blocks[state.currentBlockIdx]); setStatus(); });
  $('#tts-stop')?.addEventListener('click', stopSpeech);
  $('#tts-reset')?.addEventListener('click', ()=>{ state.currentBlockIdx = 0; rebuildBlocks(); setStatus(); });
  $('#tts-reread')?.addEventListener('click', ()=>{ state.currentBlockIdx = 0; startSpeech(); });

  // Seleção de texto para leitura
  $('#tts-sel')?.addEventListener('click', () => {
    const sel = window.getSelection()?.toString()?.trim();
    if(!sel) return toast('Selecione um trecho para ler.');
    const arch = ARCHETYPES[state.archIdx];
    const engine = window.KOBLLUX_VOICE_ENGINE;
    if(engine?.activateArchetype && engine?.speakWithCurrentArchetype){
      engine.activateArchetype(arch.id);
      engine.speakWithCurrentArchetype(sel);
    } else if(synth){
      const u = new SpeechSynthesisUtterance(sel);
      const v = findVoiceByNamePart(arch.voice);
      if(v) u.voice = v;
      u.lang = arch.lang;
      u.rate = arch.rate;
      u.pitch = arch.pitch;
      synth.speak(u);
    }
  });

  // Clique para ler bloco
  document.addEventListener('click', (ev) => {
    const target = ev.target.closest('h1,h2,h3,p,li,blockquote,pre,td,th');
    if(!target || target.closest('#symbolBar') || target.closest('.kob-tts-dock')) return;
    rebuildBlocks();
    let idx = state.blocks.findIndex(b => b.isEqualNode?.(target) || b.innerText === target.innerText);
    if(idx >= 0) state.currentBlockIdx = idx;
    showOutlineFor(state.blocks[state.currentBlockIdx]);
    if(!state.isSpeaking) setStatus();
    const prefs = Storage.get('prefs', {clickToSpeak:true});
    if(prefs.clickToSpeak) startSpeech();
  });

  Node.prototype.isEqualNode = Node.prototype.isEqualNode || function(other){ return this === other; };

  // Inicializa TTS
  (function initTTS(){
    try{
      const lastUrl = localStorage.getItem('kob_last_url');
      if(lastUrl && frame && 'src' in frame) frame.src = lastUrl;
    }catch(e){}
    scanBlocks();
    setStatus();
    injectVoiceThemeCSS();
    updateArchetype(0);
    setupHUD();
    toast('KOBLLUX TTS pronto ✓', 900);
  })();

  // API exposta
  window.KOBLLUX = {
    startSpeech, stopSpeech, rebuildBlocks, updateArchetype, state,
    getArchetypes: () => ARCHETYPES.slice(),
    setArchetypes: (arr) => { if(Array.isArray(arr)){ ARCHETYPES.length=0; arr.forEach(a=>ARCHETYPES.push(a)); } },
    speakText: (txt, opts) => {
      const text = String(txt||'').trim();
      if(!text) return false;
      const engine = window.KOBLLUX_VOICE_ENGINE;
      if(engine?.speakWithCurrentArchetype){
        if(opts?.arch) engine.activateArchetype(opts.arch);
        return engine.speakWithCurrentArchetype(text, opts);
      }
      if(!synth) return false;
      const utter = new SpeechSynthesisUtterance(text);
      const arch = ARCHETYPES[state.archIdx];
      const voiceName = opts?.voice || arch.voice;
      const voices = synth.getVoices();
      const voice = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase())) || voices.find(v => /pt/i.test(v.lang)) || voices[0];
      if(voice) utter.voice = voice;
      utter.lang = opts?.lang || arch.lang;
      utter.rate = opts?.rate ?? arch.rate;
      utter.pitch = opts?.pitch ?? arch.pitch;
      synth.speak(utter);
      return true;
    }
  };

  /* =========================================
     ACORDEÃO (override + observer)
     ========================================= */
  function makeCollapsible(node) {
    if(node.dataset.accordionInit) return;
    node.dataset.accordionInit = "true";
    const header = node.querySelector('.accordion-header');
    const body = node.querySelector('.collapsible-body');
    if(!header || !body) return;
    if(!header.querySelector('.indicator')){
      const indicator = document.createElement('span');
      indicator.className = 'indicator';
      indicator.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      header.appendChild(indicator);
    }
    if(!node.classList.contains('is-collapsed') && !node.classList.contains('is-open')) node.classList.add('is-open');
    if(node.classList.contains('is-collapsed')) body.style.height = '0px';
    header.addEventListener('click', (e) => {
      const tag = e.target.tagName.toLowerCase();
      if(['input','select','button','textarea'].includes(tag)) return;
      const isCollapsed = node.classList.contains('is-collapsed');
      if(isCollapsed){
        node.classList.remove('is-collapsed');
        node.classList.add('is-open');
        body.style.height = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function handler(e){
          if(e.propertyName === 'height'){
            body.style.height = 'auto';
            body.removeEventListener('transitionend', handler);
          }
        });
      } else {
        body.style.height = body.scrollHeight + 'px';
        void body.offsetHeight;
        node.classList.remove('is-open');
        node.classList.add('is-collapsed');
        body.style.height = '0px';
      }
    });
  }

  window.KobAccordion = {
    open: (card) => { card = typeof card === 'string' ? document.querySelector(card) : card; card?.classList.remove('is-collapsed'); card?.classList.add('is-open'); },
    close: (card) => { card = typeof card === 'string' ? document.querySelector(card) : card; card?.classList.remove('is-open'); card?.classList.add('is-collapsed'); },
    toggle: (card) => { card = typeof card === 'string' ? document.querySelector(card) : card; card?.querySelector('.accordion-header')?.click(); }
  };

  const accordionObserver = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if(!(node instanceof Element)) return;
        if(node.matches('.accordion')) makeCollapsible(node);
        node.querySelectorAll?.('.accordion').forEach(el => makeCollapsible(el));
      });
    });
  });
  accordionObserver.observe(document.body, {childList: true, subtree: true});
  document.querySelectorAll('.accordion').forEach(makeCollapsible);

  /* =========================================
     MATRIZ DE FRACTAIS (gerador)
     ========================================= */
  document.addEventListener('DOMContentLoaded', () => {
    const dom = {
      input: document.getElementById('inputText'),
      output: document.getElementById('outputContainer'),
      genBtn: document.getElementById('genBtn'),
      archSelect: document.getElementById('startArch'),
      cycleCheck: document.getElementById('cycleMode'),
      body: document.body,
      copyBtn: document.getElementById('copyBtn'),
      clearBtn: document.getElementById('clearBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      statusBar: document.getElementById('statusBar'),
      hudStatus: document.getElementById('hudStatus'),
      toastContainer: document.getElementById('toast-container'),
      mainCard: document.getElementById('mainHeroCard')
    };

    // Preencher dropdown de archetypes
    if(dom.archSelect){
      dom.archSelect.innerHTML = '';
      ARCHETYPES.forEach(arch => {
        const opt = document.createElement('option');
        opt.value = arch.id;
        opt.textContent = arch.name;
        dom.archSelect.appendChild(opt);
      });
    }

    // Carregar rascunho salvo
    const savedInput = localStorage.getItem('kobllux_draft_input');
    if(savedInput && dom.input) dom.input.value = savedInput;

    function showToast(msg){
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = msg;
      const primary = getComputedStyle(document.body).getPropertyValue('--kob-voice-primary').trim();
      toast.style.background = primary;
      dom.toastContainer.appendChild(toast);
      setTimeout(()=> toast.remove(), 3000);
    }

    function generateFractals(){
      const text = dom.input.value.trim();
      if(!text){ showToast("Texto vazio."); return; }
      localStorage.setItem('kobllux_draft_input', text);

      const sentences = text.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim()).filter(s=>s) || [];
      if(sentences.length === 0) return;

      const startId = dom.archSelect.value;
      const startIdx = ARCHETYPES.findIndex(a => a.id === startId);
      const isCycle = dom.cycleCheck.checked;

      dom.output.innerHTML = '';
      let resultText = '';

      sentences.forEach((sentence, i) => {
        const archIdx = isCycle ? (startIdx + i) % ARCHETYPES.length : startIdx;
        const arch = ARCHETYPES[archIdx];
        const block = document.createElement('div');
        block.className = 'para-block accordion is-open';
        block.style.setProperty('--kob-voice-primary', arch.color);
        block.style.borderLeftColor = arch.color;
        block.innerHTML = `
          <div class="accordion-header">
            <div class="arch-tag" style="color: ${arch.color}; border-color: color-mix(in srgb, ${arch.color} 30%, rgba(255,255,255,0.1))">
              ${arch.name} · Δ
            </div>
          </div>
          <div class="collapsible-body">
            <div class="content-inner">${sentence}</div>
          </div>
        `;
        dom.output.appendChild(block);
        resultText += `${arch.name.toUpperCase()} — ${sentence}\n\n`;
      });

      localStorage.setItem('kobllux_last_result', resultText.trim());
      dom.statusBar.textContent = `Opcode 0x0B · Matrix Densa Ativa · ${sentences.length} Fractal(s) Gerado(s)`;
      if(dom.hudStatus) dom.hudStatus.textContent = `Δ-${sentences.length}`;
      if(dom.mainCard?.classList.contains('is-open')) dom.mainCard.querySelector('.accordion-header')?.click();
      showToast("Integração Concluída");
    }

    dom.genBtn?.addEventListener('click', generateFractals);
    dom.input?.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey) && e.key === 'Enter') generateFractals(); });
    dom.copyBtn?.addEventListener('click', async () => {
      const content = localStorage.getItem('kobllux_last_result');
      if(!content){ showToast("Nenhum fractal para copiar."); return; }
      try{
        await navigator.clipboard.writeText(content);
        showToast("Fractais copiados para o Códex");
      }catch{
        const ta = document.createElement('textarea');
        ta.value = content;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast("Fractais copiados (Fallback)");
      }
    });
    dom.clearBtn?.addEventListener('click', () => {
      if(dom.input) dom.input.value = '';
      if(dom.output) dom.output.innerHTML = '<div class="empty-state">Sistema reiniciado. Aguardando novos dados.</div>';
      localStorage.removeItem('kobllux_last_result');
      localStorage.removeItem('kobllux_draft_input');
      if(dom.statusBar) dom.statusBar.textContent = 'Sistema em repouso · Matrix Pronta';
      if(dom.hudStatus) dom.hudStatus.textContent = '78K-ID';
      if(dom.mainCard?.classList.contains('is-collapsed')) dom.mainCard.querySelector('.accordion-header')?.click();
      showToast("Memória Limpa");
    });
    dom.downloadBtn?.addEventListener('click', () => {
      const content = localStorage.getItem('kobllux_last_result');
      if(!content){ showToast("Nenhum fractal para transferir."); return; }
      const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KOBLLUX_Fractais_${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Transferência Concluída");
    });

    // HUD magnético (elemento específico #hudBar)
    const hudBar = document.getElementById('hudBar');
    const dragHandle = document.getElementById('hudDrag');
    if(hudBar && dragHandle){
      let isDragging = false, currentX = 0, currentY = 0, initialX = 0, initialY = 0, xOffset = 0, yOffset = 0;
      function dragStart(e){
        e.preventDefault();
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        initialX = clientX - xOffset;
        initialY = clientY - yOffset;
        if(e.target === dragHandle || dragHandle.contains(e.target)){
          isDragging = true;
          hudBar.classList.add('dragging');
          hudBar.style.transition = 'none';
        }
      }
      function dragEnd(){
        if(isDragging){
          isDragging = false;
          hudBar.classList.remove('dragging');
          hudBar.style.transition = 'transform 0.1s ease-out';
        }
      }
      function drag(e){
        if(!isDragging) return;
        e.preventDefault();
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        currentX = clientX - initialX;
        currentY = clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        hudBar.style.transform = `translate3d(calc(-50% + ${currentX}px), ${currentY}px, 0)`;
      }
      hudBar.addEventListener('touchstart', dragStart, {passive:false});
      document.addEventListener('touchend', dragEnd);
      document.addEventListener('touchmove', drag, {passive:false});
      hudBar.addEventListener('mousedown', dragStart);
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('mousemove', drag);
    }
  });
})();
