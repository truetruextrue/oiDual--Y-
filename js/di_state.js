/* =========================================================
   HUB UNO CORE — ATLAS ∴ APPLICATION MANAGER
   Integração: di_.state.hub
   ========================================================= */

(function(di_) {
    "use strict";

    di_.register("hub", function() {
        
        // 🜂 Nova: Estado Local
        const hubState = {
            perf: localStorage.getItem('hub.perf') || 'med',
            voice: localStorage.getItem('hub.voice') || 'Nova',
            logs: []
        };

        // 🜄 Pulse: Helpers
        const $ = (q) => document.querySelector(q);
        const $$ = (q) => Array.from(document.querySelectorAll(q));
        const LS = di_.storage; // Usa o wrapper do core

        // --- LOGGING ---
        function dualLog(msg) {
            const entry = '[' + new Date().toLocaleTimeString() + '] ' + msg;
            hubState.logs.unshift(entry);
            const logsEl = document.getElementById('logs');
            if (logsEl) logsEl.textContent = hubState.logs.slice(0, 60).join('\n');
        }

        // --- THEMES & UI ---
        function applyTheme() {
            const theme = di_.state.theme; // Pega do di_.state
            if (theme === 'default') delete document.body.dataset.theme;
            else document.body.dataset.theme = theme;

            const bgContainer = document.getElementById('custom-bg');
            if (!bgContainer) return;
            if (theme !== 'custom') { bgContainer.innerHTML = ''; return; }
            
            const bgData = LS.get('uno:bg', '');
            if (!bgData) return;
            bgContainer.innerHTML = '';
            
            if (/^data:video\//.test(bgData)) {
                const vid = document.createElement('video');
                Object.assign(vid, { src: bgData, autoplay: true, loop: true, muted: true, playsInline: true });
                vid.style.cssText = 'width:100%;height:100%;object-fit:cover';
                bgContainer.appendChild(vid);
            } else {
                const img = document.createElement('img');
                img.src = bgData;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover';
                bgContainer.appendChild(img);
            }
        }

        // --- NAVIGATION ---
        function nav(key) {
            const tabs = ['home', 'apps', 'stack', 'brain', 'revo'];
            tabs.forEach(k => { 
                const view = document.getElementById('v-' + k);
                const btn = document.querySelector(`.tab[data-nav="${k}"]`);
                if(view) view.classList.toggle('active', k === key);
                if(btn) btn.classList.toggle('active', k === key);
            });
            LS.set('uno:lastTab', key);
            if (key === 'home') displayGreeting();
        }

        function displayGreeting() {
            const name = di_.state.userName || 'Viajante';
            const sessions = document.querySelectorAll('.session').length;
            toast(`Bem-vindo de volta, ${name}. ${sessions} sessão(ões) ativa(s).`, 'ok');
            updateHomeStatus();
        }

        // --- APPS LOGIC ---
        // (Simplificado para usar di_.data se disponível, ou fallback local)
        const RAW = { apps: [] };
        
        function renderApps() {
            const appsWrap = document.getElementById('appsWrap');
            if(!appsWrap) return;
            
            // Load embedded JSON if available
            try {
                const rawEl = document.getElementById('APPS_JSON');
                if(rawEl) RAW.apps = JSON.parse(rawEl.textContent).apps || [];
            } catch(e) {}

            appsWrap.innerHTML = '';
            RAW.apps.forEach(a => {
                const el = document.createElement('div'); 
                el.className = 'app-card fx-trans fx-lift';
                el.innerHTML = `
                    <div class="app-icon"><img src="${svgIcon(a.icon)}" width="24"></div>
                    <div style="flex:1">
                        <div class="app-title">${a.title}</div>
                        <div class="mut">${a.desc}</div>
                        <button class="btn" onclick="di_.hub.openApp('${a.url}', '${a.title}')">Abrir</button>
                    </div>
                `;
                appsWrap.appendChild(el);
            });
        }

        function openApp(url, title) {
            const stackWrap = document.getElementById('stackWrap');
            if(!stackWrap) return;
            const sid = 's_' + Date.now();
            const card = document.createElement('div'); 
            card.className = 'session fx-trans fx-lift';
            card.innerHTML = `
                <div class="hdr">
                    <div class="title">${title}</div>
                    <div class="tools">
                        <button onclick="this.closest('.session').remove()">×</button>
                    </div>
                </div>
                <iframe src="${url}"></iframe>`;
            stackWrap.prepend(card);
            nav('stack');
            dualLog(`App aberto: ${title}`);
        }

        // --- UTILS ---
        function toast(msg, type='ok') {
            // Reusa lógica de toast existente ou cria simples
            const box = document.getElementById('toastBox') || document.body;
            const el = document.createElement('div');
            el.className = 'toast'; el.textContent = msg;
            // Estilização inline simplificada para garantir funcionamento
            el.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#222;color:#fff;padding:10px;border-radius:8px;z-index:9999';
            box.appendChild(el);
            setTimeout(()=>el.remove(), 3000);
        }

        function svgIcon(name) {
            // Fallback simples para ícones
            return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
        }

        function updateHomeStatus() {
            const elUser = document.getElementById('homeUserStatus');
            if (elUser) elUser.textContent = `${di_.state.userName} · ${di_.state.theme}`;
        }

        // --- BINDINGS ---
        document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => nav(b.dataset.nav)));
        
        // Listen to Core State Changes
        di_.bus.on('state-change', (d) => {
            if(d.key === 'di_userName') updateHomeStatus();
        });

        // Init
        applyTheme();
        renderApps();
        nav(LS.get('uno:lastTab', 'home'));

        // Expose Public API
        return {
            nav,
            openApp,
            dualLog
        };
    });
    
    // Map global nav for HTML onclick compatibility
    window.di_hub_nav = (k) => di_.modules.hub.instance.nav(k);

})(window.di_);

