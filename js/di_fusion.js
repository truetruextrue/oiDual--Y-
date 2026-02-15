/* =========================================================
   FUSION CORE (V7-REFAC) — GENUS ∴ ORB SYSTEM
   Integração: di_.state.vault & di_.ui.fusion
   ========================================================= */

(function(di_) {
    "use strict";

    di_.register("fusion", function() {
        
        // 🜄 Pulse: Referências de UI
        const els = {
            card: document.getElementById('mainCard'),
            header: document.getElementById('cardHeader'),
            avatarTgt: document.getElementById('avatarTarget'),
            input: document.getElementById('inputUser'),
            lblHello: document.getElementById('lblHello'),
            lblName: document.getElementById('lblName'),
            clock: document.getElementById('clockTime'),
            smallPreview: document.getElementById('smallPreview'),
            smallMiniAvatar: document.getElementById('smallMiniAvatar'),
            smallText: document.getElementById('smallText'),
            smallIdent: document.getElementById('smallIdent'),
            actCard: document.getElementById('activationCard'),
            actPre: document.getElementById('actPre'),
            actName: document.getElementById('actName'),
            actMiniAvatar: document.getElementById('actMiniAvatar'),
            actBadge: document.getElementById('actBadge'),
            btnModeCard: document.getElementById('btnModeCard'),
            btnModeOrb: document.getElementById('btnModeOrb'),
            btnModeHud: document.getElementById('btnModeHud'),
            orbMenuTrigger: document.getElementById('orbMenuTrigger'),
            hudMenuBtn: document.getElementById('hudMenuBtn'),
            snapZone: document.getElementById('snap-zone'),
            keysModal: document.getElementById('keysModal'),
            keyList: document.getElementById('keyList'),
            keyName: document.getElementById('keyNameInput'),
            keyToken: document.getElementById('keyTokenInput'),
            addKeyBtn: document.getElementById('addKeyBtn'),
            closeKeysBtn: document.getElementById('closeKeysBtn'),
            lockVaultBtn: document.getElementById('lockVaultBtn'),
            vaultStatusText: document.getElementById('vaultStatusText'),
            vaultModal: document.getElementById('vaultModal'),
            vaultPass: document.getElementById('vaultPassInput'),
            vaultUnlock: document.getElementById('vaultUnlockBtn'),
            vaultCancel: document.getElementById('vaultCancelBtn'),
            systemCard: document.getElementById('systemCard'),
            saveSystemBtn: document.getElementById('saveSystemBtn'),
            copyActBtn: document.getElementById('copyActBtn')
        };

        // 🜅 Artemis: Crypto (Internalizado no módulo)
        const CRYPTO = {
            algo: { name: 'AES-GCM', length: 256 },
            pbkdf2: { name: 'PBKDF2', hash: 'SHA-256', iterations: 100000 },
            async getKey(password, salt) {
                const enc = new TextEncoder();
                const keyMaterial = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
                return window.crypto.subtle.deriveKey({ ...this.pbkdf2, salt: salt }, keyMaterial, this.algo, false, ["encrypt", "decrypt"]);
            },
            async encrypt(data, password) {
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const key = await this.getKey(password, salt);
                const encoded = new TextEncoder().encode(JSON.stringify(data));
                const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);
                return JSON.stringify({ s: Array.from(salt), iv: Array.from(iv), d: Array.from(new Uint8Array(encrypted)) });
            },
            async decrypt(bundleStr, password) {
                try {
                    const bundle = JSON.parse(bundleStr);
                    const salt = new Uint8Array(bundle.s);
                    const iv = new Uint8Array(bundle.iv);
                    const data = new Uint8Array(bundle.d);
                    const key = await this.getKey(password, salt);
                    const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
                    return JSON.parse(new TextDecoder().decode(decrypted));
                } catch (e) { throw new Error("Senha incorreta"); }
            }
        };

        // 🜃 Vitalis: Estado Local
        let STATE = {
            keys: [],
            user: di_.state.userName || 'Convidado',
            isEncrypted: false,
            encryptedData: null
        };
        let SESSION_PASSWORD = null;
        const STORAGE_KEY = 'di_fusion_os_data_v2';
        const UI_STATE_KEY = 'di_fusion_os_ui_state';

        // --- LÓGICA DE DADOS ---
        function saveData() {
            const payload = { keys: STATE.keys, user: STATE.user };
            if (SESSION_PASSWORD) {
                CRYPTO.encrypt(payload, SESSION_PASSWORD).then(enc => {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isEncrypted: true, data: enc }));
                    STATE.isEncrypted = true;
                    STATE.encryptedData = enc;
                    updateSecurityUI();
                });
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ isEncrypted: false, data: payload }));
            }
        }

        async function loadData() {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed.isEncrypted) {
                STATE.isEncrypted = true;
                STATE.encryptedData = parsed.data;
                updateSecurityUI();
            } else {
                STATE.keys = parsed.data.keys || [];
                STATE.user = parsed.data.user || 'Convidado';
                
                // 🜈 Genus: Sincronizar com Core
                const active = STATE.keys.find(k => k.active);
                if (active && active.token) {
                    di_.storage.set('di_apiKey', active.token);
                }
                if (STATE.user !== 'Convidado') {
                    di_.storage.set('di_userName', STATE.user);
                    if(els.input) els.input.value = STATE.user;
                }
                updateInterface(STATE.user);
                renderKeysList();
            }
            // Sync UI Inputs
            if(document.getElementById('apiKeyInput')) document.getElementById('apiKeyInput').value = di_.state.apiKey;
            if(document.getElementById('infodoseNameInput')) document.getElementById('infodoseNameInput').value = di_.state.infodoseName;
            if(document.getElementById('modelSelect')) document.getElementById('modelSelect').value = di_.state.modelName;
        }

        // --- UI HELPERS ---
        const hashStr = s => { let h=0xdeadbeef; for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),2654435761);} return (h^h>>>16)>>>0; };
        const createSvg = (id,sz) => `<svg viewBox="0 0 100 100" width="${sz}" height="${sz}"><defs><linearGradient id="g${id}"><stop offset="0%" stop-color="#00f2ff"/><stop offset="100%" stop-color="#bd00ff"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="#080b12" stroke="rgba(255,255,255,0.1)"/><circle cx="50" cy="50" r="20" fill="url(#g${id})" opacity="0.9"/></svg>`;
        const createMiniSvg = (name,sz=30) => {
            const s = hashStr(name||'D'); const h1=s%360; const h2=(s*37)%360;
            const grad = `<linearGradient id="gm${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h1},90%,50%)"/><stop offset="1" stop-color="hsl(${h2},90%,50%)"/></linearGradient>`;
            return `<svg width="${sz}" height="${sz}" viewBox="0 0 32 32"><defs>${grad}</defs><rect width="32" height="32" rx="8" fill="#0a1016"/><circle cx="16" cy="16" r="6" fill="url(#gm${s})"/></svg>`;
        };

        function updateInterface(name){
            const safe = name || 'Convidado';
            if(els.lblName) els.lblName.innerText = safe;
            if(els.input) els.input.value = safe;
            const activeKey = STATE.keys.find(k=>k.active);
            if(els.smallIdent) els.smallIdent.innerText = activeKey ? activeKey.name : '--';
            if(els.actBadge) els.actBadge.innerText = activeKey ? `key:${activeKey.name}` : 'v:--';
            if(els.smallMiniAvatar) els.smallMiniAvatar.innerHTML = createMiniSvg(safe);
            if(els.actMiniAvatar) els.actMiniAvatar.innerHTML = createMiniSvg(safe,36);
            if(els.actName) els.actName.innerText = safe;
            if(els.avatarTgt) els.avatarTgt.innerHTML = createSvg('Main',64);
            const phrases = ["Foco estável.","Ritmo criativo.","Percepção sutil."];
            if(els.smallText) els.smallText.innerText = activeKey ? `${activeKey.name} [ATIVO]` : (safe==='Convidado'?'Aguardando...':`${safe} · ${phrases[safe.length%phrases.length]}`);
            const line = `+${'-'.repeat(safe.length+4)}+`;
            if(els.actPre) els.actPre.innerText = `${line}\n| ${safe.toUpperCase()} |\n${line}\nID: ${hashStr(safe).toString(16)}`;
        }

        function updateSecurityUI() {
            if (SESSION_PASSWORD) {
                els.vaultStatusText.innerText = "Cofre Protegido (Destrancado)"; els.lockVaultBtn.innerText = "TRANCAR";
            } else if (STATE.isEncrypted) {
                els.vaultStatusText.innerText = "Cofre Trancado"; els.lockVaultBtn.innerText = "REDEFINIR";
            } else {
                els.vaultStatusText.innerText = "Cofre Aberto (Sem senha)"; els.lockVaultBtn.innerText = "CRIAR SENHA";
            }
        }

        function renderKeysList(){
            els.keyList.innerHTML = '';
            if(STATE.keys.length===0){ els.keyList.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Nenhuma chave armazenada.</div>'; return; }
            STATE.keys.forEach(k=>{
                const div = document.createElement('div');
                div.className = `key-item ${k.active?'active-item':''}`;
                div.innerHTML = `
                  <div class="meta" style="flex:1"><div style="font-weight:700;font-size:0.9rem">${escapeHtml(k.name)}</div></div>
                  <div class="actions">
                    ${!k.active ? `<button class="small-btn btn-activate" data-id="${k.id}">ATIVAR</button>` : `<span style="font-size:0.7rem;font-weight:700;color:var(--neon-cyan);margin-right:10px">ATIVA</span>`}
                    <button class="small-btn danger btn-remove" data-id="${k.id}"><i data-lucide="trash-2" style="width:14px"></i></button>
                  </div>`;
                els.keyList.appendChild(div);
            });
            if(window.lucide) window.lucide.createIcons();
            
            // Re-attach events (delegation simplificada)
            div.querySelectorAll('.btn-activate').forEach(b => b.onclick = () => setActiveKey(b.dataset.id));
            div.querySelectorAll('.btn-remove').forEach(b => b.onclick = () => removeKey(b.dataset.id));
        }

        // --- KEY MANAGEMENT ---
        function addKey() {
            const name = els.keyName.value.trim();
            const token = els.keyToken.value.trim();
            if(!name){ showToaster('Nome obrigatório','error'); return; }
            const newKey = { id: Date.now().toString(36), name, token, active: STATE.keys.length===0 };
            STATE.keys.push(newKey);
            
            if(newKey.active && newKey.token) {
                di_.storage.set('di_apiKey', newKey.token);
            }
            
            saveData(); renderKeysList(); updateInterface(STATE.user);
            els.keyName.value=''; els.keyToken.value='';
            showToaster('Chave adicionada!', 'success');
        }

        function removeKey(id) {
            if(confirm('Remover chave permanentemente?')){
                STATE.keys = STATE.keys.filter(k=>k.id!==id);
                saveData(); renderKeysList(); updateInterface(STATE.user);
            }
        }

        function setActiveKey(id) {
            let activatedToken = null;
            STATE.keys.forEach(k=> {
                k.active = (k.id===id);
                if(k.active) activatedToken = k.token;
            });
            if(activatedToken) {
                di_.storage.set('di_apiKey', activatedToken);
                if(document.getElementById('apiKeyInput')) document.getElementById('apiKeyInput').value = activatedToken;
                showToaster('Chave sincronizada.', 'success');
            }
            saveData(); renderKeysList(); updateInterface(STATE.user);
        }

        // --- UI LOGIC (DRAG & MODES) ---
        let uiState = { isOrb: false, isHud: false, isDragging: false, startX: 0, startY: 0, dragOffsetX: 0, dragOffsetY: 0, timer: null };
        const LONG_PRESS_MS = 350;
        
        function saveUIState() {
            const mode = uiState.isOrb ? 'orb' : (uiState.isHud ? 'hud' : 'card');
            localStorage.setItem(UI_STATE_KEY, JSON.stringify({ mode, left: els.card.style.left, top: els.card.style.top }));
        }

        function setMode(mode) {
            [els.btnModeCard, els.btnModeOrb, els.btnModeHud].forEach(b=>b && b.classList.remove('active-mode'));
            if(mode==='card' && els.btnModeCard) els.btnModeCard.classList.add('active-mode');
            if(mode==='orb' && els.btnModeOrb) els.btnModeOrb.classList.add('active-mode');
            if(mode==='hud' && els.btnModeHud) els.btnModeHud.classList.add('active-mode');

            if(mode === 'card') {
                uiState.isOrb=false; uiState.isHud=false;
                els.card.style.transition='all 0.5s var(--ease-smooth)';
                els.card.style.left=''; els.card.style.top=''; els.card.style.transform='';
                els.card.classList.remove('orb','hud','closed');
                setTimeout(()=>els.card.classList.add('content-visible'),300);
            } else if (mode === 'orb') {
                uiState.isOrb = true; uiState.isHud = false;
                els.card.classList.add('orb', 'closed');
                els.card.classList.remove('hud', 'content-visible');
                els.card.style.transform = 'none';
            } else if (mode === 'hud') {
                uiState.isHud = true; uiState.isOrb = false;
                els.card.classList.add('hud', 'closed');
                els.card.classList.remove('orb', 'content-visible');
                els.card.style.top = ''; els.card.style.left = ''; els.card.style.transform = '';
            }
            saveUIState();
        }

        // --- EVENT LISTENERS ---
        function bindEvents() {
            if(!els.card) return;
            els.card.addEventListener('pointerdown', (e) => {
                if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                if(!uiState.isOrb && !uiState.isHud && !els.header.contains(e.target)) return;
                
                uiState.startX = e.clientX; uiState.startY = e.clientY;
                if(uiState.isOrb || uiState.isHud) {
                    uiState.isDragging = true;
                    try { els.card.setPointerCapture(e.pointerId); } catch(err){}
                    const rect = els.card.getBoundingClientRect();
                    uiState.dragOffsetX = e.clientX - rect.left;
                    uiState.dragOffsetY = e.clientY - rect.top;
                    els.card.style.transition = 'none';
                } else {
                    uiState.timer = setTimeout(() => { setMode('orb'); saveUIState(); }, LONG_PRESS_MS);
                }
            });

            window.addEventListener('pointermove', (e) => {
                if(!uiState.isDragging) return;
                e.preventDefault();
                if(uiState.isOrb) {
                    els.card.style.left = `${e.clientX - uiState.dragOffsetX}px`;
                    els.card.style.top = `${e.clientY - uiState.dragOffsetY}px`;
                }
            });

            window.addEventListener('pointerup', (e) => {
                if(uiState.timer) clearTimeout(uiState.timer);
                if(uiState.isDragging) {
                    uiState.isDragging = false;
                    els.card.style.transition = '';
                    try { els.card.releasePointerCapture(e.pointerId); } catch(err){}
                    saveUIState();
                }
            });
            
            // Form Events
            if(els.input) els.input.addEventListener('input', (e) => {
                STATE.user = e.target.value;
                di_.storage.set('di_userName', STATE.user);
                updateInterface(STATE.user);
                saveData();
            });

            if(els.saveSystemBtn) els.saveSystemBtn.addEventListener('click', () => {
                const newKey = document.getElementById('apiKeyInput').value.trim();
                const newModel = document.getElementById('modelSelect').value.trim();
                if(newKey) {
                    di_.storage.set('di_apiKey', newKey);
                    const active = STATE.keys.find(k=>k.active);
                    if(active) { active.token = newKey; saveData(); }
                }
                di_.storage.set('di_modelName', newModel || di_.state.modelName);
                di_.storage.set('di_infodoseName', document.getElementById('infodoseNameInput').value.trim());
                showToaster('Configurações Salvas (di_ synced)', 'success');
            });
            
            // Vault Events
            if(els.vaultUnlock) els.vaultUnlock.addEventListener('click', async () => {
                const pass = els.vaultPass.value;
                try {
                    const decrypted = await CRYPTO.decrypt(STATE.encryptedData, pass);
                    SESSION_PASSWORD = pass; STATE.keys = decrypted.keys; STATE.user = decrypted.user;
                    const active = STATE.keys.find(k=>k.active);
                    if(active && active.token) di_.storage.set('di_apiKey', active.token);
                    if(STATE.user) di_.storage.set('di_userName', STATE.user);
                    
                    els.vaultModal.style.display='none'; els.keysModal.style.display='flex';
                    renderKeysList(); updateSecurityUI(); showToaster('Cofre destrancado.', 'success');
                } catch(e) { showToaster('Senha incorreta.', 'error'); }
            });

            // Buttons
            if(els.addKeyBtn) els.addKeyBtn.addEventListener('click', addKey);
            if(els.avatarTgt) els.avatarTgt.addEventListener('click', () => { if(!uiState.isOrb && !uiState.isHud) openManager(); });
            
            // Expose helpers to global scope only if strictly necessary or map to di_
            di_.fusion = { setMode, addKey, removeKey, setActiveKey };
        }

        // --- HELPERS ---
        function openManager() {
            if (STATE.isEncrypted && !SESSION_PASSWORD) { els.vaultModal.style.display='flex'; els.vaultPass.focus(); } 
            else { els.keysModal.style.display='flex'; }
        }
        function escapeHtml(s){ return s ? s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : ''; }
        function showToaster(txt,type='default'){ 
            const t=document.createElement('div'); t.className=`toaster ${type}`; t.innerText=txt; 
            const wrap = document.getElementById('toasterWrap');
            if(wrap) { wrap.appendChild(t); setTimeout(()=>t.classList.add('show'),10); setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300)},2500); }
        }

        // --- INIT ---
        loadData();
        bindEvents();
        if(window.lucide) window.lucide.createIcons();
        if(els.clock) setInterval(()=>{ els.clock.innerText = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); },1000);

        // Restore UI State
        const rawUi = localStorage.getItem(UI_STATE_KEY);
        if(rawUi){
            try{
                const parsed = JSON.parse(rawUi);
                if(parsed.mode && parsed.mode !== 'card') {
                   els.card.style.left = parsed.left;
                   els.card.style.top = parsed.top;
                   setMode(parsed.mode);
                }
            }catch(e){}
        }
        
        // Export public methods to window for HTML onclick handlers
        window.setActiveKey = setActiveKey;
        window.removeKey = removeKey;
        window.setMode = setMode;

        return { uiState };
    });

})(window.di_);

