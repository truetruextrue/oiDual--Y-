
(()=>{

  if(window.__KOB_TTS_V32_2_ACTIVE) return;
  window.__KOB_TTS_V32_2_ACTIVE = true;

  if(!('speechSynthesis' in window)){
    console.warn('SpeechSynthesis não suportado neste navegador.');
    return;
  }

  /* ========= ESTADO GLOBAL ========= */
  window.__tts_on = false;
  let __tts_voice = null;
  let __tts_utterance = null;

  function $(sel, root=document){ return root.querySelector(sel); }

  function getStatusEl(){
    return document.getElementById('tts-status');
  }

  function setStatus(msg){
    const el = getStatusEl();
    if(el) el.textContent = msg || '';
  }

  /* ========= VOZ ========= */
  function pickPTBRVoice(){
    const voices = speechSynthesis.getVoices();
    const cand =
      voices.find(v => /pt[-_]BR/i.test(v.lang)) ||
      voices.find(v => /pt\b/i.test(v.lang));
    return cand || voices[0] || null;
  }

  function ensureVoice(){
    if(!__tts_voice){
      __tts_voice = pickPTBRVoice();
    }
  }

  /* ========= LIMPEZA DO TEXTO ========= */
  function cleanText(raw){
    if(!raw) return '';
    let text = String(raw);

    // Remove rótulos e lixinhos óbvios
    text = text.replace(/Copiar/g, ' ');

    // Quebras de linha, \n, etc → espaço
    text = text.replace(/\\n|[\r\n]+/g, ' ');

    // Remove barras invertidas sobrando
    text = text.replace(/\\+/g, '');

    // Normaliza barras normais (evita "barra barra barra")
    text = text.replace(/[\/]{2,}/g, '/');

    // Espaços múltiplos → um espaço
    text = text.replace(/\s{2,}/g, ' ');

    // Trim final
    text = text.trim();

    // Se for muito curtinho ou só símbolo, não fala
    if(text.length <= 3) return '';

    return text;
  }

  /* ========= FALAR / PARAR ========= */
  function speakText(text){
    const cleaned = cleanText(text);
    if(!cleaned) return;

    if(!window.__tts_on){
      window.toast && toast('Ative a Voz (TTS)');
      return;
    }

    ensureVoice();
    speechSynthesis.cancel();
    setStatus('Lendo...');

    const u = new SpeechSynthesisUtterance(cleaned);
    __tts_utterance = u;

    if(__tts_voice) u.voice = __tts_voice;
    u.lang = (__tts_voice && __tts_voice.lang) || 'pt-BR';
    u.rate = 1.12;
    u.pitch = 0.78;
    u.volume = 1.0;

    u.onstart = () => setStatus('Lendo...');
    u.onend   = () => setStatus('Pronto');
    u.onerror = () => setStatus('Erro na voz');

    speechSynthesis.speak(u);
  }

  function stopTTS(){
    speechSynthesis.cancel();
    __tts_utterance = null;
    setStatus('Parado');
  }

  function getSelectedText(){
    return (window.getSelection && String(window.getSelection())) || '';
  }

  function setTTS(on){
    window.__tts_on = !!on;
    const btnFab = document.getElementById('btn-tts');
    if(btnFab){
      btnFab.textContent = 'Voz: ' + (window.__tts_on ? 'On' : 'Off');
    }
    const dockBtn = document.querySelector('[data-tts-btn="toggle"]');
    if(dockBtn){
      dockBtn.setAttribute('aria-pressed', window.__tts_on ? 'true' : 'false');
    }
    setStatus(window.__tts_on ? 'TTS ligado' : 'TTS desligado');
    window.toast && toast(window.__tts_on ? 'Voz ativada' : 'Voz desativada');
  }

  /* ========= DOCK LATERAL (se ainda não existir) ========= */
  function ensureTTSDock(){
    if(document.querySelector('.kob-tts-dock')) return;

    const dock = document.createElement('div');
    dock.className = 'kob-tts-dock';
    dock.innerHTML = `
      <button type="button" data-tts-btn="toggle" title="TTS On/Off" aria-pressed="false">◎</button>
      <button type="button" data-tts-btn="sel"    title="Ler seleção">▷</button>
      <button type="button" data-tts-btn="stop"   title="Parar voz">■</button>
      <span id="tts-status"></span>
    `;
    document.body.appendChild(dock);

    // status inicial
    setStatus('TTS desligado');

    // drag simples
    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startBottom = 0;

    dock.addEventListener('pointerdown', (ev)=>{
      if(!(ev.target instanceof HTMLElement)) return;
      // só arrasta se clicar na área vazia do dock (não nos botões)
      if(ev.target.closest('button')) return;

      dragging = true;
      dock.classList.add('is-drag');
      startX = ev.clientX;
      startY = ev.clientY;
      const cs = getComputedStyle(dock);
      startLeft = parseFloat(cs.left || '8');
      startBottom = parseFloat(cs.bottom || '240');
      dock.setPointerCapture(ev.pointerId);
    });

    dock.addEventListener('pointermove', (ev)=>{
      if(!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const left = startLeft + dx;
      const bottom = startBottom - dy;
      dock.style.left = `${left}px`;
      dock.style.bottom = `${bottom}px`;
    });

    dock.addEventListener('pointerup', (ev)=>{
      if(!dragging) return;
      dragging = false;
      dock.classList.remove('is-drag');
      dock.releasePointerCapture(ev.pointerId);
    });
  }

  /* ========= LISTENERS GERAIS ========= */

  // Integra com botões existentes (FAB, MasterBlock, Dock)
  document.addEventListener('click',(e)=>{
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;

    // 1) Botões dedicados (IDs existentes + dock)
    const isFabToggle = t.id === 'btn-tts';
    const isFabSel    = t.id === 'btn-tts-sel';
    const isFabStop   = t.id === 'btn-tts-stop';

    const dockRole = t.dataset.ttsBtn;

    if(isFabToggle || dockRole === 'toggle'){
      setTTS(!window.__tts_on);
      return;
    }
    if(isFabSel || dockRole === 'sel'){
      const sel = getSelectedText();
      if(sel) speakText(sel);
      else window.toast && toast('Selecione um trecho primeiro');
      return;
    }
    if(isFabStop || dockRole === 'stop'){
      stopTTS();
      return;
    }

    // 2) Se TTS desligado, não faz nada no resto
    if(!window.__tts_on) return;

    // 3) Clique em bloco de texto → ler
    const block = t.closest('p, li, blockquote, .coach, .callout, .equation, pre, td, th');
    if(!block) return;

    // Ignora cliques em zonas de UI
    if(t.closest('button,a,.emoji-btn,.chip,.btn,#fab,.menu,#ttsDock,.kob-tts-dock')) return;

    // NÃO ler código nem fórmulas (senão soletra tudo)
    if(block.matches('pre, .equation')) return;

    let text = block.innerText || '';
    speakText(text);
  });

  // Voicelist
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = ()=>{
      if(!__tts_voice) __tts_voice = pickPTBRVoice();
    };
  }

  // Quando DOM carregar: garantir Dock
  window.addEventListener('DOMContentLoaded', ()=>{
    try{
      ensureTTSDock();
      // Ajusta label inicial do botão principal (se existir)
      const b = document.getElementById('btn-tts');
      if(b){
        b.textContent = 'Voz: ' + (window.__tts_on ? 'On' : 'Off');
      }
      setStatus('TTS desligado');
    }catch(err){
      console.error('Erro ao inicializar TTS dock', err);
    }
  });

  // Expor API global opcional
  window.__tts = {
    set: setTTS,
    speak: speakText,
    stop: stopTTS,
    status: setStatus
  };

})();



