
// ========== PATCH: ORB, SNAP & DRAG MANAGER ==========
(function() {
  // --- referências globais (aproveita seu estado)
  const activeSessions = window.activeSessions || []; // se existir
  let stackWrap = document.getElementById('stack-wrap');
  let orbStack = document.getElementById('orb-stack');

  // cria container de orbes se não existir
  if (!orbStack) {
    orbStack = document.createElement('div');
    orbStack.id = 'orb-stack';
    document.body.appendChild(orbStack);
  }

  // --- funções novas (sem conflitar com as suas)
  window.convertToOrb = function(sid) {
    const s = (window.activeSessions || []).find(x => x.sid === sid);
    if (s) {
      s.status = 'orb';
      if (typeof window.renderStack === 'function') window.renderStack();
      if (typeof window.saveState === 'function') window.saveState();
    }
  };

  window.restoreFromOrb = function(sid) {
    const s = (window.activeSessions || []).find(x => x.sid === sid);
    if (s && s.status === 'orb') {
      s.status = 'active';
      if (typeof window.renderStack === 'function') window.renderStack();
      if (typeof window.saveState === 'function') window.saveState();
    }
  };

  // Renderiza os orbes laterais (deve ser chamada sempre que o stack mudar)
  window.renderOrbStack = function() {
    if (!orbStack) return;
    orbStack.innerHTML = '';
    const orbs = (window.activeSessions || []).filter(s => s.status === 'orb');
    orbs.forEach(s => {
      const bubble = document.createElement('div');
      bubble.className = 'orb-bubble';
      bubble.innerHTML = `<i class="fa-solid ${s.icon || 'fa-circle'}"></i>`;
      bubble.title = s.name;
      bubble.onclick = (e) => {
        e.stopPropagation();
        window.restoreFromOrb(s.sid);
      };
      orbStack.appendChild(bubble);
    });
  };

  // sobrescreve a função renderStack original para incluir o renderOrbStack
  const originalRenderStack = window.renderStack;
  if (originalRenderStack) {
    window.renderStack = function() {
      originalRenderStack();
      window.renderOrbStack();
    };
  } else {
    // fallback
    window.renderStack = function() {
      if (typeof window.originalRenderStack === 'function') window.originalRenderStack();
      window.renderOrbStack();
    };
  }

  // --- Drag Manager Universal (suporta .session-window e .symbol-bar)
  class DragManager {
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
      // não atrapalha cliques em controles
      if (e.target.closest('.win-controls, .win-hdr button, .symbol-button')) return;
      e.preventDefault();
      this.active = el;
      const rect = el.getBoundingClientRect();
      this.startX = e.clientX - rect.left;
      this.startY = e.clientY - rect.top;
      el.style.position = 'fixed';
      el.style.left = rect.left + 'px';
      el.style.top = rect.top + 'px';
      el.style.right = 'auto';
      el.style.margin = '0';
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

      // snap lateral
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

      // snap superior (horizontal)
      if (top <= threshold) {
        top = 0;
        el.classList.add('snap-top');
      } else {
        el.classList.remove('snap-top');
      }

      // aplica posição
      el.style.left = Math.max(0, left) + 'px';
      el.style.top = Math.max(0, top) + 'px';

      // salva posição no session (se for janela)
      if (el.classList.contains('session-window') && window.activeSessions) {
        const sid = el.id;
        const s = window.activeSessions.find(x => x.sid === sid);
        if (s) s.pos = { left: parseFloat(el.style.left), top: parseFloat(el.style.top) };
        if (typeof window.saveState === 'function') window.saveState();
      }
    }
  }

  // inicializa após o DOM carregar
  window.addEventListener('DOMContentLoaded', () => {
    new DragManager('.session-window');
    new DragManager('.symbol-bar');
    window.renderOrbStack(); // garante orbes na primeira carga
  });

})();

