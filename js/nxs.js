
(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const VISIBLE      = 3;      // botões visíveis no carrossel
  const LONG_MS      = 3000;   // ms long-press toggle
  const DASH_TOG     = 113.1;  // 2π × 18
  const SCALE_CENTER = 1.0;    // escala do botão central
  const SCALE_SIDE   = 0.72;   // escala dos botões laterais adjacentes
  const SCALE_FAR    = 0.52;   // escala dos botões mais distantes
  const OPACITY_SIDE = 0.65;
  const OPACITY_FAR  = 0.35;

  /* ── TOAST ─────────────────────────────────────────────── */
  function toast(msg, ms = 2200) {
    const el = document.getElementById('kblx-toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms);
  }

  /* ── LER TAMANHO REAL DO TOGGLE BTN ───────────────────── */
  function readBtnSize() {
    const toggle = document.getElementById('toggleBtn');
    if (!toggle) return 44;
    const r = toggle.getBoundingClientRect();
    return Math.round(r.width) || 44;
  }

  /* ── APLICAR VAR CSS GLOBAL ────────────────────────────── */
  function setCSSVars(sz) {
    const root = document.documentElement;
    root.style.setProperty('--kblx-btn-sz',  sz + 'px');
    root.style.setProperty('--kblx-vp-w', (sz * VISIBLE) + 'px');
    root.style.setProperty('--kblx-visible', VISIBLE);
  }

  /* ═══════════════════════════════════════════════════════
     1. CONSTRUIR CARROSSEL
  ═══════════════════════════════════════════════════════ */
  function buildCarousel() {
    const bar   = document.getElementById('symbolBar');
    const wraps = Array.from(bar.querySelectorAll('.symbol-wrap'));
    if (!wraps.length) return null;

    /* viewport */
    const vp = document.createElement('div');
    vp.className = 'kblx-carousel-viewport';
    vp.id = 'kblx-vp';

    /* track */
    const track = document.createElement('div');
    track.className = 'kblx-carousel-track';
    track.id = 'kblx-track';

    wraps.forEach(w => track.appendChild(w));
    vp.appendChild(track);

    /* dots */
    const dotsEl = document.createElement('div');
    dotsEl.className = 'kblx-dots';
    dotsEl.id = 'kblx-dots';

    /* inserir antes do hud-info */
    const hudInfo = bar.querySelector('.hud-info');
    if (hudInfo) {
      bar.insertBefore(vp, hudInfo);
      bar.insertBefore(dotsEl, hudInfo);
    } else {
      bar.appendChild(vp);
      bar.appendChild(dotsEl);
    }

    return { track, vp, dotsEl };
  }

  /* ═══════════════════════════════════════════════════════
     2. LÓGICA DO CARROSSEL + COVERFLOW
  ═══════════════════════════════════════════════════════ */
  function initCarousel(track, vp, dotsEl) {
    let currentIndex = 0;   // primeiro visível
    let isVertical   = false;
    let btnSz        = readBtnSize();

    /* offset acumulado real para animação contínua */
    let baseOffset  = 0;
    let dragStart   = 0;
    let dragDelta   = 0;
    let isDragging  = false;

    /* ── Orientação ── */
    function checkOrientation() {
      const bar = document.getElementById('symbolBar');
      isVertical = !!(bar && bar.classList.contains('vertical'));
    }

    /* ── Tamanho dinâmico ── */
    function refreshSize() {
      btnSz = readBtnSize();
      setCSSVars(btnSz);
    }

    /* ── Total de itens ── */
    function count() {
      return track.querySelectorAll('.symbol-wrap').length;
    }

    /* ── Máximo de offset (em índices) ── */
    function maxIdx() { return Math.max(0, count() - VISIBLE); }

    /* ─────────────────────────────────────────────────────
       COVERFLOW: aplica escala e opacidade por distância
       do centro visual.
       centerIdx = índice do botão que está no centro do vp
    ───────────────────────────────────────────────────── */
    function applyCoverFlow(offsetPx) {
      const items = track.querySelectorAll('.symbol-wrap');
      /* índice fracionário do item no centro do viewport */
      const centerFrac = offsetPx / btnSz + (VISIBLE - 1) / 2;

      items.forEach((item, i) => {
        const dist = Math.abs(i - centerFrac);  /* 0 = centro exato */

        let scale, opacity, z;
        if (dist < 0.5) {
          /* blend suave centro → lado */
          const t = dist / 0.5;
          scale   = SCALE_CENTER + t * (SCALE_SIDE - SCALE_CENTER);
          opacity = 1 + t * (OPACITY_SIDE - 1);
          z       = 10;
        } else if (dist < 1.5) {
          const t = (dist - 0.5) / 1.0;
          scale   = SCALE_SIDE + t * (SCALE_FAR - SCALE_SIDE);
          opacity = OPACITY_SIDE + t * (OPACITY_FAR - OPACITY_SIDE);
          z       = 5;
        } else {
          scale   = SCALE_FAR;
          opacity = OPACITY_FAR;
          z       = 1;
        }

        item.style.setProperty('--kblx-item-scale',   scale.toFixed(3));
        item.style.setProperty('--kblx-item-opacity',  opacity.toFixed(3));
        item.style.setProperty('--kblx-item-z',       z);
      });
    }

    /* ── Aplicar translação no track ── */
    function applyTrack(offsetPx, animate) {
      if (animate) track.classList.remove('dragging');
      else         track.classList.add('dragging');

      const prop = isVertical ? 'translateY' : 'translateX';
      track.style.transform = `${prop}(${-offsetPx}px)`;
      applyCoverFlow(offsetPx);
    }

    /* ── Snap para índice ── */
    function snapTo(idx) {
      currentIndex = Math.max(0, Math.min(Math.round(idx), maxIdx()));
      baseOffset   = currentIndex * btnSz;
      applyTrack(baseOffset, true);
      renderDots();
    }

    /* ── Dots ── */
    function renderDots() {
      dotsEl.innerHTML = '';
      const total = count();
      const pages = Math.ceil(total / VISIBLE);
      const activePage = Math.floor(currentIndex / VISIBLE);
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('div');
        d.className = 'kblx-dot' + (i === activePage ? ' active' : '');
        d.addEventListener('click', () => snapTo(i * VISIBLE));
        dotsEl.appendChild(d);
      }
      dotsEl.style.display = total <= VISIBLE ? 'none' : 'flex';
    }

    /* ── DRAG (mouse) ── */
    track.addEventListener('mousedown', e => {
      isDragging = true;
      dragStart  = isVertical ? e.clientY : e.clientX;
      dragDelta  = 0;
      track.classList.add('dragging');
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragDelta = (isVertical ? e.clientY : e.clientX) - dragStart;
      applyTrack(baseOffset - dragDelta, false);
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const steps = Math.round(-dragDelta / btnSz);
      snapTo(currentIndex + steps);
    });

    /* ── DRAG (touch) ── */
    track.addEventListener('touchstart', e => {
      const t = e.touches[0];
      dragStart  = isVertical ? t.clientY : t.clientX;
      dragDelta  = 0;
      isDragging = true;
      track.classList.add('dragging');
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const t = e.touches[0];
      dragDelta = (isVertical ? t.clientY : t.clientX) - dragStart;
      applyTrack(baseOffset - dragDelta, false);
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const steps = Math.round(-dragDelta / btnSz);
      snapTo(currentIndex + steps);
    });

    /* ── WHEEL ── */
    vp.addEventListener('wheel', e => {
      e.preventDefault();
      const dir = (isVertical ? e.deltaY : e.deltaX || e.deltaY);
      snapTo(currentIndex + (dir > 0 ? 1 : -1));
    }, { passive: false });

    /* ── INIT ── */
    refreshSize();
    checkOrientation();
    applyCoverFlow(0);
    renderDots();

    window.addEventListener('resize', () => {
      refreshSize();
      checkOrientation();
      snapTo(currentIndex);
    });

    /* API pública */
    window._kblxCarouselRefresh = () => {
      refreshSize();
      checkOrientation();
      renderDots();
      snapTo(currentIndex);
    };
  }

  /* ═══════════════════════════════════════════════════════
     3. LONG-PRESS NO ≡ (TOGGLE BTN)
  ═══════════════════════════════════════════════════════ */
  function initToggleLongPress() {
    const btn = document.getElementById('toggleBtn');
    if (!btn) return;

    const ringDiv = document.createElement('div');
    ringDiv.className = 'kblx-toggle-ring';
    ringDiv.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/></svg>';
    btn.appendChild(ringDiv);

    const circle = ringDiv.querySelector('circle');

    let _t0 = null, _timer = null, _raf = null;

    function setRing(pct) {
      circle.style.transition = 'none';
      circle.style.strokeDashoffset = DASH_TOG * (1 - Math.min(pct, 1));
    }
    function resetRing() {
      circle.style.transition = 'stroke-dashoffset 0.22s ease';
      circle.style.strokeDashoffset = DASH_TOG;
    }

    function onDown() {
      _t0 = Date.now();
      _timer = setTimeout(() => {
        cancelAnimationFrame(_raf);
        resetRing();
        _t0 = null;
        openAddModal();
      }, LONG_MS);
      (function tick() {
        if (_t0 === null) return;
        setRing((Date.now() - _t0) / LONG_MS);
        _raf = requestAnimationFrame(tick);
      })();
    }
    function onUp() {
      clearTimeout(_timer);
      cancelAnimationFrame(_raf);
      resetRing();
      _t0 = null;
    }

    btn.addEventListener('pointerdown',   onDown, { passive: true });
    btn.addEventListener('pointerup',     onUp,   { passive: true });
    btn.addEventListener('pointerleave',  onUp,   { passive: true });
    btn.addEventListener('pointercancel', onUp,   { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     4. MODAL — ADICIONAR BOTÃO
  ═══════════════════════════════════════════════════════ */
  function openAddModal() {
    document.getElementById('kblx-sym-inp').value  = '';
    document.getElementById('kblx-id-inp').value   = '';
    document.getElementById('kblx-url-inp').value  = '';
    document.getElementById('kblx-sym-preview').textContent = '☯';
    document.getElementById('kblx-addbtn-back').classList.add('open');
    setTimeout(() => document.getElementById('kblx-sym-inp').focus(), 80);
  }
  function closeAddModal() {
    document.getElementById('kblx-addbtn-back').classList.remove('open');
  }

  function saveNewButton() {
    const sym = document.getElementById('kblx-sym-inp').value.trim() || '●';
    const id  = document.getElementById('kblx-id-inp').value.trim()  || ('btn-' + Date.now());
    const url = document.getElementById('kblx-url-inp').value.trim();

    if (!url) {
      const inp = document.getElementById('kblx-url-inp');
      inp.style.borderColor = '#ff3c3c';
      inp.focus();
      setTimeout(() => inp.style.borderColor = '', 1200);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'symbol-wrap';

    const newBtn = document.createElement('button');
    newBtn.className   = 'symbol-button';
    newBtn.dataset.id  = id;
    newBtn.dataset.url = url;
    newBtn.title       = id;
    newBtn.textContent = sym;
    newBtn.style.position = 'relative';

    wrap.appendChild(newBtn);

    const track = document.getElementById('kblx-track');
    if (track) {
      track.appendChild(wrap);
    } else {
      const bar     = document.getElementById('symbolBar');
      const hudInfo = bar && bar.querySelector('.hud-info');
      if (hudInfo) bar.insertBefore(wrap, hudInfo);
      else if (bar) bar.appendChild(wrap);
    }

    /* injetar anel long-press (compatível com patch-13) */
    injectNavRing(newBtn);

    if (typeof window._kblxCarouselRefresh === 'function') {
      window._kblxCarouselRefresh();
    }

    closeAddModal();
    toast(`⊙ Botão "${sym}" adicionado`);
  }

  /* ── Anel nos botões nav (idêntico ao patch-13) ── */
  function injectNavRing(btn) {
    const DASH = 119.38, LP = 3000;
    const d = document.createElement('div');
    d.className = 'kblx-ring';
    d.innerHTML = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/></svg>';
    btn.appendChild(d);

    let _t0 = null, _timer = null, _raf = null;

    function ring(pct) {
      const c = btn.querySelector('.kblx-ring circle');
      if (!c) return;
      c.style.transition = 'none';
      c.style.strokeDashoffset = DASH * (1 - Math.min(pct, 1));
    }
    function ringReset() {
      const c = btn.querySelector('.kblx-ring circle');
      if (!c) return;
      c.style.transition = 'stroke-dashoffset .2s ease';
      c.style.strokeDashoffset = DASH;
    }

    btn.addEventListener('pointerdown', () => {
      _t0 = Date.now();
      _timer = setTimeout(() => {
        cancelAnimationFrame(_raf);
        ringReset(); _t0 = null;
        /* tenta usar o editor do patch-13 */
        const back = document.getElementById('kblx-back');
        const ttl  = document.getElementById('kblx-ttl');
        const inp  = document.getElementById('kblx-inp');
        if (back && ttl && inp) {
          ttl.textContent = 'Botão  ' + btn.textContent.trim();
          inp.value = btn.dataset.url || '';
          back._activeBtn = btn;
          back.classList.add('open');
        }
      }, LP);
      (function tick() {
        if (_t0 === null) return;
        ring((Date.now() - _t0) / LP);
        _raf = requestAnimationFrame(tick);
      })();
    }, { passive: true });

    ['pointerup','pointerleave','pointercancel'].forEach(ev => {
      btn.addEventListener(ev, () => {
        clearTimeout(_timer); cancelAnimationFrame(_raf);
        ringReset(); _t0 = null;
      }, { passive: true });
    });
  }

  /* ── Bind modal ── */
  function bindModal() {
    document.getElementById('kblx-addbtn-ok')
      .addEventListener('click', saveNewButton);
    document.getElementById('kblx-addbtn-cancel')
      .addEventListener('click', closeAddModal);
    document.getElementById('kblx-addbtn-back')
      .addEventListener('click', e => {
        if (e.target.id === 'kblx-addbtn-back') closeAddModal();
      });
    document.addEventListener('keydown', e => {
      if (!document.getElementById('kblx-addbtn-back').classList.contains('open')) return;
      if (e.key === 'Escape') closeAddModal();
      if (e.key === 'Enter')  saveNewButton();
    });
    document.getElementById('kblx-sym-inp').addEventListener('input', e => {
      document.getElementById('kblx-sym-preview').textContent = e.target.value.trim() || '☯';
    });
  }

  /* ═══════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    /* 1. ler tamanho real dos botões após layout */
    setCSSVars(readBtnSize());

    /* 2. montar carrossel */
    const els = buildCarousel();
    if (els) initCarousel(els.track, els.vp, els.dotsEl);

    /* 3. long-press no toggle */
    initToggleLongPress();

    /* 4. modal */
    bindModal();

    /* 5. segunda leitura de tamanho após scripts externos */
    requestAnimationFrame(() => {
      setCSSVars(readBtnSize());
      if (typeof window._kblxCarouselRefresh === 'function') {
        window._kblxCarouselRefresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 150);
  }

})();
