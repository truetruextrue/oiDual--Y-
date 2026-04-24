/* Sunrise Engine Core.js
   di_loadApp / di_loadHTML / di_loadAssets
   Loader modular para Infodose / 78Frames / ZPR
*/
(function (global) {
  "use strict";

  if (global.__DI_SUNRISE_CORE__) return;
  global.__DI_SUNRISE_CORE__ = true;

  const di_STATE = {
    loadedCSS: new Set(),
    loadedJS: new Set(),
    loadedHTML: new Set(),
    busy: false,
  };

  const di_DEFAULTS = {
    target: "#app-root",
    mode: "replace", // replace | append
    html: [],
    css: [],
    js: [],
    importHeadLinks: true,
    importHeadScripts: true,
    importBodyScripts: true,
    cleanTargetBeforeMount: true,
    preserveExistingChildren: false,
    htmlBaseURL: location.href,
    signalName: "di-load",
  };

  function di_isURL(value) {
    return typeof value === "string" && /^(https?:)?\/\//i.test(value) || /^\/[^/]/.test(value) || /^\.\.?\//.test(value);
  }

  function di_isHTMLString(value) {
    return typeof value === "string" && /<\s*[a-z!][\s\S]*>/i.test(value.trim());
  }

  function di_toArray(v) {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
  }

  function di_unique(arr) {
    return [...new Set(arr.filter(Boolean))];
  }

  function di_query(target) {
    if (!target) return document.body;
    if (typeof target === "string") return document.querySelector(target) || document.body;
    if (target instanceof Element) return target;
    return document.body;
  }

  function di_fetchText(url) {
    return fetch(url, { credentials: "same-origin" }).then((r) => {
      if (!r.ok) throw new Error(`Falha ao carregar: ${url} (${r.status})`);
      return r.text();
    });
  }

  function di_absURL(url, base = location.href) {
    try {
      return new URL(url, base).href;
    } catch {
      return url;
    }
  }

  function di_addStyle(href) {
    const abs = di_absURL(href);
    if (di_STATE.loadedCSS.has(abs)) return Promise.resolve(abs);

    di_STATE.loadedCSS.add(abs);

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = abs;
      link.dataset.diLoaded = "1";
      link.onload = () => resolve(abs);
      link.onerror = () => reject(new Error(`CSS falhou: ${abs}`));
      document.head.appendChild(link);
    });
  }

  function di_addScript(src, opts = {}) {
    const abs = di_absURL(src);
    if (di_STATE.loadedJS.has(abs)) return Promise.resolve(abs);

    di_STATE.loadedJS.add(abs);

    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = abs;
      s.async = false;

      if (opts.type) s.type = opts.type;
      if (opts.defer != null) s.defer = !!opts.defer;
      if (opts.nomodule != null) s.noModule = !!opts.nomodule;

      s.dataset.diLoaded = "1";
      s.onload = () => resolve(abs);
      s.onerror = () => reject(new Error(`JS falhou: ${abs}`));
      document.body.appendChild(s);
    });
  }

  function di_cloneNodeDeep(node, baseURL) {
    const cloned = document.importNode(node, true);

    if (cloned.nodeType === Node.ELEMENT_NODE) {
      const el = cloned;

      if (el.tagName === "LINK" && el.rel === "stylesheet" && el.href) {
        el.href = di_absURL(el.getAttribute("href"), baseURL);
      }

      if (el.tagName === "SCRIPT" && el.src) {
        el.src = di_absURL(el.getAttribute("src"), baseURL);
      }
    }

    return cloned;
  }

  function di_collectAssetsFromDoc(doc, baseURL) {
    const styles = [];
    const scripts = [];

    const headLinks = [...doc.querySelectorAll('link[rel="stylesheet"]')];
    for (const link of headLinks) {
      const href = link.getAttribute("href");
      if (href) styles.push(di_absURL(href, baseURL));
    }

    const headScripts = [...doc.querySelectorAll("head script")];
    const bodyScripts = [...doc.querySelectorAll("body script")];
    const allScripts = [...headScripts, ...bodyScripts];

    for (const sc of allScripts) {
      const src = sc.getAttribute("src");
      scripts.push({
        src: src ? di_absURL(src, baseURL) : "",
        inline: src ? "" : sc.textContent || "",
        type: sc.getAttribute("type") || "",
        nomodule: sc.hasAttribute("nomodule"),
        defer: sc.hasAttribute("defer"),
      });
    }

    return { styles: di_unique(styles), scripts };
  }

  async function di_mountHTMLSource(source, target, opts = {}) {
    const baseURL = opts.baseURL || location.href;
    let htmlText = source;

    if (typeof source === "string" && di_isURL(source)) {
      const cacheKey = di_absURL(source, baseURL);
      if (di_STATE.loadedHTML.has(cacheKey)) {
        // Pode montar novamente se quiser; o cache só evita fetch repetido.
      } else {
        di_STATE.loadedHTML.add(cacheKey);
      }
      htmlText = await di_fetchText(cacheKey);
    }

    if (typeof htmlText !== "string") {
      throw new Error("Fonte HTML inválida.");
    }

    const parsed = new DOMParser().parseFromString(htmlText, "text/html");
    const assets = di_collectAssetsFromDoc(parsed, baseURL);

    if (opts.importHeadLinks) {
      for (const href of assets.styles) {
        await di_addStyle(href);
      }
    }

    const rootTarget = di_query(target);

    if (opts.cleanTargetBeforeMount && !opts.preserveExistingChildren) {
      rootTarget.innerHTML = "";
    }

    const fragment = document.createDocumentFragment();
    const bodyNodes = [...parsed.body.childNodes];

    for (const node of bodyNodes) {
      fragment.appendChild(di_cloneNodeDeep(node, baseURL));
    }

    rootTarget.appendChild(fragment);

    if (opts.importHeadScripts || opts.importBodyScripts) {
      for (const sc of assets.scripts) {
        if (sc.src) {
          await di_addScript(sc.src, { type: sc.type, defer: sc.defer, nomodule: sc.nomodule });
        } else if (opts.importBodyScripts) {
          const inline = document.createElement("script");
          if (sc.type) inline.type = sc.type;
          if (sc.nomodule) inline.noModule = true;
          if (sc.defer) inline.defer = true;
          inline.textContent = sc.inline;
          document.body.appendChild(inline);
        }
      }
    }

    return {
      target: rootTarget,
      parsed,
      assets,
    };
  }

  async function di_loadApp(config = {}) {
    const opts = { ...di_DEFAULTS, ...config };
    const target = di_query(opts.target);

    if (di_STATE.busy) {
      console.warn("[Sunrise Core] Loader já está em execução.");
    }

    di_STATE.busy = true;

    try {
      const cssList = di_unique(di_toArray(opts.css));
      const jsList = di_unique(di_toArray(opts.js));
      const htmlList = di_toArray(opts.html);

      for (const css of cssList) {
        await di_addStyle(css);
      }

      for (const htmlSource of htmlList) {
        await di_mountHTMLSource(htmlSource, target, {
          baseURL: opts.htmlBaseURL,
          importHeadLinks: opts.importHeadLinks,
          importHeadScripts: opts.importHeadScripts,
          importBodyScripts: opts.importBodyScripts,
          cleanTargetBeforeMount: opts.mode === "replace" && opts.cleanTargetBeforeMount,
          preserveExistingChildren: opts.preserveExistingChildren,
        });
      }

      for (const js of jsList) {
        await di_addScript(js, { type: "module" });
      }

      target.dispatchEvent(new CustomEvent(opts.signalName, {
        detail: {
          target,
          css: cssList,
          js: jsList,
          htmlCount: htmlList.length,
          ts: Date.now(),
        },
      }));

      return {
        ok: true,
        target,
        css: cssList,
        js: jsList,
        htmlCount: htmlList.length,
      };
    } finally {
      di_STATE.busy = false;
    }
  }

  async function di_loadMultipleHTML(sources, config = {}) {
    return di_loadApp({
      ...config,
      html: di_toArray(sources),
    });
  }

  async function di_mountFragment(html, target = "#app-root") {
    return di_loadApp({
      target,
      html: [html],
      css: [],
      js: [],
      importHeadLinks: false,
      importHeadScripts: false,
      importBodyScripts: true,
    });
  }

  function di_clear(target = "#app-root") {
    const el = di_query(target);
    el.innerHTML = "";
    return el;
  }

  function di_register(name, fn) {
    global[name] = fn;
    return fn;
  }

  di_register("di_loadApp", di_loadApp);
  di_register("di_loadMultipleHTML", di_loadMultipleHTML);
  di_register("di_mountFragment", di_mountFragment);
  di_register("di_clearApp", di_clear);
  di_register("di_addStyle", di_addStyle);
  di_register("di_addScript", di_addScript);

  global.diSunriseCore = {
    loadApp: di_loadApp,
    loadMultipleHTML: di_loadMultipleHTML,
    mountFragment: di_mountFragment,
    clear: di_clear,
    addStyle: di_addStyle,
    addScript: di_addScript,
    state: di_STATE,
  };
})(window);
