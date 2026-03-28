/* ═══════════════════════════════════════════════════════════
   0x03 · EXPANDIR · V · D7 (versão unificada)
   ═══════════════════════════════════════════════════════════
   Integra o módulo de anel de progresso (639Hz) com o sistema
   de barras, módulos e edição. Agora o long-press (4s) abre o
   mesmo painel e exibe anel de progresso em todos os botões.
   ═══════════════════════════════════════════════════════════ */
(function() {
    // ===================== CONSTANTES E CONFIGURAÇÕES =====================
    const LP_MS = 4000;                // tempo para long-press (4s)
    const DASH_OFFSET = 119.38;        // 2π × 19 (r=19)
    const VERSION = 1;
    const DB_NAME = 'FusionDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'state';

    // ===================== ESTADO GLOBAL =====================
    const STATE = {
        v: VERSION,
        keys: [],
        user: 'Convidado',
        activeBarId: 'main',
        symbolBars: {},
        modules: {},
        htmlContents: {},
        isEncrypted: false,
    };

    let SESSION_PASSWORD = null;
    let db = null;
    let saveTimer = null;
    let pressTimer = null;          // timer para long-press
    let pressRingRAF = null;        // requestAnimationFrame para anel
    let pressStartTime = null;
    let currentEditingBtn = null;
    let currentEditingBarId = null;

    // ===================== ELEMENTOS DOM =====================
    let panelBack, panelInput, panelTitle, panelSaveBtn, panelCloseBtn;
    let frameEl;

    // ===================== CRIPTOGRAFIA (simplificada) =====================
    const CRYPTO = {
        async encrypt(data, password) {
            const encoded = new TextEncoder().encode(JSON.stringify(data));
            const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
            const aesKey = await crypto.subtle.importKey('raw', derived, { name: 'AES-GCM' }, false, ['encrypt']);
            const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);
            return { salt: Array.from(salt), iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
        },
        async decrypt(encryptedObj, password) {
            const { salt, iv, data } = encryptedObj;
            const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
            const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
            const aesKey = await crypto.subtle.importKey('raw', derived, { name: 'AES-GCM' }, false, ['decrypt']);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, aesKey, new Uint8Array(data));
            return JSON.parse(new TextDecoder().decode(decrypted));
        }
    };

    // ===================== PERSISTÊNCIA (IndexedDB) =====================
    async function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = () => resolve(request.result);
        });
    }

    async function loadData() {
        try {
            if (!db) db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const saved = await new Promise(resolve => {
                const get = store.get('state');
                get.onsuccess = () => resolve(get.result);
            });
            if (saved) {
                Object.assign(STATE, saved);
                if (STATE.symbolBars && typeof STATE.symbolBars === 'object') {
                    // garantir que cada barra tenha o campo id
                    for (const [id, bar] of Object.entries(STATE.symbolBars)) {
                        if (!bar.id) bar.id = id;
                    }
                }
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        }
        // garante barra principal
        if (!STATE.symbolBars.main) {
            STATE.symbolBars.main = { id: 'main', buttons: [] };
        }
        if (!STATE.activeBarId) STATE.activeBarId = 'main';
    }

    async function saveData() {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await new Promise(resolve => {
            const put = store.put(STATE, 'state');
            put.onsuccess = () => resolve();
        });
    }

    function saveDataDebounced() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveData(), 500);
    }

    // ===================== RENDERIZAÇÃO DAS BARRAS =====================
    function renderAllBars() {
        const container = document.getElementById('barsContainer');
        if (!container) return;

        // remove todas as barras existentes (exceto possíveis elementos fixos)
        const existingBars = container.querySelectorAll('.symbol-bar:not(#template-bar)');
        existingBars.forEach(bar => bar.remove());

        for (const barId in STATE.symbolBars) {
            const barData = STATE.symbolBars[barId];
            const bar = createBarElement(barData);
            container.appendChild(bar);
        }
        // destaca a barra ativa
        setActiveBar(STATE.activeBarId);
        attachLongPressEvents();   // reconecta eventos após render
    }

    function createBarElement(barData) {
        const bar = document.createElement('div');
        bar.className = 'symbol-bar';
        bar.id = barData.id;
        bar.setAttribute('data-bar-id', barData.id);

        // se for a barra principal, adiciona botões estáticos (home, viv, doc, phi, +) e ORB
        if (barData.id === 'main') {
            // botões estáticos (presets)
            const staticPresets = [
                { id: 'phi', label: 'Φ', url: 'about:blank' },
                { id: 'viv', label: '꩜', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
                { id: 'home', label: '◌', url: 'https://kodux78k.github.io/oiDual-idHome/' },
                { id: 'doc', label: '◘', url: 'https://kodux78k.github.io/info-Doc/index.html' },
            ];
            staticPresets.forEach(p => {
                const btn = createButtonElement(p.id, p.label, p.url);
                bar.appendChild(btn);
            });

            // botão de arquétipo (ORB)
            const archBtn = createButtonElement('arch', '', '', true);
            archBtn.id = 'btn-arch';
            archBtn.title = 'Trocar Arquétipo de Voz';
            archBtn.innerHTML = `<div class="orb-microphone-container"><div class="tts-orb-mini"><div class="orb" id="main-orb"><div class="orb-core"></div></div></div></div>`;
            bar.appendChild(archBtn);

            // botão adicionar (+)
            const addBtn = createButtonElement('add', '+', '');
            addBtn.classList.add('btn-add-custom');
            addBtn.title = 'Adicionar novo botão';
            addBtn.onclick = () => createNewButtonInBar(barData.id, '●', 'about:blank');
            bar.appendChild(addBtn);

            // hud info
            const hudInfo = document.createElement('div');
            hudInfo.id = 'hudStatus';
            hudInfo.className = 'hud-info';
            hudInfo.textContent = 'KOBLLUX · ORB NEXUS';
            bar.appendChild(hudInfo);
        }

        // adiciona os botões personalizados (não estáticos)
        (barData.buttons || []).forEach(btnData => {
            const btn = createButtonElement(btnData.id, btnData.label, btnData.url);
            bar.appendChild(btn);
        });

        return bar;
    }

    function createButtonElement(id, label, url, isArch = false) {
        const btn = document.createElement('button');
        btn.className = 'symbol-button';
        btn.dataset.id = id;
        btn.dataset.url = url;
        btn.textContent = label;
        if (!isArch) {
            // adiciona anel de progresso para long-press (exceto no botão arquétipo)
            btn.style.position = 'relative';
            const ringDiv = document.createElement('div');
            ringDiv.className = 'kblx-ring';
            ringDiv.innerHTML = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/></svg>';
            btn.appendChild(ringDiv);
        }
        return btn;
    }

    // ===================== LÓGICA DE LONG-PRESS COM ANEL =====================
    function ringUpdate(btn, pct) {
        const circle = btn?.querySelector('.kblx-ring circle');
        if (!circle) return;
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = DASH_OFFSET * (1 - Math.min(pct, 1));
    }

    function ringReset(btn) {
        const circle = btn?.querySelector('.kblx-ring circle');
        if (!circle) return;
        circle.style.transition = 'stroke-dashoffset 0.2s ease';
        circle.style.strokeDashoffset = DASH_OFFSET;
    }

    function openEditPanel(btn, barId) {
        if (!panelBack || !panelInput || !panelTitle) return;
        currentEditingBtn = btn;
        currentEditingBarId = barId;

        const label = btn.textContent.trim();
        const url = btn.dataset.url;
        let displayUrl = url;
        if (url.startsWith('module:')) displayUrl = '(módulo)';
        else if (url.startsWith('html:')) displayUrl = '(conteúdo HTML)';
        panelTitle.textContent = `Botão: ${label} (${btn.dataset.id})`;
        panelInput.value = displayUrl;
        panelBack.style.display = 'flex';
        panelInput.focus();
    }

    function closeEditPanel() {
        if (panelBack) panelBack.style.display = 'none';
        currentEditingBtn = null;
        currentEditingBarId = null;
        if (pressTimer) clearTimeout(pressTimer);
        if (pressRingRAF) cancelAnimationFrame(pressRingRAF);
        pressTimer = null;
        pressRingRAF = null;
        pressStartTime = null;
    }

    function attachLongPressEvents() {
        // remover listeners antigos (evita duplicação)
        document.querySelectorAll('.symbol-button[data-id]').forEach(btn => {
            if (btn._handlePointerDown) btn.removeEventListener('pointerdown', btn._handlePointerDown);
            if (btn._handlePointerUp) btn.removeEventListener('pointerup', btn._handlePointerUp);
            if (btn._handlePointerLeave) btn.removeEventListener('pointerleave', btn._handlePointerLeave);
            if (btn._handlePointerCancel) btn.removeEventListener('pointercancel', btn._handlePointerCancel);
        });

        document.querySelectorAll('.symbol-button[data-id]').forEach(btn => {
            // ignora botão de arquétipo e botão de adicionar (que já tem onclick)
            if (btn.id === 'btn-arch' || btn.classList.contains('btn-add-custom')) return;

            const bar = btn.closest('.symbol-bar');
            if (!bar) return;
            const barId = bar.id;

            const onPointerDown = (e) => {
                // não previne default para não bloquear cliques
                if (currentEditingBtn) return;
                pressStartTime = Date.now();
                pressTimer = setTimeout(() => {
                    // long-press alcançado
                    cancelAnimationFrame(pressRingRAF);
                    ringReset(btn);
                    openEditPanel(btn, barId);
                    pressStartTime = null;
                    pressTimer = null;
                }, LP_MS);

                // animação do anel
                function animateRing() {
                    if (pressStartTime === null) return;
                    const elapsed = Date.now() - pressStartTime;
                    const progress = Math.min(elapsed / LP_MS, 1);
                    ringUpdate(btn, progress);
                    if (progress < 1) {
                        pressRingRAF = requestAnimationFrame(animateRing);
                    } else {
                        ringReset(btn);
                        pressRingRAF = null;
                    }
                }
                pressRingRAF = requestAnimationFrame(animateRing);
            };

            const onPointerUpOrLeave = () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
                if (pressRingRAF) {
                    cancelAnimationFrame(pressRingRAF);
                    pressRingRAF = null;
                }
                if (pressStartTime !== null) {
                    ringReset(btn);
                    pressStartTime = null;
                }
            };

            btn._handlePointerDown = onPointerDown;
            btn._handlePointerUp = onPointerUpOrLeave;
            btn._handlePointerLeave = onPointerUpOrLeave;
            btn._handlePointerCancel = onPointerUpOrLeave;

            btn.addEventListener('pointerdown', onPointerDown, { passive: true });
            btn.addEventListener('pointerup', onPointerUpOrLeave, { passive: true });
            btn.addEventListener('pointerleave', onPointerUpOrLeave, { passive: true });
            btn.addEventListener('pointercancel', onPointerUpOrLeave, { passive: true });
        });
    }

    // ===================== MANIPULAÇÃO DE BOTÕES E BARRAS =====================
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
                STATE.modules[buttonId] = {
                    name: newLabel,
                    html: moduleContent,
                    js: '',
                    css: '',
                    version: 1,
                };
                btn.url = `module:${buttonId}`;
                delete STATE.htmlContents[buttonId];
            } else if (htmlContent) {
                STATE.htmlContents[buttonId] = htmlContent;
                btn.url = `html:${buttonId}`;
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

    function setActiveBar(barId) {
        STATE.activeBarId = barId;
        saveDataDebounced();
        document.querySelectorAll('.symbol-bar').forEach(bar => {
            bar.style.outline = bar.id === barId ? '2px solid var(--neon-cyan)' : 'none';
            bar.style.boxShadow = bar.id === barId ? '0 0 12px var(--neon-cyan)' : '';
        });
    }

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

    // ===================== PAINEL DE EDIÇÃO (kblx-back) =====================
    function initEditPanel() {
        panelBack = document.getElementById('kblx-back');
        if (!panelBack) return;
        panelInput = document.getElementById('kblx-inp');
        panelTitle = document.getElementById('kblx-ttl');
        panelSaveBtn = document.getElementById('kblx-btn-save');
        panelCloseBtn = document.getElementById('kblx-btn-close');

        if (!panelInput || !panelTitle || !panelSaveBtn || !panelCloseBtn) return;

        // salvar
        panelSaveBtn.onclick = () => {
            if (!currentEditingBtn || !currentEditingBarId) { closeEditPanel(); return; }
            const newUrl = panelInput.value.trim();
            const newLabel = currentEditingBtn.textContent; // mantém o mesmo label (ou poderia ser editável)
            updateButtonInBar(currentEditingBarId, currentEditingBtn.dataset.id, newUrl, newLabel);
            closeEditPanel();
        };
        panelCloseBtn.onclick = closeEditPanel;
        panelBack.addEventListener('click', e => { if (e.target === panelBack) closeEditPanel(); });

        // botão remover
        let deleteBtn = document.getElementById('kblx-btn-delete');
        if (!deleteBtn) {
            deleteBtn = document.createElement('button');
            deleteBtn.id = 'kblx-btn-delete';
            deleteBtn.textContent = '🗑 Remover Botão';
            deleteBtn.className = 'kblx-btn';
            deleteBtn.style.background = '#ff3366';
            deleteBtn.style.color = '#fff';
            const row = panelBack.querySelector('.kblx-row');
            if (row) row.appendChild(deleteBtn);
            else panelBack.appendChild(deleteBtn);
        }
        deleteBtn.onclick = () => {
            if (!currentEditingBtn || !currentEditingBarId) return;
            deleteButtonFromBar(currentEditingBarId, currentEditingBtn.dataset.id);
            closeEditPanel();
        };

        // upload de arquivo HTML
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
            const container = panelBack.querySelector('.p-lbl');
            if (container && container.parentNode) container.parentNode.insertBefore(fileInput, container.nextSibling);
            else panelBack.appendChild(fileInput);
        }
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                if (currentEditingBtn && currentEditingBarId) {
                    updateButtonInBar(currentEditingBarId, currentEditingBtn.dataset.id, '', currentEditingBtn.textContent, ev.target.result);
                    closeEditPanel();
                }
            };
            reader.readAsText(file);
            fileInput.value = '';
        };

        // presets
        let presetsDiv = document.getElementById('kblx-presets');
        if (!presetsDiv) {
            presetsDiv = document.createElement('div');
            presetsDiv.id = 'kblx-presets';
            presetsDiv.style.marginTop = '15px';
            presetsDiv.innerHTML = '<div style="font-size:0.8rem;margin-bottom:6px;color:rgba(255,255,255,0.6)">PRESETS INFODOSE</div>';
            const PRESETS = [
                { id: 'home', label: '◌ Home', url: 'https://kodux78k.github.io/oiDual-idHome/' },
                { id: 'viv', label: '꩜ Viv', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
                { id: 'doc', label: '◘ Doc', url: 'https://kodux78k.github.io/info-Doc/index.html' },
                { id: 'phi', label: 'Φ Blank', url: 'about:blank' },
            ];
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
                        closeEditPanel();
                    } else {
                        createNewButtonInBar(STATE.activeBarId, p.label, p.url);
                        closeEditPanel();
                    }
                };
                presetsDiv.appendChild(btn);
            });
            const fileInputEl = document.getElementById('kblx-file-upload');
            if (fileInputEl && fileInputEl.parentNode) fileInputEl.parentNode.insertBefore(presetsDiv, fileInputEl.nextSibling);
            else panelBack.appendChild(presetsDiv);
        }

        // botão duplicar barra
        let dupBtn = document.getElementById('kblx-btn-dup');
        if (!dupBtn) {
            dupBtn = document.createElement('button');
            dupBtn.id = 'kblx-btn-dup';
            dupBtn.textContent = '⧉ Duplicar Barra';
            dupBtn.className = 'kblx-btn';
            const row = panelBack.querySelector('.kblx-row');
            if (row) row.appendChild(dupBtn);
            else panelBack.appendChild(dupBtn);
        }
        dupBtn.onclick = () => { duplicateBar(STATE.activeBarId); closeEditPanel(); };

        // botão nova barra
        let newBarBtn = document.getElementById('kblx-btn-newbar');
        if (!newBarBtn) {
            newBarBtn = document.createElement('button');
            newBarBtn.id = 'kblx-btn-newbar';
            newBarBtn.textContent = '➕ Nova Barra';
            newBarBtn.className = 'kblx-btn';
            newBarBtn.style.background = 'linear-gradient(135deg,#00f2ff,#0066ff)';
            newBarBtn.style.color = '#000';
            newBarBtn.style.fontWeight = '700';
            const row = panelBack.querySelector('.kblx-row');
            if (row) row.appendChild(newBarBtn);
            else panelBack.appendChild(newBarBtn);
        }
        newBarBtn.onclick = () => { createNewBar(); closeEditPanel(); };

        // seletor de barras
        let selectorDiv = document.getElementById('kblx-bar-selector');
        if (!selectorDiv) {
            selectorDiv = document.createElement('div');
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
            panelBack.appendChild(selectorDiv);
            window.updateBarSelect();
        }
    }

    // ===================== CLIQUE DOS BOTÕES (IFRAME/MÓDULOS) =====================
    function setupButtonClicks() {
        document.addEventListener('click', async e => {
            const btn = e.target.closest('.symbol-button[data-url]');
            if (!btn) return;
            // ignora long-press (se for um clique curto, processa)
            if (pressTimer) return; // ainda em long-press, não é clique

            let url = btn.dataset.url;
            if (!url) return;

            if (url.startsWith('module:')) {
                const moduleId = url.substring(7);
                const mod = STATE.modules[moduleId];
                if (mod) {
                    const htmlContent = mod.html;
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const blobUrl = URL.createObjectURL(blob);
                    if (frameEl) {
                        frameEl.src = blobUrl;
                        frameEl.onload = () => URL.revokeObjectURL(blobUrl);
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
                    if (frameEl) {
                        frameEl.src = blobUrl;
                        frameEl.onload = () => URL.revokeObjectURL(blobUrl);
                    } else {
                        window.open(blobUrl, '_blank');
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    }
                    return;
                }
            }
            if (frameEl) {
                frameEl.src = url;
                showToaster('Carregando página...', 'success');
            } else {
                window.open(url, '_blank');
            }
        });
    }

    // ===================== ARQUÉTIPOS (ORB) =====================
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

    function setupArchButton() {
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
    }

    // ===================== IDLE DOCK =====================
    function setupIdleDock() {
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
    }

    // ===================== EXPORT / IMPORT =====================
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

    // ===================== AUXILIARES (KARD) =====================
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

    function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

    function showToaster(txt, type = 'default') {
        const t = document.createElement('div');
        t.className = `toaster ${type}`;
        t.innerText = txt;
        const wrap = document.getElementById('toasterWrap');
        if (wrap) wrap.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
    }

    // ===================== INICIALIZAÇÃO =====================
    async function init() {
        await openDB();
        await loadData();

        // garante que a barra principal exista
        if (Object.keys(STATE.symbolBars).length === 0) {
            STATE.symbolBars.main = { id: 'main', buttons: [] };
            STATE.activeBarId = 'main';
            await saveData();
        }

        // cria container para as barras se não existir
        let barsContainer = document.getElementById('barsContainer');
        if (!barsContainer) {
            barsContainer = document.createElement('div');
            barsContainer.id = 'barsContainer';
            document.body.appendChild(barsContainer);
        }

        // referencia iframe
        frameEl = document.getElementById('frame');

        renderAllBars();
        setActiveBar(STATE.activeBarId);
        initEditPanel();
        setupButtonClicks();
        setupArchButton();
        setupIdleDock();

        // atualiza relógio
        setInterval(() => {
            const clock = document.getElementById('clockTime');
            if (clock) clock.innerText = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }, 1000);

        // expõe API global
        window.Fusion = {
            STATE,
            setActiveBar,
            createNewButtonInBar,
            deleteButtonFromBar,
            updateButtonInBar,
            duplicateBar,
            createNewBar,
            exportConfiguration,
            importConfiguration,
            saveData: saveDataDebounced,
            setVoiceArch,
        };
    }

    // inicia quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
