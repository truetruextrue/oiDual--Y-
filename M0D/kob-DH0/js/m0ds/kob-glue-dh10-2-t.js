(function(){
  'use strict';
  if(window.__KOBLLUX_MONOLITH_FIXED_INIT__) return;
  window.__KOBLLUX_MONOLITH_FIXED_INIT__ = true;

  // --- UTILS ---
  const $ = (q,r=document)=> r.querySelector(q);
  const $$ = (q,r=document)=> [...r.querySelectorAll(q)];
  const toastEl = $('#kx_toast');
  function toast(msg, ms=1400){ 
    if(!toastEl){ console.log('toast:', msg); return; } 
    toastEl.textContent = msg; toastEl.style.opacity='1'; 
    clearTimeout(toast._t); toast._t = setTimeout(()=> toastEl.style.opacity='0', ms); 
  }

  // --- DOM ELEMENTS ---
  const bar = $('#symbolBar'), toggleBtn = $('#toggleBtn'), frame = $('#content-frame');
  const root = $('#root'), hudStatus = $('#hudStatus'), outline = $('#kob-tts-outline');
  const BTN_PLAY = $('#btn-play');

  // --- CONFIG & ARCHETYPES ---
  const ARCHETYPES = [
    { id:'kobllux', name:'KOBLLUX', voice:'Majed',   lang:'ar-001', rate:0.98, pitch:0.48, color:'#22D3EE' },
    { id:'kodux',   name:'KODUX',   voice:'Majed',   lang:'ar-001', rate:0.86, pitch:0.68, color:'#F97316' },
    { id:'atlas',   name:'ATLAS',   voice:'Reed',    lang:'en-US',  rate:1.00, pitch:0.93, color:'#38BDF8' },
    { id:'nova',    name:'NOVA',    voice:'Luciana', lang:'pt-BR',  rate:1.06, pitch:1.34, color:'#F97316' },
    { id:'vitalis', name:'VITALIS', voice:'Rocko',   lang:'pt-BR',  rate:0.96, pitch:1.42, color:'#22C55E' },
    { id:'pulse',   name:'PULSE',   voice:'Reed',    lang:'pt-BR',  rate:1.00, pitch:1.14, color:'#EC4899' },
    { id:'artemis', name:'ARTEMIS', voice:'Paulina', lang:'es-MX',  rate:1.00, pitch:1.23, color:'#A855F7' },
    { id:'serena',  name:'SERENA',  voice:'Joana',   lang:'pt-BR',  rate:0.92, pitch:0.90, color:'#38BDF8' },
    { id:'kaos',    name:'KAOS',    voice:'Rocko',   lang:'pt-BR',  rate:1.09, pitch:1.28, color:'#FACC15' },
    { id:'genus',   name:'GENUS',   voice:'Reed',    lang:'pt-BR',  rate:0.98, pitch:1.20, color:'#E5E7EB' },
    { id:'lumine',  name:'LUMINE',  voice:'Flo',     lang:'fr-FR',  rate:1.03, pitch:1.55, color:'#FDE047' },
    { id:'solus',   name:'SOLUS',   voice:'Satu',    lang:'fi-FI',  rate:0.88, pitch:0.87, color:'#0EA5E9' },
    { id:'rhea',    name:'RHEA',    voice:'Alice',   lang:'it-IT',  rate:1.02, pitch:0.59, color:'#22C55E' },
    { id:'aion',    name:'AION',    voice:'Milena',  lang:'ru-RU',  rate:0.38, pitch:1.00, color:'#4F46E5' },
    { id:'uno',      name:'UNO',      voice:'Grandma', lang:'en-US', rate:0.90, pitch:0.93, color:'#F97316' },
    { id:'dual',     name:'DUAL',     voice:'Reed',    lang:'pt-BR', rate:1.02, pitch:1.02, color:'#06B6D4' },
    { id:'trinity',  name:'TRINITY',  voice:'Sandy',   lang:'en-US', rate:1.04, pitch:1.04, color:'#EC4899' },
    { id:'infodose', name:'INFODOSE', voice:'Luciana', lang:'pt-BR', rate:1.06, pitch:0.96, color:'#22C55E' },
    { id:'horus', name:'HORUS', voice:'Majed', lang:'ar-001', rate:0.94, pitch:0.82, color:'#F59E0B' }
  ];

  let state = {
    archIdx: 0,
    isSpeaking: false,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  const synth = window.speechSynthesis;

  // --- HUD LOGIC (DRAG & SNAP) ---
  function applyPosition(x,y){
    const maxX = window.innerWidth - bar.offsetWidth, maxY = window.innerHeight - bar.offsetHeight;
    x = Math.max(0, Math.min(maxX, x)); y = Math.max(0, Math.min(maxY, y));
    bar.style.left = x + 'px'; bar.style.top = y + 'px';
    bar.classList.remove('snap-side','snap-side-right','snap-top','floating');
    if(y <= 40) bar.classList.add('snap-top');
    else if(x <= 40) bar.classList.add('snap-side');
    else if(x >= maxX - 40) bar.classList.add('snap-side-right');
    else bar.classList.add('floating');
  }

  function snapToEdges(){
    bar.style.transition = 'all .36s cubic-bezier(.175,.885,.32,1.275)';
    const r = bar.getBoundingClientRect();
    let x = r.left, y = r.top;
    if(y < 40){ y = 0; x = (window.innerWidth - r.width)/2; }
    else { if(x < 40) x = 0; if(x > window.innerWidth - r.width - 40) x = window.innerWidth - r.width; }
    applyPosition(x,y);
    localStorage.setItem('kob_hud_pos', JSON.stringify({x,y}));
    setTimeout(()=> bar.style.transition = '', 420);
  }

  // --- THEME & ARCHETYPE ---
  function hexToRgba(hex,a){ 
    const c=hex.replace('#',''); 
    const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16); 
    return `rgba(${r},${g},${b},${a})`; 
  }

  function updateArchetype(idx){
    state.archIdx = idx % ARCHETYPES.length;
    const arch = ARCHETYPES[state.archIdx];
    const primary = arch.color || '#00f5ff';
    
    document.documentElement.style.setProperty('--kob-voice-primary', primary);
    document.documentElement.style.setProperty('--kob-voice-bg-soft', hexToRgba(primary, 0.14));
    if(hudStatus) hudStatus.textContent = arch.name;

    if(outline){
      outline.style.borderColor = primary;
      outline.style.boxShadow = `0 0 12px ${hexToRgba(primary,0.45)}`;
    }

    // Sync com o Engine se disponível
    if(window.KOBLLUX_VOICE_ENGINE) window.KOBLLUX_VOICE_ENGINE.activateArchetype(arch.id);
    
    if(state.isSpeaking){ stopSpeech(); startSpeech(); }
  }

  // --- TTS CORE ---
  function scanBlocks(){
    let nodes = [];
    try {
      const doc = frame?.contentDocument || frame?.contentWindow?.document;
      if(doc) nodes = [...doc.querySelectorAll('h1,h2,h3,p,li,blockquote,pre,td,th')];
    } catch(e){}
    if(!nodes.length) nodes = [...root.querySelectorAll('h1,h2,h3,p,li,blockquote,pre,td,th')];
    state.blocks = nodes.filter(n => (n.innerText||'').trim().length > 0);
  }

  function setStatus(){ 
    const el = $('#tts-status'); 
    if(el) el.textContent = state.blocks.length ? `${state.currentBlockIdx+1}/${state.blocks.length}` : '0/0'; 
  }

  function showOutlineFor(node){
    if(!node || !outline) return;
    const rect = node.getBoundingClientRect();
    const isInsideFrame = node.ownerDocument !== document;
    const offsetLeft = isInsideFrame ? frame.getBoundingClientRect().left : window.scrollX;
    const offsetTop = isInsideFrame ? frame.getBoundingClientRect().top : window.scrollY;

    outline.style.left = (rect.left + offsetLeft) + 'px';
    outline.style.top = (rect.top + offsetTop) + 'px';
    outline.style.width = (rect.width + 8) + 'px';
    outline.style.height = (rect.height + 8) + 'px';
    outline.style.display = 'block';
  }

  function speakCurrent(){
    if(!state.blocks.length) scanBlocks();
    if(state.currentBlockIdx >= state.blocks.length){ stopSpeech(); toast('Fim da leitura'); return; }

    const el = state.blocks[state.currentBlockIdx];
    const txt = (el?.innerText || '').trim();
    if(!txt){ state.currentBlockIdx++; return speakCurrent(); }

    const arch = ARCHETYPES[state.archIdx];

    // Tentar Engine Primeiro
    const engineOk = window.KOBLLUX_VOICE_ENGINE && window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype(txt, {
      onStart: () => { showOutlineFor(el); setStatus(); },
      onEnd: () => { if(state.isSpeaking){ state.currentBlockIdx++; setTimeout(speakCurrent, 100); } },
      onError: () => { state.currentBlockIdx++; speakCurrent(); }
    });

    if(!engineOk){
      // Fallback Nativo
      try{ synth.cancel(); }catch(e){}
      const u = new SpeechSynthesisUtterance(txt);
      const voices = synth.getVoices();
      u.voice = voices.find(v => v.name.includes(arch.voice)) || voices.find(v => v.lang.includes('pt')) || voices[0];
      u.rate = arch.rate; u.pitch = arch.pitch; u.lang = arch.lang || 'pt-BR';
      u.onstart = () => { showOutlineFor(el); setStatus(); };
      u.onend = () => { if(state.isSpeaking){ state.currentBlockIdx++; setStatus(); setTimeout(speakCurrent, 120); } };
      synth.speak(u);
    }
  }

  function startSpeech(){
    if(!state.blocks.length) scanBlocks();
    if(!state.blocks.length) return toast('Nada para ler');
    state.isSpeaking = true;
    if(BTN_PLAY) BTN_PLAY.textContent = '■';
    speakCurrent();
  }

  function stopSpeech(){
    state.isSpeaking = false;
    try{ synth.cancel(); }catch(e){}
    if(BTN_PLAY) BTN_PLAY.textContent = '▶';
    if(outline) outline.style.display = 'none';
    setStatus();
  }

  // --- API & COMPATIBILITY LAYER ---
  window.KOBLLUX = window.KOBLLUX || {};
  Object.assign(window.KOBLLUX, {
    startSpeech, stopSpeech, updateArchetype, state,
    speakText: function(txt, opts){
      const text = String(txt||'').trim();
      if(!text) return false;
      if(window.KOBLLUX_VOICE_ENGINE){
        if(opts?.arch) window.KOBLLUX_VOICE_ENGINE.activateArchetype(opts.arch);
        return window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype(text, opts);
      }
      // Fallback minimal
      try{ synth.cancel(); const u = new SpeechSynthesisUtterance(text); synth.speak(u); return true; } catch(e){ return false; }
    }
  });

  // --- INITIALIZATION ---
  (function init(){
    // Drag/Drop logic
    let dragging=false, start={ox:0, oy:0};
    bar.addEventListener('pointerdown', e => {
      if(e.target.closest('.symbol-button')) return;
      dragging = true; bar.classList.add('is-dragging');
      const rect = bar.getBoundingClientRect();
      start = { ox: e.clientX - rect.left, oy: e.clientY - rect.top };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => { if(dragging) applyPosition(e.clientX - start.ox, e.clientY - start.oy); });
    bar.addEventListener('pointerup', e => { dragging = false; bar.classList.remove('is-dragging'); snapToEdges(); });

    toggleBtn.addEventListener('click', () => {
      state.isCollapsed = !state.isCollapsed;
      bar.classList.toggle('collapsed', state.isCollapsed);
      localStorage.setItem('kob_collapsed', state.isCollapsed);
    });

    // Delegated clicks for Symbol Buttons
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.symbol-button');
      if(!btn) return;
      if(btn.dataset.url) { frame.src = btn.dataset.url; return toast('Abrindo URL...'); }
      
      const action = btn.id || btn.dataset.id;
      if(action === 'btn-play') state.isSpeaking ? stopSpeech() : startSpeech();
      if(action === 'btn-next'){ state.currentBlockIdx = Math.min(state.blocks.length-1, state.currentBlockIdx+1); if(state.isSpeaking) speakCurrent(); else setStatus(); }
      if(action === 'btn-prev'){ state.currentBlockIdx = Math.max(0, state.currentBlockIdx-1); if(state.isSpeaking) speakCurrent(); else setStatus(); }
      if(action === 'btn-arch') updateArchetype(state.archIdx + 1);
    });

    // Click to speak on document
    document.addEventListener('click', e => {
      const target = e.target.closest('h1,h2,h3,p,li,blockquote');
      if(!target || target.closest('#symbolBar')) return;
      scanBlocks();
      const idx = state.blocks.indexOf(target);
      if(idx >= 0) { state.currentBlockIdx = idx; startSpeech(); }
    }, {passive:true});

    // Restore Pos
    try{ const p = JSON.parse(localStorage.getItem('kob_hud_pos')); if(p) applyPosition(p.x, p.y); }catch(e){ applyPosition(20, 120); }
    if(state.isCollapsed) bar.classList.add('collapsed');
    
    updateArchetype(0);
    console.log('KOBLLUX Monolith Glue DH10 Ready.');
    toast('KOBLLUX pronto ✓', 900);
  })();

})();
