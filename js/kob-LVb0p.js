// Merge: KOBLLUX Monolith + KOB TTS (unified patch)
// Colar no final do index (após o monólito). IIFE único, guardado por __KOBLLUX_PATCH_UNICO__
(()=>{'use strict';
  if(window.__KOBLLUX_PATCH_UNICO__) return; window.__KOBLLUX_PATCH_UNICO__ = true;

  // --- Helpers (seguro / não sobrescreve) ---
  const $ = (q, r=document) => r.querySelector(q);
  const $$ = (q, r=document) => [...r.querySelectorAll(q)];
  const now = ()=> new Date().toISOString().replace(/[:.]/g,'-');

  // Toast reutilizável (se existir #kx_toast do monólito, usa; senão cria)
  function toast(m, ms = 1600){
    let t = $('#kx_toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'kx_toast';
      Object.assign(t.style, {
        position: 'fixed',
        left: '50%',
        bottom: 'calc(18px + env(safe-area-inset-bottom,0px))',
        transform: 'translateX(-50%)',
        padding: '.6rem .9rem',
        borderRadius: '999px',
        background: 'rgba(0,0,0,.7)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        fontWeight: '600',
        letterSpacing: '.2px',
        zIndex: 2147483646,
        boxShadow: '0 0 0 1px rgba(255,255,255,.08) inset',
        transition: 'opacity .28s'
      });
      document.body.appendChild(t);
    }
    t.textContent = m;
    t.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> t.style.opacity = '0', ms);
  }

  // Storage simple namespaced for TTS (não depende de SS interno)
  const KOB_NS = 'kob_tts::v1::';
  const PST = k => KOB_NS + k;
  const StorageSafe = {
    get(k, d=null){ try{ const v = localStorage.getItem(PST(k)); return v==null? d : JSON.parse(v); }catch{return d;}},
    set(k,v){ try{ localStorage.setItem(PST(k), JSON.stringify(v)); }catch{}},
    del(k){ try{ localStorage.removeItem(PST(k)); }catch{}}
  };

  // small css for dock + outline
  (function injectCSS(){
    if(document.getElementById('kob-tts-styles')) return;
    const s = document.createElement('style');
    s.id = 'kob-tts-styles';
    s.textContent = `
      .kob-tts-dock{position:fixed;left:16px;bottom:20px;display:flex;gap:6px;padding:8px;border-radius:10px;background:rgba(10,10,12,.75);backdrop-filter:blur(6px);z-index:2147483645;align-items:center;box-shadow:0 8px 30px rgba(0,0,0,.45)}
      .kob-tts-dock button{background:transparent;border:0;color:#fff;padding:6px;font-size:14px;cursor:pointer;border-radius:6px}
      .kob-tts-dock button[aria-pressed="true"]{background:rgba(255,255,255,.06)}
      .kob-tts-dock small{color:rgba(255,255,255,.6);font-size:12px;margin-left:6px}
      #kob-tts-outline{position:absolute;border:2px solid rgba(95,195,255,.85);pointer-events:none;border-radius:6px;display:none;z-index:2147483644;box-shadow:0 8px 24px rgba(0,0,0,.45)}
      .kob-tts-dock.is-drag{opacity:.92;transform:scale(.999)}
      @media (max-width:580px){ .kob-tts-dock{left:8px;bottom:14px;padding:6px;gap:4px} }
    `;
    document.head.appendChild(s);
  })();

  // --- TTS module (adaptado) ---
  if(window.__KOB_TTS_V32_ACTIVE) { toast('KOB TTS já ativo'); return; }
  window.__KOB_TTS_V32_ACTIVE = true;

  // keys
  const POS_KEY  = 'kob_tts_pos_standalone';
  const PREF_KEY = 'kob_tts_prefs_standalone';
  const ROOTS    = ['#root', 'body'];
  const BLOCK_SEL= ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th'].join(',');

  const defaultPrefs = {
    outline: true,
    asciiMode: 'describe',
    clickToSpeak: true,
    preferMale: false
  };

  // read/save prefs via StorageSafe, fallback localStorage raw if needed
  function readPrefs(){
    const p = StorageSafe.get(PREF_KEY, null);
    if(p) return Object.assign({}, defaultPrefs, p);
    try{ const raw = localStorage.getItem(PREF_KEY); if(raw) return Object.assign({}, defaultPrefs, JSON.parse(raw)); }catch{}
    return Object.assign({}, defaultPrefs);
  }
  function savePrefs(prefs){
    StorageSafe.set(PREF_KEY, prefs);
  }

  const PREFS = readPrefs();

  const setCSS = (v,val)=> document.documentElement.style.setProperty(v,val);
  const getRoot = ()=> { for(const s of ROOTS){ const el=document.querySelector(s); if(el) return el; } return document.body; };

  // create dock if not present - keep id/classes stable
  const dock = document.querySelector('.kob-tts-dock') || (()=> {
    const d = document.createElement('div');
    d.className = 'kob-tts-dock';
    d.innerHTML = `
      <button id="tts-on"      title="Voz On/Off" aria-pressed="false">🔊</button>
      <button id="tts-prev"    title="Anterior">◀</button>
      <button id="tts-next"    title="Próximo">▶</button>
      <button id="tts-sel"     title="Ler seleção">✂︎</button>
      <button id="tts-stop"    title="Parar">■</button>
      <button id="tts-reread"  title="Re-Ler do início">⟳</button>
      <button id="tts-reset"   title="Reset + próxima seção">↻</button>
      <button id="tts-grid"    title="Outline / Click-to-Speak">⌗</button>
      <button id="tts-voice"   title="Trocar Voz PT-BR">🎙</button>
      <small id="tts-status">Pronto.</small>
    `;
    document.body.appendChild(d);
    return d;
  })();

  const outline = document.getElementById('kob-tts-outline') || (()=> {
    const o = document.createElement('div');
    o.id='kob-tts-outline';
    document.body.appendChild(o);
    return o;
  })();

  // apply saved pos
  (function applySavedPos(){
    try{
      const s = StorageSafe.get(POS_KEY, null);
      if(s){ setCSS('--tts-left', s.left); setCSS('--tts-bottom', s.bottom);
        // also position dock visually
        if(s.left) dock.style.left = s.left;
        if(s.bottom) dock.style.bottom = s.bottom;
      }
    }catch{}
  })();

  // drag behavior
  (function dragSetup(){
    let sx=0,sy=0,sl=0,sb=0,drag=false;
    const onDown=(ev)=>{ 
      if(ev.target.tagName === 'BUTTON') return;
      const e = ev.touches ? ev.touches[0] : ev; drag=true; dock.classList.add('is-drag'); sx=e.clientX; sy=e.clientY;
      sl = parseFloat(dock.style.left || getComputedStyle(document.documentElement).getPropertyValue('--tts-left') || 16) || 16;
      sb = parseFloat(dock.style.bottom || getComputedStyle(document.documentElement).getPropertyValue('--tts-bottom') || 20) || 20;
      addEventListener('pointermove', onMove, {passive:false});
      addEventListener('pointerup', onUp, {passive:false});
      addEventListener('touchmove', onMove, {passive:false});
      addEventListener('touchend', onUp, {passive:false});
    };
    const onMove=(ev)=>{ if(!drag) return; const e = ev.touches ? ev.touches[0] : ev; const dx=e.clientX - sx, dy=e.clientY - sy;
      const left = Math.max(0, sl + dx) + 'px'; const bottom = Math.max(0, sb - dy) + 'px';
      setCSS('--tts-left', left); setCSS('--tts-bottom', bottom);
      dock.style.left = left; dock.style.bottom = bottom;
    };
    const onUp=()=>{ if(!drag) return; drag=false; dock.classList.remove('is-drag'); savePos(); };
    dock.addEventListener('pointerdown', onDown); dock.addEventListener('touchstart', onDown);
    function savePos(){
      try{
        const left = dock.style.left || getComputedStyle(document.documentElement).getPropertyValue('--tts-left') || '16px';
        const bottom = dock.style.bottom || getComputedStyle(document.documentElement).getPropertyValue('--tts-bottom') || '20px';
        StorageSafe.set(POS_KEY, { left, bottom });
      }catch{}
    }
  })();

  // speech
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth){ console.warn('[TTS] SpeechSynthesis indisponível'); toast('TTS indisponível no navegador'); return; }
  try{ synth.cancel(); }catch{}

  let VOICES = [], baseVoice = null, voiceIdx = 0;
  function loadVoices(){
    VOICES = synth.getVoices() || [];
    const pt = VOICES.filter(v=>/pt/i.test(v.lang));
    baseVoice = pt[0] || VOICES[0] || null;
    voiceIdx = 0;
  }
  synth.onvoiceschanged = ()=> loadVoices();
  loadVoices();

  function cycleVoice(){
    const pt = VOICES.filter(v=>/pt/i.test(v.lang));
    if(!pt.length) { toast('Nenhuma voz PT-BR encontrada'); return; }
    voiceIdx = (voiceIdx+1) % pt.length;
    baseVoice = pt[voiceIdx];
    setStatus(`Voz: ${baseVoice.name || baseVoice.lang}`);
  }

  // state
  let blocks = [], idx = 0, speaking = false;

  function setPressed(btn,on){ if(!btn) return; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  function setStatus(t){ const el = $('#tts-status', dock); if(!el) return; el.textContent = String(t); }
  function setStatusProgress(){ const el = $('#tts-status', dock); if(!el) return; if(!blocks.length){ el.textContent='0/0'; return; } el.textContent = `${Math.min(idx+1, blocks.length)}/${blocks.length}`; }

  function sanitize(txt){
    let s = String(txt||'').replace(/\bCopiar\b/g, ' ').replace(/\s{2,}/g,' ').trim();
    return s;
  }

  function rebuild(){
    const root = getRoot();
    const nodes = $$(BLOCK_SEL, root);
    const out = [];
    for(const node of nodes){
      let raw = node.innerText.trim();
      if(!raw) continue;
      out.push({ node, raw });
    }
    blocks = out; idx = 0;
    setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
  }

  // outline helpers
  function hideOutline(){ outline.style.display='none'; }
  function showOutlineFor(node){
    if(!PREFS.outline || !node) return hideOutline();
    const r = node.getBoundingClientRect();
    outline.style.display='block';
    outline.style.left  = (scrollX + r.left - 6) + 'px';
    outline.style.top   = (scrollY + r.top - 6) + 'px';
    outline.style.width = (r.width + 12) + 'px';
    outline.style.height= (r.height + 12) + 'px';
  }
  function highlight(){
    $$('[data-tts-current]').forEach(el=>el.removeAttribute('data-tts-current'));
    const b = blocks[idx]; if(!b) return;
    b.node.setAttribute('data-tts-current','true');
    try{ b.node.scrollIntoView({behavior:'smooth', block:'center'});}catch{}
    showOutlineFor(b.node);
  }
  addEventListener('scroll', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); }, {passive:true});
  addEventListener('resize', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); });

  // speak logic
  function speakCurrent(){
    if(!blocks.length) rebuild();
    if(idx<0) idx=0;
    if(idx>=blocks.length){ stop(); window.toast && window.toast('Fim da leitura.'); toast('Fim da leitura.'); return; }

    const b = blocks[idx];
    const text = sanitize(b.raw);
    if(!text){ idx++; setStatusProgress(); return speakCurrent(); }

    try{ synth.cancel(); }catch{}
    const u = new SpeechSynthesisUtterance(text);
    if(baseVoice) u.voice = baseVoice;
    u.lang = (baseVoice && baseVoice.lang) || 'pt-BR';
    u.rate = 1.0; u.pitch = 1.0; u.volume = 1;

    u.onend   = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };
    u.onerror = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };

    highlight();
    setStatusProgress();
    synth.speak(u);
  }

  function play(){ speaking=true; setPressed($('#tts-on',dock),true); if(!blocks.length) rebuild(); speakCurrent(); }
  function stop(){ speaking=false; try{ synth.cancel(); }catch{} setPressed($('#tts-on',dock),false); setStatus(blocks.length?`${Math.min(idx+1,blocks.length)}/${blocks.length}`:'Pausado.'); hideOutline(); }
  function toggle(){ speaking ? stop() : play(); }
  function next(){ if(!blocks.length) rebuild(); speaking=true; setPressed($('#tts-on',dock),true); idx++; setStatusProgress(); speakCurrent(); }
  function prev(){ if(!blocks.length) rebuild(); speaking=true; setPressed($('#tts-on',dock),true); idx=Math.max(0,idx-1); setStatusProgress(); speakCurrent(); }

  // dock buttons binding
  $('#tts-on',dock)?.addEventListener('click', e=>{ e.preventDefault(); toggle(); });
  $('#tts-prev',dock)?.addEventListener('click', e=>{ e.preventDefault(); prev(); });
  $('#tts-next',dock)?.addEventListener('click', e=>{ e.preventDefault(); next(); });
  $('#tts-stop',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); });

  $('#tts-reread',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); rebuild(); idx=0; play(); });
  $('#tts-reset',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); rebuild(); idx=0; setStatusProgress(); });

  // selection reading
  $('#tts-sel',dock)?.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = String(window.getSelection && window.getSelection()).trim();
    if(!t){ toast('Selecione um trecho para ler.'); return; }
    try{ synth.cancel(); }catch{}
    const uu = new SpeechSynthesisUtterance(sanitize(t));
    if(baseVoice) uu.voice=baseVoice;
    uu.lang=(baseVoice&&baseVoice.lang)||'pt-BR';
    synth.speak(uu);
  });

  // outline toggle
  $('#tts-grid',dock)?.addEventListener('click', e=>{
    e.preventDefault();
    PREFS.outline = !PREFS.outline;
    PREFS.clickToSpeak = PREFS.outline;
    savePrefs(PREFS);
    if(!PREFS.outline) hideOutline(); else { const b=blocks[idx]; b && showOutlineFor(b.node); }
    setPressed($('#tts-grid',dock), PREFS.outline);
    toast(PREFS.outline ? 'Outline Ativado' : 'Outline Desativado');
  });
  setPressed($('#tts-grid',dock), PREFS.outline);

  $('#tts-voice',dock)?.addEventListener('click', e=>{
    e.preventDefault(); cycleVoice(); toast('Voz alterada');
  });

  // click-to-speak
  document.addEventListener('click', (ev)=>{
    const blk = ev.target.closest(BLOCK_SEL);
    if(!blk || ev.target.closest('.kob-tts-dock')) return;
    const i = blocks.findIndex(b=> b.node===blk);
    if(i<0) return;
    idx=i;
    if(PREFS.outline) showOutlineFor(blk);
    if(PREFS.clickToSpeak){
      speaking=true; setPressed($('#tts-on',dock),true);
      speakCurrent();
    }else{
      setStatusProgress();
    }
  }, {passive:false});

  // boot
  rebuild();
  setStatusProgress();

  // expose minimal API
  window.KOB_TTS = window.KOB_TTS || {
    play, stop, next, prev, rebuild, prefs: PREFS, cycleVoice
  };

  // final log
  console.log('KOBLLUX Patch: Monólito + KOB TTS integrado —', now());
  toast('KOB TTS carregado ✓', 1200);
})();