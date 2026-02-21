
const stackWrap = document.getElementById('stackWrap');

/**
 * Vincula o redimensionamento manual ao card
 */
function bindResize(card) {
  const handle = card.querySelector('.frame-resize');
  const iframe = card.querySelector('iframe');
  let isResizing = false;

  handle.onmousedown = (e) => {
    isResizing = true;
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();
  };

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const rect = iframe.getBoundingClientRect();
    const newHeight = e.clientY - rect.top;
    if (newHeight > 100) {
      iframe.style.height = newHeight + 'px';
    }
  });

  window.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
  });
}

/**
 * Abre uma nova sessão
 */
function openApp({ title = 'App', url = 'https://example.com' }) {
  const card = document.createElement('div');
  card.className = 'session';

  card.innerHTML = `
    <div class="hdr">
      <div class="title">${title}</div>
      <div class="tools">
        <button data-act="min" title="Minimizar">—</button>
        <button data-act="max" title="Maximizar">▢</button>
        <button data-act="ref" title="Recarregar">⟳</button>
        <button data-act="close" title="Fechar">✕</button>
      </div>
    </div>
    <div class="frame-shell">
      <iframe src="${url}" allow="autoplay; clipboard-read; clipboard-write; fullscreen"></iframe>
      <div class="frame-resize" title="Arraste para ajustar altura"></div>
    </div>
  `;

  const iframe = card.querySelector('iframe');

  // Ações dos botões
  card.querySelector('[data-act=min]').onclick = () => {
    card.classList.toggle('min');
    card.classList.remove('max');
  };

  card.querySelector('[data-act=max]').onclick = () => {
    card.classList.toggle('max');
    card.classList.remove('min');
  };

  card.querySelector('[data-act=ref]').onclick = () => {
    try {
      iframe.contentWindow.location.reload();
    } catch {
      iframe.src = iframe.src;
    }
  };

  card.querySelector('[data-act=close]').onclick = () => {
    card.remove();
  };

  // Ativa o resize manual
  bindResize(card);

  stackWrap.prepend(card);
}

// Botão de adicionar
document.getElementById('add').onclick = () => {
  openApp({
    title: 'Sessão ' + (stackWrap.children.length + 1),
    url: 'https://example.com'
  });
};

// Abre um inicial
window.onload = () => {
  openApp({ title: 'Workspace', url: 'index.html' });
};
