(function () {
  const STORAGE_KEY = 'di_symbol_positions_v1';
  const SNAP_MARGIN = 72;           // px distance from edge to trigger snap
  const TOP_THRESHOLD = 80;         // px from top to become horizontal
  const CONNECT_THRESHOLD = 72;     // px distance between centers to connect
  const EDGE_PADDING = 12;          // keep docks from touching screen edge directly

  const bars = Array.from(document.querySelectorAll('.symbol-bar'));

  // Initialize: ensure each bar has an id (data-sb-id) and insert magnet halo
  bars.forEach((bar, idx) => {
    if (!bar.dataset.sbId) bar.dataset.sbId = `symbolbar_${idx+1}`;
    if (!bar.querySelector('.magnet-halo')) {
      const halo = document.createElement('div');
      halo.className = 'magnet-halo';
      bar.appendChild(halo);
    }
  });

  // Load saved positions
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  })();

  // Apply saved or default positions
  bars.forEach(bar => {
    const id = bar.dataset.sbId;
    const pos = saved[id];
    // Clear inline positioning if none saved (preserve original CSS)
    if (pos && typeof pos === 'object') {
      // Use left/top coordinates
      bar.style.left = pos.left + 'px';
      bar.style.top = pos.top + 'px';
      bar.style.right = 'auto';
      bar.classList.toggle('horizontal', !!pos.horizontal);
    } else {
      // No saved position: leave original CSS. Ensure computed values will be used later.
    }
    // make sure the bar respects inside bounds flag (optional)
    if (!bar.hasAttribute('data-keep-inside')) bar.setAttribute('data-keep-inside', 'true');
  });

  // Utility helpers
  function viewport() { return { w: window.innerWidth, h: window.innerHeight }; }
  function getCenter(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height, left: r.left, top: r.top };
  }
  function distance(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // Save function
  function savePosition(bar) {
    try {
      const id = bar.dataset.sbId;
      const rect = bar.getBoundingClientRect();
      const pos = { left: Math.round(rect.left), top: Math.round(rect.top), horizontal: bar.classList.contains('horizontal') };
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[id] = pos;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* ignore */ }
  }

  // Reset to default (clear stored, remove inline)
  function resetPosition(bar) {
    const id = bar.dataset.sbId;
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete store[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    bar.style.left = '';
    bar.style.top = '';
    bar.style.right = '18px';
    bar.style.transform = 'translateY(-50%)';
    bar.classList.remove('horizontal', 'connected', 'snap', 'dragging', 'magnet-preview');
  }

  // Snap logic on release
  function finalizeSnap(bar) {
    const v = viewport();
    const rect = bar.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top;

    // Snap to left / right if near edges
    if (rect.left <= SNAP_MARGIN) {
      x = EDGE_PADDING;
      bar.classList.remove('horizontal');
    } else if (rect.right >= v.w - SNAP_MARGIN) {
      x = v.w - rect.width - EDGE_PADDING;
      bar.classList.remove('horizontal');
    }

    // If near top, turn horizontal and snap to top center-ish
    if (rect.top <= TOP_THRESHOLD) {
      bar.classList.add('horizontal');
      // center horizontally near current x but constrained
      x = clamp(x, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
      y = EDGE_PADDING + 6;
    } else {
      bar.classList.remove('horizontal');
      // vertically clamp within viewport
      y = clamp(y, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
    }

    // Inter-dock connect: find nearest other bar within threshold
    const myCenter = { x: x + rect.width/2, y: y + rect.height/2 };
    let nearest = null;
    let nearestDist = Infinity;
    bars.forEach(other => {
      if (other === bar) return;
      const oRect = other.getBoundingClientRect();
      const oCenter = { x: oRect.left + oRect.width/2, y: oRect.top + oRect.height/2 };
      const d = distance(myCenter, oCenter);
      if (d < nearestDist) { nearestDist = d; nearest = other; }
    });

    if (nearest && nearestDist <= CONNECT_THRESHOLD) {
      // Snap adjacent to nearest (choose side based on relative X)
      const oRect = nearest.getBoundingClientRect();
      // If nearest is top-horizontal, snap below or to side
      if (nearest.classList.contains('horizontal')) {
        // place below the nearest
        x = clamp(oRect.left, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
        y = clamp(oRect.top + oRect.height + 8, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
      } else {
        // place to the right or left
        if (myCenter.x >= oRect.left + oRect.width/2) {
          // place to right
          x = clamp(oRect.left + oRect.width + 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
        } else {
          // place to left
          x = clamp(oRect.left - rect.width - 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
        }
        // align vertically to nearest
        y = clamp(oRect.top, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
      }
      // add .connected to both
      bar.classList.add('connected');
      nearest.classList.add('connected');
    } else {
      // clear connected class on others
      bars.forEach(b => b.classList.remove('connected'));
      bar.classList.remove('connected');
    }

    // Apply final snapped position with smooth transition
    bar.classList.add('snap');
    bar.style.left = Math.round(x) + 'px';
    bar.style.top = Math.round(y) + 'px';
    bar.style.right = 'auto';

    // small timeout to remove snap class (keeps transition)
    setTimeout(() => bar.classList.remove('snap'), 300);

    // Save
    savePosition(bar);
  }

  // Drag handling
  bars.forEach(bar => {
    let dragging = false;
    let pointerId = null;
    let startX = 0, startY = 0;
    let barStartLeft = 0, barStartTop = 0;

    // ensure bar has computed initial left/top if CSS uses right/translateY
    function ensureAbsoluteCoords() {
      const rect = bar.getBoundingClientRect();
      // If style.left is empty, set left from computed rect
      if (!bar.style.left) {
        bar.style.left = rect.left + 'px';
      }
      if (!bar.style.top) {
        bar.style.top = rect.top + 'px';
      }
      // Remove transform to avoid mixing translateY with left/top during drag
      bar.style.transform = 'none';
    }

    function onPointerDown(e) {
      // left button or touch only
      if (e.button === 2) return;
      dragging = true;
      pointerId = e.pointerId;
      bar.setPointerCapture(pointerId);
      bar.classList.add('dragging');

      ensureAbsoluteCoords();

      const rect = bar.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      barStartLeft = rect.left;
      barStartTop = rect.top;

      // Add preview visual
      bar.classList.add('magnet-preview');

      // small performance friendly move handler via rAF
      let latest = null;
      function moveHandler(ev) { latest = ev; }
      function frame() {
        if (!dragging) return;
        if (latest) {
          const dx = latest.clientX - startX;
          const dy = latest.clientY - startY;
          const newLeft = clamp(barStartLeft + dx, EDGE_PADDING - 2000, window.innerWidth - 40); // allow some off-screen during drag then clamp on finalize
          const newTop = clamp(barStartTop + dy, EDGE_PADDING - 2000, window.innerHeight - 40);
          bar.style.left = Math.round(newLeft) + 'px';
          bar.style.top = Math.round(newTop) + 'px';
          // while dragging, check magnet proximity to other bars and edges
          checkMagnetPreview(bar);
          latest = null;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      // temporary attach move listener
      bar.addEventListener('pointermove', moveHandler);
      // attach pointerup/leave on document to ensure release
      function upHandler(ev) {
        if (!dragging) return;
        dragging = false;
        bar.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);
        finalizeDrag(ev);
      }
      document.addEventListener('pointerup', upHandler);
      // also handle pointercancel
      function cancelHandler(ev) {
        if (!dragging) return;
        dragging = false;
        bar.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointercancel', cancelHandler);
        finalizeDrag(ev);
      }
      document.addEventListener('pointercancel', cancelHandler);
    }

    function finalizeDrag(ev) {
      try {
        if (pointerId !== null) bar.releasePointerCapture(pointerId);
      } catch (e) {}
      bar.classList.remove('dragging');
      bar.classList.remove('magnet-preview');
      // finalize snap & connections
      finalizeSnap(bar);
    }

    // Magnet preview: visual hint when near edges or other bars
    function checkMagnetPreview(activeBar) {
      const r = activeBar.getBoundingClientRect();
      const v = viewport();
      const halo = activeBar.querySelector('.magnet-halo');
      let preview = false;

      // edge proximity
      if (r.left <= SNAP_MARGIN || r.right >= v.w - SNAP_MARGIN || r.top <= TOP_THRESHOLD) {
        preview = true;
      }

      // proximity to other bars
      for (const other of bars) {
        if (other === activeBar) continue;
        const o = other.getBoundingClientRect();
        const d = distance({ x: r.left + r.width/2, y: r.top + r.height/2 }, { x: o.left + o.width/2, y: o.top + o.height/2 });
        if (d <= CONNECT_THRESHOLD) { preview = true; break; }
      }

      activeBar.classList.toggle('magnet-preview', preview);
      if (halo) halo.style.opacity = preview ? '0.95' : '0';
    }

    // pointer handlers
    bar.addEventListener('pointerdown', onPointerDown, { passive: true });

    // double-click to reset position
    bar.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      resetPosition(bar);
    });

    // keyboard accessibility: press Escape while focused to cancel dragging & save current
    bar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        bar.classList.remove('dragging', 'magnet-preview');
        finalizeSnap(bar);
      }
    });

  }); // end bars.forEach

  // Window resize: ensure bars stay inside viewport
  window.addEventListener('resize', () => {
    bars.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      const v = viewport();
      const newLeft = clamp(rect.left, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
      const newTop = clamp(rect.top, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
      bar.style.left = Math.round(newLeft) + 'px';
      bar.style.top = Math.round(newTop) + 'px';
      savePosition(bar);
    });
  });

  // Clean up connected classes when user interacts elsewhere
  document.addEventListener('pointerdown', (ev) => {
    // if click not on a bar, clear .connected states after small timeout
    if (!ev.target.closest('.symbol-bar')) {
      setTimeout(() => bars.forEach(b => b.classList.remove('connected')), 120);
    }
  });

  // Expose a small API on window for convenience
  window.DI_SYMBOL_BAR = {
    resetAll: function() {
      bars.forEach(b => resetPosition(b));
    },
    saveAll: function() {
      bars.forEach(b => savePosition(b));
    },
    getState: function() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
    }
  };

  // Finalize: ensure all bars have sensible positions (clamped)
  setTimeout(() => {
    bars.forEach(bar => {
      const rect = bar.getBoundingClientRect();
      // if no inline left/top, leave as-is (CSS-controlled)
      if (!bar.style.left && !bar.style.top) return;
      const v = viewport();
      const left = clamp(parseFloat(bar.style.left || rect.left), EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
      const top = clamp(parseFloat(bar.style.top || rect.top), EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
      bar.style.left = Math.round(left) + 'px';
      bar.style.top = Math.round(top) + 'px';
      bar.style.right = 'auto';
    });
  }, 100);
})();