// kob-glue-dh10.js — final, limpo, com patch aplicado
(function () {
  'use strict';

  if (window.__KOBLLUX_MONOLITH_FIXED_INIT__) {
    console.log('KOBLLUX fixed already init');
    return;
  }
  window.__KOBLLUX_MONOLITH_FIXED_INIT__ = true;

  /* -----------------------------
     DOM helpers & toast
     ----------------------------- */
  const $ = (q, r = document) => (r && r.querySelector ? r.querySelector(q) : null);
  const $$ = (q, r = document) => (r && r.querySelectorAll ? [...r.querySelectorAll(q)] : []);

  const toastEl = $('#kx_toast') || null;
  function toast(msg, ms = 1400) {
    if (!toastEl) {
      console.log('KOBLLUX.toast:', msg);
      return;
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toastEl.style.opacity = '0';
    }, ms);
  }

  /* -----------------------------
     UI elements (tolerant selectors)
     ----------------------------- */
  const bar = $('#symbolBar');
  const toggleBtn = $('#toggleBtn');
  const frame = $('#content-frame') || $('#frame') || document.querySelector('iframe');
  const root = $('#root') || document.body;
  const hudStatus = $('#hudStatus');

  const outline = $('#kob-tts-outline') || (() => {
    const el = document.createElement('div');
    el.id = 'kob-tts-outline';
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    el.style.display = 'none';
    el.style.zIndex = '9998';
    el.style.borderRadius = '12px';
    el.style.transition = 'all .18s ease';

    const host = document.querySelector('.content') || document.body;
    host.appendChild(el);
    return el;
  })();

  const BTN_PLAY = $('#btn-play');
  const BTN_NEXT = $('#btn-next');
  const BTN_PREV = $('#btn-prev');
  const BTN_ARCH = $('#btn-arch');

  /* -----------------------------
     Archetypes (keep structure compat)
     ----------------------------- */
  const ARCHETYPES = [
    { id: 'kobllux', name: 'KOBLLUX', voice: 'Luciana', lang: 'pt-BR', rate: 0.98, pitch: 0.48, color: '#22D3EE' },
    { id: 'kodux', name: 'KODUX', voice: 'Luciana', lang: 'pt-BR', rate: 0.86, pitch: 0.68, color: '#F97316' },
    { id: 'atlas', name: 'ATLAS', voice: 'Reed', lang: 'en-US', rate: 1.00, pitch: 0.93, color: '#38BDF8' },
    { id: 'nova', name: 'NOVA', voice: 'Luciana', lang: 'pt-BR', rate: 1.06, pitch: 1.34, color: '#F97316' },
    { id: 'vitalis', name: 'VITALIS', voice: 'Rocko', lang: 'pt-BR', rate: 0.96, pitch: 1.42, color: '#22C55E' },
    { id: 'pulse', name: 'PULSE', voice: 'Reed', lang: 'pt-BR', rate: 1.00, pitch: 1.14, color: '#EC4899' },
    { id: 'artemis', name: 'ARTEMIS', voice: 'Paulina', lang: 'es-MX', rate: 1.00, pitch: 1.23, color: '#A855F7' },
    { id: 'serena', name: 'SERENA', voice: 'Joana', lang: 'pt-BR', rate: 0.92, pitch: 0.90, color: '#38BDF8' },
    { id: 'kaos', name: 'KAOS', voice: 'Rocko', lang: 'pt-BR', rate: 1.09, pitch: 1.28, color: '#FACC15' },
    { id: 'genus', name: 'GENUS', voice: 'Reed', lang: 'pt-BR', rate: 0.98, pitch: 1.23, color: '#E5E7EB' },
    { id: 'lumine', name: 'LUMINE', voice: 'Flo', lang: 'fr-FR', rate: 1.03, pitch: 1.55, color: '#FDE047' },
    { id: 'solus', name: 'SOLUS', voice: 'Satu', lang: 'fi-FI', rate: 0.96, pitch: 0.87, color: '#0EA5E9' },
    { id: 'rhea', name: 'RHEA', voice: 'Alice', lang: 'it-IT', rate: 1.02, pitch: 0.59, color: '#22C55E' },
    { id: 'aion', name: 'AION', voice: 'Monica', lang: 'es-ES', rate: 0.88, pitch: 0.30, color: '#4F46E5' },
    { id: 'uno', name: 'UNO', voice: 'Grandma', lang: 'en-US', rate: 0.90, pitch: 0.93, color: '#F97316' },
    { id: 'dual', name: 'DUAL', voice: 'Milena', lang: 'ru-RU', rate: 1.02, pitch: 1.02, color: '#06B6D4' },
    { id: 'trinity', name: 'TRINITY', voice: 'Sandy', lang: 'en-US', rate: 1.04, pitch: 1.04, color: '#EC4899' },
    { id: 'infodose', name: 'INFODOSE', voice: 'Luciana', lang: 'pt-BR', rate: 1.06, pitch: 0.96, color: '#22C55E' },
    { id: 'horus', name: 'HORUS', voice: 'Majed', lang: 'ar-001', rate: 0.94, pitch: 0.82, color: '#F59E0B' }
  ];

  /* -----------------------------
     State & Storage
     ----------------------------- */
  let state = {
    archIdx: 0,
    isSpeaking: true,
    blocks: [],
    currentBlockIdx: 0,
    isCollapsed: localStorage.getItem('kob_collapsed') === 'true'
  };

  const KOB_NS = 'kob_tts::v1::';
  const PST = k => KOB_NS + k;

  const StorageSafe = {
    get(k, d = null) {
      try {
        const v = localStorage.getItem(PST(k));
        return v == null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(PST(k), JSON.stringify(v));
      } catch {}
    }
  };

  /* -----------------------------
     Speech API (fallback)
     ----------------------------- */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  if (!synth) toast('SpeechSynthesis não disponível');

  function updatePlayButton(isPlaying) {
    if (!BTN_PLAY) return;
    BTN_PLAY.dataset.state = isPlaying ? 'playing' : 'paused';
    BTN_PLAY.textContent = isPlaying ? '■' : '▶';
  }

  function toggleSpeech() {
    if (!synth) {
      toast('SpeechSynthesis não disponível');
      return;
    }

    if (synth.speaking && !synth.paused) {
      try { synth.pause(); } catch (e) {}
      state.isSpeaking = false;
      updatePlayButton(false);
      return;
    }

    if (synth.paused) {
      try { synth.resume(); } catch (e) {}
      state.isSpeaking = true;
      updatePlayButton(false);
      return;
    }

    startSpeech();
  }

  /* -----------------------------
     Idle & position helpers
     ----------------------------- */
  const IDLE_TIME = 9000;
  let idleTimer = null;

  function resetIdleTimer() {
    if (!bar) return;
    bar.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!state.isCollapsed) bar.classList.add('idle');
    }, IDLE_TIME);
  }

  function applyPosition(x, y) {
    if (!bar) return;

    const maxX = window.innerWidth - bar.offsetWidth;
    const maxY = window.innerHeight - bar.offsetHeight;
    x = Math.max(0, Math.min(maxX, x));
    y = Math.max(0, Math.min(maxY, y));

    bar.style.left = x + 'px';
    bar.style.top = y + 'px';
    bar.classList.remove('snap-side', 'snap-side-right', 'snap-top', 'floating');

    if (y <= 40) bar.classList.add('snap-top');
    else if (x <= 40) bar.classList.add('snap-side');
    else if (x >= maxX - 40) bar.classList.add('snap-side-right');
    else bar.classList.add('floating');
  }

  function snapToEdges() {
    if (!bar) return;

    bar.style.transition = 'all .36s cubic-bezier(.175,.885,.32,1.275)';
    const r = bar.getBoundingClientRect();
    let x = r.left, y = r.top;

    if (y < 40) {
      y = 0;
      x = (window.innerWidth - r.width) / 2;
    } else {
      if (x < 40) x = 0;
      if (x > window.innerWidth - r.width - 40) x = window.innerWidth - r.width;
    }

    applyPosition(x, y);
    try { localStorage.setItem('kob_hud_pos', JSON.stringify({ x, y })); } catch (e) {}
    setTimeout(() => bar.style.transition = '', 420);
  }

  /* -----------------------------
     Restore pos & HUD setup
     ----------------------------- */
  (function restore() {
    if (!bar) return;
    try {
      const s = JSON.parse(localStorage.getItem('kob_hud_pos') || '{"x":20,"y":120}');
      applyPosition(s.x, s.y);
    } catch (e) {
      applyPosition(20, 120);
    }
    if (state.isCollapsed) bar.classList.add('collapsed');
    updatePlayButton(false);
  })();

  (function setupHUD() {
    if (!bar) return;

    let dragging = false;
    let start = { x: 0, y: 0, ox: 0, oy: 0 };

    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.symbol-button')) return;
      dragging = true;
      bar.classList.add('is-dragging');

      const rect = bar.getBoundingClientRect();
      start = {
        x: e.clientX,
        y: e.clientY,
        ox: e.clientX - rect.left,
        oy: e.clientY - rect.top
      };

      try { bar.setPointerCapture(e.pointerId); } catch {}
    });

    bar.addEventListener('pointermove', e => {
      if (!dragging) return;
      bar.style.transition = 'none';
      applyPosition(e.clientX - start.ox, e.clientY - start.oy);
    });

    bar.addEventListener('pointerup', e => {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('is-dragging');
      try { bar.releasePointerCapture(e.pointerId); } catch {}
      snapToEdges();
    });

    toggleBtn && toggleBtn.addEventListener('click', () => {
      state.isCollapsed = !state.isCollapsed;
      bar.classList.toggle('collapsed', state.isCollapsed);
      localStorage.setItem('kob_collapsed', state.isCollapsed);
      setTimeout(snapToEdges, 320);
    });

    ['mousemove', 'touchstart', 'mousedown', 'pointerdown'].forEach(ev => {
      window.addEventListener(ev, resetIdleTimer, { passive: true });
    });

    resetIdleTimer();
  })();

  /* -----------------------------
     Symbol bar handler
     ----------------------------- */
  (function attachSymbolBarHandler() {
    if (!bar) return;

    bar.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.symbol-button');
      if (!btn) return;

      ev.stopPropagation();

      // URL open buttons
      if (btn.dataset && btn.dataset.url) {
        const url = String(btn.dataset.url).trim();
        if (url) {
          try {
            if (frame && ('src' in frame)) frame.src = url;
            localStorage.setItem('kob_last_url', url);
            toast('Abrindo ' + url);
          } catch (e) {
            console.warn('Erro ao abrir iframe:', e);
            toast('Erro ao abrir URL');
          }
        }
        return;
      }

      // TTS controls
      const bid = (btn.id || btn.dataset.id || btn.dataset.action || '').toString();

      const callTTS = (fnName) => {
        try {
          if (window.KOB_TTS && typeof window.KOB_TTS[fnName] === 'function') {
            window.KOB_TTS[fnName]();
            return true;
          }
          if (window.KOBLLUX && typeof window.KOBLLUX[fnName] === 'function') {
            window.KOBLLUX[fnName]();
            return true;
          }
          return false;
        } catch (err) {
          console.warn('callTTS error', err);
          return false;
        }
      };

      switch (bid) {
        case 'btn-play':
          // toggle real: play -> pause -> resume
          if (callTTS('toggle')) break;
          toggleSpeech();
          break;

        case 'btn-next':
          callTTS('next') || (function () {
            if (window.KOBLLUX && window.KOBLLUX.state) {
              window.KOBLLUX.state.currentBlockIdx = Math.min(
                (window.KOBLLUX.state.blocks || []).length - 1,
                (window.KOBLLUX.state.currentBlockIdx || 0) + 1
              );
              if (window.KOBLLUX.state.isSpeaking) window.KOBLLUX.startSpeech && window.KOBLLUX.startSpeech();
            }
          })();
          break;

        case 'btn-prev':
          callTTS('prev') || (function () {
            if (window.KOBLLUX && window.KOBLLUX.state) {
              window.KOBLLUX.state.currentBlockIdx = Math.max(
                0,
                (window.KOBLLUX.state.currentBlockIdx || 0) - 1
              );
              if (window.KOBLLUX.state.isSpeaking) window.KOBLLUX.startSpeech && window.KOBLLUX.startSpeech();
            }
          })();
          break;

        case 'btn-arch':
          callTTS('cycleArchetype') || (window.KOBLLUX && window.KOBLLUX.updateArchetype && window.KOBLLUX.updateArchetype((window.KOBLLUX.state.archIdx || 0) + 1));
          break;

        default:
          if (btn.dataset && btn.dataset.action === 'open-menu') toggleBtn && toggleBtn.click();
          break;
      }
    }, { passive: true });
  })();

  /* -----------------------------
     small util
     ----------------------------- */
  function hexToRgba(hex, a) {
    const c = (hex || '#000').replace('#', '');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function applyVoiceTheme(arch) {
    if (!arch || !arch.theme) return;

    const root = document.documentElement;
    const body = document.body;

    const primary = arch.theme.primary;
    const secondary = arch.theme.secondary;
    const soft = arch.theme.soft || arch.theme.bgSoft;
    const glow = arch.theme.glow;

    // TTS SYSTEM
    root.style.setProperty('--kob-tts-primary', primary);
    root.style.setProperty('--kob-tts-secondary', secondary);
    root.style.setProperty('--kob-tts-soft', soft);
    root.style.setProperty('--kob-tts-glow', glow);

    // VOICE SYSTEM (legacy)
    root.style.setProperty('--kob-voice-primary', primary);
    root.style.setProperty('--kob-voice-secondary', secondary);
    root.style.setProperty('--kob-voice-bg-soft', soft);
    root.style.setProperty('--kob-voice-glow', glow);

    // ARCH STATE
    body.setAttribute('data-voice-arch', arch.id);
  }

  /* -----------------------------
     updateArchetype
     ----------------------------- */
  function updateArchetype(idx) {
    state.archIdx = (typeof idx === 'number') ? (idx % ARCHETYPES.length) : 0;
    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0];

    try {
      if (window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.applyVoiceTheme === 'function') {
        window.KOBLLUX_VOICE_ENGINE.applyVoiceTheme(Object.assign({}, arch, { id: arch.id }));
      } else {
        const primary = arch.color || '#00f5ff';
        const soft = hexToRgba(primary, 0.14);
        document.documentElement.style.setProperty('--kob-voice-primary', primary);
        document.documentElement.style.setProperty('--kob-voice-secondary', primary);
        document.documentElement.style.setProperty('--kob-voice-bg-soft', soft);
        document.documentElement.style.setProperty('--kob-voice-outline', hexToRgba(primary, 0.28));
        if (document.body) document.body.setAttribute('data-voice-arch', arch.id);
      }
      if (hudStatus) hudStatus.textContent = arch.name;
    } catch (e) {
      console.warn('updateArchetype fail', e);
    }

    try {
      if (outline) {
        const primary = arch.color || '#00f5ff';
        outline.style.borderColor = primary;
        outline.style.boxShadow = `0 0 12px ${hexToRgba(primary, 0.45)}, inset 0 0 8px ${hexToRgba(primary, 0.2)}`;
        outline.style.background = hexToRgba(primary, 0.06);
      }
    } catch (e) {
      console.warn('applyArchetypeTheme outline fail', e);
    }

    if (state.isSpeaking) {
      stopSpeech();
      startSpeech();
    }
  }

  /* -----------------------------
     Blocks scanning & status
     ----------------------------- */
  function scanBlocks() {
    try {
      const sel = 'h1,h2,h3,p,li,blockquote,pre,td,th,';
      if (frame && frame.contentWindow) {
        const doc = frame.contentDocument || frame.contentWindow.document;
        const nodes = [...doc.querySelectorAll(sel)].filter(n => (n.innerText || '').trim().length > 0);
        if (nodes.length) {
          state.blocks = nodes;
          state.currentBlockIdx = 0;
          return;
        }
      }
    } catch (e) {
      // cross-origin or other
    }

    const localNodes = [...(root.querySelectorAll ? root.querySelectorAll('h1,h2,h3,p,li,blockquote,pre,td,th') : [])]
      .filter(n => (n.innerText || '').trim().length > 0);

    state.blocks = localNodes;
    state.currentBlockIdx = 0;
  }

  function rebuildBlocks() {
    scanBlocks();
    setStatus();
  }

  function setStatus() {
    const el = $('#tts-status');
    if (!el) return;
    if (!state.blocks.length) el.textContent = '0/0';
    else el.textContent = `${Math.min(state.currentBlockIdx + 1, state.blocks.length)}/${state.blocks.length}`;
  }

  function showOutlineFor(node) {
    if (!outline || !node) {
      if (outline) outline.style.display = 'none';
      return;
    }

    try {
      const rect = node.getBoundingClientRect();

      if (node.ownerDocument !== document && frame) {
        const fRect = frame.getBoundingClientRect();
        outline.style.left = (fRect.left + rect.left) + 'px';
        outline.style.top = (fRect.top + rect.top) + 'px';
      } else {
        outline.style.left = (rect.left + window.scrollX) + 'px';
        outline.style.top = (rect.top + window.scrollY) + 'px';
      }

      outline.style.width = (rect.width + 8) + 'px';
      outline.style.height = (rect.height + 8) + 'px';
      outline.style.display = 'block';
    } catch (e) {
      outline.style.display = 'none';
    }
  }

  function hideOutline() {
    if (outline) outline.style.display = 'none';
  }

  /* -----------------------------
     voice helpers (fallback)
     ----------------------------- */
  function findVoiceByNamePart(part) {
    if (!synth) return null;
    const voices = synth.getVoices() || [];
    const v = voices.find(x => x.name && x.name.toLowerCase().includes(String(part || '').toLowerCase()));
    if (v) return v;
    return voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
  }

  /* -----------------------------
     speakCurrent() — uses engine when available, fallback to local synth
     ----------------------------- */
  function speakCurrent() {
    if (!state.blocks.length) rebuildBlocks();

    if (state.currentBlockIdx >= state.blocks.length) {
      stopSpeech();
      toast('Fim da leitura');
      return;
    }

    const el = state.blocks[state.currentBlockIdx];
    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0];
    const txt = (el && el.innerText) ? el.innerText.trim() : '';

    if (!txt) {
      state.currentBlockIdx++;
      setStatus();
      return speakCurrent();
    }

    // Try to delegate to the voice engine
    const engine = window.KOBLLUX_VOICE_ENGINE || null;
    if (engine && typeof engine.activateArchetype === 'function' && typeof engine.speakWithCurrentArchetype === 'function') {
      try {
        engine.activateArchetype(arch.id);
        const ok = engine.speakWithCurrentArchetype(txt, {
          onStart() {
            showOutlineFor(el);
            setStatus();
          },
          onEnd() {
            if (state.isSpeaking) {
              state.currentBlockIdx++;
              setTimeout(speakCurrent, 120);
            }
          },
          onError() {
            state.currentBlockIdx++;
            speakCurrent();
          }
        });
        if (ok) return;
      } catch (e) {
        console.warn('voice engine call failed, falling back:', e);
      }
    }

    // fallback: use local SpeechSynthesis
    if (!synth) {
      toast('TTS indisponível');
      return;
    }

    try { synth.cancel(); } catch (e) {}

    const u = new SpeechSynthesisUtterance(txt);
    const voice = findVoiceByNamePart(arch.voice);
    if (voice) u.voice = voice;
    if (arch.lang) u.lang = arch.lang;
    u.rate = arch.rate ?? 1;
    u.pitch = arch.pitch ?? 1;

    u.onstart = () => {
      showOutlineFor(el);
      setStatus();
      updatePlayButton(true);
    };

    u.onend = () => {
      if (state.isSpeaking) {
        state.currentBlockIdx++;
        setStatus();
        setTimeout(() => speakCurrent(), 120);
      } else {
        updatePlayButton(false);
      }
    };

    u.onerror = (ev) => {
      console.warn('tts error', ev);
      if (state.isSpeaking) {
        state.currentBlockIdx++;
        speakCurrent();
      } else {
        updatePlayButton(false);
      }
    };

    synth.speak(u);
  }

  /* -----------------------------
     start/stop
     ----------------------------- */
  function startSpeech() {
    if (!state.blocks.length) rebuildBlocks();
    if (!state.blocks.length) {
      toast('Nada para ler');
      updatePlayButton(false);
      return;
    }

    state.isSpeaking = true;
    updatePlayButton(true);
    speakCurrent();
  }

  function stopSpeech() {
    state.isSpeaking = false;
    try { synth && synth.cancel(); } catch (e) {}
    updatePlayButton(false);
    hideOutline();
    setStatus();
  }

  /* -----------------------------
     dock extras / selection read
     ----------------------------- */
  $('#tts-on') && $('#tts-on').addEventListener('click', () => {
    if (state.isSpeaking) stopSpeech();
    else startSpeech();
  });

  $('#tts-next') && $('#tts-next').addEventListener('click', () => {
    if (!state.blocks.length) rebuildBlocks();
    state.currentBlockIdx = Math.min(state.blocks.length - 1, state.currentBlockIdx + 1);
    if (state.isSpeaking) speakCurrent();
    else showOutlineFor(state.blocks[state.currentBlockIdx]);
    setStatus();
  });

  $('#tts-prev') && $('#tts-prev').addEventListener('click', () => {
    if (!state.blocks.length) rebuildBlocks();
    state.currentBlockIdx = Math.max(0, state.currentBlockIdx - 1);
    if (state.isSpeaking) speakCurrent();
    else showOutlineFor(state.blocks[state.currentBlockIdx]);
    setStatus();
  });

  $('#tts-stop') && $('#tts-stop').addEventListener('click', () => stopSpeech());

  $('#tts-reset') && $('#tts-reset').addEventListener('click', () => {
    state.currentBlockIdx = 0;
    rebuildBlocks();
    setStatus();
  });

  $('#tts-reread') && $('#tts-reread').addEventListener('click', () => {
    state.currentBlockIdx = 0;
    startSpeech();
  });

  $('#tts-sel') && $('#tts-sel').addEventListener('click', () => {
    const s = String(window.getSelection && window.getSelection());
    if (!s || !s.trim()) return toast('Selecione um trecho para ler.');

    const arch = ARCHETYPES[state.archIdx] || ARCHETYPES[0];

    // prefer engine speak
    try {
      if (window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.activateArchetype === 'function') {
        window.KOBLLUX_VOICE_ENGINE.activateArchetype(arch.id);
        const ok = window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype(s.trim(), {
          onStart() { /* nothing */ },
          onEnd() { /* nothing */ },
          onError() { /* nothing */ }
        });
        if (ok) return;
      }
    } catch (e) {
      console.warn('engine speakWithCurrentArchetype failed', e);
    }

    // fallback local
    try { synth.cancel(); } catch (e) {}
    const u = new SpeechSynthesisUtterance(String(sanitize(s)));
    const voice = findVoiceByNamePart(arch.voice);
    if (voice) u.voice = voice;
    if (arch.lang) u.lang = arch.lang;
    u.rate = arch.rate ?? 1;
    u.pitch = arch.pitch ?? 1;
    synth.speak(u);
  });

  $('#tts-grid') && $('#tts-grid').addEventListener('click', () => {
    const prefs = StorageSafe.get('prefs', {});
    prefs.outline = !prefs.outline;
    StorageSafe.set('prefs', prefs);
    toast(prefs.outline ? 'Outline ativado' : 'Outline desativado');
  });

  function sanitize(txt) {
    return String(txt || '').replace(/\bCopiar\b/g, ' ').replace(/\s{2,}/g, ' ').trim();
  }

  /* -----------------------------
     click to speak and click selection logic
     ----------------------------- */
  document.addEventListener('click', (ev) => {
    const selector = 'h1,h2,h3,p,li,blockquote,pre,td,th';
    const target = ev.target.closest ? ev.target.closest(selector) : null;
    if (!target) return;

    if (target.closest && (target.closest('#symbolBar') || target.closest('.kob-tts-dock'))) return;

    rebuildBlocks();

    let idx = state.blocks.findIndex(b => b.isEqualNode && b.isEqualNode(target));
    if (idx < 0) {
      const ttext = (target.innerText || '').trim();
      idx = state.blocks.findIndex(b => (b.innerText || '').trim() === ttext);
    }

    if (idx >= 0) state.currentBlockIdx = idx;
    showOutlineFor(state.blocks[state.currentBlockIdx]);

    if (!state.isSpeaking) setStatus();

    const prefs = StorageSafe.get('prefs', { outline: true, clickToSpeak: true });
    if (prefs.clickToSpeak) {
      state.isSpeaking = true;
      startSpeech();
    }
  }, { passive: true });

  // safe polyfill for isEqualNode usage
  Node.prototype.isEqualNode = Node.prototype.isEqualNode || function (other) { return this === other; };

  /* -----------------------------
     initial scan
     ----------------------------- */
  (function initial() {
    try {
      const last = localStorage.getItem('kob_last_url');
      if (last && frame && ('src' in frame)) frame.src = last;
    } catch (e) {}

    try { scanBlocks(); } catch (e) {}
    setStatus();

    // inject basic voice theme CSS patch to ensure CSS vars exist (non-destructive)
    try { injectVoiceThemeCSS(); } catch (e) {}
  })();

  /* -----------------------------
     API exposure & compatibility wrapper
     ----------------------------- */
  window.KOBLLUX = window.KOBLLUX || {};
  Object.assign(window.KOBLLUX, {
    startSpeech,
    stopSpeech,
    toggleSpeech,
    rebuildBlocks,
    updateArchetype,
    state
  });

  // speakText wrapper: delegates to engine when possible, otherwise uses local synth
  window.KOBLLUX.speakText = window.KOBLLUX.speakText || function (txt, opts) {
    try {
      const text = String(txt || '').trim();
      if (!text) return false;

      // Prefer engine
      if (window.KOBLLUX_VOICE_ENGINE && typeof window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype === 'function') {
        if (opts && opts.arch) window.KOBLLUX_VOICE_ENGINE.activateArchetype(opts.arch);
        return window.KOBLLUX_VOICE_ENGINE.speakWithCurrentArchetype(text, {
          onStart: opts && opts.onStart,
          onEnd: opts && opts.onEnd,
          onError: opts && opts.onError
        });
      }

      // Legacy fallback
      const synthLocal = window.speechSynthesis;
      if (!synthLocal) return false;

      const utter = new SpeechSynthesisUtterance(text);

      const voiceName = (opts && opts.voice) || (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].voice) || null;

      const pickVoice = () => {
        try {
          const voices = synthLocal ? synthLocal.getVoices() : [];
          if (voiceName) {
            const found = voices.find(v => v.name && v.name.toLowerCase().includes(String(voiceName).toLowerCase()));
            if (found) return found;
          }
          if (voices && voices.length) return voices.find(x => /pt/i.test(x.lang)) || voices[0];
        } catch (e) {
          // ignore
        }
        return null;
      };

      const v = pickVoice();
      if (v) utter.voice = v;
      utter.rate = (opts && typeof opts.rate === 'number') ? opts.rate : (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].rate) || 1.0;
      utter.pitch = (opts && typeof opts.pitch === 'number') ? opts.pitch : (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].pitch) || 1.0;
      utter.lang = (opts && opts.lang) || (ARCHETYPES[state.archIdx] && ARCHETYPES[state.archIdx].lang) || 'pt-BR';

      try { synthLocal.cancel(); } catch (e) {}
      synthLocal.speak(utter);
      return true;
    } catch (e) {
      console.warn('KOBLLUX.speakText failed', e);
      return false;
    }
  };

  /* -----------------------------
     injectVoiceThemeCSS (utility)
     ----------------------------- */
  function injectVoiceThemeCSS() {
    if (document.getElementById('KOB_VOICE_THEME_CSS_PATCH')) return;

    const patch = document.createElement('style');
    patch.id = 'KOB_VOICE_THEME_CSS_PATCH';
    patch.textContent = `
:root{ --kob-voice-theme-duration: 520ms; }
body, .nebula, details.acc, .btn, #fab, .kob-tts-dock, .kob-tts-panel.is-dock {
  transition: background var(--kob-voice-theme-duration) ease, box-shadow var(--kob-voice-theme-duration) ease, border-color var(--kob-voice-theme-duration) ease, color var(--kob-voice-theme-duration) ease;
}
`;
    document.head && document.head.appendChild(patch);

    if (!document.getElementById('KOBLLUX_VOICE_THEME_CSS')) {
      const style = document.createElement('style');
      style.id = 'KOBLLUX_VOICE_THEME_CSS';
      style.textContent = `
:root{
  --kob-voice-primary: #78e3ff;
  --kob-voice-secondary: #b978ff;
  --kob-voice-accent: #ffffff;
  --kob-voice-bg-soft: radial-gradient(900px 700px at 50% 10%,rgba(123,243,255,.06),transparent 80%), radial-gradient(600px 600px at 70% 100%,rgba(180,120,255,.04),transparent 80%), var(--bg);
  --kob-voice-glow: 0 0 18px rgba(0,216,216,0.55);
}
.kob-tts-dock{
  background:var(--kob-voice-bg-soft);
  box-shadow:var(--kob-voice-glow);
  border-radius:12px;
  backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,0.06);
}
`;
      document.head.appendChild(style);
    }
  }

  /* -----------------------------
     small public helpers for debugging
     ----------------------------- */
  window.KOBLLUX.getArchetypes = () => ARCHETYPES.slice();
  window.KOBLLUX.setArchetypes = (arr) => {
    if (Array.isArray(arr)) {
      while (ARCHETYPES.length) ARCHETYPES.pop();
      arr.forEach(a => ARCHETYPES.push(a));
    }
  };

  /* -----------------------------
     init: expose and set initial archetype
     ----------------------------- */
  try {
    updateArchetype(state.archIdx || 0);
  } catch (e) {
    console.warn('initial updateArchetype failed', e);
  }

  console.log('KOBLLUX glue init ✓');
  toast('KOBLLUX pronto ✓', 900);

})(); // end IIFE