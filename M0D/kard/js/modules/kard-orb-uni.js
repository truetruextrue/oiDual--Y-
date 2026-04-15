// 🔥 CORE — ORB UNIVERSAL
function makeOrbAvatar(name, size = 36) {
  const safe = name || 'DUAL';
  const seed = safe.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const h1 = seed % 360;
  const h2 = (seed * 37) % 360;

  const id = 'g' + seed.toString(36);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${h1},100%,55%)"/>
          <stop offset="100%" stop-color="hsl(${h2},90%,45%)"/>
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="7" fill="#071018"/>
      
      <!-- glow -->
      <circle cx="16" cy="16" r="9" fill="url(#${id})" opacity="0.25"/>

      <!-- core -->
      <circle cx="16" cy="16" r="7" fill="url(#${id})"/>

      <!-- ring -->
      <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
    </svg>
  `;
}

// 🔓 GLOBAL HOOK
window.makeOrbAvatar = makeOrbAvatar;


// 🔁 UPDATE UI
function updateInterface(name){
  const safe = name || 'Convidado';

  els.lblName.innerText = safe;
  els.input.value = safe;

  const activeKey = STATE.keys.find(k => k.active);

  els.smallIdent.innerText = activeKey ? activeKey.name : '--';
  els.actBadge.innerText = activeKey ? `key:${activeKey.name}` : 'v:--';

  // 🔥 TODOS SINCRONIZADOS PELO MESMO ORB
  const orb64 = makeOrbAvatar(safe, 48);
  const orb36 = makeOrbAvatar(safe, 36);
  const orb28 = makeOrbAvatar(safe, 28);

  els.avatarTgt.innerHTML = orb64;
  els.smallMiniAvatar.innerHTML = orb28;
  els.actMiniAvatar.innerHTML = orb36;

  els.actName.innerText = safe;
}
