// DH10 Persistence loader
(() => {
  const bar = document.querySelector('.symbol-bar');
  if (!bar) return;
  const archetype = window.KODUX_CURRENT_ARCHETYPE || 'default';

  function loadSaved(archetypeKey = archetype) {
    try {
      const raw = localStorage.getItem(`di_hud_pos_${archetypeKey}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e){ return null; }
  }

  function applySaved(pos) {
    if (!pos) return;
    // small safety clamp
    const w = window.innerWidth, h = window.innerHeight;
    const left = Math.min(Math.max(8, pos.left || 20), Math.max(8, w - bar.offsetWidth - 8));
    const top  = Math.min(Math.max(8, pos.top  || 20), Math.max(8, h - bar.offsetHeight - 8));
    // clear classes then apply snap class if present
    bar.classList.remove('snap-side','snap-side-right','snap-top','floating');
    if (pos.snap === 'left') bar.classList.add('snap-side');
    if (pos.snap === 'right') bar.classList.add('snap-side-right');
    if (pos.snap === 'top') bar.classList.add('snap-top');
    if (pos.snap === 'center' || pos.snap === 'floating') bar.classList.add('floating');
    // apply without transition jump
    bar.style.transition = 'none';
    bar.style.left = `${left}px`;
    bar.style.top  = `${top}px`;
    requestAnimationFrame(()=> bar.style.transition = '');
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    const pos = loadSaved(archetype);
    if (pos) applySaved(pos);
    else {
      // fallback: floating bottom center initial
      const left = window.innerWidth/2 - bar.offsetWidth/2;
      const top  = window.innerHeight - 30 - bar.offsetHeight;
      bar.classList.add('floating');
      bar.style.left = `${Math.round(left)}px`;
      bar.style.top  = `${Math.round(top)}px`;
    }
  });

  // also restore immediately if not waiting for DOMContentLoaded (SPA)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const pos = loadSaved(archetype);
    if (pos) applySaved(pos);
  }
})();