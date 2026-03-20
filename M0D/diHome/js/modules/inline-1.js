
    /* ========== SYSTEM CONSTANTS ========== */
    const KEYS = {
        CORTEX: 'di_cortex_v29', 
        USER: 'di_userName',
        STATS: 'di_videoStats',
        TRIAD: 'di_metaTriad',
        ACTIVE_META: 'di_activeMetaData',
        INFODOSE_NAME: 'di_infodoseName' // To sync with Viviv
    };

    let STATE = {
        screen: 1,
        cortex: { crystals: [], matrices: [] },
        activePanel: 'crystals',
        editingMatrixId: null,
        triad: { color: '---', essence: '---', element: '---' }, // Start Clean
        metaData: null
    };

    // TUNER OPTIONS
    const OPTIONS = {
        colors: ['Dourado', 'Azul', 'Vermelho', 'Verde', 'Roxo', 'Prata', 'Preto'],
        essences: ['Movimento', 'Silêncio'],
        elements: ['Fogo', 'Água', 'Madeira', 'Terra', 'Metal']
    };
    
    // VISUAL MAPS (CSS VARS)
    const COLOR_MAP = {
        'Dourado': '#FFD700', 'Azul': '#38BDF8', 'Vermelho': '#EF4444',
        'Verde': '#22C55E', 'Roxo': '#A855F7', 'Prata': '#E5E7EB', 'Preto': '#505050',
        '---': '#FFFFFF' // Default
    };

    const ELEMENT_GLOW_MAP = {
        'Fogo': '#FF4500', 'Água': '#00BFFF', 'Madeira': '#228B22', 
        'Terra': '#8B4513', 'Metal': '#C0C0C0', '---': '#202020'
    };

    const ANIM_SPEED_MAP = {
        'Movimento': '3s', 'Silêncio': '8s', '---': '5s'
    };

    // --- INFODOSE ARCHITECTS BRIDGE ---
    const INFODOSE_PRESETS = {
        "ATLAS":   { color: 'Azul',     essence: 'Silêncio', element: 'Metal', desc: 'Estrutura & Governo' },
        "NOVA":    { color: 'Roxo',     essence: 'Movimento', element: 'Fogo',  desc: 'Inovação & Fluxo' },
        "VITALIS": { color: 'Verde',    essence: 'Movimento', element: 'Madeira', desc: 'Energia & Ação' },
        "PULSE":   { color: 'Vermelho', essence: 'Movimento', element: 'Fogo',  desc: 'Ritmo & Emoção' },
        "ARTEMIS": { color: 'Roxo',     essence: 'Silêncio', element: 'Madeira', desc: 'Foco & Caça' },
        "SERENA":  { color: 'Azul',     essence: 'Silêncio', element: 'Água',  desc: 'Paz & Harmonia' },
        "KAOS":    { color: 'Vermelho', essence: 'Movimento', element: 'Água',  desc: 'Mudança & Entropia' },
        "LUMINE":  { color: 'Dourado',  essence: 'Movimento', element: 'Fogo',  desc: 'Brilho & Carisma' },
        "SOLUS":   { color: 'Preto',    essence: 'Silêncio', element: 'Água',  desc: 'Vazio & Verdade' },
        "HORUS":   { color: 'Azul',     essence: 'Movimento', element: 'Metal', desc: 'Visão & Estratégia' },
        "AION":    { color: 'Prata',    essence: 'Silêncio', element: 'Metal', desc: 'Tempo & Evolução' }
    };

    /* ========== INITIALIZATION ========== */
    window.onload = async () => {
        lucide.createIcons();
        await MetaPulso.init();
        loadSystem();
        
        setupNavigation();
        setupGestures();
        
        Cortex.render();
        DualTube.render();
        
        // Initial Visual Update (might be clean or loaded)
        MetaPulso.updateVisuals(); 

        Navigation.to(1);
        
        // WELCOME TOASTER
        setTimeout(() => {
            const user = localStorage.getItem(KEYS.USER) || 'Piloto';
            toast(`Oi, Dual, ${user}. Como você está se sentindo agora?`, 4000);
        }, 1200);

        initFloatingButton();
    };

    function loadSystem() {
        try {
            const saved = localStorage.getItem(KEYS.CORTEX);
            STATE.cortex = saved ? JSON.parse(saved) : { crystals: [], matrices: [] };
        } catch(e) { STATE.cortex = { crystals: [], matrices: [] }; }

        // Load Triad BUT respect "Clean" intent if first run or explicitly reset
        // If a Viviv name exists, we might want to auto-sync
        const vivivName = localStorage.getItem(KEYS.INFODOSE_NAME);
        if(vivivName && INFODOSE_PRESETS[vivivName]) {
             // Auto-load Viviv preset
             STATE.triad = INFODOSE_PRESETS[vivivName];
        } else {
             try {
                const t = localStorage.getItem(KEYS.TRIAD);
                if(t) STATE.triad = JSON.parse(t);
            } catch(e) {}
        }
        
        const user = localStorage.getItem(KEYS.USER) || 'PILOTO';
        document.getElementById('displayUserHeader').innerText = user.toUpperCase();
    }

    function saveCortex() { localStorage.setItem(KEYS.CORTEX, JSON.stringify(STATE.cortex)); }
    function saveTriad() { localStorage.setItem(KEYS.TRIAD, JSON.stringify(STATE.triad)); }

    /* ========== META PULSO SYSTEM (THE ENGINE) ========== */
    const MetaPulso = {
        init: async () => {
            try {
                const req = await fetch('https://kodux78k.github.io/oiDual-idHome/metapulso_70_combinacoes.json');
                if(!req.ok) throw new Error('JSON Missing');
                STATE.metaData = await req.json();
            } catch (e) {
                console.warn('Meta Pulso JSON not found. Using fallback.');
                STATE.metaData = {}; 
            }
        },

        cycle: (type) => {
            const list = type === 'color' ? OPTIONS.colors : 
                         type === 'essence' ? OPTIONS.essences : 
                         OPTIONS.elements;
            
            // If current is '---', start at index 0
            const current = STATE.triad[type];
            let idx = list.indexOf(current);
            if (idx === -1) idx = -1; 
            
            const next = list[(idx + 1) % list.length];
            STATE.triad[type] = next;
            
            // Just update visuals for now, don't necessarily "Activate" full identity until match found
            MetaPulso.updateVisuals();
        },

        applyPreset: (archKey) => {
            const preset = INFODOSE_PRESETS[archKey];
            if(!preset) return;
            
            STATE.triad.color = preset.color;
            STATE.triad.essence = preset.essence;
            STATE.triad.element = preset.element;
            
            // Sync with Viviv Key
            localStorage.setItem(KEYS.INFODOSE_NAME, archKey);
            
            saveTriad();
            MetaPulso.updateVisuals();
            toast(`Arquétipo ${archKey} Ativado`);
            Modal.hide();
        },

        updateVisuals: () => {
            // 1. CSS VARIABLES UPDATE
            const cVal = STATE.triad.color;
            const eVal = STATE.triad.essence;
            const elVal = STATE.triad.element;

            // UI Text Updates
            document.getElementById('tuner-color').innerText = cVal;
            document.getElementById('tuner-essence').innerText = eVal;
            document.getElementById('tuner-element').innerText = elVal;

            // Map Values to CSS
            const hex = COLOR_MAP[cVal] || '#FFFFFF';
            const elementGlow = ELEMENT_GLOW_MAP[elVal] || '#303030';
            const animSpeed = ANIM_SPEED_MAP[eVal] || '5s';

            // Apply to Root
            const r = document.documentElement;
            r.style.setProperty('--active-color', hex);
            r.style.setProperty('--active-glow', hex + '26');
            r.style.setProperty('--element-glow', elementGlow);
            r.style.setProperty('--anim-speed', animSpeed);

            // Update Text Colors
            document.getElementById('tuner-color').style.color = hex;

            // 2. CHECK FOR MATCH (ACTIVATION LOGIC)
            if (cVal !== '---' && eVal !== '---' && elVal !== '---') {
                saveTriad();
                MetaPulso.checkIdentity(cVal, eVal, elVal);
            } else {
                 // Clean State
                 document.getElementById('hero-title').innerHTML = "<i>Sintonize</i>";
                 document.getElementById('triad-status-container').style.opacity = '0';
            }
        },

        checkIdentity: (c, e, el) => {
             const key = `${c}|${e}|${el}`;
             const data = STATE.metaData ? STATE.metaData[key] : null;
             const statusContainer = document.getElementById('triad-status-container');

             if (data) {
                statusContainer.style.opacity = '1';
                document.getElementById('triad-status').innerText = "SINAL ESTABELECIDO";
                
                const firstName = data.nome.split(' ')[0].toUpperCase();
                // Animate Title Change
                const titleEl = document.getElementById('hero-title');
                if(titleEl.innerText !== firstName) {
                    titleEl.style.opacity = 0;
                    setTimeout(() => {
                        titleEl.innerText = firstName;
                        titleEl.style.opacity = 0.9;
                    }, 300);
                }

                document.getElementById('header-sys-name').innerText = data.nome;
                document.getElementById('card-arch-name').innerText = firstName;
                document.getElementById('drk-quote').innerText = `"${data.frase}"`;

                // Logic for Video
                const vidId = e === 'Movimento' ? 'Id2NI9tv1r4' : 'Bt_rLbMjJDk';
                document.getElementById('suggestion-thumb').src = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
                document.getElementById('archetype-video-suggestion').onclick = () => playVideo(vidId, data.nome);

                localStorage.setItem(KEYS.ACTIVE_META, JSON.stringify(data));
             } else {
                 statusContainer.style.opacity = '1';
                 document.getElementById('triad-status').innerText = "BUSCANDO SINAL...";
                 document.getElementById('hero-title').innerText = "BUSCANDO";
             }
        }
    };

    /* ========== NAVIGATION ========== */
    const Navigation = {
        to: (idx) => {
            STATE.screen = idx;
            document.getElementById('universe-viewport').style.transform = `translateX(-${idx * 100}vw)`;
            [0,1,2].forEach(i => {
                const dot = document.getElementById(`dot-${i}`);
                if(dot) {
                    dot.classList.toggle('active', i === idx);
                    dot.style.backgroundColor = i === idx ? 'var(--active-color)' : 'rgba(255,255,255,0.2)';
                    dot.style.boxShadow = i === idx ? '0 0 10px var(--active-color)' : 'none';
                }
            });
        }
    };

    function setupGestures() {
        let tsX = 0, tsY = 0;
        document.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }, {passive:true});
        document.addEventListener('touchend', e => {
            const dX = tsX - e.changedTouches[0].clientX;
            const dY = tsY - e.changedTouches[0].clientY;
            if(Math.abs(dX) > 60 && Math.abs(dX) > Math.abs(dY)*1.5) {
                if(dX > 0 && STATE.screen < 2) Navigation.to(STATE.screen + 1);
                if(dX < 0 && STATE.screen > 0) Navigation.to(STATE.screen - 1);
            }
        }, {passive:true});
    }

    function setupNavigation() {}

    const OrbDrag = {
        active: false, startX: 0, el: null,
        start: function(e) { 
            this.active = true; 
            this.startX = e.type.includes('mouse')?e.clientX:e.touches[0].clientX; 
            this.el = document.getElementById('orbContainer');
            const move = (ev) => this.move(ev);
            const end = () => {
                this.end();
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', end);
                window.removeEventListener('touchmove', move);
                window.removeEventListener('touchend', end);
            };
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);
            window.addEventListener('touchmove', move, {passive:false});
            window.addEventListener('touchend', end);
        },
        move: function(e) {
            if(!this.active) return;
            const x = e.type.includes('mouse')?e.clientX:e.touches[0].clientX;
            const diff = x - this.startX;
            this.el.style.transform = `translateX(${diff/4}px)`; 
        },
        end: function() {
            if(!this.active) return;
            this.active = false;
            const style = window.getComputedStyle(this.el);
            const matrix = new DOMMatrix(style.transform);
            if(matrix.m41 > 60 && STATE.screen > 0) Navigation.to(STATE.screen - 1);
            else if(matrix.m41 < -60 && STATE.screen < 2) Navigation.to(STATE.screen + 1);
            this.el.style.transform = 'translateX(0)';
        }
    };

    /* ========== CORTEX LOGIC ========== */
    const Cortex = {
        switch: (tab) => {
            STATE.activePanel = tab;
            document.getElementById('panel-crystals').classList.toggle('hidden', tab !== 'crystals');
            document.getElementById('panel-matrices').classList.toggle('hidden', tab !== 'matrices');
            document.getElementById('tab-crystals').classList.toggle('active', tab === 'crystals');
            document.getElementById('tab-matrices').classList.toggle('active', tab === 'matrices');
            Cortex.render();
        },

        render: () => {
            if (STATE.activePanel === 'crystals') Cortex.renderCrystals();
            else Cortex.renderMatrices();
        },

        renderCrystals: () => {
            const container = document.getElementById('crystal-container');
            const query = document.getElementById('memory-search').value.toLowerCase();
            const filtered = STATE.cortex.crystals.filter(c => 
                c.content.toLowerCase().includes(query) || 
                (c.tags && c.tags.some(t => t.toLowerCase().includes(query)))
            );
            
            container.innerHTML = filtered.length ? filtered.map(c => `
                <div class="glass-card p-4 rounded-xl border-l-2 ${c.pinned ? 'border-l-dynamic' : 'border-l-transparent'} hover:bg-white/5 transition group relative border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex gap-2">
                            ${(c.tags||[]).map(t => `<span class="px-2 py-0.5 rounded text-[8px] bg-white/5 text-white/50 uppercase tracking-wider border border-white/5">${t}</span>`).join('')}
                        </div>
                        <div class="flex gap-3 opacity-20 group-hover:opacity-100 transition">
                            <button onclick="Cortex.togglePin(${c.id})" class="text-white hover:text-dynamic"><i data-lucide="pin" class="w-3 h-3 ${c.pinned?'fill-current':''}"></i></button>
                            <button onclick="Cortex.deleteMemory(${c.id})" class="text-white hover:text-red-400"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                    <p class="text-xs text-white/80 font-medium leading-relaxed font-sans">"${c.content}"</p>
                </div>
            `).join('') : `<div class="text-center py-20 opacity-20 text-[10px] font-mono uppercase tracking-widest">Sem registros</div>`;
            lucide.createIcons();
        },

        renderMatrices: () => {
            const list = document.getElementById('matrix-list-mini');
            if(!Array.isArray(STATE.cortex.matrices)) STATE.cortex.matrices = [];

            const activeM = STATE.cortex.matrices.find(m => m.active);
            document.getElementById('active-matrix-name').innerText = activeM ? activeM.name : 'Nenhuma';
            
            list.innerHTML = STATE.cortex.matrices.map(m => `
                <div onclick="Cortex.loadToEditor('${m.id}')" class="matrix-item p-3 flex justify-between items-center cursor-pointer ${m.active ? 'active' : ''}">
                    <span class="text-[9px] font-bold uppercase tracking-widest ${m.active ? 'text-dynamic' : 'text-white/40'}">${m.name}</span>
                    <button onclick="Cortex.deleteMatrix('${m.id}', event)" class="text-white/10 hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button>
                </div>
            `).join('');
            
            if (!STATE.editingMatrixId && activeM) Cortex.loadToEditor(activeM.id);
            lucide.createIcons();
        },

        /* ACTIONS */
        openNewMemory: () => {
            Modal.show(`
                <h3 class="font-display font-bold text-lg text-white mb-4 tracking-wide">Novo Cristal</h3>
                <textarea id="new-mem-txt" class="w-full h-32 bg-white/5 rounded-xl p-4 text-xs text-white focus:bg-white/10 transition resize-none mb-3 border border-white/10 outline-none" placeholder="O que aprendeu hoje?"></textarea>
                <input id="new-mem-tags" class="w-full bg-white/5 rounded-xl p-3 text-xs text-white mb-4 border border-white/10 outline-none" placeholder="Tags (separadas por vírgula)">
                <div class="flex justify-end gap-2">
                    <button onclick="Modal.hide()" class="px-4 py-2 rounded-lg text-[10px] font-bold text-white/40 hover:text-white transition uppercase">Cancelar</button>
                    <button onclick="Cortex.saveNewMemory()" class="px-6 py-2 rounded-lg bg-dynamic/10 text-dynamic border border-dynamic/30 hover:bg-dynamic/20 text-[10px] font-bold uppercase transition tracking-wider">Cristalizar</button>
                </div>
            `);
        },

        saveNewMemory: () => {
            const content = document.getElementById('new-mem-txt').value;
            const tags = document.getElementById('new-mem-tags').value.split(',').map(t => t.trim()).filter(t => t);
            if(!content) return;

            const newMem = { id: Date.now(), content, tags, pinned: false };
            STATE.cortex.crystals.unshift(newMem);
            saveCortex(); Cortex.render(); Modal.hide(); toast("Memória Cristalizada");
        },

        togglePin: (id) => {
            const c = STATE.cortex.crystals.find(x => x.id === id);
            if(c) c.pinned = !c.pinned;
            saveCortex(); Cortex.render();
        },

        deleteMemory: (id) => {
            STATE.cortex.crystals = STATE.cortex.crystals.filter(c => c.id !== id);
            saveCortex(); Cortex.render();
        },

        /* MATRIX ACTIONS */
        loadToEditor: (id) => {
            const m = STATE.cortex.matrices.find(mx => mx.id === id);
            if(!m) return;
            STATE.editingMatrixId = id;
            document.getElementById('editor-title').innerText = `EDIT: ${m.name}`;
            document.getElementById('matrix-editor').value = m.content;
            Cortex.renderMatrices();
        },

        createNewMatrix: () => {
            const name = prompt("Nome da nova matriz:");
            if(!name) return;
            const newM = { id: 'm' + Date.now(), name, content: '', active: false };
            STATE.cortex.matrices.push(newM);
            saveCortex(); Cortex.loadToEditor(newM.id);
        },

        saveActiveMatrix: () => {
            const m = STATE.cortex.matrices.find(mx => mx.id === STATE.editingMatrixId);
            if(!m) return;
            m.content = document.getElementById('matrix-editor').value;
            if(!STATE.cortex.matrices.find(x => x.active)) m.active = true;
            saveCortex();
            toast("Matriz Salva");
        },

        exportMatrix: () => {
            const m = STATE.cortex.matrices.find(mx => mx.id === STATE.editingMatrixId);
            if(!m) return;
            const blob = new Blob([m.content], {type: 'text/markdown'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `${m.name}.md`; a.click();
        },

        importMatrix: () => {
            const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.md,.txt';
            inp.onchange = e => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const newM = { id: 'm' + Date.now(), name: file.name.replace('.md',''), content: ev.target.result, active: false };
                    STATE.cortex.matrices.push(newM);
                    saveCortex(); Cortex.renderMatrices(); toast("Matriz Importada");
                };
                reader.readAsText(file);
            };
            inp.click();
        },

        deleteMatrix: (id, e) => {
            e.stopPropagation();
            STATE.cortex.matrices = STATE.cortex.matrices.filter(m => m.id !== id);
            if(STATE.editingMatrixId === id) STATE.editingMatrixId = null;
            saveCortex(); Cortex.renderMatrices();
        }
    };

    /* ========== DUALTUBE LOGIC ========== */
    const DualTube = {
        data: [
            { cat: 'Frequências e Rituais', vids: ["Bt_rLbMjJDk", "_0wVkryxanE", "Id2NI9tv1r4"], desc: 'Ambientação' },
            { cat: 'Arquitetura Mental', vids: ["qldgs0aLdB0", "FbutKMpd8MY", "1L9_rFmIGJ8"], desc: 'Construção' },
            { cat: 'Meditações', vids: ["hfQ1L6fCfAo", "Tq99vQNQ6dQ", "DTDfkHwuMic"], desc: 'Deriva' }
        ],
        render: () => {
            const container = document.getElementById('video-categories');
            const stats = JSON.parse(localStorage.getItem(KEYS.STATS) || '{}');
            
            container.innerHTML = DualTube.data.map(c => `
                <div class="animate-[fadeIn_0.5s_ease]">
                    <div class="mb-4 pl-1 border-l-2 border-white/5">
                        <h4 class="title-mix text-[10px] text-white/80 ml-4 tracking-[0.25em]">
                           <b>${c.cat}</b>
                        </h4>
                        <p class="text-[8px] text-white/20 uppercase tracking-[0.2em] ml-4 mt-1">${c.desc}</p>
                    </div>
                    <div class="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x px-1">
                        ${c.vids.map(id => `
                            <div onclick="playVideo('${id}', '${c.cat}')" class="flex-shrink-0 w-56 aspect-video rounded-xl bg-white/5 relative overflow-hidden group cursor-pointer snap-start border border-white/5 hover:border-dynamic/30 transition-all">
                                <img src="https://img.youtube.com/vi/${id}/mqdefault.jpg" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500">
                                <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition"></div>
                                <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                    <div class="px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-bold uppercase text-white/70 border border-white/5">
                                      ${stats[id] ? '<span class="text-dynamic">Visto</span>' : 'Sintonizar'}
                                    </div>
                                    <div class="w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-dynamic group-hover:text-black transition duration-500 border border-white/10 group-hover:border-transparent">
                                      <i data-lucide="play" class="w-3 h-3 fill-current ml-0.5"></i>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            document.getElementById('dt-watched-count').innerText = Object.keys(stats).length;
            lucide.createIcons();
        }
    };

    function playVideo(id, cat) {
        document.getElementById('player-overlay').classList.replace('hidden', 'flex');
        document.getElementById('yt-embed').innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        
        let stats = JSON.parse(localStorage.getItem(KEYS.STATS) || '{}');
        stats[id] = { ts: Date.now(), cat };
        localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
        DualTube.render();
    }

    function closePlayer() {
        document.getElementById('player-overlay').classList.replace('flex', 'hidden');
        document.getElementById('yt-embed').innerHTML = '';
    }

    /* ========== UI UTILS ========== */
    const Modal = {
        show: (html) => {
            const overlay = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            content.innerHTML = html;
            overlay.classList.replace('hidden', 'flex');
            setTimeout(() => {
                content.classList.replace('scale-90', 'scale-100');
                content.classList.replace('opacity-0', 'opacity-100');
            }, 10);
            lucide.createIcons();
        },
        hide: () => {
            const overlay = document.getElementById('modal-overlay');
            const content = document.getElementById('modal-content');
            content.classList.replace('scale-100', 'scale-90');
            content.classList.replace('opacity-100', 'opacity-0');
            setTimeout(() => overlay.classList.replace('flex', 'hidden'), 300);
        }
    };

    function toast(m, dur=3000) {
        const t = document.getElementById('di_toast');
        const d = document.createElement('div');
        d.className = "glass-pill bg-black/80 border-dynamic/30 px-6 py-3 shadow-2xl backdrop-blur-xl text-[10px] font-bold uppercase tracking-[0.15em] text-dynamic animate-[float_4s_ease-in-out_infinite]";
        d.innerText = m;
        t.appendChild(d);
        setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 500); }, dur);
    }

    /* ========== INFODOSE INTEGRATION (THE MERGE) ========== */
    function showInfodoseModal() {
      // 1. Get current Meta Pulso Status
      const activeMeta = STATE.metaData ? STATE.metaData[`${STATE.triad.color}|${STATE.triad.essence}|${STATE.triad.element}`] : null;
      const sysName = activeMeta ? activeMeta.nome : "SISTEMA NEUTRO";
      const quote = activeMeta ? activeMeta.frase : "Sinal não sintonizado.";
      
      const trainingText = `[SISTEMA META PULSO]\nARQUÉTIPO ATIVO: ${sysName}\n\n-- DIRETRIZES --\n"${quote}"\n\n[MICRO-SCRIPT DE ATIVAÇÃO]\n1. Respire fundo.\n2. Visualize a cor ${STATE.triad.color}.\n3. Invoque a essência do ${STATE.triad.element}.\n4. Ação: ${STATE.triad.essence}.`;

      // 2. Build the Modal with Architect Grid
      const architectsGrid = Object.keys(INFODOSE_PRESETS).map(key => {
          const p = INFODOSE_PRESETS[key];
          return `<div onclick="MetaPulso.applyPreset('${key}')" class="arch-btn group">
                    <span class="text-[9px] font-black uppercase text-white/50 group-hover:text-white transition">${key}</span>
                    <span class="text-[7px] text-white/20 uppercase mt-1 tracking-wider">${p.desc}</span>
                  </div>`;
      }).join('');

      Modal.show(`
        <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <strong class="text-lg text-white font-display">Infodose: ${sysName}</strong>
            <p class="text-[9px] text-white/40 uppercase tracking-widest mt-1">Central de Comando</p>
          </div>
          <button onclick="Modal.hide()" class="text-white/40 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
        
        <div class="mb-6">
            <p class="text-[9px] font-bold uppercase tracking-widest text-dynamic mb-3">Sintonizar Arquiteto (Preset)</p>
            <div class="grid grid-cols-3 gap-2 h-40 overflow-y-auto custom-scroll pr-1">
                ${architectsGrid}
            </div>
        </div>

        <div>
             <p class="text-[9px] font-bold uppercase tracking-widest text-dynamic mb-3">Treinamento Gerado</p>
            <div class="bg-black/40 rounded-xl p-4 h-32 overflow-y-auto custom-scroll font-mono text-xs text-white/70 border border-white/5 whitespace-pre-wrap">${trainingText}</div>
             <button onclick="navigator.clipboard.writeText(\`${trainingText}\`); toast('Copiado');" class="glass-pill border-white/10 hover:bg-white/10 text-white/60 mt-2 text-[8px] w-full">Copiar Script</button>
        </div>
      `);
    }

    function initFloatingButton() {
        setTimeout(() => {
            if(document.getElementById('infodose-float')) return;
            const btn = document.createElement('div');
            btn.id = 'infodose-float';
            btn.style.position = 'fixed'; btn.style.left = '50%'; btn.style.transform = 'translateX(-50%)'; btn.style.top = '110px'; btn.style.zIndex = 45;
            btn.innerHTML = `<button onclick="showInfodoseModal()" class="glass-pill w-10 h-10 flex items-center justify-center rounded-full border-dynamic/20 text-dynamic hover:bg-white/10 transition cursor-pointer shadow-2xl backdrop-blur-md group"><i data-lucide="zap" class="w-4 h-4 group-hover:fill-current transition duration-500"></i></button>`;
            document.body.appendChild(btn);
            lucide.createIcons();
        }, 800);
    }
  