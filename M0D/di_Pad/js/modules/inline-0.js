
    const ROWS = 3;
    const COLS = 3;

    const screensData = [
      [
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 1 · cole seu HTML aqui</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 2 · cole seu HTML aqui</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 3 · cole seu HTML aqui</div></div></div>` }
      ],
      [
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 4 · cole seu HTML aqui</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot"> <body class="ui-safe-vertical">
  <div id="kxtsk-shell">
    <div class="os-topbar">
      <div class="os-brand">
        KxTsK
        <small>Unified Patch Loader</small>
      </div>

      <div class="top-actions">
        <button class="launcher-btn" id="openKobBtn">+ Abrir KOB</button>
        <button class="soft-btn" id="openLogsBtn">Logs</button>
      </div>
    </div>

    <div id="dock"></div>

    <div id="stackWrap">
      <div class="session-window" id="session-iframe">
        <div class="win-hdr" onclick="handleHeaderClick(event, 'session-iframe')">
          <div class="win-title">🌐 DUAL H0 // KOB LV BASE</div>

          <div class="win-controls" onclick="event.stopPropagation()">
            <button onclick="toggleCollapse('session-iframe')" title="Colapsar">—</button>
            <button onclick="toggleMaximize('session-iframe')" title="Maximizar">⬜</button>
            <button onclick="minimizeWindow('session-iframe')" title="Minimizar para o Dock">🔘</button>
            <button onclick="closeWindow('session-iframe')" title="Fechar">✕</button>
          </div>
        </div>

        <iframe
          class="win-frame"
          src="https://kodux78k.github.io/oiDual-H0/DH0-10.html"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          loading="lazy">
        </iframe>
      </div>
    </div>
  </div>
</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 6 · cole seu HTML aqui</div></div></div>` }
      ],
      [
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 7 · cole seu HTML aqui</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 8 · cole seu HTML aqui</div></div></div>` },
        { html: `<div class="inner"><div class="wrap stack"><div class="blank-slot">Seção 9 · cole seu HTML aqui</div></div></div>` }
      ]
    ];

    let currentRow = 1;
    let currentCol = 1;
    let isAnimating = false;

    const grid = document.getElementById("grid");

    function buildGrid() {
      grid.innerHTML = "";
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const screen = document.createElement("div");
          screen.className = "screen";
          screen.dataset.row = r;
          screen.dataset.col = c;
          screen.innerHTML = screensData[r][c].html;
          grid.appendChild(screen);
        }
      }
    }

    function buildNav() {
      const nav = document.getElementById("navMatrix");
      nav.innerHTML = "";
      for (let i = 0; i < 9; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        const r = Math.floor(i / 3);
        const c = i % 3;
        dot.addEventListener("click", () => navigateTo(r, c));
        nav.appendChild(dot);
      }
    }

    function updateView() {
      const tx = -currentCol * (100 / 3);
      const ty = -currentRow * (100 / 3);
      grid.style.transform = `translate(${tx}%, ${ty}%)`;

      document.querySelectorAll(".dot").forEach((dot, i) => {
        dot.classList.toggle("active", Math.floor(i / 3) === currentRow && i % 3 === currentCol);
      });
    }

    window.navigateTo = function(row, col) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
      if (row === currentRow && col === currentCol) return;
      if (isAnimating) return;

      isAnimating = true;
      currentRow = row;
      currentCol = col;
      updateView();

      setTimeout(() => {
        isAnimating = false;
      }, 560);
    };

    function handleSwipe(dx, dy) {
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const SWIPE_DIST = 45;

      if (ax > ay && ax > SWIPE_DIST) {
        dx < 0 ? navigateTo(currentRow, currentCol + 1) : navigateTo(currentRow, currentCol - 1);
      } else if (ay > ax && ay > SWIPE_DIST) {
        dy < 0 ? navigateTo(currentRow + 1, currentCol) : navigateTo(currentRow - 1, currentCol);
      }
    }

    const drag = { x: 0, y: 0, t: 0, active: false };
    const SWIPE_TIME = 350;

    document.addEventListener("touchstart", e => {
      drag.x = e.touches[0].clientX;
      drag.y = e.touches[0].clientY;
      drag.t = Date.now();
      drag.active = true;
    }, { passive: true });

    document.addEventListener("touchend", e => {
      if (!drag.active) return;
      const dx = e.changedTouches[0].clientX - drag.x;
      const dy = e.changedTouches[0].clientY - drag.y;
      const dt = Date.now() - drag.t;
      drag.active = false;
      if (dt > SWIPE_TIME) return;
      handleSwipe(dx, dy);
    }, { passive: true });

    document.addEventListener("mousedown", e => {
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.t = Date.now();
      drag.active = true;
    });

    document.addEventListener("mouseup", e => {
      if (!drag.active) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const dt = Date.now() - drag.t;
      drag.active = false;
      if (dt > SWIPE_TIME || (Math.abs(dx) < 45 && Math.abs(dy) < 45)) return;
      handleSwipe(dx, dy);
    });

    document.addEventListener("keydown", e => {
      switch (e.key) {
        case "ArrowRight": navigateTo(currentRow, currentCol + 1); break;
        case "ArrowLeft": navigateTo(currentRow, currentCol - 1); break;
        case "ArrowDown": navigateTo(currentRow + 1, currentCol); break;
        case "ArrowUp": navigateTo(currentRow - 1, currentCol); break;
        case "Home": navigateTo(1, 1); break;
      }
    });

    let wheelCooldown = false;
    document.addEventListener("wheel", e => {
      if (wheelCooldown) return;
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 700);

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.deltaY > 0 ? navigateTo(currentRow + 1, currentCol) : navigateTo(currentRow - 1, currentCol);
      } else {
        e.deltaX > 0 ? navigateTo(currentRow, currentCol + 1) : navigateTo(currentRow, currentCol - 1);
      }
    }, { passive: true });

    buildGrid();
    buildNav();
    updateView();
  