/**
 * DUAL // UNIFIED · OS
 * KOBLLUX GLUE + FRACTAL MATRIX + ACCORDION + DRAG HUD
 * Monolith Version v1.0
 */
(function(){
  'use strict';
  if(window.__KOBLLUX_MONOLITH_FIXED_INIT__) { console.log('KOBLLUX fixed already init'); return; }
  window.__KOBLLUX_MONOLITH_FIXED_INIT__ = true;

  /* -----------------------------
     Identity / User Context
     ----------------------------- */
  const di_userName = (localStorage.getItem("di_userName") || "").trim();
  const userName = di_userName || "Viajante";
  const userKey = userName.toLowerCase();

  /* -----------------------------
     DOM helpers & toast
     ----------------------------- */
  const $ = (q,r=document)=> r && r.querySelector ? r.querySelector(q) : null;
  const $$ = (q,r=document)=> r && r.querySelectorAll ? [...r.querySelectorAll(q)] : [];
  
  function toast(msg, ms=1400){
    const toastEl = $('#kx_toast');
    if(!toastEl){ console.log('KOBLLUX.toast:', msg); return; }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toastEl.style.opacity='0', ms);
  }

  function showToastApp(message) {
    const container = document.getElementById('toast-container');
    if(!container) return toast(message); // fallback
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    const currentColor = getComputedStyle(document.body).getPropertyValue('--kob-voice-primary').trim() || '#06B6D4';
    t.style.background = currentColor;
    container.appendChild(t);
    setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 3000);
  }

  /* -----------------------------
     Voice Archetypes Registry
     ----------------------------- */
  const ARCHETYPES = [
    { id:'kobllux', name:'KOBLLUX', voice:'Luciana',   lang:'pt-BR', rate:0.98, pitch:0.48, color:'#22D3EE' },
    { id:'kodux',   name:'KODUX',   voice:'Luciana',   lang:'pt-BR', rate:0.86, pitch:0.68, color:'#F97316' },
    { id:'atlas',   name:'ATLAS',   voice:'Reed',      lang:'en-US', rate:1.00, pitch:0.93, color:'#38BDF8' },
    { id:'nova',    name:'NOVA',    voice:'Luciana',   lang:'pt-BR', rate:1.06, pitch:1.34, color:'#F97316' },
    { id:'vitalis', name:'VITALIS', voice:'Rocko',     lang:'pt-BR', rate:0.96, pitch:1.42, color:'#22C55E' },
    { id:'pulse',   name:'PULSE',   voice:'Reed',      lang:'pt-BR', rate:1.00, pitch:1.14, color:'#EC4899' },
    { id:'artemis', name:'ARTEMIS', voice:'Paulina',   lang:'es-MX', rate:1.00, pitch:1.23, color:'#A855F7' },
    { id:'serena',  name:'SERENA',  voice:'Joana',     lang:'pt-BR', rate:0.92, pitch:0.90, color:'#38BDF8' },
    { id:'kaos',    name:'KAOS',    voice:'Rocko',     lang:'pt-BR', rate:1.09, pitch:1.28, color:'#FACC15' },
    { id:'genus',   name:'GENUS',   voice:'Reed',      lang:'pt-BR', rate:0.98, pitch:1.23, color:'#E5E7EB' },
    { id:'lumine',  name:'LUMINE',  voice:'Flo',       lang:'fr-FR', rate:1.03, pitch:1.55, color:'#FDE047' },
    { id:'solus',   name:'SOLUS',   voice:'Satu',      lang:'fi-FI', rate:0.96, pitch:0.87, color:'#0EA5E9' },
    { id:'rhea',    name:'RHEA',    voice:'Alice',     lang:'it-IT', rate:1.02, pitch:0.59, color:'#22C55E' },
    { id:'aion',    name:'AION',    voice:'Monica',    lang:'es-ES', rate:0.88, pitch:0.30, color:'#4F46E5' },
    { id:'uno',     name:'UNO',     voice:'Grandma',   lang:'en-US', rate:0.90, pitch:0.93, color:'#F97316' },
    { id:'dual',    name:'DUAL',    voice:'Milena',    lang:'ru-RU', rate:1.02, pitch:1.02, color:'#06B6D4' },
    { id:'trinity', name:'TRINITY', voice:'Sandy',     lang:'en-US', rate:1.04, pitch:1.04, color:'#EC4899' },
    { id:'infodose',name:'INFODOSE',voice:'Luciana',   lang:'pt-BR', rate:1.06, pitch:0.96, color:'#22C55E' },
    { id:'horus',   name:'HORUS',   voice:'Majed',     lang:'ar-001',rate:0.94, pitch:0.82, color:'#F59E0B' }
  ];

  // Injetar núcleo do usuário dinamicamente
  if (userKey && !ARCHETYPES.find(a => a.id === userKey)) {
    ARCHETYPES.push({ id: userKey, name: userName.toUpperCase(), voice: 'Luciana', lang: 'pt-BR', rate: 1.0, pitch: 1.0, color: '#06B6D4' });
  }

  // Lista sequencial para o gerador de fractais
  const FRACTAL_ARCH_IDS = [
    "atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine", "aion",
    "kobllux", "artemis", "serena", "genus", "solus", "rhea", "uno", "dual",
    "trinity", "infodose", "horus", "bllue"
  ];
  if (userKey && !FRACTAL_ARCH_IDS.includes(userKey)) FRACTAL_ARCH_IDS.push(userKey);

  /* -----------------------------
     TTS Engine & State
     ----------------------------- */
  let state = {
    archIdx: 0,
    isSpeaking: false,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  const StorageSafe = {
    get(k,d=null){ try{ const v = localStorage.getItem('kob_tts::v1::'+k); return v==null? d : JSON.parse(v); }catch{return d} },
    set(k,v){ try{ localStorage.setItem('kob_tts::v1::'+k, JSON.stringify(v)); }catch{} }
  };

  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if(!synth) console.warn('SpeechSynthesis não disponível');

  let outline = null; // Criado on-demand para evitar sujeira no DOM se não usado
  
  function getOutline() {
    if(outline) return outline;
    outline = $('#kob-tts-outline');
    if(!outline) {
      outline = document.createElement('div');
      outline.id = 'kob-tts-outline';
      outline.style.position = 'absolute';
      outline.style.pointerEvents = 'none';
      outline.style.display = 'none';
      const content = document.querySelector('.content') || document.body;
      content.appendChild(outline);
    }
    return outline;
  }

  /* -----------------------------
     Archetype UI Updater
     ----------------------------- */
  function hexToRgba(hex,a){ const c=(hex||'#000').replace('#',''); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16); return `rgba(${r},${g},${b},${a})`; }

  function updateArchetype(idx){
    state.archIdx = (typeof idx === 'number') ? (idx % ARCHETYPES.length) : 0;
    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0];

    try{
      if(window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.applyVoiceTheme === 'function'){
        window.KOBLLUX_VOICE_ENGINE.applyVoiceTheme(Object.assign({}, arch, { id: arch.id }));
      } else {
        const primary = arch.color || '#00f5ff';
        const soft = hexToRgba(primary, 0.14);
        document.documentElement.style.setProperty('--kob-voice-primary', primary);
        document.documentElement.style.setProperty('--kob-voice-secondary', primary);
        document.documentElement.style.setProperty('--kob-voice-bg-soft', soft);
        document.documentElement.style.setProperty('--kob-voice-outline', hexToRgba(primary, 0.28));
        if(document.body) document.body.setAttribute('data-voice-arch', arch.id);
      }
      const hudStatus = $('#hudStatus');
      if(hudStatus) hudStatus.textContent = arch.name;
    }catch(e){}

    try{
      const out = getOutline();
      if(out){
        const primary = arch.color || '#00f5ff';
        out.style.borderColor = primary;
        out.style.boxShadow = `0 0 12px ${hexToRgba(primary,0.45)}, inset 0 0 8px ${hexToRgba(primary,0.2)}`;
        out.style.background = hexToRgba(primary,0.06);
      }
    }catch(e){}

    if(state.isSpeaking){ stopSpeech(); startSpeech(); }
  }

  /* -----------------------------
     DOM Scanning & Highlighting
     ----------------------------- */
  function scanBlocks(){
    const root = $('#root') || document.body;
    const frame = $('#content-frame') || $('#frame') || document.querySelector('iframe');
    
    try{
      const sel = 'h1,h2,h3,p,li,blockquote,pre,td,th';
      if(frame && frame.contentWindow){
        const doc = frame.contentDocument || frame.contentWindow.document;
        const nodes = [...doc.querySelectorAll(sel)].filter(n=> (n.innerText||'').trim().length > 0);
        if(nodes.length){ state.blocks = nodes; state.currentBlockIdx = 0; return; }
      }
    }catch(e){}

    const localNodes = [...(root.querySelectorAll ? root.querySelectorAll('h1,h2,h3,p,li,blockquote,pre,td,th, .content-inner') : [])].filter(n=> (n.innerText||'').trim().length > 0);
    state.blocks = localNodes;
    state.currentBlockIdx = 0;
  }

  function rebuildBlocks(){ scanBlocks(); setStatus(); }
  
  function setStatus(){ 
    const el = $('#tts-status'); 
    if(!el) return; 
    if(!state.blocks.length) el.textContent='0/0'; 
    else el.textContent = `${Math.min(state.currentBlockIdx+1, state.blocks.length)}/${state.blocks.length}`; 
  }

  function showOutlineFor(node){
    const out = getOutline();
    if(!out || !node){ out.style.display='none'; return; }
    try{
      const rect = node.getBoundingClientRect();
      const frame = $('#content-frame') || $('#frame') || document.querySelector('iframe');
      if(node.ownerDocument !== document && frame){
        const fRect = frame.getBoundingClientRect();
        out.style.left = (fRect.left + rect.left) + 'px';
        out.style.top = (fRect.top + rect.top) + 'px';
      } else {
        out.style.left = (rect.left + window.scrollX) + 'px';
        out.style.top = (rect.top + window.scrollY) + 'px';
      }
      out.style.width = (rect.width + 8) + 'px';
      out.style.height = (rect.height + 8) + 'px';
      out.style.display = 'block';
    }catch(e){ out.style.display = 'none'; }
  }
  
  function hideOutline(){ const out = getOutline(); if(out) out.style.display = 'none'; }

  function findVoiceByNamePart(part){
    if(!synth) return null;
    const voices = synth.getVoices()||[];
    const v = voices.find(x => x.name && x.name.toLowerCase().includes(String(part||'').toLowerCase()));
    if(v) return v;
    return voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
  }

  function speakCurrent(){
    if(!state.blocks.length) rebuildBlocks();
    if(state.currentBlockIdx >= state.blocks.length){ stopSpeech(); toast('Fim da leitura'); return; }

    const el = state.blocks[state.currentBlockIdx];
    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0];
    const txt = (el && el.innerText) ? el.innerText.trim() : '';
    if(!txt){ state.currentBlockIdx++; setStatus(); return speakCurrent(); }

    const engine = window.KOBLLUX_VOICE_ENGINE || null;
    if(engine && typeof engine.activateArchetype === 'function' && typeof engine.speakWithCurrentArchetype === 'function'){
      try{
        engine.activateArchetype(arch.id);
        const ok = engine.speakWithCurrentArchetype(txt, {
          onStart(){ showOutlineFor(el); setStatus(); },
          onEnd(){ if(state.isSpeaking){ state.currentBlockIdx++; setTimeout(speakCurrent, 120); } },
          onError(){ state.currentBlockIdx++; speakCurrent(); }
        });
        if(ok) return;
      }catch(e){}
    }

    if(!synth){ toast('TTS indisponível'); return; }
    try{ synth.cancel(); }catch(e){}
    const u = new SpeechSynthesisUtterance(txt);
    const voice = findVoiceByNamePart(arch.voice);
    if(voice) u.voice = voice;
    if(arch.lang) u.lang = arch.lang;
    u.rate = arch.rate ?? 1;
    u.pitch = arch.pitch ?? 1;
    u.onstart = () => { showOutlineFor(el); setStatus(); };
    u.onend = () => { if(state.isSpeaking){ state.currentBlockIdx++; setStatus(); setTimeout(()=> speakCurrent(), 120); } };
    u.onerror = () => { if(state.isSpeaking){ state.currentBlockIdx++; speakCurrent(); } };
    synth.speak(u);
  }

  function startSpeech(){
    if(!state.blocks.length) rebuildBlocks();
    if(!state.blocks.length){ toast('Nada para ler'); return; }
    state.isSpeaking = true;
    const BTN_PLAY = $('#btn-play');
    if(BTN_PLAY) BTN_PLAY.textContent = '■';
    speakCurrent();
  }

  function stopSpeech(){
    state.isSpeaking = false;
    try{ synth && synth.cancel(); }catch(e){}
    const BTN_PLAY = $('#btn-play');
    if(BTN_PLAY) BTN_PLAY.textContent = '▶';
    hideOutline();
    setStatus();
  }

  /* -----------------------------
     Export KOBLLUX Window API
     ----------------------------- */
  window.KOBLLUX = window.KOBLLUX || {};
  Object.assign(window.KOBLLUX, { startSpeech, stopSpeech, rebuildBlocks, updateArchetype, state, getArchetypes: () => ARCHETYPES.slice() });

  /* -----------------------------
     Accordion System
     ----------------------------- */
  function makeCollapsible(node) {
    if (node.dataset.accordionInit) return;
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

    if (!node.classList.contains('is-collapsed') && !node.classList.contains('is-open')) {
      node.classList.add('is-open'); 
    }
    if (node.classList.contains('is-collapsed')) {
      body.style.height = '0px';
    }

    header.addEventListener('click', (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      if (['input', 'select', 'button', 'textarea'].includes(targetTag)) return;

      const isCollapsed = node.classList.contains('is-collapsed');
      if (isCollapsed) {
        node.classList.remove('is-collapsed');
        node.classList.add('is-open');
        body.style.height = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'height') {
            body.style.height = 'auto';
            body.removeEventListener('transitionend', handler);
          }
        });
      } else {
        body.style.height = body.scrollHeight + 'px';
        void body.offsetHeight; // force reflow
        node.classList.remove('is-open');
        node.classList.add('is-collapsed');
        body.style.height = '0px';
      }
    });
  }

  window.KobAccordion = {
    open: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.classList.remove('is-collapsed'); card && card.classList.add('is-open'); },
    close: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.classList.remove('is-open'); card && card.classList.add('is-collapsed'); },
    toggle: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.querySelector('.accordion-header')?.click(); }
  };

  /* -----------------------------
     DOM Ready Bootloader
     ----------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    
    // Configura interface do Usuário
    const userOption = document.getElementById("diUserOption");
    if (userOption) {
      userOption.value = userKey;
      userOption.textContent = `${userName} (Usuário/Núcleo)`;
    }

    // Inicializa Accordions
    document.querySelectorAll('.accordion').forEach(makeCollapsible);

    // MutationObserver para fractais criados dinamicamente
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          if (node.matches && node.matches('.accordion')) makeCollapsible(node);
          node.querySelectorAll && node.querySelectorAll('.accordion').forEach(makeCollapsible);
        });
      });
    });
    observer.observe(document.body, {childList: true, subtree: true});

    // Fractais UI Logic
    const dom = {
      input: document.getElementById('inputText'),
      output: document.getElementById('outputContainer'),
      genBtn: document.getElementById('genBtn'),
      archSelect: document.getElementById('startArch'),
      cycleCheck: document.getElementById('cycleMode'),
      body: document.body,
      copyBtn: document.getElementById('copyBtn'),
      clearBtn: document.getElementById('clearBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      statusBar: document.getElementById('statusBar'),
      hudStatus: document.getElementById('hudStatus'),
      mainCard: document.getElementById('mainHeroCard')
    };

    if(dom.input) {
      const savedInput = localStorage.getItem('kobllux_draft_input');
      if(savedInput) dom.input.value = savedInput;
    }

    if(dom.archSelect) {
      dom.archSelect.addEventListener('change', (e) => dom.body.setAttribute('data-arch', e.target.value));
    }

    function generateFractals() {
      if(!dom.input || !dom.output) return;
      const text = dom.input.value.trim();
      if(!text) { showToastApp("Aviso: Texto de entrada vazio."); return; }

      localStorage.setItem('kobllux_draft_input', text);
      const sentencesMatch = text.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g);
      const sentences = sentencesMatch ? sentencesMatch.map(s => s.trim()).filter(s => s.length > 0) : [];
      if(sentences.length === 0) return;

      const startArchName = dom.archSelect ? dom.archSelect.value : FRACTAL_ARCH_IDS[0];
      const startIdx = Math.max(0, FRACTAL_ARCH_IDS.indexOf(startArchName));
      const isCycleMode = dom.cycleCheck ? dom.cycleCheck.checked : false;
      
      dom.output.innerHTML = '';
      let resultTextForExport = "";

      sentences.forEach((sentence, i) => {
        const archId = FRACTAL_ARCH_IDS[isCycleMode ? ((startIdx + i) % FRACTAL_ARCH_IDS.length) : startIdx];
        
        // Puxa cor da config ou extrai fisicamente se customizada via CSS nativo
        let archColor = '#ffffff';
        let displayArchName = archId.toUpperCase();
        
        const knownArch = ARCHETYPES.find(a => a.id === archId);
        if(knownArch) displayArchName = knownArch.name;

        // Extrai cor do DOM p/ compatibilidade total com as variáveis customizadas do Fusion
        const dummyBody = document.createElement('body');
        dummyBody.setAttribute('data-arch', archId);
        document.documentElement.appendChild(dummyBody);
        const extractedColor = getComputedStyle(dummyBody).getPropertyValue('--kob-voice-primary').trim();
        if(extractedColor) archColor = extractedColor;
        document.documentElement.removeChild(dummyBody);
        
        const block = document.createElement('div');
        block.className = 'para-block accordion is-open'; 
        block.style.animationDelay = `${i * 0.1}s`;
        block.style.setProperty('--kob-voice-primary', archColor);
        block.style.setProperty('--kob-voice-bg-soft', `color-mix(in srgb, ${archColor} 12%, transparent)`);
        block.style.borderLeftColor = archColor;
        block.style.setProperty('--card-accent', archColor); 

        block.innerHTML = `
          <div class="accordion-header">
            <div class="arch-tag" style="color: ${archColor}; border-color: color-mix(in srgb, ${archColor} 30%, rgba(255,255,255,0.1))">
              ${displayArchName} · Δ
            </div>
          </div>
          <div class="collapsible-body">
            <div class="content-inner">${sentence}</div>
          </div>
        `;
        
        dom.output.appendChild(block);
        resultTextForExport += `${displayArchName.toUpperCase()} — ${sentence}\n\n`;
      });

      localStorage.setItem('kobllux_last_result', resultTextForExport.trim());
      
      const total = sentences.length;
      if(dom.statusBar) dom.statusBar.textContent = `Opcode 0x0B · Matrix Densa Ativa · ${total} Fractal(s) Gerado(s)`;
      if(dom.hudStatus) dom.hudStatus.textContent = `Δ-${total}`;
      
      if(dom.mainCard && dom.mainCard.classList.contains('is-open')) {
        const hdr = dom.mainCard.querySelector('.accordion-header');
        if(hdr) hdr.click();
      }

      showToastApp("Integração Concluída");
      rebuildBlocks(); // Atualiza a leitura para capturar os novos fractais
    }

    if(dom.genBtn) dom.genBtn.addEventListener('click', generateFractals);
    if(dom.input) dom.input.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateFractals(); });

    if(dom.copyBtn) dom.copyBtn.addEventListener('click', async () => {
      const content = localStorage.getItem('kobllux_last_result');
      if(!content) { showToastApp("Nenhum fractal para copiar."); return; }
      try { await navigator.clipboard.writeText(content); showToastApp("Fractais copiados para o Códex"); } 
      catch (err) { 
        const ta = document.createElement('textarea'); ta.value = content; document.body.appendChild(ta); 
        ta.select(); document.execCommand('copy'); document.body.removeChild(ta); 
        showToastApp("Fractais copiados (Fallback)"); 
      }
    });

    if(dom.clearBtn) dom.clearBtn.addEventListener('click', () => {
      if(dom.input) dom.input.value = '';
      if(dom.output) dom.output.innerHTML = '<div class="empty-state">Sistema reiniciado. Aguardando novos dados.</div>';
      localStorage.removeItem('kobllux_last_result'); localStorage.removeItem('kobllux_draft_input');
      if(dom.statusBar) dom.statusBar.textContent = 'Sistema em repouso · Matrix Pronta'; 
      if(dom.hudStatus) dom.hudStatus.textContent = '78K-ID';
      
      if(dom.mainCard && dom.mainCard.classList.contains('is-collapsed')) {
        const hdr = dom.mainCard.querySelector('.accordion-header');
        if(hdr) hdr.click();
      }
      showToastApp("Memória Limpa");
      rebuildBlocks();
    });

    if(dom.downloadBtn) dom.downloadBtn.addEventListener('click', () => {
      const content = localStorage.getItem('kobllux_last_result');
      if(!content) { showToastApp("Nenhum fractal para transferir."); return; }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `KOBLLUX_Fractais_${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      showToastApp("Transferência Concluída");
    });

    /* -----------------------------
       HUD Magnético (Fractal Bar / Main Bar)
       ----------------------------- */
    const hudBar = document.getElementById('hudBar') || document.getElementById('symbolBar');
    const dragHandle = document.getElementById('hudDrag') || hudBar;
    
    if(hudBar && dragHandle) {
      let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
      
      function dragStart(e) {
        if(e.target.closest('.symbol-button') || e.target.tagName.toLowerCase() === 'button') return;
        if (e.type === "touchstart") { initialX = e.touches[0].clientX - xOffset; initialY = e.touches[0].clientY - yOffset; } 
        else { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; }
        if (e.target === dragHandle || dragHandle.contains(e.target)) { 
          isDragging = true; hudBar.classList.add('dragging'); 
          hudBar.style.transition = "none"; 
        }
      }
      function dragEnd() { 
        if(!isDragging) return;
        initialX = currentX; initialY = currentY; isDragging = false; 
        hudBar.classList.remove('dragging'); 
        hudBar.style.transition = "transform 0.1s ease-out"; 
      }
      function drag(e) {
        if (isDragging) {
          e.preventDefault();
          if (e.type === "touchmove") { currentX = e.touches[0].clientX - initialX; currentY = e.touches[0].clientY - initialY; } 
          else { currentX = e.clientX - initialX; currentY = e.clientY - initialY; }
          xOffset = currentX; yOffset = currentY;
          hudBar.style.transform = `translate3d(calc(-50% + ${currentX}px), ${currentY}px, 0)`;
        }
      }
      hudBar.addEventListener("touchstart", dragStart, { passive: false }); 
      document.addEventListener("touchend", dragEnd, { passive: false }); 
      document.addEventListener("touchmove", drag, { passive: false });
      hudBar.addEventListener("mousedown", dragStart); 
      document.addEventListener("mouseup", dragEnd); 
      document.addEventListener("mousemove", drag);
    }

    // Inicialização da Arquitetura do Voice TTS
    try { updateArchetype(state.archIdx || 0); } catch(e) {}
    console.log('KOBLLUX Monolith Init ✓');
    toast('KOBLLUX Pronto ✓', 900);
  });

})();
