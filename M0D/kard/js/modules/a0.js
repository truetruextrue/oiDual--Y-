function injectOrbStyles() {
  if (document.getElementById('dual-orb-styles')) return;
  const style = document.createElement('style');
  style.id = 'dual-orb-styles';
  style.innerHTML = `
    @keyframes orbBreathe {
      0%, 100% { transform: scale(1); opacity: 0.85; filter: brightness(1); }
      50% { transform: scale(1.08); opacity: 1; filter: brightness(1.3); }
    }
    @keyframes orbSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes orbPulse {
      0% { transform: scale(0.7); opacity: 0.5; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    .dual-orb {
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
    }
    .dual-orb:active { transform: scale(0.9); }
    
    /* Variáveis de estado nativas (pronto para receber input de áudio/KODUX no futuro) */
    .dual-orb .orb-glow {
      animation: orbBreathe var(--orb-speed, 4s) ease-in-out infinite;
      transform-origin: center;
    }
    .dual-orb .orb-ring {
      animation: orbSpin var(--orb-spin-speed, 12s) linear infinite;
      transform-origin: center;
    }
    .dual-orb .orb-pulse {
      animation: orbPulse var(--orb-pulse-speed, 2s) cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
      transform-origin: center;
    }

    /* Overrides de Hover */
    .dual-orb:hover .orb-glow { animation-duration: 1.5s !important; }
    .dual-orb:hover .orb-ring { animation-duration: 4s !important; }
    .dual-orb:hover .orb-pulse { animation-duration: 1s !important; }
  `;
  document.head.appendChild(style);
}