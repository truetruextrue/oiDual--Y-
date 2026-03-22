// ========== ORB DRAG & MERGE WITH SYMBOL BAR ==========
(function(){
  const ORB_ID = 'unoOrbWrap';
  const BAR_ID = 'symbolBar';
  const STORAGE_KEY_CUSTOM_BAR = 'kob_custom_bar_state_v1';

  let orb = document.getElementById(ORB_ID);
  let bar = document.getElementById(BAR_ID);

  if (!orb || !bar) {
    console.warn('Orb or SymbolBar not found – drag feature disabled');
    return;
  }

  // ---------- 1. Torna o orbe arrastável (HTML5 Drag) ----------
  orb.setAttribute('draggable', 'true');

  orb.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text/plain', 'orb');
    e.dataTransfer.effectAllowed = 'copy';
    orb.style.opacity = '0.6';
  });

  orb.addEventListener('dragend', function(e) {
    orb.style.opacity = '';
  });

  // Permite soltar na barra
  bar.addEventListener('dragover', function(e) {
    e.preventDefault();  // necessário para permitir drop
    e.dataTransfer.dropEffect = 'copy';
    bar.classList.add('drag-over');
  });

  bar.addEventListener('dragleave', function() {
    bar.classList.remove('drag-over');
  });

  // ---------- 2. Ao soltar, funde o orbe à barra ----------
  bar.addEventListener('drop', function(e) {
    e.preventDefault();
    bar.classList.remove('drag-over');

    const data = e.dataTransfer.getData('text/plain');
    if (data !== 'orb') return;

    mergeOrbIntoBar();
  });

  // ---------- 3. Long‑press no orbe (touch e mouse) ----------
  let pressTimer;
  function startLongPress() {
    pressTimer = setTimeout(() => {
      mergeOrbIntoBar();
    }, 600); // 600ms de pressão
  }
  function cancelLongPress() {
    clearTimeout(pressTimer);
  }

  orb.addEventListener('pointerdown', startLongPress);
  orb.addEventListener('pointerup', cancelLongPress);
  orb.addEventListener('pointercancel', cancelLongPress);

  // ---------- 4. Função principal de fusão ----------
  function mergeOrbIntoBar() {
    // Evita múltiplas fusões
    if (bar.querySelector('.custom-orb-button')) return;

    // Remove todos os botões da barra, exceto o toggle (#toggleBtn)
    const allButtons = Array.from(bar.querySelectorAll('.symbol-button'));
    for (let btn of allButtons) {
      if (btn.id !== 'toggleBtn') {
        btn.remove();
      }
    }

    // Clona o orbe (para não mover o original)
    const originalOrb = document.getElementById(ORB_ID);
    if (!originalOrb) return;

    const orbClone = originalOrb.cloneNode(true);
    orbClone.classList.add('custom-orb-button', 'symbol-button');
    orbClone.setAttribute('draggable', 'false'); // não precisa mais ser arrastável
    orbClone.style.cursor = 'pointer';

    // Remove event listeners originais (se houver) e adiciona o comportamento de troca de arquétipo
    // Vamos reutilizar o comportamento original do botão #btn-arch
    const archButton = document.getElementById('btn-arch');
    if (archButton) {
      // Copia os ouvintes de clique do btn-arch (se já existirem)
      const clickHandler = archButton.onclick;
      if (clickHandler) orbClone.onclick = clickHandler;
      else {
        // Se não houver, implementa o ciclo de arquétipos básico
        orbClone.addEventListener('click', () => {
          if (window.KOBLLUX && window.KOBLLUX.updateArchetype) {
            const newIdx = (window.KOBLLUX.state.archIdx + 1) % (window.KOBLLUX.getArchetypes().length);
            window.KOBLLUX.updateArchetype(newIdx);
          } else {
            // fallback simples
            const archs = window.KOBLLUX_ARCHETYPES || window.KOBLLUX.getArchetypes?.() || [];
            if (archs.length) {
              let current = window.KOBLLUX.state.archIdx || 0;
              current = (current + 1) % archs.length;
              window.KOBLLUX.updateArchetype(current);
            }
          }
        });
      }
    }

    // Adiciona o orbe à barra
    bar.appendChild(orbClone);

    // Esconde o orbe original (para não ter dois)
    originalOrb.style.display = 'none';

    // Salva o estado no localStorage
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_BAR, JSON.stringify({ merged: true }));
    } catch(e) {}

    // Ajusta a posição da barra após mudança de conteúdo
    if (window.DI_SYMBOL_BAR && typeof window.DI_SYMBOL_BAR.saveAll === 'function') {
      setTimeout(() => window.DI_SYMBOL_BAR.saveAll(), 100);
    }

    // Notificação visual
    toast('Orbe fundido à barra!');
  }

  // ---------- 5. Restaurar estado personalizado ao carregar ----------
  function restoreCustomBar() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_BAR) || '{}');
      if (saved.merged && !bar.querySelector('.custom-orb-button')) {
        // Se já estava fundido e ainda não está, refaz a fusão
        mergeOrbIntoBar();
      }
    } catch(e) {}
  }

  // Executa após a página estar totalmente carregada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreCustomBar);
  } else {
    restoreCustomBar();
  }
})();