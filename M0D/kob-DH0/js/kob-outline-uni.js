
document.addEventListener('DOMContentLoaded', () => {

  const iframe = document.getElementById('frame');

  if (!iframe) return;

  function rebindTTS() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      if (!doc) return;

      console.log('🔁 Rebinding COBTTS...');

      // limpa estados antigos (se existir)
      if (window.kobTTS && typeof window.kobTTS.reset === 'function') {
        window.kobTTS.reset();
      }

      // fallback: remover classes antigas
      document.querySelectorAll('.kob-tts-active')
        .forEach(el => el.classList.remove('kob-tts-active'));

      // 🔥 aqui você reativa leitura no NOVO DOM
      if (window.kobInitTTS) {
        window.kobInitTTS(doc);
      }

      // fallback universal (caso não tenha API exposta)
      window.__kob_doc = doc;

    } catch (err) {
      console.warn('Erro no rebind:', err);
    }
  }

  // dispara quando iframe carrega nova página
  iframe.addEventListener('load', () => {
    setTimeout(rebindTTS, 120); // pequeno delay evita race condition
  });

});








document.addEventListener('DOMContentLoaded', () => {
  const iframe = document.getElementById('frame');
  if (!iframe) return;

  let boundDoc = null;

  function onDocClick(ev) {
    const selector = 'h1,h2,h3,p,li,blockquote,pre,td,th';
    const target = ev.target && ev.target.closest ? ev.target.closest(selector) : null;
    if (!target) return;

    // ignora cliques no HUD da página pai, caso a função seja reaproveitada
    if (target.closest && (target.closest('#symbolBar') || target.closest('.kob-tts-dock'))) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      // reindexa antes de achar o bloco
      if (window.KOBLLUX && typeof window.KOBLLUX.rebuildBlocks === 'function') {
        window.KOBLLUX.rebuildBlocks();
      }

      const blocks = [...doc.querySelectorAll(selector)].filter(n => (n.innerText || '').trim().length > 0);
      let idx = blocks.findIndex(b => b.isEqualNode && b.isEqualNode(target));

      if (idx < 0) {
        const ttext = (target.innerText || '').trim();
        idx = blocks.findIndex(b => (b.innerText || '').trim() === ttext);
      }

      if (idx >= 0 && window.KOBLLUX && window.KOBLLUX.state) {
        window.KOBLLUX.state.currentBlockIdx = idx;
      }

      if (window.KOBLLUX && typeof window.KOBLLUX.startSpeech === 'function') {
        const prefs = (window.StorageSafe && StorageSafe.get)
          ? StorageSafe.get('prefs', { outline: true, clickToSpeak: true })
          : { clickToSpeak: true };

        if (prefs.clickToSpeak) {
          window.KOBLLUX.state.isSpeaking = true;
          window.KOBLLUX.startSpeech();
        }
      }
    } catch (err) {
      console.warn('click-to-speak failed:', err);
    }
  }

  function onDocSelectionSpeak() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      const selected = String(doc.getSelection ? doc.getSelection() : window.getSelection());
      if (!selected || !selected.trim()) return;

      const text = selected.trim();
      if (window.KOBLLUX && typeof window.KOBLLUX.speakText === 'function') {
        window.KOBLLUX.speakText(text, {});
      }
    } catch (err) {
      console.warn('selection speak failed:', err);
    }
  }

  function bindIframeDoc() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || doc === boundDoc) return;

      boundDoc = doc;

      // remove listener antigo, se houver
      if (doc.__kobTtsClickBound) return;
      doc.__kobTtsClickBound = true;

      doc.addEventListener('click', onDocClick, { passive: true });
      doc.addEventListener('pointerup', onDocSelectionSpeak, { passive: true });

      console.log('KOBTTS click trigger bound ✓');
    } catch (err) {
      console.warn('bindIframeDoc failed:', err);
    }
  }

  function rebindAll() {
    if (window.KOBLLUX && typeof window.KOBLLUX.rebuildBlocks === 'function') {
      window.KOBLLUX.rebuildBlocks();
    }

    if (window.KOBLLUX && typeof window.KOBLLUX.updateArchetype === 'function') {
      try {
        window.KOBLLUX.updateArchetype(window.KOBLLUX.state?.archIdx || 0);
      } catch (e) {}
    }

    bindIframeDoc();
  }

  iframe.addEventListener('load', () => {
    setTimeout(rebindAll, 120);
  });

  bindIframeDoc();
});
