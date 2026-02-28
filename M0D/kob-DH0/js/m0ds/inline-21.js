
(()=>{ // IIFE – instala somente uma vez
  if(window.__KOB_TTS_V2_ACTIVE){ console.debug('[KOBLLUX TTS] já ativo'); return; }
  window.__KOB_TTS_V2_ACTIVE = true;

  const DOCKED = true;          // true = dock vertical fixo
  const DRAG_ENABLED = true;    // arrastar e lembrar posição
  const POS_KEY = 'kob_tts_dock_pos_v1';

  // ——— Mitigar conflito com TTS antigo ———
  try{
    if('speechSynthesis' in window){ window.speechSynthesis.cancel(); }
    if(window.__tts && typeof window.__tts.stop === 'function'){ try{ window.__tts.stop(); }catch(e){} }
    window.__tts = { set:()=>{}, speak:()=>{}, stop:()=>{} }; // no-op legacy
  }catch(e){}

  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth){ console.warn('[KOBLLUX TTS] SpeechSynthesis não disponível'); return; }

  // ——— Seletores tolerantes para raiz renderizada/analisada ———
  const ROOT_SELECTORS = ['#root','[data-analyzer-output]','.analyzer-output','#render','main','.content'];
  const getRoot = ()=> {
    for(const sel of ROOT_SELECTORS){
      const el = document.querySelector(sel);
      if(el) return el;
    }
    return document.body;
  };

  // ——— UI ———
  const ensurePanel = ()=>{
    let wrap = document.querySelector('.kob-tts-panel');
    let btnT = document.getElementById('btn-tts');
    let btnS = document.getElementById('btn-tts-sel');
    let btnX = document.getElementById('btn-tts-stop');
    let btnPrev = document.getElementById('btn-tts-prev');
    let btnNext = document.getElementById('btn-tts-next');
    let status = document.querySelector('[data-tts-status]');

    if(!(btnT && btnS && btnX && status)){
      wrap = document.createElement('div');
      wrap.className = 'kob-tts-panel' + (DOCKED ? ' is-dock' : '');
      wrap.innerHTML = DOCKED
        ? `
          <button id="btn-tts"       type="button" title="Ativar/Desativar leitura contínua" aria-pressed="false">🔊</button>
          <button id="btn-tts-prev"  type="button" title="Bloco anterior">◀</button>
          <button id="btn-tts-next"  type="button" title="Próximo bloco">▶</button>
          <button id="btn-tts-sel"   type="button" title="Ler apenas seleção">✂︎</button>
          <button id="btn-tts-stop"  type="button" title="Parar voz">■</button>
          <small data-tts-status>Pronto.</small>
        `
        : `
          <button id="btn-tts"       type="button" title="Ativar/Desativar leitura contínua">Voz: Off</button>
          <button id="btn-tts-prev"  type="button" title="Bloco anterior">◀</button>
          <button id="btn-tts-next"  type="button" title="Próximo bloco">▶</button>
          <button id="btn-tts-sel"   type="button" title="Ler apenas seleção">Ler seleção</button>
          <button id="btn-tts-stop"  type="button" title="Parar voz">Parar</button>
          <small data-tts-status>Pronto.</small>
        `;
      document.body.appendChild(wrap);
      btnT   = wrap.querySelector('#btn-tts');
      btnS   = wrap.querySelector('#btn-tts-sel');
      btnX   = wrap.querySelector('#btn-tts-stop');
      btnPrev= wrap.querySelector('#btn-tts-prev');
      btnNext= wrap.querySelector('#btn-tts-next');
      status = wrap.querySelector('[data-tts-status]');
    }else if(DOCKED){
      const w = btnT.closest('.kob-tts-panel'); if(w) w.classList.add('is-dock');
      btnT.textContent='🔊'; if(btnPrev) btnPrev.textContent='◀'; if(btnNext) btnNext.textContent='▶';
      btnS.textContent='✂︎'; btnX.textContent='■';
    }

    return {wrap, btnT, btnS, btnX, btnPrev, btnNext, status};
  };

  // ——— Toast seguro ———
  const toastSafe = (msg)=> { try{ if(typeof window.toast==='function') window.toast(msg); }catch(e){} };

  // ——— Voz ———
  let voice = null;
  const pickVoice = ()=>{
    const vs = synth.getVoices() || [];
    return vs.find(v=>/pt[-_]BR/i.test(v.lang))
        || vs.find(v=>/pt/i.test(v.lang))
        || vs[0] || null;
  };
  const ensureVoice = ()=> { if(!voice) voice = pickVoice(); };
  synth.onvoiceschanged = ()=> { if(!voice) voice = pickVoice(); };

  // ——— Estado TTS ———
  let blocks = [];        // [{ node, text }]
  let currentIndex = 0;
  let speaking = false;
  let utterance = null;
  let errorStreak = 0;
  const MAX_ERRORS = 3;

  // ——— Utils ———
  const setLabel = (btn, on)=>{
    if(!btn) return;
    if(DOCKED){ btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.textContent = '🔊'; }
    else{ btn.textContent = 'Voz: ' + (on ? 'On' : 'Off'); }
  };
  const setStatus = (el, txt)=> { if(el) el.textContent = txt; };
  const clearHighlight = ()=> document.querySelectorAll('[data-tts-current]').forEach(el=>el.removeAttribute('data-tts-current'));
  const highlightCurrent = ()=>{
    clearHighlight();
    if(!blocks.length) return;
    const b = blocks[currentIndex]; if(!b || !b.node) return;
    b.node.setAttribute('data-tts-current','true');
    try{ b.node.scrollIntoView({behavior:'smooth', block:'center'});}catch(e){}
  };

  const BUILD_NODE_SEL = [
    'h1','h2','h3','h4','h5','h6',
    'p','li','blockquote','.callout',
    'pre.md-code','codeblock','table.md-table td','table.md-table th'
  ].join(',');

  const buildBlocksFromDOM = ()=>{
    const root = getRoot();
    const nodes = root.querySelectorAll(BUILD_NODE_SEL);
    const list = [];
    nodes.forEach(node=>{
      let text = (node.innerText || '').replace(/\bCopiar\b/g,'').trim();
      if(!text) return;
      list.push({ node, text });
    });
    blocks = list;
    currentIndex = 0;
    errorStreak = 0;
    setStatus(ui.status, blocks.length ? `TTS pronto: ${blocks.length} blocos.` : 'Nenhum bloco válido.');
    if(blocks.length) toastSafe('TTS pronto: ' + blocks.length + ' blocos');
  };

  const stopInternal = ()=>{
    speaking = false; errorStreak = 0;
    try{ synth.cancel(); }catch(e){}
    if(utterance){ try{ utterance.onend=null; utterance.onerror=null; }catch(e){}; utterance=null; }
    clearHighlight(); setLabel(ui.btnT, false); setStatus(ui.status, 'TTS parado.');
  };

  const speakCurrent = ()=>{
    if(!blocks.length) buildBlocksFromDOM();
    if(!blocks.length){ stopInternal(); return; }

    if(currentIndex < 0) currentIndex = 0;
    if(currentIndex >= blocks.length){ stopInternal(); toastSafe('Fim dos blocos'); return; }

    const b = blocks[currentIndex];
    if(!b || !b.text || !b.text.trim()){
      errorStreak++;
      if(errorStreak > MAX_ERRORS){ toastSafe('Muitos blocos vazios/erro. Pausado.'); stopInternal(); return; }
      currentIndex++; speakCurrent(); return;
    }

    try{ synth.cancel(); }catch(e){}
    ensureVoice();

    utterance = new SpeechSynthesisUtterance(b.text.trim());
    if(voice) utterance.voice = voice;
    utterance.lang = (voice && voice.lang) || 'pt-BR';
    utterance.rate = 1.0; utterance.pitch = 1.0; utterance.volume = 1.0;

    utterance.onend   = ()=>{ if(!speaking) return; currentIndex++; speakCurrent(); };
    utterance.onerror = ()=>{ if(!speaking) return; errorStreak++; (errorStreak>MAX_ERRORS)?(toastSafe('Erros seguidos. Pausado.'), stopInternal()):(currentIndex++, speakCurrent()); };

    highlightCurrent();
    setStatus(ui.status, `Lendo ${currentIndex+1}/${blocks.length}…`);
    synth.speak(utterance);
  };

  // ——— Controles ———
  const toggle = ()=>{
    if(speaking){ stopInternal(); toastSafe('Voz desativada'); return; }
    speaking = true; setLabel(ui.btnT, true);
    if(!blocks.length) buildBlocksFromDOM();
    speakCurrent(); toastSafe('Voz ativada');
  };
  const speakSelection = ()=>{
    const text = (window.getSelection && String(window.getSelection())) || '';
    const t = text.trim();
    if(!t){ toastSafe('Selecione um trecho primeiro'); return; }
    ensureVoice(); try{ synth.cancel(); }catch(e){}
    const u = new SpeechSynthesisUtterance(t);
    if(voice) u.voice = voice;
    u.lang = (voice && voice.lang) || 'pt-BR';
    u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
    synth.speak(u);
  };
  const nextBlock = ()=>{ if(!blocks.length) buildBlocksFromDOM(); speaking = true; setLabel(ui.btnT, true); currentIndex++; speakCurrent(); };
  const prevBlock = ()=>{ if(!blocks.length) buildBlocksFromDOM(); speaking = true; setLabel(ui.btnT, true); currentIndex = Math.max(0, currentIndex-1); speakCurrent(); };

  // ——— Auto-wire: botões externos "TTS" / "ouvir TTS" ———
  const isTTSLabel = (el)=>{
    const t = (el.textContent||'').toLowerCase().replace(/\s+/g,' ').trim();
    return /\btts\b/.test(t) || t.includes('ouvir tts');
  };
  const bindExternal = (root=document)=>{
    const candidates = Array.from(root.querySelectorAll('button, a, [role="button"], .btn, .button'))
      .filter(el=>!el.dataset.kobTtsBound && isTTSLabel(el));
    candidates.forEach(el=>{
      el.dataset.kobTtsBound = '1';
      el.addEventListener('click', (e)=>{ e.preventDefault(); toggle(); }, { passive:false });
      el.title = (el.title||'') || 'Ativar/Desativar TTS';
    });
  };
  const mo = new MutationObserver((muts)=>{
    for(const m of muts){
      if(m.addedNodes) m.addedNodes.forEach(n=>{ if(n.nodeType===1) bindExternal(n); });
    }
  });

  // ——— Drag + persistência ———
  const applySavedDockPos = ()=>{
    try{
      const saved = JSON.parse(localStorage.getItem(POS_KEY)||'null');
      if(saved && typeof saved.left==='number' && typeof saved.bottom==='number'){
        document.documentElement.style.setProperty('--tts-dock-left', `${saved.left}px`);
        document.documentElement.style.setProperty('--tts-dock-bottom', `${saved.bottom}px`);
      }
    }catch(e){}
  };
  const enableDrag = (wrap)=>{
    if(!DRAG_ENABLED || !wrap) return;
    let startX=0, startY=0, startLeft=0, startBottom=0, dragging=false;

    const onDown = (ev)=>{
      const e = ev.touches ? ev.touches[0] : ev;
      dragging=true; wrap.classList.add('is-dragging');
      startX = e.clientX; startY = e.clientY;
      const cs = getComputedStyle(document.documentElement);
      startLeft   = parseFloat(cs.getPropertyValue('--tts-dock-left')) || 8;
      startBottom = parseFloat(cs.getPropertyValue('--tts-dock-bottom')) || 269;
      window.addEventListener('pointermove', onMove, {passive:false});
      window.addEventListener('pointerup', onUp, {passive:false});
      window.addEventListener('touchmove', onMove, {passive:false});
      window.addEventListener('touchend', onUp, {passive:false});
    };
    const onMove = (ev)=>{
      if(!dragging) return;
      const e = ev.touches ? ev.touches[0] : ev;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const left = Math.max(0, startLeft + dx);
      const bottom = Math.max(0, startBottom - dy); // mover para cima aumenta bottom
      document.documentElement.style.setProperty('--tts-dock-left', `${left}px`);
      document.documentElement.style.setProperty('--tts-dock-bottom', `${bottom}px`);
    };
    const onUp = ()=>{
      if(!dragging) return;
      dragging=false; wrap.classList.remove('is-dragging');
      const cs = getComputedStyle(document.documentElement);
      const left   = parseFloat(cs.getPropertyValue('--tts-dock-left')) || 8;
      const bottom = parseFloat(cs.getPropertyValue('--tts-dock-bottom')) || 269;
      try{ localStorage.setItem(POS_KEY, JSON.stringify({left,bottom})); }catch(e){}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };

    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('touchstart', onDown);
  };

  // ——— Boot ———
  let ui = {wrap:null,btnT:null,btnS:null,btnX:null,status:null,btnPrev:null,btnNext:null};

  const boot = ()=>{
    applySavedDockPos();
    const got = ensurePanel();
    ui = {
      wrap:   got.wrap,
      btnT:   got.btnT,
      btnS:   got.btnS,
      btnX:   got.btnX,
      status: got.status,
      btnPrev: got.btnPrev,
      btnNext: got.btnNext,
    };
    setLabel(ui.btnT,false);
    setStatus(ui.status,'Pronto.');

    // binds painel
    ui.btnT   && ui.btnT.addEventListener('click', e=>{e.preventDefault(); toggle();});
    ui.btnS   && ui.btnS.addEventListener('click', e=>{e.preventDefault(); speakSelection();});
    ui.btnX   && ui.btnX.addEventListener('click', e=>{e.preventDefault(); stopInternal();});
    ui.btnPrev&& ui.btnPrev.addEventListener('click', e=>{e.preventDefault(); prevBlock();});
    ui.btnNext&& ui.btnNext.addEventListener('click', e=>{e.preventDefault(); nextBlock();});

    // teclado opcional (←/→)
    window.addEventListener('keydown', (ev)=>{
      if(ev.target && /input|textarea/i.test(ev.target.tagName)) return;
      if(ev.key==='ArrowRight'){ nextBlock(); }
      if(ev.key==='ArrowLeft'){ prevBlock(); }
    });

    // integra com ACTIONS (compat)
    window.ACTIONS = window.ACTIONS || {};
    const oldTTS = window.ACTIONS.tts;
    window.ACTIONS.tts = ()=>{ try{ toggle(); }catch(e){}; if(typeof oldTTS==='function'){ /* compat */ } };
    window.ACTIONS.ttsPrev = ()=>{ prevBlock(); };
    window.ACTIONS.ttsNext = ()=>{ nextBlock(); };
    window.ACTIONS.ttsStop = ()=>{ stopInternal(); };

    // expõe API global
    window.KOBLLUX_TTS = {
      rebuild: ()=>buildBlocksFromDOM(),
      play: ()=>{ if(!speaking){ speaking=true; setLabel(ui.btnT,true); } speakCurrent(); },
      stop: stopInternal,
      next: nextBlock,
      prev: prevBlock,
      info: ()=>({ blocks:blocks.length, currentIndex, speaking })
    };

    // Auto-wire em botões externos
    bindExternal(document);
    mo.observe(document.documentElement, {childList:true, subtree:true});

    // Drag opcional
    if(DOCKED && DRAG_ENABLED){ enableDrag(ui.wrap); }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  }else{
    boot();
  }
})();
