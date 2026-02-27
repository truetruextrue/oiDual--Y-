// DH10 Snap + Drag (magnético)
// Assumptions: .symbol-bar existe; CSS já tem .is-dragging, .snap-*, .floating, .collapsed
// Uses CSS var --snap-threshold (e.g. 40px)

(() => {
  const bar = document.querySelector('.symbol-bar');
  if (!bar) return;
  const state = { dragging: false, startX:0, startY:0, origX:0, origY:0, pointerId: null };

  const getViewport = () => ({ w: window.innerWidth, h: window.innerHeight });

  function readSaved(archetype = 'default') {
    try {
      const raw = localStorage.getItem(`di_hud_pos_${archetype}`);
      return raw ? JSON.parse(raw) : null;
    } catch(e){ return null; }
  }

  function savePos(pos, archetype = 'default') {
    try { localStorage.setItem(`di_hud_pos_${archetype}`, JSON.stringify(pos)); } catch(e){}
  }

  function clearSnapClasses() {
    bar.classList.remove('snap-side','snap-side-right','snap-top','floating');
  }

  function applyPosition({left, top}, animate = true) {
    // remove translate-based transform interference (we rely on top/left)
    if (!animate) bar.style.transition = 'none';
    bar.style.left = `${Math.round(left)}px`;
    bar.style.top  = `${Math.round(top)}px`;
    // force reflow to avoid transition jump
    if (!animate) { requestAnimationFrame(()=> bar.style.transition = ''); }
  }

  function computeSnap(x, y) {
    const { w, h } = getViewport();
    const threshold = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--snap-threshold')) || 40;
    const zones = [
      { name: 'left',  x: 12,               y: h/2,       score: Math.hypot(x-12, y - h/2) },
      { name: 'right', x: w - 12 - bar.offsetWidth, y: h/2, score: Math.hypot(x - (w-12-bar.offsetWidth), y - h/2) },
      { name: 'top',   x: w/2 - bar.offsetWidth/2, y: 12, score: Math.hypot(x - (w/2 - bar.offsetWidth/2), y - 12) },
      { name: 'bottom',x: w/2 - bar.offsetWidth/2, y: h - 12 - bar.offsetHeight, score: Math.hypot(x - (w/2 - bar.offsetWidth/2), y - (h-12-bar.offsetHeight)) },
      { name: 'center',x: w/2 - bar.offsetWidth/2, y: h/2 - bar.offsetHeight/2, score: Math.hypot(x - (w/2 - bar.offsetWidth/2), y - (h/2 - bar.offsetHeight/2)) }
    ];
    zones.sort((a,b)=>a.score-b.score);
    const best = zones[0];
    if (best.score <= threshold*3) return best; // allow center if reasonably close
    return null;
  }

  // pointer handlers
  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    bar.setPointerCapture?.(e.pointerId);
    state.pointerId = e.pointerId;
    state.dragging = true;
    bar.classList.add('is-dragging');
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.origX = bar.getBoundingClientRect().left;
    state.origY = bar.getBoundingClientRect().top;
    // remove css translate base interference
    bar.style.transform = 'none';
    // avoid transitions during dragging
    bar.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    const left = state.origX + dx;
    const top  = state.origY + dy;
    applyPosition({left, top}, false);
  }

  function onPointerUp(e) {
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    state.dragging = false;
    bar.classList.remove('is-dragging');
    // allow transition back
    bar.style.transition = '';
    // compute snap target
    const rect = bar.getBoundingClientRect();
    const snap = computeSnap(rect.left, rect.top);
    clearSnapClasses();
    if (snap) {
      // apply classes and a friendly animation
      if (snap.name === 'left') {
        bar.classList.add('snap-side');
        applyPosition({ left: 12, top: window.innerHeight/2 - rect.height/2 }, true);
      } else if (snap.name === 'right') {
        bar.classList.add('snap-side-right');
        applyPosition({ left: window.innerWidth - 12 - rect.width, top: window.innerHeight/2 - rect.height/2 }, true);
      } else if (snap.name === 'top') {
        bar.classList.add('snap-top');
        applyPosition({ left: window.innerWidth/2 - rect.width/2, top: 12 }, true);
      } else if (snap.name === 'bottom') {
        // bottom snap -> retain floating look but anchored to bottom center
        applyPosition({ left: window.innerWidth/2 - rect.width/2, top: window.innerHeight - 12 - rect.height }, true);
      } else { // center
        bar.classList.add('floating');
        applyPosition({ left: window.innerWidth/2 - rect.width/2, top: window.innerHeight/2 - rect.height/2 }, true);
      }
      // persist
      savePos({ left: parseInt(bar.style.left), top: parseInt(bar.style.top), snap: snap.name }, currentArchetype());
    } else {
      // leave where dropped (still persist)
      savePos({ left: parseInt(bar.style.left), top: parseInt(bar.style.top), snap: 'free' }, currentArchetype());
    }
    state.pointerId = null;
  }

  // small API for current archetype (you can wire to your archetype system)
  function currentArchetype() {
    // If you manage archetypes elsewhere, replace this function to return current one
    return window.KODUX_CURRENT_ARCHETYPE || 'default';
  }

  // attach events
  bar.style.touchAction = 'none';
  bar.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('resize', ()=> {
    // keep bar inside viewport after resize
    const rect = bar.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - 8;
    const maxTop  = window.innerHeight - rect.height - 8;
    const left = Math.min(Math.max(8, rect.left), Math.max(8, maxLeft));
    const top  = Math.min(Math.max(8, rect.top), Math.max(8, maxTop));
    applyPosition({ left, top }, true);
  });

  // expose small debug helper
  window.__kob_snap_save = savePos;
})();