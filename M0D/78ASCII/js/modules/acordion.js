window.App = window.App || {};

  // 1. Geração de PNG
  App.downloadRenderPNG = async function(outputId, filename = 'render.png') {
    const el = document.getElementById(outputId);
    if (!el) return;

    const text = (el.textContent || '').replace(/\s+$/g, '');
    if (!text.trim()) return;

    const lines = text.split('\n');
    const dpr = window.devicePixelRatio || 1;
    const fontSize = 18;
    const lineHeight = 24;
    const padding = 32;
    const fontFamily = 'monospace';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px ${fontFamily}`;

    const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    canvas.width = Math.ceil((maxLineWidth + padding * 2) * dpr);
    canvas.height = Math.ceil((lines.length * lineHeight + padding * 2) * dpr);
    ctx.scale(dpr, dpr);

    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#05070a';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = getComputedStyle(el).color || '#ffffff';

    let y = padding;
    for (const line of lines) {
      ctx.fillText(line, padding, y);
      y += lineHeight;
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // 2. Accordion com memória de estado por sessão
  const ACCORDION_STORAGE_KEY = 'kobllux_accordion_state_v1';
  let accordionEngineBound = false;

  function readAccordionState() {
    try {
      return JSON.parse(sessionStorage.getItem(ACCORDION_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeAccordionState(state) {
    try {
      sessionStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Não foi possível salvar o estado do accordion:', err);
    }
  }

  function restoreAccordionState() {
    const state = readAccordionState();

    document.querySelectorAll('.view-section').forEach((section) => {
      const panels = Array.from(section.querySelectorAll('.panel'));
      const openIndex = Number.isInteger(state[section.id]) ? state[section.id] : -1;

      panels.forEach((panel, idx) => {
        panel.classList.toggle('collapsed', idx !== openIndex);
      });
    });
  }

  function initAccordionEngine() {
    if (!accordionEngineBound) {
      document.querySelectorAll('.view-section').forEach((section) => {
        const panels = Array.from(section.querySelectorAll('.panel'));

        panels.forEach((panel, idx) => {
          const title = panel.querySelector('.section-title');
          if (!title) return;

          title.setAttribute('role', 'button');
          title.setAttribute('tabindex', '0');
          title.title = 'Toque para abrir/fechar';

          const togglePanel = () => {
            const wasCollapsed = panel.classList.contains('collapsed');
            const state = readAccordionState();

            // Fecha todos os painéis da seção
            panels.forEach(p => p.classList.add('collapsed'));

            if (wasCollapsed) {
              // Abre apenas o clicado
              panel.classList.remove('collapsed');
              state[section.id] = idx;
            } else {
              // Mantém tudo fechado
              state[section.id] = -1;
            }

            writeAccordionState(state);
          };

          title.addEventListener('click', togglePanel);

          title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePanel();
            }
          });
        });
      });

      accordionEngineBound = true;
    }

    // Na primeira carga, todos começam fechados.
    // Depois, restaura o último estado salvo nesta sessão.
    restoreAccordionState();
  }

  // 3. Header Toggle (Esconde/Mostra a área principal)
  const headerTrigger = document.getElementById('main-header');
  const mainContent = document.getElementById('main-content');
  if (headerTrigger && mainContent) {
    headerTrigger.addEventListener('click', (e) => {
      if (e.target.closest('#user-badge')) return;
      mainContent.style.opacity = mainContent.style.opacity === '0' ? '1' : '0';
      mainContent.style.pointerEvents = mainContent.style.opacity === '0' ? 'none' : 'auto';
    });
  }

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    initAccordionEngine();
    if (window.lucide) {
      lucide.createIcons();
    }
  });

  // Reaplica quando a página volta do cache do navegador
  window.addEventListener('pageshow', () => {
    restoreAccordionState();
  });
