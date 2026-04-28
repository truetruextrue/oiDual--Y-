// Toast provisório para feedback visual
window.toast = (msg) => {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;z-index:10000;max-width:90vw;text-align:center;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
};

(() => {
  if (window.__KOB_TTS_V33_ACTIVE) return;
  window.__KOB_TTS_V33_ACTIVE = true;

  /* ---------- Constantes & Preferências ---------- */
  const POS_KEY   = 'kob_tts_pos_standalone';
  const PREF_KEY  = 'kob_tts_prefs_standalone';
  const ROOTS     = ['#root', 'body'];
  const BLOCK_SEL = ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th'].join(',');

  const $  = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const setCSS = (v, val) => document.documentElement.style.setProperty(v, val);
  const getRoot = () => {
    for (const s of ROOTS) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return document.body;
  };

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); }
    catch { return {}; }
  }

  function savePrefs() {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); }
    catch {}
  }

  function applySavedPos() {
    try {
      const s = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
      if (s) {
        if (typeof s.left === 'string') setCSS('--tts-left', s.left);
        if (typeof s.bottom === 'string') setCSS('--tts-bottom', s.bottom);
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

  const PREFS = Object.assign({
    outline: true,
    asciiMode: 'describe',
    clickToSpeak: true,
    preferMale: false
  }, readPrefs());

  /* ---------- Criação Dinâmica do Dock ---------- */
  const dock = document.querySelector('.kob-tts-dock') || (() => {
    const d = document.createElement('div');
    d.className = 'kob-tts-dock';
    d.innerHTML = `
      <div class="symbol-bar floating" id="symbolBar">
        <div class="toggle-wrap">
          <button class="symbol-button main-toggle" id="toggleBtn" title="Menu / Iniciar">≡</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-prev" title="Voltar Bloco">◀</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-on" title="Voz On/Off" aria-pressed="false">🔊</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-next" title="Próximo Bloco">▶</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-stop" title="Parar">■</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-grid" title="Outline / Click-to-Speak">⌗</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-reset" title="Reset + próxima seção">↻</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-reread" title="Re-Ler do início">⟳</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-sel" title="Ler seleção">✂︎</button>
        </div>

        <div class="symbol-wrap">
          <button class="symbol-button" id="tts-voice" title="Trocar Voz PT-BR">🎙</button>
        </div>

        <div class="symbol-wrap">
          <div class="drawer-toggle" onclick="toggleDrawer && toggleDrawer()" title="Abrir Engine de Background">🎛️</div>
        </div>

        <div class="hud-info" id="tts-status">Pronto.</div>
      </div>
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

  /* ---------- Drag e Posição ---------- */
  applySavedPos();

  (() => {
    let sx = 0, sy = 0, sl = 0, sb = 0, drag = false;

    const onDown = (ev) => {
      if (ev.target.closest('button')) return;

      const e = ev.touches ? ev.touches[0] : ev;
      drag = true;
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
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      setCSS('--tts-left', Math.max(0, sl + dx) + 'px');
      setCSS('--tts-bottom', Math.max(0, sb - dy) + 'px');
    };

    const onUp = () => {
      if (!drag) return;
      drag = false;
      dock.classList.remove('is-drag');
      savePos();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      removeEventListener('touchmove', onMove);
      removeEventListener('touchend', onUp);
    };

    dock.addEventListener('pointerdown', onDown);
    dock.addEventListener('touchstart', onDown, { passive: true });
  })();

  /* ---------- Speech & Vozes ---------- */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if (!synth) {
    console.warn('[TTS] SpeechSynthesis indisponível');
    return;
  }

  try { synth.cancel(); } catch {}

  let VOICES = [];
  let baseVoice = null;
  let voiceIdx = 0;

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

  /* ---------- Estado e Limpeza ---------- */
  let blocks = [];
  let idx = 0;
  let speaking = false;

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
    el.textContent = !blocks.length ? '0/0' : `${Math.min(idx + 1, blocks.length)}/${blocks.length}`;
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
      const raw = (node.innerText || '').trim();
      if (!raw) continue;
      out.push({ node, raw });
    }

    blocks = out;
    idx = 0;
    setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
  }

  /* ---------- Outline ---------- */
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

  /* ---------- Speak ---------- */
  function speakCurrent() {
    if (!blocks.length) rebuild();
    if (idx < 0) idx = 0;

    if (idx >= blocks.length) {
      stop();
      window.toast('Fim da leitura.');
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

  /* ---------- Botões do Dock ---------- */
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
      window.toast('Selecione um trecho para ler.');
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

    if (!PREFS.outline) {
      hideOutline();
    } else {
      const b = blocks[idx];
      if (b) showOutlineFor(b.node);
    }

    setPressed($('#tts-grid', dock), PREFS.outline);
    window.toast(PREFS.outline ? 'Outline Ativado' : 'Outline Desativado');
  });

  setPressed($('#tts-grid', dock), PREFS.outline);

  $('#tts-voice', dock)?.addEventListener('click', e => {
    e.preventDefault();
    cycleVoice();
    window.toast('Voz alterada');
  });

  /* ---------- Click-to-Speak ---------- */
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

  /* ---------- Boot ---------- */
  rebuild();
  setStatusProgress();
})();
