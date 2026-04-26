(() => {
  "use strict";

  if (window.__diSunriseSymbolEngineReady) return;
  window.__diSunriseSymbolEngineReady = true;

  const NAMESPACE = "DI_SUNRISE_SYMBOLS";

  const DI = {
    storageKey: "di_symbol_buttons_v1",
    panelKey: "di_symbol_panel_open_v1",
    dragKey: "di_symbol_drag_v1",
    sourceKey: "di_symbol_source_v1",
    zoneId: "di-managed-symbol-zone",
    panelId: "di-symbol-engine-panel",
    backdropId: "di-symbol-engine-backdrop",
    currentEditId: null,
    pressTimer: null,
    dragId: null,
    suppressClickUntil: 0,
    booted: false,
    pulseTimer: null
  };

  const FIXED_IDS = new Set([
    "toggleBtn",
    "btn-prev",
    "btn-play",
    "btn-next",
    "btn-arch"
  ]);

  const SELECTORS = {
    bar: "#symbolBar",
    frame: "#frame",
    hud: "#hudStatus"
  };

  const DEFAULTS = [];

  const state = {
    buttons: [],
    byId: new Map(),
    source: "local",
    lastImportMode: "replace"
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const now = () => Date.now();

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (m) => (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[m]
    ));

  function uid(prefix = "sym") {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${now().toString(36)}`;
  }

  function safeJsonParse(raw, fallback) {
    try {
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function normalizeUrl(input) {
    let url = String(input ?? "").trim();
    if (!url) return "";

    if (url.startsWith("javascript:")) return "";
    if (url.startsWith("data:")) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//") ||
      url.startsWith("/") ||
      url.startsWith("./") ||
      url.startsWith("../") ||
      url.startsWith("#")
    ) {
      return url;
    }

    return `./${url.replace(/^\.\/+/, "")}`;
  }

  function normalizeItem(item, fallbackIndex = 0) {
    const rawId = String(item?.id ?? "").trim();
    const id = rawId || uid(`btn${fallbackIndex}`);
    const label = String(item?.label ?? item?.icon ?? item?.text ?? "◉").trim() || "◉";
    const url = normalizeUrl(item?.url ?? "");
    const icon = String(item?.icon ?? "").trim();
    const order = Number.isFinite(item?.order) ? item.order : fallbackIndex;
    const hidden = Boolean(item?.hidden);
    const kind = String(item?.kind ?? "link").trim() || "link";

    return { id, label, url, icon, order, hidden, kind };
  }

  function normalizeList(list) {
    return (Array.isArray(list) ? list : [])
      .map((item, i) => normalizeItem(item, i))
      .filter((item) => item.id && !item.hidden);
  }

  function getManagedButtonElements() {
    return qsa(`${SELECTORS.bar} .symbol-button[data-id]`).filter(
      (btn) => !FIXED_IDS.has(btn.id)
    );
  }

  function captureInitialButtonsFromDOM() {
    const found = [];
    const els = getManagedButtonElements();

    els.forEach((btn, index) => {
      const wrap = btn.closest(".symbol-wrap");
      if (!wrap) return;

      found.push(
        normalizeItem(
          {
            id: btn.dataset.id || btn.id || uid(`btn${index}`),
            label: btn.dataset.label || btn.textContent || btn.innerText || "◉",
            url: btn.dataset.url || "",
            icon: btn.dataset.icon || "",
            order: index,
            hidden: false,
            kind: btn.dataset.kind || "link"
          },
          index
        )
      );
    });

    return found.length ? found : DEFAULTS.map((x, i) => normalizeItem(x, i));
  }

  function loadButtons() {
    const saved = safeJsonParse(localStorage.getItem(DI.storageKey), null);
    if (Array.isArray(saved) && saved.length) {
      return normalizeList(saved);
    }

    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
    localStorage.setItem(DI.sourceKey, "dom");
    return initial;
  }

  function saveButtons(list, { silent = false, source = "local" } = {}) {
    const normalized = normalizeList(list).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );

    normalized.forEach((item, idx) => {
      item.order = idx;
    });

    state.buttons = normalized;
    state.byId = new Map(normalized.map((x) => [x.id, x]));
    state.source = source;

    localStorage.setItem(DI.storageKey, JSON.stringify(normalized));
    localStorage.setItem(DI.sourceKey, source);

    if (!silent) {
      render();
      syncHud();
      broadcast();
      pulseBar(source !== "local" ? "external" : "local");
    }
  }

  function broadcast() {
    window.dispatchEvent(
      new CustomEvent("di:symbol-buttons-updated", {
        detail: {
          buttons: state.buttons,
          source: state.source,
          mode: state.lastImportMode
        }
      })
    );
  }

  function mergeButtons(base, incoming) {
    const map = new Map(base.map((item) => [item.id, { ...item }]));
    incoming.forEach((item) => {
      if (map.has(item.id)) {
        map.set(item.id, normalizeItem({ ...map.get(item.id), ...item }, 0));
      } else {
        map.set(item.id, item);
      }
    });
    return [...map.values()];
  }

  function appendButtons(base, incoming) {
    const seen = new Set(base.map((item) => item.id));
    const extra = incoming.filter((item) => !seen.has(item.id));
    return [...base, ...extra];
  }

  function applyExternalButtons(list, { mode = "replace", source = "postMessage" } = {}) {
    const incoming = normalizeList(list);
    if (!incoming.length) return;

    state.lastImportMode = mode;

    let next = incoming;
    if (mode === "merge") next = mergeButtons(state.buttons, incoming);
    if (mode === "append") next = appendButtons(state.buttons, incoming);

    saveButtons(next, { source });
    flashPanelNote(`Importado via ${source}`);
  }

  function ensureStyles() {
    if (qs("#di-sunrise-symbol-style")) return;

    const style = document.createElement("style");
    style.id = "di-sunrise-symbol-style";
    style.textContent = `
      #${DI.zoneId}{
        display:flex;
        flex-wrap:wrap;
        align-items:center;
        gap:10px;
        width:100%;
        margin:8px 0 0;
        padding:0;
      }

      .di-managed-wrap{
        display:inline-flex;
        align-items:center;
      }

      .di-managed-button{
        user-select:none;
        -webkit-user-select:none;
        touch-action:manipulation;
        cursor:pointer;
        transition:transform .18s ease, opacity .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease;
      }

      .di-managed-button:hover{
        transform:translateY(-1px);
      }

      .di-managed-button.is-dragging{
        opacity:.5;
        transform:scale(.96);
      }

      .di-managed-button.is-drop-target{
        outline:2px dashed rgba(255,255,255,.42);
        outline-offset:4px;
      }

      .di-managed-button.di-flash{
        animation:diBtnFlash .45s ease;
      }

      @keyframes diBtnFlash{
        0%{ transform:scale(1); box-shadow:none; }
        50%{ transform:scale(1.04); box-shadow:0 0 0 1px rgba(255,255,255,.18), 0 0 24px rgba(120,227,255,.18); }
        100%{ transform:scale(1); box-shadow:none; }
      }

      .di-symbol-engine-backdrop{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.48);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        z-index:2147483000;
        display:none;
        opacity:0;
        transition:opacity .22s ease;
      }

      .di-symbol-engine-backdrop.is-open{
        display:block;
        opacity:1;
      }

      .di-symbol-engine-panel{
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%) scale(.98);
        width:min(92vw, 460px);
        max-height:min(86vh, 760px);
        z-index:2147483001;
        display:none;
        border-radius:24px;
        border:1px solid rgba(255,255,255,.14);
        background:
          radial-gradient(circle at 20% 0%, rgba(99,102,241,.16), transparent 32%),
          linear-gradient(180deg, rgba(18,20,26,.98), rgba(10,12,18,.96));
        box-shadow:0 20px 70px rgba(0,0,0,.52);
        color:#fff;
        overflow:hidden;
      }

      .di-symbol-engine-panel.is-open{
        display:flex;
        flex-direction:column;
        animation:diPop .22s cubic-bezier(.2,.9,.2,1);
      }

      @keyframes diPop{
        from{transform:translate(-50%,-50%) scale(.94); opacity:.2;}
        to{transform:translate(-50%,-50%) scale(1); opacity:1;}
      }

      .di-symbol-engine-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:16px 18px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.02);
      }

      .di-symbol-engine-title{
        font-size:14px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        line-height:1.15;
      }

      .di-symbol-engine-sub{
        font-size:12px;
        opacity:.72;
        margin-top:4px;
        line-height:1.35;
      }

      .di-chip-row{
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        margin-top:10px;
      }

      .di-chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:6px 10px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.1);
        background:rgba(255,255,255,.05);
        font-size:11px;
        font-weight:700;
        letter-spacing:.03em;
        text-transform:uppercase;
        color:rgba(255,255,255,.88);
      }

      .di-chip.is-live{
        border-color:rgba(120,227,255,.25);
        background:rgba(120,227,255,.09);
      }

      .di-symbol-engine-body{
        padding:16px 18px 18px;
        display:grid;
        gap:12px;
        overflow:auto;
      }

      .di-symbol-engine-row{
        display:grid;
        gap:8px;
      }

      .di-symbol-engine-row label{
        font-size:12px;
        opacity:.82;
      }

      .di-symbol-engine-row input,
      .di-symbol-engine-row select,
      .di-symbol-engine-row textarea{
        width:100%;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        color:#fff;
        padding:12px 12px;
        outline:none;
        font:inherit;
      }

      .di-symbol-engine-row textarea{
        min-height:110px;
        resize:vertical;
        line-height:1.45;
      }

      .di-symbol-engine-row input::placeholder,
      .di-symbol-engine-row textarea::placeholder{
        color:rgba(255,255,255,.42);
      }

      .di-symbol-engine-actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-top:4px;
      }

      .di-symbol-engine-actions button{
        border:0;
        border-radius:12px;
        padding:11px 14px;
        font:inherit;
        font-weight:800;
        cursor:pointer;
        transition:transform .18s ease, opacity .18s ease, background .18s ease, filter .18s ease;
      }

      .di-symbol-engine-actions button:hover{
        transform:translateY(-1px);
        filter:brightness(1.04);
      }

      .di-btn-primary{
        background:#ffffff;
        color:#0b0d12;
      }

      .di-btn-ghost{
        background:rgba(255,255,255,.08);
        color:#fff;
      }

      .di-btn-danger{
        background:rgba(255,72,72,.18);
        color:#ffd7d7;
      }

      .di-toolbar{
        display:grid;
        gap:10px;
        margin-top:2px;
      }

      .di-toolbar-top{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        align-items:center;
      }

      .di-toolbar-top > *{
        flex:1 1 auto;
      }

      .di-small-note{
        font-size:11px;
        opacity:.68;
        line-height:1.4;
      }

      .di-symbol-engine-list{
        display:grid;
        gap:8px;
        max-height:260px;
        overflow:auto;
        padding-right:2px;
      }

      .di-symbol-item{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        padding:12px 12px;
        border-radius:16px;
        transition:transform .18s ease, border-color .18s ease, background .18s ease;
      }

      .di-symbol-item:hover{
        transform:translateY(-1px);
        border-color:rgba(255,255,255,.14);
        background:rgba(255,255,255,.055);
      }

      .di-symbol-item strong{
        display:block;
        font-size:13px;
        line-height:1.3;
      }

      .di-symbol-item small{
        display:block;
        opacity:.68;
        font-size:11px;
        word-break:break-all;
        margin-top:4px;
        line-height:1.35;
      }

      .di-symbol-item .di-mini-actions{
        display:flex;
        gap:8px;
        flex-shrink:0;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .di-symbol-item .di-mini-actions button{
        padding:8px 10px;
        border-radius:10px;
        font-size:12px;
      }

      .di-empty-state{
        padding:14px;
        border-radius:14px;
        border:1px dashed rgba(255,255,255,.12);
        background:rgba(255,255,255,.03);
        color:rgba(255,255,255,.7);
        font-size:12px;
        line-height:1.5;
      }

      #symbolBar.di-import-pulse{
        animation:diBarPulse .75s ease;
      }

      @keyframes diBarPulse{
        0%{
          transform:translateY(0);
          box-shadow:none;
        }
        45%{
          transform:translateY(-1px);
          box-shadow:0 0 0 1px rgba(120,227,255,.2), 0 0 24px rgba(120,227,255,.18);
        }
        100%{
          transform:translateY(0);
          box-shadow:none;
        }
      }

      #symbolBar.di-external-active{
        border-color:rgba(120,227,255,.22);
      }

      .di-split{
        display:grid;
        gap:10px;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureManagedZone() {
    const bar = qs(SELECTORS.bar);
    if (!bar) return null;

    let zone = qs(`#${DI.zoneId}`);
    if (zone) return zone;

    zone = document.createElement("div");
    zone.id = DI.zoneId;

    const hud = qs(SELECTORS.hud, bar);
    if (hud && hud.parentElement === bar) {
      bar.insertBefore(zone, hud);
    } else {
      bar.appendChild(zone);
    }

    return zone;
  }

  function syncHud() {
    const hud = qs(SELECTORS.hud);
    if (!hud) return;

    const count = state.buttons.length;
    const sourceLabel =
      state.source === "postMessage"
        ? "· remoto"
        : state.source === "dom"
          ? "· base DOM"
          : "· local";

    hud.textContent = `KOBLLUX · ORB NEXUS · ${count} símbolo${count === 1 ? "" : "s"} ${sourceLabel}`;
    hud.title = `Origem: ${state.source} · Importação: ${state.lastImportMode}`;
  }

  function flashPanelNote(text) {
    const note = qs("#di-panel-note");
    if (!note) return;
    note.textContent = text;
    note.classList.add("is-live");
    clearTimeout(DI.pulseTimer);
    DI.pulseTimer = setTimeout(() => {
      note.classList.remove("is-live");
    }, 1100);
  }

  function pulseBar(kind = "external") {
    const bar = qs(SELECTORS.bar);
    if (!bar) return;

    bar.classList.remove("di-import-pulse");
    bar.classList.add("di-external-active");

    clearTimeout(DI.pulseTimer);
    DI.pulseTimer = setTimeout(() => {
      bar.classList.add("di-import-pulse");
    }, 20);

    clearTimeout(DI.pressTimer);
    DI.pressTimer = setTimeout(() => {
      bar.classList.remove("di-import-pulse");
    }, kind === "external" ? 900 : 450);
  }

  function flashButton(btn) {
    if (!btn) return;
    btn.classList.add("di-flash");
    setTimeout(() => btn.classList.remove("di-flash"), 480);
  }

  function render() {
    const zone = ensureManagedZone();
    if (!zone) return;

    zone.innerHTML = "";

    const list = [...state.buttons]
      .map((x, i) => normalizeItem(x, i))
      .filter((x) => !x.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    state.buttons = list;
    state.byId = new Map(list.map((x) => [x.id, x]));

    list.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "symbol-wrap di-managed-wrap";
      wrap.dataset.id = item.id;

      const btn = document.createElement("button");
      btn.className = "symbol-button di-managed-button";
      btn.dataset.id = item.id;
      btn.dataset.url = item.url || "";
      btn.dataset.label = item.label || "";
      btn.dataset.kind = item.kind || "link";
      btn.draggable = true;
      btn.type = "button";
      btn.title = `${item.label || item.id}`;

      const content = item.icon ? item.icon : item.label || "◉";
      btn.textContent = content;

      wrap.appendChild(btn);
      zone.appendChild(wrap);
    });

    ensurePanel();
    bindManagedDelegation(zone);
    syncHud();
  }

  function getFrame() {
    return qs(SELECTORS.frame);
  }

  function openUrlInFrame(url) {
    const target = normalizeUrl(url);
    if (!target) return;

    const frame = getFrame();
    if (frame) {
      frame.src = target;
    } else {
      window.location.href = target;
    }
  }

  function reorderById(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;

    const list = [...state.buttons];
    const fromIndex = list.findIndex((x) => x.id === fromId);
    const toIndex = list.findIndex((x) => x.id === toId);

    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = list.splice(fromIndex, 1);
    let insertAt = toIndex;
    if (fromIndex < toIndex) insertAt -= 1;

    list.splice(Math.max(0, insertAt), 0, moved);

    list.forEach((item, idx) => {
      item.order = idx;
    });

    saveButtons(list, { source: state.source });
  }

  function updateButton(id, patch) {
    const list = [...state.buttons];
    const idx = list.findIndex((x) => x.id === id);
    if (idx < 0) return;

    list[idx] = normalizeItem(
      {
        ...list[idx],
        ...patch,
        id
      },
      idx
    );

    saveButtons(list, { source: state.source });
  }

  function deleteButton(id) {
    const list = state.buttons.filter((x) => x.id !== id);
    saveButtons(list, { source: state.source });
  }

  function addButton(data) {
    const item = normalizeItem(
      {
        id: data.id || uid("btn"),
        label: data.label || data.icon || "◉",
        url: data.url || "",
        icon: data.icon || "",
        order: state.buttons.length,
        kind: data.kind || "link"
      },
      state.buttons.length
    );

    saveButtons([...state.buttons, item], { source: state.source });
  }

  function openEditor(itemId) {
    const item = state.byId.get(itemId);
    if (!item) return;

    DI.currentEditId = itemId;

    const panel = qs(`#${DI.panelId}`);
    if (!panel) return;

    const backdrop = qs(`#${DI.backdropId}`);
    if (backdrop) backdrop.classList.add("is-open");
    panel.classList.add("is-open");

    const fId = qs("#di-symbol-id");
    const fLabel = qs("#di-symbol-label");
    const fUrl = qs("#di-symbol-url");
    const fIcon = qs("#di-symbol-icon");
    const fKind = qs("#di-symbol-kind");

    if (fId) fId.value = item.id;
    if (fLabel) fLabel.value = item.label || "";
    if (fUrl) fUrl.value = item.url || "";
    if (fIcon) fIcon.value = item.icon || "";
    if (fKind) fKind.value = item.kind || "link";

    refreshPanelList();
  }

  function closePanel() {
    const panel = qs(`#${DI.panelId}`);
    const backdrop = qs(`#${DI.backdropId}`);

    if (panel) panel.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");

    DI.currentEditId = null;
    localStorage.setItem(DI.panelKey, "0");
  }

  function openPanel() {
    ensurePanel();

    const backdrop = qs(`#${DI.backdropId}`);
    const panel = qs(`#${DI.panelId}`);

    if (backdrop) backdrop.classList.add("is-open");
    if (panel) panel.classList.add("is-open");

    localStorage.setItem(DI.panelKey, "1");
    refreshPanelList();
  }

  function togglePanel() {
    const panel = qs(`#${DI.panelId}`);
    const isOpen = panel?.classList.contains("is-open");
    if (isOpen) closePanel();
    else openPanel();
  }

  function ensurePanel() {
    if (qs(`#${DI.panelId}`) && qs(`#${DI.backdropId}`)) return;

    const backdrop = document.createElement("div");
    backdrop.id = DI.backdropId;
    backdrop.className = "di-symbol-engine-backdrop";
    backdrop.addEventListener("click", closePanel);

    const panel = document.createElement("div");
    panel.id = DI.panelId;
    panel.className = "di-symbol-engine-panel";
    panel.innerHTML = `
      <div class="di-symbol-engine-head">
        <div>
          <div class="di-symbol-engine-title">Sunrise Symbol Engine</div>
          <div class="di-symbol-engine-sub">
            criar, editar, remover, reordenar e importar símbolos via <code>postMessage</code>
          </div>

          <div class="di-chip-row">
            <span class="di-chip is-live" id="di-panel-source">source: local</span>
            <span class="di-chip" id="di-panel-count">0 itens</span>
            <span class="di-chip" id="di-panel-mode">mode: replace</span>
          </div>
        </div>

        <button type="button" class="di-btn-ghost" id="di-symbol-close">✕</button>
      </div>

      <div class="di-symbol-engine-body">
        <div class="di-toolbar">
          <div class="di-toolbar-top">
            <button type="button" class="di-btn-primary" id="di-import-from-frame">Receber do iframe</button>
            <button type="button" class="di-btn-ghost" id="di-export-json">Exportar JSON</button>
            <button type="button" class="di-btn-ghost" id="di-restore-base">Restaurar base</button>
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-import-mode">Modo de importação</label>
            <select id="di-import-mode">
              <option value="replace">replace</option>
              <option value="merge">merge</option>
              <option value="append">append</option>
            </select>
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-search">Buscar</label>
            <input id="di-symbol-search" placeholder="filtrar por id, rótulo ou url" autocomplete="off" spellcheck="false">
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-json">Importar JSON</label>
            <textarea id="di-symbol-json" placeholder='Cole aqui um array JSON de botões:
[
  {"id":"home","label":"⌂","url":"./"},
  {"id":"docs","label":"◘","url":"https://..."}
]'></textarea>
          </div>

          <div class="di-symbol-engine-actions">
            <button type="button" class="di-btn-primary" id="di-json-apply">Aplicar JSON</button>
            <button type="button" class="di-btn-ghost" id="di-json-load-current">Carregar atual</button>
            <button type="button" class="di-btn-danger" id="di-clear-all">Limpar tudo</button>
          </div>

          <div class="di-small-note" id="di-panel-note">
            Dica: a página filha pode enviar símbolos com <code>window.parent.postMessage(...)</code>.
          </div>
        </div>

        <div class="di-split">
          <div class="di-symbol-engine-row">
            <label for="di-symbol-id">ID</label>
            <input id="di-symbol-id" placeholder="ex: home, doc, mix" autocomplete="off" spellcheck="false">
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-label">Rótulo</label>
            <input id="di-symbol-label" placeholder="ex: ◌, Φ, MIX, DOC" autocomplete="off" spellcheck="false">
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-url">URL</label>
            <input id="di-symbol-url" placeholder="https://... ou ./pagina.html" autocomplete="off" spellcheck="false">
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-icon">Ícone opcional</label>
            <input id="di-symbol-icon" placeholder="emoji, símbolo ou texto" autocomplete="off" spellcheck="false">
          </div>

          <div class="di-symbol-engine-row">
            <label for="di-symbol-kind">Tipo</label>
            <select id="di-symbol-kind">
              <option value="link">Link</option>
              <option value="iframe">Iframe</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="di-symbol-engine-actions">
            <button type="button" class="di-btn-primary" id="di-symbol-save">Salvar</button>
            <button type="button" class="di-btn-ghost" id="di-symbol-add">Novo</button>
            <button type="button" class="di-btn-danger" id="di-symbol-delete">Remover</button>
          </div>
        </div>

        <div class="di-symbol-engine-row">
          <label>Símbolos atuais</label>
          <div class="di-symbol-engine-list" id="di-symbol-list"></div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    qs("#di-symbol-close", panel)?.addEventListener("click", closePanel);

    qs("#di-symbol-save", panel)?.addEventListener("click", () => {
      const id = qs("#di-symbol-id")?.value.trim();
      const label = qs("#di-symbol-label")?.value.trim() || "◉";
      const url = qs("#di-symbol-url")?.value.trim() || "";
      const icon = qs("#di-symbol-icon")?.value.trim() || "";
      const kind = qs("#di-symbol-kind")?.value.trim() || "link";

      if (!id) return;

      const exists = state.byId.has(id);
      const payload = { id, label, url, icon, kind };

      if (exists) {
        updateButton(id, payload);
      } else {
        addButton(payload);
      }

      refreshPanelList();
      flashPanelNote(exists ? "Símbolo atualizado." : "Símbolo criado.");
      closePanel();
    });

    qs("#di-symbol-add", panel)?.addEventListener("click", () => {
      DI.currentEditId = null;

      const newid = uid("btn");
      const id = qs("#di-symbol-id");
      const label = qs("#di-symbol-label");
      const url = qs("#di-symbol-url");
      const icon = qs("#di-symbol-icon");
      const kind = qs("#di-symbol-kind");

      if (id) id.value = newid;
      if (label) label.value = "";
      if (url) url.value = "";
      if (icon) icon.value = "";
      if (kind) kind.value = "link";

      flashPanelNote("Pronto para novo símbolo.");
    });

    qs("#di-symbol-delete", panel)?.addEventListener("click", () => {
      const id = qs("#di-symbol-id")?.value.trim();
      if (!id || !state.byId.has(id)) return;

      deleteButton(id);
      refreshPanelList();
      flashPanelNote("Símbolo removido.");
      closePanel();
    });

    qs("#di-import-from-frame", panel)?.addEventListener("click", () => {
      requestExternalSymbols();
      flashPanelNote("Solicitação enviada para o iframe.");
    });

    qs("#di-export-json", panel)?.addEventListener("click", async () => {
      const json = JSON.stringify(state.buttons, null, 2);
      const box = qs("#di-symbol-json");
      if (box) box.value = json;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(json);
          flashPanelNote("JSON copiado para a área de transferência.");
        } else {
          flashPanelNote("JSON carregado na caixa de texto.");
        }
      } catch {
        flashPanelNote("JSON carregado na caixa de texto.");
      }
    });

    qs("#di-restore-base", panel)?.addEventListener("click", () => {
      const base = captureInitialButtonsFromDOM();
      saveButtons(base, { source: "dom" });
      refreshPanelList();
      flashPanelNote("Base do DOM restaurada.");
    });

    qs("#di-json-load-current", panel)?.addEventListener("click", () => {
      const box = qs("#di-symbol-json");
      if (box) box.value = JSON.stringify(state.buttons, null, 2);
      flashPanelNote("JSON atual carregado.");
    });

    qs("#di-json-apply", panel)?.addEventListener("click", () => {
      const raw = qs("#di-symbol-json")?.value.trim();
      if (!raw) return;

      const parsed = safeJsonParse(raw, null);
      if (!Array.isArray(parsed)) {
        flashPanelNote("JSON inválido. Precisa ser um array.");
        return;
      }

      const mode = qs("#di-import-mode")?.value || "replace";
      applyExternalButtons(parsed, { mode, source: "json" });
      flashPanelNote(`JSON aplicado em modo ${mode}.`);
    });

    const idInput = qs("#di-symbol-id");
    idInput?.addEventListener("change", () => {
      const val = idInput.value.trim();
      const item = state.byId.get(val);
      if (!item) return;

      qs("#di-symbol-label").value = item.label || "";
      qs("#di-symbol-url").value = item.url || "";
      qs("#di-symbol-icon").value = item.icon || "";
      qs("#di-symbol-kind").value = item.kind || "link";
    });

    const search = qs("#di-symbol-search");
    search?.addEventListener("input", () => refreshPanelList(search.value));

    const modeSelect = qs("#di-import-mode");
    modeSelect?.addEventListener("change", () => {
      state.lastImportMode = modeSelect.value || "replace";
      updatePanelMeta();
    });

    refreshPanelList();
    updatePanelMeta();
  }

  function updatePanelMeta() {
    const source = qs("#di-panel-source");
    const count = qs("#di-panel-count");
    const mode = qs("#di-panel-mode");

    if (source) source.textContent = `source: ${state.source}`;
    if (count) count.textContent = `${state.buttons.length} item${state.buttons.length === 1 ? "" : "s"}`;
    if (mode) mode.textContent = `mode: ${state.lastImportMode}`;
  }

  function refreshPanelList(filterText = "") {
    const list = qs("#di-symbol-list");
    if (!list) return;

    const term = String(filterText ?? "").trim().toLowerCase();
    const items = [...state.buttons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const filtered = term
      ? items.filter((item) => {
          const hay = `${item.id} ${item.label} ${item.url} ${item.kind}`.toLowerCase();
          return hay.includes(term);
        })
      : items;

    if (!filtered.length) {
      list.innerHTML = `
        <div class="di-empty-state">
          Nenhum símbolo encontrado.
          <br>
          Use <strong>Receber do iframe</strong>, cole JSON, ou crie um novo item aqui.
        </div>
      `;
      updatePanelMeta();
      return;
    }

    list.innerHTML = filtered
      .map((item) => {
        return `
          <div class="di-symbol-item" data-id="${esc(item.id)}">
            <div>
              <strong>${esc(item.label || "◉")} <span style="opacity:.72">· ${esc(item.id)}</span></strong>
              <small>${esc(item.url || "(sem url)")}</small>
            </div>
            <div class="di-mini-actions">
              <button type="button" class="di-btn-ghost" data-action="edit">Editar</button>
              <button type="button" class="di-btn-ghost" data-action="up">↑</button>
              <button type="button" class="di-btn-ghost" data-action="down">↓</button>
              <button type="button" class="di-btn-danger" data-action="del">Remover</button>
            </div>
          </div>
        `;
      })
      .join("");

    list.querySelectorAll(".di-symbol-item").forEach((row) => {
      const id = row.dataset.id;
      row.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          const idx = state.buttons.findIndex((x) => x.id === id);
          if (idx < 0) return;

          if (action === "edit") {
            openEditor(id);
            flashPanelNote("Editando símbolo.");
            return;
          }

          if (action === "del") {
            deleteButton(id);
            refreshPanelList(term);
            flashPanelNote("Símbolo removido.");
            return;
          }

          if (action === "up" && idx > 0) {
            const arr = [...state.buttons];
            [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
            arr.forEach((it, i) => (it.order = i));
            saveButtons(arr, { source: state.source });
            refreshPanelList(term);
            flashPanelNote("Ordem atualizada.");
            return;
          }

          if (action === "down" && idx < state.buttons.length - 1) {
            const arr = [...state.buttons];
            [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
            arr.forEach((it, i) => (it.order = i));
            saveButtons(arr, { source: state.source });
            refreshPanelList(term);
            flashPanelNote("Ordem atualizada.");
          }
        });
      });
    });

    updatePanelMeta();
  }

  function bindManagedDelegation(zone) {
    if (!zone || zone.dataset.diBound === "1") return;
    zone.dataset.diBound = "1";

    zone.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      if (now() < DI.suppressClickUntil) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      const id = btn.dataset.id;
      const item = state.byId.get(id);
      if (!item) return;

      if (btn.dataset.diEditing === "1") {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      if (item.kind === "iframe" || item.kind === "link" || item.kind === "custom") {
        openUrlInFrame(item.url);
        flashButton(btn);
      }
    });

    zone.addEventListener("pointerdown", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      const id = btn.dataset.id;
      const item = state.byId.get(id);
      if (!item) return;

      clearTimeout(DI.pressTimer);
      btn.dataset.diEditing = "0";

      DI.pressTimer = setTimeout(() => {
        btn.dataset.diEditing = "1";
        DI.suppressClickUntil = now() + 500;
        openEditor(id);
      }, 700);
    });

    const cancelPress = () => clearTimeout(DI.pressTimer);
    zone.addEventListener("pointerup", cancelPress);
    zone.addEventListener("pointerleave", cancelPress);
    zone.addEventListener("pointercancel", cancelPress);

    zone.addEventListener("dragstart", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      DI.dragId = btn.dataset.id;
      btn.classList.add("is-dragging");
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", DI.dragId);
    });

    zone.addEventListener("dragend", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (btn) btn.classList.remove("is-dragging");
      zone.querySelectorAll(".is-drop-target").forEach((x) => x.classList.remove("is-drop-target"));
      DI.dragId = null;
    });

    zone.addEventListener("dragover", (ev) => {
      const target = ev.target.closest(".di-managed-wrap");
      if (!target) return;
      ev.preventDefault();
      target.classList.add("is-drop-target");
    });

    zone.addEventListener("dragleave", (ev) => {
      const target = ev.target.closest(".di-managed-wrap");
      if (!target) return;
      target.classList.remove("is-drop-target");
    });

    zone.addEventListener("drop", (ev) => {
      const target = ev.target.closest(".di-managed-wrap");
      if (!target) return;
      ev.preventDefault();
      target.classList.remove("is-drop-target");

      const fromId = DI.dragId || ev.dataTransfer.getData("text/plain");
      const toId = target.querySelector(".di-managed-button")?.dataset.id;
      if (!fromId || !toId) return;

      reorderById(fromId, toId);
      refreshPanelList(qs("#di-symbol-search")?.value || "");
    });
  }

  function migrateDefaultsIfNeeded() {
    const saved = safeJsonParse(localStorage.getItem(DI.storageKey), null);
    if (Array.isArray(saved) && saved.length) return;

    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
    localStorage.setItem(DI.sourceKey, "dom");
  }

  function attachToggleShortcut() {
    const toggle = qs(SELECTORS.bar + " #toggleBtn");
    if (toggle && toggle.dataset.diShortcutBound !== "1") {
      toggle.dataset.diShortcutBound = "1";

      toggle.addEventListener("pointerdown", () => {
        clearTimeout(DI.pressTimer);
        DI.pressTimer = setTimeout(() => {
          openPanel();
        }, 2900);
      });

      toggle.addEventListener("pointerup", () => clearTimeout(DI.pressTimer));
      toggle.addEventListener("pointerleave", () => clearTimeout(DI.pressTimer));
      toggle.addEventListener("pointercancel", () => clearTimeout(DI.pressTimer));

      toggle.addEventListener("dblclick", (ev) => {
        ev.preventDefault();
        togglePanel();
      });
    }

    window.addEventListener("keydown", (ev) => {
      if (ev.altKey && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        openPanel();
      }
      if (ev.key === "Escape") closePanel();
    });
  }

  function requestExternalSymbols() {
    const frame = getFrame();
    const target = frame?.contentWindow;

    if (!target) {
      flashPanelNote("Iframe não disponível.");
      return;
    }

    try {
      target.postMessage(
        {
          namespace: NAMESPACE,
          type: "DI_SYMBOLS_QUERY",
          source: "parent",
          request: {
            want: "symbols"
          }
        },
        "*"
      );

      flashPanelNote("Pedido enviado para o iframe.");
    } catch {
      flashPanelNote("Falha ao falar com o iframe.");
    }
  }

  function handleMessage(event) {
    const data = event?.data;
    if (!data || typeof data !== "object") return;

    const type = String(data.type || "");
    const ns = String(data.namespace || "");

    const isOurMessage = ns === NAMESPACE || type.startsWith("DI_SYMBOLS");
    if (!isOurMessage) return;

    if (type === "DI_SYMBOLS") {
      const mode = String(data.mode || "replace");
      const source = String(data.source || "postMessage");
      const payload = Array.isArray(data.payload) ? data.payload : [];
      applyExternalButtons(payload, { mode, source });

      localStorage.setItem(DI.sourceKey, source);
      flashPanelNote(`Símbolos recebidos de ${source}.`);
      return;
    }

    if (type === "DI_SYMBOLS_CLEAR") {
      saveButtons([], { source: "postMessage" });
      refreshPanelList();
      flashPanelNote("Lista limpa via postMessage.");
      return;
    }

    if (type === "DI_SYMBOLS_PATCH") {
      const payload = data.payload || {};
      const source = String(data.source || "postMessage");
      const mode = String(data.mode || "merge");

      let next = [...state.buttons];

      if (Array.isArray(payload.replace)) {
        next = normalizeList(payload.replace);
      } else {
        if (Array.isArray(payload.remove)) {
          const remove = new Set(payload.remove.map(String));
          next = next.filter((item) => !remove.has(item.id));
        }

        if (Array.isArray(payload.upsert)) {
          payload.upsert.forEach((raw, index) => {
            const item = normalizeItem(raw, index);
            const idx = next.findIndex((x) => x.id === item.id);
            if (idx >= 0) next[idx] = normalizeItem({ ...next[idx], ...item }, idx);
            else next.push(item);
          });
        }
      }

      saveButtons(next, { source });
      state.lastImportMode = mode;
      refreshPanelList();
      flashPanelNote(`Patch recebido via ${source}.`);
      return;
    }

    if (type === "DI_SYMBOLS_QUERY") {
      const source = event.source;
      if (!source?.postMessage) return;

      try {
        source.postMessage(
          {
            namespace: NAMESPACE,
            type: "DI_SYMBOLS_STATE",
            source: "parent",
            payload: state.buttons
          },
          "*"
        );
      } catch {
        /* noop */
      }
    }
  }

  function publishSymbols(list, meta = {}) {
    const payload = normalizeList(list);
    const target = window.parent || window.opener || window.top;

    if (!target?.postMessage) return;

    target.postMessage(
      {
        namespace: NAMESPACE,
        type: "DI_SYMBOLS",
        source: meta.source || location.href || "child",
        mode: meta.mode || "replace",
        payload
      },
      "*"
    );
  }

  function installPublicApi() {
    window.DI_SunriseSymbolEngine = {
      openPanel,
      closePanel,
      togglePanel,
      addButton,
      updateButton,
      deleteButton,
      render,
      loadButtons: () => [...state.buttons],
      saveButtons: (list, opts) => saveButtons(list, opts),
      getById: (id) => state.byId.get(id) || null,
      applyExternalButtons,
      requestExternalSymbols,
      publishSymbols
    };

    window.diPublishSymbols = publishSymbols;
  }

  function bootFrameBridge() {
    const frame = getFrame();
    if (!frame) return;

    frame.addEventListener("load", () => {
      requestExternalSymbols();
    });
  }

  function boot() {
    if (DI.booted) return;
    DI.booted = true;

    ensureStyles();
    migrateDefaultsIfNeeded();

    state.buttons = loadButtons();
    state.byId = new Map(state.buttons.map((x) => [x.id, x]));
    state.source = localStorage.getItem(DI.sourceKey) || "local";

    render();
    attachToggleShortcut();
    bootFrameBridge();
    installPublicApi();

    window.addEventListener("storage", (ev) => {
      if (ev.key !== DI.storageKey) return;

      const incoming = safeJsonParse(ev.newValue, []);
      if (!Array.isArray(incoming)) return;

      state.buttons = normalizeList(incoming);
      state.byId = new Map(state.buttons.map((x) => [x.id, x]));
      state.source = localStorage.getItem(DI.sourceKey) || "local";

      render();
      refreshPanelList(qs("#di-symbol-search")?.value || "");
      updatePanelMeta();
    });

    window.addEventListener("di:symbol-buttons-updated", () => {
      refreshPanelList(qs("#di-symbol-search")?.value || "");
      updatePanelMeta();
    });

    window.addEventListener("message", handleMessage);

    syncHud();
    updatePanelMeta();

    if (localStorage.getItem(DI.panelKey) === "1") {
      openPanel();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();