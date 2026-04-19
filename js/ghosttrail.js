/* ===== DI FUSION HANDLE FIX ===== */
(() => {
  if (window.__DI_FUSION_HANDLE_V2__) return;
  window.__DI_FUSION_HANDLE_V2__ = true;

  const card = document.querySelector('#mainCard');
  const bar = document.querySelector('#symbolBar');
  const handle = document.querySelector('.drag-handle');
  const archBtn = document.querySelector('#btn-arch');

  if (!card || !bar || !handle) return;

  const LONG_PRESS_MS = 420;
  const FUSE_DISTANCE = 140;
  const FUSE_ENTER = 110;
  const FUSE_EXIT = 180;

  let dragging = false;
  let pointerId = null;
  let start = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let pressTimer = null;
  let fused = false;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  }

  function setFused(v) {
    fused = v;
    card.classList.toggle('di-fused', v);
    bar.classList.toggle('di-fuse-glow', v);
  }

  function updateProximity() {
    const c = center(card);
    const b = center(bar);
    const d = dist(c, b);

    if (d < FUSE_DISTANCE) {
      card.classList.add('di-near-bar');
      bar.classList.add('di-fuse-glow');

      // escala progressiva 🔥
      const t = Math.max(0, Math.min(1, (FUSE_DISTANCE - d) / FUSE_DISTANCE));
      card.style.transform = `scale(${1 - t * 0.15})`;
      card.style.opacity = 1 - t * 0.5;

      if (d < FUSE_ENTER) setFused(true);
    } else {
      card.classList.remove('di-near-bar');
      bar.classList.remove('di-fuse-glow');
      card.style.transform = '';
      card.style.opacity = '';

      if (fused && d > FUSE_EXIT) setFused(false);
    }
  }

  function onDown(e) {
    pointerId = e.pointerId;
    dragging = false;

    const rect = card.getBoundingClientRect();

    start = { x: e.clientX, y: e.clientY };
    offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    try { handle.setPointerCapture(pointerId); } catch {}

    pressTimer = setTimeout(() => {
      // HOLD → abre card
      window.setMode?.('card', true);
    }, LONG_PRESS_MS);
  }

  function onMove(e) {
    if (pointerId !== e.pointerId) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (!dragging && Math.hypot(dx, dy) > 6) {
      dragging = true;
      clearTimeout(pressTimer);
      card.style.position = 'fixed';
    }

    if (!dragging) return;

    const x = e.clientX - offset.x;
    const y = e.clientY - offset.y;

    card.style.left = x + 'px';
    card.style.top = y + 'px';

    updateProximity();
  }

  function onUp() {
    clearTimeout(pressTimer);

    if (dragging) {
      if (fused) {
        // 🔥 SUMIU NO SYMBOL BAR
        card.style.opacity = 0;
        card.style.transform = 'scale(0.6)';

        setTimeout(() => {
          card.classList.add('hidden');
          card.style = '';
        }, 200);

      } else {
        // volta normal
        card.style.transform = '';
        card.style.opacity = '';
      }
    }

    dragging = false;
    pointerId = null;
  }

  handle.addEventListener('pointerdown', onDown);
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);

  /* ===== TRAZER DE VOLTA PELO ORB ===== */
  if (archBtn) {
    let draggingOrb = false;
    let startOrb = { x: 0, y: 0 };

    archBtn.addEventListener('pointerdown', (e) => {
      draggingOrb = false;
      startOrb = { x: e.clientX, y: e.clientY };
    });

    archBtn.addEventListener('pointermove', (e) => {
      const dx = e.clientX - startOrb.x;
      const dy = e.clientY - startOrb.y;

      if (!draggingOrb && Math.hypot(dx, dy) > 8) {
        draggingOrb = true;

        // 🔥 REAPARECE CARD
        card.classList.remove('hidden');
        card.style.opacity = 1;
        card.style.transform = 'scale(1)';
      }
    });
  }
})();