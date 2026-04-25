// hero-card-light.js
// INJETA Hero Card SEM quebrar seus módulos existentes

(function() {
    // Espera o catálogo carregar
    const waitForCatalog = setInterval(() => {
        if (window.catalogo78Frames && window.catalogo78Frames.length) {
            clearInterval(waitForCatalog);
            initHeroCard();
        }
    }, 100);

    function initHeroCard() {
        const root = document.getElementById('app-root');
        if (!root) return;
        
        // Preserva referência ao catálogo original
        const frames = window.catalogo78Frames;
        
        // Cria HTML do Hero Card (preservando a mesma estrutura)
        root.innerHTML = `
            <div class="hero-card" data-hero-instance>
                <div class="hero-card__frame">
                    <img src="${frames[0].img || frames[0].image}" id="heroCardImg">
                    <button class="hero-card__pill" id="infodosePill">💊</button>
                </div>
                <div class="infodose-layer" id="infodoseLayer">
                    <h4>🌀 Síntese do Loop</h4>
                    <p id="diSintese">${frames[0].sintese || frames[0].loop || ''}</p>
                    <h4>⚡ Engenharia Cognitiva</h4>
                    <p id="diEngenharia">${frames[0].engenharia || frames[0].cognitiva || ''}</p>
                </div>
            </div>
        `;
        
        // CORREÇÃO DO BACKGROUND (seu bug)
        loadAndFixBackground();
        
        // Eventos
        attachHeroEvents();
    }
    
    function loadAndFixBackground() {
        // Lê do localStorage e aplica na #bg-layer-fixed
        const url = localStorage.getItem('di_bg_url');
        const opacity = localStorage.getItem('di_bg_opacity') || '0.15';
        if (url) {
            const bgLayer = document.getElementById('bg-layer-fixed');
            if (bgLayer) {
                bgLayer.style.backgroundImage = `url(${url})`;
                bgLayer.style.opacity = opacity;
                document.body.classList.add('di-bg-active');
            }
        }
    }
    
    function attachHeroEvents() {
        // ... seus eventos de clique, expansão, etc.
    }
})();