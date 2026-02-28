
(()=>{ 'use strict';
  if(window.__KOBLLUX_CORE_INTEGRATOR_V1__) return;
  window.__KOBLLUX_CORE_INTEGRATOR_V1__ = true;

  // 1. Sincronização Segura do Ciclo de Vida (Builder -> DOM -> TTS -> UI)
  const hookAutoBuild = (fnName) => {
    if(typeof window[fnName] === 'function' && !window[fnName].__integrated){
      const orig = window[fnName];
      window[fnName] = function(...args){
        const res = orig.apply(this, args);
        setTimeout(()=>{
          // Força o KOBLLUX TTS v32/v2 a reindexar os novos blocos
          if(window.KOBLLUX_TTS && typeof window.KOBLLUX_TTS.rebuild === 'function'){
            window.KOBLLUX_TTS.rebuild();
          }
          // Garante que o KaTeX rode novamente no novo contexto
          if(window.ACTIONS && typeof window.ACTIONS.katex === 'function'){
            window.ACTIONS.katex();
          }
          // Dispara evento global para listeners desacoplados
          window.dispatchEvent(new CustomEvent('KOBLLUX_CONTENT_RENDERED'));
        }, 150);
        return res;
      };
      window[fnName].__integrated = true;
    }
  };

  hookAutoBuild('autoBuild');
  hookAutoBuild('autoBuildNested');

  // 2. Integração HUD (Smart HUD) com o Tema de Voz (Voice Theme Patch)
  window.addEventListener('KOB_VOICE_COLOR', (e) => {
    if(e.detail && e.detail.color && e.detail.id){
      const hudStatus = document.getElementById('hudStatus');
      const voiceInd = document.querySelector('.voice-indicator');
      const symbolBar = document.getElementById('symbolBar');
      
      if(hudStatus) {
        hudStatus.textContent = String(e.detail.id).toUpperCase();
        hudStatus.style.color = e.detail.color.primary || '#fff';
      }
      
      if(voiceInd) {
        voiceInd.style.background = e.detail.color.primary;
        voiceInd.style.boxShadow = e.detail.color.glow || 'none';
      }

      if(symbolBar) {
        symbolBar.style.borderColor = e.detail.color.primary;
      }
    }
  });

  // 3. Bind do Botão de Arquétipo no HUD para Ciclar Vozes e Temas do Monólito
  const btnArch = document.getElementById('btn-arch');
  if(btnArch){
    btnArch.addEventListener('click', (e) => {
      e.preventDefault();
      // Tenta usar o ciclar do ARQ_ENGINE ou TTS_V32
      if(window.ARQ && typeof window.ARQ.cycle === 'function'){
        window.ARQ.cycle();
      }
      
      // Simula uma troca de voz forçada no TTS Dock
      const btnVoice = document.getElementById('tts-voice');
      if(btnVoice) {
        const ev = new PointerEvent('pointerup', { bubbles: true, cancelable: true });
        btnVoice.dispatchEvent(ev);
      }
    });
  }

  // 4. Delegação Segura de Play/Pause/Nav do HUD para o KOB_TTS
  const bindHUDControls = () => {
    const playBtn = document.getElementById('btn-play');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    if(playBtn) playBtn.addEventListener('click', () => {
      if(window.KOBLLUX_TTS && window.KOBLLUX_TTS.play) window.KOBLLUX_TTS.play();
      else if(document.getElementById('tts-on')) document.getElementById('tts-on').click();
    });

    if(prevBtn) prevBtn.addEventListener('click', () => {
      if(window.KOBLLUX_TTS && window.KOBLLUX_TTS.prev) window.KOBLLUX_TTS.prev();
      else if(document.getElementById('tts-prev')) document.getElementById('tts-prev').click();
    });

    if(nextBtn) nextBtn.addEventListener('click', () => {
      if(window.KOBLLUX_TTS && window.KOBLLUX_TTS.next) window.KOBLLUX_TTS.next();
      else if(document.getElementById('tts-next')) document.getElementById('tts-next').click();
    });
  };

  // 5. Observer de Limpeza (Impede Múltiplos Docks Injetados por Hot-Reload)
  const deduplicateUI = () => {
    const docks = document.querySelectorAll('.kob-tts-dock');
    if(docks.length > 1){
      for(let i = 1; i < docks.length; i++) docks[i].remove();
    }
    const outlines = document.querySelectorAll('#kob-tts-outline');
    if(outlines.length > 1){
      for(let i = 1; i < outlines.length; i++) outlines[i].remove();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bindHUDControls();
      deduplicateUI();
    });
  } else {
    bindHUDControls();
    deduplicateUI();
  }

  // Self-heal mutation observer para DOM injection dinâmico
  const mo = new MutationObserver((mutations) => {
    let shouldDedupe = false;
    mutations.forEach(m => {
      if(m.addedNodes.length > 0) shouldDedupe = true;
    });
    if(shouldDedupe) deduplicateUI();
  });
  mo.observe(document.body, { childList: true, subtree: false });

})();

