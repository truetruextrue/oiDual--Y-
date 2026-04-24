/* di_loader_panel.v2.js
   Painel ZPR com tabs, zonas, export JSON e live preview
   Requer: window.di_loadApp() e, se existir, window.di_clearApp()
*/
(function (global) {
  "use strict";

  if (global.__DI_LOADER_PANEL_V2__) return;
  global.__DI_LOADER_PANEL_V2__ = true;

  const STORAGE_KEY = "di_loader_panel_v2_state";
  const ZONES_KEY = "di_loader_zones_v1";

  const DEFAULT_STATE = {
    target: "#app-root",
    mode: "replace",
    html: "",
    css: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/css/main.css",
    js: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/js/main.js",
    zoneName: "Minha ZPR",
    live: false,
    activeTab: "html"
  };

  function safeJSONParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function readState() {
    return { ...DEFAULT_STATE, ...safeJSONParse(localStorage.getItem(STORAGE_KEY), {}) };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function readZones() {
    const zones = safeJSONParse(localStorage.getItem(ZONES_KEY), []);
    return Array.isArray(zones) ? zones : [];
  }

  function saveZones(zones) {
    try {
      localStorage.setItem(ZONES_KEY, JSON.stringify(zones));
    } catch {}
  }

  function uid() {
    if (global.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "zpr_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(36);
  }

  function escapeHTML(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function splitLines(text) {
    return String(text ?? "")
      .split(/\n+/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function isLikelyHTMLBlock(text) {
    const t = String(text ?? "").trim();
    return /<\s*(html|head|body|div|section|aside|header|main|footer|script|style|link|meta)\b/i.test(t);
  }

  function normalizeHTMLInput(text) {
    const t = String(text ?? "").trim();
    if (!t) return [];
    if (isLikelyHTMLBlock(t) || /^\s*</.test(t)) return [t];
    return splitLines(t);
  }

  function normalizeAssetList(text) {
    return splitLines(text);
  }

  function collectFormState(panel) {
    const target = panel.querySelector("#di-lp-target").value.trim() || "#app-root";
    const mode = panel.querySelector("#di-lp-mode").value === "append" ? "append" : "replace";
    const html = panel.querySelector("#di-lp-html").value;
    const css = panel.querySelector("#di-lp-css").value;
    const js = panel.querySelector("#di-lp-js").value;
    const zoneName = panel.querySelector("#di-lp-zone-name").value.trim() || "Minha ZPR";
    const live = !!panel.querySelector("#di-lp-live").checked;
    const activeTab = panel.dataset.tab || "html";

    return { target, mode, html, css, js, zoneName, live, activeTab };
  }

  function applyFormState(panel, state) {
    panel.querySelector("#di-lp-target").value = state.target || "#app-root";
    panel.querySelector("#di-lp-mode").value = state.mode === "append" ? "append" : "replace";
    panel.querySelector("#di-lp-html").value = state.html || "";
    panel.querySelector("#di-lp-css").value = state.css || "";
    panel.querySelector("#di-lp-js").value = state.js || "";
    panel.querySelector("#di-lp-zone-name").value = state.zoneName || "Minha ZPR";
    panel.querySelector("#di-lp-live").checked = !!state.live;
    setTab(panel, state.activeTab || "html", false);
  }

  function ensureStyles() {
    if (document.getElementById("di-loader-panel-v2-styles")) return;

    const style = document.createElement("style");
    style.id = "di-loader-panel-v2-styles";
    style.textContent = `
      #di-loader-panel-v2 {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 2147483647;
        width: min(520px, calc(100vw - 24px));
        max-height: min(88vh, 920px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.90);
        backdrop-filter: blur(18px);
        box-shadow: 0 16px 48px rgba(0,0,0,.18);
        border: 1px solid rgba(0,0,0,.08);
        color: #111;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      #di-loader-panel-v2[data-collapsed="1"] {
        width: auto;
        max-height: none;
      }

      .di-lp2-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .di-lp2-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .di-lp2-title strong {
        font-size: 15px;
        line-height: 1.2;
      }

      .di-lp2-title span {
        font-size: 12px;
        opacity: .68;
      }

      .di-lp2-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .di-lp2-btn {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        background: #111;
        color: #fff;
      }

      .di-lp2-btn.secondary {
        background: rgba(17,17,17,.08);
        color: #111;
      }

      .di-lp2-btn.danger {
        background: #c62828;
        color: #fff;
      }

      .di-lp2-btn.ghost {
        background: rgba(17,17,17,.06);
        color: #111;
      }

      .di-lp2-tabs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .di-lp2-tab {
        border: 1px solid rgba(0,0,0,.10);
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(255,255,255,.92);
        font-weight: 700;
        cursor: pointer;
        font-size: 13px;
      }

      .di-lp2-tab[data-active="1"] {
        background: #111;
        color: #fff;
        border-color: #111;
      }

      .di-lp2-grid {
        display: grid;
        gap: 10px;
      }

      .di-lp2-row {
        display: grid;
        gap: 6px;
      }

      .di-lp2-row label {
        font-size: 12px;
        font-weight: 700;
        opacity: .78;
      }

      .di-lp2-row input,
      .di-lp2-row select,
      .di-lp2-row textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(0,0,0,.10);
        border-radius: 12px;
        background: rgba(255,255,255,.96);
        color: #111;
        outline: none;
        padding: 10px 12px;
        font-size: 13px;
      }

      .di-lp2-row textarea {
        min-height: 180px;
        resize: vertical;
        line-height: 1.4;
      }

      .di-lp2-panel {
        display: none;
      }

      .di-lp2-panel[data-visible="1"] {
        display: block;
      }

      .di-lp2-footer {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
      }

      .di-lp2-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 12px;
        opacity: .78;
      }

      .di-lp2-chip {
        border-radius: 999px;
        padding: 6px 10px;
        background: rgba(17,17,17,.06);
      }

      .di-lp2-preview {
        border-radius: 14px;
        border: 1px dashed rgba(0,0,0,.15);
        padding: 10px;
        background: rgba(255,255,255,.62);
        max-height: 150px;
        overflow: auto;
        font-size: 12px;
        line-height: 1.45;
      }

      .di-lp2-small {
        font-size: 12px;
        opacity: .72;
      }

      .di-lp2-inline {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .di-lp2-select {
        min-width: 0;
      }

      @media (max-width: 560px) {
        #di-loader-panel-v2 {
          left: 12px;
          right: 12px;
          width: auto;
        }
        .di-lp2-tabs {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createEl(tag, attrs = {}, html = "") {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "checked") el.checked = !!v;
      else el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  }

  function setTab(panel, tab, persist = true) {
    const next = tab === "css" || tab === "js" ? tab : "html";
    panel.dataset.tab = next;

    panel.querySelectorAll(".di-lp2-tab").forEach(btn => {
      btn.dataset.active = btn.dataset.tab === next ? "1" : "0";
    });

    panel.querySelectorAll(".di-lp2-panel").forEach(section => {
      section.dataset.visible = section.dataset.tab === next ? "1" : "0";
    });

    if (persist) {
      const s = collectFormState(panel);
      saveState(s);
    }
  }

  function renderZonesOptions(panel, selectedId = "") {
    const select = panel.querySelector("#di-lp-zone-select");
    if (!select) return;

    const zones = readZones();
    select.innerHTML = "";

    const empty = createEl("option", { value: "" }, "— Zonas salvas —");
    select.appendChild(empty);

    for (const zone of zones) {
      const opt = createEl("option", { value: zone.id }, zone.name || zone.id);
      if (zone.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    }
  }

  async function mountNow(panel) {
    const status = panel.querySelector("#di-lp-status");
    const s = collectFormState(panel);
    saveState(s);

    const htmlSources = normalizeHTMLInput(s.html);
    const cssList = normalizeAssetList(s.css);
    const jsList = normalizeAssetList(s.js);

    if (typeof global.di_loadApp !== "function") {
      status.textContent = "di_loadApp() não encontrado.";
      return;
    }

    status.textContent = "Montando...";

    try {
      await global.di_loadApp({
        target: s.target,
        mode: s.mode,
        html: htmlSources,
        css: cssList,
        js: jsList,
        importHeadLinks: true,
        importHeadScripts: true,
        importBodyScripts: true,
        cleanTargetBeforeMount: s.mode === "replace",
        preserveExistingChildren: s.mode === "append",
        signalName: "di-load-panel-v2"
      });

      status.textContent = `Montado em ${s.target}.`;
      syncPreview(panel);
    } catch (err) {
      console.error(err);
      status.textContent = "Falha ao montar.";
    }
  }

  function unmountNow(panel) {
    const status = panel.querySelector("#di-lp-status");
    const targetSel = panel.querySelector("#di-lp-target").value.trim() || "#app-root";
    const target = document.querySelector(targetSel);

    if (!target) {
      status.textContent = "Target não encontrado.";
      return;
    }

    if (typeof global.di_clearApp === "function") {
      try {
        global.di_clearApp(targetSel);
      } catch {
        target.innerHTML = "";
      }
    } else {
      target.innerHTML = "";
    }

    status.textContent = "Desmontado.";
    syncPreview(panel);
  }

  function syncPreview(panel) {
    const preview = panel.querySelector("#di-lp-preview");
    const target = panel.querySelector("#di-lp-target").value.trim() || "#app-root";
    const mode = panel.querySelector("#di-lp-mode").value;
    const htmlList = normalizeHTMLInput(panel.querySelector("#di-lp-html").value);
    const cssList = normalizeAssetList(panel.querySelector("#di-lp-css").value);
    const jsList = normalizeAssetList(panel.querySelector("#di-lp-js").value);
    const live = panel.querySelector("#di-lp-live").checked;
    const zoneName = panel.querySelector("#di-lp-zone-name").value.trim() || "Minha ZPR";

    preview.innerHTML = `
      <div><b>Zona:</b> ${escapeHTML(zoneName)}</div>
      <div><b>target:</b> ${escapeHTML(target)}</div>
      <div><b>mode:</b> ${escapeHTML(mode)}</div>
      <div><b>live:</b> ${live ? "on" : "off"}</div>
      <hr style="border:0;border-top:1px solid rgba(0,0,0,.08);margin:8px 0;">
      <div><b>html:</b> ${htmlList.length} item(s)</div>
      <div><b>css:</b> ${cssList.length} item(s)</div>
      <div><b>js:</b> ${jsList.length} item(s)</div>
      <div style="margin-top:8px; white-space:pre-wrap;">${
        escapeHTML(htmlList.slice(0, 2).join("\n\n") || "(vazio)")
      }</div>
    `;
  }

  function exportCurrentConfig(panel) {
    const s = collectFormState(panel);
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      config: {
        target: s.target,
        mode: s.mode,
        html: s.html,
        css: s.css,
        js: s.js,
        zoneName: s.zoneName,
        live: s.live
      }
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `di-zpr-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    const status = panel.querySelector("#di-lp-status");
    status.textContent = "JSON exportado.";
  }

  async function copyCurrentConfig(panel) {
    const s = collectFormState(panel);
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      config: {
        target: s.target,
        mode: s.mode,
        html: s.html,
        css: s.css,
        js: s.js,
        zoneName: s.zoneName,
        live: s.live
      }
    };
    const text = JSON.stringify(payload, null, 2);

    try {
      await navigator.clipboard.writeText(text);
      panel.querySelector("#di-lp-status").textContent = "JSON copiado.";
    } catch {
      panel.querySelector("#di-lp-status").textContent = "Não consegui copiar.";
    }
  }

  function saveZone(panel, overwriteId = "") {
    const s = collectFormState(panel);
    const zones = readZones();

    let zone = null;
    if (overwriteId) {
      zone = zones.find(z => z.id === overwriteId) || null;
    }

    if (!zone) {
      zone = { id: uid(), createdAt: new Date().toISOString() };
      zones.push(zone);
    }

    zone.name = s.zoneName || "Minha ZPR";
    zone.target = s.target;
    zone.mode = s.mode;
    zone.html = s.html;
    zone.css = s.css;
    zone.js = s.js;
    zone.live = s.live;
    zone.updatedAt = new Date().toISOString();

    saveZones(zones);
    renderZonesOptions(panel, zone.id);
    panel.querySelector("#di-lp-status").textContent = `Zona salva: ${zone.name}`;
  }

  function loadZone(panel, zoneId) {
    const zones = readZones();
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    applyFormState(panel, {
      target: zone.target,
      mode: zone.mode,
      html: zone.html,
      css: zone.css,
      js: zone.js,
      zoneName: zone.name,
      live: !!zone.live,
      activeTab: panel.dataset.tab || "html"
    });

    saveState(collectFormState(panel));
    syncPreview(panel);
    panel.querySelector("#di-lp-status").textContent = `Zona carregada: ${zone.name}`;
  }

  function deleteZone(panel, zoneId) {
    if (!zoneId) return;
    const zones = readZones().filter(z => z.id !== zoneId);
    saveZones(zones);
    renderZonesOptions(panel, "");
    panel.querySelector("#di-lp-status").textContent = "Zona removida.";
  }

  function mountPanel() {
    if (document.getElementById("di-loader-panel-v2")) return;

    ensureStyles();

    const state = readState();
    const panel = createEl("section", { id: "di-loader-panel-v2" });
    panel.dataset.collapsed = "0";
    panel.dataset.tab = state.activeTab || "html";

    panel.innerHTML = `
      <div class="di-lp2-head">
        <div class="di-lp2-title">
          <strong>DI Loader Panel · ZPR</strong>
          <span>tabs · zonas · JSON · live preview</span>
        </div>
        <div class="di-lp2-actions">
          <button class="di-lp2-btn secondary" id="di-lp-toggle">Recolher</button>
        </div>
      </div>

      <div class="di-lp2-tabs">
        <button class="di-lp2-tab" data-tab="html">HTML</button>
        <button class="di-lp2-tab" data-tab="css">CSS</button>
        <button class="di-lp2-tab" data-tab="js">JS</button>
      </div>

      <div class="di-lp2-grid">
        <div class="di-lp2-row">
          <label for="di-lp-zone-name">Nome da Zona</label>
          <input id="di-lp-zone-name" type="text" value="${escapeHTML(state.zoneName)}" placeholder="Minha ZPR">
        </div>

        <div class="di-lp2-row">
          <label for="di-lp-target">Target</label>
          <input id="di-lp-target" type="text" value="${escapeHTML(state.target)}" placeholder="#app-root">
        </div>

        <div class="di-lp2-row">
          <label for="di-lp-mode">Mode</label>
          <select id="di-lp-mode">
            <option value="replace">replace</option>
            <option value="append">append</option>
          </select>
        </div>

        <div class="di-lp2-row">
          <label for="di-lp-zone-select">Zonas salvas</label>
          <div class="di-lp2-inline">
            <select id="di-lp-zone-select" class="di-lp2-select" style="flex:1;min-width:0;"></select>
            <button class="di-lp2-btn ghost" id="di-lp-load-zone">Carregar</button>
            <button class="di-lp2-btn ghost" id="di-lp-save-zone">Salvar</button>
            <button class="di-lp2-btn danger" id="di-lp-delete-zone">Apagar</button>
          </div>
        </div>

        <div class="di-lp2-panel" data-tab="html" data-visible="0">
          <div class="di-lp2-row">
            <label for="di-lp-html">HTML</label>
            <textarea id="di-lp-html" placeholder="Cole HTML completo, fragmento, ou links um por linha...">${escapeHTML(state.html)}</textarea>
          </div>
        </div>

        <div class="di-lp2-panel" data-tab="css" data-visible="0">
          <div class="di-lp2-row">
            <label for="di-lp-css">CSS</label>
            <textarea id="di-lp-css" placeholder="Cole links CSS um por linha...">${escapeHTML(state.css)}</textarea>
          </div>
        </div>

        <div class="di-lp2-panel" data-tab="js" data-visible="0">
          <div class="di-lp2-row">
            <label for="di-lp-js">JS</label>
            <textarea id="di-lp-js" placeholder="Cole links JS um por linha...">${escapeHTML(state.js)}</textarea>
          </div>
        </div>

        <div class="di-lp2-row">
          <label>Controles</label>
          <div class="di-lp2-inline">
            <label class="di-lp2-inline" style="gap:6px;">
              <input id="di-lp-live" type="checkbox" ${state.live ? "checked" : ""}>
              <span style="font-size:13px;font-weight:700;">Live preview</span>
            </label>
            <button class="di-lp2-btn" id="di-lp-mount">Montar</button>
            <button class="di-lp2-btn danger" id="di-lp-unmount">Desmontar</button>
            <button class="di-lp2-btn secondary" id="di-lp-export">Export JSON</button>
            <button class="di-lp2-btn secondary" id="di-lp-copy">Copiar JSON</button>
          </div>
        </div>

        <div class="di-lp2-row">
          <label>Preview</label>
          <div class="di-lp2-preview" id="di-lp-preview"></div>
        </div>

        <div class="di-lp2-footer">
          <div class="di-lp2-meta">
            <span class="di-lp2-chip">HTML direto ou URL</span>
            <span class="di-lp2-chip">Múltiplos links por linha</span>
            <span class="di-lp2-chip">ZPR persistente</span>
          </div>
          <div class="di-lp2-small" id="di-lp-status">Pronto.</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const $ = (sel) => panel.querySelector(sel);
    const status = $("#di-lp-status");

    applyFormState(panel, state);
    renderZonesOptions(panel);

    let liveTimer = null;

    function scheduleLiveMount() {
      if (!$("#di-lp-live").checked) {
        syncPreview(panel);
        saveState(collectFormState(panel));
        return;
      }

      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        mountNow(panel);
      }, 500);

      syncPreview(panel);
      saveState(collectFormState(panel));
    }

    panel.querySelectorAll(".di-lp2-tab").forEach(btn => {
      btn.addEventListener("click", () => setTab(panel, btn.dataset.tab, true));
    });

    $("#di-lp-toggle").addEventListener("click", () => {
      const collapsed = panel.dataset.collapsed === "1";
      panel.dataset.collapsed = collapsed ? "0" : "1";
      panel.querySelector(".di-lp2-grid").style.display = collapsed ? "grid" : "none";
      $("#di-lp-toggle").textContent = collapsed ? "Recolher" : "Expandir";
    });

    $("#di-lp-mount").addEventListener("click", () => mountNow(panel));
    $("#di-lp-unmount").addEventListener("click", () => unmountNow(panel));
    $("#di-lp-export").addEventListener("click", () => exportCurrentConfig(panel));
    $("#di-lp-copy").addEventListener("click", () => copyCurrentConfig(panel));

    $("#di-lp-save-zone").addEventListener("click", () => {
      saveZone(panel);
    });

    $("#di-lp-load-zone").addEventListener("click", () => {
      const id = $("#di-lp-zone-select").value;
      if (!id) {
        status.textContent = "Escolhe uma zona.";
        return;
      }
      loadZone(panel, id);
    });

    $("#di-lp-delete-zone").addEventListener("click", () => {
      const id = $("#di-lp-zone-select").value;
      if (!id) {
        status.textContent = "Escolhe uma zona.";
        return;
      }
      deleteZone(panel, id);
    });

    [
      "#di-lp-target",
      "#di-lp-mode",
      "#di-lp-html",
      "#di-lp-css",
      "#di-lp-js",
      "#di-lp-zone-name",
      "#di-lp-live"
    ].forEach(sel => {
      const el = $(sel);
      el.addEventListener("input", scheduleLiveMount);
      el.addEventListener("change", scheduleLiveMount);
    });

    syncPreview(panel);
    saveState(collectFormState(panel));

    if (state.live) {
      mountNow(panel);
    }
  }

  function destroyPanel() {
    const panel = document.getElementById("di-loader-panel-v2");
    if (panel) panel.remove();
  }

  global.di_mountLoaderPanel = mountPanel;
  global.di_destroyLoaderPanel = destroyPanel;
  global.di_loaderPanelV2 = {
    mount: mountPanel,
    destroy: destroyPanel,
    readZones,
    saveZones
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  } else {
    mountPanel();
  }
})(window);
