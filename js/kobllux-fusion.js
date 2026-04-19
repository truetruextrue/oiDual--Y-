/* ===== DI FUSION HANDLE — LOAD LAST ===== */
(() => {
  if (window.__DI_FUSION_HANDLE_READY__) return;
  window.__DI_FUSION_HANDLE_READY__ = true;

  const card = document.querySelector('#mainCard');
  const bar = document.querySelector('#symbolBar');
  const handle = document.querySelector('.drag-handle');
  const archBtn = document.querySelector('#btn-arch');

  if (!card || !bar || !handle) return;

  const LONG_PRESS_MS = 450;
  const FUSE_DISTANCE = 120;
  const FUSE_MIN_DISTANCE = 88;
  const RETURN_DISTANCE = 160;

  let pressTimer = null;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let cardX = 0;
  let cardY = 0;
  let holdTriggered = false;
  let fused = false;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }

  function setFused(on) {
    fused = !!on;
    card.classList.toggle('di-fused', fused);
    card.classList.toggle('di-near-bar', fused);
    bar.classList.toggle('di-fuse-glow', fused);
    archBtn?.classList.toggle('di-orb-returning', fused);
    if (fused) {
      archBtn?.classList.add('di-orb-pulse');
      setTimeout(() => archBtn?.classList.remove('di-orb-pulse'), 480);
    }
  }

  function updateProximity() {
    const c = centerOf(card);
    const b = centerOf(bar);
    const d = dist(c, b);

    if (dragging) {
      const near = d <= FUSE_DISTANCE;
      card.classList.toggle('di-near-bar', near);
      bar.classList.toggle('di-fuse-glow', near);

      if (near) {
        const t = clamp((FUSE_DISTANCE - d) / (FUSE_DISTANCE - FUSE_MIN_DISTANCE), 0, 1);
        card.style.transform = `scale(${(.965 - t * 0.065).toFixed(3)})`;
        card.style.opacity = (0.82 - t * 0.24).toFixed(3);
      } else {
        card.style.transform = '';
        card.style.opacity = '';
      }

      if (d <= FUSE_MIN_DISTANCE) setFused(true);
      if (fused && d >= RETURN_DISTANCE) setFused(false);
    }
  }

  function beginHold(e) {
    if (e.button === 2) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    holdTriggered = false;

    try { handle.setPointerCapture(pointerId); } catch {}

    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      holdTriggered = true;
      card.classList.add('di-near-bar');
      bar.classList.add('di-fuse-glow');
      // se o usuário só segurar, abre o painel direto
      window.setMode?.('card', true);
    }, LONG_PRESS_MS);
  }

  function onMove(e) {
    if (pointerId !== e.pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragging && Math.hypot(dx, dy) > 6) {
      dragging = true;
      clearTimeout(pressTimer);
    }

    if (!dragging) return;

    // não interfere no teu sistema; só reage ao estado visual
    updateProximity();
  }

  function endGesture() {
    clearTimeout(pressTimer);

    if (dragging) {
      updateProximity();
      if (!fused) {
        card.classList.remove('di-near-bar');
        bar.classList.remove('di-fuse-glow');
      }
    } else if (holdTriggered) {
      window.setMode?.('card', true);
    }

    dragging = false;
    pointerId = null;
    holdTriggered = false;
  }

  handle.addEventListener('pointerdown', beginHold, { passive: true });
  handle.addEventListener('pointermove', onMove, { passive: true });
  handle.addEventListener('pointerup', endGesture, { passive: true });
  handle.addEventListener('pointercancel', endGesture, { passive: true });
  handle.addEventListener('pointerleave', () => {
    clearTimeout(pressTimer);
  }, { passive: true });

  // botão do orb: segurar = abre painel; arrastar pra fora = retorna orb
  if (archBtn) {
    let archTimer = null;
    let archDragging = false;
    let archStart = { x: 0, y: 0 };

    archBtn.addEventListener('pointerdown', (e) => {
      archDragging = false;
      archStart = { x: e.clientX, y: e.clientY };
      clearTimeout(archTimer);

      archTimer = setTimeout(() => {
        window.setMode?.('card', true);
      }, LONG_PRESS_MS);
    }, { passive: true });

    archBtn.addEventListener('pointermove', (e) => {
      const dx = e.clientX - archStart.x;
      const dy = e.clientY - archStart.y;

      if (!archDragging && Math.hypot(dx, dy) > 8) {
        archDragging = true;
        clearTimeout(archTimer);
      }

      if (archDragging) {
        const b = centerOf(bar);
        const btn = centerOf(archBtn);
        const d = dist(btn, b);

        if (d > RETURN_DISTANCE) setFused(false);
        if (d <= FUSE_DISTANCE) setFused(true);
      }
    }, { passive: true });

    archBtn.addEventListener('pointerup', () => clearTimeout(archTimer), { passive: true });
    archBtn.addEventListener('pointercancel', () => clearTimeout(archTimer), { passive: true });
  }

  window.addEventListener('resize', updateProximity);
})();