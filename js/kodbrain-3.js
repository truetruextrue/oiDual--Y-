
(() => {
  if (window.KoduxBrain?.__brainSyncOnly) return;

  const Brain = {
    __brainSyncOnly: true,
    state: {},
    raf: 0,

    // =========================
    // STORAGE
    // =========================
    readAll() {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const raw = localStorage.getItem(k);
        try { data[k] = JSON.parse(raw); }
        catch { data[k] = raw; }
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
    },

    // =========================
    // IDENTIDADE
    // =========================
    getUserName() {
      return (
        document.querySelector("#inputUser")?.value?.trim() ||
        this.get("di_userName") ||
        this.get("userName") ||
        "Convidado"
      );
    },

    getArch() {
      return (
        localStorage.getItem("uno:arch") ||
        localStorage.getItem("arch") ||
        localStorage.getItem("tl_arq") ||
        "kobllux"
      );
    },

    // =========================
    // UI HELPERS
    // =========================
    setText(sel, value) {
      const el = document.querySelector(sel);
      if (el && el.textContent !== value) el.textContent = value;
    },

    renderOrb(sel, name, size) {
      const el = document.querySelector(sel);
      if (!el) return;

      if (typeof window.makeOrbAvatar === "function") {
        el.innerHTML = window.makeOrbAvatar(name, size);
      }
    },

    // =========================
    // SYNC PRINCIPAL
    // =========================
    syncIdentity() {
      const user = this.getUserName().trim() || "Convidado";
      const arch = this.getArch().trim();

      // salva
      localStorage.setItem("di_userName", user);

      // DATASETS (importante pro teu sistema)
      document.documentElement.dataset.arch = arch;
      document.body.dataset.user = user;

      // TEXTO
      this.setText("#lblName", user);
      this.setText("#actName", user);
      this.setText("#smallText", user);

      // 🔥 AQUI É O PONTO QUE VOCÊ QUERIA
      const hudText = `${user} · ${arch.toUpperCase()}`;
      this.setText("#hudStatus", hudText);

      // ORBS
      this.renderOrb("#main-orb", user, 48);
      this.renderOrb("#avatarTarget", user, 64);
      this.renderOrb("#smallMiniAvatar", user, 24);
      this.renderOrb("#actMiniAvatar", user, 24);
    },

    syncFusion() {
      const card = document.querySelector("#mainCard");
      const bar = document.querySelector("#symbolBar");
      if (!card || !bar) return;

      const c = card.getBoundingClientRect();
      const b = bar.getBoundingClientRect();

      const dx = Math.max(0, Math.max(c.left - b.right, b.left - c.right));
      const dy = Math.max(0, Math.max(c.top - b.bottom, b.top - c.bottom));
      const dist = Math.hypot(dx, dy);

      const near = dist < 180;
      const fused = dist < 96;

      card.classList.toggle("di-near-bar", near);
      card.classList.toggle("di-fused", fused);
      bar.classList.toggle("di-fuse-glow", near);

      const btn = document.querySelector("#btn-arch");
      if (btn) btn.classList.toggle("di-orb-returning", fused);
    },

    // =========================
    // BIND
    // =========================
    bind() {
      const input = document.querySelector("#inputUser");
      if (input && !input.dataset.bound) {
        input.dataset.bound = "1";
        input.addEventListener("input", () => {
          this.set("di_userName", input.value.trim() || "Convidado");
        });
      }
    },

    // =========================
    // LOOP
    // =========================
    sync() {
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        this.readAll();
        this.syncIdentity();
        this.syncFusion();
        this.bind();
      });
    },

    boot() {
      this.sync();

      window.addEventListener("storage", () => this.sync());
      window.addEventListener("resize", () => this.syncFusion());

      const obs = new MutationObserver(() => this.syncFusion());
      obs.observe(document.body, { subtree: true, attributes: true });
    }
  };

  window.KoduxBrain = Brain;
  Brain.boot();
})();
