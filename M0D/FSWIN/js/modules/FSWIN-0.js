 (function() {
      const STORAGE_KEY = 'kxtsk_clean_v1';
      const APPS = [
        { id: 'kob', name: 'KOB LV Base', icon: 'fa-globe', url: 'https://kodux78k.github.io/oiDual--Y-/M0D/LV/000-kob-LV-BASE.html' },
        { id: 'atlas', name: 'Atlas Strategic', icon: 'fa-satellite-dish', url: 'https://fusion-os-dualapp.netlify.app/' },
        { id: 'serena', name: 'Serena AI', icon: 'fa-brain', url: 'https://kodux78k.github.io/oi-Dual/' },
        { id: 'vortex', name: 'Vortex CRM', icon: 'fa-wind', url: 'https://kodux78k.github.io/oiDual--Y-/M0D/78K-motor/' }
      ];

      let state = {
        zCounter: 100,
        currentView: 'home',
        activeSessions: []
      };

      // helpers
      const $ = (sel, ctx = document) => ctx.querySelector(sel);
      const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

      function log(msg) {
        const terminal = $('#terminal');
        if (!terminal) return;
        const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
        const line = document.createElement('div');
        line.innerHTML = `<span style="opacity:0.5">[${time}]</span> ${msg}`;
        terminal.prepend(line);
      }

      function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
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
        } catch(e) { console.warn(e); }
      }

      function syncNav(viewId) {
        $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewId));
        $$('.view').forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.remove('hidden');
        state.currentView = viewId;
        saveState();
      }

      function bringToFront(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        session.zIndex = ++state.zCounter;
        el.style.zIndex = session.zIndex;
        saveState();
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
          bubble.onclick = () => restoreApp(session.sid);
          dock.appendChild(bubble);
        });
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

      function toggleCollapse(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        bringToFront(sid);
        if (session.status === 'maximized') {
          session.status = 'active';
          el.classList.remove('maximized');
        }
        session.status = session.status === 'collapsed' ? 'active' : 'collapsed';
        el.classList.toggle('collapsed', session.status === 'collapsed');
        saveState();
      }

      function toggleMaximize(sid) {
        const session = state.activeSessions.find(s => s.sid === sid);
        const el = document.getElementById(sid);
        if (!session || !el) return;
        bringToFront(sid);
        if (session.status === 'collapsed') {
          session.status = 'active';
          el.classList.remove('collapsed');
        }
        session.status = session.status === 'maximized' ? 'active' : 'maximized';
        el.classList.toggle('maximized', session.status === 'maximized');
        saveState();
      }

      function closeApp(sid) {
        const el = document.getElementById(sid);
        if (el) el.remove();
        state.activeSessions = state.activeSessions.filter(s => s.sid !== sid);
        renderDock();
        saveState();
        log(`Encerrado: ${sid}`);
      }

      function makeDraggable(win, session) {
        const header = $('.win-hdr', win);
        let dragging = false, offsetX = 0, offsetY = 0;
        const move = (e) => {
          if (!dragging) return;
          e.preventDefault();
          const topbarHeight = $('.os-topbar').getBoundingClientRect().height;
          let x = e.clientX - offsetX;
          let y = e.clientY - offsetY;
          y = Math.max(topbarHeight + 6, y);
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
        header.addEventListener('mousedown', (e) => {
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
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
      }

      function bindControls(win, session) {
        $('.ctrl-collapse', win)?.addEventListener('click', (e) => { e.stopPropagation(); toggleCollapse(session.sid); });
        $('.ctrl-maximize', win)?.addEventListener('click', (e) => { e.stopPropagation(); toggleMaximize(session.sid); });
        $('.ctrl-minimize', win)?.addEventListener('click', (e) => { e.stopPropagation(); minimizeApp(session.sid); });
        $('.close-btn', win)?.addEventListener('click', (e) => { e.stopPropagation(); closeApp(session.sid); });
      }

      function createWindowDOM(session) {
        const stack = $('#stackWrap');
        const win = document.createElement('section');
        win.className = 'session-window';
        win.id = session.sid;
        win.style.zIndex = session.zIndex;
        if (session.position === 'absolute') {
          win.classList.add('floating');
          win.style.left = session.left;
          win.style.top = session.top;
        } else {
          win.style.position = 'relative';
        }
        if (session.status === 'collapsed') win.classList.add('collapsed');
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
          <iframe class="win-frame" src="${session.url}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" allow="fullscreen; autoplay; clipboard-write" loading="lazy"></iframe>
        `;
        win.addEventListener('mousedown', () => bringToFront(session.sid));
        bindControls(win, session);
        makeDraggable(win, session);
        stack.appendChild(win);
      }

      function openApp(appConfig) {
        const sid = `win_${Date.now()}_${Math.floor(Math.random()*999)}`;
        const session = {
          sid, name: appConfig.name, icon: appConfig.icon, url: appConfig.url,
          status: 'active', position: 'relative', left: 'auto', top: 'auto',
          zIndex: ++state.zCounter
        };
        state.activeSessions.push(session);
        createWindowDOM(session);
        renderDock();
        syncNav('stack');
        log(`Aberto: ${session.name}`);
        saveState();
      }

      function clearAll() {
        state.activeSessions = [];
        $('#stackWrap').innerHTML = '';
        renderDock();
        saveState();
        log('Todos os processos foram removidos.');
      }

      function renderStack() {
        const stack = $('#stackWrap');
        if (!stack) return;
        stack.innerHTML = '';
        state.activeSessions.forEach(createWindowDOM);
        renderDock();
      }

      function renderApps() {
        const container = $('#appsContainer');
        if (!container) return;
        container.innerHTML = '';
        APPS.forEach(app => {
          const card = document.createElement('div');
          card.className = 'app-card';
          card.innerHTML = `<i class="fa-solid ${app.icon}"></i><span>${app.name}</span>`;
          card.onclick = () => openApp(app);
          container.appendChild(card);
        });
      }

      function restoreStateToDOM() {
        renderApps();
        if (state.activeSessions.length) renderStack();
        else $('#stackWrap').innerHTML = '<div style="text-align:center;opacity:0.4;padding:40px;">✨ Nenhuma janela ativa</div>';
        syncNav(state.currentView);
        renderDock();
      }

      function seedLogs() {
        const term = $('#terminal');
        if (term) term.innerHTML = '';
        ['Kernel KxTsK v2 (clean) online.', 'Sistema de janelas pronto.', 'Persistência ativa.'].forEach(m => log(m));
      }

      function wireUI() {
        $('#openKobBtn')?.addEventListener('click', () => openApp(APPS[0]));
        $('#openLogsBtn')?.addEventListener('click', () => syncNav('logs'));
        $('#clearAllBtn')?.addEventListener('click', clearAll);
        $('#clearLogsBtn')?.addEventListener('click', () => { $('#terminal').innerHTML = ''; log('Logs limpos.'); });
        $$('.nav-item').forEach(btn => btn.addEventListener('click', () => syncNav(btn.dataset.view)));
      }

      function init() {
        loadState();
        wireUI();
        restoreStateToDOM();
        seedLogs();
        $('#bootStatus').innerHTML = '✅ Kernel unificado ativo — sistema limpo e sem duplicatas';
        log('Ready. Clique nos apps para abrir janelas.');
        saveState();
      }
      window.addEventListener('DOMContentLoaded', init);
      window.KxTsK = { openApp, clearAll, state, APPS };
    })();
