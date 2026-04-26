(() => {
  "use strict";

  if (window.__diLinkmasterReady) return;
  window.__diLinkmasterReady = true;

  const LM = {
    storageKey: "di_playlist_v1",
    cachePrefix: "di_playlist_cache_",
    mountId: "di-linkmaster-root",
    searchId: "di-linkmaster-search",
    listId: "di-linkmaster-list",
    titleId: "di-linkmaster-title",
    countId: "di-linkmaster-count",
    importId: "di-linkmaster-import",
    exportId: "di-linkmaster-export",
    clearId: "di-linkmaster-clear",
    addId: "di-linkmaster-add",
    settingsId: "di-linkmaster-settings",
    frameSelector: "#frame",
    audioSelector: "#audioPlayer",
    maxDepth: 6,
    maxChildren: 50
  };

  const state = {
    playlist: null,
    filter: "",
    expanded: new Set(),
    resolver: null
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

  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
  }

  function safeParse(raw, fallback) {
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

  function normalizeTrack(track, index = 0) {
    const item = track && typeof track === "object" ? track : {};
    const id = String(item.id ?? "").trim() || uid(`track${index}`);
    const type = String(item.type ?? "link").trim() || "link";
    const url = normalizeUrl(item.url ?? "");
    const name = String(item.name ?? item.title ?? item.label ?? "Sem título").trim() || "Sem título";
    const artist = String(item.artist ?? "").trim();
    const cover = String(item.cover ?? "").trim();
    const tags = Array.isArray(item.tags) ? item.tags.map((x) => String(x).trim()).filter(Boolean) : [];
    const related = Array.isArray(item.related)
      ? item.related.map((x) => String(x).trim()).filter(Boolean)
      : [];
    const children = Array.isArray(item.children)
      ? item.children.map((x, i) => normalizeTrack(x, i))
      : [];
    const query = String(item.query ?? "").trim();
    const source = String(item.source ?? "").trim();
    const depth = Number.isFinite(item.depth) ? item.depth : 0;
    const hidden = Boolean(item.hidden);

    return {
      id,
      type,
      url,
      name,
      artist,
      cover,
      tags,
      related,
      children,
      query,
      source,
      depth,
      hidden
    };
  }

  function normalizePlaylist(input) {
    const raw = input && typeof input === "object" ? input : {};
    const tracks = Array.isArray(raw.tracks) ? raw.tracks.map((t, i) => normalizeTrack(t, i)) : [];

    return {
      id: String(raw.id ?? "playlist-root"),
      title: String(raw.title ?? "Linkmaster").trim() || "Linkmaster",
      mode: String(raw.mode ?? "infinite"),
      tracks,
      meta: raw.meta && typeof raw.meta === "object" ? raw.meta : {}
    };
  }

  function getDefaultPlaylist() {
    return normalizePlaylist({
      id: "playlist-root",
      title: "Linkmaster",
      mode: "infinite",
      tracks: []
    });
  }

  function loadPlaylist() {
    const raw = localStorage.getItem(LM.storageKey);
    const parsed = safeParse(raw, null);
    const playlist = parsed ? normalizePlaylist(parsed) : getDefaultPlaylist();
    state.playlist = playlist;
    return playlist;
  }

  function savePlaylist(playlist = state.playlist) {
    const normalized = normalizePlaylist(playlist || getDefaultPlaylist());
    state.playlist = normalized;
    localStorage.setItem(LM.storageKey, JSON.stringify(normalized));
    render();
    return normalized;
  }

  function clearPlaylist() {
    localStorage.removeItem(LM.storageKey);
    state.playlist = getDefaultPlaylist();
    render();
  }

  function dedupeTracks(tracks) {
    const seen = new Set();
    const out = [];

    for (const t of tracks) {
      const key = [t.id, t.url, t.name].join("::");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }

    return out;
  }

  function getFrame() {
    return qs(LM.frameSelector);
  }

  function getAudio() {
    return qs(LM.audioSelector);
  }

  function openTrack(track) {
    if (!track) return;

    const url = normalizeUrl(track.url);
    if (!url) return;

    const frame = getFrame();
    if (frame && (track.type === "link" || track.type === "iframe" || track.type === "page")) {
      frame.src = url;
      return;
    }

    const audio = getAudio();
    if (audio && (track.type === "audio" || track.type === "soundcloud" || track.type === "music")) {
      audio.src = url;
      const playPromise = audio.play?.();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      return;
    }

    window.location.href = url;
  }

  async function resolveDynamic(track, depth = 0) {
    if (!track || track.type !== "dynamic") return track;

    const cacheKey = `${LM.cachePrefix}${track.id}`;
    const cached = safeParse(localStorage.getItem(cacheKey), null);
    if (cached && Array.isArray(cached.tracks)) return normalizeTrackGroup(cached, depth);

    let resolved = null;

    if (typeof state.resolver === "function") {
      resolved = await state.resolver(track, { depth });
    }

    if (!resolved && Array.isArray(track.children) && track.children.length) {
      resolved = {
        id: track.id,
        title: track.name || track.query || "Dinâmico",
        tracks: track.children
      };
    }

    if (!resolved) {
      resolved = {
        id: track.id,
        title: track.name || track.query || "Dinâmico",
        tracks: []
      };
    }

    const normalized = normalizeTrackGroup(resolved, depth);
    localStorage.setItem(cacheKey, JSON.stringify(normalized));
    return normalized;
  }

  function normalizeTrackGroup(group, depth = 0) {
    const g = group && typeof group === "object" ? group : {};
    const tracks = Array.isArray(g.tracks) ? g.tracks.map((t, i) => normalizeTrack(t, i)) : [];
    return {
      id: String(g.id ?? uid("group")),
      title: String(g.title ?? "Grupo").trim() || "Grupo",
      tracks: dedupeTracks(tracks.map((t) => ({ ...t, depth })))
    };
  }

  function createMount() {
    let root = qs(`#${LM.mountId}`);
    if (root) return root;

    root = document.createElement("div");
    root.id = LM.mountId;
    root.innerHTML = `
      <div class="lm-shell">
        <div class="lm-head">
          <div class="lm-brand">
            <div class="lm-title" id="${LM.titleId}">Linkmaster</div>
            <div class="lm-count" id="${LM.countId}">0 itens</div>
          </div>
          <div class="lm-actions">
            <button type="button" id="${LM.addId}">＋</button>
            <button type="button" id="${LM.importId}">Importar</button>
            <button type="button" id="${LM.exportId}">Exportar</button>
            <button type="button" id="${LM.clearId}">Limpar</button>
          </div>
        </div>

        <div class="lm-toolbar">
          <input id="${LM.searchId}" type="search" placeholder="Buscar música, link, tag, artista..." autocomplete="off" spellcheck="false" />
          <button type="button" id="${LM.settingsId}">Resolver</button>
        </div>

        <div class="lm-list" id="${LM.listId}"></div>

        <input id="${LM.importId}_file" type="file" accept="application/json" hidden />
      </div>
    `;
    document.body.appendChild(root);
    ensureStyles();
    bindUI();
    return root;
  }

  function ensureStyles() {
    if (qs("#di-linkmaster-style")) return;

    const style = document.createElement("style");
    style.id = "di-linkmaster-style";
    style.textContent = `
      #${LM.mountId}{
        position:fixed;
        right:16px;
        bottom:16px;
        z-index:2147482999;
        width:min(92vw, 420px);
        max-height:min(82vh, 760px);
        pointer-events:auto;
      }

      #${LM.mountId} .lm-shell{
        display:flex;
        flex-direction:column;
        gap:10px;
        padding:14px;
        border-radius:22px;
        border:1px solid rgba(255,255,255,.12);
        background:linear-gradient(180deg, rgba(14,16,22,.95), rgba(8,10,14,.93));
        color:#fff;
        box-shadow:0 18px 70px rgba(0,0,0,.42);
        backdrop-filter:blur(12px);
        -webkit-backdrop-filter:blur(12px);
      }

      #${LM.mountId} .lm-head,
      #${LM.mountId} .lm-toolbar{
        display:flex;
        gap:10px;
        align-items:center;
      }

      #${LM.mountId} .lm-head{
        justify-content:space-between;
      }

      #${LM.mountId} .lm-brand{
        min-width:0;
      }

      #${LM.mountId} .lm-title{
        font-size:15px;
        font-weight:800;
        letter-spacing:.02em;
      }

      #${LM.mountId} .lm-count{
        font-size:12px;
        opacity:.72;
        margin-top:2px;
      }

      #${LM.mountId} .lm-actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      #${LM.mountId} button,
      #${LM.mountId} input{
        font:inherit;
      }

      #${LM.mountId} button{
        border:0;
        border-radius:12px;
        padding:10px 12px;
        cursor:pointer;
        background:rgba(255,255,255,.08);
        color:#fff;
      }

      #${LM.mountId} button:hover{
        background:rgba(255,255,255,.14);
      }

      #${LM.mountId} .lm-toolbar input{
        flex:1;
        min-width:0;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        color:#fff;
        padding:11px 12px;
        outline:none;
      }

      #${LM.mountId} .lm-toolbar input::placeholder{
        color:rgba(255,255,255,.44);
      }

      #${LM.mountId} .lm-list{
        display:flex;
        flex-direction:column;
        gap:8px;
        overflow:auto;
        max-height:calc(82vh - 120px);
        padding-right:2px;
      }

      #${LM.mountId} .lm-item{
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        border-radius:16px;
        overflow:hidden;
      }

      #${LM.mountId} .lm-item-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:11px 12px;
        cursor:pointer;
      }

      #${LM.mountId} .lm-item-left{
        min-width:0;
      }

      #${LM.mountId} .lm-item-title{
        font-size:13px;
        font-weight:700;
        line-height:1.25;
        word-break:break-word;
      }

      #${LM.mountId} .lm-item-meta{
        font-size:11px;
        opacity:.7;
        margin-top:3px;
        word-break:break-word;
      }

      #${LM.mountId} .lm-item-actions{
        display:flex;
        gap:8px;
        flex-shrink:0;
      }

      #${LM.mountId} .lm-item-actions button{
        padding:8px 10px;
        border-radius:10px;
      }

      #${LM.mountId} .lm-item-body{
        display:none;
        border-top:1px solid rgba(255,255,255,.08);
        padding:10px 12px 12px;
      }

      #${LM.mountId} .lm-item.expanded .lm-item-body{
        display:block;
      }

      #${LM.mountId} .lm-tags{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:8px;
      }

      #${LM.mountId} .lm-tag{
        font-size:11px;
        padding:4px 8px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
        opacity:.9;
      }

      #${LM.mountId} .lm-children{
        display:flex;
        flex-direction:column;
        gap:8px;
        margin-top:10px;
      }

      #${LM.mountId} .lm-child{
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
        padding:10px 11px;
        cursor:pointer;
      }

      #${LM.mountId} .lm-child strong{
        display:block;
        font-size:12px;
        line-height:1.25;
      }

      #${LM.mountId} .lm-child small{
        display:block;
        opacity:.7;
        margin-top:3px;
        word-break:break-all;
      }

      #${LM.mountId} .lm-empty{
        padding:18px 12px;
        opacity:.7;
        font-size:13px;
        text-align:center;
        border:1px dashed rgba(255,255,255,.12);
        border-radius:16px;
      }
    `;
    document.head.appendChild(style);
  }

  function bindUI() {
    const search = qs(`#${LM.searchId}`);
    const importBtn = qs(`#${LM.importId}`);
    const importFile = qs(`#${LM.importId}_file`);
    const exportBtn = qs(`#${LM.exportId}`);
    const clearBtn = qs(`#${LM.clearId}`);
    const addBtn = qs(`#${LM.addId}`);
    const settingsBtn = qs(`#${LM.settingsId}`);

    search?.addEventListener("input", () => {
      state.filter = search.value.trim().toLowerCase();
      render();
    });

    importBtn?.addEventListener("click", () => importFile?.click());

    importFile?.addEventListener("change", async () => {
      const file = importFile.files?.[0];
      if (!file) return;
      const text = await file.text();
      importPlaylistText(text);
      importFile.value = "";
    });

    exportBtn?.addEventListener("click", () => exportPlaylist());

    clearBtn?.addEventListener("click", () => {
      if (confirm("Limpar a playlist salva?")) clearPlaylist();
    });

    addBtn?.addEventListener("click", () => {
      const title = prompt("Título da nova faixa/seed:");
      if (!title) return;
      const url = prompt("URL ou caminho:");
      const id = uid("track");
      addTrack({
        id,
        type: "link",
        name: title,
        url: url || ""
      });
    });

    settingsBtn?.addEventListener("click", () => {
      const current = prompt(
        "Resolver dinâmico: digite 'ai', 'api' ou 'manual' para trocar o exemplo de resolver."
      );
      if (!current) return;

      if (current === "manual") {
        state.resolver = null;
        alert("Resolver dinâmico desativado.");
        return;
      }

      if (current === "ai") {
        state.resolver = async (track) => ({
          id: track.id,
          title: track.name || track.query || "Gerado por IA",
          tracks: []
        });
        alert("Resolver AI de exemplo ativado.");
        return;
      }

      if (current === "api") {
        state.resolver = async (track) => {
          const q = encodeURIComponent(track.query || track.name || "");
          const res = await fetch(`/api/linkmaster?q=${q}`);
          if (!res.ok) throw new Error("Falha na API");
          return await res.json();
        };
        alert("Resolver de API de exemplo ativado.");
      }
    });
  }

  function matchesFilter(track) {
    if (!state.filter) return true;
    const hay = [
      track.name,
      track.artist,
      track.url,
      track.type,
      ...(track.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    return hay.includes(state.filter);
  }

  function renderTrack(track, depth = 0) {
    if (track.hidden) return "";

    const hasChildren = Array.isArray(track.children) && track.children.length > 0;
    const hasRelated = Array.isArray(track.related) && track.related.length > 0;
    const expanded = state.expanded.has(track.id);

    const childrenHtml = hasChildren
      ? track.children
          .filter((child) => matchesFilter(child))
          .slice(0, LM.maxChildren)
          .map((child) => renderTrack(child, depth + 1))
          .join("")
      : "";

    const relatedHtml = hasRelated
      ? track.related
          .slice(0, LM.maxChildren)
          .map((rid) => {
            const found = findTrackById(rid);
            if (!found) return "";
            if (!matchesFilter(found)) return "";
            return `
              <div class="lm-child" data-open-id="${esc(found.id)}">
                <strong>${esc(found.name)}</strong>
                <small>${esc(found.artist || found.url || found.type)}</small>
              </div>
            `;
          })
          .join("")
      : "";

    const safeMeta = [
      track.artist ? esc(track.artist) : "",
      track.type ? esc(track.type) : "",
      track.url ? esc(track.url) : ""
    ]
      .filter(Boolean)
      .join(" · ");

    const tagsHtml = (track.tags || [])
      .slice(0, 8)
      .map((tag) => `<span class="lm-tag">${esc(tag)}</span>`)
      .join("");

    const marginLeft = Math.min(depth, LM.maxDepth) * 12;

    return `
      <div class="lm-item ${expanded ? "expanded" : ""}" data-track-id="${esc(track.id)}" style="margin-left:${marginLeft}px">
        <div class="lm-item-head" data-action="toggle">
          <div class="lm-item-left">
            <div class="lm-item-title">${esc(track.name)}</div>
            <div class="lm-item-meta">${safeMeta}</div>
          </div>
          <div class="lm-item-actions">
            <button type="button" data-action="open">Abrir</button>
            <button type="button" data-action="toggle">${expanded ? "−" : "+"}</button>
          </div>
        </div>

        <div class="lm-item-body">
          ${tagsHtml ? `<div class="lm-tags">${tagsHtml}</div>` : ""}
          ${track.type === "dynamic" ? `<div class="lm-item-meta" style="margin-top:10px">Seed dinâmica: ${esc(track.query || track.source || "")}</div>` : ""}
          ${relatedHtml ? `<div class="lm-children">${relatedHtml}</div>` : ""}
          ${childrenHtml ? `<div class="lm-children">${childrenHtml}</div>` : ""}
        </div>
      </div>
    `;
  }

  function findTrackById(id, root = state.playlist) {
    if (!root || !Array.isArray(root.tracks)) return null;

    const stack = [...root.tracks];
    while (stack.length) {
      const item = stack.shift();
      if (!item) continue;
      if (item.id === id) return item;
      if (Array.isArray(item.children) && item.children.length) stack.push(...item.children);
    }
    return null;
  }

  function findTrackGroupById(id, root = state.playlist) {
    if (!root || !Array.isArray(root.tracks)) return null;
    if (root.id === id) return root;
    return null;
  }

  async function expandDynamicIfNeeded(track) {
    if (!track || track.type !== "dynamic") return track;

    const resolved = await resolveDynamic(track, track.depth || 0);
    if (resolved && Array.isArray(resolved.tracks)) {
      track.children = resolved.tracks;
      return track;
    }
    return track;
  }

  async function handleAction(id, action) {
    const track = findTrackById(id);
    if (!track) return;

    if (action === "toggle") {
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);

      if (track.type === "dynamic" && !track.children.length) {
        await expandDynamicIfNeeded(track);
        savePlaylist();
      } else {
        render();
      }
      return;
    }

    if (action === "open") {
      if (track.type === "dynamic") {
        await expandDynamicIfNeeded(track);
        savePlaylist();
        state.expanded.add(id);
        render();
        return;
      }
      openTrack(track);
    }
  }

  function render() {
    createMount();

    const playlist = loadPlaylist();
    const list = qs(`#${LM.listId}`);
    const title = qs(`#${LM.titleId}`);
    const count = qs(`#${LM.countId}`);

    if (!list || !title || !count) return;

    title.textContent = playlist.title || "Linkmaster";

    const items = (playlist.tracks || [])
      .filter((t) => matchesFilter(t))
      .slice(0, 400);

    count.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
      list.innerHTML = `<div class="lm-empty">Sem itens na playlist.</div>`;
      return;
    }

    list.innerHTML = items.map((track) => renderTrack(track, 0)).join("");

    list.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const item = btn.closest(".lm-item");
        const id = item?.dataset.trackId;
        const action = btn.dataset.action;
        if (!id || !action) return;
        await handleAction(id, action);
      });
    });

    list.querySelectorAll("[data-track-id]").forEach((row) => {
      row.addEventListener("click", async (ev) => {
        const child = ev.target.closest("[data-open-id]");
        if (child) {
          const openId = child.dataset.openId;
          const found = findTrackById(openId);
          if (found) openTrack(found);
          return;
        }
      });
    });
  }

  function addTrack(track, parentId = null) {
    const playlist = loadPlaylist();
    const item = normalizeTrack(track, playlist.tracks.length);

    if (!parentId) {
      playlist.tracks.push(item);
      savePlaylist(playlist);
      return item;
    }

    const parent = findInTree(playlist.tracks, parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(item);
      savePlaylist(playlist);
    }
    return item;
  }

  function findInTree(list, id) {
    for (const item of list) {
      if (item.id === id) return item;
      if (Array.isArray(item.children) && item.children.length) {
        const found = findInTree(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function setPlaylist(data) {
    const playlist = normalizePlaylist(data);
    savePlaylist(playlist);
    return playlist;
  }

  function exportPlaylist(filename = "playlist.json") {
    const data = state.playlist || loadPlaylist();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importPlaylistText(text) {
    const parsed = safeParse(text, null);
    if (!parsed) {
      alert("JSON inválido.");
      return null;
    }
    return setPlaylist(parsed);
  }

  function useResolver(fn) {
    state.resolver = typeof fn === "function" ? fn : null;
  }

  function toggle(id) {
    if (state.expanded.has(id)) state.expanded.delete(id);
    else state.expanded.add(id);
    render();
  }

  function search(value) {
    state.filter = String(value ?? "").trim().toLowerCase();
    const input = qs(`#${LM.searchId}`);
    if (input && input.value !== value) input.value = value;
    render();
  }

  function init() {
    createMount();
    loadPlaylist();
    render();

    window.addEventListener("storage", (ev) => {
      if (ev.key !== LM.storageKey) return;
      loadPlaylist();
      render();
    });
  }

  window.DI_Linkmaster = {
    init,
    render,
    loadPlaylist,
    savePlaylist,
    setPlaylist,
    addTrack,
    clearPlaylist,
    exportPlaylist,
    importPlaylistText,
    useResolver,
    openTrack,
    toggle,
    search,
    resolveDynamic,
    get playlist() {
      return state.playlist;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

})();