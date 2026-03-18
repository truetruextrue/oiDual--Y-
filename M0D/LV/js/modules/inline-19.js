
  import { applyRGX } from './js/patches/MAP_RGX_v3_KOBLLUX.mjs';

  document.addEventListener('DOMContentLoaded', () => {
    // raiz onde o markdown é renderizado
    const root =
      document.querySelector('#reader') ||
      document.querySelector('#app')    ||
      document.body;

    // marca o root pra animação do TTS e estilo local
    root.dataset.koblluxRoot = '1';

    // ativa o engine (chips, callouts, botões, IA, TTS)
    applyRGX(root);
  });
