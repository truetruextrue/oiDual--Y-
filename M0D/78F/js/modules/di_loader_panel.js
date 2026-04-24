/* di_loader_panel.js
   Painel visual para controlar di_loadApp()
   Requer: di_loadApp() e di_clearApp() já disponíveis
*/
(function (global) {
  "use strict";

  if (global.__DI_LOADER_PANEL__) return;
  global.__DI_LOADER_PANEL__ = true;

  const STORAGE_KEY = "di_loader_panel_v1";

  const DEFAULT_STATE = {
    target: "#app-root",
    mode: "replace",
    html: "",
    css: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/css/main.css",
    js: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/js/main.js"
  };

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function splitList(text) {
    return String(text || "")
      .split(/\n|,/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function escapeHTML(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function ensureStyles() {
    if (document.getElementById("di-loader-panel-styles")) return;

    const style = document.createElement("style");
    style.id = "di-loader-panel-styles";
    style.textContent = `
      #di-loader-panel {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 2147483647;
        width: min(420px, calc(100vw - 24px));
        max-height: min(86vh, 900px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: 18px;
        background: rgba(255,255,255,.88);
        backdrop-filter: blur(18px);
        box-shadow: 0 16px 48px rgba(0,0,0,.18);
        border: 1px solid rgba(0,0,0,.08);
        color: #111;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #di-loader-panel[data-collapsed="1"] {
        width: auto;
        max-height: none;
      }
      .di-lp-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .di-lp-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .di-lp-title strong {
        font-size: 15px;
        line-height: 1.2;
      }
      .di-lp-title span {
        font-size: 12px;
        opacity: .68;
      }
      .di-lp-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .di-lp-btn {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        background: #111;
        color: #fff;
      }
      .di-lp-btn.secondary {
        background: rgba(17,17,17,.08);
        color: #111;
      }
      .di-lp-btn.danger {
        background: #c62828;
        color: #fff;
      }
      .di-lp-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      .di-lp-row {
        display: grid;
        gap: 6px;
      }
      .di-lp-row label {
        font-size: 12px;
        font-weight: 700;
        opacity: .78;
      }
      .di-lp-row input,
      .di-lp-row select,
      .di-lp-row textarea {
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
      .di-lp-row textarea {
        min-height: 92px;
        resize: vertical;
        line-height: 1.4;
      }
      .di-lp-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        font-size: 12px;
        opacity: .78;
      }
      .di-lp-chip {
        border-radius: 999px;
        padding: 6px 10px;
        background: rgba(17,17,17,.06);
      }
      .di-lp-preview {
        border-radius: 14px;
        border: 1px dashed rgba(0,0,0,.15);
        padding: 10px;
        background: rgba(255,255,255,.62);
        max-height: 160px;
        overflow: auto;
        font-size: 12px;
        line-height: 1.4;
      }
      .di-lp-footer {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
      }
      .di-lp-small {
        font-size: 12px;
        opacity: .7;
      }
      @media (max-width: 520px) {
        #di-loader-panel {
          left: 12px;
          right: 12px;
          width: auto;
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
      else el.setAttribute(k, v);
    }
    if (html) el.innerHTML = html;
    return el;
  }

  function mountPanel() {
    if (document.getElementById("di-loader-panel")) return;

    ensureStyles();

    const state = readState();

    const panel = createEl("section", { id: "di-loader-panel" });
    panel.dataset.collapsed = "0";

    panel.innerHTML = `
      <div class="di-lp-head">
        <div class="di-lp-title">
          <strong>DI Loader Panel</strong>
          <span>HTML · CSS · JS · target · mode</span>
        </div>
        <div class="di-lp-actions">
          <button class="di-lp-btn secondary" id="di-lp-toggle">Recolher</button>
        </div>
      </div>

      <div class="di-lp-grid" id="di-lp-body">
        <div class="di-lp-row">
          <label for="di-lp-target">Target</label>
          <input id="di-lp-target" type="text" value="${escapeHTML(state.target)}" placeholder="#app-root">
        </div>

        <div class="di-lp-row">
          <label for="di-lp-mode">Mode</label>
          <select id="di-lp-mode">
            <option value="replace">replace</option>
            <option value="append">append</option>
          </select>
        </div>

        <div class="di-lp-row">
          <label for="di-lp-html">HTML</label>
          <textarea id="di-lp-html" placeholder="Cole HTML completo, fragmento, ou URLs uma por linha...">${escapeHTML(state.html)}</textarea>
        </div>

        <div class="di-lp-row">
          <label for="di-lp-css">CSS</label>
          <textarea id="di-lp-css" placeholder="Cole links CSS um por linha...">${escapeHTML(state.css)}</textarea>
        </div>

        <div class="di-lp-row">
          <label for="di-lp-js">JS</label>
          <textarea id="di-lp-js" placeholder="Cole links JS um por linha...">${escapeHTML(state.js)}</textarea>
        </div>

        <div class="di-lp-footer">
          <div class="di-lp-actions">
            <button class="di-lp-btn" id="di-lp-mount">Montar</button>
            <button class="di-lp-btn danger" id="di-lp-unmount">Desmontar</button>
            <button class="di-lp-btn secondary" id="di-lp-save">Salvar</button>
          </div>
          <div class="di-lp-small" id="di-lp-status">Pronto.</div>
        </div>

        <div class="di-lp-meta">
          <span class="di-lp-chip">Múltiplos links: 1 por linha</span>
          <span class="di-lp-chip">HTML inline ou URL</span>
          <span class="di-lp-chip">Alvo editável</span>
        </div>

        <div class="di-lp-row">
          <label>Preview bruto</label>
          <div class="di-lp-preview" id="di-lp-preview"></div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const $ = (id) => panel.querySelector(id);

    const inputTarget = $("#di-lp-target");
    const inputMode = $("#di-lp-mode");
    const inputHTML = $("#di-lp-html");
    const inputCSS = $("#di-lp-css");
    const inputJS = $("#di-lp-js");
    const preview = $("#di-lp-preview");
    const status = $("#di-lp-status");
    const body = $("#di-lp-body");

    inputMode.value = state.mode || "replace";

    function syncPreview() {
      const htmlList = splitList(inputHTML.value);
      const cssList = splitList(inputCSS.value);
      const jsList = splitList(inputJS.value);

      preview.innerHTML = `
        <div><b>target:</b> ${escapeHTML(inputTarget.value || "#app-root")}</div>
        <div><b>mode:</b> ${escapeHTML(inputMode.value)}</div>
        <div><b>html:</b> ${htmlList.length} item(s)</div>
        <div><b>css:</b> ${cssList.length} item(s)</div>
        <div><b>js:</b> ${jsList.length} item(s)</div>
        <hr style="border:0;border-top:1px solid rgba(0,0,0,.08);margin:8px 0;">
        <div style="white-space:pre-wrap;">${escapeHTML(
          htmlList.slice(0, 3).join("\n\n") || "(vazio)"
        )}</div>
      `;
    }

    function collectState() {
      return {
        target: inputTarget.value.trim() || "#app-root",
        mode: inputMode.value === "append" ? "append" : "replace",
        html: inputHTML.value,
        css: inputCSS.value,
        js: inputJS.value
      };
    }

    async function doMount() {
      if (typeof global.di_loadApp !== "function") {
        status.textContent = "di_loadApp() não encontrado.";
        return;
      }

      const s = collectState();
      saveState(s);

      const htmlList = splitList(s.html);
      const cssList = splitList(s.css);
      const jsList = splitList(s.js);

      status.textContent = "Montando...";

      try {
        await global.di_loadApp({
          target: s.target,
          mode: s.mode,
          html: htmlList,
          css: cssList,
          js: jsList,
          importHeadLinks: true,
          importHeadScripts: true,
          importBodyScripts: true,
          cleanTargetBeforeMount: s.mode === "replace",
          preserveExistingChildren: s.mode === "append"
        });
        status.textContent = "Montado com sucesso.";
        syncPreview();
      } catch (err) {
        console.error(err);
        status.textContent = "Falha ao montar.";
      }
    }

    function doUnmount() {
      const target = document.querySelector(inputTarget.value.trim() || "#app-root");
      if (!target) {
        status.textContent = "Target não encontrado.";
        return;
      }

      if (typeof global.di_clearApp === "function") {
        global.di_clearApp(inputTarget.value.trim() || "#app-root");
      } else {
        target.innerHTML = "";
      }

      status.textContent = "Desmontado.";
      syncPreview();
    }

    function doSave() {
      saveState(collectState());
      status.textContent = "Salvo.";
      syncPreview();
    }

    $("#di-lp-toggle").addEventListener("click", () => {
      const collapsed = panel.dataset.collapsed === "1";
      panel.dataset.collapsed = collapsed ? "0" : "1";
      body.style.display = collapsed ? "grid" : "none";
      $("#di-lp-toggle").textContent = collapsed ? "Recolher" : "Expandir";
    });

    $("#di-lp-mount").addEventListener("click", doMount);
    $("#di-lp-unmount").addEventListener("click", doUnmount);
    $("#di-lp-save").addEventListener("click", doSave);

    [inputTarget, inputMode, inputHTML, inputCSS, inputJS].forEach(el => {
      el.addEventListener("input", syncPreview);
      el.addEventListener("change", syncPreview);
    });

    syncPreview();
  }

  global.di_mountLoaderPanel = mountPanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountPanel, { once: true });
  } else {
    mountPanel();
  }
})(window);
