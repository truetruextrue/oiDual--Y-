(() => {
  if (window.__KOB_UNIFIED_IIFE_ACTIVE) return;
  window.__KOB_UNIFIED_IIFE_ACTIVE = true;

  /* =========================================================
     HELPERS
  ========================================================= */
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const setCSS = (v, val) => document.documentElement.style.setProperty(v, val);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const toast = window.toast || (window.toast = (msg) => {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText =
      'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
      'background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;' +
      'z-index:10000;font:14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  });

  function injectStyle(id, cssText) {
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = cssText;
    document.head.appendChild(s);
  }

  injectStyle('kob-unified-style', `
    .kob-tts-dock { transition: transform .35s ease, opacity .65s ease; }
    .kob-tts-dock.idle { opacity:.18; transform:scale(.92); }
    .kob-tts-dock:hover { opacity:1; transform:scale(1); }

    .symbol-bar {
      position: fixed !important;
      right: auto;
      top: 50%;
      transform: translateY(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 14px;
      border-radius: 42px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
        rgba(8,10,18,0.66);
      backdrop-filter: blur(22px) saturate(150%);
      -webkit-backdrop-filter: blur(22px) saturate(150%);
      border: 1px solid color-mix(in srgb, var(--kob-voice-primary) 30%, transparent);
      box-shadow:
        0 10px 40px rgba(0,0,0,0.65),
        inset 0 0 12px rgba(255,255,255,0.03),
        0 0 18px color-mix(in srgb, var(--kob-voice-primary) 22%, transparent);
      transition: transform .28s cubic-bezier(.23,1,.32,1), opacity .45s ease, box-shadow .28s ease;
      touch-action: none;
      user-select: none;
      cursor: grab;
    }

    .symbol-bar.idle {
      opacity:.14;
      transform: translateY(-50%) scale(.88);
      filter:grayscale(.4) brightness(.8);
    }

    .symbol-bar:hover { transform: translateY(-50%) scale(1.05); }

    .symbol-bar.dragging {
      transition: none !important;
      transform: none !important;
      cursor: grabbing;
      z-index: 10001 !important;
      box-shadow:
        0 30px 70px rgba(0,0,0,0.75),
        inset 0 0 18px rgba(255,255,255,0.04),
        0 0 40px color-mix(in srgb,var(--kob-voice-primary) 40%, transparent);
    }

    .symbol-bar.horizontal {
      flex-direction: row;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 28px;
      transform-origin: top center;
    }

    .symbol-bar.connected {
      outline: 1px dashed color-mix(in srgb,var(--kob-voice-primary) 35%, transparent);
      outline-offset: 6px;
    }

    .symbol-bar.snap {
      transition: left .22s cubic-bezier(.2,.9,.3,1), top .22s cubic-bezier(.2,.9,.3,1), transform .22s ease;
    }

    .symbol-bar.horizontal .symbol-button {
      width: 44px;
      height: 44px;
      border-radius: 12px;
    }

    .symbol-bar .orb-mini { width: 26px; height: 26px; }

    .symbol-bar .magnet-halo {
      position: absolute;
      inset: -8px;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      transition: opacity .16s ease;
    }

    .symbol-bar.magnet-preview .magnet-halo {
      opacity: 1;
      background: linear-gradient(90deg, transparent, color-mix(in srgb,var(--kob-voice-primary) 20%, transparent));
      filter: blur(8px);
    }

    .symbol-bar[data-keep-inside="true"] { max-width: calc(100vw - 12px); }

    #kob-tts-outline {
      position:absolute;
      pointer-events:none;
      border:2px solid rgba(0,255,255,.9);
      border-radius:12px;
      box-shadow: 0 0 0 2px rgba(255,255,255,.08), 0 0 30px rgba(0,255,255,.25);
      z-index:9998;
      display:none;
    }

    .kob-tts-dock[data-dragging="true"] {
      user-select:none;
      touch-action:none;
    }
  `);

  /* =========================================================
     TOAST + TTS DOCK
  ========================================================= */
  (() => {
    if (window.__KOB_TTS_V32_ACTIVE) return;
    window.__KOB_TTS_V32_ACTIVE = true;

    const POS_KEY  = 'kob_tts_pos_standalone';
    const PREF_KEY = 'kob_tts_prefs_standalone';
    const ROOTS    = ['#root', 'body'];
    const BLOCK_SEL = ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th'].join(',');

    function readPrefs() {
      try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch { return {}; }
    }
    function savePrefs() {
      try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); } catch {}
    }
    function applySavedPos() {
      try {
        const s = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
        if (s) {
          setCSS('--tts-left', s.left);
          setCSS('--tts-bottom', s.bottom);
        }
      } catch {}
    }
    function savePos() {
      try {
        const cs = getComputedStyle(document.documentElement);
        localStorage.setItem(POS_KEY, JSON.stringify({
          left: cs.getPropertyValue('--tts-left').trim(),
          bottom: cs.getPropertyValue('--tts-bottom').trim()
        }));
      } catch {}
    }
    function getRoot() {
      for (const s of ROOTS) {
        const el = document.querySelector(s);
        if (el) return el;
      }
      return document.body;
    }

    const PREFS = Object.assign({
      outline: true,
      asciiMode: 'describe',
      clickToSpeak: true,
      preferMale: false
    }, readPrefs());

    const dock = document.querySelector('.kob-tts-dock') || (() => {
      const d = document.createElement('div');
      d.className = 'kob-tts-dock';
      d.innerHTML = `
        <button id="tts-prev" title="Anterior">◀</button>
        <button id="tts-on" title="Voz On/Off" aria-pressed="false">🔊</button>
        <button id="tts-next" title="Próximo">▶</button>
        <button id="tts-sel" title="Ler seleção">✂︎</button>
        <button id="tts-reread" title="Re-Ler do início">⟳</button>
        <button id="tts-voice" title="Trocar Voz PT-BR">🎙</button>
        <button id="tts-stop" title="Parar">■</button>
        <button id="tts-reset" title="Reset + próxima seção">↻</button>
        <button id="tts-grid" title="Outline / Click-to-Speak">⌗</button>
        <small id="tts-status">Pronto.</small>
      `;
      document.body.appendChild(d);
      return d;
    })();

    const outline = document.getElementById('kob-tts-outline') || (() => {
      const o = document.createElement('div');
      o.id = 'kob-tts-outline';
      document.body.appendChild(o);
      return o;
    })();

    applySavedPos();

    /* Drag do dock TTS */
    (() => {
      let sx = 0, sy = 0, sl = 0, sb = 0, drag = false;

      const onDown = (ev) => {
        if (ev.target.tagName === 'BUTTON') return;
        const e = ev.touches ? ev.touches[0] : ev;
        drag = true;
        dock.dataset.dragging = 'true';
        dock.classList.add('is-drag');
        sx = e.clientX;
        sy = e.clientY;
        const cs = getComputedStyle(document.documentElement);
        sl = parseFloat(cs.getPropertyValue('--tts-left')) || 16;
        sb = parseFloat(cs.getPropertyValue('--tts-bottom')) || 20;
        addEventListener('pointermove', onMove, { passive: false });
        addEventListener('pointerup', onUp, { passive: false });
        addEventListener('touchmove', onMove, { passive: false });
        addEventListener('touchend', onUp, { passive: false });
      };

      const onMove = (ev) => {
        if (!drag) return;
        const e = ev.touches ? ev.touches[0] : ev;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        setCSS('--tts-left', Math.max(0, sl + dx) + 'px');
        setCSS('--tts-bottom', Math.max(0, sb - dy) + 'px');
      };

      const onUp = () => {
        if (!drag) return;
        drag = false;
        dock.dataset.dragging = 'false';
        dock.classList.remove('is-drag');
        savePos();
      };

      dock.addEventListener('pointerdown', onDown);
      dock.addEventListener('touchstart', onDown, { passive: true });
    })();

    const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    if (!synth) {
      console.warn('[TTS] SpeechSynthesis indisponível');
      return;
    }

    try { synth.cancel(); } catch {}

    let VOICES = [];
    let baseVoice = null;
    let voiceIdx = 0;
    let blocks = [];
    let idx = 0;
    let speaking = false;

    function loadVoices() {
      VOICES = synth.getVoices() || [];
      const pt = VOICES.filter(v => /pt/i.test(v.lang));
      baseVoice = pt[0] || VOICES[0] || null;
      voiceIdx = 0;
    }
    synth.onvoiceschanged = () => loadVoices();
    loadVoices();

    function cycleVoice() {
      const pt = VOICES.filter(v => /pt/i.test(v.lang));
      if (!pt.length) return;
      voiceIdx = (voiceIdx + 1) % pt.length;
      baseVoice = pt[voiceIdx];
      setStatus(`Voz: ${baseVoice.name || baseVoice.lang}`);
    }

    function setPressed(btn, on) {
      btn?.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    function setStatus(t) {
      const el = $('#tts-status', dock);
      if (!el) return;
      el.textContent = String(t);
    }

    function setStatusProgress() {
      const el = $('#tts-status', dock);
      if (!el) return;
      if (!blocks.length) {
        el.textContent = '0/0';
        return;
      }
      el.textContent = `${Math.min(idx + 1, blocks.length)}/${blocks.length}`;
    }

    function sanitize(txt) {
      return String(txt || '')
        .replace(/\bCopiar\b/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    function rebuild() {
      const root = getRoot();
      const nodes = $$(BLOCK_SEL, root);
      const out = [];
      for (const node of nodes) {
        const raw = node.innerText.trim();
        if (!raw) continue;
        out.push({ node, raw });
      }
      blocks = out;
      idx = 0;
      setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
    }

    function hideOutline() {
      outline.style.display = 'none';
    }

    function showOutlineFor(node) {
      if (!PREFS.outline || !node) return hideOutline();
      const r = node.getBoundingClientRect();
      outline.style.display = 'block';
      outline.style.left = (scrollX + r.left - 6) + 'px';
      outline.style.top = (scrollY + r.top - 6) + 'px';
      outline.style.width = (r.width + 12) + 'px';
      outline.style.height = (r.height + 12) + 'px';
    }

    function highlight() {
      $$('[data-tts-current]').forEach(el => el.removeAttribute('data-tts-current'));
      const b = blocks[idx];
      if (!b) return;
      b.node.setAttribute('data-tts-current', 'true');
      try { b.node.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      showOutlineFor(b.node);
    }

    addEventListener('scroll', () => {
      const b = blocks[idx];
      if (PREFS.outline && b) showOutlineFor(b.node);
    }, { passive: true });

    addEventListener('resize', () => {
      const b = blocks[idx];
      if (PREFS.outline && b) showOutlineFor(b.node);
    });

    function speakCurrent() {
      if (!blocks.length) rebuild();
      if (idx < 0) idx = 0;
      if (idx >= blocks.length) {
        stop();
        toast('Fim da leitura.');
        return;
      }

      const b = blocks[idx];
      const text = sanitize(b.raw);
      if (!text) {
        idx++;
        setStatusProgress();
        return speakCurrent();
      }

      try { synth.cancel(); } catch {}

      const u = new SpeechSynthesisUtterance(text);
      if (baseVoice) u.voice = baseVoice;
      u.lang = (baseVoice && baseVoice.lang) || 'pt-BR';
      u.rate = 1.0;
      u.pitch = 1.0;
      u.volume = 1;

      u.onend = () => {
        if (!speaking) return;
        idx++;
        setStatusProgress();
        speakCurrent();
      };
      u.onerror = () => {
        if (!speaking) return;
        idx++;
        setStatusProgress();
        speakCurrent();
      };

      highlight();
      setStatusProgress();
      synth.speak(u);
    }

    function play() {
      speaking = true;
      setPressed($('#tts-on', dock), true);
      if (!blocks.length) rebuild();
      speakCurrent();
    }

    function stop() {
      speaking = false;
      try { synth.cancel(); } catch {}
      setPressed($('#tts-on', dock), false);
      setStatus(blocks.length ? `${Math.min(idx + 1, blocks.length)}/${blocks.length}` : 'Pausado.');
      hideOutline();
    }

    function toggle() {
      speaking ? stop() : play();
    }

    function next() {
      if (!blocks.length) rebuild();
      speaking = true;
      setPressed($('#tts-on', dock), true);
      idx++;
      setStatusProgress();
      speakCurrent();
    }

    function prev() {
      if (!blocks.length) rebuild();
      speaking = true;
      setPressed($('#tts-on', dock), true);
      idx = Math.max(0, idx - 1);
      setStatusProgress();
      speakCurrent();
    }

    $('#tts-on', dock)?.addEventListener('click', e => { e.preventDefault(); toggle(); });
    $('#tts-prev', dock)?.addEventListener('click', e => { e.preventDefault(); prev(); });
    $('#tts-next', dock)?.addEventListener('click', e => { e.preventDefault(); next(); });
    $('#tts-stop', dock)?.addEventListener('click', e => { e.preventDefault(); stop(); });

    $('#tts-reread', dock)?.addEventListener('click', e => {
      e.preventDefault();
      stop();
      rebuild();
      idx = 0;
      play();
    });

    $('#tts-reset', dock)?.addEventListener('click', e => {
      e.preventDefault();
      stop();
      rebuild();
      idx = 0;
      setStatusProgress();
    });

    $('#tts-sel', dock)?.addEventListener('click', e => {
      e.preventDefault();
      const t = String(window.getSelection && window.getSelection()).trim();
      if (!t) {
        toast('Selecione um trecho para ler.');
        return;
      }
      try { synth.cancel(); } catch {}
      const uu = new SpeechSynthesisUtterance(sanitize(t));
      if (baseVoice) uu.voice = baseVoice;
      uu.lang = (baseVoice && baseVoice.lang) || 'pt-BR';
      synth.speak(uu);
    });

    $('#tts-grid', dock)?.addEventListener('click', e => {
      e.preventDefault();
      PREFS.outline = !PREFS.outline;
      PREFS.clickToSpeak = PREFS.outline;
      savePrefs();
      if (!PREFS.outline) hideOutline();
      else {
        const b = blocks[idx];
        b && showOutlineFor(b.node);
      }
      setPressed($('#tts-grid', dock), PREFS.outline);
      toast(PREFS.outline ? 'Outline Ativado' : 'Outline Desativado');
    });
    setPressed($('#tts-grid', dock), PREFS.outline);

    $('#tts-voice', dock)?.addEventListener('click', e => {
      e.preventDefault();
      cycleVoice();
      toast('Voz alterada');
    });

    document.addEventListener('click', (ev) => {
      const blk = ev.target.closest(BLOCK_SEL);
      if (!blk || ev.target.closest('.kob-tts-dock')) return;
      const i = blocks.findIndex(b => b.node === blk);
      if (i < 0) return;
      idx = i;
      if (PREFS.outline) showOutlineFor(blk);
      if (PREFS.clickToSpeak) {
        speaking = true;
        setPressed($('#tts-on', dock), true);
        speakCurrent();
      } else {
        setStatusProgress();
      }
    }, { passive: false });

    rebuild();
    setStatusProgress();
  })();

  /* =========================================================
     ARCHETYPES + ORB CLICK + IDLE BEHAVIOR
  ========================================================= */
  (() => {
    const ARCHS = ['kobllux','kodux','atlas','nova','vitalis','pulse','artemis','serena','kaos','genus','lumine','solus','rhea','aion','uno','dual','trinity','infodose','horus'];

    function setVoiceArch(name) {
      if (!name) return;
      document.body.dataset.voiceArch = name;
      const neb = document.querySelector('.nebula');
      if (neb) neb.dataset.voiceArch = name;

      const hud = document.getElementById('hudStatus');
      if (hud) hud.textContent = 'KOBLLUX · ' + name.toUpperCase();

      const dock = document.querySelector('.kob-tts-dock, .symbol-bar');
      if (dock && dock.animate) {
        dock.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
          { duration: 420, easing: 'ease-out' }
        );
      }
    }

    const orbBtn = document.getElementById('btn-arch');
    let archIndex = ARCHS.indexOf(document.body.dataset.voiceArch || 'kobllux');
    if (archIndex < 0) archIndex = 0;

    if (orbBtn) {
      orbBtn.addEventListener('click', () => {
        archIndex = (archIndex + 1) % ARCHS.length;
        const pick = ARCHS[archIndex];
        setVoiceArch(pick);
        document.body.dataset.archActive = '78knveeeb';
      }, { passive: true });

      let pressTimer;
      orbBtn.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(() => {
          archIndex = (archIndex - 1 + ARCHS.length) % ARCHS.length;
          setVoiceArch(ARCHS[archIndex]);
        }, 450);
      });

      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => {
        orbBtn.addEventListener(ev, () => clearTimeout(pressTimer));
      });
    }

    try {
      if (window.particlesJS) {
        particlesJS('particles-js', {
          particles: {
            number: { value: 46, density: { enable: true, value_area: 700 } },
            color: {
              value: [
                getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-primary').trim() || '#00ffff',
                getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-secondary').trim() || '#ff00ff'
              ]
            },
            shape: { type: 'circle' },
            opacity: { value: 0.45, random: true },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1.5, random: true, out_mode: 'out', attract: { enable: true, rotateX: 500, rotateY: 1000 } }
          },
          retina_detect: true
        });
      }
    } catch (err) {
      console.warn('particles init failed', err);
    }

    const dock = document.querySelector('.kob-tts-dock') || document.querySelector('.symbol-bar');
    let idleTimer;

    function resetIdle() {
      if (!dock) return;
      dock.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => dock.classList.add('idle'), 1870);
    }

    ['pointerdown', 'pointermove', 'touchstart', 'mousemove', 'keydown'].forEach(ev =>
      document.addEventListener(ev, resetIdle, { passive: true })
    );
    resetIdle();

    document.addEventListener('DOMContentLoaded', () => {
      const initial = document.body.dataset.voiceArch || 'kobllux';
      setVoiceArch(initial);
      document.body.dataset.archActive = document.body.dataset.archActive || '78knveeeb';
    });

    document.getElementById('btn-play')?.addEventListener('click', () => {
      document.body.classList.toggle('speaking');
    });

    document.querySelectorAll('.symbol-button[data-url]').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url && url !== 'about:blank') window.open(url, '_blank');
      });
    });
  })();

  /* =========================================================
     SYMBOL BAR: DRAG / SNAP / CONNECT / PERSISTENCE
  ========================================================= */
  (() => {
    const STORAGE_KEY = 'di_symbol_positions_v1';
    const SNAP_MARGIN = 72;
    const TOP_THRESHOLD = 80;
    const CONNECT_THRESHOLD = 72;
    const EDGE_PADDING = 12;

    const bars = Array.from(document.querySelectorAll('.symbol-bar'));
    if (!bars.length) return;

    bars.forEach((bar, idx) => {
      if (!bar.dataset.sbId) bar.dataset.sbId = `symbolbar_${idx + 1}`;
      if (!bar.querySelector('.magnet-halo')) {
        const halo = document.createElement('div');
        halo.className = 'magnet-halo';
        bar.appendChild(halo);
      }
      if (!bar.hasAttribute('data-keep-inside')) bar.setAttribute('data-keep-inside', 'true');
    });

    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    })();

    bars.forEach(bar => {
      const id = bar.dataset.sbId;
      const pos = saved[id];
      if (pos && typeof pos === 'object') {
        bar.style.left = pos.left + 'px';
        bar.style.top = pos.top + 'px';
        bar.style.right = 'auto';
        bar.classList.toggle('horizontal', !!pos.horizontal);
      }
    });

    function viewport() {
      return { w: window.innerWidth, h: window.innerHeight };
    }

    function distance(a, b) {
      const dx = a.x - b.x, dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function savePosition(bar) {
      try {
        const id = bar.dataset.sbId;
        const rect = bar.getBoundingClientRect();
        const pos = {
          left: Math.round(rect.left),
          top: Math.round(rect.top),
          horizontal: bar.classList.contains('horizontal')
        };
        const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        store[id] = pos;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch {}
    }

    function resetPosition(bar) {
      const id = bar.dataset.sbId;
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete store[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      bar.style.left = '';
      bar.style.top = '';
      bar.style.right = '';
      bar.style.transform = 'translateY(-50%)';
      bar.classList.remove('horizontal', 'connected', 'snap', 'dragging', 'magnet-preview');
    }

    function finalizeSnap(bar) {
      const v = viewport();
      const rect = bar.getBoundingClientRect();
      let x = rect.left;
      let y = rect.top;

      if (rect.left <= SNAP_MARGIN) {
        x = EDGE_PADDING;
        bar.classList.remove('horizontal');
      } else if (rect.right >= v.w - SNAP_MARGIN) {
        x = v.w - rect.width - EDGE_PADDING;
        bar.classList.remove('horizontal');
      }

      if (rect.top <= TOP_THRESHOLD) {
        bar.classList.add('horizontal');
        x = clamp(x, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
        y = EDGE_PADDING + 6;
      } else {
        bar.classList.remove('horizontal');
        y = clamp(y, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
      }

      const myCenter = { x: x + rect.width / 2, y: y + rect.height / 2 };
      let nearest = null;
      let nearestDist = Infinity;

      bars.forEach(other => {
        if (other === bar) return;
        const oRect = other.getBoundingClientRect();
        const oCenter = { x: oRect.left + oRect.width / 2, y: oRect.top + oRect.height / 2 };
        const d = distance(myCenter, oCenter);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = other;
        }
      });

      if (nearest && nearestDist <= CONNECT_THRESHOLD) {
        const oRect = nearest.getBoundingClientRect();
        if (nearest.classList.contains('horizontal')) {
          x = clamp(oRect.left, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
          y = clamp(oRect.top + oRect.height + 8, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
        } else {
          if (myCenter.x >= oRect.left + oRect.width / 2) {
            x = clamp(oRect.left + oRect.width + 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
          } else {
            x = clamp(oRect.left - rect.width - 8, EDGE_PADDING, v.w - rect.width - EDGE_PADDING);
          }
          y = clamp(oRect.top, EDGE_PADDING, v.h - rect.height - EDGE_PADDING);
        }
        bar.classList.add('connected');
        nearest.classList.add('connected');
      } else {
        bars.forEach(b => b.classList.remove('connected'));
        bar.classList.remove('connected');
      }

      bar.classList.add('snap');
      bar.style.left = Math.round(x) + 'px';
      bar.style.top = Math.round(y) + 'px';
      bar.style.right = 'auto';

      setTimeout(() => bar.classList.remove('snap'), 300);
      savePosition(bar);
    }

    function checkMagnetPreview(activeBar) {
      const r = activeBar.getBoundingClientRect();
      const v = viewport();
      const halo = activeBar.querySelector('.magnet-halo');
      let preview = false;

      if (r.left <= SNAP_MARGIN || r.right >= v.w - SNAP_MARGIN || r.top <= TOP_THRESHOLD) {
        preview = true;
      }

      for (const other of bars) {
        if (other === activeBar) continue;
        const o = other.getBoundingClientRect();
        const d = distance(
          { x: r.left + r.width / 2, y: r.top + r.height / 2 },
          { x: o.left + o.width / 2, y: o.top + o.height / 2 }
        );
        if (d <= CONNECT_THRESHOLD) {
          preview = true;
          break;
        }
      }

      activeBar.classList.toggle('magnet-preview', preview);
      if (halo) halo.style.opacity = preview ? '0.95' : '0';
    }

    bars.forEach(bar => {
      let dragging = false;
      let pointerId = null;
      let startX = 0, startY = 0;
      let barStartLeft = 0, barStartTop = 0;

      function ensureAbsoluteCoords() {
        const rect = bar.getBoundingClientRect();
        if (!bar.style.left) bar.style.left = rect.left + 'px';
        if (!bar.style.top) bar.style.top = rect.top + 'px';
        bar.style.transform = 'none';
      }

      function onPointerDown(e) {
        if (e.button === 2) return;
        dragging = true;
        pointerId = e.pointerId;
        try { bar.setPointerCapture(pointerId); } catch {}
        bar.classList.add('dragging');
        ensureAbsoluteCoords();

        const rect = bar.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        barStartLeft = rect.left;
        barStartTop = rect.top;
        bar.classList.add('magnet-preview');

        let latest = null;
        function moveHandler(ev) { latest = ev; }

        function frame() {
          if (!dragging) return;
          if (latest) {
            const dx = latest.clientX - startX;
            const dy = latest.clientY - startY;
            const newLeft = clamp(barStartLeft + dx, EDGE_PADDING - 2000, window.innerWidth - 40);
            const newTop = clamp(barStartTop + dy, EDGE_PADDING - 2000, window.innerHeight - 40);
            bar.style.left = Math.round(newLeft) + 'px';
            bar.style.top = Math.round(newTop) + 'px';
            checkMagnetPreview(bar);
            latest = null;
          }
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);

        bar.addEventListener('pointermove', moveHandler);

        function endDrag() {
          if (!dragging) return;
          dragging = false;
          bar.removeEventListener('pointermove', moveHandler);
          bar.classList.remove('dragging');
          bar.classList.remove('magnet-preview');
          try { if (pointerId !== null) bar.releasePointerCapture(pointerId); } catch {}
          finalizeSnap(bar);
        }

        function upHandler() {
          document.removeEventListener('pointerup', upHandler);
          document.removeEventListener('pointercancel', cancelHandler);
          endDrag();
        }

        function cancelHandler() {
          document.removeEventListener('pointerup', upHandler);
          document.removeEventListener('pointercancel', cancelHandler);
          endDrag();
        }

        document.addEventListener('pointerup', upHandler);
        document.addEventListener('pointercancel', cancelHandler);
      }

      bar.addEventListener('pointerdown', onPointerDown, { passive: true });

      bar.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        resetPosition(bar);
      });

      bar.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          bar.classList.remove('dragging', 'magnet-preview');
          finalizeSnap(bar);
        }
      });
    });

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

    document.addEventListener('pointerdown', (ev) => {
      if (!ev.target.closest('.symbol-bar')) {
        setTimeout(() => bars.forEach(b => b.classList.remove('connected')), 120);
      }
    });

    window.DI_SYMBOL_BAR = {
      resetAll() {
        bars.forEach(b => resetPosition(b));
      },
      saveAll() {
        bars.forEach(b => savePosition(b));
      },
      getState() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
      }
    };

    setTimeout(() => {
      bars.forEach(bar => {
        const rect = bar.getBoundingClientRect();
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
})();
