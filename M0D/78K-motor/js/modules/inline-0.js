
    document.addEventListener('DOMContentLoaded', () => {

      /* =========================================
         SISTEMA ACCORDION KOBLLUX (OVERRIDE)
         ========================================= */
      function makeCollapsible(node) {
        // Evita inicialização dupla
        if (node.dataset.accordionInit) return;
        node.dataset.accordionInit = "true";

        const header = node.querySelector('.accordion-header');
        const body = node.querySelector('.collapsible-body');
        
        if (!header || !body) return;

        // Injeta o indicador se não existir
        if (!header.querySelector('.indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'indicator';
          // Seta visual para o chevron
          indicator.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
          header.appendChild(indicator);
        }

        // Garante que tenha um estado inicial válido
        if (!node.classList.contains('is-collapsed') && !node.classList.contains('is-open')) {
          node.classList.add('is-open'); // Default
        }

        // Se iniciar fechado, força altura zero
        if (node.classList.contains('is-collapsed')) {
          body.style.height = '0px';
        }

        // Lógica de toggle
        header.addEventListener('click', (e) => {
          // Ignora cliques em inputs, selects ou botões dentro do header (se houver)
          const targetTag = e.target.tagName.toLowerCase();
          if (['input', 'select', 'button', 'textarea'].includes(targetTag)) return;

          const isCollapsed = node.classList.contains('is-collapsed');

          if (isCollapsed) {
            // ABRIR
            node.classList.remove('is-collapsed');
            node.classList.add('is-open');
            
            body.style.height = body.scrollHeight + 'px';
            
            // Permite adaptação de altura natural (ex: ao digitar no textarea)
            body.addEventListener('transitionend', function handler(e) {
              if (e.propertyName === 'height') {
                body.style.height = 'auto';
                body.removeEventListener('transitionend', handler);
              }
            });
          } else {
            // FECHAR
            // Seta a altura exata primeiro para a transição do CSS saber de onde partir
            body.style.height = body.scrollHeight + 'px';
            
            // Trigger reflow (força o browser a aplicar a altura antes de zerar)
            void body.offsetHeight;
            
            node.classList.remove('is-open');
            node.classList.add('is-collapsed');
            
            // Aplica altura zero
            body.style.height = '0px';
          }
        });
      }

      /* API Exposta para controle externo se necessário */
      window.KobAccordion = {
        open: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.classList.remove('is-collapsed'); card && card.classList.add('is-open'); },
        close: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.classList.remove('is-open'); card && card.classList.add('is-collapsed'); },
        toggle: (card) => { card = (typeof card === 'string') ? document.querySelector(card) : card; card && card.querySelector('.accordion-header')?.click(); }
      };

      /* Observa adições dinâmicas (para os Fractais gerados) */
      const observer = new MutationObserver(muts => {
        muts.forEach(m => {
          m.addedNodes && m.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            if (node.matches && node.matches('.accordion')) {
              makeCollapsible(node);
            }
            node.querySelectorAll && node.querySelectorAll('.accordion').forEach(el => makeCollapsible(el));
          });
        });
      });
      observer.observe(document.body, {childList: true, subtree: true});

      /* Inicializa elementos estáticos (O Main Fusion Card) */
      document.querySelectorAll('.accordion').forEach(makeCollapsible);

      /* =========================================
         LÓGICA EXISTENTE DO KOBLLUX
         ========================================= */
      /* const ARCHETYPES = ["atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine", "aion"];
      const ARCHETYPES = [
  "atlas",
  "nova",
  "vitalis",
  "pulse",
  "kaos",
  "kodux",
  "lumine",
  "aion",
  "kobllux",
  "artemis",
  "serena",
  "genus",
  "solus",
  "rhea",
  "uno",
  "dual",
  "trinity",
  "infodose",
  "horus"
];*/
const ARCHETYPES = ["atlas","nova","vitalis","pulse","kaos","kodux","lumine","aion","kobllux","artemis","serena","genus","solus","rhea","uno","dual","trinity","infodose","horus","bllue", localStorage.getItem("di_userName")];
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
        toastContainer: document.getElementById('toast-container'),
        mainCard: document.getElementById('mainHeroCard')
      };

      const savedInput = localStorage.getItem('kobllux_draft_input');
      if(savedInput) dom.input.value = savedInput;

      function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        const currentColor = getComputedStyle(document.body).getPropertyValue('--kob-voice-primary').trim();
        toast.style.background = currentColor;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
      }

      dom.archSelect.addEventListener('change', (e) => dom.body.setAttribute('data-arch', e.target.value));

      function generateFractals() {
        const text = dom.input.value.trim();
        if(!text) { showToast("Aviso: Texto de entrada vazio."); return; }

        localStorage.setItem('kobllux_draft_input', text);

        const sentencesMatch = text.replace(/\n+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g);
        const sentences = sentencesMatch ? sentencesMatch.map(s => s.trim()).filter(s => s.length > 0) : [];
        if(sentences.length === 0) return;

        const startArchName = dom.archSelect.value;
        const startIdx = Math.max(0, ARCHETYPES.indexOf(startArchName));
        const isCycleMode = dom.cycleCheck.checked;
        
        dom.output.innerHTML = '';
        let resultTextForExport = "";

        sentences.forEach((sentence, i) => {
          const archIndex = isCycleMode ? (startIdx + i) % ARCHETYPES.length : startIdx;
          const currentArchName = ARCHETYPES[archIndex];
          
          const block = document.createElement('div');
          // Adicionamos as classes de ACORDEÃO aqui
          block.className = 'para-block accordion is-open'; 
          block.style.animationDelay = `${i * 0.1}s`;
          
          const dummyBody = document.createElement('body');
          dummyBody.setAttribute('data-arch', currentArchName);
          document.documentElement.appendChild(dummyBody);
          const archColor = getComputedStyle(dummyBody).getPropertyValue('--kob-voice-primary').trim();
          document.documentElement.removeChild(dummyBody);
          
          block.style.setProperty('--kob-voice-primary', archColor);
          block.style.setProperty('--kob-voice-bg-soft', `color-mix(in srgb, ${archColor} 12%, transparent)`);
          block.style.borderLeftColor = archColor;
          block.style.setProperty('--card-accent', archColor); // Para a cor do indicator

          const displayArchName = currentArchName.charAt(0).toUpperCase() + currentArchName.slice(1);
          
          // Estrutura atualizada para o Acordeão
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
        dom.statusBar.textContent = `Opcode 0x0B · Matrix Densa Ativa · ${total} Fractal(s) Gerado(s)`;
        dom.hudStatus.textContent = `Δ-${total}`;
        
        // OPCIONAL: Recolher a main card automaticamente ao gerar para focar no output
        if(dom.mainCard.classList.contains('is-open')) {
          dom.mainCard.querySelector('.accordion-header').click();
        }

        showToast("Integração Concluída");
      }

      dom.genBtn.addEventListener('click', generateFractals);
      dom.input.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateFractals(); });

      dom.copyBtn.addEventListener('click', async () => {
        const content = localStorage.getItem('kobllux_last_result');
        if(!content) { showToast("Nenhum fractal para copiar."); return; }
        try { await navigator.clipboard.writeText(content); showToast("Fractais copiados para o Códex"); } 
        catch (err) { const ta = document.createElement('textarea'); ta.value = content; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast("Fractais copiados (Fallback)"); }
      });

      dom.clearBtn.addEventListener('click', () => {
        dom.input.value = '';
        dom.output.innerHTML = '<div class="empty-state">Sistema reiniciado. Aguardando novos dados.</div>';
        localStorage.removeItem('kobllux_last_result'); localStorage.removeItem('kobllux_draft_input');
        dom.statusBar.textContent = 'Sistema em repouso · Matrix Pronta'; dom.hudStatus.textContent = '78K-ID';
        
        // Re-abre o card se estiver fechado ao limpar
        if(dom.mainCard.classList.contains('is-collapsed')) {
          dom.mainCard.querySelector('.accordion-header').click();
        }

        showToast("Memória Limpa");
      });

      dom.downloadBtn.addEventListener('click', () => {
        const content = localStorage.getItem('kobllux_last_result');
        if(!content) { showToast("Nenhum fractal para transferir."); return; }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `KOBLLUX_Fractais_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        showToast("Transferência Concluída");
      });

      /* =========================================
         HUD MAGNÉTICO (ARRASTO)
         ========================================= */
      const hudBar = document.getElementById('hudBar');
      const dragHandle = document.getElementById('hudDrag');
      let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
      
      function dragStart(e) {
        if (e.type === "touchstart") { initialX = e.touches[0].clientX - xOffset; initialY = e.touches[0].clientY - yOffset; } 
        else { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; }
        if (e.target === dragHandle || dragHandle.contains(e.target)) { isDragging = true; hudBar.classList.add('dragging'); hudBar.style.transition = "none"; }
      }
      function dragEnd() { initialX = currentX; initialY = currentY; isDragging = false; hudBar.classList.remove('dragging'); hudBar.style.transition = "transform 0.1s ease-out"; }
      function drag(e) {
        if (isDragging) {
          e.preventDefault();
          if (e.type === "touchmove") { currentX = e.touches[0].clientX - initialX; currentY = e.touches[0].clientY - initialY; } 
          else { currentX = e.clientX - initialX; currentY = e.clientY - initialY; }
          xOffset = currentX; yOffset = currentY;
          hudBar.style.transform = `translate3d(calc(-50% + ${currentX}px), ${currentY}px, 0)`;
        }
      }
      hudBar.addEventListener("touchstart", dragStart, { passive: false }); document.addEventListener("touchend", dragEnd, { passive: false }); document.addEventListener("touchmove", drag, { passive: false });
      hudBar.addEventListener("mousedown", dragStart); document.addEventListener("mouseup", dragEnd); document.addEventListener("mousemove", drag);
    });
  