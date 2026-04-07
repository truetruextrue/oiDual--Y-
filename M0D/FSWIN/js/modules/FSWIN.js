function setSessionWindowState(el, state) {
      el.classList.remove('collapsed', 'peeked');
      if (state === 'collapsed') el.classList.add('collapsed');
      if (state === 'peeked') el.classList.add('peeked');
      el.dataset.windowState = state;
    }

    // Clique no card: normal -> 78px -> colapsado -> 78px -> normal
    function cycleSessionWindow(id) {
      const el = document.getElementById(id);
      if (!el || el.classList.contains('minimized') || el.classList.contains('maximized')) return;

      const step = Number(el.dataset.cardCycle || '0');
      const next = (step + 1) % 4;
      el.dataset.cardCycle = String(next);

      if (next === 0) {
        setSessionWindowState(el, 'normal');
      } else if (next === 1 || next === 3) {
        setSessionWindowState(el, 'peeked');
      } else if (next === 2) {
        setSessionWindowState(el, 'collapsed');
      }
    }

    // Botão de colapsar: mantém a função original
    function toggleCollapse(id) {
      const el = document.getElementById(id);
      if (!el) return;

      if (el.classList.contains('maximized')) {
        el.classList.remove('maximized');
      }

      const willCollapse = !el.classList.contains('collapsed');
      setSessionWindowState(el, willCollapse ? 'collapsed' : 'normal');
      el.dataset.cardCycle = willCollapse ? '2' : '0';
    }

    // Maximizar
    function toggleMaximize(id) {
      const el = document.getElementById(id);
      if (!el) return;

      if (el.classList.contains('collapsed') || el.classList.contains('peeked')) {
        setSessionWindowState(el, 'normal');
        el.dataset.cardCycle = '0';
      }

      el.classList.toggle('maximized');
      if (!el.classList.contains('maximized') && !el.classList.contains('collapsed') && !el.classList.contains('peeked')) {
        el.dataset.cardCycle = '0';
      }
    }

    // Minimizar (Envia pro Dock)
    function minimizeWindow(id) {
      const el = document.getElementById(id);
      if (!el) return;

      el.classList.add('minimized');

      const dock = document.getElementById('dock');
      
      const bubble = document.createElement('div');
      bubble.className = 'dock-bubble';
      bubble.innerText = '🌐';
      bubble.title = "Restaurar Iframe";

      bubble.onclick = () => {
        el.classList.remove('minimized');
        bubble.remove();
      };

      dock.appendChild(bubble);
    }
