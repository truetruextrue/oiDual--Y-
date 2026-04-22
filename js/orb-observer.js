/* ==========================================================================
   DUAL / KODUX — ORB OS + SYMBOL BAR
   - Preserva di_
   - Não renomeia IDs
   - Pronto para colar no inline-000.js
   ========================================================================== */

(function () {
  "use strict";

  // Evita dupla inicialização
  if (window.__di_orb_os_initialized__) return;
  window.__di_orb_os_initialized__ = true;

  // --------------------------------------------------------------------------
  // CONFIG
  // --------------------------------------------------------------------------
  const di_cfg = {
    orbRootId: "di-orb-root",
    orbHostSelector: "[data-di-orb-host], #di-orb-host, .di-orb-host, .orb-host",
    symbolBarSelector: "[data-di-symbol-bar], #di-symbol-bar, .di-symbol-bar, .symbol-bar",
    titleSelector: "[data-di-title], #di-title, .di-title",
    userNameKeys: ["di_userName", "userName", "infodose:username", "username"],
    linkAttr: "data-di-link",
    iconAttr: "data-di-icon",
    labelAttr: "data-di-label",
    debug: false,
  };

  const di_log = (...args) => {
    if (di_cfg.debug) console.log("[DI-ORB]", ...args);
  };

  const di_qs = (sel, root = document) => root.querySelector(sel);
  const di_qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const di_getStored = (keys, fallback = "") => {
    for (const key of keys) {
      try {
        const v = window[key] ?? localStorage.getItem(key);
        if (typeof v === "string" && v.trim()) return v.trim();
      } catch (_) {}
    }
    return fallback;
  };

  const di_escapeHtml = (str = "") =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // --------------------------------------------------------------------------
  // STYLES
  // --------------------------------------------------------------------------
  
      
      

  // --------------------------------------------------------------------------
  // ORB
  // --------------------------------------------------------------------------
  function di_createOrb3D({ size = 120, id = di_cfg.orbRootId, label = "" } = {}) {
    const safeLabel = label ? di_escapeHtml(label) : "";
    return `
      <div id="${id}" class="di-orb-root" style="--orb-size:${size}px">
        <div class="di-orb-shell"></div>
        <div class="di-orb-ring"></div>
        <div class="di-orb-orbit"></div>
        <div class="di-orb-core"></div>
        <div class="di-orb-highlight"></div>
        ${safeLabel ? `<div class="di-orb-label">${safeLabel}</div>` : ""}
      </div>
    `;
  }

  function di_mountOrb(host) {
    if (!host) return false;
    if (host.dataset.diOrbMounted === "1") return true;

    const userName = di_getStored(di_cfg.userNameKeys, "KODUX");
    const html = di_createOrb3D({
      size: Number(host.getAttribute("data-di-size")) || 120,
      id: host.getAttribute("data-di-id") || di_cfg.orbRootId,
      label: host.getAttribute("data-di-label") || userName,
    });

    host.innerHTML = html;
    host.dataset.diOrbMounted = "1";
    di_log("Orb montado", host);
    return true;
  }

  function di_findOrbHosts(root = document) {
    return di_qsa(di_cfg.orbHostSelector, root).filter((el) => !el.dataset.diOrbMounted);
  }

  function di_initOrb() {
    di_injectOrbStyles();
    di_findOrbHosts().forEach(di_mountOrb);
  }

  // --------------------------------------------------------------------------
  // SYMBOL BAR
  // --------------------------------------------------------------------------
  function di_getIconMarkup(icon) {
    const safe = String(icon || "").trim().toLowerCase();

    // Ícones simples via emoji, para não depender de biblioteca
    const map = {
      home: "⌂",
      link: "↗",
      star: "✦",
      spark: "✧",
      user: "◉",
      orb: "◎",
      code: "</>",
      mail: "✉",
      plus: "+",
      play: "▶",
      moon: "☾",
      sun: "☼",
    };

    return map[safe] || "•";
  }

  function di_createSymbolItem({ href = "#", label = "", icon = "" } = {}) {
    const safeHref = href || "#";
    const safeLabel = di_escapeHtml(label || "Item");
    const safeIcon = di_escapeHtml(di_getIconMarkup(icon));

    return `
      <a class="di-symbol-item" href="${safeHref}">
        <span class="di-symbol-icon" aria-hidden="true">${safeIcon}</span>
        <span class="di-symbol-label">${safeLabel}</span>
      </a>
    `;
  }

  function di_mountSymbolBar(container, items = []) {
    if (!container) return false;

    const html = `
      <div class="di-symbol-bar" role="navigation" aria-label="Symbol Bar">
        ${items.map(di_createSymbolItem).join("")}
      </div>
    `;

    container.innerHTML = html;
    container.dataset.diSymbolBarMounted = "1";
    return true;
  }

  function di_extractSymbolItems(root = document) {
    const items = [];

    di_qsa(`[${di_cfg.linkAttr}]`, root).forEach((el) => {
      const href = el.getAttribute(di_cfg.linkAttr) || el.getAttribute("href") || "#";
      const label = el.getAttribute(di_cfg.labelAttr) || el.textContent?.trim() || "Link";
      const icon = el.getAttribute(di_cfg.iconAttr) || "link";
      items.push({ href, label, icon });
    });

    return items;
  }

  function di_initSymbolBar() {
    const bar = di_qs(di_cfg.symbolBarSelector);
    if (!bar) return false;
    if (bar.dataset.diSymbolBarMounted === "1") return true;

    const items = di_extractSymbolItems(bar);
    if (items.length) {
      di_mountSymbolBar(bar, items);
      return true;
    }

    // fallback: tenta ler links globais da página
    const fallbackItems = di_extractSymbolItems(document).slice(0, 8);
    if (fallbackItems.length) {
      di_mountSymbolBar(bar, fallbackItems);
      return true;
    }

    // fallback mínimo, não quebra layout
    di_mountSymbolBar(bar, [
      { href: "#", label: "Home", icon: "home" },
      { href: "#", label: "Orb", icon: "orb" },
      { href: "#", label: "Code", icon: "code" },
    ]);
    return true;
  }

  // --------------------------------------------------------------------------
  // TITLE / USERNAME
  // --------------------------------------------------------------------------
  function di_syncTitle() {
    const titleEl = di_qs(di_cfg.titleSelector);
    if (!titleEl) return;

    const userName = di_getStored(di_cfg.userNameKeys, "KODUX");
    const title = titleEl.getAttribute("data-di-title") || userName;
    titleEl.textContent = title;
  }

  // --------------------------------------------------------------------------
  // MUTATION OBSERVER
  // --------------------------------------------------------------------------
  function di_startObserver() {
    if (window.__di_orb_os_observer__) return;

    const observer = new MutationObserver((mutations) => {
      let shouldRescan = false;

      for (const m of mutations) {
        if (m.type === "childList" || m.type === "attributes") {
          shouldRescan = true;
          break;
        }
      }

      if (!shouldRescan) return;

      // Tenta montar o que ainda não foi montado
      di_findOrbHosts().forEach(di_mountOrb);
      di_initSymbolBar();
      di_syncTitle();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-di-link", "data-di-icon", "data-di-label", "data-di-size"],
    });

    window.__di_orb_os_observer__ = observer;
    di_log("MutationObserver ativo");
  }

  // --------------------------------------------------------------------------
  // API GLOBAL
  // --------------------------------------------------------------------------
  window.di_createOrb3D = di_createOrb3D;
  window.di_mountOrb = di_mountOrb;
  window.di_initOrb = di_initOrb;
  window.di_initSymbolBar = di_initSymbolBar;
  window.di_syncTitle = di_syncTitle;

  // --------------------------------------------------------------------------
  // INIT
  // --------------------------------------------------------------------------
  function di_boot() {
    di_injectOrbStyles();
    di_syncTitle();
    di_initOrb();
    di_initSymbolBar();
    di_startObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", di_boot, { once: true });
  } else {
    di_boot();
  }
})();
