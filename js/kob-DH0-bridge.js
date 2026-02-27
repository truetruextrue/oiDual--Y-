// KOBLLUX IFRAME BRIDGE: Sincroniza eventos de temas e vozes entre Pai e Iframe
(function initIframeBridge() {
  'use strict';

  // Mapa de relacionamento: Nomes de classes CSS dos seus iframes para IDs de Arquétipos do Monólito
  const THEME_TO_ARCHETYPE = {
    'theme-gold': 'lumine',     // Amarelo/Ouro -> Lumine (Flo) ou Kaos
    'theme-thermal': 'nova',    // Laranja/Rosa -> Nova (Luciana)
    'theme-default': 'atlas',   // Azul padrão -> Atlas (Reed)
    'theme-dark': 'aion'        // Escuro/Neon -> Aion (Monica)
  };

  // Lista auxiliar para encontrar o índice do arquétipo pelo ID no monólito
  const ARCH_IDS = ['kobllux','kodux','atlas','nova','vitalis','pulse','artemis','serena','kaos','genus','lumine','solus','rhea','aion','uno','dual','trinity','infodose'];

  function changeArchetypeById(archId) {
    if (!window.KOBLLUX) return;
    const idx = ARCH_IDS.indexOf(archId);
    if (idx !== -1) {
      window.KOBLLUX.updateArchetype(idx);
      console.log(`[Bridge] Tema do Iframe alterou arquétipo para: ${archId}`);
    }
  }

  function readIframeText(textNode) {
    if (!window.KOBLLUX || !textNode) return;
    
    // Força o monólito a escanear a tela (incluindo o iframe)
    window.KOBLLUX.rebuildBlocks();
    
    const blocks = window.KOBLLUX.state.blocks;
    const targetText = (textNode.innerText || '').trim();
    
    // Tenta achar o bloco exato ou por texto
    let idx = blocks.findIndex(b => b.isEqualNode && b.isEqualNode(textNode));
    if (idx < 0) idx = blocks.findIndex(b => (b.innerText||'').trim() === targetText);
    
    if (idx >= 0) {
      window.KOBLLUX.state.currentBlockIdx = idx;
      window.KOBLLUX.startSpeech(); // Dispara a voz!
    }
  }

  // ==========================================
  // MÉTODO 1: Injeção Direta (Mesmo Domínio)
  // ==========================================
  function injectListenersIntoIframe(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return; // Se der erro de CORS, ignora e usa o Método 2

      console.log('[Bridge] Injetando ouvintes no Iframe:', iframe.src);

      // 1. Escutar cliques em textos e botões dentro do iframe
      doc.addEventListener('click', (ev) => {
        // Se clicou num botão de voz do painel (baseado no LivroVivo_nebula_styles.css)
        const voiceBtn = ev.target.closest('.kob-tts-panel button, [data-tts-action]');
        if (voiceBtn) {
          const action = voiceBtn.dataset.ttsAction || voiceBtn.id;
          if (action === 'play' && window.KOBLLUX) window.KOBLLUX.startSpeech();
          if (action === 'stop' && window.KOBLLUX) window.KOBLLUX.stopSpeech();
          return;
        }

        // Se clicou num card de texto ou parágrafo
        const textNode = ev.target.closest('.txt-card, p, h1, h2, h3, blockquote, li');
        if (textNode && !textNode.closest('button')) {
          readIframeText(textNode);
        }
      }, { passive: true });

      // 2. Observar mudanças de tema (classes no <body> ou <html> do iframe)
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.attributeName === 'class') {
            const className = m.target.className || '';
            
            // Verifica se alguma classe bate com o nosso mapa de temas
            for (const [themeClass, archId] of Object.entries(THEME_TO_ARCHETYPE)) {
              if (className.includes(themeClass)) {
                changeArchetypeById(archId);
                break;
              }
            }
          }
        });
      });
      
      observer.observe(doc.body, { attributes: true, attributeFilter: ['class'] });
      observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['class'] });

    } catch (err) {
      console.log('[Bridge] Iframe Cross-Origin detectado. Aguardando via postMessage.');
    }
  }

  // Aplica a injeção sempre que um iframe carregar
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(ifr => {
    ifr.addEventListener('load', () => injectListenersIntoIframe(ifr));
    // Tenta injetar logo de cara se já estiver carregado
    if(ifr.contentDocument && ifr.contentDocument.readyState === 'complete') {
      injectListenersIntoIframe(ifr);
    }
  });


  // ==========================================
  // MÉTODO 2: Escutar postMessage (Cross-Domain)
  // ==========================================
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'KOB_CHANGE_THEME' || data.type === 'KOB_CHANGE_ARCHETYPE') {
      // O iframe mandou mudar o arquétipo (ex: data.id = 'vitalis')
      if (data.id) changeArchetypeById(data.id);
      
      // Ou mandou mudar pelo tema CSS (ex: data.theme = 'theme-gold')
      else if (data.theme && THEME_TO_ARCHETYPE[data.theme]) {
        changeArchetypeById(THEME_TO_ARCHETYPE[data.theme]);
      }
    }

    if (data.type === 'KOB_READ_TEXT') {
      // O iframe mandou um texto específico para ler
      if (!window.KOBLLUX) return;
      
      // Se ele mandou um arquétipo específico para esta leitura, muda antes de ler
      if (data.voiceId) changeArchetypeById(data.voiceId);
      
      // Como não temos o Node do DOM (veio via string), criamos uma Utterance isolada ou forçamos o texto
      if (data.text) {
        window.KOBLLUX.stopSpeech();
        const u = new SpeechSynthesisUtterance(data.text);
        const arch = window.KOBLLUX.state.blocks.length ? null : null; // Puxar do estado
        // (Lógica simplificada: usa as configurações atuais do KOBLLUX)
        const synth = window.speechSynthesis;
        synth.speak(u);
      }
    }
  });

  console.log('KOBLLUX Iframe Bridge ativado ✓');
})();
