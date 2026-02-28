
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
