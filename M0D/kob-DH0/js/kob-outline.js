
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
