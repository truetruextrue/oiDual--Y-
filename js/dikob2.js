(() => {
  "use strict";

  if (window.__diSunriseSymbolEngineReady) return;
  window.__diSunriseSymbolEngineReady = true;

  const DI = {
    storageKey: "di_symbol_buttons_v1",
    positionsKey: "di_symbol_positions_v1",
    zoneId: "di-managed-symbol-zone",
    innerId: "di-symbol-bar-inner",
    panelId: "di-symbol-engine-panel",
    backdropId: "di-symbol-engine-backdrop",
    haloId: "di-symbol-magnet-halo",
    currentEditId: null,
    pressTimer: null,
    dragId: null,
    suppressClickUntil: 0,
    draggingBar: false,
    dragBarPointerId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    booted: false,
    mode: "floating",
    collapsed: false
  };

  const FIXED_IDS = new Set([
    "toggleBtn",
    "btn-prev",
    "btn-play",
    "btn-next",
    "btn-arch"
  ]);

  const SELECTORS = {
    bar: ["#symbolBar", ".symbol-bar", ".symbol-bar.floating", ".symbol-dock", ".kob-tts-dock"],
    frame: "#frame",
    hud: "#hudStatus",
    orb: "#main-orb"
  };

  const DEFAULTS = [];

  const state = {
    buttons: [],
    byId: new Map(),
    bar: null,
    inner: null,
    hud: null,
    orb: null,
    positions: null,
    filterScope: "both"
  };

  const esc = (v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&lt;")
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
    const scope = String(item?.scope ?? "both").trim() || "both";
    return { id, label, url, icon, order, hidden, kind, scope };
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
    return qs(SELECTORS.orb);
  }

  function normalizePositions(obj) {
    const o = obj && typeof obj === "object" ? obj : {};
    return {
      left: Number.isFinite(o.left) ? o.left : null,
      top: Number.isFinite(o.top) ? o.top : null,
      mode: String(o.mode ?? "floating"),
      collapsed: Boolean(o.collapsed)
    };
  }

  function loadPositions() {
    return normalizePositions(safeJsonParse(localStorage.getItem(DI.positionsKey), null));
  }

  function savePositions() {
    localStorage.setItem(
      DI.positionsKey,
      JSON.stringify({
        left: state.positions?.left ?? null,
        top: state.positions?.top ?? null,
        mode: DI.mode,
        collapsed: DI.collapsed
      })
    );
  }

  function getManagedButtonElements() {
    const bar = state.bar || getBar();
    if (!bar) return [];
    return qsa(".symbol-button[data-id]", bar).filter((btn) => !FIXED_IDS.has(btn.id));
  }

  function captureInitialButtonsFromDOM() {
    const found = [];
    const els = getManagedButtonElements();

    els.forEach((btn, index) => {
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
            scope: btn.dataset.scope || "both"
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
      renderButtons();
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

  function ensureStyles() {
    if (qs("#di-sunrise-v3-style")) return;

    const style = document.createElement("style");
    style.id = "di-sunrise-v3-style";
    style.textContent = `
      .symbol-bar,
      .symbol-dock,
      .kob-tts-dock{
        position:fixed;
      }

      .symbol-bar-inner{
        display:flex;
        flex-direction:inherit;
        align-items:inherit;
        justify-content:inherit;
        gap:inherit;
        width:100%;
        height:100%;
        transform-origin:center;
        transition:transform .35s cubic-bezier(.2,.8,.2,1), opacity .35s ease;
        will-change:transform;
        backface-visibility:hidden;
      }

      .symbol-bar-inner.is-dragging-inner{
        transition:none !important;
      }

      .symbol-bar .magnet-halo,
      .symbol-dock .magnet-halo,
      .kob-tts-dock .magnet-halo{
        position:absolute;
        inset:-8px;
        border-radius:inherit;
        pointer-events:none;
        opacity:0;
        transition:opacity .16s ease;
        background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--kob-voice-primary) 20%, transparent));
        filter:blur(8px);
      }

      .symbol-bar.magnet-preview .magnet-halo,
      .symbol-dock.magnet-preview .magnet-halo,
      .kob-tts-dock.magnet-preview .magnet-halo{
        opacity:1;
      }

      .symbol-bar .hud-info,
      .symbol-dock .hud-info,
      .kob-tts-dock .hud-info{
        flex-shrink:0;
      }

      .symbol-bar[data-layout="row"] .symbol-bar-inner,
      .symbol-dock[data-layout="row"] .symbol-bar-inner,
      .kob-tts-dock[data-layout="row"] .symbol-bar-inner{
        flex-direction:row;
      }

      .symbol-bar[data-layout="column"] .symbol-bar-inner,
      .symbol-dock[data-layout="column"] .symbol-bar-inner,
      .kob-tts-dock[data-layout="column"] .symbol-bar-inner{
        flex-direction:column;
      }

      .symbol-bar[data-layout="row"] .symbol-button,
      .symbol-dock[data-layout="row"] .symbol-button,
      .kob-tts-dock[data-layout="row"] .symbol-button{
        width:44px;
        height:44px;
        min-width:44px;
        min-height:44px;
      }

      .symbol-bar[data-layout="column"] .symbol-button,
      .symbol-dock[data-layout="column"] .symbol-button,
      .kob-tts-dock[data-layout="column"] .symbol-button{
        width:48px;
        height:48px;
        min-width:48px;
        min-height:48px;
      }

      .symbol-bar[data-hud-state="collapsed"] .symbol-bar-inner,
      .symbol-dock[data-hud-state="collapsed"] .symbol-bar-inner,
      .kob-tts-dock[data-hud-state="collapsed"] .symbol-bar-inner{
        overflow:hidden;
      }

      .symbol-bar[data-hud-state="collapsed"][data-layout="column"] .symbol-bar-inner,
      .symbol-dock[data-hud-state="collapsed"][data-layout="column"] .symbol-bar-inner,
      .kob-tts-dock[data-hud-state="collapsed"][data-layout="column"] .symbol-bar-inner{
        transform:scaleX(.58) scaleY(.18);
      }

      .symbol-bar[data-hud-state="collapsed"][data-layout="row"] .symbol-bar-inner,
      .symbol-dock[data-hud-state="collapsed"][data-layout="row"] .symbol-bar-inner,
      .kob-tts-dock[data-hud-state="collapsed"][data-layout="row"] .symbol-bar-inner{
        transform:scaleX(.18) scaleY(.58);
      }

      .symbol-bar[data-hud-state="open"][data-layout="column"] .symbol-bar-inner,
      .symbol-dock[data-hud-state="open"][data-layout="column"] .symbol-bar-inner,
      .kob-tts-dock[data-hud-state="open"][data-layout="column"] .symbol-bar-inner{
        transform:scaleX(1) scaleY(1);
      }

      .symbol-bar[data-hud-state="open"][data-layout="row"] .symbol-bar-inner,
      .symbol-dock[data-hud-state="open"][data-layout="row"] .symbol-bar-inner,
      .kob-tts-dock[data-hud-state="open"][data-layout="row"] .symbol-bar-inner{
        transform:scaleX(1) scaleY(1);
      }

      .symbol-bar .orb-sync,
      .symbol-dock .orb-sync,
      .kob-tts-dock .orb-sync{
        will-change:transform, filter;
      }

      .orb-sync-active #main-orb,
      .orb-sync-active .orb,
      .orb-sync-active .orb-core{
        filter:drop-shadow(0 0 12px color-mix(in srgb, var(--kob-voice-primary) 55%, transparent));
      }

      .orb-sync-pulse #main-orb,
      .orb-sync-pulse .orb,
      .orb-sync-pulse .orb-core{
        animation: diOrbPulse .7s ease-out 1;
      }

      @keyframes diOrbPulse{
        0%{ transform:scale(1); }
        40%{ transform:scale(1.08); }
        100%{ transform:scale(1); }
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

  function ensureBar() {
    const bar = state.bar || getBar();
    if (!bar) return null;
    state.bar = bar;

    if (!bar.dataset.diHudState) bar.dataset.diHudState = "open";
    if (!bar.dataset.layout) bar.dataset.layout = "column";

    const existingInner = qs(`#${DI.innerId}`, bar);
    if (existingInner) {
      state.inner = existingInner;
    } else {
      const inner = document.createElement("div");
      inner.id = DI.innerId;
      inner.className = "symbol-bar-inner";

      const halo = qs(`#${DI.haloId}`, bar);
      const hud = qs(SELECTORS.hud, bar);

      const children = [...bar.children].filter((node) => node !== hud && node !== halo);
      if (!halo) {
        const haloEl = document.createElement("div");
        haloEl.id = DI.haloId;
        haloEl.className = "magnet-halo";
        bar.appendChild(haloEl);
      }

      if (children.length) {
        children.forEach((node) => inner.appendChild(node));
      }

      bar.insertBefore(inner, hud || null);
      state.inner = inner;
    }

    const hud = qs(SELECTORS.hud, bar) || getHud();
    state.hud = hud || null;
    state.orb = getOrb();

    return bar;
  }

  function setLayout(mode) {
    const bar = ensureBar();
    if (!bar) return;

    DI.mode = mode === "top" ? "row" : "column";
    bar.dataset.layout = DI.mode;

    bar.classList.toggle("snap-top", mode === "top");
    bar.classList.toggle("horizontal", mode === "top");
    bar.classList.toggle("snap-side", mode === "side-left");
    bar.classList.toggle("snap-side-right", mode === "side-right");
    bar.classList.toggle("floating", mode === "floating");

    if (mode === "top") {
      bar.style.flexDirection = "row";
    } else {
      bar.style.flexDirection = "column";
    }

    savePositions();
  }

  function setHudState(collapsed) {
    const bar = ensureBar();
    if (!bar) return;

    DI.collapsed = Boolean(collapsed);
    bar.dataset.hudState = DI.collapsed ? "collapsed" : "open";
    bar.classList.toggle("collapsed", DI.collapsed);
    savePositions();
  }

  function applyPositionFromStorage() {
    const bar = ensureBar();
    if (!bar) return;

    const pos = state.positions || loadPositions();
    state.positions = pos;

    if (pos.left !== null) bar.style.left = `${pos.left}px`;
    if (pos.top !== null) bar.style.top = `${pos.top}px`;

    if (pos.mode) {
      if (pos.mode === "top") setLayout("top");
      else if (pos.mode === "side-left") setLayout("side-left");
      else if (pos.mode === "side-right") setLayout("side-right");
      else setLayout("floating");
    } else {
      setLayout("floating");
    }

    setHudState(Boolean(pos.collapsed));
  }

  function measureBarRect() {
    const bar = ensureBar();
    if (!bar) return null;
    return bar.getBoundingClientRect();
  }

  function viewport() {
    return {
      w: window.innerWidth,
      h: window.innerHeight
    };
  }

  function decideSnapFromPoint(x, y) {
    const { w, h } = viewport();
    const threshold = 120;

    const top = y <= threshold;
    const left = x <= threshold;
    const right = x >= w - threshold;

    if (top) return "top";
    if (left) return "side-left";
    if (right) return "side-right";
    return "floating";
  }

  function updateMagnetPreview(x, y) {
    const bar = ensureBar();
    if (!bar) return;

    const snap = decideSnapFromPoint(x, y);
    bar.classList.toggle("magnet-preview", snap !== "floating");

    if (snap === "top") {
      bar.classList.add("snap-top");
      bar.classList.remove("snap-side", "snap-side-right");
    } else if (snap === "side-left") {
      bar.classList.add("snap-side");
      bar.classList.remove("snap-top", "snap-side-right");
    } else if (snap === "side-right") {
      bar.classList.add("snap-side-right");
      bar.classList.remove("snap-top", "snap-side");
    } else {
      bar.classList.remove("snap-top", "snap-side", "snap-side-right");
    }

    if (bar.classList.contains("magnet-preview")) {
      bar.classList.add("connected");
    } else {
      bar.classList.remove("connected");
    }
  }

  function commitSnapFromPoint(x, y) {
    const bar = ensureBar();
    if (!bar) return;

    const snap = decideSnapFromPoint(x, y);
    if (snap === "top") {
      setLayout("top");
      bar.style.left = "50%";
      bar.style.top = "10px";
      bar.style.transform = "translateX(-50%)";
    } else if (snap === "side-left") {
      setLayout("side-left");
      bar.style.left = "0px";
      bar.style.top = "28%";
      bar.style.transform = "none";
    } else if (snap === "side-right") {
      setLayout("side-right");
      bar.style.left = "auto";
      bar.style.right = "0px";
      bar.style.top = "28%";
      bar.style.transform = "none";
    } else {
      setLayout("floating");
    }

    bar.classList.remove("magnet-preview", "connected");
    savePositions();
  }

  function pulseOrb(level = 1) {
    const orb = state.orb || getOrb();
    if (!orb) return;

    orb.classList.add("orb-sync-active");
    orb.classList.add("orb-sync-pulse");

    const intensity = Math.max(0.85, Math.min(1.18, 1 + level * 0.04));
    orb.style.setProperty("--di-orb-scale", String(intensity));
    orb.style.setProperty("--di-orb-glow", String(0.35 + level * 0.08));

    clearTimeout(pulseOrb._t);
    pulseOrb._t = setTimeout(() => {
      orb.classList.remove("orb-sync-pulse");
    }, 720);
  }

  function syncOrbFromTarget(target, kind = "hover") {
    const orb = state.orb || getOrb();
    const bar = ensureBar();
    if (!orb || !bar) return;

    const button = target?.closest?.(".symbol-button");
    const wrap = target?.closest?.(".symbol-wrap");
    const hasFocus = Boolean(button || wrap);

    orb.classList.toggle("orb-sync-active", hasFocus);
    bar.classList.toggle("orb-sync-active", hasFocus);

    const label = button?.dataset?.label || button?.textContent || "";
    const id = button?.dataset?.id || "";
    const url = button?.dataset?.url || "";

    orb.dataset.diOrbState = hasFocus ? "active" : "idle";
    if (label) orb.dataset.diOrbLabel = label;
    if (id) orb.dataset.diOrbId = id;

    if (kind === "press" || kind === "drag" || kind === "focus") {
      pulseOrb(kind === "drag" ? 2 : 1);
    }

    if (button) {
      button.classList.add("orb-sync");
      clearTimeout(syncOrbFromTarget._t);
      syncOrbFromTarget._t = setTimeout(() => {
        button.classList.remove("orb-sync");
      }, 250);
    }

    if (url) {
      bar.dataset.diOrbUrl = url;
    }
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
        scope: data.scope || "both"
      },
      state.buttons.length
    );

    saveButtons([...state.buttons, item]);
  }

  function matchesScope(item) {
    if (state.filterScope === "both") return true;
    return (item.scope || "both") === state.filterScope;
  }

  function renderButtons() {
    const bar = ensureBar();
    if (!bar) return;

    const inner = state.inner || qs(`#${DI.innerId}`, bar);
    if (!inner) return;

    const list = [...state.buttons]
      .map((x, i) => normalizeItem(x, i))
      .filter((x) => !x.hidden)
      .filter(matchesScope)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    state.buttons = list;
    state.byId = new Map(list.map((x) => [x.id, x]));

    inner.innerHTML = "";

    list.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "symbol-wrap di-managed-wrap";
      wrap.dataset.id = item.id;

      const btn = document.createElement("button");
      btn.className = `symbol-button di-managed-button symbol-button--managed symbol-button--${item.kind || "link"}`;
      btn.dataset.id = item.id;
      btn.dataset.url = item.url || "";
      btn.dataset.label = item.label || "";
      btn.dataset.kind = item.kind || "link";
      btn.dataset.scope = item.scope || "both";
      btn.draggable = true;
      btn.type = "button";
      btn.title = `${item.label || item.id}`;

      const content = item.icon ? item.icon : item.label || "◉";
      btn.innerHTML = esc(content);

      wrap.appendChild(btn);
      inner.appendChild(wrap);
    });

    ensurePanel();
    bindManagedDelegation(inner);
    syncHud();
  }

  function syncHud() {
    const hud = state.hud || getHud();
    if (!hud) return;
    const count = state.buttons.length;
    hud.textContent = `KOBLLUX · ORB NEXUS · ${count} símbolo${count === 1 ? "" : "s"}`;
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

    if (fId) fId.value = item.id;
    if (fLabel) fLabel.value = item.label || "";
    if (fUrl) fUrl.value = item.url || "";
    if (fIcon) fIcon.value = item.icon || "";
    if (fKind) fKind.value = item.kind || "link";
    if (fScope) fScope.value = item.scope || "both";
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
          <div class="di-symbol-engine-sub">HUD inteligente, snap real e orb sync</div>
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
            <option value="both">HUD + painel</option>
            <option value="hud">Só HUD</option>
            <option value="panel">Só painel</option>
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
      const scope = qs("#di-symbol-scope")?.value.trim() || "both";

      if (!id) return;

      const exists = state.byId.has(id);
      const payload = { id, label, url, icon, kind, scope };

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

      if (id) id.value = newid;
      if (label) label.value = "";
      if (url) url.value = "";
      if (icon) icon.value = "";
      if (kind) kind.value = "link";
      if (scope) scope.value = "both";
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

  function bindManagedDelegation(inner) {
    if (!inner || inner.dataset.diBound === "1") return;
    inner.dataset.diBound = "1";

    inner.addEventListener("click", (ev) => {
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

      syncOrbFromTarget(btn, "press");
    });

    inner.addEventListener("pointerdown", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      const id = btn.dataset.id;
      const item = state.byId.get(id);
      if (!item) return;

      clearTimeout(DI.pressTimer);
      btn.dataset.diEditing = "0";

      syncOrbFromTarget(btn, "press");

      DI.pressTimer = setTimeout(() => {
        btn.dataset.diEditing = "1";
        DI.suppressClickUntil = now() + 500;
        openEditor(id);
      }, 700);
    });

    inner.addEventListener("focusin", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;
      syncOrbFromTarget(btn, "focus");
    });

    const cancelPress = () => clearTimeout(DI.pressTimer);
    inner.addEventListener("pointerup", cancelPress);
    inner.addEventListener("pointerleave", cancelPress);
    inner.addEventListener("pointercancel", cancelPress);

    inner.addEventListener("dragstart", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (!btn) return;

      DI.dragId = btn.dataset.id;
      btn.classList.add("is-dragging");
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setData("text/plain", DI.dragId);

      syncOrbFromTarget(btn, "drag");
    });

    inner.addEventListener("dragend", (ev) => {
      const btn = ev.target.closest(".di-managed-button");
      if (btn) btn.classList.remove("is-dragging");
      inner.querySelectorAll(".is-drop-target").forEach((x) => x.classList.remove("is-drop-target"));
      DI.dragId = null;
    });

    inner.addEventListener("dragover", (ev) => {
      const target = ev.target.closest(".di-managed-wrap");
      if (!target) return;
      ev.preventDefault();
      target.classList.add("is-drop-target");
      syncOrbFromTarget(target, "drag");
    });

    inner.addEventListener("dragleave", (ev) => {
      const target = ev.target.closest(".di-managed-wrap");
      if (!target) return;
      target.classList.remove("is-drop-target");
    });

    inner.addEventListener("drop", (ev) => {
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
    const bar = ensureBar();
    if (!bar) return;

    const toggle = qs("#toggleBtn", bar);
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
      if (ev.key === "Escape") {
        closePanel();
        setHudState(false);
      }
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

  function bindBarMovement() {
    const bar = ensureBar();
    if (!bar || bar.dataset.diMoveBound === "1") return;
    bar.dataset.diMoveBound = "1";

    const startDrag = (ev) => {
      const target = ev.target.closest(".symbol-button, input, textarea, select, button");
      if (target) return;

      DI.draggingBar = true;
      DI.dragBarPointerId = ev.pointerId;
      bar.classList.add("dragging");
      bar.style.transition = "none";

      const rect = bar.getBoundingClientRect();
      DI.dragOffsetX = ev.clientX - rect.left;
      DI.dragOffsetY = ev.clientY - rect.top;

      bar.setPointerCapture?.(ev.pointerId);
      ev.preventDefault();
    };

    const moveDrag = (ev) => {
      if (!DI.draggingBar || ev.pointerId !== DI.dragBarPointerId) return;

      const { w, h } = viewport();
      const rect = bar.getBoundingClientRect();
      const nextLeft = Math.max(0, Math.min(w - rect.width, ev.clientX - DI.dragOffsetX));
      const nextTop = Math.max(0, Math.min(h - rect.height, ev.clientY - DI.dragOffsetY));

      bar.style.left = `${nextLeft}px`;
      bar.style.top = `${nextTop}px`;
      bar.style.right = "auto";
      bar.style.bottom = "auto";
      bar.style.transform = "none";

      updateMagnetPreview(ev.clientX, ev.clientY);

      const snap = decideSnapFromPoint(ev.clientX, ev.clientY);
      if (snap === "top") setLayout("top");
      else if (snap === "side-left") setLayout("side-left");
      else if (snap === "side-right") setLayout("side-right");
      else setLayout("floating");
    };

    const endDrag = (ev) => {
      if (!DI.draggingBar || ev.pointerId !== DI.dragBarPointerId) return;

      DI.draggingBar = false;
      DI.dragBarPointerId = null;
      bar.classList.remove("dragging");
      bar.classList.remove("magnet-preview", "connected");

      const x = ev.clientX;
      const y = ev.clientY;
      commitSnapFromPoint(x, y);

      bar.classList.remove("is-dragging");
      savePositions();

      bar.releasePointerCapture?.(ev.pointerId);
    };

    bar.addEventListener("pointerdown", startDrag);
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    bar.addEventListener("pointermove", (ev) => {
      if (DI.draggingBar) return;
      updateMagnetPreview(ev.clientX, ev.clientY);
    });

    bar.addEventListener("pointerleave", () => {
      if (DI.draggingBar) return;
      bar.classList.remove("magnet-preview", "connected");
    });

    bar.addEventListener("focusin", (ev) => {
      syncOrbFromTarget(ev.target, "focus");
    });

    bar.addEventListener("pointerover", (ev) => {
      syncOrbFromTarget(ev.target, "hover");
    });
  }

  function boot() {
    if (DI.booted) return;
    DI.booted = true;

    ensureStyles();
    state.bar = ensureBar();
    state.hud = getHud();
    state.orb = getOrb();
    state.positions = loadPositions();

    migrateDefaultsIfNeeded();
    state.buttons = loadButtons();
    state.byId = new Map(state.buttons.map((x) => [x.id, x]));

    ensureBar();
    applyPositionFromStorage();
    renderButtons();
    attachToggleShortcut();
    bindBarMovement();

    window.addEventListener("storage", (ev) => {
      if (ev.key === DI.storageKey) {
        const incoming = safeJsonParse(ev.newValue, []);
        if (!Array.isArray(incoming)) return;
        state.buttons = incoming.map((x, i) => normalizeItem(x, i)).filter(Boolean);
        state.byId = new Map(state.buttons.map((x) => [x.id, x]));
        renderButtons();
        refreshPanelList();
      }

      if (ev.key === DI.positionsKey) {
        state.positions = normalizePositions(safeJsonParse(ev.newValue, null));
        applyPositionFromStorage();
      }
    });

    window.addEventListener("di:symbol-buttons-updated", () => {
      refreshPanelList();
      syncHud();
    });

    syncHud();
  }

  window.DI_SunriseSymbolEngine = {
    openPanel,
    closePanel,
    addButton,
    updateButton,
    deleteButton,
    render: renderButtons,
    loadButtons: () => [...state.buttons],
    saveButtons: (list) => saveButtons(list),
    getById: (id) => state.byId.get(id) || null,
    setLayout,
    setHudState,
    setScope(scope = "both") {
      state.filterScope = scope;
      renderButtons();
    },
    syncOrb: syncOrbFromTarget,
    get bar() {
      return state.bar || getBar();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();