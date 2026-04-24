/* di_loader_panel.v3.js
   Painel ZPR com:
   - Tabs HTML / CSS / JS / Tree
   - Zonas salvas
   - Preset slots
   - Import / export em lote
   - Mini árvore de componentes
   Requer: window.di_loadApp() e opcionalmente window.di_clearApp()
*/
(function (global) {
  "use strict";

  if (global.__DI_LOADER_PANEL_V3__) return;
  global.__DI_LOADER_PANEL_V3__ = true;

  const STORAGE_KEYS = {
    state: "di_loader_panel_v3_state",
    zones: "di_loader_zones_v2",
    presets: "di_loader_presets_v1",
  };

  const DEFAULT_STATE = {
    target: "#app-root",
    mode: "replace",
    html: "",
    css: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/css/main.css",
    js: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/js/main.js",
    zoneName: "Minha ZPR",
    presetName: "Slot 01",
    live: false,
    activeTab: "html",
    treeDepth: 4,
    treeFilter: ""
  };

  function safeJSONParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function readStore(key, fallback) {
    return { ...fallback, ...safeJSONParse(localStorage.getItem(key), {}) };
  }

  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function readArrayStore(key) {
    const v = safeJSONParse(localStorage.getItem(key), []);
    return Array.isArray(v) ? v : [];
  }

  function writeArrayStore(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
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
    return /<\s*(html|head|body|div|section|aside|header|main|footer|script|style|link|meta|nav|article|canvas|svg)\b/i.test(t);
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

  function cloneState(panel) {
    return {
      target: panel.querySelector("#di-lp-target").value.trim() || "#app-root",
      mode: panel.querySelector("#di-lp-mode").value === "append" ? "append" : "replace",
      html: panel.querySelector("#di-lp-html").value,
      css: panel.querySelector("#di-lp-css").value,
      js: panel.querySelector("#di-lp-js").value,
      zoneName: panel.querySelector("#di-lp-zone-name").value.trim() || "Minha ZPR",
      presetName: panel.querySelector("#di-lp-preset-name").value.trim() || "Slot 01",
      live: !!panel.querySelector("#di-lp-live").checked,
      activeTab: panel.dataset.tab || "html",
      treeDepth: Math.max(1, Math.min(8, Number(panel.querySelector("#di-lp-tree-depth").value) || 4)),
      treeFilter: panel.querySelector("#di-lp-tree-filter").value.trim() || ""
    };
  }

  function applyState(panel, state) {
    panel.querySelector("#di-lp-target").value = state.target || "#app-root";
    panel.querySelector("#di-lp-mode").value = state.mode === "append" ? "append" : "replace";
    panel.querySelector("#di-lp-html").value = state.html || "";
    panel.querySelector("#di-lp-css").value = state.css || "";
    panel.querySelector("#di-lp-js").value = state.js || "";
    panel.querySelector("#di-lp-zone-name").value = state.zoneName || "Minha ZPR";
    panel.querySelector("#di-lp-preset-name").value = state.presetName || "Slot 01";
    panel.querySelector("#di-lp-live").checked = !!state.live;
    panel.querySelector("#di-lp-tree-depth").value = String(state.treeDepth || 4);
    panel.querySelector("#di-lp-tree-filter").value = state.treeFilter || "";
    setTab(panel, state.activeTab || "html", false);
  }

  function readZones() {
    const zones = readArrayStore(STORAGE_KEYS.zones);
    return zones.filter(Boolean);
  }

  function saveZones(zones) {
    writeArrayStore(STORAGE_KEYS.zones, zones);
  }

  function readPresets() {
    const presets = readArrayStore(STORAGE_KEYS.presets);
    return presets.filter(Boolean);
  }

  function savePresets(presets) {
    writeArrayStore(STORAGE_KEYS.presets, presets);
  }

  function ensureStyles() {
    if (document.getElementById("di-loader-panel-v3-styles")) return;

    const style = document.createElement("style");
    style.id = "di-loader-panel-v3-styles";
    style.textContent = `
      #di-loader-panel-v3 {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 2147483647;
        width: min(720px, calc(100vw - 24px));
        max-height: min(92vh, 980px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 16px 48px rgba(0,0,0,.18);
        border: 1px solid rgba(0,0,0,.08);
        color: #111;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      #di-loader-panel-v3[data-collapsed="1"] {
        width: auto;
        max-height: none;
      }

      .di-lp3-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .di-lp3-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .di-lp3-title strong { font-size: 15px; line-height: 1.2; }
      .di-lp3-title span { font-size: 12px; opacity: .68; }

      .di-lp3-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .di-lp3-btn {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        background: #111;
        color: #fff;
      }

      .di-lp3-btn.secondary { background: rgba(17,17,17,.08); color: #111; }
      .di-lp3-btn.ghost { background: rgba(17,17,17,.06); color: #111; }
      .di-lp3-btn.danger { background: #c62828; color: #fff; }

      .di-lp3-tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .di-lp3-tab {
        border: 1px solid rgba(0,0,0,.10);
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(255,255,255,.92);
        font-weight: 700;
        cursor: pointer;
        font-size: 13px;
      }

      .di-lp3-tab[data-active="1"] {
        background: #111;
        color: #fff;
        border-color: #111;
      }

      .di-lp3-grid {
        display: grid;
        gap: 10px;
      }

      .di-lp3-row {
        display: grid;
        gap: 6px;
      }

      .di-lp3-row label {
        font-size: 12px;
        font-weight: 700;
        opacity: .78;
      }

      .di-lp3-row input,
      .di-lp3-row select,
      .di-lp3-row textarea {
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

      .di-lp3-row textarea {
        min-height: 180px;
        resize: vertical;
        line-height: 1.4;
      }

      .di-lp3-panel { display: none; }
      .di-lp3-panel[data-visible="1"] { display: block; }

      .di-lp3-inline {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }

      .di-lp3-footer {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
      }

      .di-lp3-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 12px;
        opacity: .78;
      }

      .di-lp3-chip {
        border-radius: 999px;
        padding: 6px 10px;
        background: rgba(17,17,17,.06);
      }

      .di-lp3-preview,
      .di-lp3-tree {
        border-radius: 14px;
        border: 1px dashed rgba(0,0,0,.15);
        padding: 10px;
        background: rgba(255,255,255,.62);
        max-height: 200px;
        overflow: auto;
        font-size: 12px;
        line-height: 1.45;
      }

      .di-lp3-tree {
        max-height: 320px;
      }

      .di-lp3-small {
        font-size: 12px;
        opacity: .72;
      }

      .di-lp3-tree-node {
        display: block;
        width: 100%;
        text-align: left;
        border: 0;
        background: transparent;
        padding: 4px 6px;
        margin: 0;
        cursor: pointer;
        color: inherit;
        font: inherit;
      }

      .di-lp3-tree-node:hover {
        background: rgba(17,17,17,.05);
        border-radius: 8px;
      }

      .di-lp3-tree-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .di-lp3-tree-indent {
        margin-left: 14px;
        border-left: 1px solid rgba(0,0,0,.08);
        padding-left: 10px;
      }

      .di-lp3-tree-muted {
        opacity: .68;
      }

      .di-lp3-tree-active {
        outline: 2px solid rgba(17,17,17,.12);
        background: rgba(17,17,17,.04);
        border-radius: 8px;
      }

      .di-lp3-compact {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .di-lp3-list {
        display: grid;
        gap: 6px;
      }

      .di-lp3-list-item {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,.08);
        background: rgba(255,255,255,.75);
      }

      .di-lp3-list-item b {
        font-size: 13px;
      }

      .di-lp3-list-item small {
        opacity: .68;
      }

      @media (max-width: 720px) {
        #di-loader-panel-v3 {
          left: 12px;
          right: 12px;
          width: auto;
        }
        .di-lp3-tabs {
          grid-template-columns: 1fr 1fr;
        }
        .di-lp3-compact {
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
      else if (k === "value") el.value = v;
      else el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  }

  function setTab(panel, tab, persist = true) {
    const next = ["html", "css", "js", "tree"].includes(tab) ? tab : "html";
    panel.dataset.tab = next;

    panel.querySelectorAll(".di-lp3-tab").forEach(btn => {
      btn.dataset.active = btn.dataset.tab === next ? "1" : "0";
    });

    panel.querySelectorAll(".di-lp3-panel").forEach(section => {
      section.dataset.visible = section.dataset.tab === next ? "1" : "0";
    });

    if (persist) saveState(panel);
    if (next === "tree") refreshTree(panel);
  }

  function saveState(panel) {
    writeStore(STORAGE_KEYS.state, cloneState(panel));
  }

  function getTargetEl(panel) {
    const sel = panel.querySelector("#di-lp-target").value.trim() || "#app-root";
    return document.querySelector(sel);
  }

  function refreshZonesSelect(panel, selectedId = "") {
    const select = panel.querySelector("#di-lp-zone-select");
    if (!select) return;
    const zones = readZones();

    select.innerHTML = "";
    select.appendChild(createEl("option", { value: "" }, "— Zonas salvas —"));

    for (const z of zones) {
      const opt = createEl("option", { value: z.id }, z.name || z.id);
      if (z.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function refreshPresetsSelect(panel, selectedId = "") {
    const select = panel.querySelector("#di-lp-preset-select");
    if (!select) return;
    const presets = readPresets();

    select.innerHTML = "";
    select.appendChild(createEl("option", { value: "" }, "— Slots salvos —"));

    for (const p of presets) {
      const opt = createEl("option", { value: p.id }, p.name || p.id);
      if (p.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    }
  }

  function serializeConfig(panel) {
    const s = cloneState(panel);
    return {
      version: 3,
      id: uid(),
      name: s.zoneName || "Minha ZPR",
      presetName: s.presetName || "Slot 01",
      target: s.target,
      mode: s.mode,
      html: s.html,
      css: s.css,
      js: s.js,
      live: s.live,
      treeDepth: s.treeDepth,
      treeFilter: s.treeFilter,
      updatedAt: new Date().toISOString()
    };
  }

  async function mountNow(panel) {
    const status = panel.querySelector("#di-lp-status");
    const s = cloneState(panel);
    saveState(panel);

    if (typeof global.di_loadApp !== "function") {
      status.textContent = "di_loadApp() não encontrado.";
      return;
    }

    const htmlSources = normalizeHTMLInput(s.html);
    const cssList = normalizeAssetList(s.css);
    const jsList = normalizeAssetList(s.js);

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
        signalName: "di-load-panel-v3"
      });

      status.textContent = `Montado em ${s.target}.`;
      syncPreview(panel);
      refreshTree(panel);
      attachTreeObserver(panel);
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
      try { global.di_clearApp(targetSel); } catch { target.innerHTML = ""; }
    } else {
      target.innerHTML = "";
    }

    status.textContent = "Desmontado.";
    syncPreview(panel);
    refreshTree(panel);
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
    const presetName = panel.querySelector("#di-lp-preset-name").value.trim() || "Slot 01";

    preview.innerHTML = `
      <div><b>Zona:</b> ${escapeHTML(zoneName)}</div>
      <div><b>Slot:</b> ${escapeHTML(presetName)}</div>
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

  function exportBlob(payload, filenamePrefix = "di-zpr-batch") {
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportAll(panel) {
    const payload = {
      version: 3,
      exportedAt: new Date().toISOString(),
      current: serializeConfig(panel),
      zones: readZones(),
      presets: readPresets()
    };
    exportBlob(payload, "di-zpr-batch");
    panel.querySelector("#di-lp-status").textContent = "Batch exportado.";
  }

  function exportCurrent(panel) {
    exportBlob({ version: 3, exportedAt: new Date().toISOString(), config: serializeConfig(panel) }, "di-zpr-config");
    panel.querySelector("#di-lp-status").textContent = "Config exportada.";
  }

  async function copyJSON(panel, scope = "current") {
    let payload;
    if (scope === "all") {
      payload = {
        version: 3,
        exportedAt: new Date().toISOString(),
        current: serializeConfig(panel),
        zones: readZones(),
        presets: readPresets()
      };
    } else {
      payload = {
        version: 3,
        exportedAt: new Date().toISOString(),
        config: serializeConfig(panel)
      };
    }

    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      panel.querySelector("#di-lp-status").textContent = "JSON copiado.";
    } catch {
      panel.querySelector("#di-lp-status").textContent = "Não consegui copiar.";
    }
  }

  function mergeById(existing, incoming) {
    const map = new Map();
    for (const item of existing) {
      if (item && item.id) map.set(item.id, item);
    }
    for (const item of incoming) {
      if (item && item.id) map.set(item.id, item);
    }
    return [...map.values()];
  }

  function importBatchObject(panel, obj) {
    const zones = Array.isArray(obj?.zones) ? obj.zones : [];
    const presets = Array.isArray(obj?.presets) ? obj.presets : [];
    const current = obj?.current || obj?.config || null;

    const replace = !!obj?.replace;

    if (replace) {
      if (zones.length) saveZones(zones);
      if (presets.length) savePresets(presets);
    } else {
      if (zones.length) saveZones(mergeById(readZones(), zones));
      if (presets.length) savePresets(mergeById(readPresets(), presets));
    }

    if (current && typeof current === "object") {
      applyState(panel, {
        target: current.target ?? DEFAULT_STATE.target,
        mode: current.mode ?? DEFAULT_STATE.mode,
        html: current.html ?? DEFAULT_STATE.html,
        css: current.css ?? DEFAULT_STATE.css,
        js: current.js ?? DEFAULT_STATE.js,
        zoneName: current.name || current.zoneName || DEFAULT_STATE.zoneName,
        presetName: current.presetName || DEFAULT_STATE.presetName,
        live: !!current.live,
        activeTab: panel.dataset.tab || "html",
        treeDepth: Number(current.treeDepth) || DEFAULT_STATE.treeDepth,
        treeFilter: current.treeFilter || ""
      });
    }

    refreshZonesSelect(panel);
    refreshPresetsSelect(panel);
    saveState(panel);
    syncPreview(panel);
    refreshTree(panel);
    panel.querySelector("#di-lp-status").textContent = "Batch importado.";
  }

  function importBatchFromFile(panel, file) {
    const status = panel.querySelector("#di-lp-status");
    if (!file) {
      status.textContent = "Nenhum arquivo.";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || "{}"));
        importBatchObject(panel, obj);
      } catch (err) {
        console.error(err);
        status.textContent = "JSON inválido.";
      }
    };
    reader.onerror = () => {
      status.textContent = "Falha ao ler arquivo.";
    };
    reader.readAsText(file);
  }

  function saveZone(panel) {
    const s = cloneState(panel);
    const zones = readZones();
    let zone = zones.find(z => z.name === s.zoneName && z.target === s.target && z.mode === s.mode) || null;
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
    zone.treeDepth = s.treeDepth;
    zone.treeFilter = s.treeFilter;
    zone.updatedAt = new Date().toISOString();

    saveZones(zones);
    refreshZonesSelect(panel, zone.id);
    panel.querySelector("#di-lp-status").textContent = `Zona salva: ${zone.name}`;
  }

  function loadZone(panel, zoneId) {
    const zone = readZones().find(z => z.id === zoneId);
    if (!zone) return;

    applyState(panel, {
      target: zone.target,
      mode: zone.mode,
      html: zone.html,
      css: zone.css,
      js: zone.js,
      zoneName: zone.name,
      presetName: panel.querySelector("#di-lp-preset-name").value || DEFAULT_STATE.presetName,
      live: !!zone.live,
      activeTab: panel.dataset.tab || "html",
      treeDepth: Number(zone.treeDepth) || DEFAULT_STATE.treeDepth,
      treeFilter: zone.treeFilter || ""
    });

    saveState(panel);
    syncPreview(panel);
    refreshTree(panel);
    panel.querySelector("#di-lp-status").textContent = `Zona carregada: ${zone.name}`;
  }

  function deleteZone(panel, zoneId) {
    if (!zoneId) return;
    saveZones(readZones().filter(z => z.id !== zoneId));
    refreshZonesSelect(panel);
    panel.querySelector("#di-lp-status").textContent = "Zona removida.";
  }

  function savePreset(panel) {
    const s = cloneState(panel);
    const presets = readPresets();
    let preset = presets.find(p => p.name === s.presetName) || null;
    if (!preset) {
      preset = { id: uid(), createdAt: new Date().toISOString() };
      presets.push(preset);
    }

    preset.name = s.presetName || "Slot 01";
    preset.target = s.target;
    preset.mode = s.mode;
    preset.html = s.html;
    preset.css = s.css;
    preset.js = s.js;
    preset.live = s.live;
    preset.zoneName = s.zoneName;
    preset.treeDepth = s.treeDepth;
    preset.treeFilter = s.treeFilter;
    preset.updatedAt = new Date().toISOString();

    savePresets(presets);
    refreshPresetsSelect(panel, preset.id);
    panel.querySelector("#di-lp-status").textContent = `Slot salvo: ${preset.name}`;
  }

  function loadPreset(panel, presetId) {
    const preset = readPresets().find(p => p.id === presetId);
    if (!preset) return;

    applyState(panel, {
      target: preset.target,
      mode: preset.mode,
      html: preset.html,
      css: preset.css,
      js: preset.js,
      zoneName: preset.zoneName || DEFAULT_STATE.zoneName,
      presetName: preset.name,
      live: !!preset.live,
      activeTab: panel.dataset.tab || "html",
      treeDepth: Number(preset.treeDepth) || DEFAULT_STATE.treeDepth,
      treeFilter: preset.treeFilter || ""
    });

    saveState(panel);
    syncPreview(panel);
    refreshTree(panel);
    panel.querySelector("#di-lp-status").textContent = `Slot carregado: ${preset.name}`;
  }

  function deletePreset(panel, presetId) {
    if (!presetId) return;
    savePresets(readPresets().filter(p => p.id !== presetId));
    refreshPresetsSelect(panel);
    panel.querySelector("#di-lp-status").textContent = "Slot removido.";
  }

  function selectedTreeFilter(panel) {
    return (panel.querySelector("#di-lp-tree-filter").value || "").trim().toLowerCase();
  }

  function selectedTreeDepth(panel) {
    return Math.max(1, Math.min(8, Number(panel.querySelector("#di-lp-tree-depth").value) || 4));
  }

  function nodeLabel(el) {
    if (!el || el.nodeType !== 1) return "";
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const classes = el.classList && el.classList.length ? "." + [...el.classList].slice(0, 3).join(".") : "";
    const bits = [];
    if (el.getAttribute("role")) bits.push(`[role=${el.getAttribute("role")}]`);
    if (el.dataset && Object.keys(el.dataset).length) bits.push(`{${Object.keys(el.dataset).slice(0, 2).join(",")}}`);
    return `${tag}${id}${classes}${bits.length ? " " + bits.join(" ") : ""}`;
  }

  function highlightElement(el) {
    if (!el) return;
    const prev = el.style.outline;
    const prevOffset = el.style.outlineOffset;
    el.style.outline = "2px solid rgba(17,17,17,.45)";
    el.style.outlineOffset = "2px";
    try {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch {}
    setTimeout(() => {
      el.style.outline = prev;
      el.style.outlineOffset = prevOffset;
    }, 900);
  }

  function renderTreeNode(el, depth, maxDepth, filter, rootTarget) {
    if (!el || el.nodeType !== 1) return null;
    const text = nodeLabel(el);
    if (filter && !text.toLowerCase().includes(filter) && el !== rootTarget) {
      const anyChildMatches = [...el.children].some(ch => nodeLabel(ch).toLowerCase().includes(filter));
      if (!anyChildMatches) return null;
    }

    const wrap = createEl("div", { class: depth === 0 ? "" : "di-lp3-tree-indent" });
    const node = createEl("button", {
      class: "di-lp3-tree-node",
      type: "button",
      "data-node-id": text
    });

    const childCount = el.children ? el.children.length : 0;
    node.innerHTML = `
      <span class="di-lp3-tree-label">
        <span><b>${escapeHTML(text)}</b></span>
        <span class="di-lp3-tree-muted">(${childCount})</span>
      </span>
    `;

    node.addEventListener("click", () => highlightElement(el));
    wrap.appendChild(node);

    if (depth < maxDepth && childCount) {
      for (const ch of [...el.children]) {
        const childNode = renderTreeNode(ch, depth + 1, maxDepth, filter, rootTarget);
        if (childNode) wrap.appendChild(childNode);
      }
    }

    return wrap;
  }

  function refreshTree(panel) {
    const tree = panel.querySelector("#di-lp-tree");
    if (!tree) return;

    const target = getTargetEl(panel);
    const filter = selectedTreeFilter(panel);
    const maxDepth = selectedTreeDepth(panel);

    tree.innerHTML = "";

    if (!target) {
      tree.innerHTML = `<div class="di-lp3-small">Target não encontrado.</div>`;
      return;
    }

    const title = createEl("div", { class: "di-lp3-small" }, `Raiz: ${escapeHTML(nodeLabel(target))}`);
    tree.appendChild(title);

    const rendered = renderTreeNode(target, 0, maxDepth, filter, target);
    if (!rendered) {
      tree.appendChild(createEl("div", { class: "di-lp3-small" }, "Sem nós compatíveis com o filtro."));
    } else {
      tree.appendChild(rendered);
    }
  }

  let treeObserver = null;

  function attachTreeObserver(panel) {
    if (treeObserver) {
      try { treeObserver.disconnect(); } catch {}
      treeObserver = null;
    }

    const target = getTargetEl(panel);
    if (!target || !window.MutationObserver) return;

    treeObserver = new MutationObserver(() => {
      if (panel.dataset.tab === "tree") refreshTree(panel);
    });

    try {
      treeObserver.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
    } catch {}
  }

  function mountPanel() {
    if (document.getElementById("di-loader-panel-v3")) return;

    ensureStyles();

    const state = readStore(STORAGE_KEYS.state, DEFAULT_STATE);
    const panel = createEl("section", { id: "di-loader-panel-v3" });
    panel.dataset.collapsed = "0";
    panel.dataset.tab = state.activeTab || "html";

    panel.innerHTML = `
      <div class="di-lp3-head">
        <div class="di-lp3-title">
          <strong>DI Loader Panel · ZPR++</strong>
          <span>tabs · slots · batch import/export · árvore</span>
        </div>
        <div class="di-lp3-actions">
          <button class="di-lp3-btn secondary" id="di-lp-toggle">Recolher</button>
        </div>
      </div>

      <div class="di-lp3-tabs">
        <button class="di-lp3-tab" data-tab="html">HTML</button>
        <button class="di-lp3-tab" data-tab="css">CSS</button>
        <button class="di-lp3-tab" data-tab="js">JS</button>
        <button class="di-lp3-tab" data-tab="tree">Tree</button>
      </div>

      <div class="di-lp3-grid">
        <div class="di-lp3-compact">
          <div class="di-lp3-row">
            <label for="di-lp-zone-name">Nome da Zona</label>
            <input id="di-lp-zone-name" type="text" value="${escapeHTML(state.zoneName)}" placeholder="Minha ZPR">
          </div>

          <div class="di-lp3-row">
            <label for="di-lp-preset-name">Nome do Slot</label>
            <input id="di-lp-preset-name" type="text" value="${escapeHTML(state.presetName)}" placeholder="Slot 01">
          </div>
        </div>

        <div class="di-lp3-compact">
          <div class="di-lp3-row">
            <label for="di-lp-target">Target</label>
            <input id="di-lp-target" type="text" value="${escapeHTML(state.target)}" placeholder="#app-root">
          </div>

          <div class="di-lp3-row">
            <label for="di-lp-mode">Mode</label>
            <select id="di-lp-mode">
              <option value="replace">replace</option>
              <option value="append">append</option>
            </select>
          </div>
        </div>

        <div class="di-lp3-row">
          <label>Zonas</label>
          <div class="di-lp3-inline">
            <select id="di-lp-zone-select" style="flex:1;min-width:0;"></select>
            <button class="di-lp3-btn ghost" id="di-lp-load-zone">Carregar</button>
            <button class="di-lp3-btn ghost" id="di-lp-save-zone">Salvar</button>
            <button class="di-lp3-btn danger" id="di-lp-delete-zone">Apagar</button>
          </div>
        </div>

        <div class="di-lp3-row">
          <label>Slots</label>
          <div class="di-lp3-inline">
            <select id="di-lp-preset-select" style="flex:1;min-width:0;"></select>
            <button class="di-lp3-btn ghost" id="di-lp-load-preset">Carregar</button>
            <button class="di-lp3-btn ghost" id="di-lp-save-preset">Salvar</button>
            <button class="di-lp3-btn danger" id="di-lp-delete-preset">Apagar</button>
          </div>
        </div>

        <div class="di-lp3-panel" data-tab="html" data-visible="0">
          <div class="di-lp3-row">
            <label for="di-lp-html">HTML</label>
            <textarea id="di-lp-html" placeholder="Cole HTML completo, fragmento, ou URLs uma por linha...">${escapeHTML(state.html)}</textarea>
          </div>
        </div>

        <div class="di-lp3-panel" data-tab="css" data-visible="0">
          <div class="di-lp3-row">
            <label for="di-lp-css">CSS</label>
            <textarea id="di-lp-css" placeholder="Cole links CSS um por linha...">${escapeHTML(state.css)}</textarea>
          </div>
        </div>

        <div class="di-lp3-panel" data-tab="js" data-visible="0">
          <div class="di-lp3-row">
            <label for="di-lp-js">JS</label>
            <textarea id="di-lp-js" placeholder="Cole links JS um por linha...">${escapeHTML(state.js)}</textarea>
          </div>
        </div>

        <div class="di-lp3-panel" data-tab="tree" data-visible="0">
          <div class="di-lp3-row">
            <label for="di-lp-tree-filter">Filtro da árvore</label>
            <input id="di-lp-tree-filter" type="text" value="${escapeHTML(state.treeFilter)}" placeholder="orb, app, hero, etc.">
          </div>
          <div class="di-lp3-compact">
            <div class="di-lp3-row">
              <label for="di-lp-tree-depth">Profundidade</label>
              <input id="di-lp-tree-depth" type="number" min="1" max="8" value="${escapeHTML(state.treeDepth)}">
            </div>
            <div class="di-lp3-row">
              <label>&nbsp;</label>
              <div class="di-lp3-inline">
                <button class="di-lp3-btn secondary" id="di-lp-tree-refresh">Atualizar árvore</button>
                <button class="di-lp3-btn ghost" id="di-lp-tree-clear-filter">Limpar filtro</button>
              </div>
            </div>
          </div>
          <div class="di-lp3-tree" id="di-lp-tree"></div>
        </div>

        <div class="di-lp3-row">
          <label>Controles</label>
          <div class="di-lp3-inline">
            <label class="di-lp3-inline" style="gap:6px;">
              <input id="di-lp-live" type="checkbox" ${state.live ? "checked" : ""}>
              <span style="font-size:13px;font-weight:700;">Live preview</span>
            </label>
            <button class="di-lp3-btn" id="di-lp-mount">Montar</button>
            <button class="di-lp3-btn danger" id="di-lp-unmount">Desmontar</button>
            <button class="di-lp3-btn secondary" id="di-lp-export-current">Export atual</button>
            <button class="di-lp3-btn secondary" id="di-lp-export-all">Export lote</button>
            <button class="di-lp3-btn secondary" id="di-lp-copy-current">Copiar atual</button>
            <button class="di-lp3-btn secondary" id="di-lp-copy-all">Copiar lote</button>
            <button class="di-lp3-btn secondary" id="di-lp-import-batch">Import lote</button>
            <input id="di-lp-import-file" type="file" accept="application/json" hidden>
          </div>
        </div>

        <div class="di-lp3-row">
          <label>Preview</label>
          <div class="di-lp3-preview" id="di-lp-preview"></div>
        </div>

        <div class="di-lp3-footer">
          <div class="di-lp3-meta">
            <span class="di-lp3-chip">HTML direto ou URL</span>
            <span class="di-lp3-chip">Múltiplos links por linha</span>
            <span class="di-lp3-chip">ZPR persistente</span>
            <span class="di-lp3-chip">Slots e batch</span>
          </div>
          <div class="di-lp3-small" id="di-lp-status">Pronto.</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const $ = (sel) => panel.querySelector(sel);
    const status = $("#di-lp-status");

    applyState(panel, state);
    refreshZonesSelect(panel);
    refreshPresetsSelect(panel);

    let liveTimer = null;

    function scheduleLiveMount() {
      saveState(panel);
      syncPreview(panel);
      refreshTree(panel);

      if (!$("#di-lp-live").checked) return;
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        mountNow(panel);
      }, 500);
    }

    panel.querySelectorAll(".di-lp3-tab").forEach(btn => {
      btn.addEventListener("click", () => setTab(panel, btn.dataset.tab, true));
    });

    $("#di-lp-toggle").addEventListener("click", () => {
      const collapsed = panel.dataset.collapsed === "1";
      panel.dataset.collapsed = collapsed ? "0" : "1";
      panel.querySelector(".di-lp3-grid").style.display = collapsed ? "grid" : "none";
      $("#di-lp-toggle").textContent = collapsed ? "Recolher" : "Expandir";
    });

    $("#di-lp-mount").addEventListener("click", () => mountNow(panel));
    $("#di-lp-unmount").addEventListener("click", () => unmountNow(panel));

    $("#di-lp-save-zone").addEventListener("click", () => saveZone(panel));
    $("#di-lp-load-zone").addEventListener("click", () => {
      const id = $("#di-lp-zone-select").value;
      if (!id) { status.textContent = "Escolhe uma zona."; return; }
      loadZone(panel, id);
      refreshZonesSelect(panel, id);
    });
    $("#di-lp-delete-zone").addEventListener("click", () => {
      const id = $("#di-lp-zone-select").value;
      if (!id) { status.textContent = "Escolhe uma zona."; return; }
      deleteZone(panel, id);
    });

    $("#di-lp-save-preset").addEventListener("click", () => savePreset(panel));
    $("#di-lp-load-preset").addEventListener("click", () => {
      const id = $("#di-lp-preset-select").value;
      if (!id) { status.textContent = "Escolhe um slot."; return; }
      loadPreset(panel, id);
      refreshPresetsSelect(panel, id);
    });
    $("#di-lp-delete-preset").addEventListener("click", () => {
      const id = $("#di-lp-preset-select").value;
      if (!id) { status.textContent = "Escolhe um slot."; return; }
      deletePreset(panel, id);
    });

    $("#di-lp-export-current").addEventListener("click", () => exportCurrent(panel));
    $("#di-lp-export-all").addEventListener("click", () => exportAll(panel));
    $("#di-lp-copy-current").addEventListener("click", () => copyJSON(panel, "current"));
    $("#di-lp-copy-all").addEventListener("click", () => copyJSON(panel, "all"));

    $("#di-lp-import-batch").addEventListener("click", () => $("#di-lp-import-file").click());
    $("#di-lp-import-file").addEventListener("change", (ev) => {
      importBatchFromFile(panel, ev.target.files && ev.target.files[0]);
      ev.target.value = "";
    });

    $("#di-lp-tree-refresh").addEventListener("click", () => refreshTree(panel));
    $("#di-lp-tree-clear-filter").addEventListener("click", () => {
      $("#di-lp-tree-filter").value = "";
      saveState(panel);
      refreshTree(panel);
    });

    [
      "#di-lp-target",
      "#di-lp-mode",
      "#di-lp-html",
      "#di-lp-css",
      "#di-lp-js",
      "#di-lp-zone-name",
      "#di-lp-preset-name",
      "#di-lp-live",
      "#di-lp-tree-depth",
      "#di-lp-tree-filter"
    ].forEach(sel => {
      const el = $(sel);
      el.addEventListener("input", scheduleLiveMount);
      el.addEventListener("change", scheduleLiveMount);
    });

    syncPreview(panel);
    refreshTree(panel);
    attachTreeObserver(panel);
    saveState(panel);

    if (state.live) mountNow(panel);
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
    const presetName = panel.querySelector("#di-lp-preset-name").value.trim() || "Slot 01";

    preview.innerHTML = `
      <div><b>Zona:</b> ${escapeHTML(zoneName)}</div>
      <div><b>Slot:</b> ${escapeHTML(presetName)}</div>
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

  function refreshTree(panel) {
    const tree = panel.querySelector("#di-lp-tree");
    if (!tree) return;

    const target = getTargetEl(panel);
    const filter = selectedTreeFilter(panel);
    const maxDepth = selectedTreeDepth(panel);

    tree.innerHTML = "";

    if (!target) {
      tree.innerHTML = `<div class="di-lp3-small">Target não encontrado.</div>`;
      return;
    }

    tree.appendChild(createEl("div", { class: "di-lp3-small" }, `Raiz: ${escapeHTML(nodeLabel(target))}`));

    const rendered = renderTreeNode(target, 0, maxDepth, filter, target);
    if (!rendered) {
      tree.appendChild(createEl("div", { class: "di-lp3-small" }, "Sem nós compatíveis com o filtro."));
    } else {
      tree.appendChild(rendered);
    }
  }

  function renderTreeNode(el, depth, maxDepth, filter, rootTarget) {
    if (!el || el.nodeType !== 1) return null;
    const text = nodeLabel(el);
    const filterLC = String(filter || "").toLowerCase();

    const childMatches = () => [...el.children].some(ch => {
      const label = nodeLabel(ch).toLowerCase();
      return !filterLC || label.includes(filterLC) || [...ch.querySelectorAll("*")].some(grand => nodeLabel(grand).toLowerCase().includes(filterLC));
    });

    if (filterLC && !text.toLowerCase().includes(filterLC) && el !== rootTarget && !childMatches()) return null;

    const wrap = createEl("div", { class: depth === 0 ? "" : "di-lp3-tree-indent" });
    const button = createEl("button", {
      class: "di-lp3-tree-node",
      type: "button",
      "data-node-label": text
    });

    const childCount = el.children ? el.children.length : 0;
    button.innerHTML = `
      <span class="di-lp3-tree-label">
        <span><b>${escapeHTML(text)}</b></span>
        <span class="di-lp3-tree-muted">(${childCount})</span>
      </span>
    `;

    button.addEventListener("click", () => highlightElement(el));
    wrap.appendChild(button);

    if (depth < maxDepth && childCount) {
      for (const ch of [...el.children]) {
        const childWrap = renderTreeNode(ch, depth + 1, maxDepth, filterLC, rootTarget);
        if (childWrap) wrap.appendChild(childWrap);
      }
    }

    return wrap;
  }

  function nodeLabel(el) {
    if (!el || el.nodeType !== 1) return "";
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    const classes = el.classList && el.classList.length ? "." + [...el.classList].slice(0, 4).join(".") : "";
    const parts = [];
    if (el.getAttribute && el.getAttribute("role")) parts.push(`[role=${el.getAttribute("role")}]`);
    if (el.dataset && Object.keys(el.dataset).length) parts.push(`{${Object.keys(el.dataset).slice(0, 3).join(",")}}`);
    return `${tag}${id}${classes}${parts.length ? " " + parts.join(" ") : ""}`;
  }

  function highlightElement(el) {
    if (!el) return;
    const prev = {
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
      boxShadow: el.style.boxShadow
    };

    el.style.outline = "2px solid rgba(17,17,17,.45)";
    el.style.outlineOffset = "2px";
    el.style.boxShadow = "0 0 0 6px rgba(17,17,17,.05)";
    try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch {}

    setTimeout(() => {
      el.style.outline = prev.outline;
      el.style.outlineOffset = prev.outlineOffset;
      el.style.boxShadow = prev.boxShadow;
    }, 900);
  }

  function attachTreeObserver(panel) {
    const target = getTargetEl(panel);
    if (panel.__diTreeObserver) {
      try { panel.__diTreeObserver.disconnect(); } catch {}
      panel.__diTreeObserver = null;
    }
    if (!target || !window.MutationObserver) return;

    const obs = new MutationObserver(() => {
      if (panel.dataset.tab === "tree") refreshTree(panel);
    });

    try {
      obs.observe(target, { childList: true, subtree: true, attributes: true, characterData: true });
      panel.__diTreeObserver = obs;
    } catch {}
  }

  global.di_mountLoaderPanel = mountPanel;
  global.di_destroyLoaderPanel = function () {
    const panel = document.getElementById("di-loader-panel-v3");
    if (panel && panel.__diTreeObserver) {
      try { panel.__diTreeObserver.disconnect(); } catch {}
    }
    if (panel) panel.remove();
  };

  global.di_loaderPanelV3 = {
    mount: mountPanel,
    destroy: global.di_destroyLoaderPanel,
    readZones,
    saveZones,
    readPresets,
    savePresets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  } else {
    mountPanel();
  }
})(window);
