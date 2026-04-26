(() => {
  "use strict";

  // ==================== ENGINE V3 ====================
  if (window.__diSunriseSymbolEngineV3) return;
  window.__diSunriseSymbolEngineV3 = true;

  const STORAGE_BUTTONS = "di_sym_v3_btns";
  const STORAGE_PRESETS = "di_sym_v3_presets";
  const ZONE_ID = "di-managed-symbol-zone";
  const PANEL_ID = "di-symbol-engine-panel-v3";
  const BACKDROP_ID = "di-symbol-backdrop-v3";
  const TOGGLE_ID = "di-symbol-toggle-v3";

  // ---------- helpers ----------
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const now = () => Date.now();
  const uid = () => "sym_" + Math.random().toString(36).slice(2, 10) + now().toString(36);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);

  const safeParse = (raw, fallback) => { try { return JSON.parse(raw); } catch { return fallback; } };

  // ---------- defaults ----------
  const DEFAULT_BUTTONS = [];
  const DEFAULT_PRESETS = {
    primary:   { label: "Voz 1", url: "./voz1.html", kind: "link", scope: "hud" },
    secondary: { label: "Voz 2", url: "./voz2.html", kind: "link", scope: "hud" }
  };

  // ---------- state ----------
  const state = {
    buttons: [],
    presets: { ...DEFAULT_PRESETS },
    resolver: null,
    dragId: null,
    pressTimer: null,
    suppressClick: 0,
    editingId: null
  };

  // ---------- normalização ----------
  function normalizeItem(item, i = 0) {
    const id = item?.id?.trim() || uid();
    const label = item?.label?.trim() || item?.icon?.trim() || "◉";
    const url = (() => {
      let u = String(item?.url ?? "").trim();
      if (!u || u.startsWith("javascript:") || u.startsWith("data:")) return "";
      if (/^(https?:|\/\/|\.?\/|#)/.test(u)) return u;
      return "./" + u.replace(/^\.\/+/, "");
    })();
    const icon = item?.icon?.trim() || "";
    const kind = item?.kind === "iframe" ? "iframe" : item?.kind === "custom" ? "custom" : "link";
    const scope = ["hud","panel","both"].includes(item?.scope) ? item.scope : "hud";
    const order = Number.isFinite(item?.order) ? item.order : i;
    const hidden = !!item?.hidden;
    return { id, label, url, icon, kind, scope, order, hidden };
  }

  // ---------- load / save ----------
  function loadButtons() {
    const raw = localStorage.getItem(STORAGE_BUTTONS);
    if (raw) {
      const arr = safeParse(raw, []);
      if (arr.length) return arr.map(normalizeItem);
    }
    // tenta ler do DOM existente
    const existing = qsa("#symbolBar .symbol-button[data-id]").filter(b => !["toggleBtn","btn-prev","btn-play","btn-next","btn-arch"].includes(b.id));
    if (existing.length) {
      const items = existing.map((el, i) => ({
        id: el.dataset.id || el.id || uid(),
        label: el.dataset.label || el.textContent.trim() || "◉",
        url: el.dataset.url || "",
        icon: el.dataset.icon || "",
        kind: el.dataset.kind || "link",
        scope: el.dataset.scope || "hud",
        order: i,
        hidden: false
      }));
      return items.map(normalizeItem);
    }
    return DEFAULT_BUTTONS;
  }

  function loadPresets() {
    const raw = localStorage.getItem(STORAGE_PRESETS);
    return raw ? { ...DEFAULT_PRESETS, ...safeParse(raw, {}) } : { ...DEFAULT_PRESETS };
  }

  function saveButtons() {
    const clean = state.buttons.map(normalizeItem);
    state.buttons = clean;
    localStorage.setItem(STORAGE_BUTTONS, JSON.stringify(clean));
    render();
    syncHud();
    refreshList();
  }

  function savePresets() {
    localStorage.setItem(STORAGE_PRESETS, JSON.stringify(state.presets));
  }

  // ---------- manipulação ----------
  function addButton(data) {
    const item = normalizeItem({ ...data, order: state.buttons.length });
    state.buttons.push(item);
    saveButtons();
  }

  function updateButton(id, patch) {
    const idx = state.buttons.findIndex(b => b.id === id);
    if (idx < 0) return;
    state.buttons[idx] = normalizeItem({ ...state.buttons[idx], ...patch, id });
    saveButtons();
  }

  function deleteButton(id) {
    state.buttons = state.buttons.filter(b => b.id !== id);
    saveButtons();
  }

  function reorder(fromId, toId) {
    if (fromId === toId) return;
    const fromIdx = state.buttons.findIndex(b => b.id === fromId);
    const toIdx = state.buttons.findIndex(b => b.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = state.buttons.splice(fromIdx, 1);
    state.buttons.splice(toIdx > fromIdx ? toIdx - 1 : toIdx, 0, moved);
    state.buttons.forEach((b, i) => b.order = i);
    saveButtons();
  }

  // ---------- render ----------
  function getBar() { return qs("#symbolBar"); }
  function getFrame() { return qs("#frame"); }

  function render() {
    const bar = getBar();
    if (!bar) return;
    let zone = qs("#" + ZONE_ID);
    if (!zone) {
      zone = document.createElement("div");
      zone.id = ZONE_ID;
      const hud = qs("#hudStatus", bar);
      bar.insertBefore(zone, hud || null);
    }

    // layout
    const isRow = bar.classList.contains("horizontal") || bar.classList.contains("snap-top") || bar.dataset.layout === "row";
    bar.dataset.layout = isRow ? "row" : "column";
    bar.classList.toggle("symbol-bar--row", isRow);
    bar.classList.toggle("symbol-bar--column", !isRow);

    zone.innerHTML = "";
    const visible = state.buttons.filter(b => !b.hidden && b.scope !== "panel").sort((a,b) => a.order - b.order);

    visible.forEach(item => {
      const wrap = document.createElement("div");
      wrap.className = "symbol-wrap di-managed-wrap";
      wrap.dataset.id = item.id;

      const btn = document.createElement("button");
      btn.className = `symbol-button di-managed-button symbol-button--${item.kind}`;
      btn.dataset.id = item.id;
      btn.dataset.url = item.url;
      btn.dataset.label = item.label;
      btn.dataset.kind = item.kind;
      btn.dataset.scope = item.scope;
      btn.draggable = true;
      btn.type = "button";
      btn.title = item.label || item.id;
      btn.textContent = item.icon || item.label || "◉";

      wrap.appendChild(btn);
      zone.appendChild(wrap);
    });

    bindZoneDelegation(zone);
    syncHud();
  }

  function syncHud() {
    const hud = qs("#hudStatus");
    if (!hud) return;
    const count = state.buttons.filter(b => b.scope !== "panel").length;
    hud.textContent = `KOBLLUX · ORB NEXUS · ${count} símbolo${count === 1 ? "" : "s"}`;
  }

  // ---------- URL / resolver ----------
  function openItem(item) {
    if (item.kind === "custom") {
      if (typeof state.resolver === "function") state.resolver(item);
      return;
    }
    // link ou iframe abrem no frame
    const frame = getFrame();
    if (frame) frame.src = item.url;
    else if (item.kind === "link") window.location.href = item.url;
    // else iframe sem frame não faz nada
  }

  function setResolver(fn) { state.resolver = typeof fn === "function" ? fn : null; }

  // ---------- panel ----------
  function ensurePanel() {
    if (qs("#" + PANEL_ID)) return;

    const backdrop = document.createElement("div");
    backdrop.id = BACKDROP_ID;
    backdrop.className = "di-backdrop";
    backdrop.onclick = closePanel;

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.className = "di-panel";
    panel.innerHTML = `
      <div class="di-panel-head">
        <span class="di-panel-title">SUNRISE SYMBOL ENGINE V3</span>
        <button class="di-btn-ghost" id="di-close-panel">✕</button>
      </div>
      <div class="di-panel-body">
        <div class="di-input-grid">
          <label>ID <input id="di-edit-id" placeholder="id único"></label>
          <label>Rótulo <input id="di-edit-label" placeholder="texto ou emoji"></label>
          <label>URL <input id="di-edit-url" placeholder="link, ./... , https://"></label>
          <label>Ícone opcional <input id="di-edit-icon" placeholder="emoji ou símbolo"></label>
          <label>Tipo
            <select id="di-edit-kind">
              <option value="link">Link</option>
              <option value="iframe">Iframe</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>Escopo
            <select id="di-edit-scope">
              <option value="hud">HUD</option>
              <option value="panel">Painel</option>
              <option value="both">HUD + Painel</option>
            </select>
          </label>
        </div>
        <div class="di-preset-buttons">
          <button class="di-btn-ghost" id="di-preset-primary">🎤 Aplicar Primária</button>
          <button class="di-btn-ghost" id="di-preset-secondary">🎙️ Aplicar Secundária</button>
          <button class="di-btn-ghost" id="di-save-presets">💾 Salvar Presets</button>
        </div>
        <div class="di-actions">
          <button class="di-btn-primary" id="di-save-btn">Salvar</button>
          <button class="di-btn-ghost" id="di-add-btn">+ Novo</button>
          <button class="di-btn-danger" id="di-del-btn">Remover</button>
        </div>
        <div class="di-list-title">Botões atuais</div>
        <div id="di-list" class="di-list"></div>
      </div>
    `;

    document.body.append(backdrop, panel);

    // events
    qs("#di-close-panel", panel).onclick = closePanel;

    const getId = () => qs("#di-edit-id").value.trim();
    const getLabel = () => qs("#di-edit-label").value.trim() || "◉";
    const getUrl = () => qs("#di-edit-url").value.trim();
    const getIcon = () => qs("#di-edit-icon").value.trim();
    const getKind = () => qs("#di-edit-kind").value;
    const getScope = () => qs("#di-edit-scope").value;

    const fillForm = (item) => {
      qs("#di-edit-id").value = item.id;
      qs("#di-edit-label").value = item.label || "";
      qs("#di-edit-url").value = item.url || "";
      qs("#di-edit-icon").value = item.icon || "";
      qs("#di-edit-kind").value = item.kind;
      qs("#di-edit-scope").value = item.scope;
    };

    qs("#di-save-btn").onclick = () => {
      const id = getId();
      if (!id) return alert("ID obrigatório");
      const exists = state.buttons.some(b => b.id === id);
      if (exists) {
        updateButton(id, { label: getLabel(), url: getUrl(), icon: getIcon(), kind: getKind(), scope: getScope() });
      } else {
        addButton({ id, label: getLabel(), url: getUrl(), icon: getIcon(), kind: getKind(), scope: getScope() });
      }
      closePanel();
    };

    qs("#di-add-btn").onclick = () => {
      fillForm({ id: uid(), label: "", url: "", icon: "", kind: "link", scope: "hud" });
      state.editingId = null;
    };

    qs("#di-del-btn").onclick = () => {
      const id = getId();
      if (id && state.buttons.some(b => b.id === id)) { deleteButton(id); closePanel(); }
    };

    qs("#di-preset-primary").onclick = () => fillForm(state.presets.primary);
    qs("#di-preset-secondary").onclick = () => fillForm(state.presets.secondary);
    qs("#di-save-presets").onclick = () => {
      state.presets.primary = { label: getLabel(), url: getUrl(), kind: getKind(), scope: getScope() };
      state.presets.secondary = { ...state.presets.secondary };
      savePresets();
      alert("Presets atualizados com os campos atuais!");
    };

    // live edit on ID change
    qs("#di-edit-id").onchange = function() {
      const it = state.buttons.find(b => b.id === this.value.trim());
      if (it) fillForm(it);
    };
  }

  function openPanel(itemId = null) {
    ensurePanel();
    qs("#" + BACKDROP_ID).classList.add("show");
    qs("#" + PANEL_ID).classList.add("show");
    if (itemId) {
      const item = state.buttons.find(b => b.id === itemId);
      if (item) {
        qs("#di-edit-id").value = item.id;
        qs("#di-edit-label").value = item.label || "";
        qs("#di-edit-url").value = item.url || "";
        qs("#di-edit-icon").value = item.icon || "";
        qs("#di-edit-kind").value = item.kind;
        qs("#di-edit-scope").value = item.scope;
        state.editingId = itemId;
      }
    }
    refreshList();
  }

  function closePanel() {
    qs("#" + BACKDROP_ID)?.classList.remove("show");
    qs("#" + PANEL_ID)?.classList.remove("show");
    state.editingId = null;
  }

  function refreshList() {
    const list = qs("#di-list");
    if (!list) return;
    list.innerHTML = state.buttons.sort((a,b) => a.order - b.order).map(b => `
      <div class="di-list-item" data-id="${b.id}">
        <div class="di-list-info">
          <strong>${esc(b.label)}</strong>
          <small>${esc(b.scope)} · ${esc(b.url || "(sem url)")}</small>
        </div>
        <div class="di-list-actions">
          <button data-action="edit">Editar</button>
          <button data-action="up">↑</button>
          <button data-action="down">↓</button>
          <button data-action="del">🗑</button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".di-list-item").forEach(row => {
      row.onclick = (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const action = btn.dataset.action;
        const id = row.dataset.id;
        const idx = state.buttons.findIndex(b => b.id === id);
        if (action === "edit") openPanel(id);
        if (action === "del") { deleteButton(id); refreshList(); render(); }
        if (action === "up" && idx > 0) { reorder(id, state.buttons[idx-1].id); refreshList(); }
        if (action === "down" && idx < state.buttons.length-1) { reorder(id, state.buttons[idx+1].id); refreshList(); }
      };
    });
  }

  // ---------- floating toggle ----------
  function ensureToggle() {
    if (qs("#" + TOGGLE_ID)) return;
    const btn = document.createElement("button");
    btn.id = TOGGLE_ID;
    btn.className = "di-floating-toggle";
    btn.textContent = "⚙️";
    btn.title = "Symbol Engine V3";
    btn.onclick = () => openPanel();
    document.body.appendChild(btn);
  }

  // ---------- drag / press delegation ----------
  function bindZoneDelegation(zone) {
    if (zone.dataset.bound) return;
    zone.dataset.bound = "1";

    zone.addEventListener("pointerdown", e => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      if (now() < state.suppressClick) { e.preventDefault(); return; }
      clearTimeout(state.pressTimer);
      state.pressTimer = setTimeout(() => {
        state.suppressClick = now() + 600;
        openPanel(btn.dataset.id);
      }, 700);
    });
    zone.addEventListener("pointerup", () => clearTimeout(state.pressTimer));
    zone.addEventListener("pointerleave", () => clearTimeout(state.pressTimer));
    zone.addEventListener("pointercancel", () => clearTimeout(state.pressTimer));

    zone.addEventListener("click", e => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      if (now() < state.suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
      e.preventDefault();
      const item = state.buttons.find(b => b.id === btn.dataset.id);
      if (item) openItem(item);
    });

    // drag
    zone.addEventListener("dragstart", e => {
      const btn = e.target.closest(".di-managed-button");
      if (!btn) return;
      state.dragId = btn.dataset.id;
      btn.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", btn.dataset.id);
    });
    zone.addEventListener("dragend", e => {
      const btn = e.target.closest(".di-managed-button");
      if (btn) btn.classList.remove("dragging");
      zone.querySelectorAll(".drop-target").forEach(el => el.classList.remove("drop-target"));
    });
    zone.addEventListener("dragover", e => {
      const wrap = e.target.closest(".di-managed-wrap");
      if (!wrap) return;
      e.preventDefault();
      wrap.classList.add("drop-target");
    });
    zone.addEventListener("dragleave", e => {
      const wrap = e.target.closest(".di-managed-wrap");
      if (wrap) wrap.classList.remove("drop-target");
    });
    zone.addEventListener("drop", e => {
      e.preventDefault();
      const wrap = e.target.closest(".di-managed-wrap");
      if (!wrap) return;
      wrap.classList.remove("drop-target");
      const toId = wrap.dataset.id;
      if (state.dragId && toId) reorder(state.dragId, toId);
      state.dragId = null;
      refreshList();
    });
  }

  // ---------- init ----------
  function boot() {
    // css
    if (!qs("#di-symbol-v3-style")) {
      const style = document.createElement("style");
      style.id = "di-symbol-v3-style";
      style.textContent = `
        #${ZONE_ID} {
          display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
          margin: 6px 0 0; padding: 0;
        }
        .symbol-bar--column #${ZONE_ID} { flex-direction: column; align-items: stretch; }
        .symbol-bar--row #${ZONE_ID}    { flex-direction: row; align-items: center; }

        .di-managed-wrap { display: inline-flex; }
        .di-managed-button {
          font-size: 12px; padding: 4px 8px; border-radius: 8px;
          min-width: 32px; min-height: 32px; cursor: pointer;
          user-select: none; touch-action: manipulation;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s;
        }
        .di-managed-button.dragging { opacity: 0.5; transform: scale(0.95); }
        .di-managed-wrap.drop-target .di-managed-button {
          outline: 2px dashed rgba(255,255,255,0.6); outline-offset: 3px;
        }

        /* floating toggle */
        .di-floating-toggle {
          position: fixed; bottom: 20px; right: 20px; z-index: 2147483600;
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(20,20,30,0.9); border: 1px solid rgba(255,255,255,0.2);
          color: #fff; font-size: 22px; cursor: pointer;
          backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .di-floating-toggle:hover { transform: scale(1.1); }

        /* backdrop */
        .di-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px); z-index: 2147483500; display: none;
        }
        .di-backdrop.show { display: block; }

        /* panel */
        .di-panel {
          position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
          width: min(92vw, 460px); max-height: 85vh; z-index: 2147483601;
          background: linear-gradient(180deg, rgba(16,18,28,0.98), rgba(8,10,18,0.98));
          border: 1px solid rgba(255,255,255,0.12); border-radius: 18px;
          color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          display: none; flex-direction: column;
        }
        .di-panel.show { display: flex; animation: diPop 0.18s ease-out; }
        @keyframes diPop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        .di-panel-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .di-panel-title { font-weight: 800; font-size: 13px; letter-spacing: .04em; }
        .di-panel-body {
          padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
        }

        .di-input-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .di-input-grid label {
          font-size: 11px; opacity: 0.8; display: flex; flex-direction: column; gap: 3px;
        }
        .di-input-grid input, .di-input-grid select {
          padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06); color: #fff; font: inherit; outline: none;
        }
        .di-preset-buttons, .di-actions {
          display: flex; gap: 6px; flex-wrap: wrap;
        }
        .di-btn-primary, .di-btn-ghost, .di-btn-danger {
          padding: 6px 10px; border-radius: 8px; border: none; font-weight: 700;
          cursor: pointer; font-size: 12px;
        }
        .di-btn-primary { background: #fff; color: #000; }
        .di-btn-ghost { background: rgba(255,255,255,0.08); color: #fff; }
        .di-btn-danger { background: rgba(255,70,70,0.2); color: #ffb3b3; }

        .di-list-title { font-size: 12px; opacity: 0.7; margin-top: 4px; }
        .di-list { display: flex; flex-direction: column; gap: 6px; }
        .di-list-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 10px; border-radius: 10px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .di-list-info strong { font-size: 12px; display: block; }
        .di-list-info small { font-size: 10px; opacity: 0.6; }
        .di-list-actions { display: flex; gap: 4px; }
        .di-list-actions button {
          padding: 4px 6px; font-size: 11px; border-radius: 6px;
          background: rgba(255,255,255,0.05); color: #fff; border: none; cursor: pointer;
        }
      `;
      document.head.append(style);
    }

    state.buttons = loadButtons();
    state.presets = loadPresets();

    render();
    ensureToggle();
    ensurePanel();

    // atalhos
    window.addEventListener("keydown", e => {
      if (e.altKey && e.key.toLowerCase() === "s") { e.preventDefault(); openPanel(); }
      if (e.key === "Escape") closePanel();
    });

    // storage sync entre abas
    window.addEventListener("storage", e => {
      if (e.key === STORAGE_BUTTONS) {
        state.buttons = safeParse(e.newValue, []).map(normalizeItem);
        render(); refreshList();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // API global
  window.DI_SunriseSymbolEngineV3 = {
    openPanel, closePanel, addButton, updateButton, deleteButton,
    setResolver,
    getButtons: () => [...state.buttons],
    saveButtons, render
  };
})();
