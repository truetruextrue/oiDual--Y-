/* =========================================================
   CORE CONNECT: KOBLLUX v7.9 + VISION MOBILE (UNIFIED RENDER)
   ========================================================= */

// 1. CARREGAMENTO DE CONFIGURAÇÃO (Blindagem de Erros)
const di_loadConfig = () => {
    const get = (k, d) => {
        try { return localStorage.getItem(k) || d; } catch(e) { return d; }
    };
    return {
        user: get('di_userName', 'KODUX Raphael'),
        infodose: get('di_infodoseName', 'NEBULA PRO'),
        apiKey: get('di_apiKey', ''),
        model: get('di_modelName', 'google/gemini-2.0-flash-001'),
        solar: get('di_solarMode', 'night'),
        assistant: get('di_assistantEnabled', 'true') === 'true'
    };
};

let MEMORY = di_loadConfig();

// 2. ENGINE DE DADOS UNIFICADO (Mock / placeholder)
const di_properties = [
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
    // Safety: ensure MEMORY has sane defaults
    MEMORY = di_loadConfig();
    const userName = (MEMORY.user && MEMORY.user.trim()) ? MEMORY.user : 'KODUX Raphael';
    const infodoseName = (MEMORY.infodose && MEMORY.infodose.trim()) ? MEMORY.infodose : 'NEBULA PRO';

    // UI Personalization
    const firstName = userName.split(' ')[0] || userName;
    document.getElementById('user-display').innerText = firstName.toUpperCase();
    document.getElementById('infodose-title').innerHTML = `${infodoseName}<span>OS</span>`;
    document.getElementById('current-model').innerText = (MEMORY.model && MEMORY.model.split('/')[1]) || 'DUAL AI';
    
    // Avatar Initials (safe)
    const initials = userName.split(' ').map(n => n[0] || '').join('').substring(0,2).toUpperCase();
    document.getElementById('user-avatar').innerText = initials || 'KX';

    // Pre-fill Settings (if inputs exist)
    if(document.getElementById('input-api-key')) document.getElementById('input-api-key').value = MEMORY.apiKey || '';
    if(document.getElementById('input-model')) document.getElementById('input-model').value = MEMORY.model || '';
    if(document.getElementById('input-user-name')) document.getElementById('input-user-name').value = userName;
    if(document.getElementById('input-infodose')) document.getElementById('input-infodose').value = infodoseName;

    // Solar Mode
    if(MEMORY.solar === 'day') {
        document.body.classList.add('solar-day');
        const solarIcon = document.getElementById('solar-icon');
        if(solarIcon) solarIcon.className = 'fa-solid fa-moon';
    } else {
        document.body.classList.remove('solar-day');
        const solarIcon = document.getElementById('solar-icon');
        if(solarIcon) solarIcon.className = 'fa-solid fa-sun';
    }

    // Render unified engine
    di_renderEngine();
    di_renderCRM();

    console.log("KOBLLUX v7.9 — Memória Carregada. Engine unificada ativa.");
}

// 4. RENDER ENGINE UNIFICADO (Home + Full List)
function di_renderEngine() {
    const scroll = document.getElementById("prop-list");
    const full = document.getElementById("full-prop-list");

    if (scroll) {
        // show first 3 in horizontal scroll
        scroll.innerHTML = di_properties.slice(0,3).map(p => `
            <div class="prop-card" onclick="di_haptic()">
                <div class="prop-image" style="background-image:url('${p.image}')"></div>
                <div class="prop-overlay"></div>
                <div class="prop-content">
                    <div class="prop-title">${escapeHtml(p.title)}</div>
                    <div class="prop-price">${escapeHtml(p.price)}</div>
                </div>
            </div>
        `).join('');
    }

    if (full) {
        // full vertical list
        full.innerHTML = di_properties.map(p => `
            <div class="list-item" onclick="di_haptic()">
                <img src="${p.image}" class="list-thumb" loading="lazy" alt="${escapeHtml(p.title)}">
                <div class="list-content">
                    <div class="list-title">${escapeHtml(p.title)}</div>
                    <div class="list-meta"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.location)}</div>
                </div>
                <div class="list-price">${escapeHtml(p.price)}</div>
            </div>
        `).join('');
    }
}

// small helper to avoid injection if any dynamic content ever comes from external source
function escapeHtml(text){
    if(!text && text !== 0) return '';
    return String(text).replace(/[&<>"'`=\/]/g, function (s) {
        return ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
        })[s];
    });
}

// 4.b RENDER CRM
function di_renderCRM() {
    const container = document.getElementById('crm-list');
    if(!container) return;
    container.innerHTML = MOCK_LEADS.map(l => `
        <div class="list-item" style="border-left: 3px solid var(--secondary);">
            <div class="list-thumb" style="width:60px;height:60px;border-radius:12px;background:#333;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;">
                ${escapeHtml((l.name||'')[0]||'')}
            </div>
            <div class="list-content">
                <div class="list-title">${escapeHtml(l.name)}</div>
                <div class="list-meta" style="color:var(--success)">${escapeHtml(l.status)}</div>
            </div>
            <div style="text-align:right">
                <div class="list-price">${escapeHtml(l.value)}</div>
                <div class="list-meta">${escapeHtml(l.time)}</div>
            </div>
        </div>
    `).join('');
}

// 5. NAVEGAÇÃO
function di_navTo(viewId, el) {
    di_haptic();
    
    // Hide all views
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    // Show target view (defensive)
    const target = document.getElementById(`view-${viewId}`);
    if(target) target.classList.add('active');

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
        const reply = data.choices?.[0]?.message?.content || "Sem resposta da IA.";
        
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
    try { localStorage.setItem('di_solarMode', MEMORY.solar); } catch(e){}
    const solarIcon = document.getElementById('solar-icon');
    if(solarIcon) solarIcon.className = isDay ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    di_haptic();
}

function di_haptic() {
    if(window.navigator.vibrate) window.navigator.vibrate(10);
}

function di_saveConfig() {
    const keyEl = document.getElementById('input-api-key');
    const modelEl = document.getElementById('input-model');
    const key = keyEl ? keyEl.value : '';
    const model = modelEl ? modelEl.value : '';
    try {
        localStorage.setItem('di_apiKey', key);
        localStorage.setItem('di_modelName', model);
    } catch(e){}
    MEMORY = di_loadConfig(); // Reload
    alert("Conexão Neural Salva!");
    di_init();
}

function di_saveIdentity() {
    const userEl = document.getElementById('input-user-name');
    const infoEl = document.getElementById('input-infodose');
    const user = userEl ? userEl.value : '';
    const info = infoEl ? infoEl.value : '';
    try {
        localStorage.setItem('di_userName', user);
        localStorage.setItem('di_infodoseName', info);
    } catch(e){}
    MEMORY = di_loadConfig(); // Reload
    alert("Identidade Atualizada!");
    di_init();
}

// Boot
window.onload = di_init;
