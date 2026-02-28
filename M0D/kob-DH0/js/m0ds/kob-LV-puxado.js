function cycleVoice(){
    const pt = VOICES.filter(v=>/pt/i.test(v.lang));
    if(!pt.length) return;
    voiceIdx = (voiceIdx+1) % pt.length;
    baseVoice = pt[voiceIdx];
    setStatus(`Voz: ${baseVoice.name||baseVoice.lang}`);
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
  try{ window.__tts && typeof window.__tts.stop==='function' // Detecta arquétipo com base no texto + mapa de vozes atual
  function detectArchFromUtterance(u){
    const t = (u && u.text || '').toLowerCase();
    if (!t) return null;

    // se o bloco de vozes já estiver carregado, usa os nomes declarados lá
    if (window.KOBLLUX_VOICES){
      for (const k in window.KOBLLUX_VOICES){
        if (!Object.prototype.hasOwnProperty.call(window.KOBLLUX_VOICES,k)) continue;
        const arch = window.KOBLLUX_VOICES[k];
        const name = String(arch.name || k).toLowerCase();
        // procura "[Atlas", "Atlas]" ou o nome puro
        if (t.includes('['+name) || t.includes(name+']') || t.includes(name+' —') || t.includes('## '+name) || t.includes(name)){
          return (arch.id || name || k).toLowerCase();
        }
      }
    }&& window.__tts.stop(); }catch{}
  expandAll(true);
  rebuild();
  setStatusProgress();

/* PATCH: substitui a função pickVoiceFor original pela versão com HOOK */
function pickVoiceFor(text){
  // se existir um hook externo (IA), tenta classificar primeiro
  try{
    if (window.KOB_TTS_VOICE_STYLE_HOOK) {
      const arch = window.KOB_TTS_VOICE_STYLE_HOOK(text);
      if (arch) {
        const ST = {
          atlas:{rate:.95,pitch:0.80}, nova:{rate:1.09,pitch:1.18},
          vitalis:{rate:1.08,pitch:1.34}, pulse:{rate:1.02,pitch:1.12},
          serena:{rate:.98,pitch:.96}, kaos:{rate:1.13,pitch:1.02},
          genus:{rate:1.00,pitch:1.00}, lumine:{rate:1.00,pitch:1.28},
          rhea:{rate:.97,pitch:0.78}, solus:{rate:.93,pitch:.95},
          aion:{rate:1.00,pitch:1.08}
        }[String(arch).toLowerCase()];
        if (ST) return { voice: baseVoice, rate: ST.rate, pitch: ST.pitch };
      }
    }
  }catch(e){}
  // fallback regex (v32)
  const st = voiceStyleFor(text);
  return { voice: baseVoice, rate: st.rate, pitch: st.pitch };
}


(()=>{
  if (window.__KOBLLUX_VOICE_THEME_PATCH__) return;
  window.__KOBLLUX_VOICE_THEME_PATCH__ = true;

  const COLOR_MAP = {
    kobllux: {
      primary:'#00d8d8', secondary:'#d800d8', accent:'#39FFB6',
      bg_soft:'rgba(0,216,216,0.08)',
      glow:'0 0 18px rgba(0,216,216,0.55)'
    },
    cooplux:{
      primary:'#39FFB6', secondary:'#00d8d8', accent:'#ffffff',
      bg_soft:'rgba(57,255,182,0.10)',
      glow:'0 0 16px rgba(57,255,182,0.60)'
    },
    fitlux:{
      primary:'#FFC857', secondary:'#FFE39A', accent:'#22252f',
      bg_soft:'rgba(255,200,87,0.12)',
      glow:'0 0 16px rgba(255,200,87,0.70)'
    },
    atlas:{
      primary:'#6CCFF6', secondary:'#1B4965', accent:'#CAE9FF',
      bg_soft:'rgba(108,207,246,0.10)',
      glow:'0 0 14px rgba(108,207,246,0.55)'
    },
    nova:{
      primary:'#FF6FB5', secondary:'#FFD6E8', accent:'#FFE066',
      bg_soft:'rgba(255,111,181,0.12)',
      glow:'0 0 16px rgba(255,111,181,0.65)'
    },
    vitalis:{
      primary:'#00F5A0', secondary:'#00D9F5', accent:'#0b1720',
      bg_soft:'rgba(0,245,160,0.10)',
      glow:'0 0 18px rgba(0,245,160,0.65)'
    },
    pulse:{
      primary:'#A259FF', secondary:'#2D1B69', accent:'#F1E4FF',
      bg_soft:'rgba(162,89,255,0.12)',
      glow:'0 0 18px rgba(162,89,255,0.70)'
    },
    serena:{
      primary:'#7AD3A8', secondary:'#154734', accent:'#EAFBF3',
      bg_soft:'rgba(122,211,168,0.12)',
      glow:'0 0 16px rgba(122,211,168,0.65)'
    },
    kaos:{
      primary:'#FF5C8A', secondary:'#3D000F', accent:'#FFD6E0',
      bg_soft:'rgba(255,92,138,0.12)',
      glow:'0 0 20px rgba(255,92,138,0.75)'
    },
    genus:{
      primary:'#4EE1A0', secondary:'#193A3A', accent:'#E1FFF2',
      bg_soft:'rgba(78,225,160,0.10)',
      glow:'0 0 16px rgba(78,225,160,0.65)'
    },
    lumine:{
      primary:'#FFE066', secondary:'#FF9F1C', accent:'#2F2F40',
      bg_soft:'rgba(255,224,102,0.16)',
      glow:'0 0 18px rgba(255,224,102,0.75)'
    },
    rhea:{
      primary:'#00B894', secondary:'#055E55', accent:'#D1FFF6',
      bg_soft:'rgba(0,184,148,0.14)',
      glow:'0 0 16px rgba(0,184,148,0.65)'
    },
    solus:{
      primary:'#4B6584', secondary:'#0B1420', accent:'#E3EFFA',
      bg_soft:'rgba(75,101,132,0.16)',
      glow:'0 0 14px rgba(75,101,132,0.65)'
    },
    aion:{
      primary:'#00A8E8', secondary:'#001F54', accent:'#C4F1FF',
      bg_soft:'rgba(0,168,232,0.14)',
      glow:'0 0 16px rgba(0,168,232,0.70)'
    },
    uno:{
      primary:'#FFFFFF', secondary:'#BBBBBB', accent:'#FFFFFF',
      bg_soft:'rgba(255,255,255,0.05)',
      glow:'0 0 16px rgba(255,255,255,0.35)'
    },
    dual:{
      primary:'#FF9F1C', secondary:'#2EC4B6', accent:'#f5f5f5',
      bg_soft:'rgba(255,159,28,0.10)',
      glow:'0 0 14px rgba(255,159,28,0.65)'
    },
    trinity:{
      primary:'#00d8d8', secondary:'#FFE066', accent:'#ffffff',
      bg_soft:'rgba(0,216,216,0.09)',
      glow:'0 0 18px rgba(0,216,216,0.70)'
    },
    infodose:{
      primary:'#39FFB6', secondary:'#FFE066', accent:'#11141c',
      bg_soft:'rgba(57,255,182,0.12)',
      glow:'0 0 18px rgba(57,255,182,0.75)'
    },
    kodux:{
      primary:'#FF6FB5', secondary:'#5B2C6F', accent:'#FDEBFF',
      bg_soft:'rgba(91,44,111,0.18)',
      glow:'0 0 16px rgba(255,111,181,0.70)'
    },
    bllue:{
      primary:'#4A90E2', secondary:'#142850', accent:'#E3F2FF',
      bg_soft:'rgba(74,144,226,0.14)',
      glow:'0 0 16px rgba(74,144,226,0.70)'
    },
    minuz:{
      primary:'#FF3366', secondary:'#111111', accent:'#FFE3ED',
      bg_soft:'rgba(255,51,102,0.16)',
      glow:'0 0 16px rgba(255,51,102,0.75)'
    },
    hanah:{
      primary:'#FFB6C1', secondary:'#3C1F3C', accent:'#FFE9F0',
      bg_soft:'rgba(255,182,193,0.16)',
      glow:'0 0 16px rgba(255,182,193,0.70)'
    },
    metalux:{
      primary:'#B0E0E6', secondary:'#202733', accent:'#F0FBFF',
      bg_soft:'rgba(176,224,230,0.16)',
      glow:'0 0 18px rgba(176,224,230,0.70)'
    }
  };

  const root = document.documentElement;
  const body = document.body;

  function normalizeKey(s){
    return String(s||'').normalize('NFD')
      .replace(/\p{Diacritic}/gu,'')
      .toLowerCase()
      .replace(/[^a-z0-9]/g,'');
  }

  function detectArchKeyFromText(text){
    if(!text) return null;
    const raw = String(text);
    const trimmed = raw.trim();
    const lowAll  = trimmed.toLowerCase();

    // 1) [Nome] no começo do parágrafo
    const m = trimmed.match(/^\[([^\]]+)\]/);
    if(m){
      const namePart = m[1].split('—')[0].split('-')[0].trim();
      const k = normalizeKey(namePart);
      if(COLOR_MAP[k]) return k;
    }

    // 2) procura pelo nome dentro do texto
    for(const key of Object.keys(COLOR_MAP)){
      if(lowAll.includes(key)) return key;
    }

    // 3) fallback: hook externo (já existe no teu TTS)
    try{
      if(window.KOB_TTS_VOICE_STYLE_HOOK){
        const arch = window.KOB_TTS_VOICE_STYLE_HOOK(raw);
        const k = normalizeKey(arch);
        if(COLOR_MAP[k]) return k;
      }
    }catch(e){}

    return null;
  }

  function applyColorTheme(key){
    const cfg = COLOR_MAP[key];
    if(!cfg) return;

    root.style.setProperty('--kob-voice-primary',   cfg.primary  || '#00d8d8');
    root.style.setProperty('--kob-voice-secondary', cfg.secondary|| cfg.primary || '#d800d8');
    root.style.setProperty('--kob-voice-accent',    cfg.accent   || '#ffffff');
    root.style.setProperty('--kob-voice-bg-soft',   cfg.bg_soft  || 'rgba(0,0,0,0.25)');
    root.style.setProperty('--kob-voice-glow',      cfg.glow     || '0 0 0 transparent');

    if(body){
      body.setAttribute('data-voice-arch', key);
    }

    // se quiser integrar com outros painéis
    try{
      window.dispatchEvent(new CustomEvent('KOB_VOICE_COLOR',{
        detail:{ id:key, color:cfg }
      }));
    }catch(e){}
  }

  const prevSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);

  window.speechSynthesis.speak = function(u){
    try{
      if(u instanceof SpeechSynthesisUtterance){
        const key = detectArchKeyFromText(u.text||'');
        if(key){
          applyColorTheme(key);
          console.log('🎨 KOBLLUX THEME →', key);
        }
      }
    }catch(e){
      console.warn('KOBLLUX_VOICE_THEME_PATCH error:', e);
    }
    return prevSpeak(u);
  };

  console.log('⚡ KOBLLUX_VOICE_THEME_PATCH ativo — cores dinâmicas por arquétipo');

})();

