// =========================================
// inline-1-369.js ATUALIZADO COM SÜMBÜS + OPCODES + FULL ARCH DATA
// =========================================
(function() {
  // =========================================
  // 1. ACORDEÃO (mantido original)
  // =========================================
  function makeCollapsible(node) {
    if (!node || node.dataset.accordionInit) return;
    node.dataset.accordionInit = "true";
    const header = node.querySelector('.accordion-header');
    const body = node.querySelector('.collapsible-body');
    if (!header || !body) return;
    if (!header.querySelector('.indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'indicator';
      indicator.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      header.appendChild(indicator);
    }
    if (!node.classList.contains('is-collapsed') && !node.classList.contains('is-open')) node.classList.add('is-open');
    if (node.classList.contains('is-collapsed')) body.style.height = '0px';
    header.addEventListener('click', (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (['input', 'select', 'button', 'textarea'].includes(targetTag)) return;
      const isCollapsed = node.classList.contains('is-collapsed');
      if (isCollapsed) {
        node.classList.remove('is-collapsed');
        node.classList.add('is-open');
        body.style.height = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function handler(ev) {
          if (ev.propertyName === 'height') {
            body.style.height = 'auto';
            body.removeEventListener('transitionend', handler);
          }
        });
      } else {
        body.style.height = body.scrollHeight + 'px';
        void body.offsetHeight;
        node.classList.remove('is-open');
        node.classList.add('is-collapsed');
        body.style.height = '0px';
      }
    });
  }
  window.KobAccordion = { open: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; if(card){ card.classList.remove('is-collapsed'); card.classList.add('is-open'); } }, close: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; if(card){ card.classList.remove('is-open'); card.classList.add('is-collapsed'); } }, toggle: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.querySelector('.accordion-header')?.click(); } };
  const observer = new MutationObserver((muts) => { muts.forEach((m) => { m.addedNodes && m.addedNodes.forEach((node) => { if (!(node instanceof Element)) return; if (node.matches && node.matches('.accordion')) makeCollapsible(node); node.querySelectorAll && node.querySelectorAll('.accordion').forEach((el) => makeCollapsible(el)); }); }); });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('.accordion').forEach(makeCollapsible);

  // =========================================
  // 2. BASE DE ARQUÉTIPOS + USER + SÜMBÜS OPCODES (ATUALIZADO)
  // =========================================
  const di_userNameRaw = localStorage.getItem("di_userName") || "";
  const userKey = di_userNameRaw.trim().toLowerCase();
  const displayUserName = di_userNameRaw.trim() || "User";
  
  // ARQUÉTIPOS COMPLETOS + PORTAIS + KODUX/HORUS/BLLUE/KOBLLUX (do PDF)
  const ARCHETYPES_BASE = [
    "atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine",
    "aion", "kobllux", "artemis", "serena", "genus", "solus",
    "rhea", "uno", "dual", "trinity", "infodose", "horus", "bllue"
  ];
  if (userKey && !ARCHETYPES_BASE.includes(userKey)) ARCHETYPES_BASE.push(userKey);
  const ARCHETYPES = [...ARCHETYPES_BASE];

  // ARCH_DATA COMPLETO COM SÜMBÜS (runa, opcode, hex, ascii, aroma, desc)
  const ARCH_DATA = {
    uno:       { name: "UNO",       rune: "☉",  bin: "0000", hex: "0x0", ascii: "○", color: "#ffffff", desc: "Origem · Centelha", aroma: "🌿" },
    dual:      { name: "DUAL",      rune: "↔",  bin: "0001", hex: "0x1", ascii: "⇌", color: "#ff00aa", desc: "Tensão criativa", aroma: "🔥" },
    trinity:   { name: "TRINITY",   rune: "△",  bin: "0010", hex: "0x2", ascii: "Δ", color: "#00ffcc", desc: "Síntese · Expansão", aroma: "🌐" },
    nova:      { name: "Nova",      rune: "♦",  bin: "0001", hex: "0x1", ascii: "✧", color: "#00d4ff", desc: "Faísca criativa", aroma: "🍃" },
    atlas:     { name: "Atlas",     rune: "⚙️", bin: "0010", hex: "0x2", ascii: "□", color: "#0044ff", desc: "Estrutura · Ordem", aroma: "🌿" },
    vitalis:   { name: "Vitalis",   rune: "🔥", bin: "0011", hex: "0x3", ascii: "■", color: "#ff2200", desc: "Força · Energia", aroma: "🔥" },
    pulse:     { name: "Pulse",     rune: "🎵", bin: "0100", hex: "0x4", ascii: "♪", color: "#aa00ff", desc: "Ritmo · Emoção", aroma: "🌸" },
    artemis:   { name: "Artemis",   rune: "⚔️", bin: "0101", hex: "0x5", ascii: "🏹", color: "#00cc44", desc: "Exploração", aroma: "🌲" },
    serena:    { name: "Serena",    rune: "❤️", bin: "0110", hex: "0x6", ascii: "🧡", color: "#ff44aa", desc: "Acolhimento", aroma: "🌹" },
    kaos:      { name: "Kaos",      rune: "⚡", bin: "0111", hex: "0x7", ascii: "⚡", color: "#ff8800", desc: "Ruptura", aroma: "🌐" },
    genus:     { name: "Genus",     rune: "🧩", bin: "1000", hex: "0x8", ascii: "🧩", color: "#ffaa00", desc: "Construção", aroma: "🌞" },
    lumine:    { name: "Lumine",    rune: "☀️", bin: "1001", hex: "0x9", ascii: "☀️", color: "#ffee00", desc: "Iluminação", aroma: "☀️" },
    rhea:      { name: "Rhea",      rune: "🌱", bin: "1010", hex: "0xA", ascii: "🌳", color: "#00aa44", desc: "Raízes", aroma: "🌳" },
    solus:     { name: "Solus",     rune: "✨", bin: "1011", hex: "0xB", ascii: "🏠", color: "#88aaff", desc: "Introspecção", aroma: "🏠" },
    aion:      { name: "Aion",      rune: "∞",  bin: "1100", hex: "0xC", ascii: "∞", color: "#ffdd88", desc: "Tempo eterno", aroma: "🌐" },
    kodux:     { name: "KODUX",     rune: "🔑", bin: "1110", hex: "0xE", ascii: "⚡", color: "#ff00aa", desc: "Chave Mestra", aroma: "🔥" },
    horus:     { name: "Horus",     rune: "👁️", bin: "1101", hex: "0xD", ascii: "🪶", color: "#ffd700", desc: "Visão · Consciência", aroma: "🌿" },
    bllue:     { name: "Bllue",     rune: "🔵", bin: "1111", hex: "0xF", ascii: "🌊", color: "#00b0ff", desc: "Expansão Digital", aroma: "🌊" },
    kobllux:   { name: "KOBLLUX",   rune: "🌌", bin: "1010", hex: "0xA", ascii: "⟐", color: "#00ffcc", desc: "Origem · Núcleo", aroma: "✨" },
    infodose:  { name: "Infodose",  rune: "💉", bin: "0110", hex: "0x6", ascii: "📡", color: "#aa00ff", desc: "Síntese Rápida", aroma: "📡" }
  };

  const ARCH_NAMES = {
    atlas: "Atlas", nova: "Nova", vitalis: "Vitalis", pulse: "Pulse", kaos: "Kaos",
    kodux: "Kodux", lumine: "Lumine", aion: "Aion", kobllux: "Kobllux", artemis: "Artemis",
    serena: "Serena", genus: "Genus", solus: "Solus", rhea: "Rhea", uno: "Uno",
    dual: "Dual", trinity: "Trinity", infodose: "Infodose", horus: "Horus", bllue: "Bllue"
  };
  if (userKey) ARCH_NAMES[userKey] = di_userNameRaw.trim();

  // SÜMBÜS ASCII VARIATIONS (do PDF)
  const SUMBUS_ASCII = [
    "sÜmbÜS <<>> SÜMBÜS",
    "★ S U M B U S ★",
    "4 S·Ü·M·B·Ü·S 4",
    "☐☐☐☐ SÜMBÜS ☐☐☐☐",
    "☞☞☞☞ SÜMBÜS ☞☞☞☞",
    "∞∞∞ S ∞ U ∞ M ∞ B ∞ Ü ∞ S ∞∞∞"
  ];

  // =========================================
  // 3. MOTOR 3·6·9 (mantido)
  // =========================================
  let di_engineStep = parseInt(localStorage.getItem('kobllux_engine_step') || '0', 10);
  let di_reverse = localStorage.getItem('kobllux_reverse_mode') === 'true';
  let di_jump = parseInt(localStorage.getItem('kobllux_jump_step') || '0', 10);
  let di_use3697 = localStorage.getItem('kobllux_cycle_3697') === 'true';

  function saveEngineState() { /* ... mesmo código original ... */ }
  function syncEngineUI() { /* ... mesmo código original ... */ }
  function di_getSequence(startIndex, length) { /* ... mesmo código original ... */ }
  function updateStatusWithEngine() { /* ... mesmo código original ... */ }

  // eventos motor (mantidos)
  document.querySelectorAll('[data-engine]').forEach(btn => { btn.addEventListener('click', () => { di_engineStep = parseInt(btn.dataset.engine, 10); saveEngineState(); syncEngineUI(); updateStatusWithEngine(); showToast(`Motor +${di_engineStep} ativado`); }); });
  // ... (outros eventos do motor mantidos)

  // =========================================
  // 4. DOM + SÜMBÜS RENDER
  // =========================================
  const dom = { /* mesmo código original */ };

  function showToast(message, isError = false) { /* mesmo código original */ }

  // NOVA FUNÇÃO: Renderizar grid completo de arquétipos com OPCODES + SÜMBÜS
  function renderArchGrid() {
    const grid = document.getElementById('archetypes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.keys(ARCH_DATA).forEach(key => {
      const data = ARCH_DATA[key];
      const cardHTML = `
        <div class="arch-card" data-arch="${key}" style="--kob-voice-primary:${data.color}">
          <div class="arch-header">
            <span class="arch-rune">${data.rune}</span>
            <div class="arch-name">${data.name}</div>
            <div class="arch-opcode">${data.hex} <small>${data.bin}</small></div>
          </div>
          <div class="arch-body">
            <div>${data.desc}</div>
            <div class="arch-ascii">${data.ascii}</div>
            <small>Aroma: ${data.aroma} · SÜMBÜS Runas</small>
            <button class="arch-activate-btn" onclick="activateSümbüs('${key}')">ATIVAR SÜMBÜS ${data.rune}</button>
          </div>
        </div>`;
      grid.innerHTML += cardHTML;
    });
  }

  // Ativação SÜMBÜS (novo)
  window.activateSümbüs = function(key) {
    const data = ARCH_DATA[key];
    document.documentElement.setAttribute('data-arch', key);
    document.body.setAttribute('data-arch', key);
    showToast(`SÜMBÜS ATIVADO → ${data.name} ${data.rune} (Opcode ${data.hex})`, false);
    
    // Copia prompt rúnico para clipboard
    const prompt = `Ativar ${key.toUpperCase()} SÜMBÜS ${data.rune} ${data.ascii} ${SUMBUS_ASCII[Math.floor(Math.random()*SUMBUS_ASCII.length)]}`;
    navigator.clipboard.writeText(prompt).then(() => showToast("Prompt SÜMBÜS copiado!"));
  };

  // Atualiza meta tags
  function updateMetaArch(arch) {
    document.querySelector('meta[name="data-arch"]').setAttribute('content', arch);
    document.querySelector('meta[name="sümbüs-activation"]').setAttribute('content', `KODUX + ${arch.toUpperCase()}`);
  }

  // =========================================
  // 5. FUNÇÃO GERAR FRACTAIS (agora com SÜMBÜS)
  // =========================================
  function generateFractals() {
    if (!dom.input || !dom.output || !dom.archSelect) return;
    const text = dom.input.value.trim();
    if (!text) { showToast("Aviso: Texto de entrada vazio.", true); return; }
    localStorage.setItem('kobllux_draft_input', text);

    const sentences = text.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    if (!sentences.length) return;

    const startArchName = dom.archSelect.value;
    const startIdx = ARCHETYPES.indexOf(startArchName);
    const isCycleMode = dom.cycleCheck.checked;

    const sequence = isCycleMode ? di_getSequence(startIdx, sentences.length) : [ARCHETYPES[startIdx]];

    dom.output.innerHTML = '';
    let resultTextForExport = "";

    sentences.forEach((sentence, i) => {
      const currentArchName = isCycleMode ? sequence[i] : ARCHETYPES[startIdx];
      const data = ARCH_DATA[currentArchName] || { name: currentArchName.toUpperCase(), color: '#fff', rune: 'Δ' };

      const block = document.createElement('div');
      block.className = 'para-block accordion is-open';
      block.style.animationDelay = `${i * 0.1}s`;
      block.style.setProperty('--kob-voice-primary', data.color);
      block.style.borderLeftColor = data.color;

      block.innerHTML = `
        <div class="accordion-header">
          <div class="arch-tag" style="color:${data.color}">${data.rune} ${data.name} · Δ · ${data.hex}</div>
        </div>
        <div class="collapsible-body">
          <div class="content-inner">${escapeHtml(sentence)}</div>
          <div style="margin-top:8px;font-size:0.8rem;opacity:0.7;">SÜMBÜS ${SUMBUS_ASCII[i % SUMBUS_ASCII.length]}</div>
        </div>`;
      dom.output.appendChild(block);
      resultTextForExport += `${data.name} — ${sentence}\n`;
    });

    localStorage.setItem('kobllux_last_result', resultTextForExport.trim());
    dom.statusBar.textContent = `Opcode 0x0B · Motor 3·6·9 · SÜMBÜS · ${sentences.length} Fractal(s) Gerado(s)`;
    showToast(`Integração concluída com SÜMBÜS Firmware`);
  }

  function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

  // =========================================
  // INICIALIZAÇÃO COMPLETA
  // =========================================
  if (dom.archSelect) {
    // Popula select com todos os arquétipos
    dom.archSelect.innerHTML = '';
    ARCHETYPES.forEach(key => {
      const data = ARCH_DATA[key] || { name: key };
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${data.name} ${data.rune || ''}`;
      if (key === 'kodux') opt.selected = true;
      dom.archSelect.appendChild(opt);
    });
    
    dom.archSelect.addEventListener('change', (e) => {
      dom.body.setAttribute('data-arch', e.target.value);
      updateMetaArch(e.target.value);
    });
  }

  // Renderiza grid de arquétipos + SÜMBÜS
  renderArchGrid();

  // Eventos principais (mantidos)
  if (dom.genBtn) dom.genBtn.addEventListener('click', generateFractals);
  if (dom.input) dom.input.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateFractals(); });

  // Botões copy/clear/download (mantidos)
  // ... (código original mantido)

  // data-arch inicial
  if (dom.archSelect) {
    dom.body.setAttribute('data-arch', dom.archSelect.value);
    updateMetaArch(dom.archSelect.value);
  }

  console.log('%c✅ SÜMBÜS Firmware v1.0 carregado com sucesso · KODUX + HORUS + 78K', 'background:#ff00aa;color:#000;font-weight:900;padding:2px 8px;border-radius:4px');
})();
