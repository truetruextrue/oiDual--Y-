(function(){
  'use strict';

  // ATLAS: util DOM shortcuts (sem alteração lógica, apenas explicativa)
  const $ = (q,r=document)=> r.querySelector(q);
  const $$ = (q,r=document)=> [...r.querySelectorAll(q)];
  const toastEl = $('#kx_toast');

  function toast(msg, ms=1400){
    if(!toastEl){ console.log('toast:', msg); return }
    toastEl.textContent = msg;
    toastEl.style.opacity='1';
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toastEl.style.opacity='0', ms);
  }

  // NOVA: key DOM refs used across HUD/TTS
  const bar = $('#symbolBar');
  const toggleBtn = $('#toggleBtn');
  const frame = $('#content-frame');
  const root = $('#root');
  const hudStatus = $('#hudStatus');
  const outline = $('#kob-tts-outline');

  // VITALIS: explicit BTN constants (used by start/stop UI sync)
  const BTN_PLAY = $('#btn-play');
  const BTN_NEXT = $('#btn-next');
  const BTN_PREV = $('#btn-prev');
  const BTN_ARCH = $('#btn-arch');

  // PULSE: ARCHETYPES — langs added, voice kept as primary key (no renames).
  // DELTA: each archetype may include optional `lang` used by utterance.lang.
  const ARCHETYPES = [
    { id:'kobllux', name:'KOBLLUX', voice:'Majed',   lang:'ar-001', rate:0.98, pitch:0.48, color:'#22D3EE' },
    { id:'kodux',   name:'KODUX',   voice:'Majed',   lang:'ar-001', rate:0.86, pitch:0.68, color:'#F97316' },

    // Roda Viva 12
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

    // Expansão simbólica
    { id:'uno',      name:'UNO',      voice:'Grandma', lang:'en-US', rate:0.90, pitch:0.93, color:'#F97316' },
    { id:'dual',     name:'DUAL',     voice:'Reed',    lang:'pt-BR', rate:1.02, pitch:1.02, color:'#06B6D4' },
    { id:'trinity',  name:'TRINITY',  voice:'Sandy',   lang:'en-US', rate:1.04, pitch:1.04, color:'#EC4899' },
    { id:'infodose', name:'INFODOSE', voice:'Luciana', lang:'pt-BR', rate:1.06, pitch:0.96, color:'#22C55E' },

    // Arquétipo adicional
    { id:'horus', name:'HORUS', voice:'Majed', lang:'ar-001', rate:0.94, pitch:0.82, color:'#F59E0B' }
  ];

  // GENUS: state container (unchanged)
  let state = {
    archIdx: 0,
    isSpeaking: false,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  // LUMINE: speech synth detection (unchanged)
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth) toast('SpeechSynthesis não disponível');

  // SOLUS: voice-finder uses name part first, then a lang-aware fallback could be added.
  // DELTA: keep existing behavior but prefer exact name match (non-invasive).
  function findVoiceByNamePart(part){
    if(!synth) return null;
    const voices = synth.getVoices()||[];
    // KAOS: match by name substring (1st priority)
    const v = voices.find(x => x.name && x.name.toLowerCase().includes(String(part).toLowerCase()));
    if(v) return v;
    // RHEA: fallback by language heuristic — try pt then first voice
    return voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
  }

  // AION: speakCurrent — DELTA: set utterance.lang from archetype if present (keeps previous logic)
  function speakCurrent(){
    if(!synth){ toast('TTS indisponível'); return; }
    if(!state.blocks.length) rebuildBlocks();
    if(state.currentBlockIdx >= state.blocks.length){ stopSpeech(); toast('Fim da leitura'); return; }

    const el = state.blocks[state.currentBlockIdx];
    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0]; // ATLAS: canonical arch ref
    const txt = (el && el.innerText) ? el.innerText.trim() : '';
    if(!txt){ state.currentBlockIdx++; setStatus(); return speakCurrent(); }

    try{ synth.cancel(); }catch(e){}

    const u = new SpeechSynthesisUtterance(txt);
    const voice = findVoiceByNamePart(arch.voice);
    if(voice) u.voice = voice;

    // DELTA (ARTEMIS): ensure language hint follows archetype when available
    if(arch.lang) u.lang = arch.lang;

    u.rate = arch.rate;
    u.pitch = arch.pitch;

    u.onstart = () => { showOutlineFor(el); setStatus(); };
    u.onend = () => {
      if(state.isSpeaking){ state.currentBlockIdx++; setStatus(); setTimeout(()=> speakCurrent(), 120); }
    };
    u.onerror = (ev) => { console.warn('tts error', ev); if(state.isSpeaking){ state.currentBlockIdx++; speakCurrent(); } };
    synth.speak(u);
  }

  // RHEA: start/stop keeping BTN sync (BTN_PLAY already defined)
  function startSpeech(){
    if(!state.blocks.length) rebuildBlocks();
    if(!state.blocks.length){ toast('Nada para ler'); return }
    state.isSpeaking = true;
    BTN_PLAY && (BTN_PLAY.textContent = '■');
    speakCurrent();
  }

  function stopSpeech(){
    state.isSpeaking = false;
    try{ synth && synth.cancel(); }catch{}
    BTN_PLAY && (BTN_PLAY.textContent = '▶');
    hideOutline();
    setStatus();
  }

  // SERENA: #tts-sel handler — DELTA: use arch variable so arch.lang exists (fixes ReferenceError)
  $('#tts-sel') && $('#tts-sel').addEventListener('click', () => {
    const s = String(window.getSelection && window.getSelection());
    if (!s || !s.trim()) return toast('Selecione um trecho para ler.');

    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0]; // DELTA: canonical arch

    try { synth.cancel(); } catch {}

    const u = new SpeechSynthesisUtterance(sanitize(s));

    const voice = findVoiceByNamePart(arch.voice);
    if (voice) u.voice = voice;

    // DELTA: apply lang hint from archetype (non-invasive)
    if (arch.lang) u.lang = arch.lang;

    u.rate  = arch.rate;
    u.pitch = arch.pitch;

    synth.speak(u);
  });

  // GENUS: KOBLLUX.speakText API — DELTA: prefer opts.lang then archetype lang, then fallback 'pt-BR'
  window.KOBLLUX = window.KOBLLUX || {};
  Object.assign(window.KOBLLUX, { startSpeech, stopSpeech, rebuildBlocks, updateArchetype, state });

  window.KOBLLUX.speakText = window.KOBLLUX.speakText || function(txt, opts){
    try{
      const text = String(txt || '').trim();
      if(!text) return false;
      const voiceName = (opts && opts.voice) || (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].voice) || null;
      const rate = (opts && typeof opts.rate === 'number') ? opts.rate : (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].rate) || 1.0;
      const pitch = (opts && typeof opts.pitch === 'number') ? opts.pitch : (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].pitch) || 1.0;

      const synthLocal = window.speechSynthesis;
      const pickVoice = () => {
        try{
          const voices = synthLocal ? synthLocal.getVoices() : [];
          if(voiceName){
            const found = voices.find(v => v.name && v.name.toLowerCase().includes(String(voiceName).toLowerCase()));
            if(found) return found;
          }
          if(voices && voices.length) return voices.find(x => /pt/i.test(x.lang)) || voices[0];
        }catch(e){ /* ignore */ }
        return null;
      };

      const utter = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if(v) utter.voice = v;

      utter.rate = rate;
      utter.pitch = pitch;

      // DELTA (LUMINE): dynamic lang selection
      utter.lang =
        (opts && opts.lang) ||
        (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].lang) ||
        'pt-BR';

      try{ synthLocal && synthLocal.cancel(); }catch(e){}
      synthLocal && synthLocal.speak(utter);
      return true;
    }catch(e){
      console.warn('KOBLLUX.speakText failed', e);
      return false;
    }
  };

  // FINAL: small readiness toast
  console.log('KOBLLUX fixed monolith init');
  toast('KOBLLUX pronto ✓', 900);

})(); // end IIFE