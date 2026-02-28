// -----------------------------
// di_tts_dock_plus.js — Dock update + Click-to-Speak turbo
// Cole esse bloco no final do seu JS (LV-delta.js / kobdh0-main.js)
// -----------------------------
(function(){
  // ---- configuráveis ----
  const SELECTOR_DOCK = '.kob-tts-dock';
  const STATUS_SEL = '#tts-status';
  const IFRAME_SEL = '#frame';
  const HIGHLIGHT_CLASS = 'kob-tts-highlight';
  const CHUNK_SIZE = 350;
  const LONGPRESS_MS = 600;

  // ---- cria/atualiza dock (não duplica) ----
  let dock = document.querySelector(SELECTOR_DOCK);
  const dockHTML = `
    <button id="btn-tts"        title="Voz On/Off" aria-pressed="false">🔊</button>

    <button id="btn-prev"       title="Anterior">◀</button>
    <button id="btn-play"       title="Play / Pause">▶</button>
    <button id="btn-next"       title="Próximo">▶▶</button>

    <button id="btn-tts-sel"    title="Ler seleção">✂︎</button>
    <button id="btn-tts-stop"   title="Parar">■</button>

    <button id="tts-openall"    title="Abrir tudo">◎</button>
    <button id="tts-grid"       title="Outline / Click-to-Speak">⌗</button>

    <button id="btn-arch"       title="Trocar Voz / Arquétipo (segurar: alterna gênero)">🎙</button>

    <small id="tts-status">Pronto.</small>
  `;
  if(dock){
    dock.innerHTML = dockHTML;
  }else{
    const d = document.createElement('div');
    d.className = 'kob-tts-dock';
    d.innerHTML = dockHTML;
    document.body.appendChild(d);
    dock = d;
  }

  // ---- estilo de highlight (injetado) ----
  if(!document.getElementById('di-tts-styles')){
    const s = document.createElement('style');
    s.id = 'di-tts-styles';
    s.textContent = `
      .${HIGHLIGHT_CLASS} {
        position: relative;
        box-shadow: 0 6px 20px rgba(0,0,0,.18), 0 0 28px rgba(255,220,110,.08) inset;
        outline: 3px solid rgba(255,240,200,.18);
        transition: box-shadow .35s ease, outline-color .35s ease, transform .28s ease;
        transform-origin: center;
        z-index: 9998;
      }
      .kob-tts-dock { position: fixed; right: 18px; bottom: 18px; display:flex; gap:6px; align-items:center; padding:10px; background: rgba(12,12,14,.6); border-radius:10px; backdrop-filter: blur(6px); z-index:9999; }
      .kob-tts-dock button { background:transparent; border:none; color:var(--muted, #fff); font-size:1.05rem; padding:6px; cursor:pointer; }
      .kob-tts-dock small { color:var(--muted, #ddd); margin-left:8px; font-size:.82rem; }
      #kob-tts-outline { position: fixed; left: 12px; top: 12px; z-index: 9997; pointer-events: none; }
      .kob-tts-outline-item { pointer-events: auto; cursor: pointer; padding:5px 8px; border-radius:6px; margin:6px; background: rgba(0,0,0,.4); color:#fff; font-size:.85rem; opacity:.9; }
    `;
    document.head.appendChild(s);
  }

  // ---- estado ----
  window.di_tts = window.di_tts || {};
  const state = window.di_tts;
  state.active = state.active || false;
  state.voiceIndex = state.voiceIndex || 0;
  state.voices = state.voices || [];
  state.preferredLang = 'pt';
  state.highlightEl = null;
  state.gridActive = false;

  // ---- helpers ----
  function setStatus(txt){
    try{
      const st = document.querySelector(STATUS_SEL);
      if(st) st.textContent = txt;
    }catch(e){}
    // console.debug('di_status:', txt);
  }

  function safeTrim(s){ return s ? String(s).trim() : ''; }

  function chunkText(text, maxLen){
    if(!text) return [];
    text = text.replace(/\s+/g,' ').trim();
    if(text.length <= maxLen) return [text];
    // prefer split by sentence endings
    const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
    const chunks = [];
    let cur = '';
    for(const p of parts){
      if((cur + p).length <= maxLen) cur += p;
      else {
        if(cur) { chunks.push(cur.trim()); cur = p; }
        else {
          // fallback hard split
          for(let i=0;i<p.length;i+=maxLen) chunks.push(p.slice(i,i+maxLen).trim());
          cur = '';
        }
      }
    }
    if(cur) chunks.push(cur.trim());
    return chunks.filter(Boolean);
  }

  // ---- voices ----
  function refreshVoices(){
    const vList = speechSynthesis.getVoices ? speechSynthesis.getVoices() : [];
    // prefer pt voices
    const ptVoices = vList.filter(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
    state.voices = ptVoices.length ? ptVoices : vList;
    // keep voiceIndex within bounds
    if(state.voiceIndex >= state.voices.length) state.voiceIndex = 0;
    // debug
    //console.info('di voices', state.voices.map(v=>v.name+'|'+v.lang));
  }
  // ensure voices loaded
  refreshVoices();
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = refreshVoices;
  }

  // find voice by gender hint (heuristic)
  function findVoiceByGender(gender){ // 'male' or 'female'
    if(!state.voices || !state.voices.length) return null;
    const names = state.voices.map(v=>v.name.toLowerCase());
    if(gender === 'female'){
      const prefer = state.voices.find(v => /female|fem|woman|frau|victoria|vitoria|alyss|sara|hana|sabr/i.test(v.name));
      if(prefer) return prefer;
    } else {
      const prefer = state.voices.find(v => /male|masc|man|jon|joao|joão|paulo|eduard|bruno|mateus|henri/i.test(v.name));
      if(prefer) return prefer;
    }
    // fallback pick alternate parity from current index
    return null;
  }

  // ---- speech control ----
  let utterances = [];
  function stopSpeech(){
    try{
      if(window.speechSynthesis) window.speechSynthesis.cancel();
    }catch(e){}
    utterances = [];
    setStatus('Parado.');
    // visual reset
    const btn = document.querySelector('#btn-tts');
    if(btn) btn.setAttribute('aria-pressed','false');
    removeHighlight();
  }

  function speakChunks(chunks){
    if(!chunks || !chunks.length) { setStatus('Nada para ler.'); return; }
    stopSpeech();
    setStatus('Lendo...');
    // choose voice
    const chosen = state.voices && state.voices.length ? state.voices[state.voiceIndex % state.voices.length] : null;
    chunks.forEach((c, idx) => {
      const u = new SpeechSynthesisUtterance(c);
      u.lang = chosen && chosen.lang ? chosen.lang : 'pt-BR';
      if(chosen) u.voice = chosen;
      u.rate = 1.0;
      u.onend = function(){
        if(idx === chunks.length - 1){
          setStatus('Leitura finalizada.');
          const btn = document.querySelector('#btn-tts');
          if(btn) btn.setAttribute('aria-pressed','false');
        }
      };
      u.onerror = function(e){
        console.warn('di tts err', e);
        setStatus('Erro TTS.');
      };
      utterances.push(u);
      speechSynthesis.speak(u);
    });
    const btn = document.querySelector('#btn-tts');
    if(btn) btn.setAttribute('aria-pressed','true');
  }

  function tryCustomTTS(text){
    try{
      if(typeof window.di_customTTS === 'function'){
        window.di_customTTS(text);
        setStatus('Lendo via TTS custom...');
        return true;
      }
      if(typeof window.KOB_TTS === 'function'){
        window.KOB_TTS(text);
        setStatus('Lendo via KOB_TTS...');
        return true;
      }
    }catch(e){}
    return false;
  }

  function speakText(text){
    text = safeTrim(text);
    if(!text) { setStatus('Nada selecionado.'); return; }
    if(tryCustomTTS(text)) return;
    const chunks = chunkText(text, CHUNK_SIZE);
    speakChunks(chunks);
  }

  // ---- selection helpers (iframe-aware) ----
  function getSelectionFromIframe(){
    try{
      const frame = document.querySelector(IFRAME_SEL);
      if(!frame) return '';
      const w = frame.contentWindow;
      const d = frame.contentDocument || (w && w.document);
      if(!d) return '';
      // focused input in iframe
      const af = d.activeElement;
      if(af && (af.tagName === 'TEXTAREA' || (af.tagName === 'INPUT' && af.type === 'text'))){
        if(typeof af.selectionStart === 'number'){
          const s = af.value.substring(af.selectionStart, af.selectionEnd).trim();
          if(s) return s;
        }
        return (af.value || '').trim();
      }
      // selection in iframe
      const sel = (w && w.getSelection) ? w.getSelection().toString() : (d.getSelection ? d.getSelection().toString() : '');
      return (sel || '').trim();
    }catch(e){
      // cross-origin or other
      return '';
    }
  }

  function getSelectionFromDoc(){
    try{
      const af = document.activeElement;
      if(af && (af.tagName === 'TEXTAREA' || (af.tagName === 'INPUT' && af.type === 'text'))){
        if(typeof af.selectionStart === 'number'){
          const s = af.value.substring(af.selectionStart, af.selectionEnd).trim();
          if(s) return s;
        }
        if(af.value && af.value.trim()) return af.value.trim();
      }
      const sel = window.getSelection ? window.getSelection().toString() : '';
      return (sel || '').trim();
    }catch(e){ return ''; }
  }

  function getSelectionBest(){
    const a = getSelectionFromIframe();
    if(a) return a;
    const b = getSelectionFromDoc();
    if(b) return b;
    // fallback known textareas
    const known = ['#srcText','#audioOutput'];
    for(const s of known){
      try{
        const el = document.querySelector(s);
        if(el && el.value && el.value.trim()) {
          if(typeof el.selectionStart === 'number'){
            const sel = el.value.substring(el.selectionStart, el.selectionEnd).trim();
            if(sel) return sel;
          }
          return el.value.trim();
        }
      }catch(e){}
    }
    return '';
  }

  // ---- highlight helpers ----
  function addHighlight(el){
    removeHighlight();
    if(!el) return;
    el.classList.add(HIGHLIGHT_CLASS);
    state.highlightEl = el;
    // remove after 6s
    setTimeout(()=> removeHighlight(), 6000);
  }
  function removeHighlight(){
    if(state.highlightEl){
      try{ state.highlightEl.classList.remove(HIGHLIGHT_CLASS); }catch(e){}
      state.highlightEl = null;
    }
  }

  // ---- click-to-speak global handler (when mode active) ----
  function onGlobalClick(ev){
    // if not active do nothing
    if(!state.active) return;
    // ignore clicks on controls / hud / dock / symbolbar / fab / outlines
    if(ev.target.closest(SELECTOR_DOCK) || ev.target.closest('#symbolBar') || ev.target.closest('#fab') || ev.target.closest('.menu') || ev.target.closest('#kob-tts-outline')) return;
    // if click was on a button we ignore (unless it's our special ones handled elsewhere)
    if(ev.target.tagName === 'BUTTON') return;

    // priority: selection
    const sel = getSelectionBest();
    if(sel){
      speakText(sel);
      setStatus('Lendo seleção...');
      return;
    }

    // else read closest logical container
    const container = ev.target.closest('article, section, details, div, p, li, td, blockquote') || ev.target;
    if(!container) return;
    const text = safeTrim(container.innerText || container.textContent || '');
    if(!text) { setStatus('Elemento sem texto.'); return; }
    addHighlight(container);
    speakText(text);
  }
  document.addEventListener('click', onGlobalClick, true);

  // ---- button handlers ----
  // tts toggle btn (sync with FAB if present)
  function toggleTTS(){
    state.active = !state.active;
    const btn = document.querySelector('#btn-tts');
    if(btn) btn.setAttribute('aria-pressed', state.active ? 'true' : 'false');
    // also toggle fab btn if exists
    const fabBtn = document.querySelector('#btn-tts');
    if(fabBtn) fabBtn.setAttribute('aria-pressed', state.active ? 'true' : 'false');
    setStatus(state.active ? 'Modo TTS ativado' : 'Modo TTS desativado');
  }

  // speak selection immediate
  function handleSpeakSelection(){
    // if speaking, stop
    if(window.speechSynthesis && window.speechSynthesis.speaking){
      stopSpeech();
      return;
    }
    const sel = getSelectionBest();
    if(sel){
      speakText(sel);
      return;
    }
    // fallback: read srcText or focused element text
    const src = document.querySelector('#srcText');
    if(src && src.value && src.value.trim()){
      speakText(src.value.trim());
      return;
    }
    setStatus('Selecione um texto ou clique em um container.');
  }

  // previous / play / next (hooks para sua lógica - se você já tem handlers, vamos chamá-los)
  function handlePrev(){
    setStatus('Anterior (hook).');
    if(typeof window.di_handlePrev === 'function') window.di_handlePrev();
    else if(typeof window.handlePrev === 'function') window.handlePrev();
  }
  function handlePlay(){
    setStatus('Play/Pause (hook).');
    if(typeof window.di_handlePlay === 'function') window.di_handlePlay();
    else if(typeof window.handlePlay === 'function') window.handlePlay();
  }
  function handleNext(){
    setStatus('Próximo (hook).');
    if(typeof window.di_handleNext === 'function') window.di_handleNext();
    else if(typeof window.handleNext === 'function') window.handleNext();
  }

  // open all <details>
  function handleOpenAll(){
    const details = Array.from(document.querySelectorAll('details'));
    details.forEach(d => d.open = true);
    setStatus('Todos detalhes abertos.');
  }

  // outline / grid: build simple outline of headings for click-to-speak
  function toggleOutline(){
    state.gridActive = !state.gridActive;
    const containerId = 'kob-tts-outline';
    let out = document.getElementById(containerId);
    if(!state.gridActive){
      if(out) out.innerHTML = '';
      setStatus('Outline desativado.');
      return;
    }
    // build outline items
    if(!out){
      out = document.createElement('div');
      out.id = containerId;
      document.body.appendChild(out);
    } else {
      out.innerHTML = '';
    }
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,article > h1, article > h2, section > h1'));
    if(!headings.length){
      setStatus('Nenhum título encontrado para outline.');
      return;
    }
    headings.forEach((h, i) => {
      const item = document.createElement('div');
      item.className = 'kob-tts-outline-item';
      item.textContent = (h.innerText || h.textContent || '').slice(0, 60);
      item.title = 'Clicar para ler essa seção';
      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const el = h.closest('section,article,div') || h;
        addHighlight(el);
        speakText(el.innerText || el.textContent || h.innerText);
      });
      out.appendChild(item);
    });
    setStatus('Outline ativado. Clique nos títulos à esquerda.');
  }

  // voice cycle / longpress gender toggle
  let longpressTimer = null;
  function cycleVoice(){
    if(!state.voices || !state.voices.length){ setStatus('Sem vozes carregadas.'); return; }
    state.voiceIndex = (state.voiceIndex + 1) % state.voices.length;
    const v = state.voices[state.voiceIndex];
    setStatus('Voz: ' + (v ? (v.name + ' · ' + v.lang) : 'n/a'));
  }
  function toggleVoiceGender(){
    // heuristic: try to find opposite gender voice and set it
    const current = state.voices && state.voices[state.voiceIndex];
    const tryGender = current && /female|fem|woman|frau|victoria|vitoria|alyss|sara|hana|sabr/i.test(current.name) ? 'male' : 'female';
    const alt = findVoiceByGender(tryGender);
    if(alt){
      const idx = state.voices.indexOf(alt);
      if(idx >= 0) state.voiceIndex = idx;
      setStatus('Voz ajustada: ' + alt.name);
    } else {
      setStatus('Não foi possível alternar gênero (heurística).');
    }
  }

  // attach dock button events
  function attachDockListeners(){
    const bTts = document.querySelector('#btn-tts');
    if(bTts){
      bTts.addEventListener('click', (e)=>{ e.preventDefault(); toggleTTS(); });
    }
    const bSel = document.querySelector('#btn-tts-sel');
    if(bSel){
      bSel.addEventListener('click', (e)=>{ e.preventDefault(); handleSpeakSelection(); });
    }
    const bStop = document.querySelector('#btn-tts-stop');
    if(bStop){
      bStop.addEventListener('click', (e)=>{ e.preventDefault(); stopSpeech(); });
    }
    const bPrev = document.querySelector('#btn-prev');
    if(bPrev) bPrev.addEventListener('click', (e)=>{ e.preventDefault(); handlePrev(); });
    const bPlay = document.querySelector('#btn-play');
    if(bPlay) bPlay.addEventListener('click', (e)=>{ e.preventDefault(); handlePlay(); });
    const bNext = document.querySelector('#btn-next');
    if(bNext) bNext.addEventListener('click', (e)=>{ e.preventDefault(); handleNext(); });
    const bOpenAll = document.querySelector('#tts-openall');
    if(bOpenAll) bOpenAll.addEventListener('click', (e)=>{ e.preventDefault(); handleOpenAll(); });

    const bGrid = document.querySelector('#tts-grid');
    if(bGrid) bGrid.addEventListener('click', (e)=>{ e.preventDefault(); toggleOutline(); });

    const bArch = document.querySelector('#btn-arch');
    if(bArch){
      bArch.addEventListener('click', (e)=>{
        e.preventDefault();
        cycleVoice();
      });
      // longpress for gender toggle
      bArch.addEventListener('mousedown', ()=>{
        longpressTimer = setTimeout(()=>{
          toggleVoiceGender();
          longpressTimer = null;
        }, LONGPRESS_MS);
      });
      ['mouseup','mouseleave','blur','mouseout'].forEach(evt => {
        bArch.addEventListener(evt, ()=>{
          if(longpressTimer){ clearTimeout(longpressTimer); longpressTimer = null; }
        });
      });
    }
  }
  attachDockListeners();

  // ---- expose useful functions to global namespace ----
  window.di_getSelectionText = getSelectionBest;
  window.di_speakText = speakText;
  window.di_stopSpeech = stopSpeech;
  window.di_toggleTTS = toggleTTS;
  window.di_openAllDetails = handleOpenAll;
  window.di_toggleOutline = toggleOutline;
  window.di_cycleVoice = cycleVoice;
  window.di_refreshVoices = refreshVoices;

  // ---- keyboard shortcuts ----
  document.addEventListener('keydown', function(e){
    // Ctrl+Shift+S -> read selection
    if(e.ctrlKey && e.shiftKey && e.code === 'KeyS'){ e.preventDefault(); handleSpeakSelection(); }
    // Esc -> stop
    if(e.key === 'Escape'){ stopSpeech(); }
  });

  // ---- final status ----
  setStatus('Dock TTS atualizado — pronto.');
  console.info('di_tts_dock_plus initialized');
})();