(()=>{
  try{
    const K='kob_tts_prefs_v32';
    const p = Object.assign({preferMale:false,userLockedBase:false,voiceName:''}, JSON.parse(localStorage.getItem(K)||'{}'));
    p.preferMale=false; p.userLockedBase=false; p.voiceName='';
    localStorage.setItem(K, JSON.stringify(p));
  }catch{}
  // opcional: expõe um atalho pro console
  window.__kob_reset_tts_prefs = ()=>{
    try{
      const K='kob_tts_prefs_v32';
      const p = {preferMale:false,userLockedBase:false,voiceName:''};
      localStorage.setItem(K, JSON.stringify(p));
      return p;
    }catch(e){ return e&&e.message; }
  };
})();



(()=>{
  const ARCHETYPES = [
    { id:'atlas',   name:'Atlas',   tone:'Estratégico, metódico',        modulation:'Grave, ritmo calculado, dicção nítida.',        voice:'Reed',    rate:1.0,  pitch:0.93 },
    { id:'nova',    name:'Nova',    tone:'Vibrante, entusiasmado',       modulation:'Agudo, entusiasmado, ligeiramente rápido.',      voice:'Luciana', rate:1.063, pitch:1.34 },
    { id:'vitalis', name:'Vitalis', tone:'Energético, urgente',          modulation:'Rápido, intenso, motivacional.',                  voice:'Rocko',   rate:0.96, pitch:1.42 },
    { id:'pulse',   name:'Pulse',   tone:'Emocional, melódico',          modulation:'Fluido, tom médio/suave.',                       voice:'Reed',    rate:1.0, pitch:1.14 },
    { id:'artemis', name:'Artemis', tone:'Aventureiro, expansivo',       modulation:'Curioso, exploratório.',                         voice:'es_f',    rate:1.00, pitch:1.23 },
    { id:'serena',  name:'Serena',  tone:'Calmo, acolhedor',             modulation:'Suave, terapêutico, com pausas.',                voice:'Joana',   rate:0.92, pitch:0.90 },
    { id:'kaos',    name:'Kaos',    tone:'Desafiador, imprevisível',     modulation:'Intenso, ritmo entrecortado.',                   voice:'Rocko',   rate:1.09, pitch:1.28 },
    { id:'genus',   name:'Genus',   tone:'Prático, detalhista',          modulation:'Tom firme, foco na dicção.',                     voice:'Reed',    rate:0.98, pitch:1.20 },
    { id:'lumine',  name:'Lumine',  tone:'Alegre, brincalhão',           modulation:'Agudo, vibrante.',                               voice:'Flo',     rate:1.030, pitch:1.55 },
    { id:'solus',   name:'Solus',   tone:'Sábio, introspectivo',         modulation:'Grave, lento, eco sutil.',                       voice:'es_m',    rate:0.88, pitch:0.87 },
    { id:'rhea',    name:'Rhea',    tone:'Profundo, conectivo',          modulation:'Calmo, eco sutil.',                              voice:'Joana',   rate:1.02, pitch:0.59 },
    { id:'aion',    name:'Aion',    tone:'Futurista, metódico',          modulation:'Tom constante, progressivo.',                    voice:'Monica',  rate:0.98, pitch:1.00 },

    { id:'kobllux', name:'KOBLLUX', tone:'Núcleo do sistema, oracular',
      modulation:'Grave-médio, presença de comando, ritmo estável.',     voice:'es_m',  rate:0.98, pitch:0.48 },

    { id:'uno',     name:'Uno',     tone:'Essência, origem, foco',
      modulation:'Tom centrado, poucas variações, pausas marcadas.',     voice:'Grandma',    rate:0.90, pitch:0.93 },

    { id:'dual',    name:'Dual',    tone:'Espelho, contraste, jogo',
      modulation:'Alterna leve entre grave/agudo, ritmo pulsante.',      voice:'pt_m',    rate:1.02, pitch:1.02 },

    { id:'trinity', name:'Trinity', tone:'Síntese, tríade viva',
      modulation:'Voz estável com micro variações rítmicas em 3 tempos.', voice:'Sandy', rate:1.04, pitch:1.04 },

    { id:'infodose',name:'Infodose',tone:'Didático, carismático, dopamínico',
      modulation:'Tom amigável, ritmo de recompensa → curiosidade.',      voice:'Luciana', rate:1.06, pitch:0.96 },

    { id:'kodux',   name:'KODUX',   tone:'Criador do pulso, metaconsciência',
      modulation:'Grave, confiante, pausas longas, intenção forte.',      voice:'Reed pt-BR',  rate:0.86, pitch:0.68 },

    { id:'bllue',   name:'Bllue',   tone:'Emocional, sensorial, intuitivo',
      modulation:'Suave, quase sussurrado, ritmo ondulante.',            voice:'Joana',   rate:0.94, pitch:1.42 },

    { id:'minuz',   name:'Minuz',   tone:'Minimalista, direto, hacker',
      modulation:'Rápido, cortes secos, foco em termos técnicos.',       voice:'Reed',    rate:1.05, pitch:0.90 },

    { id:'hanah', name:'HANAH', tone:'Estético, simbólico, futurista',
      modulation:'Tom limpo, levemente ecoado, cadência ritualística.',  voice:'Monica',  rate:1.00, pitch:1.08 },

  { id:'metalux', name:'MetaLux', tone:'Estético, simbólico, futurista',
      modulation:'Tom limpo, levemente ecoado, cadência ritualística.',  voice:'Grandma',  rate:0.80, pitch:1.68 }

  ];

  window.KOBLLUX_VOICES = ARCHETYPES.reduce((acc,a)=>{
    acc[a.name.toLowerCase()] = a;
    return acc;
  },{});

  const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = (u)=>{
    const text = (u.text||'').toLowerCase();
    const found = ARCHETYPES.find(a=> text.includes(a.name.toLowerCase()));
    if(found){
      const voices = speechSynthesis.getVoices();
      const match = voices.find(v=> v && v.name && v.name.includes(found.voice));
      if(match) u.voice = match;
      u.pitch = found.pitch;
      u.rate  = found.rate;
      console.log('🎙️ KOBLLUX Voice →', found.name, '→', found.voice, `(rate=${found.rate}, pitch=${found.pitch})`);
    }
    origSpeak(u);
  };

  console.log('⚡ KOBLLUX Voices Integradas —', ARCHETYPES.length, 'perfis ativos');

  // 🔔 avisa pro painel que as vozes estão prontas
  window.dispatchEvent(new Event('KOBLLUX_VOICES_READY'));

})();



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


