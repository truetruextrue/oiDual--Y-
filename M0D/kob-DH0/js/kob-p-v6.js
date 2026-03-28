(function() {
  'use strict';

  // ---------------------- 0. CONFIGURAÇÕES ----------------------
  const DB_NAME = 'fusion_os';
  const DB_VERSION = 1;
  const STORE_NAME = 'state';
  const ENCRYPTED_KEY = 'encrypted_state';
  const UI_STATE_KEY = 'ui_state';

  // ---------------------- 1. INDEXEDDB WRAPPER ----------------------
  class IDBWrapper {
    constructor(dbName, version, storeName) {
      this.dbName = dbName;
      this.version = version;
      this.storeName = storeName;
      this.db = null;
    }

    async open() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
      });
    }

    async get(key) {
      if (!this.db) await this.open();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async set(key, value) {
      if (!this.db) await this.open();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    async delete(key) {
      if (!this.db) await this.open();
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  const db = new IDBWrapper(DB_NAME, DB_VERSION, STORE_NAME);

  // ---------------------- 2. CRIPTOGRAFIA (AES-GCM) ----------------------
  const CRYPTO = {
    algo: { name: 'AES-GCM', length: 256 },
    pbkdf2: { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000 },
    async getKey(password, salt) {
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
      return window.crypto.subtle.deriveKey({ ...this.pbkdf2, salt }, keyMaterial, this.algo, false, ['encrypt', 'decrypt']);
    },
    async encrypt(data, password) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await this.getKey(password, salt);
      const encoded = new TextEncoder().encode(JSON.stringify(data));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
      return { salt: Array.from(salt), iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
    },
    async decrypt(bundle, password) {
      try {
        const salt = new Uint8Array(bundle.salt);
        const iv = new Uint8Array(bundle.iv);
        const data = new Uint8Array(bundle.data);
        const key = await this.getKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return JSON.parse(new TextDecoder().decode(decrypted));
      } catch (e) {
        throw new Error('Senha incorreta ou dados corrompidos');
      }
    },
  };

  // ---------------------- 3. ESTADO GLOBAL ----------------------
  const STATE = {
    v: 2,
    keys: [],           // { id, name, token, active }
    user: 'Convidado',
    symbolBars: {},     // { barId: { id, buttons: [...] } }
    activeBarId: 'main',
    modules: {},        // { moduleId: { name, html, js, css, version } }
    htmlContents: {},   // fallback para uploads simples
  };

  let SESSION_PASSWORD = null;
  let saveTimeout = null;

  // ---------------------- 4. PERSISTÊNCIA COM INDEXEDDB (DEBOUNCED) ----------------------
  async function saveData() {
    const payload = {
      v: STATE.v,
      keys: STATE.keys,
      user: STATE.user,
      symbolBars: STATE.symbolBars,
      activeBarId: STATE.activeBarId,
      modules: STATE.modules,
      htmlContents: STATE.htmlContents,
    };

    if (SESSION_PASSWORD) {
      try {
        const encrypted = await CRYPTO.encrypt(payload, SESSION_PASSWORD);
        await db.set(ENCRYPTED_KEY, encrypted);
        await db.set('isEncrypted', true);
      } catch (e) {
        console.error('Encryption error', e);
        showToaster('Erro ao salvar dados criptografados', 'error');
        return;
      }
    } else {
      await db.set(ENCRYPTED_KEY, payload);
      await db.set('isEncrypted', false);
    }
    updateSecurityUI();
  }

  function saveDataDebounced() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveData, 300);
  }

  async function loadData() {
    const isEncrypted = await db.get('isEncrypted');
    const raw = await db.get(ENCRYPTED_KEY);
    if (!raw) return;

    if (isEncrypted) {
      // Aguarda desbloqueio do cofre (modal)
      STATE.isEncrypted = true;
      updateSecurityUI();
      return;
    }

    const data = raw;
    if (!data.v || data.v < 2) {
      data.symbolBars = data.symbolBars || {};
      data.activeBarId = data.activeBarId || 'main';
      data.modules = data.modules || {};
      data.htmlContents = data.htmlContents || {};
      data.v = 2;
    }
    STATE.keys = data.keys || [];
    STATE.user = data.user || 'Convidado';
    STATE.symbolBars = data.symbolBars;
    STATE.activeBarId = data.activeBarId;
    STATE.modules = data.modules || {};
    STATE.htmlContents = data.htmlContents || {};

    const active = STATE.keys.find(k => k.active);
    if (active && active.token) {
      localStorage.setItem('di_apiKey', active.token);
    }
    if (STATE.user !== 'Convidado') {
      localStorage.setItem('di_userName', STATE.user);
      const input = document.getElementById('inputUser');
      if (input) input.value = STATE.user;
    }

    updateInterface(STATE.user);
    renderKeysList();
    renderAllBars();
    setActiveBar(STATE.activeBarId);
  }

  // ---------------------- 5. RENDERIZAÇÃO COM DIFFING ----------------------
  function syncBarButtons(barElement, newButtons) {
    const existingWraps = barElement.querySelectorAll('.symbol-wrap.dynamic');
    const existingMap = new Map();
    existingWraps.forEach(wrap => {
      const btn = wrap.querySelector('.symbol-button');
      if (btn && btn.dataset.id) existingMap.set(btn.dataset.id, wrap);
    });

    const newMap = new Map();
    newButtons.forEach(btnData => newMap.set(btnData.id, btnData));

    // Remove os que não existem mais
    for (const [id, wrap] of existingMap) {
      if (!newMap.has(id)) wrap.remove();
    }

    // Adiciona ou atualiza os existentes
    const hudInfo = barElement.querySelector('.hud-info');
    for (const btnData of newButtons) {
      const existingWrap = existingMap.get(btnData.id);
      if (existingWrap) {
        const btn = existingWrap.querySelector('.symbol-button');
        if (btn.innerHTML !== btnData.label) btn.innerHTML = btnData.label;
        let newUrl = btnData.url || '';
        if (STATE.modules[btnData.id]) newUrl = `module:${btnData.id}`;
        else if (STATE.htmlContents[btnData.id]) newUrl = `html:${btnData.id}`;
        if (btn.dataset.url !== newUrl) btn.dataset.url = newUrl;
      } else {
        const wrap = document.createElement('div');
        wrap.className = 'symbol-wrap dynamic';
        const btn = document.createElement('button');
        btn.className = 'symbol-button';
        btn.dataset.id = btnData.id;
        let url = btnData.url || '';
        if (STATE.modules[btnData.id]) url = `module:${btnData.id}`;
        else if (STATE.htmlContents[btnData.id]) url = `html:${btnData.id}`;
        btn.dataset.url = url;
        btn.innerHTML = btnData.label;
        wrap.appendChild(btn);
        if (hudInfo) barElement.insertBefore(wrap, hudInfo);
        else barElement.appendChild(wrap);
      }
    }
  }

  function renderAllBars() {
    for (const [barId, barData] of Object.entries(STATE.symbolBars)) {
      let barElem = document.getElementById(barId);
      if (!barElem) {
        barElem = createBarElement(barId, barData.buttons);
      }
      syncBarButtons(barElem, barData.buttons);
    }
    attachLongPressEvents();
    if (window.updateBarSelect) window.updateBarSelect();
  }

  function createBarElement(barId, buttons = []) {
    const existing = document.getElementById(barId);
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.id = barId;
    bar.className = 'symbol-bar';
    bar.setAttribute('data-sb-id', barId);

    // Botão toggle
    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'symbol-wrap static';
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'symbol-button main-toggle';
    toggleBtn.textContent = '≡';
    toggleBtn.title = 'Menu / Iniciar';
    toggleWrap.appendChild(toggleBtn);
    bar.appendChild(toggleWrap);

    // Controles de navegação
    const navBtns = [
      { id: 'btn-prev', text: '◀', title: 'Voltar Bloco' },
      { id: 'btn-play', text: '▶', title: 'Play/Pause' },
      { id: 'btn-next', text: '▶▶', title: 'Próximo Bloco' },
    ];
    navBtns.forEach(nav => {
      const wrap = document.createElement('div');
      wrap.className = 'symbol-wrap static';
      const btn = document.createElement('button');
      btn.id = nav.id;
      btn.className = 'symbol-button';
      btn.textContent = nav.text;
      btn.title = nav.title;
      wrap.appendChild(btn);
      bar.appendChild(wrap);
    });

    // Botão de arquétipo (ORB)
    const archWrap = document.createElement('div');
    archWrap.className = 'symbol-wrap static';
    const archBtn = document.createElement('button');
    archBtn.id = 'btn-arch';
    archBtn.className = 'symbol-button';
    archBtn.title = 'Trocar Arquétipo de Voz';
    archBtn.innerHTML = `<div class="orb-microphone-container"><div class="tts-orb-mini"><div class="orb" id="main-orb"><div class="orb-core"></div></div></div></div>`;
    archWrap.appendChild(archBtn);
    bar.appendChild(archWrap);

    // Atalhos estáticos
    const staticPresets = [
      { id: 'phi', label: 'Φ', url: 'about:blank' },
      { id: 'viv', label: '꩜', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
      { id: 'home', label: '◌', url: 'https://kodux78k.github.io/oiDual-idHome/' },
      { id: 'doc', label: '◘', url: 'https://kodux78k.github.io/info-Doc/index.html' },
    ];
    staticPresets.forEach(p => {
      const wrap = document.createElement('div');
      wrap.className = 'symbol-wrap static';
      const btn = document.createElement('button');
      btn.className = 'symbol-button';
      btn.dataset.id = p.id;
      btn.dataset.url = p.url;
      btn.innerHTML = p.label;
      wrap.appendChild(btn);
      bar.appendChild(wrap);
    });

    // Botão de adicionar (+)
    const addWrap = document.createElement('div');
    addWrap.className = 'symbol-wrap static btn-add-wrap';
    const addBtn = document.createElement('button');
    addBtn.className = 'symbol-button btn-add-custom';
    addBtn.textContent = '+';
    addBtn.title = 'Adicionar novo botão';
    addBtn.onclick = () => createNewButtonInBar(barId, '●', 'about:blank');
    addWrap.appendChild(addBtn);
    bar.appendChild(addWrap);

    // Hud info
    const hudInfo = document.createElement('div');
    hudInfo.id = 'hudStatus';
    hudInfo.className = 'hud-info';
    hudInfo.textContent = 'KOBLLUX · ORB NEXUS';
    bar.appendChild(hudInfo);

    document.body.appendChild(bar);
    return bar;
  }

  // ---------------------- 6. MANIPULAÇÃO DE BOTÕES E BARRAS ----------------------
  function getActiveBarData() {
    if (!STATE.symbolBars[STATE.activeBarId]) {
      STATE.symbolBars[STATE.activeBarId] = { id: STATE.activeBarId, buttons: [] };
    }
    return STATE.symbolBars[STATE.activeBarId];
  }

  function createNewButtonInBar(barId, label = '●', url = 'about:blank') {
    const barData = STATE.symbolBars[barId] || { id: barId, buttons: [] };
    const newId = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    barData.buttons.push({ id: newId, label, url });
    STATE.symbolBars[barId] = barData;
    saveDataDebounced();
    renderAllBars();
  }

  function deleteButtonFromBar(barId, buttonId) {
    const barData = STATE.symbolBars[barId];
    if (!barData) return;
    barData.buttons = barData.buttons.filter(b => b.id !== buttonId);
    delete STATE.modules[buttonId];
    delete STATE.htmlContents[buttonId];
    STATE.symbolBars[barId] = barData;
    saveDataDebounced();
    renderAllBars();
  }

  function updateButtonInBar(barId, buttonId, newUrl, newLabel, htmlContent = null, moduleContent = null) {
    const barData = STATE.symbolBars[barId];
    if (!barData) return;
    const btn = barData.buttons.find(b => b.id === buttonId);
    if (btn) {
      btn.label = newLabel;
      if (moduleContent) {
        // cria módulo
        STATE.modules[buttonId] = {
          name: newLabel,
          html: moduleContent,
          js: '',
          css: '',
          version: 1,
        };
        btn.url = '';
        delete STATE.htmlContents[buttonId];
      } else if (htmlContent) {
        STATE.htmlContents[buttonId] = htmlContent;
        btn.url = '';
        delete STATE.modules[buttonId];
      } else {
        btn.url = newUrl;
        delete STATE.modules[buttonId];
        delete STATE.htmlContents[buttonId];
      }
      saveDataDebounced();
      renderAllBars();
    }
  }

  // Nova barra (criação direta)
  function createNewBar() {
    const newId = `bar_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    STATE.symbolBars[newId] = { id: newId, buttons: [] };
    saveDataDebounced();
    renderAllBars();
    setActiveBar(newId);
    if (window.updateBarSelect) window.updateBarSelect();
    showToaster('Nova barra criada 🚀', 'success');
  }

  function duplicateBar(barId = STATE.activeBarId) {
    const source = STATE.symbolBars[barId];
    if (!source) return;
    const newId = `${barId}_copy_${Date.now()}`;
    const newButtons = source.buttons.map(btn => {
      const newIdBtn = `btn_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      if (STATE.modules[btn.id]) {
        STATE.modules[newIdBtn] = { ...STATE.modules[btn.id] };
      }
      if (STATE.htmlContents[btn.id]) {
        STATE.htmlContents[newIdBtn] = STATE.htmlContents[btn.id];
      }
      return { ...btn, id: newIdBtn };
    });
    STATE.symbolBars[newId] = { id: newId, buttons: newButtons };
    saveDataDebounced();
    renderAllBars();
    setActiveBar(newId);
  }

  function setActiveBar(barId) {
    STATE.activeBarId = barId;
    saveDataDebounced();
    document.querySelectorAll('.symbol-bar').forEach(bar => {
      bar.style.outline = bar.id === barId ? '2px solid var(--neon-cyan)' : 'none';
      bar.style.boxShadow = bar.id === barId ? '0 0 12px var(--neon-cyan)' : '';
    });
  }

  // ---------------------- 7. EDIÇÃO POR LONG-PRESS (4s) ----------------------
  let pressTimer = null;
  let currentEditingBtn = null;
  let currentEditingBarId = null;

  function closeEditor() {
    const panel = document.getElementById('kblx-back');
    if (panel) panel.style.display = 'none';
    currentEditingBtn = null;
    currentEditingBarId = null;
    if (pressTimer) clearTimeout(pressTimer);
  }

  function enterEditMode(btn, barId) {
    const panel = document.getElementById('kblx-back');
    const input = document.getElementById('kblx-inp');
    const title = document.getElementById('kblx-ttl');
    if (!panel || !input || !title) return;

    title.textContent = btn.dataset.id || 'Botão';
    const isModule = btn.dataset.url.startsWith('module:');
    const isHtml = btn.dataset.url.startsWith('html:');
    input.value = isModule ? '(módulo)' : (isHtml ? '(conteúdo HTML)' : (btn.dataset.url || ''));

    currentEditingBtn = btn;
    currentEditingBarId = barId;
    panel.style.display = 'flex';
    input.focus();
  }

  function attachLongPressEvents() {
    document.querySelectorAll('.symbol-button[data-id]').forEach(btn => {
      const bar = btn.closest('.symbol-bar');
      if (!bar) return;
      const barId = bar.id;

      // Remover listeners antigos
      if (btn._handlePointerDown) btn.removeEventListener('pointerdown', btn._handlePointerDown);
      if (btn._handlePointerCancel) {
        btn.removeEventListener('pointerup', btn._handlePointerCancel);
        btn.removeEventListener('pointerleave', btn._handlePointerCancel);
        btn.removeEventListener('pointercancel', btn._handlePointerCancel);
      }

      const handlePointerDown = (e) => {
        if (currentEditingBtn) return;
        pressTimer = setTimeout(() => enterEditMode(btn, barId), 4000);
      };
      const handlePointerCancel = () => {
        if (pressTimer) clearTimeout(pressTimer);
      };

      btn._handlePointerDown = handlePointerDown;
      btn._handlePointerCancel = handlePointerCancel;
      btn.addEventListener('pointerdown', handlePointerDown);
      btn.addEventListener('pointerup', handlePointerCancel);
      btn.addEventListener('pointerleave', handlePointerCancel);
      btn.addEventListener('pointercancel', handlePointerCancel);
    });
  }

  // ---------------------- 8. PAINEL DE EDIÇÃO (#kblx-back) ----------------------
  function initEditorPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel) return;
    const saveBtn = document.getElementById('kblx-btn-save');
    const closeBtn = document.getElementById('kblx-btn-close');
    const inp = document.getElementById('kblx-inp');
    if (!saveBtn || !closeBtn || !inp) return;

    saveBtn.onclick = () => {
      if (!currentEditingBtn || !currentEditingBarId) { closeEditor(); return; }
      const newUrl = inp.value.trim();
      const newLabel = currentEditingBtn.innerHTML;
      updateButtonInBar(currentEditingBarId, currentEditingBtn.dataset.id, newUrl, newLabel);
      closeEditor();
    };
    closeBtn.onclick = () => closeEditor();
    panel.addEventListener('click', e => { if (e.target === panel) closeEditor(); });
  }

  function addDeleteButtonToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-btn-delete')) return;
    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'kblx-btn-delete';
    deleteBtn.textContent = '🗑 Remover Botão';
    deleteBtn.className = 'kblx-btn';
    deleteBtn.style.background = '#ff3366';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.border = 'none';
    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(deleteBtn);
    deleteBtn.onclick = () => {
      if (!currentEditingBtn || !currentEditingBarId) return;
      deleteButtonFromBar(currentEditingBarId, currentEditingBtn.dataset.id);
      closeEditor();
    };
  }

  function addFileUploadToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel) return;
    let fileInput = document.getElementById('kblx-file-upload');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'kblx-file-upload';
      fileInput.accept = '.html';
      fileInput.style.marginTop = '10px';
      fileInput.style.width = '100%';
      fileInput.style.padding = '6px';
      fileInput.style.background = '#1e1e2f';
      fileInput.style.color = '#fff';
      fileInput.style.border = '1px solid #2a2a3a';
      fileInput.style.borderRadius = '6px';
      const container = panel.querySelector('.p-lbl');
      if (container && container.parentNode) container.parentNode.insertBefore(fileInput, container.nextSibling);
      else panel.appendChild(fileInput);
    }
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        if (currentEditingBtn && currentEditingBarId) {
          updateButtonInBar(currentEditingBarId, currentEditingBtn.dataset.id, '', currentEditingBtn.innerHTML, ev.target.result);
          closeEditor();
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    };
  }

  const PRESETS = [
    { id: 'home', label: '◌ Home', url: 'https://kodux78k.github.io/oiDual-idHome/' },
    { id: 'viv', label: '꩜ Viv', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
    { id: 'doc', label: '◘ Doc', url: 'https://kodux78k.github.io/info-Doc/index.html' },
    { id: 'phi', label: 'Φ Blank', url: 'about:blank' },
  ];

  function addPresetSelector() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-presets')) return;
    const presetsDiv = document.createElement('div');
    presetsDiv.id = 'kblx-presets';
    presetsDiv.style.marginTop = '15px';
    presetsDiv.innerHTML = '<div style="font-size:0.8rem;margin-bottom:6px;color:rgba(255,255,255,0.6)">PRESETS INFODOSE</div>';
    PRESETS.forEach(p => {
      const btn = document.createElement('button');
      btn.textContent = p.label;
      btn.className = 'kblx-btn';
      btn.style.margin = '4px';
      btn.style.padding = '6px 12px';
      btn.style.fontSize = '0.8rem';
      btn.onclick = () => {
        if (currentEditingBtn && currentEditingBarId) {
          updateButtonInBar(currentEditingBarId, currentEditingBtn.dataset.id, p.url, p.label);
          closeEditor();
        } else {
          createNewButtonInBar(STATE.activeBarId, p.label, p.url);
          closeEditor();
        }
      };
      presetsDiv.appendChild(btn);
    });
    const fileInput = document.getElementById('kblx-file-upload');
    if (fileInput && fileInput.parentNode) fileInput.parentNode.insertBefore(presetsDiv, fileInput.nextSibling);
    else panel.appendChild(presetsDiv);
  }

  function addDuplicateButtonToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-btn-dup')) return;
    const dupBtn = document.createElement('button');
    dupBtn.id = 'kblx-btn-dup';
    dupBtn.textContent = '⧉ Duplicar Barra';
    dupBtn.className = 'kblx-btn';
    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(dupBtn);
    dupBtn.onclick = () => { duplicateBar(STATE.activeBarId); closeEditor(); };
  }

  // Botão NOVA BARRA (cria barra vazia)
  function addNewBarButtonToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-btn-newbar')) return;
    const btn = document.createElement('button');
    btn.id = 'kblx-btn-newbar';
    btn.textContent = '➕ Nova Barra';
    btn.className = 'kblx-btn';
    btn.style.background = 'linear-gradient(135deg,#00f2ff,#0066ff)';
    btn.style.color = '#000';
    btn.style.fontWeight = '700';
    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(btn);
    else panel.appendChild(btn);
    btn.onclick = () => { createNewBar(); closeEditor(); };
  }

  function addBarSelector() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-bar-selector')) return;
    const selectorDiv = document.createElement('div');
    selectorDiv.id = 'kblx-bar-selector';
    selectorDiv.style.marginTop = '15px';
    selectorDiv.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    selectorDiv.style.paddingTop = '12px';
    const label = document.createElement('div');
    label.textContent = 'BARRA ATIVA:';
    label.style.fontSize = '0.7rem';
    label.style.marginBottom = '6px';
    label.style.color = 'rgba(255,255,255,0.5)';
    selectorDiv.appendChild(label);
    const select = document.createElement('select');
    select.id = 'barSelect';
    select.style.width = '100%';
    select.style.padding = '6px';
    select.style.background = '#1e1e2f';
    select.style.color = '#fff';
    select.style.border = '1px solid #2a2a3a';
    select.style.borderRadius = '6px';
    window.updateBarSelect = () => {
      const currentBars = Object.keys(STATE.symbolBars);
      select.innerHTML = '';
      currentBars.forEach(barId => {
        const option = document.createElement('option');
        option.value = barId;
        option.textContent = barId === STATE.activeBarId ? `★ ${barId}` : barId;
        if (barId === STATE.activeBarId) option.selected = true;
        select.appendChild(option);
      });
    };
    select.onchange = () => { setActiveBar(select.value); window.updateBarSelect(); };
    selectorDiv.appendChild(select);
    panel.appendChild(selectorDiv);
    window.updateBarSelect();
  }

  // ---------------------- 9. CLIQUE DOS BOTÕES (IFRAME + MÓDULOS) ----------------------
  function setupButtonClicks() {
    document.addEventListener('click', async e => {
      const btn = e.target.closest('.symbol-button[data-url]');
      if (!btn) return;
      let url = btn.dataset.url;
      if (!url) return;

      if (url.startsWith('module:')) {
        const moduleId = url.substring(7);
        const mod = STATE.modules[moduleId];
        if (mod) {
          const htmlContent = mod.html;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          const frame = document.getElementById('frame');
          if (frame) {
            frame.src = blobUrl;
            frame.onload = () => URL.revokeObjectURL(blobUrl);
          } else {
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          }
          showToaster(`Módulo: ${mod.name}`, 'success');
          return;
        }
      }
      if (url.startsWith('html:')) {
        const buttonId = url.substring(5);
        const htmlContent = STATE.htmlContents[buttonId];
        if (htmlContent) {
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          const frame = document.getElementById('frame');
          if (frame) {
            frame.src = blobUrl;
            frame.onload = () => URL.revokeObjectURL(blobUrl);
          } else {
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          }
          return;
        }
      }
      const frame = document.getElementById('frame');
      if (frame) {
        frame.src = url;
        showToaster('Carregando módulo...', 'success');
      } else {
        window.open(url, '_blank');
      }
    });
  }

  // ---------------------- 10. SINCRO COM MODO DO KARD (ORB/HUD/CARD) ----------------------
  let currentMode = 'card';
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.symbol-bar').forEach(bar => {
      if (mode === 'orb') {
        bar.classList.add('floating');
        bar.classList.remove('attached-top');
      } else if (mode === 'hud') {
        bar.classList.add('attached-top');
        bar.classList.remove('floating');
      } else {
        bar.classList.remove('floating', 'attached-top');
      }
    });
    if (window.originalSetMode) window.originalSetMode(mode);
  }

  // ---------------------- 11. FUNÇÕES AUXILIARES (KARD) ----------------------
  function updateInterface(name) {
    const safe = name || 'Convidado';
    const lblName = document.getElementById('lblName');
    if (lblName) lblName.innerText = safe;
    const input = document.getElementById('inputUser');
    if (input) input.value = safe;
    const activeKey = STATE.keys.find(k => k.active);
    const smallIdent = document.getElementById('smallIdent');
    if (smallIdent) smallIdent.innerText = activeKey ? activeKey.name : '--';
    const actBadge = document.getElementById('actBadge');
    if (actBadge) actBadge.innerText = activeKey ? `key:${activeKey.name}` : 'v:--';
    const hashStr = s => { let h = 0xdeadbeef; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761); return (h ^ h >>> 16) >>> 0; };
    const line = `+${'-'.repeat(safe.length + 4)}+`;
    const actPre = document.getElementById('actPre');
    if (actPre) actPre.innerText = `${line}\n| ${safe.toUpperCase()} |\n${line}\nID: ${hashStr(safe).toString(16)}`;
  }

  function renderKeysList() {
    const keyList = document.getElementById('keyList');
    if (!keyList) return;
    keyList.innerHTML = '';
    if (STATE.keys.length === 0) {
      keyList.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Nenhuma chave armazenada.</div>';
      return;
    }
    STATE.keys.forEach(k => {
      const div = document.createElement('div');
      div.className = `key-item ${k.active ? 'active-item' : ''}`;
      div.innerHTML = `
        <div class="meta" style="flex:1"><div style="font-weight:700;font-size:0.9rem">${escapeHtml(k.name)}</div></div>
        <div class="actions">
          ${!k.active ? `<button class="small-btn" onclick="window.setActiveKey('${k.id}')">ATIVAR</button>` : `<span style="font-size:0.7rem;font-weight:700;color:var(--neon-cyan);margin-right:10px">ATIVA</span>`}
          <button class="small-btn danger" onclick="window.removeKey('${k.id}')"><i data-lucide="trash-2" style="width:14px"></i></button>
        </div>`;
      keyList.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
  }

  function updateSecurityUI() {
    const vaultStatus = document.getElementById('vaultStatusText');
    const lockBtn = document.getElementById('lockVaultBtn');
    if (!vaultStatus) return;
    if (SESSION_PASSWORD) {
      vaultStatus.innerText = 'Cofre Protegido (Destrancado)';
      if (lockBtn) lockBtn.innerText = 'TRANCAR';
    } else if (STATE.isEncrypted) {
      vaultStatus.innerText = 'Cofre Trancado';
      if (lockBtn) lockBtn.innerText = 'REDEFINIR';
    } else {
      vaultStatus.innerText = 'Cofre Aberto (Sem senha)';
      if (lockBtn) lockBtn.innerText = 'CRIAR SENHA';
    }
  }

  function showToaster(txt, type = 'default') {
    const t = document.createElement('div');
    t.className = `toaster ${type}`;
    t.innerText = txt;
    const wrap = document.getElementById('toasterWrap');
    if (wrap) wrap.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
  }

  function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // ---------------------- 12. ARQUÉTIPOS (ORB) ----------------------
  const ARCHS = ['kobllux','kodux','atlas','nova','vitalis','pulse','artemis','serena','kaos','genus','lumine','solus','rhea','aion','uno','dual','trinity','infodose','horus'];
  let archIndex = ARCHS.indexOf(document.body.dataset.voiceArch || 'kobllux');
  if (archIndex < 0) archIndex = 0;
  function setVoiceArch(name) {
    if (!name) return;
    document.body.dataset.voiceArch = name;
    const neb = document.querySelector('.nebula');
    if (neb) neb.dataset.voiceArch = name;
    const hud = document.getElementById('hudStatus');
    if (hud) hud.textContent = 'KOBLLUX · ' + name.toUpperCase();
    const dock = document.querySelector('.kob-tts-dock, .symbol-bar');
    if (dock) dock.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}], {duration: 420, easing:'ease-out'});
  }
  document.addEventListener('click', e => {
    const orbBtn = e.target.closest('#btn-arch');
    if (orbBtn) {
      archIndex = (archIndex + 1) % ARCHS.length;
      setVoiceArch(ARCHS[archIndex]);
    }
  });
  let archTimer;
  const orbElem = document.getElementById('btn-arch');
  if (orbElem) {
    orbElem.addEventListener('pointerdown', () => {
      archTimer = setTimeout(() => {
        archIndex = (archIndex - 1 + ARCHS.length) % ARCHS.length;
        setVoiceArch(ARCHS[archIndex]);
      }, 450);
    });
    orbElem.addEventListener('pointerup', () => clearTimeout(archTimer));
    orbElem.addEventListener('pointerleave', () => clearTimeout(archTimer));
  }

  // ---------------------- 13. IDLE DOCK ----------------------
  const dock = document.querySelector('.kob-tts-dock') || document.querySelector('.symbol-bar');
  let idleTimer;
  function resetIdle() {
    if (!dock) return;
    dock.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => dock.classList.add('idle'), 1870);
  }
  ['pointerdown','pointermove','touchstart','mousemove','keydown'].forEach(ev => document.addEventListener(ev, resetIdle, {passive:true}));
  resetIdle();

  // ---------------------- 14. EXPORT / IMPORT ----------------------
  async function exportConfiguration(password = null) {
    const exportData = {
      v: STATE.v,
      keys: STATE.keys,
      user: STATE.user,
      symbolBars: STATE.symbolBars,
      modules: STATE.modules,
      htmlContents: STATE.htmlContents,
    };
    let exportString;
    if (password) {
      const encrypted = await CRYPTO.encrypt(exportData, password);
      exportString = JSON.stringify({ encrypted: true, data: encrypted });
    } else {
      exportString = JSON.stringify({ encrypted: false, data: exportData });
    }
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fusion_backup_${new Date().toISOString()}.fusion`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function importConfiguration(file, password = null) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const data = JSON.parse(e.target.result);
          let imported;
          if (data.encrypted) {
            if (!password) throw new Error('Senha necessária para importação criptografada');
            imported = await CRYPTO.decrypt(data.data, password);
          } else {
            imported = data.data;
          }
          STATE.keys = imported.keys || [];
          STATE.user = imported.user || 'Convidado';
          STATE.symbolBars = imported.symbolBars || {};
          STATE.activeBarId = imported.activeBarId || 'main';
          STATE.modules = imported.modules || {};
          STATE.htmlContents = imported.htmlContents || {};
          await saveData();
          renderAllBars();
          updateInterface(STATE.user);
          renderKeysList();
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  // ---------------------- 15. INICIALIZAÇÃO ----------------------
  async function init() {
    await db.open();
    await loadData();

    if (Object.keys(STATE.symbolBars).length === 0) {
      STATE.symbolBars['main'] = {
        id: 'main',
        buttons: [
          { id: 'home', label: '◌ Home', url: 'https://kodux78k.github.io/oiDual-idHome/' },
          { id: 'viv', label: '꩜ Viv', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
          { id: 'doc', label: '◘ Doc', url: 'https://kodux78k.github.io/info-Doc/index.html' },
          { id: 'phi', label: 'Φ Blank', url: 'about:blank' },
        ]
      };
      STATE.activeBarId = 'main';
      await saveData();
    }

    renderAllBars();
    setActiveBar(STATE.activeBarId);
    attachLongPressEvents();
    initEditorPanel();
    addDeleteButtonToPanel();
    addFileUploadToPanel();
    addPresetSelector();
    addDuplicateButtonToPanel();
    addNewBarButtonToPanel();   // <-- botão ➕ Nova Barra
    addBarSelector();
    setupButtonClicks();

    setInterval(() => {
      const clock = document.getElementById('clockTime');
      if (clock) clock.innerText = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }, 1000);
  }

  // ---------------------- 16. API GLOBAL ----------------------
  window.Fusion = {
    STATE,
    setMode,
    duplicateBar,
    createNewButtonInBar,
    deleteButtonFromBar,
    updateButtonInBar,
    setActiveBar,
    saveData: saveDataDebounced,
    exportConfiguration,
    importConfiguration,
    createNewBar,
  };

  // Inicialização
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();