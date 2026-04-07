
    (() => {
      const STORAGE_KEY = 'kxtsk_unified_sessions_v1';

      const APPS = [
        { id: 'kob', name: 'KOB LV Base', icon: 'fa-globe', url: 'https://kodux78k.github.io/oiDual--Y-/M0D/LV/000-kob-LV-BASE.html' },
        { id: 'atlas', name: 'Atlas Strategic', icon: 'fa-satellite-dish', url: 'https://kodux78k.github.io/PortalDual/index.html' },
        { id: 'serena', name: 'Serena AI', icon: 'fa-brain', url: 'https://kodux78k.github.io/oiDuak-Tube-v0/' },
        { id: 'vortex', name: 'Vortex CRM', icon: 'fa-wind', url: 'https://kodux78k.github.io/oiDual--Y-/M0D/78K-motor/' }
      ];

      const state = {
        zCounter: 100,
        currentView: 'home',
        activeSessions: []
      };

      const $ = (sel, root = document) => root.querySelector(sel);
      const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
      const log = (msg) => {
        const terminal = $('#terminal');
        if (!terminal) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const line = document.createElement('div');
        line.innerHTML = `<span style="opacity:.45">[${time}]</span> ${msg}`;
        terminal.prepend(line);
      };

      function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      function loadState() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return;
          const data = JSON.parse(raw);
          if (data && Array.isArray(data.activeSessions)) {
            state.activeSessions = data.activeSessions;
            state.currentView = data.currentView || 'home';
            const maxZ = Math.max(100, ...state.activeSessions.map(s => Number(s.zIndex || 100)));
            state.zCounter = maxZ + 1;
          }
        } catch (err) {
          console.warn('Estado inválido, reiniciando...', err);
        }
      }

      function syncNav(viewId) {
        $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewId));
        $$('.view').forEach(view => view.classList.add('hidden'));
        const el = document.getElementById(`view-${viewId}`);
        if (el) el.classList.remove('hidden');
        state.currentView = viewId;
        saveState();
      }

      function renderApps() {
        const container = $('#appsContainer');
        if (!container) return;
        container.innerHTML = '';
        APPS.forEach(app => {
          const card = document.createElement('article');
          card.className = 'app-card';
          card.innerHTML = `<i class="fa-solid ${app.icon}"></i><span>${app.name}</span>`;
          card.addEventListener('click', () => openApp(app));
          container.appendChild(card);
        });
      }

      function bringToFront(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        session.zIndex = ++state.zCounter;
        el.style.zIndex = String(session.zIndex);
        saveState();
      }

      function openApp(appConfig) {
        const sid = `win_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const session = {
          sid,
          name: appConfig.name || 'Novo App',
          icon: appConfig.icon || 'fa-circle',
          url: appConfig.url || 'about:blank',
          status: 'active',
          position: 'relative',
          left: 'auto',
          top: 'auto',
          zIndex: ++state.zCounter
        };
        state.activeSessions.push(session);
        createWindowDOM(session);
        renderDock();
        syncNav('stack');
        log(`Processo iniciado: ${session.name}`);
        saveState();
      }

      function closeApp(sid) {
        const el = document.getElementById(sid);
        if (el) el.remove();
        state.activeSessions = state.activeSessions.filter(s => s.sid !== sid);
        renderDock();
        saveState();
        log(`Processo encerrado: ${sid}`);
      }

      /* ====================== PATCH PEEK + DEBUG ====================== */
      function setSessionWindowState(sid, newState) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;

        el.classList.remove('collapsed', 'peeked');
        if (newState === 'collapsed') el.classList.add('collapsed');
        else if (newState === 'peeked') el.classList.add('peeked');

        session.status = newState;
        saveState();
        log(`Estado alterado → ${newState} (${session.name})`);
      }

      function cycleSessionWindow(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el || el.classList.contains('minimized') || el.classList.contains('maximized')) return;

        let current = session.status || 'active';
        let nextState;

        switch (current) {
          case 'active':  nextState = 'peeked';   break;
          case 'peeked':  nextState = 'collapsed'; break;
          case 'collapsed': nextState = 'active';  break;
          default:        nextState = 'active';
        }

        setSessionWindowState(sid, nextState);
        bringToFront(sid);
      }

      function toggleCollapse(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        bringToFront(sid);

        if (session.status === 'maximized') {
          session.status = 'active';
          el.classList.remove('maximized');
        }

        const willCollapse = session.status !== 'collapsed';
        const target = willCollapse ? 'collapsed' : 'active';
        setSessionWindowState(sid, target);
      }

      function toggleMaximize(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        bringToFront(sid);

        if (session.status === 'collapsed' || session.status === 'peeked') {
          el.classList.remove('collapsed', 'peeked');
          session.status = 'active';
        }

        session.status = session.status === 'maximized' ? 'active' : 'maximized';
        el.classList.toggle('maximized', session.status === 'maximized');
        saveState();
      }

      function minimizeApp(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        session.status = 'minimized';
        el.classList.add('minimized');
        renderDock();
        saveState();
        log(`Minimizado: ${session.name}`);
      }

      function restoreApp(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        session.status = 'active';
        el.classList.remove('minimized');
        bringToFront(sid);
        renderDock();
        saveState();
      }

      function clearAll() {
        state.activeSessions = [];
        $('#stackWrap').innerHTML = '';
        renderDock();
        saveState();
        log('Todos os processos foram limpos.');
      }

      function renderDock() {
        const dock = $('#dock');
        if (!dock) return;
        dock.innerHTML = '';
        state.activeSessions.filter(s => s.status === 'minimized').forEach(session => {
          const bubble = document.createElement('button');
          bubble.className = 'dock-bubble';
          bubble.innerHTML = `<i class="fa-solid ${session.icon}"></i>`;
          bubble.title = `Restaurar ${session.name}`;
          bubble.addEventListener('click', () => restoreApp(session.sid));
          dock.appendChild(bubble);
        });
      }

      function makeDraggable(win, session) {
        const header = $('.win-hdr', win);
        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
          // === DEBUG HDR MOUSEDOWN ===
          console.log(`%c[DEBUG HDR MOUSEDOWN] Clicou no header → ${session.name} (${session.sid})`, 'background:#00f2ff;color:#000;font-weight:800;padding:2px 6px;border-radius:3px');

          if (e.target.closest('button') || win.classList.contains('maximized')) return;

          dragging = true;
          win.classList.add('dragging');
          const rect = win.getBoundingClientRect();
          if (!win.classList.contains('floating')) {
            win.classList.add('floating');
            win.style.width = `${rect.width}px`;
            win.style.left = `${rect.left}px`;
            win.style.top = `${rect.top}px`;
          }
          offsetX = e.clientX - win.offsetLeft;
          offsetY = e.clientY - win.offsetTop;
          bringToFront(session.sid);
        });

        const move = (e) => {
          if (!dragging) return;
          e.preventDefault();
          const viewTop = $('.os-topbar').getBoundingClientRect().height;
          const x = e.clientX - offsetX;
          const y = Math.max(viewTop + 6, e.clientY - offsetY);
          win.style.left = `${x}px`;
          win.style.top = `${y}px`;
        };

        const up = () => {
          if (!dragging) return;
          dragging = false;
          win.classList.remove('dragging');
          session.position = 'absolute';
          session.left = win.style.left;
          session.top = win.style.top;
          saveState();
        };

        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      }

      function bindControls(win, session) {
        $('.ctrl-collapse', win).addEventListener('click', (e) => { e.stopPropagation(); toggleCollapse(session.sid); });
        $('.ctrl-maximize', win).addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(session.sid); });
        $('.ctrl-minimize', win).addEventListener('click', (e) => { e.stopPropagation(); minimizeApp(session.sid); });
        $('.close-btn', win).addEventListener('click', (e) => { e.stopPropagation(); closeApp(session.sid); });
      }

      function createWindowDOM(session) {
        const stack = $('#stackWrap');
        const win = document.createElement('section');
        win.className = 'session-window';
        win.id = session.sid;
        win.style.zIndex = String(session.zIndex);

        if (session.position === 'absolute') {
          win.classList.add('floating');
          win.style.left = session.left;
          win.style.top = session.top;
        } else {
          win.style.position = 'relative';
        }

        if (session.status === 'collapsed') win.classList.add('collapsed');
        if (session.status === 'peeked') win.classList.add('peeked');     // ← suporte ao restore do Peek
        if (session.status === 'maximized') win.classList.add('maximized');
        if (session.status === 'minimized') win.classList.add('minimized');

        win.innerHTML = `
          <div class="win-hdr">
            <div class="win-title"><i class="fa-solid ${session.icon}"></i> ${session.name}</div>
            <div class="win-controls">
              <button class="ctrl-collapse" title="Colapsar">—</button>
              <button class="ctrl-maximize" title="Maximizar">⬜</button>
              <button class="ctrl-minimize" title="Minimizar">↓</button>
              <button class="close-btn" title="Fechar">✕</button>
            </div>
          </div>
          <iframe
            class="win-frame"
            src="${session.url}"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
          ></iframe>
        `;

        win.addEventListener('mousedown', () => bringToFront(session.sid));
        bindControls(win, session);
        makeDraggable(win, session);

        /* === PATCH: Clique no HDR → Cycle Peek (com debug) === */
        const header = $('.win-hdr', win);
        header.addEventListener('click', (e) => {
          if (e.target.closest('button') || e.target.closest('.win-controls')) return;

          console.log(`%c[DEBUG HDR CLICK] Cycle Peek ativado → ${session.name} (${session.sid})`, 'background:#8b5cf6;color:#fff;font-weight:800;padding:2px 6px;border-radius:3px');
          cycleSessionWindow(session.sid);
        });

        stack.appendChild(win);
      }

      function renderStack() {
        const stack = $('#stackWrap');
        if (!stack) return;
        stack.innerHTML = '';
        state.activeSessions.forEach(createWindowDOM);
        renderDock();
      }

      function seedLogs() {
        const terminal = $('#terminal');
        if (!terminal) return;
        terminal.innerHTML = '';
        [
          'Kernel KxTsK online.',
          'Base CSS carregada.',
          'Bridge de patch pronta.',
          'Sessões restauradas quando existirem.'
        ].forEach(msg => {
          const div = document.createElement('div');
          div.textContent = `[boot] ${msg}`;
          terminal.appendChild(div);
        });
      }

      function mountLegacyPatches() {
        if (window.lucide?.createIcons) window.lucide.createIcons();
        if (window.particlesJS) {
          try {
            particlesJS('particles-js', {
              particles: {
                number: { value: 36, density: { enable: true, value_area: 800 } },
                color: { value: '#00f2ff' },
                shape: { type: 'circle' },
                opacity: { value: 0.28 },
                size: { value: 2 },
                line_linked: { enable: false },
                move: { enable: true, speed: 1.2 }
              },
              interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: false }, resize: true }
              },
              retina_detect: true
            });
          } catch {}
        }
      }

      function wireUI() {
        $('#openKobBtn').addEventListener('click', () => openApp(APPS[0]));
        $('#openLogsBtn').addEventListener('click', () => syncNav('logs'));
        $('#clearAllBtn').addEventListener('click', clearAll);
        $('#clearLogsBtn').addEventListener('click', seedLogs);
        $('#coreOrb').addEventListener('click', () => log('Núcleo sincronizado.'));
        $('#closeModalBtn').addEventListener('click', () => $('#modal').classList.remove('open'));

        $$('.nav-item').forEach(item => item.addEventListener('click', () => syncNav(item.dataset.view)));

        const modal = $('#modal');
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') modal.classList.remove('open');
        });
      }

      function restoreStateToDOM() {
        renderApps();
        if (state.activeSessions.length) {
          renderStack();
        } else {
          $('#stackWrap').innerHTML = '<div style="opacity:.25;text-align:center;padding:42px 16px;font-size:12px;font-weight:800">STACK VAZIO</div>';
          renderDock();
        }
        syncNav(state.currentView || 'home');
      }

      function bootstrap() {
        loadState();
        wireUI();
        mountLegacyPatches();
        restoreStateToDOM();
        seedLogs();
        $('#bootStatus').textContent = 'Boot concluído. KxTsK está servindo como base única. (Peek + Debug HDR ativados)';
        saveState();
        log('Unified loader pronto com Peek + debug no header.');
      }

      window.KxTsK = {
        state,
        APPS,
        openApp,
        clearAll,
        renderStack,
        renderDock,
        syncNav
      };

      document.addEventListener('DOMContentLoaded', bootstrap);
    })();
