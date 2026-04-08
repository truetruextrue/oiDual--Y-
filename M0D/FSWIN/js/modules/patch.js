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