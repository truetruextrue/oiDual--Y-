/* ============================================================
   SAFE AREA AUTO-TOGGLE
   Detecta estado das janelas e alterna entre imersivo / seguro
============================================================ */

(() => {
  const body = document.body;

  const hasMaximizedWindow = () =>
    !!document.querySelector('.session-window.maximized');

  const hasPeekedWindow = () =>
    !!document.querySelector('.session-window.peeked');

  const syncShellMode = () => {
    const maximized = hasMaximizedWindow();
    const peeked = hasPeekedWindow();

    body.classList.toggle('ui-immersive', !maximized && !peeked);
    body.classList.toggle('ui-safe-vertical', maximized || peeked);
  };

  const observeWindows = () => {
    const windows = document.querySelectorAll('.session-window');

    windows.forEach((win) => {
      const mo = new MutationObserver(syncShellMode);
      mo.observe(win, {
        attributes: true,
        attributeFilter: ['class']
      });
    });
  };

  const boot = () => {
    syncShellMode();
    observeWindows();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener('resize', syncShellMode);
  window.addEventListener('orientationchange', syncShellMode);
})();

let windowCounter = 3;
    let clickTimers = {}; // Para diferenciar 1 click de 2 clicks no header

    // Função para calcular a posição de janelas maximizadas que estão colapsadas/peeked no topo
    function updateMaximizedStacks() {
      const maxWins = Array.from(document.querySelectorAll('.session-window.maximized'));
      let currentTop = 0;
      
      // Ordena pelo z-index para empilhar visualmente na ordem correta
      maxWins.sort((a, b) => (parseInt(a.style.zIndex) || 1) - (parseInt(b.style.zIndex) || 1));

      maxWins.forEach(win => {
        if (win.classList.contains('collapsed') || win.classList.contains('peeked')) {
          win.style.top = currentTop + 'px';
          // Adiciona a altura ao acumulador para a próxima janela empilhar embaixo
          if (win.classList.contains('collapsed')) currentTop += 52;
          else if (win.classList.contains('peeked')) currentTop += 87;
        } else {
          // Se for uma janela maximizada inteira (full screen), reseta o topo e cobre as outras
          win.style.top = '0px';
          currentTop = 0; 
        }
      });

      // Reseta o top para as janelas que não estão maximizadas (voltam pro fluxo normal)
      document.querySelectorAll('.session-window:not(.maximized)').forEach(win => {
         win.style.top = '';
      });
    }

    // Lida com o clique no header (1 clique = Peek, 2 cliques = Maximizar)
    function handleHeaderClick(e, winId) {
      // Ignora se o clique foi diretamente nos botões de controle
      if (e.target.closest('.win-controls')) return;
      
      if (!clickTimers[winId]) {
        clickTimers[winId] = setTimeout(() => {
          delete clickTimers[winId];
          togglePeek(winId); // Ação de 1 clique
        }, 250); // Aguarda 250ms para ver se vem um segundo clique
      } else {
        clearTimeout(clickTimers[winId]);
        delete clickTimers[winId];
        toggleMaximize(winId); // Ação de 2 cliques
      }
    }

    function togglePeek(winId) {
      const win = document.getElementById(winId);
      win.classList.toggle('peeked');
      win.classList.remove('collapsed');
      updateMaximizedStacks();
    }

    function toggleCollapse(winId) {
      const win = document.getElementById(winId);
      win.classList.toggle('collapsed');
      win.classList.remove('peeked');
      updateMaximizedStacks();
    }

    function toggleMaximize(winId) {
      const win = document.getElementById(winId);
      win.classList.toggle('maximized');
      
      // Traz a janela maximizada para a frente
      if(win.classList.contains('maximized')) {
        document.querySelectorAll('.session-window').forEach(w => w.style.zIndex = '1');
        win.style.zIndex = '99999';
      } else {
        win.style.zIndex = '1';
      }
      updateMaximizedStacks();
    }

    function minimizeToDock(winId, icon) {
      const win = document.getElementById(winId);
      win.classList.add('minimized');
      win.classList.remove('maximized', 'collapsed', 'peeked');
      updateMaximizedStacks();

      // Create dock icon
      const dock = document.getElementById('dock');
      const bubble = document.createElement('div');
      bubble.className = 'dock-bubble';
      bubble.innerHTML = icon || '📄';
      bubble.title = 'Restore Window';
      bubble.id = `dock-${winId}`;
      
      // Restore action
      bubble.onclick = () => {
        win.classList.remove('minimized');
        bubble.remove();
        updateMaximizedStacks();
        
        // Scroll to window
        win.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };

      dock.appendChild(bubble);
    }

   
      
      wrap.insertAdjacentHTML('beforeend', winHTML);
      const newWin = document.getElementById(winId);
      newWin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
