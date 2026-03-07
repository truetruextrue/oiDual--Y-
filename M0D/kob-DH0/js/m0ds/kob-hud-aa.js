/* ========== kob-hud-aa.js ========== */
/* Module: archetypes + snapping + orb controls
   Usage:
     - import or paste as <script type="module">...</script>
     - call setArchetype('Atlas') or use built-in selector (see code).
*/

const ARCHETYPES = {
  Atlas:    { primary:'#4cc9f0', secondary:'#4361ee', accent:'#e6f6ff' },
  Nova:     { primary:'#ff7ab6', secondary:'#ffb86b', accent:'#fff3f8' },
  Vitalis:  { primary:'#5be49a', secondary:'#1fa97a', accent:'#e9fff4' },
  Pulse:    { primary:'#ff4d4d', secondary:'#ffb3b3', accent:'#fff6f6' },
  Artemis:  { primary:'#a98cff', secondary:'#5f4bb6', accent:'#f3f0ff' },
  Serena:   { primary:'#9fe2ff', secondary:'#66c0ff', accent:'#f2fbff' },
  Kaos:     { primary:'#ff6ec7', secondary:'#9b42ff', accent:'#fff0fb' },
  Genus:    { primary:'#ffd166', secondary:'#ef9f4f', accent:'#fffaf0' },
  Lumine:   { primary:'#ffe66d', secondary:'#ff9f1c', accent:'#fff9e6' },
  Solus:    { primary:'#ffd6a5', secondary:'#ff8c42', accent:'#fff5ee' },
  Rhea:     { primary:'#b8f7d7', secondary:'#65d3a3', accent:'#f3fff7' },
  Aion:     { primary:'#78e3ff', secondary:'#b978ff', accent:'#ffffff' }
};

/* quick util: write CSS variable to :root */
function setRootVar(name, value){ document.documentElement.style.setProperty(name, value); }

/* apply archetype by name */
export function setArchetype(name){
  const a = ARCHETYPES[name];
  if(!a) return console.warn('Archetype not found', name);
  setRootVar('--kob-voice-primary', a.primary);
  setRootVar('--kob-voice-secondary', a.secondary);
  setRootVar('--kob-voice-accent', a.accent);

  // derived helpers (optional)
  setRootVar('--kob-voice-bg-soft', `color-mix(in srgb, ${a.primary} 18%, transparent)`);
  setRootVar('--kob-voice-glow', `color-mix(in srgb, ${a.primary} 60%, white)`);

  // sync any inline placeholders
  window.dispatchEvent(new Event('kob:sync-vars'));
  window.dispatchEvent(new CustomEvent('kob:archetype:changed', { detail: { archetype:name } }));
}

/* expose default for non-module usage (if script not imported as module) */
window.KOB = window.KOB || {};
window.KOB.setArchetype = setArchetype;
window.KOB.ARCHETYPES = ARCHETYPES;

