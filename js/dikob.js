(() => {
  "use strict";

  if (window.__diSunriseSymbolEngineReady) return;
  window.__diSunriseSymbolEngineReady = true;

  const DI = {
    storageKey: "di_symbol_buttons_v1",
    panelKey: "di_symbol_panel_open_v1",
    dragKey: "di_symbol_drag_v1",
    zoneId: "di-managed-symbol-zone",
    panelId: "di-symbol-engine-panel",
    backdropId: "di-symbol-engine-backdrop",
    currentEditId: null,
    pressTimer: null,
    dragId: null,
    suppressClickUntil: 0,
    booted: false
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

  const DEFAULTS = [
    // deixe vazio aqui se quiser começar do zero;
    // o engine captura os botões existentes como base.
  ];

  const state = {
    buttons: [],
    byId: new Map()
  };

  const esc = (v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  const now = () => Date.now();

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

  function getManagedButtonElements() {
    return qsa(
      `${SELECTORS.bar} .symbol-button[data-id]`
    ).filter((btn) => !FIXED_IDS.has(btn.id));
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
      return saved.map((x, i) => normalizeItem(x, i)).filter(Boolean);
    }

    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
    return initial;
  }

  function saveButtons(list, { silent = false } = {}) {
    const normalized = list
      .map((x, i) => normalizeItem(x, i))
      .filter((x) => x.id && !x.hidden);

    state.buttons = normalized;
    state.byId = new Map(normalized.map((x) => [x.id, x]));

    localStorage.setItem(DI.storageKey, JSON.stringify(normalized));
    if (!silent) {
      render();
      syncHud();
      broadcast();
    }
  }

  function broadcast() {
    window.dispatchEvent(
      new CustomEvent("di:symbol-buttons-updated", {
        detail: {
          buttons: state.buttons
        }
      })
    );
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
      }

      .di-managed-button.is-dragging{
        opacity:.5;
        transform:scale(.96);
      }

      .di-managed-button.is-drop-target{
        outline:2px dashed rgba(255,255,255,.42);
        outline-offset:4px;
      }

      .di-symbol-engine-backdrop{
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.48);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        z-index:2147483000;
        display:none;
      }

      .di-symbol-engine-backdrop.is-open{
        display:block;
      }

      .di-symbol-engine-panel{
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%) scale(.98);
        width:min(92vw, 420px);
        z-index:2147483001;
        display:none;
        border-radius:20px;
        border:1px solid rgba(255,255,255,.15);
        background:linear-gradient(180deg, rgba(18,20,26,.96), rgba(10,12,18,.95));
        box-shadow:0 18px 60px rgba(0,0,0,.45);
        color:#fff;
        overflow:hidden;
      }

      .di-symbol-engine-panel.is-open{
        display:block;
        animation:diPop .18s ease-out;
      }

      @keyframes diPop{
        from{transform:translate(-50%,-50%) scale(.94); opacity:.2;}
        to{transform:translate(-50%,-50%) scale(1); opacity:1;}
      }

      .di-symbol-engine-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:14px 16px;
        border-bottom:1px solid rgba(255,255,255,.08);
      }

      .di-symbol-engine-title{
        font-size:14px;
        font-weight:800;
        letter-spacing:.06em;
        text-transform:uppercase;
      }

      .di-symbol-engine-sub{
        font-size:12px;
        opacity:.72;
        margin-top:2px;
      }

      .di-symbol-engine-body{
        padding:16px;
        display:grid;
        gap:12px;
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
      .di-symbol-engine-row select{
        width:100%;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        color:#fff;
        padding:12px 12px;
        outline:none;
        font:inherit;
      }

      .di-symbol-engine-row input::placeholder{
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
        font-weight:700;
        cursor:pointer;
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

      .di-symbol-engine-list{
        display:grid;
        gap:8px;
        max-height:220px;
        overflow:auto;
        padding-right:2px;
      }

      .di-symbol-item{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        padding:10px 12px;
        border-radius:14px;
      }

      .di-symbol-item strong{
        display:block;
        font-size:13px;
      }

      .di-symbol-item small{
        display:block;
        opacity:.68;
        font-size:11px;
        word-break:break-all;
      }

      .di-symbol-item .di-mini-actions{
        display:flex;
        gap:8px;
        flex-shrink:0;
      }

      .di-symbol-item .di-mini-actions button{
        padding:8px 10px;
        border-radius:10px;
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
    hud.textContent = `KOBLLUX · ORB NEXUS · ${count} símbolo${count === 1 ? "" : "s"}`;
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
      btn.innerHTML = esc(content);

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

    saveButtons(list);
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

    saveButtons(list);
  }

  function deleteButton(id) {
    const list = state.buttons.filter((x) => x.id !== id);
    saveButtons(list);
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

    saveButtons([...state.buttons, item]);
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
  }

  function closePanel() {
    const panel = qs(`#${DI.panelId}`);
    const backdrop = qs(`#${DI.backdropId}`);
    if (panel) panel.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    DI.currentEditId = null;
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
          <div class="di-symbol-engine-sub">criar, editar, remover e reordenar símbolos</div>
        </div>
        <button type="button" class="di-btn-ghost" id="di-symbol-close">✕</button>
      </div>

      <div class="di-symbol-engine-body">
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
          <button type="button" class="di-btn-ghost" id="di-symbol-add">Adicionar novo</button>
          <button type="button" class="di-btn-danger" id="di-symbol-delete">Remover</button>
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

    const saveBtn = qs("#di-symbol-save", panel);
    const addBtn = qs("#di-symbol-add", panel);
    const delBtn = qs("#di-symbol-delete", panel);

    saveBtn?.addEventListener("click", () => {
      const id = qs("#di-symbol-id")?.value.trim();
      const label = qs("#di-symbol-label")?.value.trim() || "◉";
      const url = qs("#di-symbol-url")?.value.trim() || "";
      const icon = qs("#di-symbol-icon")?.value.trim() || "";
      const kind = qs("#di-symbol-kind")?.value.trim() || "link";

      if (!id) return;

      const exists = state.byId.has(id);
      const payload = {
        id,
        label,
        url,
        icon,
        kind
      };

      if (exists) {
        updateButton(id, payload);
      } else {
        addButton(payload);
      }

      refreshPanelList();
      closePanel();
    });

    addBtn?.addEventListener("click", () => {
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
    });

    delBtn?.addEventListener("click", () => {
      const id = qs("#di-symbol-id")?.value.trim();
      if (!id) return;
      if (!state.byId.has(id)) return;
      deleteButton(id);
      refreshPanelList();
      closePanel();
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

    refreshPanelList();
  }

  function refreshPanelList() {
    const list = qs("#di-symbol-list");
    if (!list) return;

    const items = [...state.buttons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    list.innerHTML = items
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
            return;
          }

          if (action === "del") {
            deleteButton(id);
            refreshPanelList();
            return;
          }

          if (action === "up" && idx > 0) {
            const list = [...state.buttons];
            [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
            list.forEach((it, i) => (it.order = i));
            saveButtons(list);
            refreshPanelList();
            return;
          }

          if (action === "down" && idx < state.buttons.length - 1) {
            const list = [...state.buttons];
            [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
            list.forEach((it, i) => (it.order = i));
            saveButtons(list);
            refreshPanelList();
            return;
          }
        });
      });
    });
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

      const isEditing = btn.dataset.diEditing === "1";
      if (isEditing) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      if (item.kind === "iframe" || item.kind === "link" || item.kind === "custom") {
        ev.preventDefault();
        ev.stopPropagation();
        openUrlInFrame(item.url);
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
      refreshPanelList();
    });
  }

  function migrateDefaultsIfNeeded() {
    const saved = safeJsonParse(localStorage.getItem(DI.storageKey), null);
    if (Array.isArray(saved) && saved.length) return;

    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
  }

  function attachToggleShortcut() {
    const toggle = qs(SELECTORS.bar + " #toggleBtn");
    if (toggle && toggle.dataset.diShortcutBound !== "1") {
      toggle.dataset.diShortcutBound = "1";
      toggle.addEventListener("pointerdown", () => {
        clearTimeout(DI.pressTimer);
        DI.pressTimer = setTimeout(() => {
          openPanel();
        }, 900);
      });
      toggle.addEventListener("pointerup", () => clearTimeout(DI.pressTimer));
      toggle.addEventListener("pointerleave", () => clearTimeout(DI.pressTimer));
      toggle.addEventListener("pointercancel", () => clearTimeout(DI.pressTimer));
    }

    window.addEventListener("keydown", (ev) => {
      if (ev.altKey && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        openPanel();
      }
      if (ev.key === "Escape") closePanel();
    });
  }

  function openPanel() {
    ensurePanel();
    const backdrop = qs(`#${DI.backdropId}`);
    const panel = qs(`#${DI.panelId}`);
    if (backdrop) backdrop.classList.add("is-open");
    if (panel) panel.classList.add("is-open");
    refreshPanelList();
  }

  function boot() {
    if (DI.booted) return;
    DI.booted = true;

    ensureStyles();
    migrateDefaultsIfNeeded();

    state.buttons = loadButtons();
    state.byId = new Map(state.buttons.map((x) => [x.id, x]));

    render();
    attachToggleShortcut();

    window.addEventListener("storage", (ev) => {
      if (ev.key !== DI.storageKey) return;
      const incoming = safeJsonParse(ev.newValue, []);
      if (!Array.isArray(incoming)) return;
      state.buttons = incoming.map((x, i) => normalizeItem(x, i)).filter(Boolean);
      state.byId = new Map(state.buttons.map((x) => [x.id, x]));
      render();
      refreshPanelList();
    });

    window.addEventListener("di:symbol-buttons-updated", () => {
      refreshPanelList();
    });

    syncHud();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.DI_SunriseSymbolEngine = {
    openPanel,
    closePanel,
    addButton,
    updateButton,
    deleteButton,
    render,
    loadButtons: () => [...state.buttons],
    saveButtons: (list) => saveButtons(list),
    getById: (id) => state.byId.get(id) || null
  };
})();