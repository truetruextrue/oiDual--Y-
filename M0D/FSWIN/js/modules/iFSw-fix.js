 (() => {
      const stackWrap = document.getElementById('stackWrap');
      const dock = document.getElementById('dock');
      const openKobBtn = document.getElementById('openKobBtn');
      const openLogsBtn = document.getElementById('openLogsBtn');

      let windowCounter = 1;
      const clickTimers = {};

      const DEFAULT_SRC = 'https://kodux78k.github.io/oiDual-H0/DH0-10.html';
      const DEFAULT_ICON = '🌐';
      const DEFAULT_TITLE = 'DUAL H0 // KOB LV BASE';

      function getWin(id) {
        return document.getElementById(id);
      }

      function hasMaximizedWindow() {
        return !!document.querySelector('.session-window.maximized:not(.minimized)');
      }

      function hasPeekedWindow() {
        return !!document.querySelector('.session-window.peeked:not(.minimized)');
      }

      function syncShellMode() {
        const maximized = hasMaximizedWindow();
        const peeked = hasPeekedWindow();

        document.body.classList.toggle('ui-immersive', !maximized && !peeked);
        document.body.classList.toggle('ui-safe-vertical', maximized || peeked);
      }

      function updateMaximizedStacks() {
        const maxWins = Array.from(document.querySelectorAll('.session-window.maximized'));
        let currentTop = 0;

        maxWins.sort((a, b) => (parseInt(a.style.zIndex) || 1) - (parseInt(b.style.zIndex) || 1));

        maxWins.forEach(win => {
          if (win.classList.contains('collapsed') || win.classList.contains('peeked')) {
            win.style.top = `calc(${currentTop}px + var(--topbar-h) + var(--safe-top))`;
            if (win.classList.contains('collapsed')) currentTop += 52;
            else if (win.classList.contains('peeked')) currentTop += 87;
          } else {
            win.style.top = `calc(var(--topbar-h) + var(--safe-top))`;
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
        const win = getWin(winId);
        if (!win) return;

        win.classList.toggle('peeked');
        win.classList.remove('collapsed');
        updateMaximizedStacks();
        syncShellMode();
      }

      function toggleCollapse(winId) {
        const win = getWin(winId);
        if (!win) return;

        win.classList.toggle('collapsed');
        win.classList.remove('peeked');
        updateMaximizedStacks();
        syncShellMode();
      }

      function toggleMaximize(winId) {
        const win = getWin(winId);
        if (!win) return;

        win.classList.toggle('maximized');
        win.classList.remove('minimized');

        if (win.classList.contains('maximized')) {
          document.querySelectorAll('.session-window').forEach(w => w.style.zIndex = '1');
          win.style.zIndex = '92000';
        } else {
          win.style.zIndex = '1';
          win.classList.remove('peeked', 'collapsed');
        }

        updateMaximizedStacks();
        syncShellMode();
      }

      function minimizeWindow(winId) {
        const win = getWin(winId);
        if (!win) return;

        win.classList.add('minimized');
        win.classList.remove('maximized', 'collapsed', 'peeked');
        updateMaximizedStacks();

        const bubble = document.createElement('div');
        bubble.className = 'dock-bubble';
        bubble.textContent = '📄';
        bubble.title = 'Restaurar janela';
        bubble.id = `dock-${winId}`;

        bubble.onclick = () => {
          win.classList.remove('minimized');
          bubble.remove();
          updateMaximizedStacks();
          win.scrollIntoView({ behavior: 'smooth', block: 'center' });
          syncShellMode();
        };

        dock.appendChild(bubble);
        syncShellMode();
      }

      function closeWindow(winId) {
        const win = getWin(winId);
        if (!win) return;

        const bubble = document.getElementById(`dock-${winId}`);
        if (bubble) bubble.remove();

        win.remove();
        updateMaximizedStacks();
        syncShellMode();
      }

      function createSessionWindow({
        title = DEFAULT_TITLE,
        icon = DEFAULT_ICON,
        src = DEFAULT_SRC
      } = {}) {
        const id = `session-${Date.now()}-${windowCounter++}`;

        const section = document.createElement('div');
        section.className = 'session-window collapsed';

        section.id = id;

        section.innerHTML = `
          <div class="win-hdr" onclick="handleHeaderClick(event, '${id}')">
            <div class="win-title">${icon} ${title}</div>

            <div class="win-controls" onclick="event.stopPropagation()">
              <button onclick="toggleCollapse('${id}')" title="Colapsar">—</button>
              <button onclick="toggleMaximize('${id}')" title="Maximizar">⬜</button>
              <button onclick="minimizeWindow('${id}')" title="Minimizar para o Dock">🔘</button>
              <button onclick="closeWindow('${id}')" title="Fechar">✕</button>
            </div>
          </div>

          <iframe
            class="win-frame"
            src="${src}"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy">
          </iframe>
        `;

        stackWrap.appendChild(section);
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        syncShellMode();
        return id;
      }

      function boot() {
        syncShellMode();
        updateMaximizedStacks();
      }

      openKobBtn.addEventListener('click', () => {
        createSessionWindow({
          title: DEFAULT_TITLE,
          icon: DEFAULT_ICON,
          src: DEFAULT_SRC
        });
      });

      openLogsBtn.addEventListener('click', () => {
        console.log('Logs acionado');
      });

      window.handleHeaderClick = handleHeaderClick;
      window.togglePeek = togglePeek;
      window.toggleCollapse = toggleCollapse;
      window.toggleMaximize = toggleMaximize;
      window.minimizeWindow = minimizeWindow;
      window.closeWindow = closeWindow;
      window.createSessionWindow = createSessionWindow;
      window.syncShellMode = syncShellMode;
      window.updateMaximizedStacks = updateMaximizedStacks;

      window.addEventListener('resize', syncShellMode);
      window.addEventListener('orientationchange', syncShellMode);

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
      } else {
        boot();
      }
    })();
