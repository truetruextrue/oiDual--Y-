(() => {
  "use strict";

  const STORAGE = {
    compact: "di_compact_mode_v1"
  };

  const SELECTORS = {
    appRoot: "#app-root",
    topbar: ".topbar",
    heroContent: ".hero-content",
    heroMedia: ".hero-media",
    accordionGroup: ".accordion-group",
    footerQuote: ".footer-quote",
    catalogNav: ".catalog-nav",
    drawerToggle: ".drawer-toggle",
    drawerPanel: "#drawerPanel",
    drawerOverlay: "#drawerOverlay"
  };

  const INTERACTIVE = [
    "button",
    "a",
    "input",
    "select",
    "textarea",
    "label",
    "summary",
    ".drawer-toggle",
    ".drawer-close",
    ".nav-btn",
    ".btn-action",
    ".btn-mini",
    ".btn-download",
    ".btn-upload",
    ".preset-btn"
  ].join(",");

  const state = {
    observer: null,
    compact: loadCompact(),
    topbarBound: false
  };

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function loadCompact() {
    return localStorage.getItem(STORAGE.compact) === "1";
  }

  function saveCompact(on) {
    localStorage.setItem(STORAGE.compact, on ? "1" : "0");
  }

  function setCompact(on) {
    state.compact = !!on;
    document.body.classList.toggle("di-compact", state.compact);
    saveCompact(state.compact);
  }

  function toggleCompact() {
    setCompact(!state.compact);
  }

  function isInteractive(target) {
    return !!target.closest(INTERACTIVE);
  }

  function ensureTopbarBound() {
    if (state.topbarBound) return;
    state.topbarBound = true;

    document.addEventListener(
      "click",
      (e) => {
        const topbar = e.target.closest(SELECTORS.topbar);
        if (!topbar) return;

        if (
          e.target.closest(SELECTORS.drawerToggle) ||
          isInteractive(e.target)
        ) {
          return;
        }

        toggleCompact();
      },
      true
    );
  }

  function addCollapsavelClasses(root = document) {
    qsa(
      [
        SELECTORS.heroContent,
        `${SELECTORS.accordionGroup} details`,
        SELECTORS.footerQuote,
        SELECTORS.catalogNav
      ].join(","),
      root
    ).forEach((el) => el.classList.add("collapsavel"));
  }

  function bindDetailsCollapse(root = document) {
    qsa(`${SELECTORS.accordionGroup} details`, root).forEach((details) => {
      if (details.__diCollapseBound) return;
      details.__diCollapseBound = true;

      details.addEventListener("click", (e) => {
        if (isInteractive(e.target)) return;

        if (e.target.closest("summary")) return;

        details.open = !details.open;
      });
    });
  }

  function buildInfodoseBlock() {
    const shell = document.createElement("section");
    shell.className = "di-infodose-shell collapsavel";
    shell.innerHTML = `
      
    `;
    return shell;
  }

  function bindInfodoseActions(root = document) {
    const heroContent = qs(SELECTORS.heroContent, root);
    if (!heroContent) return;

    let shell = heroContent.querySelector(".di-infodose-shell");
    if (!shell) {
      shell = buildInfodoseBlock();
      heroContent.appendChild(shell);
    }

    const stage = shell.querySelector(".di-infodose-stage");
    const deep = shell.querySelector(".di-infodose-deep");
    const btnOpen = shell.querySelector('[data-di-action="open-infodose"]');
    const btnReveal = shell.querySelector('[data-di-action="reveal-deep"]');
    const btnTransform = shell.querySelector('[data-di-action="use-transform"]');

    if (!btnOpen.__diBound) {
      btnOpen.__diBound = true;
      btnOpen.addEventListener("click", () => {
        stage.hidden = false;
        btnOpen.textContent = "Infodose aberto";
        btnOpen.blur();
      });
    }

    if (!btnReveal.__diBound) {
      btnReveal.__diBound = true;
      btnReveal.addEventListener("click", () => {
        deep.hidden = false;
        btnReveal.blur();
      });
    }

    if (!btnTransform.__diBound) {
      btnTransform.__diBound = true;
      btnTransform.addEventListener("click", () => {
        deep.hidden = false;
        qsa(".di-deep-card", shell).forEach((card) => card.classList.remove("is-collapsed"));
        btnTransform.textContent = "transformação ativa";
        btnTransform.blur();
      });
    }
  }

  function addFutureTtsHooks(root = document) {
    qsa(".collapsavel", root).forEach((el) => {
      if (el.dataset.diTtsReady === "1") return;
      el.dataset.diTtsReady = "1";
      if (el.querySelector(".tts-dot")) return;

      const anchor =
        el.querySelector("summary") ||
        el.querySelector(".di-infodose-btn") ||
        el.querySelector(".di-infodose-ghost") ||
        el.querySelector(".di-infodose-secondary");

      if (!anchor) return;

      anchor.insertAdjacentHTML("afterbegin", '<span class="tts-dot" aria-hidden="true"></span>');
    });
  }

  function prepareRoot() {
    const root = qs(SELECTORS.appRoot);
    if (!root) return;

    addCollapsavelClasses(root);
    bindDetailsCollapse(root);
    bindInfodoseActions(root);
    addFutureTtsHooks(root);

    if (state.compact) document.body.classList.add("di-compact");
    else document.body.classList.remove("di-compact");
  }

  function watchAppRoot() {
    const root = qs(SELECTORS.appRoot);
    if (!root) return;

    if (state.observer) state.observer.disconnect();

    state.observer = new MutationObserver(() => {
      prepareRoot();
    });

    state.observer.observe(root, {
      childList: true,
      subtree: true
    });
  }

  function wireKeyboardShortcut() {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (document.body.classList.contains("di-compact")) {
        setCompact(false);
      }
    });
  }

  function boot() {
    ensureTopbarBound();
    setCompact(state.compact);
    prepareRoot();
    watchAppRoot();
    wireKeyboardShortcut();

    window.di_setCompactMode = setCompact;
    window.di_toggleCompactMode = toggleCompact;
    window.di_prepareInfodoseOverride = prepareRoot;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

})();
