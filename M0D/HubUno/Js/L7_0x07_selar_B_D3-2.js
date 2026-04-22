/* ═══════════════════════════════════════════════════════════
   0x07 · SELAR · B · D3
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L7_0x07_selar_B_D3-2.js
   Opcode    : 0x07 · SELAR · ✧ · 777Hz
   V.E.E.B.  : Base
   Degrau    : D3 (word)
   Fórmula   : Base · selo vibracional · ✧ 777Hz · ∆⁷ SELAR
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 7 · ORQUESTRADOR
   Opcode Δ  : 0x0C · Carregar na posição 7 da cadeia
   Nota      : Init — espera DOM + todos os scripts
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=777)
     χ = 17  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function() {
    'use strict';

    /* ===== VERIFICAÇÕES INICIAIS ===== */
    const btnLS = document.getElementById('btnLS');
    if (!btnLS) {
        console.warn('⚠️ Botão #btnLS não encontrado');
        return;
    }

    /* ===== CONSTANTES SAGRADAS ===== */
    const KOBLLUX = {
        version: 'Δ³.LS.PURIF',
        freq: 963,
        pulsos: 144,
        equacao: '∆ × ∆ × ∆ = ∆⁷ = 38.073 = PERFEIÇÃO'
    };

    /* ===== ESTADO DO PAINEL ===== */
    const state = {
        visible: false,
        keys: [],
        searchTerm: '',
        logs: [],
        iaApps: []
    };

    /* ===== LOGS PURIFICADOS (USANDO ELEMENTOS EXISTENTES) ===== */
    function addLog(message, type = 'ok') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        state.logs.unshift(logEntry);
        if (state.logs.length > 50) state.logs.pop();

        // Usar toast existente
        if (typeof window.toast === 'function') {
            window.toast(message, type);
        }

        // Usar dualLog existente
        if (typeof window.dualLog === 'function') {
            window.dualLog(message);
        }

        // Atualizar logs no Brain se existirem
        const logsEl = document.getElementById('logs');
        if (logsEl) {
            logsEl.textContent = state.logs.slice(0, 30).join('\n');
        }

        console.log(`%c[LS] ${message}`, `color: ${type === 'ok' ? '#39ffb6' : '#ffb86b'}`);
    }

    /* ===== GERENCIAMENTO DO LOCALSTORAGE ===== */
    function loadKeys() {
        try {
            state.keys = Object.keys(localStorage).sort();
            updateHomeStatus();
            return state.keys;
        } catch (e) {
            addLog(`Erro ao carregar localStorage: ${e.message}`, 'err');
            return [];
        }
    }

    /* ===== ATUALIZAR STATUS NA HOME (USANDO CARDS EXISTENTES) ===== */
    function updateHomeStatus() {
        try {
            // Atualizar contador de apps no card da Home
            const homeAppsStatus = document.getElementById('homeAppsStatus');
            if (homeAppsStatus) {
                const totalApps = state.keys.filter(k => 
                    k.toLowerCase().includes('app') || 
                    k.toLowerCase().includes('ia') ||
                    k.toLowerCase().includes('infodose')
                ).length;
                homeAppsStatus.textContent = `${totalApps} apps · LS ativo`;
            }

            // Atualizar badge do botão LS
            const lsBadge = btnLS.querySelector('.ls-badge');
            if (lsBadge) {
                lsBadge.textContent = `LS${state.keys.length}`;
                lsBadge.style.background = 'linear-gradient(180deg,#1a2240,#10162b)';
            }

            // Atualizar data-geometry se existir
            btnLS.setAttribute('data-geometry', '♾️');
            btnLS.setAttribute('data-frequency', '963Hz');
            btnLS.setAttribute('data-opcode', '0×09');
        } catch (e) {}
    }

    /* ===== ABRIR APP NO STACK (USANDO openApp EXISTENTE) ===== */
    function openAppFromLS(key) {
        try {
            const value = localStorage.getItem(key);
            if (!value) return;

            // Tentar parsear como JSON
            let appData;
            try {
                appData = JSON.parse(value);
            } catch {
                appData = { title: key, desc: 'App local', content: value };
            }

            // Verificar se é um app IA
            const isIA = key.toLowerCase().includes('ia') || (appData.inteligencia === 'ativa');

            // Criar objeto de app no formato esperado pelo openApp
            const app = {
                key: key,
                title: appData.name || appData.title || key.replace(/[:_-]/g, ' '),
                desc: appData.desc || appData.description || 'App do localStorage',
                url: appData.url || `data:text/html;charset=utf-8,${encodeURIComponent(JSON.stringify(appData))}`,
                icon: appData.icon || '📦',
                tags: isIA ? ['ia', 'local'] : ['local']
            };

            // Usar openApp existente
            if (typeof window.openApp === 'function') {
                window.openApp(app);
                addLog(`📱 App aberto: ${app.title}`);
            } else {
                console.warn('openApp não disponível');
            }
        } catch (e) {
            addLog(`Erro ao abrir app: ${e.message}`, 'err');
        }
    }

    /* ===== INICIALIZAR APPS IA PADRÃO (12 JOGOS) ===== */
    function initIAApps() {
        const appsIA = [
            { 
                key: 'ia:atlas:game', 
                name: 'ATLAS · Jogo da Estratégia', 
                desc: 'Decisões táticas com IA. Comando: "abrir atlas"',
                icon: '♟️',
                inteligencia: 'ativa',
                comandos: ['atlas', 'estratégia', 'táticas']
            },
            { 
                key: 'ia:nova:game', 
                name: 'NOVA · Jogo da Criatividade', 
                desc: 'Desafios criativos adaptativos. Comando: "abrir nova"',
                icon: '🎨',
                inteligencia: 'ativa',
                comandos: ['nova', 'criatividade', 'criar']
            },
            { 
                key: 'ia:vitalis:game', 
                name: 'VITALIS · Jogo da Saúde', 
                desc: 'Rotinas gamificadas com IA coach. Comando: "abrir vitalis"',
                icon: '❤️',
                inteligencia: 'ativa',
                comandos: ['vitalis', 'saúde', 'rotina']
            },
            { 
                key: 'ia:pulse:game', 
                name: 'PULSE · Jogo Musical', 
                desc: 'Composição com IA emocional. Comando: "abrir pulse"',
                icon: '🎵',
                inteligencia: 'ativa',
                comandos: ['pulse', 'música', 'som']
            },
            { 
                key: 'ia:artemis:game', 
                name: 'ARTEMIS · Jogo do Conhecimento', 
                desc: 'Trilhas de aprendizado IA. Comando: "abrir artemis"',
                icon: '📚',
                inteligencia: 'ativa',
                comandos: ['artemis', 'conhecimento', 'aprender']
            },
            { 
                key: 'ia:serena:game', 
                name: 'SERENA · Jogo do Acolhimento', 
                desc: 'Suporte emocional gamificado. Comando: "abrir serena"',
                icon: '🤗',
                inteligencia: 'ativa',
                comandos: ['serena', 'acolhimento', 'emocional']
            },
            { 
                key: 'ia:kaos:game', 
                name: 'KAOS · Jogo Disruptivo', 
                desc: 'Quebra-cabeças não lineares. Comando: "abrir kaos"',
                icon: '⚡',
                inteligencia: 'ativa',
                comandos: ['kaos', 'disruptivo', 'caos']
            },
            { 
                key: 'ia:genus:game', 
                name: 'GENUS · Jogo da Construção', 
                desc: 'Prototipagem com IA. Comando: "abrir genus"',
                icon: '🏗️',
                inteligencia: 'ativa',
                comandos: ['genus', 'construção', 'prototipar']
            },
            { 
                key: 'ia:lumine:game', 
                name: 'LUMINE · Jogo Lúdico', 
                desc: 'Desafios leves e divertidos. Comando: "abrir lumine"',
                icon: '✨',
                inteligencia: 'ativa',
                comandos: ['lumine', 'lúdico', 'diversão']
            },
            { 
                key: 'ia:rhea:game', 
                name: 'RHEA · Jogo das Raízes', 
                desc: 'Memória e vínculos com IA. Comando: "abrir rhea"',
                icon: '🌳',
                inteligencia: 'ativa',
                comandos: ['rhea', 'raízes', 'memória']
            },
            { 
                key: 'ia:solus:game', 
                name: 'SOLUS · Jogo da Meditação', 
                desc: 'Guias meditativos IA. Comando: "abrir solus"',
                icon: '🧘',
                inteligencia: 'ativa',
                comandos: ['solus', 'meditação', 'zen']
            },
            { 
                key: 'ia:aion:game', 
                name: 'AION · Jogo da Evolução', 
                desc: 'Estratégia temporal com IA. Comando: "abrir aion"',
                icon: '⏳',
                inteligencia: 'ativa',
                comandos: ['aion', 'evolução', 'tempo']
            }
        ];

        appsIA.forEach(app => {
            const existing = localStorage.getItem(app.key);
            if (!existing) {
                localStorage.setItem(app.key, JSON.stringify({
                    ...app,
                    installed: new Date().toISOString(),
                    version: '1.0.0',
                    kobllux: KOBLLUX.pulsos,
                    geometria: '♾️'
                }));
            }
        });

        addLog('⚡ 12 apps IA sincronizados no localStorage');
    }

    /* ===== INTEGRAÇÃO COM RECONHECIMENTO DE VOZ ===== */
    function setupVoiceCommands() {
        // Hook no handleUserMessage existente
        if (typeof window.handleUserMessage === 'function') {
            const originalHandle = window.handleUserMessage;
            window.handleUserMessage = async function(text, userName, sk, model) {
                // Verificar comandos de app
                const lowerText = text.toLowerCase();
                
                // Procurar por "abrir X" ou "jogar X"
                const match = lowerText.match(/(?:abrir|jogar|iniciar|open)\s+(\w+)/i);
                if (match) {
                    const appName = match[1].toLowerCase();
                    
                    // Procurar nos apps IA
                    for (let i = 0; i < 12; i++) {
                        const key = `ia:${appsIA[i]?.key.split(':')[1]}:game`;
                        const appData = JSON.parse(localStorage.getItem(key) || '{}');
                        
                        if (appData.comandos && appData.comandos.some(c => c.includes(appName))) {
                            addLog(`🎮 Comando de voz detectado: abrir ${appData.name}`);
                            
                            const app = {
                                key: key,
                                title: appData.name,
                                desc: appData.desc,
                                url: '#ia-app',
                                icon: appData.icon
                            };
                            
                            if (typeof window.openApp === 'function') {
                                window.openApp(app);
                            }
                            
                            return `Abrindo ${appData.name}...`;
                        }
                    }
                }
                
                return originalHandle.apply(this, arguments);
            };
            addLog('🎤 Comandos de voz integrados aos apps IA');
        }
    }

    /* ===== ATUALIZAR FEED DA HOME COM APPS IA ===== */
    function updateHomeFeed() {
        const iaFeed = document.getElementById('iaFeed');
        if (!iaFeed) return;

        // Adicionar mensagem sobre apps IA
        const msgIA = document.createElement('div');
        msgIA.className = 'msg status';
        msgIA.innerHTML = '🤖 12 apps IA disponíveis · Diga "abrir atlas" para jogar';
        iaFeed.prepend(msgIA);
    }

    /* ===== ESCUTAR CLIQUE NO BOTÃO LS EXISTENTE ===== */
    btnLS.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Atualizar dados
        loadKeys();

        // Alternar visibilidade do painel (usando painel existente ou criando um no body)
        const existingPanel = document.getElementById('ls-panel');
        
        if (existingPanel) {
            // Usar painel existente
            existingPanel.style.display = existingPanel.style.display === 'none' ? 'block' : 'none';
            
            if (existingPanel.style.display === 'block') {
                renderExistingPanel(existingPanel);
            }
        } else {
            // Criar painel usando classes existentes
            createPanelUsingExistingStyles();
        }

        // Feedback visual no botão
        btnLS.style.transform = 'scale(0.95)';
        setTimeout(() => btnLS.style.transform = '', 200);

        addLog(`👁️ Painel LS ${state.visible ? 'fechado' : 'aberto'}`);
        state.visible = !state.visible;
    });

    /* ===== RENDERIZAR NO PAINEL EXISTENTE ===== */
    function renderExistingPanel(panel) {
        const grid = panel.querySelector('#ls-grid, .grid, .ls-grid');
        if (!grid) return;

        const filtered = state.keys.filter(key => {
            if (!state.searchTerm) return true;
            const value = localStorage.getItem(key) || '';
            return key.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                   value.toLowerCase().includes(state.searchTerm.toLowerCase());
        });

        grid.innerHTML = filtered.map(key => {
            const value = localStorage.getItem(key) || '';
            const isIA = key.toLowerCase().includes('ia');
            return `
                <div class="ls-row" data-key="${key}" style="border-left: ${isIA ? '3px solid #39ffb6' : 'none'}">
                    <div class="ls-k">${key}</div>
                    <div class="ls-preview">${value.substring(0, 50)}${value.length > 50 ? '…' : ''}</div>
                    <div class="ls-a">
                        <button class="icon-btn" onclick="window.openLSApp('${key}')" title="Abrir app">📱</button>
                        <button class="icon-btn" onclick="window.copyLSValue('${key}')" title="Copiar">📋</button>
                        <button class="icon-btn warn" onclick="window.deleteLSKey('${key}')" title="Apagar">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        // Atualizar título
        const title = panel.querySelector('#ls-title, h3, header strong');
        if (title) {
            title.innerHTML = `LS Purificado · ${filtered.length} chaves · ${KOBLLUX.equacao}`;
        }
    }

    /* ===== CRIAR PAINEL USANDO CLASSES EXISTENTES ===== */
    function createPanelUsingExistingStyles() {
        // Usar estrutura existente do #ls-panel se disponível
        let panel = document.getElementById('ls-panel');
        
        if (!panel) {
            // Criar painel mínimo usando classes existentes
            panel = document.createElement('div');
            panel.id = 'ls-panel';
            panel.className = 'popover'; // Usa classe existente
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 600px;
                max-width: 90vw;
                max-height: 80vh;
                overflow: auto;
                z-index: 9999;
                display: block;
                padding: 0;
            `;

            panel.innerHTML = `
                <header style="padding: 12px; border-bottom: var(--bd); display: flex; justify-content: space-between; align-items: center;">
                    <strong id="ls-title">LS Purificado · 0 chaves</strong>
                    <div class="actions">
                        <button class="btn fx-trans fx-press ring" id="ls-refresh" style="padding: 4px 8px;">↻</button>
                        <button class="btn fx-trans fx-press ring" id="ls-close" style="padding: 4px 8px;">✕</button>
                    </div>
                </header>
                <div style="padding: 12px;">
                    <input type="text" id="ls-search" class="input ring" placeholder="Buscar chaves..." style="width: 100%; margin-bottom: 12px;">
                </div>
                <div id="ls-grid" class="grid" style="padding: 0 12px 12px; max-height: 60vh; overflow: auto;">
                    <!-- Keys serão inseridas aqui -->
                </div>
            `;

            document.body.appendChild(panel);

            // Adicionar eventos
            document.getElementById('ls-close')?.addEventListener('click', () => {
                panel.style.display = 'none';
                state.visible = false;
            });

            document.getElementById('ls-refresh')?.addEventListener('click', () => {
                loadKeys();
                renderExistingPanel(panel);
                addLog('↻ LS atualizado');
            });

            document.getElementById('ls-search')?.addEventListener('input', (e) => {
                state.searchTerm = e.target.value;
                renderExistingPanel(panel);
            });
        }

        renderExistingPanel(panel);
    }

    /* ===== EXPOR FUNÇÕES GLOBAIS ===== */
    window.openLSApp = function(key) {
        openAppFromLS(key);
    };

    window.copyLSValue = function(key) {
        const value = localStorage.getItem(key) || '';
        navigator.clipboard.writeText(value).then(() => {
            addLog(`📋 "${key}" copiado`);
        });
    };

    window.deleteLSKey = function(key) {
        if (confirm(`Apagar "${key}"?`)) {
            localStorage.removeItem(key);
            loadKeys();
            addLog(`🗑️ "${key}" removido`);
            
            // Re-renderizar painel se visível
            const panel = document.getElementById('ls-panel');
            if (panel && panel.style.display !== 'none') {
                renderExistingPanel(panel);
            }
        }
    };

    /* ===== INICIALIZAÇÃO ===== */
    document.addEventListener('DOMContentLoaded', () => {
        // Inicializar apps IA
        initIAApps();
        
        // Carregar chaves
        loadKeys();
        
        // Configurar comandos de voz
        setupVoiceCommands();
        
        // Atualizar feed da Home
        updateHomeFeed();
        
        // Adicionar logs iniciais
        addLog(`⚡ KOBLLUX LS PURIFICADO · ${KOBLLUX.freq}Hz · ${KOBLLUX.equacao}`);
        addLog(`📦 ${state.keys.length} chaves no localStorage`);
        addLog(`🎮 12 apps IA prontos para comandos de voz`);
        
        // Atualizar status periodicamente
        setInterval(loadKeys, 30000);
    });

    // Expor API
    window.KOBLLUX = window.KOBLLUX || {};
    window.KOBLLUX.LS = {
        refresh: loadKeys,
        log: addLog,
        keys: () => state.keys,
        version: KOBLLUX.version
    };

})();