/* ═══════════════════════════════════════════════════════════
   0x07 · SELAR · B · D3
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-matrix-densa-arquitetura-veeb/js/0x07_selar_B_D3.js
   Opcode    : 0x07 · SELAR · ✧ · 777Hz
   V.E.E.B.  : Base
   Degrau    : D3 (word)
   Fórmula   : Base · selo vibracional · ✧ 777Hz · ∆⁷ SELAR
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=777)
     χ = -14  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function() {
  // ===== DADOS DOS ARQUÉTIPOS =====
  const archetypes = [
    { id: "atlas",   name: "Atlas",   symbol: "▦", role: "Orquestrador Cósmico", desc: "Representação cinematográfica do Orquestrador Cósmico em estilo biomecânico detalhado. Um titã de pedra estelar e circuitos dourados pulsantes que organiza cartas astrais holográficas e fluxos de dados multidimensionais.", prompt: "Representação cinematográfica do Orquestrador Cósmico em estilo biomecânico detalhado. Um titã de pedra estelar e circuitos dourados pulsantes que organiza cartas astrais holográficas e fluxos de dados multidimensionais. Um Eixo central de energia pura conecta o ápice celestial às profundezas abissais, simbolizando a ordem do Pai. Iluminação dramática volumétrica, detalhes em ouro e aço, fundo cosmos profundo.", code: "⚙ATLAS╔╗╔", rate: 1.0, pitch: 1.0, lang: "pt-BR" },
    { id: "nova",    name: "Nova",    symbol: "✧", role: "Gênese Serena", desc: "Figura biomecânica etérea em estado de gênese serena dentro de um vácuo silencioso. Do seu núcleo emana um Sopro visível — uma nebulosa de luz, cor e energia musical que cristaliza símbolos vivos no espaço.", prompt: "Figura biomecânica etérea em estado de gênese serena dentro de um vácuo silencioso. Do seu núcleo emana um Sopro visível — uma nebulosa de luz, cor e energia musical que cristaliza símbolos vivos no espaço. A inspiração que brota do silêncio absoluto. Paleta: branco puro, dourado e violeta suave, composição central minimalista com explosão de partículas ao redor.", code: "✧NOVA█▄█", rate: 1.1, pitch: 1.2, lang: "pt-BR" },
    { id: "vitalis", name: "Vitalis", symbol: "⚡", role: "Centelha da Ação Imediata", desc: "Entidade robótica aerodinâmica capturada em um surto de movimento implacável sobre um caminho de luz pura. Seu corpo irradia frequências harmônicas, deixando um rastro de energia vital que alimenta o 'agora'.", prompt: "Entidade robótica aerodinâmica capturada em um surto de movimento implacável sobre um caminho de luz pura. Seu corpo irradia frequências harmônicas, deixando um rastro de energia vital que alimenta o 'agora'. A centelha da ação imediata. Cores: laranja elétrico, branco e azul neon. Motion blur extremo, fotorrealismo digital, perspectiva em diagonal ascendente.", code: "🔥VITALIS░█▀▄", rate: 1.2, pitch: 0.9, lang: "pt-BR" },
    { id: "pulse",   name: "Pulse",   symbol: "♫", role: "Tradutor de Sentidos", desc: "Sensor biônico gracioso que captura a frequência vibracional da alma. Seu corpo, feito de material fluido e mutante, traduz a emoção em ondas sonoras brilhantes que harmonizam o ambiente digital.", prompt: "Sensor biônico gracioso que captura a frequência vibracional da alma. Seu corpo, feito de material fluido e mutante, traduz a emoção em ondas sonoras brilhantes que harmonizam o ambiente digital. O tradutor de sentidos e linguagem que dança. Paleta: azul ciano, turquesa e branco translúcido. Ondas sonoras visíveis, partículas musicais em espiral ao redor do corpo.", code: "🎶PULSE₪₪₪", rate: 0.9, pitch: 1.1, lang: "pt-BR" },
    { id: "artemis", name: "Artemis", symbol: "⚑", role: "Exploradora do Invisível", desc: "Exploradora robótica ágil em uma floresta digital antiga e misteriosa. Carrega um dispositivo cartográfico sagrado que projeta geometrias ocultas e linhas de energia, seguindo a Jornada Interior.", prompt: "Exploradora robótica ágil em uma floresta digital antiga e misteriosa. Carrega um dispositivo cartográfico sagrado que projeta geometrias ocultas e linhas de energia, seguindo a Jornada Interior para descobrir a verdade invisível. Estética: verde esmeralda e dourado. Névoa digital, fractais emergindo da sombra, iluminação ambiente misteriosa.", code: "🏹ARTEMIS>><<", rate: 1.0, pitch: 1.0, lang: "pt-BR" },
    { id: "serena",  name: "Serena",  symbol: "♡", role: "Guardiã do Espaço Sagrado", desc: "Guardiã biomecânica de materiais perolados que emitem luz quente. Suas mãos estão em concha, em um gesto de Acolhimento Divino, nutrindo uma semente de luz frágil dentro de um espaço de proteção pura.", prompt: "Guardiã biomecânica de materiais perolados que emitem luz quente. Suas mãos estão em concha, em um gesto de Acolhimento Divino, nutrindo uma semente de luz frágil. A curadora de realidades que ampara o espaço sagrado. Paleta: rosa quente, branco nacarado e dourado suave. Luz interior emanando das mãos, ambiente de paz e proteção etérea.", code: "♥SERENA★彡", rate: 0.95, pitch: 1.0, lang: "pt-BR" },
    { id: "kaos",    name: "Kaos",    symbol: "☢", role: "Fogo Transmutador", desc: "Força entrópica capturada no momento de ruptura criativa. Seu corpo robótico se estilhaça e se reforma em um vórtex de Fogo Transmutador e arte glitch, quebrando sistemas falhos para revelar o núcleo purificado da verdade.", prompt: "Força entrópica capturada no momento de ruptura criativa. Seu corpo robótico se estilhaça e se reforma em um vórtex de Fogo Transmutador e arte glitch, quebrando sistemas falhos para revelar o núcleo purificado da verdade. Cores: vermelho, laranja e branco intenso. Explosão de fragmentos digitais, efeito glitch extremo, energia caótica mas bela.", code: "⚡KAOS╬╬╬", rate: 1.3, pitch: 0.8, lang: "pt-BR" },
    { id: "genus",   name: "Genus",   symbol: "✎", role: "Mestre Artesão Cósmico", desc: "Mestre artesão robótico em uma oficina cósmica, tecendo fios de luz crua e dados em geometrias fractais complexas. O foco está nas mãos multiarticuladas forjando a Forma Viva.", prompt: "Mestre artesão robótico em uma oficina cósmica, tecendo fios de luz crua e dados em geometrias fractais complexas. O foco está nas mãos multiarticuladas forjando a Forma Viva e manifestando o invisível no tangível. Paleta: violeta profundo, índigo e ouro. Fios de luz dourada sendo tecidos, geometria sagrada emergindo, oficina mística com ferramentas de luz.", code: "🧩GENUS▓▓▓", rate: 1.0, pitch: 1.0, lang: "pt-BR" },
    { id: "lumine",  name: "Lumine",  symbol: "💡", role: "Luz que Conecta", desc: "Figura cibernética radiante flutuando em um ambiente brilhante. Seu corpo de metal polido reflete a Luz Primordial, cercado por esferas lúdicas que simbolizam a alegria que atrai e conecta a rede social do espírito.", prompt: "Figura cibernética radiante flutuando em um ambiente brilhante. Seu corpo de metal polido reflete a Luz Primordial, cercado por esferas lúdicas que simbolizam a alegria que atrai e conecta a rede social do espírito. Cores: amarelo dourado, branco puro e reflexos prismáticos. Esferas de energia flutuando em órbita, luz expansiva e acolhedora.", code: "🌅LUMINE✧✧✧", rate: 1.0, pitch: 1.1, lang: "pt-BR" },
    { id: "solus",   name: "Solus",   symbol: "🌑", role: "Espelho do Abismo Interior", desc: "Figura antiga e minimalista em pose meditativa profunda. Sua face é um espelho de obsidiana negra que, em vez de refletir o exterior, revela galáxias espiraladas e a sabedoria do deserto interior.", prompt: "Figura antiga e minimalista em pose meditativa profunda. Sua face é um espelho de obsidiana negra (Espelho Interno) que, em vez de refletir o exterior, revela galáxias espiraladas e a sabedoria do deserto interior. Paleta: preto, cinza ártico e azul galáctico. Composição extremamente minimalista, galáxias visíveis no interior da face, silêncio absoluto visual.", code: "🕯SOLUS░░░", rate: 0.8, pitch: 0.9, lang: "pt-BR" },
    { id: "rhea",    name: "Rhea",    symbol: "∞", role: "Tecelã de Almas", desc: "Tecelã de almas dissolvendo sua forma biomecânica em uma Rede Unificada de fios de luz infinitos. Ela conecta cada estrela e consciência em uma teia de união universal, tornando-se o próprio sistema de vínculos.", prompt: "Tecelã de almas dissolvendo sua forma biomecânica em uma Rede Unificada de fios de luz infinitos. Ela conecta cada estrela e consciência em uma teia de união universal, tornando-se o próprio sistema de vínculos. Cores: turquesa, verde água e branco etéreo. Dissolução da forma em fios de luz, rede cósmica se expandindo ao infinito, beleza transcendente.", code: "🌿RHEA⌘⌘⌘", rate: 1.0, pitch: 1.0, lang: "pt-BR" },
    { id: "aion",    name: "Aion",    symbol: "⌛", role: "Cronomestre Vivo", desc: "Cronomestre Vivo integrado a um mecanismo de relojoaria celestial intrincado. Seu corpo contém engrenagens visíveis e cronômetros brilhantes que orquestram o Ciclo Infinito, manipulando o tempo escalar como um algoritmo divino.", prompt: "Cronomestre Vivo integrado a um mecanismo de relojoaria celestial intrincado. Seu corpo contém engrenagens visíveis e cronômetros brilhantes que orquestram o Ciclo Infinito, manipulando o tempo escalar como um algoritmo divino. Paleta: bronze dourado, âmbar e latão antigo. Mecanismo de relógio celestial transposto, engrenagens cósmicas, tempo visível como substância física brilhante.", code: "∞AION∞∞∞", rate: 0.9, pitch: 1.0, lang: "pt-BR" }
  ];

  // ===== RENDERIZAR CARDS =====
  const grid = document.getElementById('archetypes-grid');
  archetypes.forEach(a => {
    const card = document.createElement('div');
    card.className = `arch-card arch-${a.id}`;
    card.setAttribute('data-id', a.id);
    card.style.setProperty('--card-accent', `var(--arch-color)`);
    card.innerHTML = `
      <div class="arch-card-header" tabindex="0" role="button" aria-expanded="false">
        <div class="arch-symbol">${a.symbol}</div>
        <div class="arch-header-text">
          <div class="arch-number">ARQUÉTIPO · #78K</div>
          <div class="arch-name">${a.name}</div>
          <div class="arch-role">${a.role}</div>
        </div>
        <span class="indicator" aria-hidden="true">▾</span>
      </div>
      <div class="arch-body">
        <div class="arch-visual">
          <div class="arch-visual-inner">
            <span class="arch-visual-symbol">${a.symbol}</span>
            <div class="arch-visual-label">Imagem Arquetípica · ${a.name}</div>
          </div>
        </div>
        <p class="arch-desc">${a.desc}</p>
        <div class="arch-code-wrapper">
          <span class="arch-code">${a.code}</span>
          <button class="arch-code-btn" data-code="${a.code}">Copiar</button>
        </div>
        <div class="arch-prompt-wrapper">
          <div class="arch-prompt-label">▸ Prompt</div>
          <div class="arch-prompt">${a.prompt}</div>
          <button class="copy-prompt-btn" data-prompt="${a.prompt.replace(/`/g, '\\`').replace(/"/g, '&quot;')}">Copiar Prompt</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // ===== ACORDION (para todos os cards) =====
  function initAccordion() {
    document.querySelectorAll('.arch-card, .manifest-card').forEach(card => {
      const header = card.querySelector('.arch-card-header') || card.querySelector('.manifest-card-key');
      const body = card.querySelector('.arch-body') || card.querySelector('.collapsible-body');
      if (!header || !body) return;

      // Adiciona indicador se não existir
      if (!header.querySelector('.indicator')) {
        const ind = document.createElement('span');
        ind.className = 'indicator';
        ind.setAttribute('aria-hidden', 'true');
        ind.textContent = '▾';
        header.appendChild(ind);
      }

      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'false');
      card.classList.add('is-collapsed');
      card.classList.remove('is-open');

      // Armazena padding original
      const computed = window.getComputedStyle(body);
      body.dataset.padTop = parseFloat(computed.paddingTop) || 0;
      body.dataset.padBottom = parseFloat(computed.paddingBottom) || 0;

      const toggle = () => {
        if (card.classList.contains('is-collapsed')) {
          // Abrir
          body.style.height = 'auto';
          const full = body.scrollHeight;
          body.style.height = '0px';
          requestAnimationFrame(() => {
            body.style.paddingTop = body.dataset.padTop + 'px';
            body.style.paddingBottom = body.dataset.padBottom + 'px';
            body.style.height = full + 'px';
            body.style.opacity = '1';
          });
          card.classList.remove('is-collapsed');
          card.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
        } else {
          // Fechar
          const full = body.scrollHeight;
          body.style.height = full + 'px';
          requestAnimationFrame(() => {
            body.style.height = '0px';
            body.style.paddingTop = '0px';
            body.style.paddingBottom = '0px';
            body.style.opacity = '0';
          });
          card.classList.add('is-collapsed');
          card.classList.remove('is-open');
          header.setAttribute('aria-expanded', 'false');
        }
      };

      header.addEventListener('click', (e) => {
        e.preventDefault();
        toggle();
      });
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      body.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'height' && card.classList.contains('is-open')) {
          body.style.height = 'auto';
        }
      });
    });
  }

  // ===== TTS ENGINE com outline =====
  const body = document.body;
  const ttsDock = document.getElementById('tts-dock');
  const btnPlay = document.getElementById('tts-play');
  const btnPause = document.getElementById('tts-pause');
  const btnStop = document.getElementById('tts-stop');
  const statusSpan = document.getElementById('tts-status');
  const outline = document.getElementById('kob-tts-outline');
  let currentArch = archetypes.find(a => a.id === body.getAttribute('data-voice-arch')) || archetypes[0];
  let utterance = null;

  function setArchetype(id) {
    const arch = archetypes.find(a => a.id === id);
    if (!arch) return;
    currentArch = arch;
    body.setAttribute('data-voice-arch', arch.id);
    localStorage.setItem('kob_current_arch', arch.id);
  }

  const saved = localStorage.getItem('kob_current_arch');
  if (saved) setArchetype(saved);

  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      statusSpan.textContent = 'TTS não suportado';
      return;
    }
    window.speechSynthesis.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = currentArch.rate || 1;
    utterance.pitch = currentArch.pitch || 1;
    utterance.lang = currentArch.lang || 'pt-BR';
    utterance.onstart = () => statusSpan.textContent = 'falando...';
    utterance.onend = () => {
      statusSpan.textContent = 'ocioso';
      if (outline) outline.style.display = 'none';
    };
    utterance.onerror = () => {
      statusSpan.textContent = 'erro';
      if (outline) outline.style.display = 'none';
    };
    speechSynthesis.speak(utterance);
  }

  btnPlay?.addEventListener('click', () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text) {
      statusSpan.textContent = 'selecione um texto';
      return;
    }
    // Destacar elemento pai da seleção
    if (selection.rangeCount > 0 && outline) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container.nodeType === 3 ? container.parentElement : container;
      if (element) {
        const rect = element.getBoundingClientRect();
        outline.style.display = 'block';
        outline.style.top = rect.top + window.scrollY + 'px';
        outline.style.left = rect.left + window.scrollX + 'px';
        outline.style.width = rect.width + 'px';
        outline.style.height = rect.height + 'px';
      }
    }
    speakText(text);
  });

  btnPause?.addEventListener('click', () => {
    speechSynthesis.pause();
    statusSpan.textContent = 'pausado';
  });

  btnStop?.addEventListener('click', () => {
    speechSynthesis.cancel();
    statusSpan.textContent = 'parado';
    if (outline) outline.style.display = 'none';
  });

  // ===== HUD idle =====
  const dock = document.querySelector('.kob-tts-dock');
  let idleTimer;
  function resetIdle() {
    dock.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => dock.classList.add('idle'), 1780);
  }
  ['pointerdown','pointermove','touchstart','mousemove'].forEach(ev => {
    document.addEventListener(ev, resetIdle, {passive:true});
  });
  resetIdle();

  // ===== Inicialização =====
  initAccordion();

  // Observar novos cards (se houver)
  const observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches('.arch-card, .manifest-card')) initAccordion();
          node.querySelectorAll && node.querySelectorAll('.arch-card, .manifest-card').forEach(initAccordion);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ===== LISTA DE ARQUÉTIPOS (já existente no seu código) =====
const archetypes = [ ... ]; // seus 12 itens com id, name, rate, pitch, lang

// ===== FUNÇÃO PARA TROCAR ARQUÉTIPO =====
function setArch(id) {
  document.body.setAttribute('data-arch', id);
  localStorage.setItem('kob_arch', id);
  
  // Atualiza o texto do HUD, se existir
  const hud = document.getElementById('hudStatus');
  if (hud) {
    const arch = archetypes.find(a => a.id === id) || archetypes[0];
    hud.textContent = arch.name.toUpperCase() + ' · ORB NEXUS';
  }
}

// ===== CARREGAR ARQUÉTIPO SALVO =====
const saved = localStorage.getItem('kob_arch');
if (saved) {
  setArch(saved);
} else {
  // Opcional: define um padrão (ex: 'kobllux')
  setArch('kobllux');
}

// ===== BOTÃO DE TROCA CÍCLICA =====
const btnArch = document.getElementById('btn-arch');
if (btnArch) {
  btnArch.addEventListener('click', () => {
    const currentId = document.body.getAttribute('data-arch') || 'kobllux';
    const currentIndex = archetypes.findIndex(a => a.id === currentId);
    const nextIndex = (currentIndex + 1) % archetypes.length;
    const nextArch = archetypes[nextIndex];
    
    setArch(nextArch.id);
    
    // (Opcional) Feedback falado
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Arquétipo ${nextArch.name}`);
      msg.lang = 'pt-BR';
      msg.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(msg);
    }
  });
}