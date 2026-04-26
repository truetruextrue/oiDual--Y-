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
    booted: false,
    externalFlag: false
  };

  const FIXED_IDS = new Set(["toggleBtn", "btn-prev", "btn-play", "btn-next", "btn-arch"]);
  const SELECTORS = { bar: "#symbolBar", frame: "#frame", hud: "#hudStatus" };
  const DEFAULTS = [];

  const state = { buttons: [], byId: new Map() };

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const now = () => Date.now();
  const uid = (prefix = "sym") => `${prefix}_${Math.random().toString(36).slice(2,8)}_${now().toString(36)}`;

  const safeJsonParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };

  function normalizeUrl(input) {
    let url = String(input ?? "").trim();
    if (!url) return "";
    if (url.startsWith("javascript:") || url.startsWith("data:")) return "";
    if (url.match(/^https?:\/\//) || url.startsWith("//") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../") || url.startsWith("#")) return url;
    return `./${url.replace(/^\.\/+/, "")}`;
  }

  function normalizeItem(item, fallbackIndex = 0) {
    const id = (String(item?.id ?? "").trim()) || uid(`btn${fallbackIndex}`);
    return {
      id,
      label: String(item?.label ?? item?.icon ?? item?.text ?? "◉").trim() || "◉",
      url: normalizeUrl(item?.url ?? ""),
      icon: String(item?.icon ?? "").trim(),
      order: Number.isFinite(item?.order) ? item.order : fallbackIndex,
      hidden: Boolean(item?.hidden),
      kind: String(item?.kind ?? "link").trim() || "link"
    };
  }

  // Captura os botões manualmente do DOM (fallback)
  function captureInitialButtonsFromDOM() {
    const bar = qs(SELECTORS.bar);
    if (!bar) return DEFAULTS.map((x, i) => normalizeItem(x, i));
    const found = [];
    qsa(`${SELECTORS.bar} .symbol-button[data-id]`).forEach((btn, idx) => {
      if (FIXED_IDS.has(btn.id)) return;
      found.push(normalizeItem({
        id: btn.dataset.id || btn.id || uid(`btn${idx}`),
        label: btn.dataset.label || btn.textContent || "◉",
        url: btn.dataset.url || "",
        icon: btn.dataset.icon || "",
        order: idx,
        kind: btn.dataset.kind || "link"
      }, idx));
    });
    return found.length ? found : DEFAULTS.map((x, i) => normalizeItem(x, i));
  }

  // Persistência localStorage
  function loadButtons() {
    const saved = safeJsonParse(localStorage.getItem(DI.storageKey), null);
    if (Array.isArray(saved) && saved.length) return saved.map((x, i) => normalizeItem(x, i));
    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
    return initial;
  }

  function saveButtons(list, { silent = false } = {}) {
    const normalized = list.map((x, i) => normalizeItem(x, i)).filter(x => x.id && !x.hidden);
    state.buttons = normalized;
    state.byId = new Map(normalized.map(x => [x.id, x]));
    localStorage.setItem(DI.storageKey, JSON.stringify(normalized));
    if (!silent) {
      render();
      syncHud();
      broadcast();
    }
  }

  function broadcast() {
    window.dispatchEvent(new CustomEvent("di:symbol-buttons-updated", { detail: { buttons: state.buttons } }));
  }

  // postMessage: recebe símbolos de páginas dentro do iframe
  function setupPostMessageHandshake() {
    window.addEventListener("message", (e) => {
      if (!e.data || e.data.type !== "DI_SYMBOLS") return;
      const externalList = Array.isArray(e.data.payload) ? e.data.payload : [];
      if (!externalList.length) return;
      const normalized = externalList.map((x, i) => normalizeItem(x, i));
      if (normalized.length) {
        saveButtons(normalized);
        DI.externalFlag = true;
        setTimeout(() => { DI.externalFlag = false; }, 500);
      }
    });
  }

  // Função que qualquer página pode chamar para enviar seus símbolos ao sistema principal
  window.postSymbolsToParent = function(symbols) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "DI_SYMBOLS", payload: symbols }, "*");
    }
  };

  // UI – renderização dos botões
  function render() {
    const zone = ensureManagedZone();
    if (!zone) return;
    zone.innerHTML = "";
    const list = [...state.buttons].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    list.forEach(item => {
      const wrap = document.createElement("div");
      wrap.className = "symbol-wrap di-managed-wrap";
      wrap.dataset.id = item.id;
      const btn = document.createElement("button");
      btn.className = "symbol-button di-managed-button";
      btn.dataset.id = item.id;
      btn.dataset.url = item.url;
      btn.dataset.label = item.label;
      btn.dataset.kind = item.kind;
      btn.draggable = true;
      btn.type = "button";
      btn.title = `${item.label || item.id}`;
      btn.innerHTML = esc(item.icon || item.label || "◉");
      wrap.appendChild(btn);
      zone.appendChild(wrap);
    });
    bindManagedDelegation(zone);
    syncHud();
  }

  function ensureManagedZone() {
    const bar = qs(SELECTORS.bar);
    if (!bar) return null;
    let zone = qs(`#${DI.zoneId}`);
    if (zone) return zone;
    zone = document.createElement("div");
    zone.id = DI.zoneId;
    const hud = qs(SELECTORS.hud, bar);
    if (hud && hud.parentElement === bar) bar.insertBefore(zone, hud);
    else bar.appendChild(zone);
    return zone;
  }

  function syncHud() {
    const hud = qs(SELECTORS.hud);
    if (hud) hud.textContent = `KOBLLUX · ORB NEXUS · ${state.buttons.length} símbolo${state.buttons.length === 1 ? "" : "s"}`;
  }

  function openUrlInFrame(url) {
    const frame = qs(SELECTORS.frame);
    if (frame) frame.src = normalizeUrl(url);
    else window.location.href = normalizeUrl(url);
  }

  // Reordenação por drag & drop
  function reorderById(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    const list = [...state.buttons];
    const fromIdx = list.findIndex(x => x.id === fromId);
    const toIdx = list.findIndex(x => x.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = list.splice(fromIdx, 1);
    let insertAt = toIdx;
    if (fromIdx < toIdx) insertAt--;
    list.splice(Math.max(0, insertAt), 0, moved);
    list.forEach((it, i) => it.order = i);
    saveButtons(list);
  }

  function updateButton(id, patch) {
    const list = [...state.buttons];
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return;
    list[idx] = normalizeItem({ ...list[idx], ...patch, id }, idx);
    saveButtons(list);
  }

  function deleteButton(id) {
    saveButtons(state.buttons.filter(x => x.id !== id));
  }

  function addButton(data) {
    const newItem = normalizeItem({ ...data, id: data.id || uid("btn"), order: state.buttons.length }, state.buttons.length);
    saveButtons([...state.buttons, newItem]);
  }

  // ============= PAINEL MELHORADO (com animação e preview) =============
  function ensurePanel() {
    if (qs(`#${DI.panelId}`) && qs(`#${DI.backdropId}`)) return;
    const backdrop = document.createElement("div");
    backdrop.id = DI.backdropId;
    backdrop.className = "di-symbol-engine-backdrop";
    backdrop.addEventListener("click", closePanel);
    document.body.appendChild(backdrop);

    const panel = document.createElement("div");
    panel.id = DI.panelId;
    panel.className = "di-symbol-engine-panel";
    panel.innerHTML = `
      <div class="di-symbol-engine-head">
        <div>
          <div class="di-symbol-engine-title">Sunrise Symbol Engine</div>
          <div class="di-symbol-engine-sub">protocolo postMessage | fallback local | animação</div>
        </div>
        <button type="button" class="di-btn-ghost" id="di-symbol-close">✕</button>
      </div>
      <div class="di-symbol-engine-body">
        <div class="di-symbol-engine-row">
          <label>ID</label>
          <input id="di-symbol-id" placeholder="ex: home, mix, portal" spellcheck="false">
        </div>
        <div class="di-symbol-engine-row">
          <label>Rótulo (texto visível)</label>
          <input id="di-symbol-label" placeholder="◌, Φ, DOC, HOME">
        </div>
        <div class="di-symbol-engine-row">
          <label>URL / destino</label>
          <input id="di-symbol-url" placeholder="https://... ou ./pagina.html">
        </div>
        <div class="di-symbol-engine-row">
          <label>Ícone (emoji ou curto)</label>
          <input id="di-symbol-icon" placeholder="por exemplo: 🧭, ⌂, ∞">
        </div>
        <div class="di-symbol-engine-row">
          <label>Tipo</label>
          <select id="di-symbol-kind">
            <option value="link">Link comum</option>
            <option value="iframe">Carregar no iframe</option>
            <option value="custom">Ação customizada</option>
          </select>
        </div>
        <div class="di-symbol-engine-actions">
          <button type="button" class="di-btn-primary" id="di-symbol-save">💾 Salvar alterações</button>
          <button type="button" class="di-btn-ghost" id="di-symbol-add">➕ Adicionar novo</button>
          <button type="button" class="di-btn-danger" id="di-symbol-delete">🗑️ Remover atual</button>
        </div>
        <div class="di-symbol-engine-row">
          <label>Preview rápido</label>
          <div id="di-symbol-preview" style="font-size:1.2rem; padding:8px; border-radius:12px; background:rgba(0,0,0,0.3); text-align:center; transition: all 0.2s;">◉</div>
        </div>
        <div class="di-symbol-engine-row">
          <label>Símbolos atuais (arraste para reordenar)</label>
          <div class="di-symbol-engine-list" id="di-symbol-list"></div>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // eventos do painel
    qs("#di-symbol-close", panel)?.addEventListener("click", closePanel);
    qs("#di-symbol-save", panel)?.addEventListener("click", () => {
      const id = qs("#di-symbol-id").value.trim();
      if (!id) return;
      const label = qs("#di-symbol-label").value.trim() || "◉";
      const url = qs("#di-symbol-url").value.trim();
      const icon = qs("#di-symbol-icon").value.trim();
      const kind = qs("#di-symbol-kind").value;
      if (state.byId.has(id)) updateButton(id, { label, url, icon, kind });
      else addButton({ id, label, url, icon, kind });
      refreshPanelList();
      closePanel();
    });
    qs("#di-symbol-add", panel)?.addEventListener("click", () => {
      qs("#di-symbol-id").value = uid("btn");
      qs("#di-symbol-label").value = "";
      qs("#di-symbol-url").value = "";
      qs("#di-symbol-icon").value = "";
      qs("#di-symbol-kind").value = "link";
      qs("#di-symbol-id").focus();
    });
    qs("#di-symbol-delete", panel)?.addEventListener("click", () => {
      const id = qs("#di-symbol-id").value.trim();
      if (id && state.byId.has(id)) {
        deleteButton(id);
        refreshPanelList();
        closePanel();
      }
    });
    const idInput = qs("#di-symbol-id");
    idInput?.addEventListener("input", () => {
      const id = idInput.value.trim();
      const item = state.byId.get(id);
      if (item) {
        qs("#di-symbol-label").value = item.label || "";
        qs("#di-symbol-url").value = item.url || "";
        qs("#di-symbol-icon").value = item.icon || "";
        qs("#di-symbol-kind").value = item.kind || "link";
      }
      updatePreview();
    });
    const previewFields = ["di-symbol-label", "di-symbol-icon"];
    previewFields.forEach(f => qs(`#${f}`)?.addEventListener("input", updatePreview));
    function updatePreview() {
      const label = qs("#di-symbol-label").value.trim();
      const icon = qs("#di-symbol-icon").value.trim();
      const preview = qs("#di-symbol-preview");
      if (preview) preview.innerHTML = (icon || label || "◉");
    }
    refreshPanelList();
  }

  function refreshPanelList() {
    const listDiv = qs("#di-symbol-list");
    if (!listDiv) return;
    const items = [...state.buttons].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
    listDiv.innerHTML = items.map(item => `
      <div class="di-symbol-item" draggable="true" data-id="${esc(item.id)}">
        <div>
          <strong>${esc(item.label || "◉")} <span style="opacity:.72">· ${esc(item.id)}</span></strong>
          <small>${esc(item.url || "(sem url)")}</small>
        </div>
        <div class="di-mini-actions">
          <button type="button" class="di-btn-ghost" data-action="edit">✎ Editar</button>
          <button type="button" class="di-btn-ghost" data-action="up">↑</button>
          <button type="button" class="di-btn-ghost" data-action="down">↓</button>
          <button type="button" class="di-btn-danger" data-action="del">✕</button>
        </div>
      </div>
    `).join("");
    // reorder via drag no próprio painel
    const itemsDivs = listDiv.querySelectorAll(".di-symbol-item");
    itemsDivs.forEach(div => {
      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", div.dataset.id);
        div.classList.add("is-dragging");
      });
      div.addEventListener("dragend", (e) => div.classList.remove("is-dragging"));
      div.addEventListener("dragover", (e) => e.preventDefault());
      div.addEventListener("drop", (e) => {
        e.preventDefault();
        const fromId = e.dataTransfer.getData("text/plain");
        const toId = div.dataset.id;
        if (fromId && toId && fromId !== toId) reorderById(fromId, toId);
        refreshPanelList();
      });
      div.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = div.dataset.id;
          const action = btn.dataset.action;
          if (action === "edit") openEditor(id);
          if (action === "del") deleteButton(id);
          if (action === "up" || action === "down") {
            const idx = state.buttons.findIndex(x => x.id === id);
            if (idx < 0) return;
            const newIdx = action === "up" ? idx-1 : idx+1;
            if (newIdx < 0 || newIdx >= state.buttons.length) return;
            const list = [...state.buttons];
            [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
            list.forEach((it, i) => it.order = i);
            saveButtons(list);
            refreshPanelList();
          }
        });
      });
    });
  }

  function openEditor(id) {
    const item = state.byId.get(id);
    if (!item) return;
    DI.currentEditId = id;
    ensurePanel();
    const panel = qs(`#${DI.panelId}`);
    const backdrop = qs(`#${DI.backdropId}`);
    backdrop.classList.add("is-open");
    panel.classList.add("is-open");
    qs("#di-symbol-id").value = item.id;
    qs("#di-symbol-label").value = item.label;
    qs("#di-symbol-url").value = item.url;
    qs("#di-symbol-icon").value = item.icon;
    qs("#di-symbol-kind").value = item.kind;
    updatePreview();
  }

  function closePanel() {
    const panel = qs(`#${DI.panelId}`);
    const backdrop = qs(`#${DI.backdropId}`);
    if (panel) panel.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    DI.currentEditId = null;
  }

  function bindManagedDelegation(zone) {
    if (!zone || zone.dataset.diBound === "1") return;
    zone.dataset.diBound = "1";
    zone.addEventListener("click", (e) => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      if (now() < DI.suppressClickUntil) return;
      const id = btn.dataset.id;
      const item = state.byId.get(id);
      if (item && (item.kind === "link" || item.kind === "iframe")) {
        e.preventDefault();
        openUrlInFrame(item.url);
      }
    });
    zone.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      clearTimeout(DI.pressTimer);
      DI.pressTimer = setTimeout(() => {
        openEditor(btn.dataset.id);
        DI.suppressClickUntil = now() + 500;
      }, 700);
    });
    ["pointerup","pointerleave","pointercancel"].forEach(ev => zone.addEventListener(ev, () => clearTimeout(DI.pressTimer)));
    zone.addEventListener("dragstart", (e) => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      DI.dragId = btn.dataset.id;
      e.dataTransfer.setData("text/plain", DI.dragId);
      e.dataTransfer.effectAllowed = "move";
    });
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      const target = e.target.closest(".di-managed-wrap");
      if (!target) return;
      e.preventDefault();
      const fromId = DI.dragId || e.dataTransfer.getData("text/plain");
      const toId = target.querySelector(".di-managed-button")?.dataset.id;
      if (fromId && toId) reorderById(fromId, toId);
    });
  }

  function attachToggleShortcut() {
    const toggle = qs(SELECTORS.bar + " #toggleBtn");
    if (toggle && !toggle.dataset.diShortcutBound) {
      toggle.dataset.diShortcutBound = "1";
      let timer;
      toggle.addEventListener("pointerdown", () => { timer = setTimeout(() => openPanel(), 2900); });
      toggle.addEventListener("pointerup", () => clearTimeout(timer));
      toggle.addEventListener("pointercancel", () => clearTimeout(timer));
    }
    window.addEventListener("keydown", (ev) => { if (ev.altKey && ev.key === "s") { ev.preventDefault(); openPanel(); } if (ev.key === "Escape") closePanel(); });
  }

  function boot() {
    if (DI.booted) return;
    DI.booted = true;
    ensurePanel();
    setupPostMessageHandshake();
    state.buttons = loadButtons();
    state.byId = new Map(state.buttons.map(x => [x.id, x]));
    render();
    attachToggleShortcut();
    window.addEventListener("storage", (ev) => {
      if (ev.key === DI.storageKey) {
        const newList = safeJsonParse(ev.newValue, []);
        if (Array.isArray(newList)) {
          state.buttons = newList.map((x,i) => normalizeItem(x,i));
          state.byId = new Map(state.buttons.map(x => [x.id,x]));
          render();
          refreshPanelList();
        }
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  window.DI_SunriseSymbolEngine = {
    openPanel, closePanel, addButton, updateButton, deleteButton, render,
    loadButtons: () => [...state.buttons],
    saveButtons,
    getById: (id) => state.byId.get(id)
  };
})();