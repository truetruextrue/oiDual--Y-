(() => {
  if (window.KoduxBrain?.__brainSyncOnly) return;

  // =========================================================
  // ORB SYSTEM · CSS INJETADO
  // =========================================================
  const ORB_STYLE_ID = "dual-orb-styles";

  function injectOrbStyles() {
    if (document.getElementById(ORB_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = ORB_STYLE_ID;
    style.textContent = `
      .orb-wrap {
        display: grid;
        place-items: center;
      }

      .orb-wrap svg {
        width: 100%;
        height: 100%;
        display: block;
      }

      .orb-glow {
        opacity: 0.25;
        filter: blur(4px);
      }

      .orb-core {
        transform-origin: center;
        animation: orbSpin var(--orb-speed, 7.8s) linear infinite;
        filter: drop-shadow(0 0 6px rgba(120, 227, 255, 0.6));
      }

      .orb-ring {
        fill: none;
        stroke: rgba(255, 255, 255, 0.12);
        stroke-width: 1.5;
        stroke-dasharray: 70 20 10 30;
        transform-origin: center;
        animation: orbSpinReverse calc(var(--orb-speed, 7.8s) * 1.6) linear infinite;
      }

      #main-orb[data-context="speaking"] .orb-core {
        animation:
          orbSpin 2s linear infinite,
          orbPulse 0.5s ease-in-out infinite alternate;
      }

      #main-orb[data-context="speaking"] .orb-ring {
        stroke: rgba(120, 227, 255, 0.6);
      }

      @keyframes orbSpin {
        to { transform: rotate(360deg); }
      }

      @keyframes orbSpinReverse {
        to { transform: rotate(-360deg); }
      }

      @keyframes orbPulse {
        from { transform: scale(1); }
        to { transform: scale(1.12); }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================================================
  // GERADOR UNIVERSAL DO ORB
  // =========================================================
  function makeOrbAvatar(name, size = 36) {
    const safe = (name || "DUAL").trim() || "DUAL";

    // seed determinística baseada no nome
    const seed = safe.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

    const h1 = seed % 360;
    const h2 = (seed * 37) % 360;

    // evita colisão de gradient no DOM
    const uid = Math.random().toString(36).slice(2, 6);
    const id = "g" + seed.toString(36) + uid;

    return `
      <div class="orb-wrap" style="width:${size}px;height:${size}px">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="hsl(${h1},100%,60%)"/>
              <stop offset="100%" stop-color="hsl(${h2},90%,50%)"/>
            </linearGradient>
          </defs>

          <circle class="orb-glow" cx="16" cy="16" r="10" fill="url(#${id})"/>
          <circle class="orb-core" cx="16" cy="16" r="7" fill="url(#${id})"/>
          <circle class="orb-ring" cx="16" cy="16" r="13"/>
        </svg>
      </div>
    `;
  }

  window.makeOrbAvatar = makeOrbAvatar;
  window.makeMiniAvatar = (name) => makeOrbAvatar(name, 24);

  // =========================================================
  // HELPERS
  // =========================================================
  function getEl(sel) {
    return document.querySelector(sel);
  }

  function setText(sel, value) {
    const el = getEl(sel);
    if (el) el.textContent = value;
  }

  function getStored(key, fallback = null) {
    const v = localStorage.getItem(key);
    return v == null || v === "" ? fallback : v;
  }

  function getActiveArch() {
    return (
      getStored("uno:arch") ||
      getStored("arch") ||
      getStored("tl_arq") ||
      getStored("di_infodoseName") ||
      "kobllux"
    ).trim();
  }

  function getDisplayName() {
    return (
      getStored("di_userName") ||
      getStored("userName") ||
      getStored("infodose:userName") ||
      "Convidado"
    ).trim();
  }

  function syncHudStatus() {
    const user = getDisplayName();
    const arch = getActiveArch();
    const hud = getEl("#hudStatus");
    if (hud) hud.textContent = `${user} · ${arch.toUpperCase()}`;
  }

  // =========================================================
  // BRAIN
  // =========================================================
  const Brain = {
    __brainSyncOnly: true,
    state: {},
    raf: 0,
    idleTimer: 0,

    readAll() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const raw = localStorage.getItem(k);
        try {
          data[k] = JSON.parse(raw);
        } catch {
          data[k] = raw;
        }
      }
      this.state = data;
      return data;
    },

    get(key, fallback = null) {
      const v = this.state[key];
      return v === undefined ? fallback : v;
    },

    set(key, value) {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      this.state[key] = value;
      this.sync();
      return value;
    },

    safeName() {
      return (
        document.querySelector("#inputUser")?.value?.trim() ||
        document.querySelector("#infodoseNameInput")?.value?.trim() ||
        this.get("di_userName") ||
        this.get("userName") ||
        this.get("infodose:userName") ||
        "Convidado"
      ).trim() || "Convidado";
    },

    renderOrb(targetSel, name, size) {
      const el = document.querySelector(targetSel);
      if (!el) return;

      const safe = (name || "DUAL").trim() || "DUAL";

      if (typeof window.makeOrbAvatar === "function") {
        el.innerHTML = window.makeOrbAvatar(safe, size);
        el.dataset.orbName = safe;
        el.setAttribute("data-context", el.getAttribute("data-context") || "idle");
        return;
      }

      const seed = safe.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const h1 = seed % 360;
      const h2 = (seed * 37) % 360;
      const gid = "g" + seed.toString(36);

      el.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="hsl(${h1},100%,55%)"/>
              <stop offset="100%" stop-color="hsl(${h2},90%,45%)"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="7" fill="#071018"/>
          <circle cx="16" cy="16" r="9" fill="url(#${gid})" opacity="0.25"/>
          <circle cx="16" cy="16" r="7" fill="url(#${gid})"/>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
        </svg>
      `;
      el.dataset.orbName = safe;
      el.setAttribute("data-context", el.getAttribute("data-context") || "idle");
    },

    syncIdentity() {
      const safe = this.safeName();

      localStorage.setItem("di_userName", safe);
      localStorage.setItem("userName", safe);
      localStorage.setItem("infodose:userName", safe);

      document.documentElement.dataset.diName = safe;
      document.documentElement.dataset.arch = safe;
      document.body.dataset.user = safe;

      setText("#lblName", safe);
      setText("#actName", safe);
      setText("#smallText", safe);
      setText("#usernameDisplay", safe);

      syncHudStatus();

      const activeKey = this.get("openrouter_active");
      setText("#smallIdent", activeKey ? String(activeKey).slice(0, 12) : "--");
      setText("#actBadge", activeKey ? "key:active" : "v:--");

      this.renderOrb("#main-orb", safe, 48);
      this.renderOrb("#avatarTarget", safe, 64);
      this.renderOrb("#smallMiniAvatar", safe, 24);
      this.renderOrb("#actMiniAvatar", safe, 24);
    },

    syncTheme() {
      const theme = this.get("dual_theme", this.get("theme", "dark"));
      const solar = this.get("di_solarMode", "auto");
      const visual = this.get("arch:visualPreset", "cinematic-soft");
      const bloom = this.get("dual.ui.bloom", 0);

      document.body.dataset.theme = theme;
      document.body.dataset.solar = solar;
      document.body.dataset.visual = visual;
      document.documentElement.style.setProperty("--ui-bloom", String(bloom));
    },

    syncMode() {
      const mode =
        this.get("fusion_os_ui_state", {})?.mode ||
        this.get("bodyPlayerMode") ||
        document.body.dataset.mode ||
        "player";

      const bodyPlayer = document.querySelector("#bodyPlayer");
      if (bodyPlayer) bodyPlayer.dataset.mode = mode;
    },

    syncFusionState() {
      const mainCard = document.querySelector("#mainCard");
      const symbolBar = document.querySelector("#symbolBar");

      if (!mainCard || !symbolBar) return;

      const card = mainCard.getBoundingClientRect();
      const bar = symbolBar.getBoundingClientRect();

      const dx = Math.max(0, Math.max(card.left - bar.right, bar.left - card.right));
      const dy = Math.max(0, Math.max(card.top - bar.bottom, bar.top - card.bottom));
      const dist = Math.hypot(dx, dy);

      const near = dist < 180;
      const fused = dist < 96;

      mainCard.classList.toggle("di-near-bar", near);
      mainCard.classList.toggle("di-fused", fused);
      symbolBar.classList.toggle("di-fuse-glow", near);

      const btnArch = document.querySelector("#btn-arch");
      if (btnArch) {
        btnArch.classList.toggle("di-orb-returning", fused);
      }
    },

    bindInputs() {
      const bind = (sel, onChange) => {
        const el = document.querySelector(sel);
        if (!el || el.dataset.brainBound === "1") return;
        el.dataset.brainBound = "1";
        const run = () => onChange(el.value);
        el.addEventListener("input", run);
        el.addEventListener("change", run);
      };

      bind("#inputUser", (v) => {
        const safe = (v || "").trim() || "Convidado";
        this.set("di_userName", safe);
        this.syncIdentity();
        this.syncFusionState();
      });

      bind("#infodoseNameInput", (v) => {
        const safe = (v || "").trim() || "Convidado";
        localStorage.setItem("infodose:userName", safe);
        this.set("di_userName", safe);
        this.syncIdentity();
      });

      bind("#apiKeyInput", (v) => {
        localStorage.setItem("di_apiKey", v || "");
        this.state.di_apiKey = v || "";
      });

      bind("#modelSelect", (v) => {
        localStorage.setItem("di_modelName", v || "");
        this.state.di_modelName = v || "";
      });

      const saveBtn = document.querySelector("#saveSystemBtn");
      if (saveBtn && saveBtn.dataset.brainBound !== "1") {
        saveBtn.dataset.brainBound = "1";
        saveBtn.addEventListener("click", () => {
          this.syncIdentity();
          this.syncTheme();
          this.syncMode();
          this.syncFusionState();
        });
      }
    },

    bindEvents() {
      window.addEventListener("storage", () => {
        this.readAll();
        this.sync();
      });

      document.addEventListener("di:name:update", (e) => {
        const name = e.detail?.name;
        if (name) {
          localStorage.setItem("di_userName", name);
          localStorage.setItem("userName", name);
          this.state.di_userName = name;
          this.syncIdentity();
          this.syncFusionState();
        }
      });

      document.addEventListener("pointerdown", () => this.pingIdle(false), { passive: true });
      document.addEventListener("pointermove", () => this.pingIdle(false), { passive: true });
      document.addEventListener("keydown", () => this.pingIdle(false));
      document.addEventListener("scroll", () => this.pingIdle(false), { passive: true });
    },

    pingIdle(isIdle) {
      clearTimeout(this.idleTimer);
      const targets = document.querySelectorAll(".kob-tts-dock, #kodux-widget, [data-idle-target]");
      targets.forEach((el) => el.classList.toggle("idle", !!isIdle));

      this.idleTimer = setTimeout(() => {
        targets.forEach((el) => el.classList.add("idle"));
      }, 1870);
    },

    sync() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        this.readAll();
        this.syncIdentity();
        this.syncTheme();
        this.syncMode();
        this.syncFusionState();
        this.bindInputs();
      });
    },

    boot() {
      injectOrbStyles();
      this.readAll();
      this.sync();
      this.bindEvents();
      this.pingIdle(false);

      const observer = new MutationObserver(() => {
        this.syncFusionState();
      });

      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style", "data-mode", "data-arch", "data-theme"]
      });

      window.addEventListener("resize", () => this.syncFusionState(), { passive: true });

      document.addEventListener("DOMContentLoaded", () => {
        this.sync();
        this.syncFusionState();
      });
    }
  };

  window.KoduxBrain = Brain;
  Brain.boot();
})();