(()=>{
  if (window.__KOB_THEME_TRANSITION_SOFT_OVERRIDE__) return;
  window.__KOB_THEME_TRANSITION_SOFT_OVERRIDE__ = true;

  const css = `
  :root{
    /* duração padrão da transição de tema (pode ajustar aqui) */
    --kob-voice-theme-duration: 6600ms;
  }

  /* Tudo que costuma mudar de cor quando o tema troca */
  body,
  .nebula,
  .nebula-bg,
  .page,
  .page-inner,
  details.acc,
  .btn,
  #fab,
  .kob-tts-dock,
  .kob-tts-panel.is-dock {
    transition:
      background-color var(--kob-voice-theme-duration) ease-in-out,
      background        var(--kob-voice-theme-duration) ease-in-out,
      box-shadow        var(--kob-voice-theme-duration) ease-in-out,
      border-color      var(--kob-voice-theme-duration) ease-in-out,
      color             var(--kob-voice-theme-duration) ease-in-out;
  }
  `;

  const style = document.createElement('style');
  style.id = 'KOB_THEME_TRANSITION_SOFT_CSS';
  style.textContent = css;
  document.head.appendChild(style);

  console.log('🎨 KOB_THEME_TRANSITION_SOFT_OVERRIDE ativo (fade ~1.1s)');
})();




