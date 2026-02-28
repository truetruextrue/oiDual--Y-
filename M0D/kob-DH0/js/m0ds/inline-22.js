
(()=>{ if(window.__KOB_TTS_V32_ACTIVE) return; window.__KOB_TTS_V32_ACTIVE = true;

  /* ---------- Constantes & Preferências ---------- */
  const POS_KEY  = 'kob_tts_pos_v3';
  const PREF_KEY = 'kob_tts_prefs_v32';
  const ROOTS    = ['#root','[data-analyzer-output]','.analyzer-output','#render','main','.content'];
  const BLOCK_SEL= [
    'h1','h2','h3','h4','h5','h6',
    'p','li','blockquote','.callout','.equation','pre','td','th','codeblock'
  ].join(',');

  const PREFS = Object.assign({
    outline: true,
    asciiMode: 'describe',      // 'describe' | 'skip' | 'read'
    clickToSpeak: true,         // clicar no bloco inicia leitura
    preferMale: true            // prioridade de vozes
  }, readPrefs());

  /* ---------- Util ---------- */
  const $  = (q, r=document)=> r.querySelector(q);
  const $$ = (q, r=document)=> [...r.querySelectorAll(q)];
  const setCSS = (v,val)=> document.documentElement.style.setProperty(v,val);
  const toast  = (m)=> { try{ window.toast && window.toast(m); }catch{} };
  const getRoot= ()=> { for(const s of ROOTS){ const el=document.querySelector(s); if(el) return el; } return document.body; };

  /* ---------- Dock ---------- */
  const dock = document.querySelector('.kob-tts-dock') || (()=> {
    const d = document.createElement('div');
    d.className = 'kob-tts-dock';
    d.innerHTML = `
      <button id="tts-on"      title="Voz On/Off" aria-pressed="false">🔊</button>
      <button id="tts-prev"    title="Anterior">◀</button>
      <button id="tts-next"    title="Próximo">▶</button>
      <button id="tts-sel"     title="Ler seleção">✂︎</button>
      <button id="tts-stop"    title="Parar">■</button>
      <button id="tts-reread"  title="Re-Ler do início (abrir tudo)">⟳</button>
      <button id="tts-reset"   title="Reset + próxima seção">↻</button>
      <button id="tts-openall" title="Abrir Tudo (acordeons/detalhes)">◎</button>
      <button id="tts-grid"    title="Outline / Click-to-Speak">⌗</button>
      <button id="tts-voice"   title="Trocar Voz PT-BR (segurar: alterna masc/fem)">🎙</button>
      <small id="tts-status">Pronto.</small>
    `;
    document.body.appendChild(d);
    return d;
  })();

  /* Outline/grade */
  const outline = document.getElementById('kob-tts-outline') || (()=> {
    const o = document.createElement('div');
    o.id='kob-tts-outline';
    document.body.appendChild(o);
    return o;
  })();

  /* Drag e posição */
  applySavedPos();
  ;(()=>{ let sx=0,sy=0,sl=0,sb=0,drag=false;
    const onDown=(ev)=>{ const e=ev.touches?ev.touches[0]:ev; drag=true; dock.classList.add('is-drag'); sx=e.clientX; sy=e.clientY;
      const cs=getComputedStyle(document.documentElement);
      sl=parseFloat(cs.getPropertyValue('--tts-left'))||8;
      sb=parseFloat(cs.getPropertyValue('--tts-bottom'))||240;
      addEventListener('pointermove',onMove,{passive:false});
      addEventListener('pointerup',onUp,{passive:false});
      addEventListener('touchmove',onMove,{passive:false});
      addEventListener('touchend',onUp,{passive:false});
    };
    const onMove=(ev)=>{ if(!drag) return; const e=ev.touches?ev.touches[0]:ev;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      setCSS('--tts-left',   Math.max(0, sl+dx)+'px');
      setCSS('--tts-bottom', Math.max(0, sb-dy)+'px');
    };
    const onUp=()=>{ if(!drag) return; drag=false; dock.classList.remove('is-drag'); savePos(); };
    dock.addEventListener('pointerdown',onDown); dock.addEventListener('touchstart',onDown);
  })();

  /* ---------- Speech & Vozes ---------- */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth){ console.warn('[TTS] SpeechSynthesis indisponível'); return; }
  try{ synth.cancel(); }catch{}

  let VOICES=[], baseVoice=null, voiceIdx=0;
  const MALE   = /(ricardo|thiago|jo[aã]o|daniel|felipe|bruno|rafael|marc(o|os)|c[aá]ssio)/i;
  const FEMALE = /(luciana|camila|fabiana|maria|helena|ana|carla|bia|let[ií]cia|fernanda)/i;

  function loadVoices(){
    VOICES = synth.getVoices()||[];
    const pt = VOICES.filter(v=>/pt/i.test(v.lang));
    const pri = (PREFS.preferMale? MALE : FEMALE);
    const sec = (PREFS.preferMale? FEMALE: MALE);
    baseVoice = pt.find(v=> pri.test(v.name||'')) || pt.find(v=> sec.test(v.name||'')) || pt[0] || VOICES[0] || null;
    voiceIdx  = Math.max(0, (pt.indexOf(baseVoice)));
  }
  synth.onvoiceschanged = ()=> loadVoices();
  loadVoices();

  function cycleVoice(){
    const pt = VOICES.filter(v=>/pt/i.test(v.lang));
    if(!pt.length) return;
    voiceIdx = (voiceIdx+1) % pt.length;
    baseVoice = pt[voiceIdx];
    setStatus(`Voz: ${baseVoice.name||baseVoice.lang}`);
  }
  function toggleVoicePriority(){ // segurar
    PREFS.preferMale = !PREFS.preferMale; savePrefs();
    loadVoices();
    setStatus(`Preferência: ${PREFS.preferMale?'masculina':'feminina'}`);
  }

  const ARCH_STYLES = {
    atlas:{ rate:.95, pitch:1.00, find:/\b(atlas)\b/i },
    nova:{ rate:1.12, pitch:1.12, find:/\b(nova)\b/i },
    vitalis:{ rate:1.08, pitch:1.05, find:/\b(vitalis)\b/i },
    pulse:{ rate:1.04, pitch:1.08, find:/\b(pulse|pulso)\b/i },
    serena:{ rate:.98, pitch:.96, find:/\b(serena)\b/i },
    kaos:{ rate:1.18, pitch:1.02, find:/\b(kaos)\b/i },
    genus:{ rate:1.00, pitch:1.00, find:/\b(genus)\b/i },
    lumine:{ rate:1.0, pitch:1.10, find:/\b(lumine)\b/i },
    rhea:{ rate:.97, pitch:1.00, find:/\b(rhea)\b/i },
    solus:{ rate:.93, pitch:.95, find:/\b(solus)\b/i },
    aion:{ rate:1.00, pitch:1.08, find:/\b(aion)\b/i }
  };
  function voiceStyleFor(text){
    for(const k in ARCH_STYLES){ if(ARCH_STYLES[k].find.test(text)) return ARCH_STYLES[k]; }
    return {rate:1.01,pitch:1.0};
  }
  function pickVoiceFor(text){
    const st = voiceStyleFor(text);
    return { voice: baseVoice, rate: st.rate, pitch: st.pitch };
  }

  /* ---------- Estado ---------- */
  let blocks=[], idx=0, speaking=false, u=null;

  function setPressed(btn,on){ btn?.setAttribute('aria-pressed', on?'true':'false'); }
  function setStatus(t){ const el=$('#tts-status',dock); if(!el) return; el.textContent=String(t); }
  function setStatusProgress(){ const el=$('#tts-status',dock); if(!el) return;
    if(!blocks.length){ el.textContent='0/0'; return; }
    el.textContent = `${Math.min(idx+1,blocks.length)}/${blocks.length}`;
  }

  function isAsciiArt(txt){
    const lines=txt.split(/\n/);
    const raw=txt.replace(/\s+/g,'');
    const nonWord=(raw.replace(/[A-Za-zÀ-ÿ0-9]/g,'').length)/(raw.length||1);
    const box=/[░▒▓█▀▄▌▐─═║╔╗╝╚╩╦╠╣┌┐└┘]/.test(txt);
    const wide=lines.some(l=> l.length>28 && l.replace(/[A-Za-zÀ-ÿ0-9]/g,'').length/(l.length||1)>.45);
    return box || nonWord>.42 || wide;
  }
  function describeAscii(txt){
    const t=txt||''; const parts=[];
    if(/[█▓▒░]{4,}/.test(t)) parts.push('massa sólida');
    if(/[─═]{4,}/.test(t))   parts.push('linhas horizontais');
    if(/[┼╬╦╩╠╣]/.test(t))   parts.push('grade geométrica');
    if(/[△▲▵]/.test(t))     parts.push('triângulos');
    if(/[○●◯]/.test(t))     parts.push('círculos');
    return 'Arte ASCII' + (parts.length?(' — '+parts.join(', ')):'');
  }
  function stripKaTeX(s){
    // remove $$…$$ e $…$ do KaTeX/LaTeX para não “soletrar” símbolos
    s = s.replace(/\$\$[\s\S]*?\$\$/g,' ');
    s = s.replace(/\$[^$]*\$/g,' ');
    return s;
  }
  function sanitize(txt,type){
    let s = stripKaTeX(txt||'');
s = s.replace(/[\\/*_|=`~^<>#${}()+\-]+/g, ' ');
s = s.replace(/\$begin:math:display\$\$[\s\S]*?\$\$end:math:display\$/g, ' ');
    s = s.replace(/:+/g, ', ').replace(/\.+/g, ', ');
    s = s.replace(/\s{2,}/g,' ').trim();
    if(type==='code')     return 'Bloco de código com ' + (txt.split(/\n/).length) + ' linhas.';
    if(type==='equation') return 'Equação matemática.';
    if(type==='ascii'){
      if(PREFS.asciiMode==='skip') return '';
      if(PREFS.asciiMode==='describe') return describeAscii(txt);
    }
    return s;
  }

  function sectionIndexOf(node){
    const secs = $$('#root details, details, .acc details, details.acc');
    const i = secs.findIndex(d=> d.contains(node));
    return i<0?0:i;
  }

  /* ---------- EXPANDIR TODOS ---------- */
  function expandAll(open=true){
    $$('details').forEach(d=> d.open = !!open);
    $$('[aria-expanded]').forEach(el=>{
      el.setAttribute('aria-expanded', open?'true':'false');
      const id = el.getAttribute('aria-controls');
      if(id){ const tgt = document.getElementById(id); if(tgt) tgt.hidden = !open; }
    });
    $$('[data-open]').forEach(el=> el.setAttribute('data-open', open?'1':'0'));
  }

  /* ---------- Build ---------- */
  function rebuild(){
    const root = getRoot();
    const nodes = $$(BLOCK_SEL, root);
    const out=[];
    for(const node of nodes){
      let raw = (node.innerText||'').replace(/\bCopiar\b/g,'').trim();
      if(!raw) continue;
      const type = node.matches('pre') ? 'code'
                : node.matches('.equation') ? 'equation'
                : isAsciiArt(raw) ? 'ascii'
                : node.matches('blockquote,.callout') ? 'quote'
                : node.matches('li') ? 'list'
                : node.matches('td,th') ? 'cell'
                : node.matches('h1,h2,h3,h4,h5,h6') ? 'heading'
                : 'para';
      out.push({ node, raw, type, sectionIdx: sectionIndexOf(node) });
    }
    blocks = out; idx = 0;
    setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
  }

  /* ---------- Outline ---------- */
  function hideOutline(){ outline.style.display='none'; }
  function showOutlineFor(node){
    if(!PREFS.outline || !node) return hideOutline();
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
  addEventListener('scroll', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); }, {passive:true});
  addEventListener('resize', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); });

  /* ---------- Speak ---------- */
  function speakCurrent(){
    if(!blocks.length) rebuild();
    if(idx<0) idx=0;
    if(idx>=blocks.length){ stop(); toast('Fim.'); return; }

    const b = blocks[idx];
    const text = sanitize(b.raw, b.type);
    if(!text){ idx++; setStatusProgress(); return speakCurrent(); }

    try{ synth.cancel(); }catch{}
    const conf = pickVoiceFor(text);
    const u = new SpeechSynthesisUtterance(text);
    if(conf.voice) u.voice = conf.voice;
    u.lang = (conf.voice && conf.voice.lang) || 'pt-BR';
    u.rate = conf.rate; u.pitch = conf.pitch; u.volume=1;

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

  /* ---------- Reset & Re-Ler ---------- */
  function reset(opts={}){
    expandAll(true);
    stop(); rebuild();
    if(opts.nextSection===true){
      const cur = blocks[idx]?.sectionIdx ?? 0;
      const j = blocks.findIndex(b=> b.sectionIdx>cur);
      idx = j>=0 ? j : 0;
    }else if(typeof opts.sectionIndex==='number'){
      const j = blocks.findIndex(b=> b.sectionIdx===opts.sectionIndex);
      idx = j>=0 ? j : 0;
    }else{
      idx = 0;
    }
    setStatus(blocks.length?`${idx+1}/${blocks.length}`:'Pronto.');
    if(PREFS.outline && blocks[idx]) showOutlineFor(blocks[idx].node);
  }
  function rereadFromStart(){
    expandAll(true);
    rebuild();
    idx=0; play();
  }

  /* ---------- Click-to-Speak (Outline ON) ---------- */
  document.addEventListener('click', (ev)=>{
    const blk = ev.target.closest(BLOCK_SEL);
    if(!blk) return;
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

  /* ---------- Seleção ---------- */
  $('#tts-sel',dock)?.addEventListener('click', (e)=>{
    e.preventDefault();
    const t = String(window.getSelection && window.getSelection()).trim();
    if(!t){ toast('Selecione um trecho'); return; }
    try{ synth.cancel(); }catch{}
    const conf = pickVoiceFor(t);
    const uu = new SpeechSynthesisUtterance(sanitize(t,'para'));
    if(conf.voice) uu.voice=conf.voice;
    uu.lang=(conf.voice&&conf.voice.lang)||'pt-BR'; uu.rate=conf.rate; uu.pitch=conf.pitch; uu.volume=1;
    synth.speak(uu);
  });

  /* ---------- Botões ---------- */
  $('#tts-on',dock)?.addEventListener('click', e=>{ e.preventDefault(); toggle(); });
  $('#tts-prev',dock)?.addEventListener('click', e=>{ e.preventDefault(); prev(); });
  $('#tts-next',dock)?.addEventListener('click', e=>{ e.preventDefault(); next(); });
  $('#tts-stop',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); });
  $('#tts-reset',dock)?.addEventListener('click', e=>{ e.preventDefault(); reset({nextSection:true}); });
  $('#tts-reread',dock)?.addEventListener('click', e=>{ e.preventDefault(); rereadFromStart(); });
  $('#tts-openall',dock)?.addEventListener('click', e=>{ e.preventDefault(); expandAll(true); rebuild(); setStatusProgress(); });

  // Outline toggle (e click-to-speak junto)
  $('#tts-grid',dock)?.addEventListener('click', e=>{
    e.preventDefault();
    PREFS.outline = !PREFS.outline;
    PREFS.clickToSpeak = PREFS.outline;
    savePrefs();
    if(!PREFS.outline) hideOutline(); else { const b=blocks[idx]; b && showOutlineFor(b.node); }
    setPressed($('#tts-grid',dock), PREFS.outline);
  });
  setPressed($('#tts-grid',dock), PREFS.outline);

  // Voz: click = cicla, longpress = alterna prioridade masc/fem
  ;(()=>{ const btn=$('#tts-voice',dock); if(!btn) return;
    let pressT=null, pressed=false;
    const down=()=>{ pressed=true; pressT=setTimeout(()=>{ pressed='hold'; toggleVoicePriority(); }, 550); };
    const up=()=>{ if(pressT){ clearTimeout(pressT); pressT=null; } if(pressed===true){ cycleVoice(); } pressed=false; };
    btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointerleave', up);
    btn.addEventListener('touchstart', down);  btn.addEventListener('touchend', up);
  })();

  /* ---------- Integrar com AUTO-GERAR do app ---------- */
  hook('autoBuild'); hook('autoBuildNested');
  function hook(name){
    if(typeof window[name]==='function'){
      const orig=window[name];
      window[name]=function(){
        const out=orig.apply(this, arguments);
        setTimeout(()=>{ expandAll(true); rebuild(); setStatusProgress(); }, 30);
        return out;
      }
    }
  }

  /* ---------- Boot ---------- */
  try{ window.__tts && typeof window.__tts.stop==='function' && window.__tts.stop(); }catch{}
  expandAll(true);
  rebuild();
  setStatusProgress();

  /* ---------- Helpers ---------- */
  function readPrefs(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY)||'{}'); }catch{ return {}; } }
  function savePrefs(){ try{ localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); }catch{} }
  function applySavedPos(){
    try{
      const s=JSON.parse(localStorage.getItem(POS_KEY)||'null');
      if(s){ setCSS('--tts-left', s.left); setCSS('--tts-bottom', s.bottom); }
    }catch{}
  }
  function savePos(){
    try{
      const cs=getComputedStyle(document.documentElement);
      localStorage.setItem(POS_KEY, JSON.stringify({
        left: cs.getPropertyValue('--tts-left').trim(),
        bottom: cs.getPropertyValue('--tts-bottom').trim()
      }));
    }catch{}
  }
})();
