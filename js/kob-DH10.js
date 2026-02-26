
/**
 * MONÓLITO KOBLLUX: HUD + TTS ARCHETYPES
 * Une a interface HUD flutuante com o sistema de arquétipos de voz.
 */

(function(){
  // --- Elementos do DOM ---
  const bar = document.getElementById('symbolBar');
  const toggleBtn = document.getElementById('toggleBtn');
  const frame = document.getElementById('content-frame');
  const hudStatus = document.getElementById('hudStatus');
  const outline = document.getElementById('kob-tts-outline');
  
  // --- Estado do TTS e Arquétipos ---
  const ARCHETYPES = [
    { id:'kodux', name:'KODUX', voice:'Reed', rate:0.86, pitch:0.68, color:'#F97316' },
    { id:'kobllux', name:'KOBLLUX', voice:'es_m', rate:0.98, pitch:0.48, color:'#22D3EE' },
    { id:'atlas', name:'ATLAS', voice:'Reed', rate:1.0, pitch:0.93, color:'#38BDF8' },
    { id:'nova', name:'NOVA', voice:'Luciana', rate:1.06, pitch:1.34, color:'#F97316' },
    { id:'serena', name:'SERENA', voice:'Joana', rate:0.92, pitch:0.90, color:'#38BDF8' },
    { id:'vitalis', name:'VITALIS', voice:'Rocko', rate:0.96, pitch:1.42, color:'#22C55E' }
  ];

  let state = {
    archIdx: 0,
    isSpeaking: false,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  const synth = window.speechSynthesis;
  const IDLE_TIME = 8000;
  let idleTimer, startPos = { x: 0, y: 0 }, isDragging = false;

  // --- Inicialização ---
  function init(){
    // Carregar última URL ou conteúdo padrão
    const lastUrl = localStorage.getItem('kob_last_url') || 'about:blank';
    frame.src = lastUrl;

    // Restaurar Posição HUD
    const pos = JSON.parse(localStorage.getItem('kob_hud_pos') || '{"x":20, "y":200}');
    applyPosition(pos.x, pos.y);
    if(state.isCollapsed) bar.classList.add('collapsed');

    updateArchetype(0); // Inicia com o primeiro
    setupHUDListeners();
    setupTTSListeners();
    resetIdleTimer();
    
    // Observer para capturar texto dentro do iframe quando carregar
    frame.onload = () => {
      try {
        scanBlocks();
      } catch(e) { 
        console.warn("Cross-origin frame: Não é possível ler blocos internos."); 
        hudStatus.textContent = "External Link";
      }
    };
  }

  // --- Funções de Arquétipo ---
  function updateArchetype(idx){
    state.archIdx = idx % ARCHETYPES.length;
    const arch = ARCHETYPES[state.archIdx];
    
    document.documentElement.style.setProperty('--kob-voice-primary', arch.color);
    document.documentElement.style.setProperty('--kob-voice-bg-soft', hexToRgba(arch.color, 0.15));
    hudStatus.textContent = arch.name;
    
    // Se estiver falando, reinicia com a nova voz
    if(state.isSpeaking) {
      stopSpeech();
      speakCurrent();
    }
  }

  function hexToRgba(hex, a){
    let c = hex.replace('#','');
    let r = parseInt(c.substring(0,2),16), g = parseInt(c.substring(2,4),16), b = parseInt(c.substring(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // --- Sistema HUD (Drag, Snap, Idle) ---
  function resetIdleTimer(){
    bar.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => bar.classList.add('idle'), IDLE_TIME);
  }

  function applyPosition(x, y){
    const maxX = window.innerWidth - bar.offsetWidth;
    const maxY = window.innerHeight - bar.offsetHeight;
    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));

    bar.style.left = x + 'px';
    bar.style.top = y + 'px';
    
    bar.classList.remove('snap-side', 'snap-side-right', 'snap-top', 'floating');
    if(y <= 40) bar.classList.add('snap-top');
    else if(x <= 40) bar.classList.add('snap-side');
    else if(x >= maxX - 40) bar.classList.add('snap-side-right');
    else bar.classList.add('floating');
  }

  function snapToEdges(){
    bar.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    const r = bar.getBoundingClientRect();
    let x = r.left, y = r.top;

    if(y < 40) { y = 0; x = (window.innerWidth - r.width) / 2; }
    else {
      if(x < 40) x = 0;
      if(x > window.innerWidth - r.width - 40) x = window.innerWidth - r.width;
    }
    applyPosition(x, y);
    localStorage.setItem('kob_hud_pos', JSON.stringify({x, y}));
  }

  function setupHUDListeners(){
    bar.addEventListener('pointerdown', e => {
      if(e.target.closest('.symbol-button')) return;
      isDragging = true;
      startPos = { x: e.clientX - bar.offsetLeft, y: e.clientY - bar.offsetTop };
      bar.classList.add('is-dragging');
      bar.setPointerCapture(e.pointerId);
    });

    bar.addEventListener('pointermove', e => {
      if(!isDragging) return;
      bar.style.transition = 'none';
      applyPosition(e.clientX - startPos.x, e.clientY - startPos.y);
    });

    bar.addEventListener('pointerup', () => {
      isDragging = false;
      bar.classList.remove('is-dragging');
      snapToEdges();
    });

    // Toggle Barra (Sanfonar)
    toggleBtn.onclick = () => {
      state.isCollapsed = !state.isCollapsed;
      bar.classList.toggle('collapsed', state.isCollapsed);
      localStorage.setItem('kob_collapsed', state.isCollapsed);
      setTimeout(snapToEdges, 350);
    };

    // Idle
    window.addEventListener('mousemove', resetIdleTimer, {passive:true});
    window.addEventListener('touchstart', resetIdleTimer, {passive:true});

    // Botão Arquétipo
    document.getElementById('btn-arch').onclick = () => updateArchetype(state.archIdx + 1);

    // Links Externos
    document.querySelectorAll('[data-url]').forEach(btn => {
      btn.onclick = () => {
        const url = btn.dataset.url;
        frame.src = url;
        localStorage.setItem('kob_last_url', url);
      };
    });
  }

  // --- Sistema TTS (Speech) ---
  function scanBlocks(){
    const doc = frame.contentDocument || frame.contentWindow.document;
    const sel = 'h1,h2,h3,p,li,blockquote';
    state.blocks = [...doc.querySelectorAll(sel)].filter(el => el.innerText.trim().length > 0);
    state.currentBlockIdx = 0;
  }

  function setupTTSListeners(){
    const btnPlay = document.getElementById('btn-play');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    btnPlay.onclick = () => {
      if(state.isSpeaking) stopSpeech();
      else startSpeech();
    };

    btnNext.onclick = () => {
      state.currentBlockIdx++;
      if(state.isSpeaking) speakCurrent();
      else showOutline();
    };

    btnPrev.onclick = () => {
      state.currentBlockIdx = Math.max(0, state.currentBlockIdx - 1);
      if(state.isSpeaking) speakCurrent();
      else showOutline();
    };
  }

  function startSpeech(){
    if(!state.blocks.length) scanBlocks();
    state.isSpeaking = true;
    document.getElementById('btn-play').textContent = '■';
    speakCurrent();
  }

  function stopSpeech(){
    state.isSpeaking = false;
    synth.cancel();
    document.getElementById('btn-play').textContent = '▶';
    hideOutline();
  }

  function speakCurrent(){
    if(state.currentBlockIdx >= state.blocks.length) {
      stopSpeech();
      return;
    }

    synth.cancel();
    const el = state.blocks[state.currentBlockIdx];
    const arch = ARCHETYPES[state.archIdx];
    
    const utter = new SpeechSynthesisUtterance(el.innerText);
    // Tenta encontrar a voz do arquétipo
    const voices = synth.getVoices();
    const voice = voices.find(v => v.name.includes(arch.voice)) || voices.find(v => v.lang.includes('pt'));
    
    if(voice) utter.voice = voice;
    utter.rate = arch.rate;
    utter.pitch = arch.pitch;
    
    utter.onstart = () => showOutline(el);
    utter.onend = () => {
      if(state.isSpeaking) {
        state.currentBlockIdx++;
        speakCurrent();
      }
    };

    synth.speak(utter);
  }

  function showOutline(target){
    const el = target || state.blocks[state.currentBlockIdx];
    if(!el) return;
    
    const rect = el.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    outline.style.display = 'block';
    outline.style.top = (rect.top + frameRect.top + window.scrollY - 4) + 'px';
    outline.style.left = (rect.left + frameRect.left + window.scrollX - 4) + 'px';
    outline.style.width = (rect.width + 8) + 'px';
    outline.style.height = (rect.height + 8) + 'px';

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideOutline(){
    outline.style.display = 'none';
  }

  // Início
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = init;
  } else {
    init();
  }

})();
