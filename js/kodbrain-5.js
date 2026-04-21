
(() => {
  if (window.KoduxBrain?.__brainStable) return;

  const Brain = {
    __brainStable: true,
    state: {},
    raf: 0,
    idleTimer: 0,
    _bound: false,

    // =========================
    // STORAGE
    // =========================
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

    // =========================
    // HELPERS
    // =========================
    norm(v, fallback = "Convidado") {
      const s = String(v ?? "").trim();
      return s || fallback;
    },

    resolveName() {
      const master = this.get("di_userName", "").trim?.() || "";
      if (master) return master;

      const inputUser = document.querySelector("#inputUser")?.value?.trim();
      if (inputUser) return inputUser;

      const compatUser = this.get("userName", "").trim?.() || "";
      if (compatUser) return compatUser;

      const infodoseStore = this.get("infodose:userName", "").trim?.() || "";
      if (infodoseStore) return infodoseStore;

      const infodoseInput = document.querySelector("#infodoseNameInput")?.value?.trim();
      if (infodoseInput) return infodoseInput;

      return "Convidado";
    },

    setText(sel, value) {
      const el = document.querySelector(sel);
      if (el) el.textContent = value;
    },

    setHtml(sel, value) {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = value;
    },

    hashStr(s = "") {
      let h = 0xdeadbeef;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
      }
      return (h ^ (h >>> 16)) >>> 0;
    },

    injectOrbStyles() {
      if (document.getElementById("dual-orb-styles")) return;

      const style = document.createElement("style");
      style.id = "dual-orb-styles";
      style.textContent = `
        @keyframes orbBreathe {
          0%,100% { transform: scale(1); opacity:.86; filter:brightness(1); }
          50% { transform: scale(1.08); opacity:1; filter:brightness(1.25); }
        }
        @keyframes orbSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbPulse {
          0% { transform: scale(.76); opacity:.5; }
          100% { transform: scale(1.28); opacity:0; }
        }

        .dual-orb {
          display:block;
          width:100%;
          height:100%;
          cursor:pointer;
          transform-origin:center;
          transition:transform .28s cubic-bezier(.175,.885,.32,1.275);
        }
        .dual-orb:active { transform: scale(.93); }

        .orb-glow {
          animation: orbBreathe var(--orb-speed, 4s) ease-in-out infinite;
          transform-origin:center;
        }
        .orb-ring {
          animation: orbSpin var(--orb-spin-speed, 12s) linear infinite;
          transform-origin:center;
        }
        .orb-pulse {
          animation: orbPulse var(--orb-pulse-speed, 2s) cubic-bezier(.2,.8,.2,1) infinite;
          transform-origin:center;
        }

        .dual-orb:hover .orb-glow { animation-duration: 1.5s !important; }
        .dual-orb:hover .orb-ring { animation-duration: 4s !important; }
        .dual-orb:hover .orb-pulse { animation-duration: 1s !important; }
      `;
      document.head.appendChild(style);
    },

    makeOrbAvatar(name = "DUAL", size = 64) {
      this.injectOrbStyles();

      const safe = this.norm(name, "DUAL");
      const seed = this.hashStr(safe);
      const baseHue = seed % 360;
      const accentHue = (seed * 1.618) % 360;

      const usePrimary = getComputedStyle(document.documentElement)
        .getPropertyValue("--kob-voice-primary")
        .trim();

      const c1 = usePrimary || `hsl(${baseHue},100%,65%)`;
      const c2 = usePrimary || `hsl(${accentHue},90%,45%)`;
      const c3 = usePrimary || `hsl(${accentHue},100%,10%)`;

      const id = "orb_" + seed.toString(36);

      return `
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="dual-orb" id="${id}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="${id}_core">
              <stop offset="0%" stop-color="${c1}"/>
              <stop offset="60%" stop-color="${c2}"/>
              <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
            </radialGradient>

            <linearGradient id="${id}_ring">
              <stop offset="0%" stop-color="${c1}"/>
              <stop offset="100%" stop-color="${c2}"/>
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="46" fill="var(--bg, #05070c)"/>
          <circle cx="50" cy="50" r="38" fill="none" stroke="url(#${id}_ring)" stroke-width="1" class="orb-pulse"/>
          <circle cx="50" cy="50" r="42" fill="url(#${id}_core)" class="orb-glow"/>
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#${id}_ring)" stroke-width="2.5" stroke-dasharray="70 20 10 30" stroke-linecap="round" class="orb-ring" opacity="0.86"/>
          <circle cx="50" cy="50" r="8" fill="#fff" opacity="0.28" filter="blur(2px)"/>
          <circle cx="50" cy="50" r="3" fill="#fff" opacity="0.82"/>
        </svg>
      `;
    },

    renderOrb(targetSel, name, size) {
      const el = document.querySelector(targetSel);
      if (!el) return;

      const safe = this.norm(name, "DUAL");
      el.dataset.orbName = safe;
      el.innerHTML = this.makeOrbAvatar(safe, size);
    },

    // =========================
    // SOURCE OF TRUTH
    // =========================
    syncIdentity(name = null, source = null) {
      const safe = this.norm(name ?? this.resolveName(), "Convidado");

      if (source === "master") {
        localStorage.setItem("di_userName", safe);
        localStorage.setItem("userName", safe); // compat, mas só nasce do master
        this.state.di_userName = safe;
        this.state.userName = safe;
      }

      if (source === "infodose") {
        localStorage.setItem("infodose:userName", safe);
        this.state["infodose:userName"] = safe;
      }

      // Se veio de sync geral, não sobrescreve ninguém.
      // Só atualiza a UI com a melhor fonte atual.
      document.documentElement.dataset.diName = safe;
      document.body.dataset.user = safe;

      this.setText("#lblName", safe);
      this.setText("#actName", safe);
      this.setText("#smallText", safe);
      this.setText("#hudStatus", safe);
      this.setText("#usernameDisplay", safe);

      const hasActiveKey =
        Boolean((this.get("di_apiKey", "") || "").trim()) ||
        Boolean(window.STATE?.keys?.some?.(k => k?.active));

      const activeKey = window.STATE?.keys?.find?.(k => k?.active);
      const smallIdent = activeKey?.name || (hasActiveKey ? "active" : "--");

      this.setText("#smallIdent", smallIdent);
      this.setText("#actBadge", hasActiveKey ? "key:active" : "v:--");

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
      document.body.dataset.mode = mode;
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
      if (btnArch) btnArch.classList.toggle("di-orb-returning", fused);
    },

    hydrateInputs() {
      const master = this.get("di_userName", "").trim?.() || "";
      const infodose = this.get("infodose:userName", "").trim?.() || "";
      const apiKey = this.get("di_apiKey", "");
      const model = this.get("di_modelName", "");

      const inputUser = document.querySelector("#inputUser");
      if (inputUser && !inputUser.value && master) inputUser.value = master;

      const infodoseInput = document.querySelector("#infodoseNameInput");
      if (infodoseInput && !infodoseInput.value && infodose) infodoseInput.value = infodose;

      const apiKeyInput = document.querySelector("#apiKeyInput");
      if (apiKeyInput && !apiKeyInput.value && apiKey) apiKeyInput.value = apiKey;

      const modelSelect = document.querySelector("#modelSelect");
      if (modelSelect && model) modelSelect.value = model;
    },

    // =========================
    // BINDINGS
    // =========================
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
        const safe = this.norm(v, "Convidado");
        this.syncIdentity(safe, "master");
        this.syncFusionState();
      });

      bind("#infodoseNameInput", (v) => {
        const safe = this.norm(v, "Convidado");
        this.syncIdentity(safe, "infodose");
      });

      bind("#apiKeyInput", (v) => {
        const safe = (v || "").trim();
        localStorage.setItem("di_apiKey", safe);
        this.state.di_apiKey = safe;
        this.syncIdentity();
      });

      bind("#modelSelect", (v) => {
        const safe = (v || "").trim();
        localStorage.setItem("di_modelName", safe);
        this.state.di_modelName = safe;
      });

      const saveBtn = document.querySelector("#saveSystemBtn");
      if (saveBtn && saveBtn.dataset.brainBound !== "1") {
        saveBtn.dataset.brainBound = "1";
        saveBtn.addEventListener("click", () => {
          this.readAll();
          this.hydrateInputs();
          this.syncIdentity();
          this.syncTheme();
          this.syncMode();
          this.syncFusionState();
        });
      }
    },

    bindEvents() {
      if (this._bound) return;
      this._bound = true;

      window.addEventListener("storage", () => {
        this.readAll();
        this.sync();
      });

      document.addEventListener("di:name:update", (e) => {
        const name = this.norm(e.detail?.name, "");
        if (!name) return;
        this.syncIdentity(name, "master");
        this.syncFusionState();
      });

      document.addEventListener("pointerdown", () => this.pingIdle(false), { passive: true });
      document.addEventListener("pointermove", () => this.pingIdle(false), { passive: true });
      document.addEventListener("keydown", () => this.pingIdle(false));
      document.addEventListener("scroll", () => this.pingIdle(false), { passive: true });
    },

    pingIdle(isIdle) {
      clearTimeout(this.idleTimer);
      const targets = document.querySelectorAll(".kob-tts-dock, #kodux-widget, [data-idle-target]");
      targets.forEach(el => el.classList.toggle("idle", !!isIdle));

      this.idleTimer = setTimeout(() => {
        targets.forEach(el => el.classList.add("idle"));
      }, 1870);
    },

    sync() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        this.readAll();
        this.hydrateInputs();
        this.syncIdentity();
        this.syncTheme();
        this.syncMode();
        this.syncFusionState();
        this.bindInputs();
      });
    },

    boot() {
      this.readAll();
      this.bindEvents();
      this.bindInputs();
      this.hydrateInputs();
      this.syncIdentity();
      this.syncTheme();
      this.syncMode();
      this.syncFusionState();
      this.pingIdle(false);

      const observer = new MutationObserver(() => {
        this.syncFusionState();
      });

      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["class", "style", "data-mode", "data-theme"]
      });

      window.addEventListener("resize", () => this.syncFusionState(), { passive: true });

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.sync();
          this.syncFusionState();
        }, { once: true });
      } else {
        this.sync();
        this.syncFusionState();
      }
    }
  };

  window.KoduxBrain = Brain;

  window.DI = window.DI || {};
  window.DI.syncNameUI = (name) => Brain.syncIdentity(name, "master");
  window.DI.renderOrb = (...args) => Brain.renderOrb(...args);
  window.DI.makeOrbAvatar = (...args) => Brain.makeOrbAvatar(...args);

  Brain.boot();
})();
