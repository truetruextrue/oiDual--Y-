(() => {
  const body = document.body;
  let windowCounter = 3;
  const clickTimers = {};

  const hasMaximizedWindow = () =>
    !!document.querySelector('.session-window.maximized:not(.minimized)');

  const hasPeekedWindow = () =>
    !!document.querySelector('.session-window.peeked:not(.minimized)');

  const syncShellMode = () => {
    const maximized = hasMaximizedWindow();
    const peeked = hasPeekedWindow();

    body.classList.toggle('ui-immersive', !maximized && !peeked);
    body.classList.toggle('ui-safe-vertical', maximized || peeked);
  };

  const syncShellModeManual = () => {
    syncShellMode();
  };

  const observeAll = () => {
    const mo = new MutationObserver(() => {
      syncShellMode();
    });

    mo.observe(document.body, {
      subtree: true,
      attributes: true,
      childList: true,
      attributeFilter: ['class']
    });
  };

  function updateMaximizedStacks() {
    const maxWins = Array.from(document.querySelectorAll('.session-window.maximized'));
    let currentTop = 0;

    maxWins.sort((a, b) => (parseInt(a.style.zIndex) || 1) - (parseInt(b.style.zIndex) || 1));

    maxWins.forEach(win => {
      if (win.classList.contains('collapsed') || win.classList.contains('peeked')) {
        win.style.top = currentTop + 'px';
        if (win.classList.contains('collapsed')) currentTop += 52;
        else if (win.classList.contains('peeked')) currentTop += 87;
      } else {
        win.style.top = '0px';
        currentTop = 0;
      }
    });

    document.querySelectorAll('.session-window:not(.maximized)').forEach(win => {
      win.style.top = '';
    });
  }

  function handleHeaderClick(e, winId) {
    if (e.target.closest('.win-controls')) return;

    if (!clickTimers[winId]) {
      clickTimers[winId] = setTimeout(() => {
        delete clickTimers[winId];
        togglePeek(winId);
      }, 250);
    } else {
      clearTimeout(clickTimers[winId]);
      delete clickTimers[winId];
      toggleMaximize(winId);
    }
  }

  function togglePeek(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.toggle('peeked');
    win.classList.remove('collapsed');
    updateMaximizedStacks();
    syncShellModeManual();
  }

  function toggleCollapse(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.toggle('collapsed');
    win.classList.remove('peeked');
    updateMaximizedStacks();
    syncShellModeManual();
  }

  function toggleMaximize(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    win.classList.toggle('maximized');

    if (win.classList.contains('maximized')) {
      document.querySelectorAll('.session-window').forEach(w => w.style.zIndex = '1');
      win.style.zIndex = '99999';
    } else {
      win.style.zIndex = '1';
    }

    updateMaximizedStacks();
    syncShellModeManual();
  }

  function minimizeToDock(winId, icon) {
    const win = document.getElementById(winId);
    if (!win) return;

    win.classList.add('minimized');
    win.classList.remove('maximized', 'collapsed', 'peeked');
    updateMaximizedStacks();

    const dock = document.getElementById('dock');
    if (!dock) return;

    const bubble = document.createElement('div');
    bubble.className = 'dock-bubble';
    bubble.innerHTML = icon || '📄';
    bubble.title = 'Restore Window';
    bubble.id = `dock-${winId}`;

    bubble.onclick = () => {
      win.classList.remove('minimized');
      bubble.remove();
      updateMaximizedStacks();
      win.scrollIntoView({ behavior: 'smooth', block: 'center' });
      syncShellModeManual();
    };

    dock.appendChild(bubble);
    syncShellModeManual();
  }

  function createSessionWindow({ title = 'Window', icon = '📄', src = '', id = '' } = {}) {
    const wrap = document.getElementById('stackWrap');
    if (!wrap) return null;

    const winId = id || `win-${Date.now()}-${windowCounter++}`;

    const winHTML = `
      <section class="session-window" id="${winId}">
        <header class="win-hdr" onclick="handleHeaderClick(event, '${winId}')">
          <div class="win-title">${icon} <span>${title}</span></div>
          <div class="win-controls">
            <button onclick="event.stopPropagation(); togglePeek('${winId}')">▭</button>
            <button onclick="event.stopPropagation(); toggleCollapse('${winId}')">—</button>
            <button onclick="event.stopPropagation(); toggleMaximize('${winId}')">⤢</button>
            <button onclick="event.stopPropagation(); minimizeToDock('${winId}', '${icon.replace(/'/g, "\\'")}')">✕</button>
          </div>
        </header>
        <iframe class="win-frame" src="${src}" loading="lazy"></iframe>
      </section>
    `;

    wrap.insertAdjacentHTML('beforeend', winHTML);
    const newWin = document.getElementById(winId);
    if (newWin) {
      newWin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    syncShellModeManual();
    return winId;
  }

  window.updateMaximizedStacks = updateMaximizedStacks;
  window.handleHeaderClick = handleHeaderClick;
  window.togglePeek = togglePeek;
  window.toggleCollapse = toggleCollapse;
  window.toggleMaximize = toggleMaximize;
  window.minimizeToDock = minimizeToDock;
  window.createSessionWindow = createSessionWindow;
  window.syncShellModeManual = syncShellModeManual;

  const boot = () => {
    syncShellMode();
    observeAll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener('resize', syncShellMode);
  window.addEventListener('orientationchange', syncShellMode);
})();