/**
 * FUSION OS // KERNEL v2.0
 * Public Engine & Modular Runtime
 * * API:
 * - FusionOS.boot() : Inicializa o sistema
 * - FusionOS.register({ name, code, url|html }) : Registra novo módulo
 * - FusionOS.launch(code, mode) : Executa um módulo ('sandbox' ou 'fusion')
 *
 * ORB substituído pela versão Loader V3 (visual + CSS) — apenas a camada visual do orb foi alterada.
 */

const FusionOS = (() => {
    // --- 1. CONFIG & PRIVATE STATE ---
    const CONFIG = {
        key: 'fusion_os_state',
        rootId: 'fusion-os-root',
        fusionLayerId: 'navRoot', // "navirute" mantido
        voice: true
    };

    let _state = {
        active: false,
        installed: [] // Array de objetos do módulo
    };

    // --- 2. SUBSYSTEMS ---
    const Utils = {
        speak: (msg) => {
            if (!CONFIG.voice) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(msg);
            u.lang = 'pt-BR'; u.rate = 1.2;
            window.speechSynthesis.speak(u);
        },
        save: () => localStorage.setItem(CONFIG.key, JSON.stringify({ installed: _state.installed })),
        load: () => {
            const data = JSON.parse(localStorage.getItem(CONFIG.key));
            if (data && data.installed) _state.installed = data.installed;
        },
        injectDeps: () => {
            if (!document.querySelector('script[src*="tailwindcss"]')) {
                const s = document.createElement('script');
                s.src = 'https://cdn.tailwindcss.com';
                document.head.appendChild(s);
            }
            if (!window.lucide) {
                const s = document.createElement('script');
                s.src = 'https://unpkg.com/lucide@latest';
                s.onload = () => window.lucide.createIcons();
                document.head.appendChild(s);
            }
        }
    };

    // --- 3. UI GENERATOR (Styles & HTML) ---
    const UI = {
        styles: `
            /* Base layout */
            #fusion-os-root { font-family: 'Inter', sans-serif; color: white; }
            .monolith-wrapper { perspective: 2000px; z-index: 9998; pointer-events: none; }
            .monolith { 
                background: rgba(8, 8, 12, 0.9); backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);
                border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px;
                transform: translateY(100px) rotateX(15deg) scale(0.9); opacity: 0;
                transition: 0.7s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none;
                box-shadow: 0 100px 150px -50px rgba(0,0,0,0.9);
            }
            .os-active .monolith { transform: translateY(0) rotateX(0) scale(1); opacity: 1; pointer-events: auto; }

            .runtime-layer { position: absolute; inset: 0; background: black; transform: translateY(100%); transition: 0.6s cubic-bezier(0.8, 0, 0.2, 1); z-index: 1000; }
            .runtime-layer.visible { transform: translateY(0); }
            .app-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); transition: 0.3s; }
            .app-card:hover { border-color: #00f2ff; background: rgba(255,255,255,0.07); }

            /* ================= LOADER V3 ORB (ENTIRE ORB STYLE) ================= */
            :root {
                --v3-orb-size: 92px;
                --v3-core-size: 12px;
                --v3-accent-a: #00f2ff;
                --v3-accent-b: #8f00ff;
                --v3-shadow: rgba(0,0,0,0.45);
            }

            /* container button */
            .orb-trigger {
                width: var(--v3-orb-size);
                height: var(--v3-orb-size);
                display: grid;
                place-items: center;
                background: transparent;
                border: none;
                padding: 0;
                cursor: pointer;
                pointer-events: auto;
                border-radius: 999px;
                -webkit-tap-highlight-color: transparent;
            }

            /* v3 shell holds layered rings and core */
            .loader-v3-shell {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 999px;
                display: grid;
                place-items: center;
                transform-style: preserve-3d;
            }

            /* outer rotating conic ring (thicker) */
            .loader-v3-ring {
                position: absolute;
                inset: 8px;
                border-radius: 50%;
                background: conic-gradient(from 90deg, var(--v3-accent-a), var(--v3-accent-b), var(--v3-accent-a));
                -webkit-mask: radial-gradient(circle, transparent 62%, black 63%);
                mask: radial-gradient(circle, transparent 62%, black 63%);
                animation: v3-spin-slow 4.2s linear infinite;
                filter: saturate(1.05);
                transform-origin: center center;
                box-shadow: 0 8px 24px var(--v3-shadow);
            }

            /* inner thin ring for depth, rotates reverse and faster */
            .loader-v3-ring--thin {
                position: absolute;
                inset: 18%;
                border-radius: 50%;
                background: conic-gradient(from 0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
                -webkit-mask: radial-gradient(circle, transparent 82%, black 83%);
                mask: radial-gradient(circle, transparent 82%, black 83%);
                animation: v3-spin-fast 1.9s linear infinite reverse;
                opacity: 0.9;
            }

            /* micro accents: little orbit dots (v3 style) */
            .loader-v3-dot {
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(180deg, white, rgba(255,255,255,0.8));
                box-shadow: 0 0 8px rgba(255,255,255,0.6);
                transform-origin: center;
                filter: blur(0.2px);
            }
            .loader-v3-dot.dot-a { top: 8%; left: 50%; transform: translate(-50%, 0); opacity: 0.9; }
            .loader-v3-dot.dot-b { bottom: 10%; right: 18%; opacity: 0.8; width:6px; height:6px; }
            .loader-v3-dot.dot-c { left: 12%; top: 30%; opacity: 0.75; width:6px; height:6px; }

            /* central glow */
            .loader-v3-glow {
                position: absolute;
                width: 64%;
                height: 64%;
                border-radius: 50%;
                background: radial-gradient(circle at 40% 35%, rgba(0,242,255,0.22), transparent 45%);
                filter: blur(10px);
                animation: v3-pulse 3.2s ease-in-out infinite;
                pointer-events: none;
            }

            /* core - KEEP #orb-core for JS compatibility */
            #orb-core {
                width: var(--v3-core-size);
                height: var(--v3-core-size);
                border-radius: 50%;
                background: white;
                box-shadow: 0 0 18px rgba(255,255,255,0.95), 0 6px 22px rgba(0,0,0,0.6);
                transition: transform .28s cubic-bezier(.2,.9,.3,1), background .28s;
                z-index: 4;
                position: relative;
            }

            /* when OS ativo */
            .os-active #orb-core {
                background: var(--v3-accent-a);
                transform: scale(1.18);
                box-shadow: 0 0 28px var(--v3-accent-a), 0 8px 28px rgba(0,242,255,0.12);
            }

            .os-active .loader-v3-ring {
                animation-duration: 3s;
                filter: drop-shadow(0 18px 38px rgba(0,242,255,0.08));
            }

            /* tiny subtle rotation on hover */
            .orb-trigger:hover .loader-v3-shell { transform: rotateX(6deg) rotateY(6deg) scale(1.02); }

            /* keyframes */
            @keyframes v3-spin-slow { to { transform: rotate(360deg); } }
            @keyframes v3-spin-fast { to { transform: rotate(360deg); } }
            @keyframes v3-pulse {
                0%,100% { opacity: 0.36; transform: scale(0.98); }
                50% { opacity: 0.86; transform: scale(1.06); }
            }

            /* responsive */
            @media (max-width: 640px) {
                :root { --v3-orb-size: 74px; --v3-core-size: 10px; }
            }
            /* ================= END LOADER V3 ORB ================= */
        `,
        build: () => {
            const container = document.createElement('div');
            container.id = CONFIG.rootId;
            container.innerHTML = `
                <style>${UI.styles}</style>
                <div class="monolith-wrapper fixed inset-0 flex items-center justify-center p-6">
                    <div id="monolith-ui" class="monolith w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative">
                        <div class="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40">
                            <div class="flex items-center gap-3">
                                <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <span class="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">Fusion OS Kernel v2</span>
                            </div>
                            <input id="os-terminal" type="text" placeholder="COMMAND_ENTRY..." class="bg-transparent text-right text-xs font-mono focus:outline-none text-white/80 w-48 border-b border-white/5 focus:border-cyan-400 uppercase transition-all"/>
                        </div>
                        <div id="os-app-grid" class="flex-1 p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                        <div class="h-10 border-t border-white/5 flex items-center px-8 bg-black/20 text-[9px] text-white/20 tracking-widest uppercase">
                            Status: <span id="os-status-text" class="ml-2 text-white/40">Engine Idle</span>
                        </div>
                        <div id="os-runtime" class="runtime-layer flex flex-col">
                            <div class="h-12 bg-zinc-950 border-b border-white/10 flex justify-between items-center px-6">
                                <span class="text-[10px] font-bold text-cyan-400 tracking-tighter">PROCESS_RUNNING</span>
                                <div class="flex gap-4">
                                    <button onclick="FusionOS.closeRuntime()" class="text-white/40 hover:text-white transition-colors text-xs">EXIT_MODULE ✕</button>
                                </div>
                            </div>
                            <iframe id="os-frame" class="flex-1 bg-white border-none"></iframe>
                        </div>
                    </div>
                </div>

                <!-- ORB V3 (Loader V3) -->
                <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000]">
                    <button onclick="FusionOS.toggle()" class="orb-trigger orb-core" aria-label="Toggle Fusion OS Orb" title="Toggle Fusion OS">
                        <div class="orb-ring loader-v3-ring" aria-hidden="true">
                            <div class="orb-ring loade-v3-shell"></div>
                            <div class="orb-ring loader-v3-ring--thin"></div>

                            <!-- micro dots to emulate v3 details -->
                            <div class="loader-v3-dot dot-a"></div>
                            <div class="loader-v3-dot dot-b"></div>
                            <div class="loader-v3-dot dot-c"></div>

                            <div class="loader-v3-glow"></div>

                            <!-- keep id orb-core for compatibility -->
                            <div id="orb-cor"></div>
                        </div>
                    </button>
                </div>

                <div id="fusion-exit-ctrl" class="fixed top-6 right-6 z-[10001] hidden">
                    <button onclick="FusionOS.exitFusion()" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-6 py-2 rounded-full text-[10px] font-bold transition-all backdrop-blur-md">
                        TERMINATE_FUSION
                    </button>
                </div>
            `;
            document.body.appendChild(container);
        }
    };

    // --- 4. ENGINE CORE ---
    return {
        boot: () => {
            console.log("%c ⚛ FUSION OS KERNEL BOOTING... ", "background:#00f2ff; color:#000; font-weight:bold;");
            Utils.injectDeps();
            UI.build();
            Utils.load();
            
            // Terminal Listener
            document.getElementById('os-terminal').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = e.target.value.toUpperCase();
                    FusionOS.handleCommand(cmd);
                    e.target.value = '';
                }
            });

            FusionOS.render();
            console.log("Kernel: Initialized.");
        },

        register: ({ name, code, url = null, html = null }) => {
            if (!code || (!url && !html)) return console.error("Invalid module definition.");
            if (_state.installed.find(m => m.code === code)) return;

            _state.installed.unshift({ id: Date.now(), name, code, url, html });
            Utils.save();
            FusionOS.render();
            Utils.speak(`Módulo ${name} registrado.`);
        },

        toggle: () => {
            _state.active = !_state.active;
            document.getElementById(CONFIG.rootId).classList.toggle('os-active', _state.active);
            document.getElementById('os-status-text').innerText = _state.active ? 'System Active' : 'Engine Idle';
            if (_state.active) Utils.speak("Sistema operacional online.");
        },

        render: () => {
            const grid = document.getElementById('os-app-grid');
            if (!grid) return;
            grid.innerHTML = _state.installed.map(m => `
                <div class="app-card p-6 rounded-3xl flex flex-col gap-6">
                    <div class="flex justify-between items-start">
                        <div class="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center border border-cyan-400/20">
                            <i data-lucide="layers" class="w-5 h-5 text-cyan-400"></i>
                        </div>
                        <span class="text-[9px] text-white/20 font-mono">${m.code}</span>
                    </div>
                    <div>
                        <h3 class="font-bold text-sm tracking-tight">${m.name}</h3>
                        <p class="text-[10px] text-white/40 mt-1 uppercase tracking-widest italic">Module_Active</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="FusionOS.launch('${m.code}', 'sandbox')" class="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold py-2 rounded-lg transition-all">SANDBOX</button>
                        <button onclick="FusionOS.launch('${m.code}', 'fusion')" class="flex-1 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-400 text-[10px] font-bold py-2 rounded-lg transition-all border border-cyan-500/20">FUSION</button>
                    </div>
                </div>
            `).join('');
            if (window.lucide) window.lucide.createIcons();
        },

        launch: async (code, mode) => {
            const module = _state.installed.find(m => m.code === code);
            if (!module) return;

            if (mode === 'sandbox') {
                const rt = document.getElementById('os-runtime');
                const frame = document.getElementById('os-frame');
                rt.classList.add('visible');
                if (module.url) frame.src = module.url;
                else frame.srcdoc = module.html;
                Utils.speak(`Iniciando ${module.name} em sandbox.`);
            } 
            else if (mode === 'fusion') {
                FusionOS.performFusion(module);
            }
        },

        performFusion: async (module) => {
            const layer = document.getElementById(CONFIG.fusionLayerId);
            if (!layer) return alert("Fusion Layer (navRoot) not found.");

            // Bugfix 3: Close system before fusion
            if (_state.active) FusionOS.toggle();
            
            document.getElementById('fusion-exit-ctrl').classList.remove('hidden');
            Utils.speak(`Iniciando fusão profunda com ${module.name}.`);

            let content = "";

            if (module.url) {
                try {
                    // Tenta Fusion Real (Fetch)
                    const resp = await fetch(module.url);
                    if (!resp.ok) throw new Error("CORS blocked or Network Error");
                    content = await resp.text();
                    this.injectIntoDOM(layer, content);
                } catch (e) {
                    console.warn("Real Fusion failed (CORS), falling back to Layer-Iframe.", e);
                    const ifr = document.createElement('iframe');
                    ifr.src = module.url;
                    ifr.style.cssText = "width:100vw; height:100vh; border:none; position:fixed; inset:0; z-index:10;";
                    layer.appendChild(ifr);
                }
            } else {
                this.injectIntoDOM(layer, module.html);
            }
        },

        injectIntoDOM: (target, html) => {
            target.innerHTML = html;
            // Reativa scripts
            target.querySelectorAll('script').forEach(old => {
                const s = document.createElement('script');
                [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
                s.textContent = old.textContent;
                old.replaceWith(s);
            });
        },

        exitFusion: () => {
            document.getElementById(CONFIG.fusionLayerId).innerHTML = '';
            document.getElementById('fusion-exit-ctrl').classList.add('hidden');
            Utils.speak("Fusão encerrada. Kernel restaurado.");
            FusionOS.toggle();
        },

        closeRuntime: () => {
            const rt = document.getElementById('os-runtime');
            rt.classList.remove('visible');
            setTimeout(() => document.getElementById('os-frame').src = '', 500);
        },

        handleCommand: (cmd) => {
            // Registry Built-in
            const BUILTINS = {
                'OIDUAL': { name: 'OiDual Module', url: 'https://kodux78k.github.io/oiDual-dip-0/' },
                'VIVI': { name: 'Vivivi System', url: 'https://kodux78k.github.io/oiDual-Vivivi-1/' },
                'RESET': 'RESET_KERNEL'
            };

            if (cmd === 'RESET') {
                localStorage.removeItem(CONFIG.key);
                location.reload();
                return;
            }

            if (BUILTINS[cmd]) {
                FusionOS.register({ ...BUILTINS[cmd], code: cmd });
            } else {
                Utils.speak("Comando desconhecido.");
            }
        }
    };
})();

// AUTO-BOOT
FusionOS.boot();
