function makeOrbAvatar(name = 'DUAL', size = 64) {
  const seed = (name || 'DUAL')
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0);

  const h1 = seed % 360;
  const h2 = (seed * 37) % 360;
  const id = 'orb_' + seed.toString(36);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="${id}_core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="hsl(${h1},100%,60%)"/>
          <stop offset="100%" stop-color="hsl(${h2},90%,30%)"/>
        </radialGradient>

        <linearGradient id="${id}_ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${h1},100%,70%)"/>
          <stop offset="100%" stop-color="hsl(${h2},100%,50%)"/>
        </linearGradient>
      </defs>

      <!-- base -->
      <circle cx="50" cy="50" r="46" fill="#05070c"/>

      <!-- glow -->
      <circle cx="50" cy="50" r="40" fill="url(#${id}_core)" opacity="0.9"/>

      <!-- ring -->
      <circle cx="50" cy="50" r="46"
        fill="none"
        stroke="url(#${id}_ring)"
        stroke-width="2"
        opacity="0.6"/>

      <!-- inner pulse -->
      <circle cx="50" cy="50" r="18"
        fill="white"
        opacity="0.06"/>

    </svg>
  `;
}