(()=>{
  if (window.__KOB_BG_FADE_OVERRIDE__) return;
  window.__KOB_BG_FADE_OVERRIDE__ = true;

  const css = `
  :root{
    --kob-voice-theme-duration: 7800ms;
  }

  /* Fade suave pro fundo principal e o glow nebuloso */
  body,
  .nebula{
    transition:
      background-color var(--kob-voice-theme-duration) ease-in-out !important,
      background        var(--kob-voice-theme-duration) ease-in-out !important,
      box-shadow        var(--kob-voice-theme-duration) ease-in-out !important,
      color             var(--kob-voice-theme-duration) ease-in-out !important,
      filter            var(--kob-voice-theme-duration) ease-in-out !important;
  }
  `;

  const style = document.createElement('style');
  style.id = 'KOB_BG_FADE_CSS';
  style.textContent = css;
  document.head.appendChild(style);

  console.log('🎨 KOB_BG_FADE_OVERRIDE ativo (body + .nebula com fade ~1.2s)');
})();





(()=>{
  if (window.__KOB_BUTTON_FADE_AND_TTS_SHADOW_PATCH__) return;
  window.__KOB_BUTTON_FADE_AND_TTS_SHADOW_PATCH__ = true;

  const css = `
  :root{
    /* usa o mesmo timing do tema de voz, ou define aqui se quiser independente */
    --kob-voice-theme-duration: 1100ms;
  }

  /* Fades suaves para botões, chips e afins */
  .btn,
  .chip,
  button,
  #fab,
  .fab,
  .menu button,
  details.acc,
  details.acc summary,
  .kob-tts-dock button,
  .kob-tts-panel.is-dock button{
    transition:
      background-color var(--kob-voice-theme-duration) ease-in-out,
      background        var(--kob-voice-theme-duration) ease-in-out,
      border-color      var(--kob-voice-theme-duration) ease-in-out,
      color             var(--kob-voice-theme-duration) ease-in-out,
      box-shadow        var(--kob-voice-theme-duration) ease-in-out;
  }

  /* Shadow mais discreto pro dock de TTS */
  .kob-tts-dock{
    box-shadow:
      0 6px 14px rgba(0,0,0,.30),
      inset 0 0 0 1px rgba(255,255,255,.04) !important;
  }
  `;

  const style = document.createElement('style');
  style.id = 'KOB_BUTTON_FADE_AND_TTS_SHADOW_CSS';
  style.textContent = css;
  document.head.appendChild(style);

  console.log('🎨 KOB_BUTTON_FADE_AND_TTS_SHADOW_PATCH ativo (fade botões + shadow TTS suave)');
})();




