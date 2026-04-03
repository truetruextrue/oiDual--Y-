/* FUSION CORE LOGIC (V7.1 REFATORADO)
   Preserving di_ constants for external app communication
*/
(() => {
  'use strict';

  if (window.__FUSION_CORE_LOGIC_V71__) return;
  window.__FUSION_CORE_LOGIC_V71__ = true;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const byId = (id) => document.getElementById(id);

  // REFERENCES
  const els = {
    card: byId('mainCard'),
    header: byId('cardHeader'),
    avatarTgt: byId('avatarTarget'),
    input: byId('inputUser'),
    lblHello: byId('lblHello'),
    lblName: byId('lblName'),
    clock: byId('clockTime'),
    smallPreview: byId('smallPreview'),
    smallMiniAvatar: byId('smallMiniAvatar'),
    smallText: byId('smallText'),
    smallIdent: byId('smallIdent'),
    actCard: byId('activationCard'),
    actPre: byId('actPre'),
    actName: byId('actName'),
    actMiniAvatar: byId('actMiniAvatar'),
    actBadge: byId('actBadge'),

    // Buttons
    btnModeCard: byId('btnModeCard'),
    btnModeOrb: byId('btnModeOrb'),
    btnModeHud: byId('btnModeHud'),
    orbMenuTrigger: byId('orbMenuTrigger'),
    hudMenuBtn: byId('hudMenuBtn'),
    snapZone: byId('snap-zone'),

    // Keys UI
    keysModal: byId('keysModal'),
    keyList: byId('keyList'),
    keyName: byId('keyNameInput'),
    keyToken: byId('keyTokenInput'),
    addKeyBtn: byId('addKeyBtn'),
    closeKeysBtn: byId('closeKeysBtn'),
    lockVaultBtn: byId('lockVaultBtn'),
    vaultStatusText: byId('vaultStatusText'),

    // Vault UI
    vaultModal: byId('vaultModal'),
    vaultPass: byId('vaultPassInput'),
    vaultUnlock: byId('vaultUnlockBtn'),
    vaultCancel: byId('vaultCancelBtn'),

    // System UI
    systemCard: byId('systemCard'),
    saveSystemBtn: byId('saveSystemBtn'),
    copyActBtn: byId('copyActBtn')
  };

  // --- STATE & PERSISTENCE ---
  const STORAGE_KEY = 'fusion_os_data_v2';
  const UI_STATE_KEY = 'fusion_os_ui_state';
  const FIRST_PREVIEW_KEY = 'fusion_orb_smallpreview_shown';
  const FIRST_PREVIEW_DURATION = 5000; // 5 segundos

  let STATE = {
    keys: [],
    user: 'Convidado',
    isEncrypted: false,
    encryptedData: null
  };

  let SESSION_PASSWORD = null;

  // IMPORTANT: Loading initial di_ constants if available
  let apiKey = localStorage.getItem('di_apiKey') || '';
  let modelName = localStorage.getItem('di_modelName') || 'nvidia/nemotron-3-nano-30b-a3b:free';
  let userName = localStorage.getItem('di_userName') || '';
  let infodoseName = localStorage.getItem('di_infodoseName') || '';

  // UI / Gestures state
  let state = {
    isOrb: false,
    isHud: false,
    isDragging: false,
    timer: null,
    startX: 0,
    startY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    pointerId: null
  };

  const HUD_SNAP_THRESHOLD = 60;
  const SWIPE_DOWN_THRESHOLD = 80;
  const LONG_PRESS_MS = 350;

  // --- SAFE HELPERS ---
  const hashStr = (s) => {
    let h = 0xdeadbeef;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
    }
    return (h ^ (h >>> 16)) >>> 0;
  };

  const escapeHtml = (s) =>
    s
      ? s.replace(/[&<>"']/g, (c) => (
          { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ))
      : '';

  const createSvg = (id, sz) =>
    `<svg viewBox="0 0 100 100" width="${sz}" height="${sz}">
      <defs>
        <linearGradient id="g${id}">
          <stop offset="0%" stop-color="#00f2ff"/>
          <stop offset="100%" stop-color="#bd00ff"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#080b12" stroke="rgba(255,255,255,0.1)"/>
      <circle cx="50" cy="50" r="20" fill="url(#g${id})" opacity="0.9"/>
    </svg>`;

  const createMiniSvg = (name, sz = 30) => {
    const s = hashStr(name || 'D');
    const h1 = s % 360;
    const h2 = (s * 37) % 360;
    const grad = `<linearGradient id="gm${s}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h1},90%,50%)"/>
      <stop offset="1" stop-color="hsl(${h2},90%,50%)"/>
    </linearGradient>`;
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 32 32">
      <defs>${grad}</defs>
      <rect width="32" height="32" rx="8" fill="#0a1016"/>
      <circle cx="16" cy="16" r="6" fill="url(#gm${s})"/>
    </svg>`;
  };

  function showToaster(txt, type = 'default') {
    const wrap = byId('toasterWrap');
    if (!wrap) return;

    const t = document.createElement('div');
    t.className = `toaster ${type}`;
    t.innerText = txt;
    wrap.appendChild(t);

    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  function updateModeButtons(mode) {
    [els.btnModeCard, els.btnModeOrb, els.btnModeHud].forEach((b) => {
      if (b) b.classList.remove('active-mode');
    });

    if (mode === 'card' && els.btnModeCard) els.btnModeCard.classList.add('active-mode');
    if (mode === 'orb' && els.btnModeOrb) els.btnModeOrb.classList.add('active-mode');
    if (mode === 'hud' && els.btnModeHud) els.btnModeHud.classList.add('active-mode');
  }

  function updateInterface(name) {
    const safe = name || 'Convidado';

    if (els.lblName) els.lblName.innerText = safe;
    if (els.input) els.input.value = safe;

    const activeKey = STATE.keys.find((k) => k.active);

    if (els.smallIdent) els.smallIdent.innerText = activeKey ? activeKey.name : '--';
    if (els.actBadge) els.actBadge.innerText = activeKey ? `key:${activeKey.name}` : 'v:--';
    if (els.smallMiniAvatar) els.smallMiniAvatar.innerHTML = createMiniSvg(safe);
    if (els.actMiniAvatar) els.actMiniAvatar.innerHTML = createMiniSvg(safe, 36);
    if (els.actName) els.actName.innerText = safe;
    if (els.avatarTgt) els.avatarTgt.innerHTML = createSvg('Main', 64);

    const phrases = ['Foco estável.', 'Ritmo criativo.', 'Percepção sutil.'];
    if (els.smallText) {
      els.smallText.innerText = activeKey
        ? `${activeKey.name} [ATIVO]`
        : (safe === 'Convidado' ? 'Aguardando...' : `${safe} · ${phrases[safe.length % phrases.length]}`);
    }

    if (els.actPre) {
      const line = `+${'-'.repeat(safe.length + 4)}+`;
      els.actPre.innerText = `${line}\n| ${safe.toUpperCase()} |\n${line}\nID: ${hashStr(safe).toString(16)}`;
    }
  }

  function updateSecurityUI() {
    if (!els.vaultStatusText || !els.lockVaultBtn) return;

    if (SESSION_PASSWORD) {
      els.vaultStatusText.innerText = 'Cofre Protegido (Destrancado)';
      els.lockVaultBtn.innerText = 'TRANCAR';
    } else if (STATE.isEncrypted) {
      els.vaultStatusText.innerText = 'Cofre Trancado';
      els.lockVaultBtn.innerText = 'REDEFINIR';
    } else {
      els.vaultStatusText.innerText = 'Cofre Aberto (Sem senha)';
      els.lockVaultBtn.innerText = 'CRIAR SENHA';
    }
  }

  function toggleSection(id, open = false) {
    const el = byId(id);
    if (!el) return;

    el.classList.toggle('activation-hidden', !open);
    el.classList.toggle('activation-open', open);
  }

  // --- CRYPTO UTILS ---
  const CRYPTO = {
    algo: { name: 'AES-GCM', length: 256 },
    pbkdf2: { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000 },

    async getKey(password, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      return crypto.subtle.deriveKey(
        { ...this.pbkdf2, salt },
        keyMaterial,
        this.algo,
        false,
        ['encrypt', 'decrypt']
      );
    },

    async encrypt(data, password) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.getKey(password, salt);
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

      const bundle = {
        s: Array.from(salt),
        iv: Array.from(iv),
        d: Array.from(new Uint8Array(encrypted))
      };

      return JSON.stringify(bundle);
    },

    async decrypt(bundleStr, password) {
      try {
        const bundle = JSON.parse(bundleStr);
        const salt = new Uint8Array(bundle.s);
        const iv = new Uint8Array(bundle.iv);
        const data = new Uint8Array(bundle.d);
        const key = await this.getKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return JSON.parse(new TextDecoder().decode(decrypted));
      } catch (e) {
        throw new Error('Senha incorreta ou dados corrompidos');
      }
    }
  };

  // --- UI STATE ---
  function saveUIState() {
    const mode = state.isOrb ? 'orb' : (state.isHud ? 'hud' : 'card');
    const uiState = {
      mode,
      left: els.card?.style.left || '',
      top: els.card?.style.top || ''
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
  }

  function readUIState() {
    const raw = localStorage.getItem(UI_STATE_KEY);
    if (!raw) return { mode: 'card', left: '', top: '' };

    try {
      const ui = JSON.parse(raw);
      return {
        mode: ui.mode || 'card',
        left: ui.left || '',
        top: ui.top || ''
      };
    } catch (e) {
      return { mode: 'card', left: '', top: '' };
    }
  }

  function loadUIState() {
    const ui = readUIState();
    if (!ui) return;

    if (ui.mode === 'orb') {
      if (ui.left) els.card.style.left = ui.left;
      if (ui.top) els.card.style.top = ui.top;
      window.setMode('orb', true);
    } else if (ui.mode === 'hud') {
      window.setMode('hud', true);
    }
  }

  function forceSmallPreview() {
    state.isOrb = false;
    state.isHud = false;
    state.isDragging = false;

    if (els.card) {
      els.card.classList.remove('orb', 'hud');
      els.card.classList.add('closed');
      els.card.classList.remove('content-visible');
      els.card.style.left = '';
      els.card.style.top = '';
      els.card.style.transform = '';
      els.card.style.opacity = 0;
      els.card.style.transition = 'opacity 400ms ease';
      requestAnimationFrame(() => {
        els.card.style.opacity = 1;
      });
    }
  }

  function restoreSavedMode(mode, left, top) {
    if (!els.card) return;

    els.card.style.transition = 'all 600ms var(--ease-smooth)';

    if (mode === 'orb') {
      if (left) els.card.style.left = left;
      if (top) els.card.style.top = top;
      window.setMode('orb', true);
    } else if (mode === 'hud') {
      window.setMode('hud', true);
    } else {
      window.setMode('card', true);
      els.card.classList.remove('closed');
      els.card.classList.add('content-visible');
    }
  }

  function showFirstRunPreviewIfNeeded(savedMode = 'card') {
    try {
      if (localStorage.getItem(FIRST_PREVIEW_KEY)) return false;
      if (savedMode !== 'card') return false;
      if (state.isOrb || state.isHud) return false;

      forceSmallPreview();
      localStorage.setItem(FIRST_PREVIEW_KEY, '1');
      saveUIState();
      return true;
    } catch (err) {
      console.error('First preview error', err);
      return false;
    }
  }

  // --- DATA PERSISTENCE ---
  async function saveData() {
    const payload = { keys: STATE.keys, user: STATE.user };

    if (SESSION_PASSWORD) {
      const enc = await CRYPTO.encrypt(payload, SESSION_PASSWORD);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isEncrypted: true, data: enc }));
      STATE.isEncrypted = true;
      STATE.encryptedData = enc;
      updateSecurityUI();
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isEncrypted: false, data: payload }));
      STATE.isEncrypted = false;
      STATE.encryptedData = null;
    }
  }

  async function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      updateInterface(STATE.user);
      renderKeysList();
      updateSecurityUI();
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (parsed.isEncrypted) {
        STATE.isEncrypted = true;
        STATE.encryptedData = parsed.data;
        updateSecurityUI();
      } else {
        STATE.isEncrypted = false;
        STATE.encryptedData = null;
        STATE.keys = parsed.data?.keys || [];
        STATE.user = parsed.data?.user || 'Convidado';

        const active = STATE.keys.find((k) => k.active);
        if (active && active.token) {
          localStorage.setItem('di_apiKey', active.token);
          apiKey = active.token;
        }

        if (STATE.user !== 'Convidado') {
          localStorage.setItem('di_userName', STATE.user);
          userName = STATE.user;
          if (els.input) els.input.value = STATE.user;
        }

        updateInterface(STATE.user);
        renderKeysList();
        updateSecurityUI();
      }
    } catch (e) {
      console.error('Load data error', e);
      updateInterface(STATE.user);
      renderKeysList();
      updateSecurityUI();
    }

    if (byId('apiKeyInput')) byId('apiKeyInput').value = apiKey;
    if (byId('infodoseNameInput')) byId('infodoseNameInput').value = infodoseName;
    if (byId('modelSelect')) byId('modelSelect').value = modelName;
  }

  // --- KEYS UI ---
  function renderKeysList() {
    if (!els.keyList) return;

    els.keyList.innerHTML = '';

    if (STATE.keys.length === 0) {
      els.keyList.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Nenhuma chave armazenada.</div>';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
      return;
    }

    STATE.keys.forEach((k) => {
      const div = document.createElement('div');
      div.className = `key-item ${k.active ? 'active-item' : ''}`;
      div.innerHTML = `
        <div class="meta" style="flex:1">
          <div style="font-weight:700;font-size:0.9rem">${escapeHtml(k.name)}</div>
        </div>
        <div class="actions">
          ${
            !k.active
              ? `<button class="small-btn" onclick="setActiveKey('${k.id}')">ATIVAR</button>`
              : `<span style="font-size:0.7rem;font-weight:700;color:var(--neon-cyan);margin-right:10px">ATIVA</span>`
          }
          <button class="small-btn danger" onclick="removeKey('${k.id}')">
            <i data-lucide="trash-2" style="width:14px"></i>
          </button>
        </div>
      `;
      els.keyList.appendChild(div);
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  async function addKey() {
    const name = els.keyName ? els.keyName.value.trim() : '';
    const token = els.keyToken ? els.keyToken.value.trim() : '';

    if (!name) {
      showToaster('Nome obrigatório', 'error');
      return;
    }

    const newKey = {
      id: Date.now().toString(36),
      name,
      token,
      active: STATE.keys.length === 0
    };

    STATE.keys.push(newKey);

    if (newKey.active && newKey.token) {
      localStorage.setItem('di_apiKey', newKey.token);
      apiKey = newKey.token;
    }

    await saveData();
    renderKeysList();
    updateInterface(STATE.user);

    if (els.keyName) els.keyName.value = '';
    if (els.keyToken) els.keyToken.value = '';

    showToaster('Chave adicionada!', 'success');
  }

  window.removeKey = async (id) => {
    if (!confirm('Remover chave permanentemente?')) return;

    STATE.keys = STATE.keys.filter((k) => k.id !== id);

    const active = STATE.keys.find((k) => k.active);
    if (active && active.token) {
      localStorage.setItem('di_apiKey', active.token);
      apiKey = active.token;
    } else if (!active) {
      localStorage.removeItem('di_apiKey');
      apiKey = '';
    }

    await saveData();
    renderKeysList();
    updateInterface(STATE.user);
  };

  window.setActiveKey = async (id) => {
    let activatedToken = null;

    STATE.keys.forEach((k) => {
      k.active = (k.id === id);
      if (k.active) activatedToken = k.token;
    });

    if (activatedToken) {
      localStorage.setItem('di_apiKey', activatedToken);
      apiKey = activatedToken;

      const apiKeyInput = byId('apiKeyInput');
      if (apiKeyInput) apiKeyInput.value = activatedToken;

      showToaster('Chave sincronizada com o Chat.', 'success');
    }

    await saveData();
    renderKeysList();
    updateInterface(STATE.user);
  };

  // --- VAULT EVENTS ---
  function openManager() {
    if (STATE.isEncrypted && !SESSION_PASSWORD) {
      if (els.vaultModal) els.vaultModal.style.display = 'flex';
      if (els.vaultPass) els.vaultPass.focus();
    } else {
      if (els.keysModal) els.keysModal.style.display = 'flex';
    }
  }

  if (els.vaultUnlock) {
    els.vaultUnlock.addEventListener('click', async () => {
      const pass = els.vaultPass ? els.vaultPass.value : '';
      try {
        const decrypted = await CRYPTO.decrypt(STATE.encryptedData, pass);
        SESSION_PASSWORD = pass;
        STATE.keys = decrypted.keys || [];
        STATE.user = decrypted.user || 'Convidado';

        const active = STATE.keys.find((k) => k.active);
        if (active && active.token) {
          localStorage.setItem('di_apiKey', active.token);
          apiKey = active.token;
        }

        if (STATE.user) {
          localStorage.setItem('di_userName', STATE.user);
          userName = STATE.user;
          if (els.input) els.input.value = STATE.user;
        }

        if (els.vaultModal) els.vaultModal.style.display = 'none';
        if (els.keysModal) els.keysModal.style.display = 'flex';
        if (els.vaultPass) els.vaultPass.value = '';

        renderKeysList();
        updateInterface(STATE.user);
        updateSecurityUI();
        showToaster('Cofre destrancado.', 'success');
      } catch (e) {
        showToaster('Senha incorreta.', 'error');
      }
    });
  }

  if (els.lockVaultBtn) {
    els.lockVaultBtn.addEventListener('click', async () => {
      if (!SESSION_PASSWORD && !STATE.isEncrypted) {
        const newPass = prompt('Defina uma senha para o Cofre:');
        if (newPass) {
          SESSION_PASSWORD = newPass;
          await saveData();
          showToaster('Cofre trancado.', 'success');
        }
      } else if (SESSION_PASSWORD) {
        SESSION_PASSWORD = null;
        if (els.keysModal) els.keysModal.style.display = 'none';
        showToaster('Sessão do cofre encerrada.', 'success');
      } else {
        showToaster('Cofre já criptografado. Desbloqueie para redefinir.', 'error');
      }
      updateSecurityUI();
    });
  }

  if (els.vaultCancel) {
    els.vaultCancel.addEventListener('click', () => {
      if (els.vaultModal) els.vaultModal.style.display = 'none';
    });
  }

  if (els.closeKeysBtn) {
    els.closeKeysBtn.addEventListener('click', () => {
      if (els.keysModal) els.keysModal.style.display = 'none';
    });
  }

  if (els.addKeyBtn) {
    els.addKeyBtn.addEventListener('click', addKey);
  }

  // --- MODES / MOTION ---
  function revertToCard() {
    state.isOrb = false;
    state.isHud = false;
    state.isDragging = false;

    if (!els.card) return;

    els.card.style.transition = 'all 0.5s var(--ease-smooth)';
    els.card.style.left = '';
    els.card.style.top = '';
    els.card.style.width = '';
    els.card.style.height = '';
    els.card.style.transform = '';
    els.card.classList.remove('orb', 'hud', 'closed');

    setTimeout(() => {
      els.card.classList.add('content-visible');
    }, 300);
  }

  window.setMode = (mode, isInitialLoad = false) => {
    updateModeButtons(mode);

    if (mode === 'card') {
      revertToCard();
    } else if (mode === 'orb') {
      state.isOrb = true;
      state.isHud = false;

      if (els.card) {
        els.card.classList.add('orb', 'closed');
        els.card.classList.remove('hud', 'content-visible');
        els.card.style.transform = 'none';
      }
    } else if (mode === 'hud') {
      state.isHud = true;
      state.isOrb = false;

      if (els.card) {
        els.card.classList.add('hud', 'closed');
        els.card.classList.remove('orb', 'content-visible');
        els.card.style.top = '';
        els.card.style.left = '';
        els.card.style.transform = '';
      }
    }

    if (!isInitialLoad) saveUIState();
  };

  function toggleCardState() {
    if (!els.card || els.card.classList.contains('animating')) return;

    const isClosed = els.card.classList.contains('closed');
    els.card.classList.add('animating');

    if (isClosed) {
      els.card.classList.remove('closed');
      els.card.animate(
        [{ transform: 'scale(0.95)', opacity: 0.8 }, { transform: 'scale(1)', opacity: 1 }],
        { duration: 400 }
      ).onfinish = () => {
        els.card.classList.remove('animating');
        els.card.classList.add('content-visible');
      };
    } else {
      els.card.classList.remove('content-visible');
      els.card.animate(
        [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(10px)', opacity: 1 }],
        { duration: 200 }
      ).onfinish = () => {
        els.card.classList.add('closed');
        els.card.classList.remove('animating');
      };
    }
  }

  function transmuteToOrb(eOrX) {
    let x;
    let y;
    let ev;

    if (eOrX && eOrX.clientX !== undefined) {
      ev = eOrX;
      x = ev.clientX;
      y = ev.clientY;
    } else {
      return;
    }

    if (navigator.vibrate) navigator.vibrate(40);

    if (els.card) {
      els.card.classList.add('orb', 'closed');
      els.card.classList.remove('content-visible');

      els.card.style.left = `${x - 34}px`;
      els.card.style.top = `${y - 34}px`;
    }

    state.isOrb = true;
    state.isHud = false;

    state.isDragging = true;

    if (ev && ev.pointerId && els.card) {
      state.pointerId = ev.pointerId;
      try {
        els.card.setPointerCapture(ev.pointerId);
      } catch (e) {}

      const rect = els.card.getBoundingClientRect();
      state.dragOffsetX = x - rect.left;
      state.dragOffsetY = y - rect.top;
    }

    updateModeButtons('orb');
  }

  function handleStart(e) {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      (e.target.tagName === 'BUTTON' && !e.target.closest('.orb-menu-trigger'))
    ) return;

    if (!state.isOrb && !state.isHud && els.header && !els.header.contains(e.target)) return;

    state.startX = e.clientX;
    state.startY = e.clientY;
    state.pointerId = e.pointerId;

    if (state.isOrb || state.isHud) {
      state.isDragging = true;
      try { els.card.setPointerCapture(e.pointerId); } catch (err) {}
      const rect = els.card.getBoundingClientRect();
      state.dragOffsetX = e.clientX - rect.left;
      state.dragOffsetY = e.clientY - rect.top;
      els.card.style.transition = 'none';
      return;
    }

    state.timer = setTimeout(() => {
      transmuteToOrb(e);
      saveUIState();
    }, LONG_PRESS_MS);
  }

  function handleMove(e) {
    if (!state.isOrb && !state.isHud && state.timer) {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > 12 && (dy < -10 || Math.abs(dx) > 18)) {
        clearTimeout(state.timer);
        state.timer = null;
        transmuteToOrb(e);

        if (els.card) {
          const rect = els.card.getBoundingClientRect();
          state.dragOffsetX = e.clientX - rect.left;
          state.dragOffsetY = e.clientY - rect.top;
          try { els.card.setPointerCapture(e.pointerId); } catch (err) {}
          els.card.style.transition = 'none';
        }
      }
    }

    if (!state.isDragging) return;
    e.preventDefault();

    if (!els.card) return;

    if (state.isOrb) {
      const x = e.clientX - state.dragOffsetX;
      const y = e.clientY - state.dragOffsetY;
      els.card.style.left = `${x}px`;
      els.card.style.top = `${y}px`;

      if (els.snapZone) {
        if (y < HUD_SNAP_THRESHOLD) els.snapZone.classList.add('active');
        else els.snapZone.classList.remove('active');
      }
    } else if (state.isHud) {
      const deltaY = e.clientY - state.startY;
      if (deltaY > 0) {
        els.card.style.transform = `translateX(-50%) translateY(${deltaY * 0.4}px)`;

        if (els.snapZone) {
          if (deltaY > SWIPE_DOWN_THRESHOLD) els.snapZone.classList.add('active');
          else els.snapZone.classList.remove('active');
        }
      }
    }
  }

  function handleEnd(e) {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }

    if (state.isDragging) {
      state.isDragging = false;

      try {
        els.card?.releasePointerCapture?.(state.pointerId);
      } catch (err) {}

      if (els.card) els.card.style.transition = '';
      if (els.snapZone) els.snapZone.classList.remove('active');

      if (state.isOrb) {
        const rect = els.card.getBoundingClientRect();
        if (rect.top < HUD_SNAP_THRESHOLD) {
          window.setMode('hud');
        } else {
          saveUIState();
        }
      } else if (state.isHud) {
        const deltaY = e.clientY - state.startY;
        if (deltaY > SWIPE_DOWN_THRESHOLD) {
          const x = e.clientX - 34;
          const y = e.clientY - 10;
          els.card.style.left = `${x}px`;
          els.card.style.top = `${y}px`;
          window.setMode('orb');
        } else {
          els.card.style.transform = 'translateX(-50%) translateY(0)';
        }
      }
    } else {
      if (!state.isOrb && !state.isHud && els.header && els.header.contains(e.target)) {
        toggleCardState();
      }
    }

    state.pointerId = null;
  }

  // --- INIT BINDINGS ---
  if (els.card) {
    els.card.addEventListener('pointerdown', handleStart, { passive: false });
  }
  window.addEventListener('pointermove', handleMove, { passive: false });
  window.addEventListener('pointerup', handleEnd, { passive: false });

  if (els.avatarTgt) {
    els.avatarTgt.addEventListener('click', () => {
      if (!state.isOrb && !state.isHud) openManager();
    });
  }

  if (els.orbMenuTrigger) {
    els.orbMenuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      window.setMode('card');
      toggleSection('systemCard', true);
    });
  }

  if (els.hudMenuBtn) {
    els.hudMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.setMode('card');
      toggleSection('systemCard', true);
    });
  }

  if (els.header) {
    els.header.addEventListener('click', (e) => {
      if (state.isHud && !state.isDragging && !e.target.closest('.hud-menu-btn')) {
        window.setMode('card');
        toggleSection('systemCard', true);
      }
    });
  }

  if (els.card) {
    els.card.addEventListener('contextmenu', (e) => {
      if (state.isOrb || state.isHud) {
        e.preventDefault();
        window.setMode('card');
      }
    });
  }

  if (els.input) {
    els.input.addEventListener('input', (e) => {
      STATE.user = e.target.value;
      localStorage.setItem('di_userName', STATE.user);
      userName = STATE.user;
      updateInterface(STATE.user);
      void saveData();
    });
  }

  if (els.copyActBtn) {
    els.copyActBtn.addEventListener('click', async () => {
      try {
        const txt = els.actPre ? els.actPre.innerText : '';
        await navigator.clipboard.writeText(txt);
        showToaster('Ativação copiada', 'success');
      } catch (e) {
        showToaster('Erro ao copiar ativação', 'error');
      }
    });
  }

  if (els.saveSystemBtn) {
    els.saveSystemBtn.addEventListener('click', async () => {
      infodoseName = byId('infodoseNameInput') ? byId('infodoseNameInput').value.trim() : infodoseName;
      const newKey = byId('apiKeyInput') ? byId('apiKeyInput').value.trim() : '';
      const newModel = byId('modelSelect') ? byId('modelSelect').value.trim() : modelName;

      if (newKey) {
        apiKey = newKey;
        localStorage.setItem('di_apiKey', apiKey);

        const active = STATE.keys.find((k) => k.active);
        if (active) {
          active.token = newKey;
          await saveData();
        }
      }

      modelName = newModel || modelName;
      localStorage.setItem('di_modelName', modelName);
      localStorage.setItem('di_infodoseName', infodoseName);

      toggleSection('systemCard', false);
      showToaster('Configurações salvas (di_ synced)', 'success');
    });
  }

  // --- INIT ---
  async function init() {
    if (els.card) els.card.classList.add('active');
    if (els.avatarTgt) els.avatarTgt.classList.add('shown');

    await loadData();

    const saved = readUIState();
    const shouldShowPreview = !localStorage.getItem(FIRST_PREVIEW_KEY) && saved.mode === 'card';

    if (shouldShowPreview) {
      forceSmallPreview();
      localStorage.setItem(FIRST_PREVIEW_KEY, '1');

      setTimeout(() => {
        restoreSavedMode(saved.mode, saved.left, saved.top);
      }, FIRST_PREVIEW_DURATION);
    } else {
      restoreSavedMode(saved.mode, saved.left, saved.top);
    }

    if (els.clock) {
      els.clock.innerText = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      setInterval(() => {
        els.clock.innerText = new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // expose helpers if you need them outside
  window.__fusionCore = {
    saveUIState,
    loadUIState,
    saveData,
    loadData,
    renderKeysList,
    openManager,
    toggleSection,
    updateInterface
  };
})();