// 🔥 UNIVERSAL ORB GENERATOR: EVOLVED (V2) 🔥
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

function makeOrbAvatar(name = 'DUAL', size = 64) {
  injectOrbStyles(); // Garante que o CSS exista no DOM (Monólito puro)

  const seed = (name || 'DUAL')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);

  const h1 = seed % 360;
  const h2 = (seed * 37) % 360;
  const id = 'orb_' + seed.toString(36);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="dual-orb" id="${id}">
      <defs>
        <radialGradient id="${id}_core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="hsl(${h1}, 100%, 65%)"/>
          <stop offset="60%" stop-color="hsl(${h2}, 90%, 40%)"/>
          <stop offset="100%" stop-color="hsl(${h2}, 100%, 10%)" stop-opacity="0"/>
        </radialGradient>

        <linearGradient id="${id}_ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${h1}, 100%, 75%)"/>
          <stop offset="100%" stop-color="hsl(${h2}, 100%, 55%)"/>
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="46" fill="#05070c"/>

      <circle cx="50" cy="50" r="38" fill="none" stroke="url(#${id}_ring)" stroke-width="1" class="orb-pulse"/>

      <circle cx="50" cy="50" r="42" fill="url(#${id}_core)" class="orb-glow"/>

      <circle cx="50" cy="50" r="46"
        fill="none"
        stroke="url(#${id}_ring)"
        stroke-width="2.5"
        stroke-dasharray="70 20 10 30"
        stroke-linecap="round"
        class="orb-ring"
        opacity="0.85"/>

      <circle cx="50" cy="50" r="8" fill="#ffffff" opacity="0.3" filter="blur(2px)"/>
      <circle cx="50" cy="50" r="3" fill="#ffffff" opacity="0.8"/>
    </svg>
  `;
}
window.makeOrbAvatar = makeOrbAvatar;
