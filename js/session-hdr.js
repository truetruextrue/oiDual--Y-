document.addEventListener('DOMContentLoaded', () => {
  // Inicializa todas as janelas presentes na página
  document.querySelectorAll('.session').forEach(initSessionWindow);
});

function initSessionWindow(sessionEl) {
  // Evita inicializar a mesma janela duas vezes
  if (sessionEl.dataset.initialized) return;
  sessionEl.dataset.initialized = 'true';

  const btnMin = sessionEl.querySelector('[data-act="min"]');
  const btnRef = sessionEl.querySelector('[data-act="ref"]');
  const btnClose = sessionEl.querySelector('[data-act="close"]');
  const iframe = sessionEl.querySelector('.frame-content');
  const handle = sessionEl.querySelector('.frame-resize');

  // 1. Minimizar
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      sessionEl.classList.toggle('min');
    });
  }

  // 2. Recarregar
  if (btnRef && iframe) {
    btnRef.addEventListener('click', () => {
      try {
        // Tenta recarregar preservando o histórico interno do iframe
        iframe.contentWindow.location.reload();
      } catch (e) {
        // Fallback seguro caso o conteúdo seja de outro domínio (CORS)
        iframe.src = iframe.src;
      }
    });
  }

  // 3. Fechar
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      // Remove o elemento do HTML
      sessionEl.remove(); 
    });
  }

  // 4. Redimensionar Altura
  if (iframe && handle) {
    let startY = 0, startH = 0, dragging = false;

    function onPointerDown(ev) {
      dragging = true;
      startY = ev.clientY;
      startH = iframe.offsetHeight;
      try { handle.setPointerCapture(ev.pointerId); } catch (e) {}
      
      // MELHORIA: Evita que o iframe "roube" o evento de mouse durante o arraste
      iframe.style.pointerEvents = 'none'; 
    }

    function onPointerMove(ev) {
      if (!dragging) return;
      const dy = ev.clientY - startY;
      iframe.style.height = Math.max(120, startH + dy) + 'px';
    }

    function onStop() {
      if (!dragging) return;
      dragging = false;
      // Devolve a interatividade para o iframe
      iframe.style.pointerEvents = 'auto'; 
    }

    handle.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onStop);
    window.addEventListener('pointercancel', onStop);
  }
}
