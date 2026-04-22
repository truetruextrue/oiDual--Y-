
(function() {
    'use strict';

    /* ===== VERIFICAÇÕES INICIAIS ===== */
    console.log('⚡ KOBLLUX · Ativando integração unificada');

    /* ===== LISTA COMPLETA DOS ARQUÉTIPOS (mesma do TREE) ===== */
    const ARCHETYPES = [
        { file: 'aion.html', name: 'AION · Evolutia', desc: 'Microações estratégicas e evolução', icon: '⏳', frequencia: '672Hz', opcode: '0x05', geometria: '⧉', comandos: ['aion', 'evolução', 'tempo'] },
        { file: 'atlas.html', name: 'Atlas · Cartesius', desc: 'Planejador estratégico', icon: '🗺️', frequencia: '639Hz', opcode: '0x03', geometria: '▢', comandos: ['atlas', 'mapa', 'estratégia'] },
        { file: 'elysha.html', name: 'Elysha · Conexão', desc: 'Conexão espiritual', icon: '🔮', frequencia: '528Hz', opcode: '0x02', geometria: '―', comandos: ['elysha', 'espiritual'] },
        { file: 'genus.html', name: 'Genus · Fabricus', desc: 'Protótipos e materialização', icon: '🔧', frequencia: '594Hz', opcode: '0x04', geometria: '◇', comandos: ['genus', 'construção'] },
        { file: 'horus.html', name: 'Horus · Visão', desc: 'Visão de comando', icon: '🦅', frequencia: '777Hz', opcode: '0x07', geometria: '✧⃝⚝', comandos: ['horus', 'liderança'] },
        { file: 'ignyra.html', name: 'Ignyra · Fogo', desc: 'Guardiã do Fogo', icon: '🔥', frequencia: '432Hz', opcode: '0x01', geometria: '●', comandos: ['ignyra', 'fogo'] },
        { file: 'kaion.html', name: 'Kaion · Dados', desc: 'Sabedoria dos Dados', icon: '📊', frequencia: '528Hz', opcode: '0x06', geometria: '☯', comandos: ['kaion', 'dados'] },
        { file: 'kaos.html', name: 'Kaos · Disruptor', desc: 'Questiona padrões', icon: '⚡', frequencia: '672Hz', opcode: '0x05', geometria: '⧉', comandos: ['kaos', 'disrupção'] },
        { file: 'lumine.html', name: 'Lumine · Brilhare', desc: 'Inspiração leve', icon: '✨', frequencia: '432Hz', opcode: '0x0A', geometria: '📱', comandos: ['lumine', 'luz'] },
        { file: 'luxara.html', name: 'Luxara · Luz', desc: 'Iluminação', icon: '💫', frequencia: '852Hz', opcode: '0x08', geometria: '◉', comandos: ['luxara', 'luz'] },
        { file: 'nova.html', name: 'Nova · Inspira', desc: 'Criatividade', icon: '💡', frequencia: '594Hz', opcode: '0x04', geometria: '◇', comandos: ['nova', 'criatividade'] },
        { file: 'rhea.html', name: 'Rhea · Raízes', desc: 'Vínculos emocionais', icon: '🌳', frequencia: '639Hz', opcode: '0x03', geometria: '▢', comandos: ['rhea', 'raízes'] }
    ];

    /* ===== 1. ARQUÉTIPOS → LOCALSTORAGE ===== */
    function syncArchetypesToLS() {
        let count = 0;
        ARCHETYPES.forEach(arch => {
            const key = `ia:${arch.file.replace('.html', '')}:game`;
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify({
                    key: key,
                    name: arch.name,
                    desc: arch.desc,
                    icon: arch.icon,
                    file: arch.file,
                    frequencia: arch.frequencia,
                    opcode: arch.opcode,
                    geometria: arch.geometria,
                    comandos: arch.comandos,
                    installed: new Date().toISOString(),
                    version: '1.0.0',
                    inteligencia: 'ativa',
                    kobllux: 144,
                    url: `./archetypes/${arch.file}`
                }));
                count++;
            }
        });
        if (count > 0 && typeof window.toast === 'function') {
            window.toast(`${count} arquétipos sincronizados`, 'ok');
        }
        console.log(`🎭 ${count} novos arquétipos salvos`);
        return count;
    }

    /* ===== 2. BOTÃO APP NO SELETOR DE ARQUÉTIPOS ===== */
    function addAppButtonToSelector() {
        const select = document.getElementById('arch-select');
        const container = document.querySelector('.arch-switcher');
        if (!select || !container) return;

        // Verificar se já existe
        if (container.querySelector('.arch-app-btn')) return;

        const appBtn = document.createElement('button');
        appBtn.className = 'btn fx-trans fx-press ring arch-app-btn';
        appBtn.innerHTML = '📱 App';
        appBtn.title = 'Abrir arquétipo como app local';
        appBtn.style.marginLeft = '4px';
        
        appBtn.addEventListener('click', () => {
            const selected = select.value;
            if (!selected) return;
            
            const arch = ARCHETYPES.find(a => a.file === selected);
            if (arch && typeof window.openApp === 'function') {
                const key = `ia:${selected.replace('.html', '')}:game`;
                try {
                    const appData = JSON.parse(localStorage.getItem(key) || '{}');
                    window.openApp({
                        key: key,
                        title: appData.name || arch.name,
                        desc: appData.desc || arch.desc,
                        url: `./archetypes/${selected}`,
                        icon: appData.icon || arch.icon
                    });
                    
                    if (typeof window.dualLog === 'function') {
                        window.dualLog(`📱 App: ${arch.name}`);
                    }
                } catch (e) {
                    console.warn('Erro ao abrir app:', e);
                }
            }
        });
        
        container.appendChild(appBtn);
    }

    /* ===== 3. MELHORAR PAINEL LS EXISTENTE ===== */
    function enhanceLSPanel() {
        const panel = document.getElementById('ls-panel');
        if (!panel) return;

        // Adicionar data-geometry
        panel.setAttribute('data-geometry', '♾️');
        panel.setAttribute('data-frequency', '963Hz');
        panel.setAttribute('data-opcode', '0×09');

        // Melhorar header se existir
        const header = panel.querySelector('header');
        if (header) {
            const title = header.querySelector('#ls-title, strong');
            if (title) {
                title.innerHTML = `LS Purificado · ${Object.keys(localStorage).length} chaves`;
            }
        }

        // Adicionar botão de refresh se não existir
        const actions = panel.querySelector('#ls-actions, .actions');
        if (actions && !document.getElementById('ls-refresh-quick')) {
            const refreshBtn = document.createElement('button');
            refreshBtn.id = 'ls-refresh-quick';
            refreshBtn.className = 'btn fx-trans fx-press ring';
            refreshBtn.innerHTML = '↻';
            refreshBtn.title = 'Atualizar';
            refreshBtn.style.marginLeft = '4px';
            refreshBtn.addEventListener('click', () => {
                if (typeof window.renderLS === 'function') {
                    window.renderLS();
                }
                location.reload(); // fallback
            });
            actions.appendChild(refreshBtn);
        }
    }

    /* ===== 4. INTEGRAÇÃO COM VOZ ===== */
    function setupVoiceCommands() {
        if (typeof window.handleUserMessage !== 'function') return;

        const originalHandle = window.handleUserMessage;
        window.handleUserMessage = async function(text, userName, sk, model) {
            const lowerText = text.toLowerCase();
            
            // Detectar comandos de app
            const match = lowerText.match(/(?:abrir|jogar|iniciar|open)\s+(\w+)/i);
            if (match) {
                const cmd = match[1].toLowerCase();
                
                for (const arch of ARCHETYPES) {
                    if (arch.comandos.some(c => c.includes(cmd))) {
                        const key = `ia:${arch.file.replace('.html', '')}:game`;
                        const appData = JSON.parse(localStorage.getItem(key) || '{}');
                        
                        if (typeof window.openApp === 'function') {
                            window.openApp({
                                key: key,
                                title: appData.name || arch.name,
                                desc: appData.desc || arch.desc,
                                url: `./archetypes/${arch.file}`,
                                icon: appData.icon || arch.icon
                            });
                            
                            if (typeof window.toast === 'function') {
                                window.toast(`Abrindo ${arch.name}`, 'ok');
                            }
                            
                            return `Abrindo ${arch.name}...`;
                        }
                    }
                }
            }
            
            return originalHandle.apply(this, arguments);
        };
        
        console.log('🎤 Comandos de voz integrados');
    }

    /* ===== 5. ATUALIZAR BADGE DO LS ===== */
    function updateLSBadge() {
        const btnLS = document.getElementById('btnLS');
        if (!btnLS) return;

        const badge = btnLS.querySelector('.ls-badge');
        if (badge) {
            const count = Object.keys(localStorage).length;
            badge.textContent = `LS${count}`;
        }
    }

    /* ===== 6. ADICIONAR LOGS NO PAINEL BRAIN ===== */
    function addLogToBrain(message) {
        const logsEl = document.getElementById('logs');
        if (!logsEl) return;

        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${message}`;
        
        // Manter últimas 30 linhas
        const lines = logsEl.textContent.split('\n');
        lines.unshift(entry);
        if (lines.length > 30) lines.pop();
        logsEl.textContent = lines.join('\n');
    }

    /* ===== 7. ATUALIZAR HOME STATUS ===== */
    function updateHomeStatus() {
        const homeAppsStatus = document.getElementById('homeAppsStatus');
        if (homeAppsStatus) {
            const archCount = ARCHETYPES.length;
            homeAppsStatus.textContent = `${archCount} arquétipos · LS ativo`;
        }

        const homeArchStatus = document.getElementById('homeArchStatus');
        if (homeArchStatus) {
            const select = document.getElementById('arch-select');
            if (select && select.selectedOptions[0]) {
                const name = select.selectedOptions[0].textContent.replace('.html', '');
                homeArchStatus.textContent = name;
            }
        }
    }

    /* ===== 8. OBSERVAR MUDANÇAS NO SELECT ===== */
    function observeArchetypeSelect() {
        const select = document.getElementById('arch-select');
        if (!select) return;

        select.addEventListener('change', () => {
            setTimeout(updateHomeStatus, 100);
        });
    }

    /* ===== 9. FUNÇÃO PARA ABRIR APP POR NOME ===== */
    window.openArchetypeApp = function(name) {
        const arch = ARCHETYPES.find(a => 
            a.name.toLowerCase().includes(name.toLowerCase()) ||
            a.file.toLowerCase().includes(name.toLowerCase())
        );
        
        if (arch && typeof window.openApp === 'function') {
            const key = `ia:${arch.file.replace('.html', '')}:game`;
            const appData = JSON.parse(localStorage.getItem(key) || '{}');
            
            window.openApp({
                key: key,
                title: appData.name || arch.name,
                desc: appData.desc || arch.desc,
                url: `./archetypes/${arch.file}`,
                icon: appData.icon || arch.icon
            });
            
            return true;
        }
        return false;
    };

    /* ===== INICIALIZAÇÃO ===== */
    function init() {
        // 1. Sincronizar arquétipos
        syncArchetypesToLS();
        
        // 2. Adicionar botão de app
        setTimeout(addAppButtonToSelector, 500);
        
        // 3. Melhorar painel LS
        setTimeout(enhanceLSPanel, 1000);
        
        // 4. Configurar comandos de voz
        setupVoiceCommands();
        
        // 5. Atualizar badge
        updateLSBadge();
        
        // 6. Observar select
        observeArchetypeSelect();
        
        // 7. Atualizar status na home
        setTimeout(updateHomeStatus, 600);
        
        // 8. Adicionar log inicial
        addLogToBrain('⚡ KOBLLUX integrado · 12 arquétipos disponíveis');
        
        console.log('✅ KOBLLUX · Integração unificada ativada');
        console.log(`📦 ${Object.keys(localStorage).length} chaves no localStorage`);
        console.log(`🎭 ${ARCHETYPES.length} arquétipos sincronizados`);
    }

    // Executar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expor API global
    window.KOBLLUX = window.KOBLLUX || {};
    window.KOBLLUX.ARCH = {
        list: ARCHETYPES,
        open: window.openArchetypeApp,
        sync: syncArchetypesToLS
    };

})();
