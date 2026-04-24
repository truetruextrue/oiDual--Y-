/* DI Override Engine
   - Presets por nome
   - HTML / CSS / JS / inlineJs
   - Aceita string ou array
   - Pode usar di_loadApp() se existir
*/
(function (global) {
  "use strict";

  if (global.__DI_OVERRIDE_ENGINE__) return;
  global.__DI_OVERRIDE_ENGINE__ = true;

  const DI_OVERRIDE = {
    presets: {},
    lastApplied: null
  };

  function toArray(v) {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  }

  function uniq(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function isLikelyHTML(value) {
    const s = String(value || "").trim();
    return /<\s*[a-z!][\s\S]*>/i.test(s);
  }

  function normalizeHTML(html) {
    const list = toArray(html).flatMap(item => {
      if (item == null) return [];
      const s = String(item).trim();
      if (!s) return [];
      return [s];
    });
    return list;
  }

  function normalizeLinks(v) {
    return uniq(toArray(v).flatMap(item => {
      if (item == null) return [];
      const s = String(item).trim();
      if (!s) return [];
      return [s];
    }));
  }

  function getTarget(selector) {
    return document.querySelector(selector) || document.body;
  }

  function clearTarget(selector) {
    const el = getTarget(selector);
    el.innerHTML = "";
    return el;
  }

  function injectInlineJs(code) {
    const s = document.createElement("script");
    s.textContent = String(code || "");
    document.body.appendChild(s);
    return s;
  }

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error("Falha ao carregar JS: " + src));
      document.body.appendChild(s);
    });
  }

  function injectStyle(href) {
    return new Promise((resolve, reject) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.onload = () => resolve(href);
      l.onerror = () => reject(new Error("Falha ao carregar CSS: " + href));
      document.head.appendChild(l);
    });
  }

  function mountHTML(targetSel, htmlList, mode = "replace") {
    const target = getTarget(targetSel);

    if (mode === "replace") {
      target.innerHTML = "";
    }

    for (const html of htmlList) {
      if (isLikelyHTML(html)) {
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        while (wrap.firstChild) target.appendChild(wrap.firstChild);
      } else {
        const el = document.createElement("div");
        el.setAttribute("data-di-html-ref", html);
        el.textContent = html;
        target.appendChild(el);
      }
    }

    return target;
  }

  function definePreset(name, preset) {
    if (!name) throw new Error("Preset sem nome.");
    DI_OVERRIDE.presets[name] = {
      target: "#app-root",
      mode: "replace",
      html: [],
      css: [],
      js: [],
      inlineJs: [],
      ...preset
    };
    return DI_OVERRIDE.presets[name];
  }

  function removePreset(name) {
    delete DI_OVERRIDE.presets[name];
  }

  function readPreset(name) {
    return DI_OVERRIDE.presets[name] || null;
  }

  async function applyPreset(name, extra = {}) {
    const preset = readPreset(name);
    if (!preset) throw new Error("Preset não encontrado: " + name);

    const cfg = {
      target: preset.target || "#app-root",
      mode: preset.mode || "replace",
      html: normalizeHTML(preset.html),
      css: normalizeLinks(preset.css),
      js: normalizeLinks(preset.js),
      inlineJs: normalizeHTML(preset.inlineJs),
      ...extra
    };

    const target = getTarget(cfg.target);

    for (const css of cfg.css) {
      await injectStyle(css);
    }

    if (typeof global.di_loadApp === "function") {
      await global.di_loadApp({
        target: cfg.target,
        mode: cfg.mode,
        html: cfg.html,
        css: [],
        js: cfg.js,
        importHeadLinks: true,
        importHeadScripts: true,
        importBodyScripts: true,
        cleanTargetBeforeMount: cfg.mode === "replace",
        preserveExistingChildren: cfg.mode === "append"
      });
    } else {
      mountHTML(cfg.target, cfg.html, cfg.mode);
      for (const js of cfg.js) {
        await injectScript(js);
      }
    }

    for (const code of cfg.inlineJs) {
      injectInlineJs(code);
    }

    DI_OVERRIDE.lastApplied = {
      name,
      ts: Date.now(),
      config: cfg
    };

    target.dispatchEvent(
      new CustomEvent("di-override-applied", {
        detail: DI_OVERRIDE.lastApplied
      })
    );

    return DI_OVERRIDE.lastApplied;
  }

  function overridePreset(name, extra = {}) {
    return applyPreset(name, extra);
  }

  function listPresets() {
    return Object.keys(DI_OVERRIDE.presets);
  }

  function exportPreset(name) {
    const p = readPreset(name);
    if (!p) return null;
    return JSON.stringify(
      {
        name,
        ...p
      },
      null,
      2
    );
  }

  function importPreset(name, jsonText) {
    const data = JSON.parse(jsonText);
    return definePreset(name, data);
  }

  function setPreset(name, preset) {
    return definePreset(name, preset);
  }

  global.DI_OVERRIDE = DI_OVERRIDE;
  global.di_definePreset = definePreset;
  global.di_setPreset = setPreset;
  global.di_removePreset = removePreset;
  global.di_getPreset = readPreset;
  global.di_listPresets = listPresets;
  global.di_exportPreset = exportPreset;
  global.di_importPreset = importPreset;
  global.di_applyPreset = applyPreset;
  global.di_overridePreset = overridePreset;

  if (!global.DI_PRESETS) global.DI_PRESETS = {};

  for (const [name, preset] of Object.entries(global.DI_PRESETS)) {
    definePreset(name, preset);
  }
})(window);