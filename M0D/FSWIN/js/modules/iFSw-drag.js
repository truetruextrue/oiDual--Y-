(() => {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const cssNum = (name, fallback = 0) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  class IOSBottomSheet {
    constructor(el) {
      this.el = el;
      this.hdr = el.querySelector('.win-hdr');
      this.frame = el.querySelector('.win-frame');

      this.y = 0;
      this.v = 0;
      this.raf = 0;
      this.dragging = false;
      this.pointerId = null;

      this.onMove = this.onMove.bind(this);
      this.onUp = this.onUp.bind(this);

      this.install();
      this.resize();
      this.go('collapsed', false);

      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.visualViewport?.addEventListener('resize', () => this.resize(), { passive: true });
    }

    install() {
      this.el.classList.add('bottom-sheet');
      this.el.dataset.state = this.el.dataset.state || 'collapsed';

      this.hdr?.addEventListener('pointerdown', (e) => this.onDown(e));
      this.hdr?.addEventListener('click', (e) => {
        if (this.dragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }

    resize() {
      // Recalculate after layout
      const rect = this.el.getBoundingClientRect();
      this.sheetH = rect.height || Math.max(240, window.innerHeight - cssNum('--topbar-h', 58));

      this.peekH = cssNum('--sheet-peek-h', cssNum('--peek-h', 240));
      this.collapsedH = cssNum('--sheet-collapsed-h', cssNum('--collapsed-h', 52));

      this.positions = {
        full: 0,
        peek: Math.max(0, this.sheetH - this.peekH),
        collapsed: Math.max(0, this.sheetH - this.collapsedH),
      };

      this.y = clamp(this.y, 0, this.positions.collapsed);
      this.setY(this.y);
    }

    onDown(e) {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('button, a, input, textarea, select, [data-no-drag]')) return;

      this.dragging = true;
      this.el.classList.add('dragging');
      this.pointerId = e.pointerId;

      this.hdr.setPointerCapture?.(e.pointerId);

      this.startY = e.clientY;
      this.startSheetY = this.y;
      this.lastMoveT = performance.now();
      this.lastMoveY = e.clientY;
      this.v = 0;

      cancelAnimationFrame(this.raf);

      window.addEventListener('pointermove', this.onMove, { passive: false });
      window.addEventListener('pointerup', this.onUp, { passive: true });
      window.addEventListener('pointercancel', this.onUp, { passive: true });

      e.preventDefault();
    }

    onMove(ev) {
      if (!this.dragging || ev.pointerId !== this.pointerId) return;
      ev.preventDefault();

      const dy = ev.clientY - this.startY;
      let next = this.startSheetY + dy;
      const max = this.positions.collapsed;

      // Resistance at extremes
      if (next < 0) next *= 0.35;
      if (next > max) next = max + (next - max) * 0.35;

      const now = performance.now();
      const dt = Math.max(1, now - this.lastMoveT);
      this.v = (ev.clientY - this.lastMoveY) / dt; // px/ms

      this.lastMoveT = now;
      this.lastMoveY = ev.clientY;

      this.setY(next);
    }

    onUp() {
      if (!this.dragging) return;

      this.dragging = false;
      this.el.classList.remove('dragging');

      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      window.removeEventListener('pointercancel', this.onUp);

      const vy = this.v * 1000; // px/s
      const y = this.y;
      const { full, peek, collapsed } = this.positions;

      let target = 'peek';

      if (vy < -850) {
        target = y < (peek + full) / 2 ? 'full' : 'peek';
      } else if (vy > 850) {
        target = y > (peek + collapsed) / 2 ? 'collapsed' : 'peek';
      } else {
        const dFull = Math.abs(y - full);
        const dPeek = Math.abs(y - peek);
        const dColl = Math.abs(y - collapsed);
        target = ['full', 'peek', 'collapsed'][[dFull, dPeek, dColl].indexOf(Math.min(dFull, dPeek, dColl))];
      }

      this.go(target, true);
    }

    syncClasses(state) {
      this.el.classList.toggle('peeked', state === 'peek');
      this.el.classList.toggle('collapsed', state === 'collapsed');
      this.el.classList.toggle('maximized', state === 'full');
      this.el.dataset.state = state;
    }

    setY(y) {
      this.y = y;
      this.el.style.setProperty('--sheet-y', `${y.toFixed(2)}px`);

      // live state sync while dragging
      if (Math.abs(y - this.positions.full) < 1) this.syncClasses('full');
      else if (Math.abs(y - this.positions.peek) < 1) this.syncClasses('peek');
      else if (Math.abs(y - this.positions.collapsed) < 1) this.syncClasses('collapsed');
    }

    go(state, animate = true) {
      this.syncClasses(state);
      const target = this.positions[state];

      if (!animate) {
        this.setY(target);
        return;
      }

      this.animateTo(target);
    }

    animateTo(target) {
      cancelAnimationFrame(this.raf);

      let x = this.y;
      let v = 0;

      const stiffness = 0.14;
      const damping = 0.82;

      const step = () => {
        const a = (target - x) * stiffness;
        v = (v + a) * damping;
        x += v;

        if (Math.abs(target - x) < 0.35 && Math.abs(v) < 0.35) {
          this.setY(target);
          return;
        }

        this.setY(x);
        this.raf = requestAnimationFrame(step);
      };

      this.raf = requestAnimationFrame(step);
    }
  }

  window.BottomSheet = IOSBottomSheet;

  function boot() {
    document.querySelectorAll('.session-window').forEach((el) => {
      if (el.dataset.sheetInit === '1') return;
      el.dataset.sheetInit = '1';
      new IOSBottomSheet(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();