//<script>
// ========== PATCH: ORB, SNAP & DRAG MANAGER ==========
(function() {
  // Cria container de orbes se não existir
  if (!document.getElementById('orb-stack')) {
    const orbStack = document.createElement('div');
    orbStack.id = 'orb-stack';
    document.body.appendChild(orbStack);
  }

  // --- Funções de ORB (para janela principal e possíveis futuras) ---
  window.convertToOrb = function(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.classList.contains('orb')) return;
    win.classList.add('orb');
    // Remove minimizado/maximizado
    win.classList.remove('minimized', 'maximized');
    // Salva referência no estado local (opcional)
    win.dataset.wasActive = 'true';
    // Adiciona ao stack de orbes
    addToOrbStack(win);
  };

  window.restoreFromOrb = function(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('orb');
    // Remove do stack visual
    removeFromOrbStack(winId);
    // Se tinha posição salva, restaura (opcional)
    if (win.dataset.lastPos) {
      const { left, top } = JSON.parse(win.dataset.lastPos);
      win.style.transform = `translate(${left}px, ${top}px)`;
    }
  };

  function addToOrbStack(win) {
    const stack = document.getElementById('orb-stack');
    const existing = stack.querySelector(`[data-win-id="${win.id}"]`);
    if (existing) return;
    const bubble = document.createElement('div');
    bubble.className = 'orb-bubble';
    bubble.setAttribute('data-win-id', win.id);
    bubble.innerHTML = win.querySelector('.window-title')?.innerText?.[0] || '◉';
    bubble.title = win.querySelector('.window-title')?.innerText || 'Janela';
    bubble.onclick = (e) => {
      e.stopPropagation();
      restoreFromOrb(win.id);
    };
    stack.appendChild(bubble);
  }

  function removeFromOrbStack(winId) {
    const stack = document.getElementById('orb-stack');
    const bubble = stack.querySelector(`[data-win-id="${winId}"]`);
    if (bubble) bubble.remove();
  }

  // --- Adiciona botão de ORB nos controles da janela principal ---
  const winControls = document.querySelector('.ui-window .window-controls');
  if (winControls) {
    const orbBtn = document.createElement('button');
    orbBtn.type = 'button';
    orbBtn.className = 'win-btn orb-btn';
    orbBtn.style.background = '#b77eff';
    orbBtn.style.width = '12px';
    orbBtn.style.height = '12px';
    orbBtn.style.borderRadius = '50%';
    orbBtn.title = 'Orb lateral';
    orbBtn.onclick = (e) => {
      e.stopPropagation();
      convertToOrb('main-app');
    };
    winControls.appendChild(orbBtn);
  }

  // --- Drag Manager Universal (janelas + symbol-bar) com snap ---
  class UniversalDragManager {
    constructor(selector) {
      this.elements = document.querySelectorAll(selector);
      this.active = null;
      this.startX = 0; this.startY = 0;
      this.initLeft = 0; this.initTop = 0;
      this.boundMove = this.move.bind(this);
      this.boundUp = this.up.bind(this);
      this.elements.forEach(el => el.addEventListener('pointerdown', this.down.bind(this, el)));
    }
    down(el, e) {
      // Ignora cliques em botões de controle
      if (e.target.closest('.win-btn, .symbol-button, .orb-container, .btn-cyber')) return;
      if (el.classList.contains('orb')) return; // orbes não são arrastáveis
      e.preventDefault();
      this.active = el;
      const rect = el.getBoundingClientRect();
      this.startX = e.clientX - rect.left;
      this.startY = e.clientY - rect.top;
      el.style.position = 'fixed';
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.right = 'auto';
      el.style.transform = 'none';
      el.classList.add('dragging');
      window.addEventListener('pointermove', this.boundMove);
      window.addEventListener('pointerup', this.boundUp);
    }
    move(e) {
      if (!this.active) return;
      let left = e.clientX - this.startX;
      let top = e.clientY - this.startY;
      this.active.style.left = left + 'px';
      this.active.style.top = top + 'px';
    }
    up(e) {
      if (!this.active) return;
      this.active.classList.remove('dragging');
      this.snapToEdge(this.active);
      this.savePosition(this.active);
      this.active = null;
      window.removeEventListener('pointermove', this.boundMove);
      window.removeEventListener('pointerup', this.boundUp);
    }
    snapToEdge(el) {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = rect.left;
      let top = rect.top;
      const threshold = 70;

      // Snap lateral
      if (left <= threshold) {
        left = 0;
        el.classList.add('snap-side');
        el.classList.remove('snap-side-right', 'snap-top');
      } else if (rect.right >= vw - threshold) {
        left = vw - rect.width;
        el.classList.add('snap-side-right');
        el.classList.remove('snap-side', 'snap-top');
      } else {
        el.classList.remove('snap-side', 'snap-side-right');
      }

      // Snap superior
      if (top <= threshold) {
        top = 0;
        el.classList.add('snap-top');
      } else {
        el.classList.remove('snap-top');
      }

      // Aplica posição
      el.style.left = Math.max(0, left) + 'px';
      el.style.top = Math.max(0, top) + 'px';

      // Para janelas que usam transform, atualiza transform
      if (el.classList.contains('ui-window')) {
        el.style.transform = `translate(${el.style.left}, ${el.style.top})`;
      }
    }
    savePosition(el) {
      if (el.classList.contains('ui-window')) {
        const left = parseFloat(el.style.left);
        const top = parseFloat(el.style.top);
        if (!isNaN(left) && !isNaN(top)) {
          localStorage.setItem('kodux_main_pos', JSON.stringify({ x: left, y: top }));
        }
      }
    }
  }

  // Inicializa após o DOM
  window.addEventListener('DOMContentLoaded', () => {
    new UniversalDragManager('.ui-window');
    new UniversalDragManager('.symbol-bar');
  });

})();
//</script>
