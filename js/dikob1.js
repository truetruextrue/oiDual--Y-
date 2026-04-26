(() => {
  "use strict";

  if (window.__diSunriseSymbolEngineV3Ready) return;
  window.__diSunriseSymbolEngineV3Ready = true;

  const DI = {
    storageKey: "di_symbol_buttons_v1",
    zoneId: "di-managed-symbol-zone",
    panelId: "di-symbol-engine-panel",
    backdropId: "di-symbol-engine-backdrop",
    currentEditId: null,
    pressTimer: null,
    dragId: null,
    suppressClickUntil: 0,
    booted: false,
    dockObserver: null,
    barObserver: null
  };

  const FIXED_IDS = new Set(["toggleBtn", "btn-prev", "btn-play", "btn-next", "btn-arch"]);

  const SELECTORS = {
    bar: ["#symbolBar", ".symbol-bar", ".symbol-bar.floating"],
    frame: "#frame",
    hud: "#hudStatus",
    orb: ["#main-orb", ".tts-orb-mini .orb", ".orb-mini", ".orb"]
  };

  const DEFAULTS = [];

  const state = {
    buttons: [],
    byId: new Map(),
    bar: null,
    zone: null,
    orb: null,
    dockMode: "floating",
    filterScope: "hud"
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

  function normalizeScope(value) {
    const v = String(value ?? "both").trim().toLowerCase();
    if (v === "panel" || v === "hud" || v === "both") return v;
    return "both";
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
    const scope = normalizeScope(item?.scope ?? "both");
    const dock = String(item?.dock ?? "").trim().toLowerCase();
    const group = String(item?.group ?? "").trim();
    const tags = Array.isArray(item?.tags) ? item.tags.map((x) => String(x).trim()).filter(Boolean) : [];
    return { id, label, url, icon, order, hidden, kind, scope, dock, group, tags };
  }

  function getBar() {
    for (const sel of SELECTORS.bar) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function getFrame() {
    return qs(SELECTORS.frame);
  }

  function getHud() {
    return qs(SELECTORS.hud);
  }

  function getOrb() {
    for (const sel of SELECTORS.orb) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function getManagedButtonElements() {
    const bar = getBar();
    if (!bar) return [];
    return qsa(".symbol-button[data-id]", bar).filter((btn) => !FIXED_IDS.has(btn.id));
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
            kind: btn.dataset.kind || "link",
            scope: btn.dataset.scope || "both",
            dock: btn.dataset.dock || "",
            group: btn.dataset.group || "",
            tags: String(btn.dataset.tags || "")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
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
        detail: { buttons: state.buttons }
      })
    );
  }

  function hashToHue(str) {
    let hash = 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 360;
  }

  function setOrbState(item, reason = "hover") {
    const orb = state.orb || getOrb();
    const bar = state.bar || getBar();
    if (!orb && !bar) return;

    const hue = hashToHue(item?.id || item?.label || item?.kind || "orb");
    const hue2 = (hue + 42) % 360;
    const tone = item?.kind === "custom" ? "custom" : item?.kind === "iframe" ? "iframe" : "link";

    if (bar) {
      bar.dataset.activeId = item?.id || "";
      bar.dataset.activeLabel = item?.label || "";
      bar.dataset.activeKind = tone;
      bar.dataset.orbReason = reason;
      bar.style.setProperty("--di-orb-hue", String(hue));
      bar.style.setProperty("--di-orb-hue2", String(hue2));
    }

    if (orb) {
      orb.dataset.state = reason;
      orb.dataset.activeKind = tone;
      orb.dataset.activeId = item?.id || "";
      orb.style.setProperty("--di-orb-hue", String(hue));
      orb.style.setProperty("--di-orb-hue2", String(hue2));
      orb.classList.remove("di-orb-hover", "di-orb-focus", "di-orb-drag", "di-orb-idle");
      orb.classList.add(
        reason === "drag" ? "di-orb-drag" :
        reason === "focus" ? "di-orb-focus" :
        reason === "hover" ? "di-orb-hover" : "di-orb-idle"
      );
    }

    const hud = getHud();
    if (hud) {
      const mode = state.dockMode || "floating";
      hud.textContent = `${item?.label || "KOBLLUX"} · ${mode.toUpperCase()} · ${tone.toUpperCase()}`;
    }
  }

  function resetOrbState() {
    const orb = state.orb || getOrb();
    if (orb) {
      orb.dataset.state = "idle";
      orb.classList.remove("di-orb-hover", "di-orb-focus", "di-orb-drag");
      orb.classList.add("di-orb-idle");
    }
    const hud = getHud();
    if (hud) syncHud();
  }

  function detectDockMode(bar) {
    if (!bar) return "floating";

    const classes = bar.classList;
    const dock = String(bar.dataset.dock || "").trim().toLowerCase();

    if (dock === "top") return "top";
    if (dock === "side-left") return "side-left";
    if (dock === "side-right") return "side-right";
    if (dock === "floating") return "floating";

    if (classes.contains("snap-top") || classes.contains("horizontal") || classes.contains("row")) return "top";
    if (classes.contains("snap-side-right")) return "side-right";
    if (classes.contains("snap-side")) return "side-left";

    if (classes.contains("floating")) return "floating";

    const rect = bar.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;

    if (!rect || !vw || !vh) return "floating";

    const distTop = Math.max(0, rect.top);
    const distLeft = Math.max(0, rect.left);
    const distRight = Math.max(0, vw - rect.right);
    const distBottom = Math.max(0, vh - rect.bottom);

    const min = Math.min(distTop, distLeft, distRight, distBottom);
    if (min === distTop) return "top";
    if (min === distLeft) return "side-left";
    if (min === distRight) return "side-right";
    return "floating";
  }

  function applyDockMode(bar, zone) {
    if (!bar || !zone) return;

    const mode = detectDockMode(bar);
    state.dockMode = mode;
    bar.dataset.dock = mode;
    zone.dataset.dock = mode;

    bar.classList.toggle("di-dock-top", mode === "top");
    bar.classList.toggle("di-dock-side-left", mode === "side-left");
    bar.classList.toggle("di-dock-side-right", mode === "side-right");
    bar.classList.toggle("di-dock-floating", mode === "floating");

    zone.classList.toggle("di-zone-top", mode === "top");
    zone.classList.toggle("di-zone-side", mode === "side-left" || mode === "side-right");
    zone.classList.toggle("di-zone-floating", mode === "floating");

    if (mode === "top") {
      zone.style.flexDirection = "row";
      zone.style.alignItems = "center";
      zone.style.justifyContent = "center";
    } else {
      zone.style.flexDirection = "column";
      zone.style.alignItems = "stretch";
      zone.style.justifyContent = "flex-start";
    }

    if (mode === "side-left" || mode === "side-right") {
      bar.classList.add("vertical-dock");
      bar.classList.remove("horizontal-dock");
    } else {
      bar.classList.remove("vertical-dock");
      if (mode === "top") bar.classList.add("horizontal-dock");
      else bar.classList.remove("horizontal-dock");
    }
  }

  function ensureStyles() {
    if (qs("#di-sunrise-symbol-style-v3")) return;

    const style = document.createElement("style");
    style.id = "di-sunrise-symbol-style-v3";
    style.textContent = `
      .di-managed-wrap{
        display:inline-flex;
        align-items:center;
        justify-content:center;
      }

      #${DI.zoneId}{
        display:flex;
        gap:10px;
        width:100%;
        margin:8px 0 0;
        padding:0;
        flex-direction:column;
        align-items:stretch;
      }

      #${DI.zoneId}.di-zone-top{
        flex-direction:row;
        align-items:center;
        justify-content:center;
        flex-wrap:wrap;
      }

      #${DI.zoneId}.di-zone-side{
        flex-direction:column;
        align-items:stretch;
        justify-content:flex-start;
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

      .di-managed-button[aria-pressed="true"]{
        box-shadow:0 0 0 1px color-mix(in srgb, var(--kob-voice-primary, #00e28b) 55%, transparent);
      }

      #${DI.zoneId} .symbol-wrap[data-scope="panel"]{
        opacity:.85;
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
        width:min(92vw, 460px);
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

      .di-orb-hover,
      .di-orb-focus,
      .di-orb-drag,
      .di-orb-idle{
        transition:transform .2s ease, filter .2s ease, opacity .2s ease, box-shadow .2s ease;
      }

      .di-orb-hover{
        transform:scale(1.05);
        filter:saturate(1.15);
      }

      .di-orb-focus{
        transform:scale(1.08);
        filter:saturate(1.25) brightness(1.05);
      }

      .di-orb-drag{
        transform:scale(1.12);
        filter:saturate(1.35) brightness(1.08);
      }
    `;
    document.head.appendChild(style);
  }

  function ensureManagedZone(bar) {
    if (!bar) return null;

    let zone = qs(`#${DI.zoneId}`, bar);
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
    const hud = getHud();
    if (!hud) return;
    const count = state.buttons.length;
    const mode = state.dockMode || "floating";
    hud.textContent = `KOBLLUX · ORB NEXUS · ${mode.toUpperCase()} · ${count} símbolo${count === 1 ? "" : "s"}`;
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
        kind: data.kind || "link",
        scope: data.scope || "both",
        dock: data.dock || "",
        group: data.group || "",
        tags: data.tags || []
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
    const fScope = qs("#di-symbol-scope");
    const fGroup = qs("#di-symbol-group");
    const fTags = qs("#di-symbol-tags");

    if (fId) fId.value = item.id;
    if (fLabel) fLabel.value = item.label || "";
    if (fUrl) fUrl.value = item.url || "";
    if (fIcon) fIcon.value = item.icon || "";
    if (fKind) fKind.value = item.kind || "link";
    if (fScope) fScope.value = item.scope || "both";
    if (fGroup) fGroup.value = item.group || "";
    if (fTags) fTags.value = (item.tags || []).join(", ");
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
          <div class="di-symbol-engine-title">Sunrise Symbol Engine V3</div>
          <div class="di-symbol-engine-sub">HUD inteligente · dock lateral/top · orb sync</div>
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

        <div class="di-symbol-engine-row">
          <label for="di-symbol-scope">Escopo</label>
          <select id="di-symbol-scope">
            <option value="both">HUD + Painel</option>
            <option value="hud">Só HUD</option>
            <option value="panel">Só Painel</option>
          </select>
        </div>

        <div class="di-symbol-engine-row">
          <label for="di-symbol-group">Grupo</label>
          <input id="di-symbol-group" placeholder="ex: work, study, tools" autocomplete="off" spellcheck="false">
        </div>

        <div class="di-symbol-engine-row">
          <label for="di-symbol-tags">Tags (separadas por vírgula)</label>
          <input id="di-symbol-tags" placeholder="focus, flow, media" autocomplete="off" spellcheck="false">
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
      const scope = qs("#di-symbol-scope")?.value.trim() || "both";
      const group = qs("#di-symbol-group")?.value.trim() || "";
      const tags = String(qs("#di-symbol-tags")?.value || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      if (!id) return;

      const exists = state.byId.has(id);
      const payload = { id, label, url, icon, kind, scope, group, tags };

      if (exists) updateButton(id, payload);
      else addButton(payload);

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
      const scope = qs("#di-symbol-scope");
      const group = qs("#di-symbol-group");
      const tags = qs("#di-symbol-tags");

      if (id) id.value = newid;
      if (label) label.value = "";
      if (url) url.value = "";
      if (icon) icon.value = "";
      if (kind) kind.value = "link";
      if (scope) scope.value = "both";
      if (group) group.value = "";
      if (tags) tags.value = "";
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
      qs("#di-symbol-scope").value = item.scope || "both";
      qs("#di-symbol-group").value = item.group || "";
      qs("#di-symbol-tags").value = (item.tags || []).join(", ");
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
      setOrbState(item, "focus");

      DI.pressTimer = setTimeout(() => {
        btn.dataset.diEditing = "1";
        DI.suppressClickUntil = now() + 500;
        openEditor(id);
      }, 700);
    });

    const cancelPress = () => clearTimeout(DI.pressTimer);
    zone.addEventListener("pointerup", cancelPress);
    zone.addEventListener("pointerleave", () => {
      cancelPress();
      resetOrbState();
    });
    zone.addEventListener("pointercancel", cancelPress);

    zone.addEventListener("pointerover", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;
      const item = state.byId.get(btn.dataset.id);
      if (!item) return;
      setOrbState(item, "hover");
    });

    zone.addEventListener("focusin", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;
      const item = state.byId.get(btn.dataset.id);
      if (!item) return;
      setOrbState(item, "focus");
    });

    zone.addEventListener("focusout", () => {
      resetOrbState();
    });

    zone.addEventListener("dragstart", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      DI.dragId = btn.dataset.id;
      btn.classList.add("is-dragging");
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", DI.dragId);

      const item = state.byId.get(DI.dragId);
      if (item) setOrbState(item, "drag");
    });

    zone.addEventListener("dragend", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (btn) btn.classList.remove("is-dragging");
      zone.querySelectorAll(".is-drop-target").forEach((x) => x.classList.remove("is-drop-target"));
      DI.dragId = null;
      resetOrbState();
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
      resetOrbState();
    });
  }

  function render() {
    const bar = getBar();
    state.bar = bar;
    state.orb = getOrb();

    if (!bar) return;

    const zone = ensureManagedZone(bar);
    state.zone = zone;
    if (!zone) return;

    applyDockMode(bar, zone);
    zone.innerHTML = "";

    const list = [...state.buttons]
      .map((x, i) => normalizeItem(x, i))
      .filter((x) => !x.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    state.buttons = list;
    state.byId = new Map(list.map((x) => [x.id, x]));

    list.forEach((item) => {
      const showInHud = item.scope !== "panel";
      if (!showInHud) return;

      const wrap = document.createElement("div");
      wrap.className = "symbol-wrap di-managed-wrap";
      wrap.dataset.id = item.id;
      wrap.dataset.scope = item.scope || "both";
      wrap.dataset.group = item.group || "";
      wrap.dataset.kind = item.kind || "link";

      const btn = document.createElement("button");
      btn.className = `symbol-button di-managed-button symbol-button--managed symbol-button--${item.kind || "link"}`;
      btn.dataset.id = item.id;
      btn.dataset.url = item.url || "";
      btn.dataset.label = item.label || "";
      btn.dataset.kind = item.kind || "link";
      btn.dataset.scope = item.scope || "both";
      btn.dataset.group = item.group || "";
      btn.dataset.tags = (item.tags || []).join(",");
      btn.draggable = true;
      btn.type = "button";
      btn.title = `${item.label || item.id}`;
      btn.setAttribute("aria-label", item.label || item.id);
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = esc(item.icon ? item.icon : item.label || "◉");

      wrap.appendChild(btn);
      zone.appendChild(wrap);
    });

    ensurePanel();
    bindManagedDelegation(zone);
    syncHud();
    setOrbState(state.buttons[0] || { id: "idle", label: "KOBLLUX", kind: "link" }, "idle");
  }

  function migrateDefaultsIfNeeded() {
    const saved = safeJsonParse(localStorage.getItem(DI.storageKey), null);
    if (Array.isArray(saved) && saved.length) return;

    const initial = captureInitialButtonsFromDOM();
    localStorage.setItem(DI.storageKey, JSON.stringify(initial));
  }

  function attachToggleShortcut() {
    const bar = getBar();
    const toggle = bar ? qs("#toggleBtn", bar) : null;

    if (toggle && toggle.dataset.diShortcutBound !== "1") {
      toggle.dataset.diShortcutBound = "1";
      toggle.addEventListener("pointerdown", () => {
        clearTimeout(DI.pressTimer);
        DI.pressTimer = setTimeout(() => openPanel(), 2900);
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

  function watchDockChanges() {
    const bar = getBar();
    if (!bar) return;

    if (DI.barObserver) DI.barObserver.disconnect();
    if (DI.dockObserver) DI.dockObserver.disconnect();

    DI.barObserver = new MutationObserver(() => {
      const current = getBar();
      if (!current) return;
      state.bar = current;
      state.orb = getOrb();

      const zone = ensureManagedZone(current);
      state.zone = zone;
      if (!zone) return;

      applyDockMode(current, zone);
      syncHud();
    });

    DI.barObserver.observe(bar, {
      attributes: true,
      attributeFilter: ["class", "style", "data-dock"]
    });

    DI.dockObserver = new ResizeObserver(() => {
      const current = getBar();
      if (!current) return;
      const zone = ensureManagedZone(current);
      if (!zone) return;
      applyDockMode(current, zone);
    });

    DI.dockObserver.observe(bar);
  }

  function attachGlobalSync() {
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

    window.addEventListener("resize", () => {
      const bar = getBar();
      if (!bar) return;
      const zone = ensureManagedZone(bar);
      if (!zone) return;
      applyDockMode(bar, zone);
    });
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
    watchDockChanges();
    attachGlobalSync();
  }

  window.DI_SunriseSymbolEngineV3 = {
    openPanel,
    closePanel,
    addButton,
    updateButton,
    deleteButton,
    render,
    loadButtons: () => [...state.buttons],
    saveButtons: (list) => saveButtons(list),
    getById: (id) => state.byId.get(id) || null,
    setOrbState,
    resetOrbState,
    getDockMode: () => state.dockMode,
    setFilterScope(scope = "hud") {
      state.filterScope = normalizeScope(scope);
      render();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();