/* ========== snapping + drag behavior for #symbolBar ========== */
(function initSnapping(){
  const bar = document.getElementById('symbolBar');
  if(!bar) return;

  let isDragging = false;
  let start = {x:0,y:0,barX:0,barY:0};
  bar.classList.add('kob-transition','kob-snap-anim');

  function getViewport(){ return { w: window.innerWidth, h: window.innerHeight }; }

  function onPointerDown(e){
    isDragging = true;
    bar.classList.add('is-dragging');
    start.x = e.clientX; start.y = e.clientY;
    const rect = bar.getBoundingClientRect();
    start.barX = rect.left; start.barY = rect.top;
    bar.setPointerCapture && bar.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e){
    if(!isDragging) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const newLeft = Math.max(8, Math.min(getViewport().w - bar.offsetWidth - 8, start.barX + dx));
    const newTop  = Math.max(8, Math.min(getViewport().h - bar.offsetHeight - 8, start.barY + dy));
    bar.style.left = newLeft + 'px';
    bar.style.top  = newTop  + 'px';
  }
  function onPointerUp(e){
    if(!isDragging) return;
    isDragging = false;
    bar.classList.remove('is-dragging');
    bar.releasePointerCapture && bar.releasePointerCapture(e.pointerId);
    doSnap();
  }

  function doSnap(){
    const vp = getViewport();
    const rect = bar.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const distances = {
      left: Math.abs(centerX - 0),
      right: Math.abs(centerX - vp.w),
      top: Math.abs(centerY - 0),
      bottom: Math.abs(centerY - vp.h)
    };
    // choose nearest edge
    const min = Object.keys(distances).reduce((a,b)=> distances[a] < distances[b] ? a : b);
    // snap logic with threshold
    const threshold = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--snap-threshold')) || 40;

    // if near snap-zone and within magnet radius, snap to it (magnetic)
    const snapZone = document.getElementById('snap-zone');
    if(snapZone){
      const sRect = snapZone.getBoundingClientRect();
      const dCenter = Math.hypot((centerX - (sRect.left+sRect.width/2)), (centerY - (sRect.top+sRect.height/2)));
      const magnet = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--magnet-radius')) || 88;
      if(dCenter < magnet){
        // center over snap zone
        const targetLeft = Math.round(sRect.left + (sRect.width - rect.width)/2);
        const targetTop  = Math.round(sRect.top  + (sRect.height - rect.height)/2);
        bar.style.left = targetLeft + 'px';
        bar.style.top  = targetTop  + 'px';
        bar.classList.remove('snap-side','snap-side-right','snap-top');
        bar.classList.add('snap-top');
        window.dispatchEvent(new CustomEvent('kob:snapped',{detail:{type:'snap-zone'}}));
        return;
      }
    }

    // otherwise snap to nearest edge
    const margin = 10;
    if(min === 'left'){
      bar.style.left = margin + 'px';
      // vertical stay same
      bar.classList.remove('snap-top','snap-side-right');
      bar.classList.add('snap-side');
      window.dispatchEvent(new CustomEvent('kob:snapped',{detail:{type:'left'}}));
    } else if(min === 'right'){
      bar.style.left = (vp.w - rect.width - margin) + 'px';
      bar.classList.remove('snap-top','snap-side');
      bar.classList.add('snap-side-right');
      window.dispatchEvent(new CustomEvent('kob:snapped',{detail:{type:'right'}}));
    } else if(min === 'top'){
      bar.style.top = margin + 'px';
      bar.classList.remove('snap-side','snap-side-right');
      bar.classList.add('snap-top');
      window.dispatchEvent(new CustomEvent('kob:snapped',{detail:{type:'top'}}));
    } else {
      bar.style.top = (vp.h - rect.height - margin) + 'px';
      bar.classList.remove('snap-side','snap-side-right');
      bar.classList.add('snap-top');
      window.dispatchEvent(new CustomEvent('kob:snapped',{detail:{type:'bottom'}}));
    }
  }

  // pointer handlers
  bar.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', () => { /* ensure bar remains visible */ const r = bar.getBoundingClientRect(); const vp = getViewport(); if(r.left + r.width > vp.w) bar.style.left = Math.max(8,vp.w - r.width - 8)+'px'; if(r.top + r.height > vp.h) bar.style.top = Math.max(8,vp.h - r.height - 8)+'px'; });

  // double-tap to center (convenience)
  bar.addEventListener('dblclick', () => { bar.style.left = '20px'; bar.style.top = '20vh'; bar.classList.remove('snap-side','snap-side-right'); });

})();

/* ========== orb controls + quick UI for selecting archetype ========== */
(function initOrbControls(){
  const orbBtn = document.getElementById('btn-arch') || document.querySelector('#symbolBar #btn-arch');
  if(!orbBtn) return;

  // toggle speaking on short click, long press cycles archetype
  let downAt = 0;
  orbBtn.addEventListener('pointerdown', (e)=> downAt = Date.now());
  orbBtn.addEventListener('pointerup', ()=> {
    const dt = Date.now() - downAt;
    if(dt < 450) {
      // short -> toggle speaking class
      orbBtn.classList.toggle('speaking');
      window.dispatchEvent(new CustomEvent('kob:orb:toggleSpeaking',{detail:{speaking: orbBtn.classList.contains('speaking')}}));
    } else {
      // long -> cycle archetype
      const names = Object.keys(ARCHETYPES);
      const curPrimary = getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-primary').trim();
      let idx = names.findIndex(n => ARCHETYPES[n].primary.toLowerCase() === curPrimary.toLowerCase());
      idx = (idx + 1) % names.length;
      setArchetype(names[idx]);
    }
    downAt = 0;
  });

  // create small floating palette (for developer/testing) appended to root
  const palette = document.createElement('div');
  palette.style.position = 'fixed';
  palette.style.right = '16px';
  palette.style.top = '16px';
  palette.style.zIndex = 999999;
  palette.style.display = 'flex';
  palette.style.gap = '6px';
  palette.style.padding = '6px';
  palette.style.background = 'rgba(0,0,0,0.28)';
  palette.style.border = '1px solid rgba(255,255,255,0.04)';
  palette.style.borderRadius = '8px';
  palette.classList.add('hidden'); // hidden by default
  // populate with swatches
  Object.entries(ARCHETYPES).forEach(([k,v])=>{
    const b = document.createElement('button');
    b.title = k;
    b.style.width = '18px';
    b.style.height = '18px';
    b.style.borderRadius = '6px';
    b.style.border = '1px solid rgba(0,0,0,0.25)';
    b.style.background = v.primary;
    b.style.cursor = 'pointer';
    b.addEventListener('click', ()=> setArchetype(k));
    palette.appendChild(b);
  });
  document.body.appendChild(palette);

  // developer toggle (press "A" to show palette)
  window.addEventListener('keydown', (e) => { if(e.key.toLowerCase() === 'a' && e.ctrlKey) palette.classList.toggle('hidden'); });

})();