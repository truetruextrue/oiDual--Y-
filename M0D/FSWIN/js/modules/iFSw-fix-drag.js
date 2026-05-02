(() => {
  const MIN_W = 280;
  const MIN_H = 69;
  const EDGE_PAD = 10;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function getShellTop() {
    const topbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 58;
    const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
    return topbar + safeTop;
  }

  function getMaxW() {
    return window.innerWidth;
  }

  function getMaxH() {
    const top = getShellTop();
    return Math.max(220, window.innerHeight - top - EDGE_PAD);
  }

  function ensureHandles(win) {
    if (!win || win.dataset.ifswReady === '1') return;
    win.dataset.ifswReady = '1';

    if (!win.style.width) {
      win.style.width = '100%';
    }

    if (!win.style.height) {
      const currentH = win.getBoundingClientRect().height;
      if (currentH) win.style.height = `${currentH}px`;
    }

    if (!win.querySelector('.ifsw-handle-y')) {
      const hy = document.createElement('div');
      hy.className = 'ifsw-handle-y';
      hy.dataset.noDrag = '1';
      win.appendChild(hy);
      bindResizeY(win, hy);
    }

    if (!win.querySelector('.ifsw-handle-x')) {
      const hx = document.createElement('div');
      hx.className = 'ifsw-handle-x';
      hx.dataset.noDrag = '1';
      win.appendChild(hx);
      bindResizeX(win, hx);
    }

    if (!win.querySelector('.ifsw-handle-corner')) {
      const hc = document.createElement('div');
      hc.className = 'ifsw-handle-corner';
      hc.dataset.noDrag = '1';
      win.appendChild(hc);
      bindResizeCorner(win, hc);
    }
  }

  function setFreeMode(win) {
    win.classList.remove('collapsed', 'peeked', 'maximized');
    win.classList.add('resizing');
  }

  function finishResize(win) {
    win.classList.remove('resizing');
    if (typeof window.updateMaximizedStacks === 'function') {
      window.updateMaximizedStacks();
    }
    if (typeof window.syncShellMode === 'function') {
      window.syncShellMode();
    }
  }

  function bindResizeY(win, handle) {
  let active = false;
  let startY = 0;
  let startH = 0;
  let pid = null;

  handle.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    if (e.target.closest('button, a, input, textarea, select')) return;

    active = true;
    pid = e.pointerId;
    startY = e.clientY;
    startH = win.getBoundingClientRect().height;

    setFreeMode(win);
    handle.setPointerCapture?.(e.pointerId);
    e.preventDefault();

    const move = (ev) => {
      if (!active || ev.pointerId !== pid) return;
      ev.preventDefault();

      const dy = ev.clientY - startY;   // <- corrigido
      let nextH = startH + dy;

      const minH = MIN_H;               // <- menor
      const maxH = getMaxH();

      nextH = clamp(nextH, minH, maxH);

      win.style.height = `${nextH}px`;
      win.style.top = 'auto';
    };

    const up = (ev) => {
      if (ev && ev.pointerId !== pid) return;
      active = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      finishResize(win);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('pointercancel', up, { passive: true });
  }, { passive: false });
}

  function bindResizeX(win, handle) {
    let active = false;
    let startX = 0;
    let startW = 0;
    let pid = null;

    handle.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('button, a, input, textarea, select')) return;

      active = true;
      pid = e.pointerId;
      startX = e.clientX;
      startW = win.getBoundingClientRect().width;

      setFreeMode(win);
      handle.setPointerCapture?.(e.pointerId);
      e.preventDefault();

      const move = (ev) => {
        if (!active || ev.pointerId !== pid) return;
        e.preventDefault?.();

        const dx = ev.clientX - startX;
        let nextW = startW + dx;

        nextW = clamp(nextW, MIN_W, getMaxW());

        win.style.width = `${nextW}px`;
        win.style.maxWidth = 'none';
      };

      const up = (ev) => {
        if (ev && ev.pointerId !== pid) return;
        active = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        finishResize(win);
      };

      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', up, { passive: true });
    }, { passive: false });
  }

  function bindResizeCorner(win, handle) {
    let active = false;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;
    let pid = null;

    handle.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('button, a, input, textarea, select')) return;

      active = true;
      pid = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;

      setFreeMode(win);
      handle.setPointerCapture?.(e.pointerId);
      e.preventDefault();

      const move = (ev) => {
        if (!active || ev.pointerId !== pid) return;
        ev.preventDefault();

        const dx = ev.clientX - startX;
        const dy = startY - ev.clientY;

        let nextW = clamp(startW + dx, MIN_W, getMaxW());
        let nextH = clamp(startH + dy, MIN_H, getMaxH());

        win.style.width = `${nextW}px`;
        win.style.height = `${nextH}px`;
        win.style.maxWidth = 'none';
        win.style.top = 'auto';
      };

      const up = (ev) => {
        if (ev && ev.pointerId !== pid) return;
        active = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        finishResize(win);
      };

      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up, { passive: true });
      window.addEventListener('pointercancel', up, { passive: true });
    }, { passive: false });
  }

  function bootExisting() {
    document.querySelectorAll('.session-window').forEach(ensureHandles);
  }

  function observeFuture() {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.classList?.contains('session-window')) {
            ensureHandles(node);
          } else {
            node.querySelectorAll?.('.session-window').forEach(ensureHandles);
          }
        });
      }
    });

    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  function patchCreateSessionWindow() {
    const original = window.createSessionWindow;
    if (typeof original !== 'function') return;

    window.createSessionWindow = function patchedCreateSessionWindow(...args) {
      const id = original.apply(this, args);

      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) ensureHandles(el);
      });

      return id;
    };
  }

  function patchInit() {
    bootExisting();
    observeFuture();
    patchCreateSessionWindow();

    window.addEventListener('resize', () => {
      document.querySelectorAll('.session-window').forEach((win) => {
        if (win.classList.contains('minimized')) return;

        const maxW = getMaxW();
        const maxH = getMaxH();

        const rect = win.getBoundingClientRect();
        const w = clamp(rect.width, MIN_W, maxW);
        const h = clamp(rect.height, MIN_H, maxH);

        win.style.width = `${w}px`;
        win.style.height = `${h}px`;
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchInit, { once: true });
  } else {
    patchInit();
  }
})();