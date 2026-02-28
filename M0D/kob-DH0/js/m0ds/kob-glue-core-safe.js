/* =========================================================
   KOBLLUX — GLUE CORE v1.0 (DEFINITIVO)
   Autor: KODUX / TRINITY
   ========================================================= */

(() => {
  // 🔒 Singleton global (anti-duplicação)
  if (window.__KOB_GLUE_CORE__) return;
  window.__KOB_GLUE_CORE__ = true;

  console.log("[KOB] Glue Core iniciado");

  /* =========================================================
     1. ESTADO GLOBAL
     ========================================================= */
  const state = {
    iframe: null,
    hud: null,
    homeReady: false,
    currentURL: "about:blank",
  };

  /* =========================================================
     2. HELPERS
     ========================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const once = (key, fn) => {
    if (once[key]) return;
    once[key] = true;
    fn();
  };

  /* =========================================================
     3. IFRAME CORE
     ========================================================= */
  function initIframe() {
    state.iframe = $("#frame");
    if (!state.iframe) {
      console.warn("[KOB] iframe não encontrado");
      return;
    }

    state.iframe.setAttribute("loading", "lazy");
    state.iframe.setAttribute("referrerpolicy", "no-referrer");

    console.log("[KOB] iframe pronto");
  }

  function loadURL(url) {
    if (!state.iframe) return;
    if (state.currentURL === url) return;

    state.currentURL = url;
    state.iframe.src = url;

    console.log("[KOB] iframe load →", url);
  }

  /* =========================================================
     4. HUD BINDING
     ========================================================= */
  function initHUD() {
    state.hud = $("#symbolBar");
    if (!state.hud) {
      console.warn("[KOB] HUD não encontrado");
      return;
    }

    // Botões com data-url
    $$("[data-url]", state.hud).forEach(btn => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.url;
        if (url) loadURL(url);
      });
    });

    console.log("[KOB] HUD ligado");
  }

  /* =========================================================
     5. HOME INTEGRATION
     ========================================================= */
  function waitForHome() {
    const max = 40;
    let count = 0;

    const timer = setInterval(() => {
      if (window.KOB_HOME_READY) {
        clearInterval(timer);
        state.homeReady = true;
        console.log("[KOB] Home detectada");
      }

      if (++count > max) clearInterval(timer);
    }, 100);
  }

  /* =========================================================
     6. TTS SAFETY
     ========================================================= */
  function ensureTTSOutline() {
    once("tts-outline", () => {
      if (!$("#kob-tts-outline")) {
        const d = document.createElement("div");
        d.id = "kob-tts-outline";
        document.body.appendChild(d);
        console.log("[KOB] TTS outline criado");
      }
    });
  }

  /* =========================================================
     7. BOOT
     ========================================================= */
  function boot() {
    initIframe();
    initHUD();
    waitForHome();
    ensureTTSOutline();
  }

  // DOM READY
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
