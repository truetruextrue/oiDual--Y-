
    /* =========================================================
       CORE CONNECT: KOBLLUX v7.9 + VISION MOBILE
       ========================================================= */

    // 1. CARREGAMENTO DE CONFIGURAÇÃO (Blindagem de Erros)
    const di_loadConfig = () => {
        const get = (k, d) => localStorage.getItem(k) || d;
        return {
            user: get('di_userName'),
            infodose: get('di_infodoseName'),
            apiKey: get('di_apiKey'),
            model: get('di_modelName'),
            solar: get('di_solarMode'),
            assistant: get('di_assistantEnabled', 'true') === 'true'
        };
    };

    let MEMORY = di_loadConfig();

    // 2. DADOS MOCKADOS (Sorocaba Edition)
    // 2. ENGINE DE DADOS (UNIFICADO)
const MOCK_PROPS = [
    {
        id: 1,
        title: "Alphaville Nova Esplanada",
        price: "R$ 1.950.000",
        location: "Votorantim / Sorocaba",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 2,
        title: "Campolim High Glass",
        price: "R$ 890.000",
        location: "Parque Campolim",
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 3,
        title: "Condomínio Ibiti Royal",
        price: "R$ 1.200.000",
        location: "Ibiti Royal Park",
        image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=900&q=80"
    }
];
    const MOCK_LEADS = [
        { name: "Dr. Fernando", status: "Visita Agendada", value: "R$ 1.2M", time: "10:00" },
        { name: "Mariana Costa", status: "Proposta Enviada", value: "R$ 850k", time: "Ontem" },
        { name: "Construtora Alpha", status: "Negociação", value: "R$ 2.8M", time: "14/02" }
    ];

    // 3. INICIALIZAÇÃO DO SISTEMA
    function di_init() {
        // UI Personalization
        document.getElementById('user-display').innerText = MEMORY.user.split(' ')[0].toUpperCase();
        document.getElementById('infodose-title').innerHTML = `${MEMORY.infodose}<span>OS</span>`;
        document.getElementById('current-model').innerText = MEMORY.model.split('/')[1] || 'DUAL AI';
        
        // Avatar Initials
        const initials = MEMORY.user.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        document.getElementById('user-avatar').innerText = initials || 'KX';

        // Pre-fill Settings
        document.getElementById('input-api-key').value = MEMORY.apiKey;
        document.getElementById('input-model').value = MEMORY.model;
        document.getElementById('input-user-name').value = MEMORY.user;
        document.getElementById('input-infodose').value = MEMORY.infodose;

        // Solar Mode
        if(MEMORY.solar === 'day') {
            document.body.classList.add('solar-day');
            document.getElementById('solar-icon').className = 'fa-solid fa-moon';
        }

        // Render Data
        di_renderProps();
        di_renderFullList();
        di_renderCRM();

        console.log("KOBLLUX v7.9 — Memória Carregada. Sorocaba Context Ativo.");
    }

    // 4. RENDERS (Imóveis e CRM)
    function di_renderProps() {
        // Horizontal Scroll (Home)
        const container = document.getElementById('prop-list');
        container.innerHTML = MOCK_PROPS.slice(0,3).map(p => `
            <div class="prop-card" onclick="di_haptic()">
                <img src="${p.img}" class="prop-img" loading="lazy">
                <div class="prop-info">
                    <h4 style="font-size:14px; margin-bottom:4px; text-shadow:0 2px 4px black;">${p.t}</h4>
                    <div style="font-size:16px; font-weight:800; color:var(--primary); text-shadow:0 2px 4px black;">${p.p}</div>
                </div>
            </div>
        `).join('');
    }

    function di_renderFullList() {
        // Vertical List (Search Tab)
        const container = document.getElementById('full-prop-list');
        container.innerHTML = MOCK_PROPS.map(p => `
            <div class="list-item" onclick="di_haptic()">
                <img src="${p.img}" class="list-thumb" loading="lazy">
                <div class="list-content">
                    <div class="list-title">${p.t}</div>
                    <div class="list-meta"><i class="fa-solid fa-location-dot"></i> ${p.loc}</div>
                </div>
                <div class="list-price">${p.p}</div>
            </div>
        `).join('');
    }

    function di_renderCRM() {
        const container = document.getElementById('crm-list');
        container.innerHTML = MOCK_LEADS.map(l => `
            <div class="list-item" style="border-left: 3px solid var(--secondary);">
                <div class="list-thumb" style="background:#333; display:flex; align-items:center; justify-content:center; font-weight:bold;">${l.name[0]}</div>
                <div class="list-content">
                    <div class="list-title">${l.name}</div>
                    <div class="list-meta" style="color:var(--success)">${l.status}</div>
                </div>
                <div style="text-align:right">
                    <div class="list-price">${l.value}</div>
                    <div class="list-meta">${l.time}</div>
                </div>
            </div>
        `).join('');
    }

    // 5. NAVEGAÇÃO
    function di_navTo(viewId, el) {
        di_haptic();
        
        // Hide all views
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        // Show target view
        document.getElementById(`view-${viewId}`).classList.add('active');

        // Update Nav Icons
        if(el) {
            document.querySelectorAll('.nav-icon').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }
    }

    // 6. OPENROUTER AI CLIENT (Sem Fallback para Gemini Client-Side)
    async function di_generateInsight(force = false) {
        const status = document.getElementById('ai-status');
        if(!status) return;

        if(!MEMORY.apiKey) {
            status.innerHTML = "<span style='color:var(--danger)'>Erro: API Key ausente. Configure em Configurações.</span>";
            if(force) alert("Configure sua API Key primeiro.");
            return;
        }

        status.innerHTML = "<span class='spinner'></span> Conectando Artemis (OpenRouter)...";
        
        const prompt = {
            model: MEMORY.model,
            messages: [
                { role: "system", content: "Você é Artemis, uma IA tática imobiliária do sistema Dual V4. Responda em Português. Seja breve (max 2 frases)." },
                { role: "user", content: `Analise o mercado de Sorocaba/SP hoje para o corretor ${MEMORY.user}. Dê um insight tático sobre o imóvel em Campolim.` }
            ],
            temperature: 0.7,
            max_tokens: 150
        };

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${MEMORY.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.href
                },
                body: JSON.stringify(prompt)
            });

            if(!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const reply = data.choices[0]?.message?.content || "Sem resposta da IA.";
            
            status.innerText = reply;
            di_haptic();

        } catch (e) {
            console.error(e);
            status.innerText = "Falha na conexão neural. Verifique a chave ou o modelo.";
        }
    }

    // 7. UTILITÁRIOS
    function di_toggleSolar() {
        const isDay = document.body.classList.toggle('solar-day');
        MEMORY.solar = isDay ? 'day' : 'night';
        localStorage.setItem('di_solarMode', MEMORY.solar);
        document.getElementById('solar-icon').className = isDay ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        di_haptic();
    }

    function di_haptic() {
        if(window.navigator.vibrate) window.navigator.vibrate(10);
    }

    function di_saveConfig() {
        const key = document.getElementById('input-api-key').value;
        const model = document.getElementById('input-model').value;
        localStorage.setItem('di_apiKey', key);
        localStorage.setItem('di_modelName', model);
        MEMORY = di_loadConfig(); // Reload
        alert("Conexão Neural Salva!");
        di_init();
    }

    function di_saveIdentity() {
        const user = document.getElementById('input-user-name').value;
        const info = document.getElementById('input-infodose').value;
        localStorage.setItem('di_userName', user);
        localStorage.setItem('di_infodoseName', info);
        MEMORY = di_loadConfig(); // Reload
        alert("Identidade Atualizada!");
        di_init();
    }

    // Boot
    window.onload = di_init;

