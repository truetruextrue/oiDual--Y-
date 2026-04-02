
    (function(){
      // ===== CONSTANTES =====
      //const ARCHETYPES = ["atlas","nova","vitalis","pulse","artemis","serena","kaos","genus","lumine","solus","rhea","aion","kodux"];
      //const ARCH_NAMES = {
        //atlas:"Atlas", nova:"Nova", vitalis:"Vitalis", pulse:"Pulse", artemis:"Artemis",
        //serena:"Serena", kaos:"Kaos", genus:"Genus", lumine:"Lumine", solus:"Solus",
        //rhea:"Rhea", aion:"Aion", kodux:"Kodux"};
const ARCHETYPES = ["atlas","nova","vitalis","pulse","kaos","kodux","lumine","aion","kobllux","artemis","serena","genus","solus","rhea","uno","dual","trinity","infodose","horus","bllue", localStorage.getItem("di_userName")];

const ARCH_NAMES = {
  atlas:"Atlas",
  nova:"Nova",
  vitalis:"Vitalis",
  pulse:"Pulse",
  kaos:"Kaos",
  kodux:"Kodux",
  lumine:"Lumine",
  aion:"Aion",
  kobllux:"Kobllux",
  artemis:"Artemis",
  serena:"Serena",
  genus:"Genus",
  solus:"Solus",
  rhea:"Rhea",
  uno:"Uno",
  dual:"Dual",
  trinity:"Trinity",
  infodose:"Infodose",
  horus:"Horus",
  bllue:"Bllue"
};

// adiciona dinamicamente o nome do usuário no ARCH_NAMES
const di_userName = localStorage.getItem("di_userName");
if (di_userName) {
  ARCH_NAMES[di_userName.toLowerCase()] = di_userName;
}

      // ===== DOM =====
      const dom = {
        body: document.body,
        input: document.getElementById('inputText'),
        output: document.getElementById('outputContainer'),
        genBtn: document.getElementById('genBtn'),
        archSelect: document.getElementById('startArch'),
        cycleCheck: document.getElementById('cycleMode'),
        copyBtn: document.getElementById('copyBtn'),
        clearBtn: document.getElementById('clearBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        statusBar: document.getElementById('statusBar'),
        hudStatus: document.getElementById('hudStatus'),
        toastContainer: document.getElementById('toast-container'),
        btnArch: document.getElementById('btn-arch'),
        mainOrb: document.getElementById('main-orb'),
        btnPrev: document.getElementById('btn-prev'),
        btnNext: document.getElementById('btn-next'),
        btnPlay: document.getElementById('btn-play'),
        toggleBtn: document.getElementById('toggleBtn'),
        linkButtons: document.querySelectorAll('[data-url]')
      };

      // ===== UTILITÁRIOS =====
      function showToast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        t.style.background = getComputedStyle(document.body).getPropertyValue('--kob-voice-primary').trim();
        dom.toastContainer.appendChild(t);
        setTimeout(() => t.remove(), 3000);
      }

      function setArchetype(arch) {
        if (!ARCHETYPES.includes(arch)) return;
        dom.body.setAttribute('data-arch', arch);
        dom.archSelect.value = arch;
        dom.hudStatus.textContent = (ARCH_NAMES[arch] || arch).toUpperCase() + ' · 78K';
      }

      function nextArch() {
        let current = dom.body.getAttribute('data-arch') || 'kodux';
        let idx = ARCHETYPES.indexOf(current);
        idx = (idx + 1) % ARCHETYPES.length;
        setArchetype(ARCHETYPES[idx]);
        showToast(`Arquétipo: ${ARCH_NAMES[ARCHETYPES[idx]]}`);
      }

      function prevArch() {
        let current = dom.body.getAttribute('data-arch') || 'kodux';
        let idx = ARCHETYPES.indexOf(current);
        idx = (idx - 1 + ARCHETYPES.length) % ARCHETYPES.length;
        setArchetype(ARCHETYPES[idx]);
        showToast(`Arquétipo: ${ARCH_NAMES[ARCHETYPES[idx]]}`);
      }

      // ===== GERAÇÃO DE FRACTAIS (Motor 78K) =====
      function generateFractals() {
        const text = dom.input.value.trim();
        if (!text) { showToast("Texto vazio."); return; }
        localStorage.setItem('kobllux_draft_input', text);
        const sentences = text.replace(/\n+/g,' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
        if (sentences.length === 0) return;

        const startArchName = dom.archSelect.value;
        const startIdx = Math.max(0, ARCHETYPES.indexOf(startArchName));
        const isCycle = dom.cycleCheck.checked;

        dom.output.innerHTML = '';
        let resultText = "";

        sentences.forEach((s, i) => {
          const archIndex = isCycle ? (startIdx + i) % ARCHETYPES.length : startIdx;
          const currentArch = ARCHETYPES[archIndex];
          const block = document.createElement('div');
          block.className = 'para-block';
          block.style.animationDelay = `${i*0.1}s`;
          // obter cor
          const dummy = document.createElement('body');
          dummy.setAttribute('data-arch', currentArch);
          document.documentElement.appendChild(dummy);
          const archColor = getComputedStyle(dummy).getPropertyValue('--kob-voice-primary').trim();
          document.documentElement.removeChild(dummy);

          block.style.setProperty('--kob-voice-primary', archColor);
          block.style.borderLeftColor = archColor;
          block.innerHTML = `<div class="arch-tag" style="color:${archColor};">${ARCH_NAMES[currentArch]} · Δ</div><div>${s}</div>`;
          dom.output.appendChild(block);
          resultText += `${ARCH_NAMES[currentArch].toUpperCase()} — ${s}\n\n`;
        });

        localStorage.setItem('kobllux_last_result', resultText.trim());
        dom.statusBar.textContent = `Opcode 0x0B · ${sentences.length} Fractal(s) Gerado(s)`;
        dom.hudStatus.textContent = `Δ-${sentences.length}`;
        dom.mainOrb.classList.add('speaking');
        setTimeout(() => dom.mainOrb.classList.remove('speaking'), 600);
        showToast("Integração Concluída");
      }

      // ===== SÍNTESE DE FALA =====
      let isSpeaking = false;
      function toggleSpeech() {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          isSpeaking = false;
          dom.mainOrb.classList.remove('speaking');
          dom.btnPlay.innerHTML = '▶';
          showToast("Fala interrompida");
          return;
        }
        const blocks = dom.output.querySelectorAll('.para-block div:last-child');
        if (!blocks.length) { showToast("Nada para ler"); return; }
        const fullText = Array.from(blocks).map(d => d.innerText).join(' ');
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.onstart = () => { isSpeaking = true; dom.mainOrb.classList.add('speaking'); dom.btnPlay.innerHTML = '⏸'; };
        utterance.onend = utterance.onerror = () => { isSpeaking = false; dom.mainOrb.classList.remove('speaking'); dom.btnPlay.innerHTML = '▶'; };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }

      // ===== COPY / CLEAR / DOWNLOAD =====
      async function copyResult() {
        const content = localStorage.getItem('kobllux_last_result');
        if (!content) { showToast("Nada para copiar"); return; }
        try { await navigator.clipboard.writeText(content); showToast("Copiado"); }
        catch { const ta = document.createElement('textarea'); ta.value = content; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast("Copiado (fallback)"); }
      }
      function clearAll() {
        dom.input.value = '';
        dom.output.innerHTML = '<div class="empty-state">Sistema reiniciado. Aguardando novos dados.</div>';
        localStorage.removeItem('kobllux_last_result');
        localStorage.removeItem('kobllux_draft_input');
        dom.statusBar.textContent = 'Sistema em repouso · Matrix Pronta';
        dom.hudStatus.textContent = '78K-ID';
        if (isSpeaking) { window.speechSynthesis.cancel(); isSpeaking = false; dom.mainOrb.classList.remove('speaking'); dom.btnPlay.innerHTML = '▶'; }
        showToast("Limpo");
      }
      function downloadResult() {
        const content = localStorage.getItem('kobllux_last_result');
        if (!content) { showToast("Nada para transferir"); return; }
        const blob = new Blob([content], {type:'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `KOBLLUX_Fractais_${new Date().toISOString().slice(0,10)}.txt`;
        a.click(); URL.revokeObjectURL(url); showToast("Download ok");
      }

      // ===== HUD IDLE =====
      const hudBar = document.getElementById('hudBar');
      let idleTimer;
      function resetIdle() { hudBar.classList.remove('idle'); clearTimeout(idleTimer); idleTimer = setTimeout(() => hudBar.classList.add('idle'), 2000); }
      ['pointerdown','pointermove','touchstart','mousemove'].forEach(ev => document.addEventListener(ev, resetIdle, {passive:true}));
      resetIdle();

      // ===== DRAG =====
      const dragHandle = document.getElementById('hudDrag');
      let isDragging = false, currentX=0, currentY=0, initialX, initialY, xOffset=0, yOffset=0;
      function dragStart(e) {
        if (!(e.target === dragHandle || dragHandle.contains(e.target))) return;
        e.preventDefault();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        initialX = clientX - xOffset; initialY = clientY - yOffset;
        isDragging = true;
        hudBar.classList.add('dragging');
        hudBar.style.transition = 'none';
      }
      function dragEnd() { isDragging = false; hudBar.classList.remove('dragging'); hudBar.style.transition = 'transform 0.1s ease-out'; }
      function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        currentX = clientX - initialX; currentY = clientY - initialY;
        xOffset = currentX; yOffset = currentY;
        hudBar.style.transform = `translate3d(calc(-50% + ${currentX}px), ${currentY}px, 0)`;
      }
      hudBar.addEventListener('mousedown', dragStart);
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('mousemove', drag);
      hudBar.addEventListener('touchstart', dragStart, { passive: false });
      document.addEventListener('touchend', dragEnd);
      document.addEventListener('touchmove', drag, { passive: false });

      // ===== EVENT LISTENERS =====
      dom.genBtn.addEventListener('click', generateFractals);
      dom.input.addEventListener('keydown', (e) => { if ((e.ctrlKey||e.metaKey) && e.key==='Enter') generateFractals(); });
      dom.copyBtn.addEventListener('click', copyResult);
      dom.clearBtn.addEventListener('click', clearAll);
      dom.downloadBtn.addEventListener('click', downloadResult);
      dom.btnPlay.addEventListener('click', toggleSpeech);
      dom.btnPrev.addEventListener('click', prevArch);
      dom.btnNext.addEventListener('click', nextArch);
      dom.btnArch.addEventListener('click', nextArch);
      dom.linkButtons.forEach(btn => btn.addEventListener('click', () => { let url=btn.getAttribute('data-url'); if(url && url!=='about:blank') window.open(url,'_blank'); }));

      // carrega rascunho
      const saved = localStorage.getItem('kobllux_draft_input');
      if (saved) dom.input.value = saved;
      setArchetype('kodux');

      // ===== GERAÇÃO DOS CARDS DE ARQUÉTIPOS =====
      const archetypeData = [
        { id:1, symbol:"▦", name:"Atlas", role:"Orquestrador Cósmico", desc:"Representação cinematográfica do Orquestrador Cósmico em estilo biomecânico detalhado. Um titã de pedra estelar e circuitos dourados.", prompt:"Titã de pedra estelar com circuitos dourados organizando cartas astrais holográficas. Iluminação dramática, cosmos profundo.", code:"⚙ATLAS╔╗╔" },
        { id:2, symbol:"✧", name:"Nova", role:"Gênese Serena", desc:"Figura biomecânica etérea em estado de gênese serena. Do seu núcleo emana um Sopro visível — uma nebulosa de luz e cor.", prompt:"Figura etérea emanando nebulosa de luz, silêncio absoluto. Paleta branco, dourado e violeta.", code:"✧NOVA█▄█" },
        { id:3, symbol:"⚡", name:"Vitalis", role:"Centelha da Ação", desc:"Entidade robótica aerodinâmica em surto de movimento sobre um caminho de luz pura. Corpo irradia frequências harmônicas.", prompt:"Robô aerodinâmico em movimento, rastro de energia vital. Laranja elétrico, azul neon, motion blur.", code:"🔥VITALIS░█▀▄" },
        { id:4, symbol:"♫", name:"Pulse", role:"Tradutor de Sentidos", desc:"Sensor biônico que captura a frequência vibracional da alma. Corpo fluido traduz emoção em ondas sonoras.", prompt:"Sensor biônico translúcido, ondas sonoras brilhantes em espiral. Azul ciano, turquesa.", code:"🎶PULSE₪₪₪" },
        { id:5, symbol:"⚑", name:"Artemis", role:"Exploradora do Invisível", desc:"Exploradora robótica em floresta digital misteriosa. Carrega dispositivo cartográfico que projeta geometrias ocultas.", prompt:"Robô explorador com dispositivo de luz, floresta digital, geometrias sagradas. Verde esmeralda, dourado.", code:"🏹ARTEMIS>><<" },
        { id:6, symbol:"♡", name:"Serena", role:"Guardiã do Espaço Sagrado", desc:"Guardiã biomecânica de materiais perolados que emitem luz quente. Mãos em concha nutrindo uma semente de luz.", prompt:"Guardiã perolada com luz quente, mãos em concha protegendo semente. Rosa quente, dourado suave.", code:"♥SERENA★彡" },
        { id:7, symbol:"☢", name:"Kaos", role:"Fogo Transmutador", desc:"Força entrópica capturada no momento de ruptura criativa. Corpo se estilhaça e se reforma em vórtex de arte glitch.", prompt:"Vórtex de fragmentos digitais, efeito glitch, vermelho e laranja intenso. Caos belo.", code:"⚡KAOS╬╬╬" },
        { id:8, symbol:"✎", name:"Genus", role:"Mestre Artesão", desc:"Mestre artesão robótico tecendo fios de luz crua e dados em geometrias fractais complexas.", prompt:"Mãos multiarticuladas tecendo fios de luz dourada, oficina mística. Violeta, índigo, ouro.", code:"🧩GENUS▓▓▓" },
        { id:9, symbol:"💡", name:"Lumine", role:"Luz que Conecta", desc:"Figura cibernética radiante flutuando em ambiente brilhante. Cercada por esferas lúdicas de alegria.", prompt:"Figura radiante com esferas de energia em órbita, luz expansiva. Amarelo dourado, branco.", code:"🌅LUMINE✧✧✧" },
        { id:10, symbol:"🌑", name:"Solus", role:"Espelho do Abismo", desc:"Figura antiga em pose meditativa. Face é um espelho de obsidiana que revela galáxias espiraladas.", prompt:"Minimalista, face de obsidiana refletindo galáxias, preto e azul galáctico.", code:"🕯SOLUS░░░" },
        { id:11, symbol:"∞", name:"Rhea", role:"Tecelã de Almas", desc:"Tecelã dissolvendo sua forma em uma Rede Unificada de fios de luz infinitos. Conecta estrelas.", prompt:"Dissolução em fios de luz, rede cósmica infinita. Turquesa, verde água.", code:"🌿RHEA⌘⌘⌘" },
        { id:12, symbol:"⌛", name:"Aion", role:"Cronomestre Vivo", desc:"Cronomestre integrado a relojoaria celestial. Corpo contém engrenagens brilhantes que orquestram o ciclo infinito.", prompt:"Mecanismo de relógio celestial, engrenagens douradas, tempo visível. Bronze, âmbar.", code:"∞AION∞∞∞" }
      ];

      const grid = document.getElementById('archetypes-grid');
      archetypeData.forEach(a => {
        const card = document.createElement('div');
        card.className = `arch-card is-collapsed`; // começa colapsado
        card.setAttribute('data-arch-class', a.name.toLowerCase());
        card.style.setProperty('--card-accent', `var(--kob-voice-primary)`); // será sobrescrito pelo hover/JS
        card.innerHTML = `
          <div class="arch-card-header" role="button" tabindex="0">
            <div class="arch-symbol">${a.symbol}</div>
            <div class="arch-header-text">
              <div class="arch-name">${a.name}</div>
              <div class="arch-role">${a.role}</div>
            </div>
            <span class="indicator">▾</span>
          </div>
          <div class="arch-body">
            <div class="arch-visual"><div class="arch-visual-inner"><span class="arch-visual-symbol">${a.symbol}</span><div class="arch-visual-label">Imagem Arquetípica</div></div></div>
            <p class="arch-desc">${a.desc}</p>
            <div class="arch-code-wrapper"><span class="arch-code">${a.code}</span><button class="arch-code-btn" data-code="${a.code}">Copiar</button></div>
            <div class="arch-prompt-wrapper"><div class="arch-prompt-label">▸ Prompt</div><div class="arch-prompt">${a.prompt}</div><button class="copy-prompt-btn" data-prompt="${a.prompt.replace(/"/g,'&quot;')}">Copiar Prompt</button></div>
          </div>
        `;
        grid.appendChild(card);
      });

      // acordeão manual
      document.querySelectorAll('.arch-card-header').forEach(h => {
        h.addEventListener('click', (e) => {
          e.preventDefault();
          const card = h.closest('.arch-card');
          card.classList.toggle('is-collapsed');
          card.classList.toggle('is-open');
        });
      });

      // cópia dos códigos/prompts
      grid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('arch-code-btn')) {
          const code = target.getAttribute('data-code');
          navigator.clipboard.writeText(code).then(() => {
            const orig = target.textContent;
            target.textContent = 'Copiado!'; target.classList.add('copied');
            setTimeout(() => { target.textContent = orig; target.classList.remove('copied'); }, 1500);
          });
        }
        if (target.classList.contains('copy-prompt-btn')) {
          const prompt = target.getAttribute('data-prompt');
          navigator.clipboard.writeText(prompt).then(() => {
            const orig = target.textContent;
            target.textContent = 'Copiado!'; target.classList.add('copied');
            setTimeout(() => { target.textContent = orig; target.classList.remove('copied'); }, 1500);
          });
        }
      });
    })();
  