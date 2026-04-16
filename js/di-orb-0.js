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
  function di_injectOrbStyles() {
    if (document.getElementById("di-orb-styles")) return;

    const style = document.createElement("style");
    style.id = "di-orb-styles";
    style.textContent = `
      .di-orb-host {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        min-height: 120px;
      }

      .di-orb-root {
        --orb-size: 120px;
        --orb-glow: rgba(120, 200, 255, 0.22);
        --orb-edge: rgba(255, 255, 255, 0.18);
        --orb-core: rgba(255, 255, 255, 0.85);
        width: var(--orb-size);
        height: var(--orb-size);
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        transform-style: preserve-3d;
        perspective: 1000px;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .di-orb-shell {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255,255,255,.28), transparent 26%),
          radial-gradient(circle at 50% 55%, rgba(120,200,255,.16), rgba(10,14,24,.92) 62%, rgba(0,0,0,.98) 100%);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.06) inset,
          0 10px 28px rgba(0,0,0,.35),
          0 0 24px var(--orb-glow);
        overflow: hidden;
        transform: translateZ(0);
      }

      .di-orb-shell::before {
        content: "";
        position: absolute;
        inset: 8%;
        border-radius: inherit;
        background: radial-gradient(circle at 50% 45%, rgba(255,255,255,.22), transparent 55%);
        filter: blur(2px);
        opacity: .9;
      }

      .di-orb-ring {
        position: absolute;
        inset: -10%;
        border-radius: 9999px;
        pointer-events: none;
        border: 1px solid rgba(255,255,255,.08);
        box-shadow:
          0 0 0 1px rgba(120, 200, 255, .12) inset,
          0 0 18px rgba(120, 200, 255, .16);
        transform: rotateX(68deg) rotateZ(0deg);
        animation: diOrbSpin 7.5s linear infinite;
      }

      .di-orb-ring::before,
      .di-orb-ring::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 9999px;
      }

      .di-orb-ring::before {
        border: 1px solid rgba(255,255,255,.18);
        transform: scale(.92);
        opacity: .65;
      }

      .di-orb-ring::after {
        border: 1px solid rgba(120,200,255,.24);
        transform: scale(.78);
        opacity: .7;
      }

      .di-orb-core {
        position: absolute;
        inset: 18%;
        border-radius: 9999px;
        background:
          radial-gradient(circle at 35% 35%, rgba(255,255,255,.95), rgba(255,255,255,.32) 16%, rgba(120,200,255,.18) 34%, rgba(10,14,24,.1) 58%, rgba(0,0,0,.0) 100%);
        filter: drop-shadow(0 0 12px rgba(255,255,255,.18));
        animation: diOrbPulse 3.8s ease-in-out infinite;
      }

      .di-orb-orbit {
        position: absolute;
        inset: 10%;
        border-radius: 9999px;
        border: 1px solid rgba(255,255,255,.08);
        opacity: .8;
        transform: rotateX(72deg) rotateY(18deg);
        animation: diOrbTilt 9s ease-in-out infinite alternate;
      }

      .di-orb-highlight {
        position: absolute;
        left: 18%;
        top: 14%;
        width: 24%;
        height: 16%;
        border-radius: 9999px;
        background: linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,0));
        filter: blur(2px);
        transform: rotate(-18deg);
        opacity: .9;
      }

      .di-orb-label {
        position: absolute;
        bottom: -1.8rem;
        left: 50%;
        transform: translateX(-50%);
        font: 600 12px/1.1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: rgba(255,255,255,.72);
        white-space: nowrap;
        pointer-events: none;
      }

      .di-symbol-bar {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        flex-wrap: wrap;
        max-width: 100%;
      }

      .di-symbol-item {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        min-height: 36px;
        padding: .4rem .7rem;
        border-radius: 999px;
        text-decoration: none;
        color: inherit;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
        will-change: transform;
      }

      .di-symbol-item:hover {
        transform: translateY(-1px);
        background: rgba(255,255,255,.07);
        border-color: rgba(255,255,255,.14);
        box-shadow: 0 10px 24px rgba(0,0,0,.16);
      }

      .di-symbol-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .di-symbol-label {
        font: 600 13px/1.1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: .02em;
        white-space: nowrap;
      }

      @keyframes diOrbSpin {
        from { transform: rotateX(68deg) rotateZ(0deg); }
        to   { transform: rotateX(68deg) rotateZ(360deg); }
      }

      @keyframes diOrbPulse {
        0%, 100% { transform: scale(.98); opacity: .86; }
        50%      { transform: scale(1.03); opacity: 1; }
      }

      @keyframes diOrbTilt {
        0%   { transform: rotateX(72deg) rotateY(12deg); }
        100% { transform: rotateX(72deg) rotateY(28deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .di-orb-ring,
        .di-orb-core,
        .di-orb-orbit {
          animation: none !important;
        }
        .di-symbol-item {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

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