(()=>{'use strict';
  if (!('speechSynthesis' in window)) {
    console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1: SpeechSynthesis não disponível.');
    return;
  }
  if (window.__KOB_TTS_ARCH_GATILHO_PATCH_V1__) return;
  window.__KOB_TTS_ARCH_GATILHO_PATCH_V1__ = true;

  const synth = window.speechSynthesis;
  const prevSpeak = synth.speak.bind(synth); // respeita patches anteriores

  // Mapa de vozes já existente (Atlas, Nova, etc)
  const VOICE_MAP = (window.ARQ_VOICE_MAP || {});
  const ARCH_KEYS = Object.keys(VOICE_MAP);
  if (!ARCH_KEYS.length){
    console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1: VOICE_MAP vazio, nada a fazer.');
  }

  // 🔑 Gatilhos de frase (você pode editar/expandir depois no console)
  const DEFAULT_TRIGGERS = {
    Atlas: [
      /\bupa[-\s]*atlas\b/i,
      /\bportal\s*\[\s*atlas\s*\]/i
    ],
    Nova: [
      /\bvia\s*\[\s*nova\s*\]/i,
      /\bmente nova\b/i
    ],
    Lumine: [
      /\blumine\b/i,
      /\barch[-\s]*lumine\b/i
    ]
    // adiciona mais se quiser…
  };

  // Mescla default + o que você definir manualmente:
  const TRIGGERS = Object.assign({}, DEFAULT_TRIGGERS, (window.ARQ_TRIGGERS || {}));
  window.ARQ_TRIGGERS = TRIGGERS; // expõe pra você brincar

  // Heurísticas de idioma básicas (pt/es)
  const PT    = v => /^pt\b/i.test(v.lang || '');
  const ES    = v => /^es\b/i.test(v.lang || '');

  const NORM = s => String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  function getVoicesSafe(){
    try { return synth.getVoices() || []; }
    catch { return []; }
  }

  function pickBySpec(spec, vs){
    if (!spec) return null;
    const s = String(spec).trim().toLowerCase();

    // Tokens por idioma (pt_f, es_m, etc)
    const NAME_F_PT = /(luciana|vitor[ioa]|camila|maria|sofia|joana)/i;
    const NAME_M_PT = /(daniel|reed|ricardo|miguel|thiago|henrique|felipe|jo[aã]o)/i;
    const NAME_F_ES = /(conchita|m[oó]nica|monica|paulina|luz)/i;
    const NAME_M_ES = /(jorge|fred|diego|sebasti[aá]n|sebastian)/i;

    if (s === 'pt_f') return vs.find(v => PT(v) && NAME_F_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'pt_m') return vs.find(v => PT(v) && NAME_M_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'es_f') return vs.find(v => ES(v) && NAME_F_ES.test(v.name || '')) || vs.find(ES) || null;
    if (s === 'es_m') return vs.find(v => ES(v) && NAME_M_ES.test(v.name || '')) || vs.find(ES) || null;

    if (s === 'pt')   return vs.find(PT) || null;
    if (s === 'es')   return vs.find(ES) || null;

    const exact = vs.find(v => NORM(v.name) === NORM(spec));
    if (exact) return exact;
    return vs.find(v => NORM(v.name).includes(NORM(spec))) || null;
  }

  // 🎯 Detecta arquétipo a partir de TODAS as formas de tag + frases de gatilho
  function detectArchetypeKey(text){
    if (!text || !ARCH_KEYS.length) return null;
    const raw   = String(text);
    const lower = raw.toLowerCase();

    for (const key of ARCH_KEYS){
      const n = key.toLowerCase();

      // [Atlas], [[Atlas]], (((Atlas))), {Atlas}, <Atlas>
      const bracket = new RegExp(`[\$begin:math:display$\\\\(\\\\{<]+\\\\s*${n}\\\\s*[\\$end:math:display$\\)\\}>]+`);
      if (bracket.test(lower)) return key;

      // Nome no início com : ou traço — ex: "Atlas: ..." ou "Nova — ..."
      const header = new RegExp(`^\\s*${n}\\s*[:\\-–—·>]`);
      if (header.test(lower)) return key;

      // Nome isolado entre espaços com "modo tag" ex: "::Atlas::"
      const middle = new RegExp(`[\\s\\|:>\\-\\[]${n}[\\s\\|<\\-:!,.?]`);
      if (middle.test(lower)) return key;

      // Frases de gatilho custom
      const arr = TRIGGERS[key] || [];
      for (const rx of arr){
        try{
          if (rx.test(raw) || rx.test(lower)) return key;
        }catch(e){}
      }
    }
    return null;
  }

  // Opcional: remover tags de arquétipo do texto falado (pra não ler "[Atlas]" etc)
  function stripArchetypeTags(text, key){
    if (!text || !key) return text;
    const n = key.toLowerCase();

    // remove [Atlas], ((Atlas)), {{Atlas}}, <Atlas>, [[Atlas]] etc
    const genericBrackets = new RegExp(`[\\[\$begin:math:text$\\\\{<]+\\\\s*${n}\\\\s*[\\\\]\\$end:math:text$\\}>]+\\s*`, 'ig');
    let out = text.replace(genericBrackets, '');

    // remove "Atlas: " no começo da linha
    const header = new RegExp(`^\\s*${n}\\s*[:\\-–—·>]\\s*`, 'i');
    out = out.replace(header, '');

    return out.trim() || text;
  }

  synth.speak = function(u){
    try{
      if (u instanceof SpeechSynthesisUtterance && ARCH_KEYS.length){
        let text   = String(u.text || '');
        const arch = detectArchetypeKey(text);

        if (arch){
          const voices = getVoicesSafe();
          const spec   = VOICE_MAP[arch];
          const v      = spec ? pickBySpec(spec, voices) : null;

          if (v){
            u.voice = v;
            if (!u.lang && v.lang) u.lang = v.lang;
            // marca pra debug / painel
            u.__kob_arch = arch;
            // limpa as tags pra não serem lidas
            u.text = stripArchetypeTags(text, arch);
            console.log('🎙️ ARCH_GATILHO', arch, '→', v.name, v.lang);
          }
        }
      }
    }catch(e){
      console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1 error', e);
    }
    return prevSpeak(u); // deixa LANG_SPEC, THEME etc trabalharem depois
  };

  console.log('⚡ KOB_TTS_ARCH_GATILHO_PATCH_V1 ativo — tags & gatilhos de arquétipo liberados');
})();
