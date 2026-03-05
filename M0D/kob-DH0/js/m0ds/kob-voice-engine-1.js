// kob-voice-engine.js
// KOBLLUX · Voice Engine · Modular Core (final, JS ESM)

const VoiceEngine = {
  archetypes: [],
  currentArch: null,
  synth: (typeof window !== 'undefined' && 'speechSynthesis' in window) ? window.speechSynthesis : null,
  _voicesLoaded: false,
  _voicesCallbacks: []
};

/** registerArchetypes(list) */
function registerArchetypes(list = []) {
  if (!Array.isArray(list)) return;
  VoiceEngine.archetypes = list.slice();
}

/** getArchetypeById(id) */
function getArchetypeById(id) {
  if (!id) return null;
  return VoiceEngine.archetypes.find(a => a.id === id) || null;
}

/** injectVoiceThemeCSS() — lightweight, idempotent */
function injectVoiceThemeCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('KOB_VOICE_THEME_CSS_PATCH')) return;

  const patch = document.createElement('style');
  patch.id = 'KOB_VOICE_THEME_CSS_PATCH';
  patch.textContent = `
:root{ --kob-voice-theme-duration: 520ms; }
body, .nebula, details.acc, .btn, #fab, .kob-tts-dock, .kob-tts-panel.is-dock {
  transition: background var(--kob-voice-theme-duration) ease, box-shadow var(--kob-voice-theme-duration) ease, border-color var(--kob-voice-theme-duration) ease, color var(--kob-voice-theme-duration) ease;
}
`;
  document.head.appendChild(patch);

  if (!document.getElementById('KOBLLUX_VOICE_THEME_CSS')) {
    const style = document.createElement('style');
    style.id = 'KOBLLUX_VOICE_THEME_CSS';
    style.textContent = `
:root{
  --kob-voice-primary: #78e3ff;
  --kob-voice-secondary: #b978ff;
  --kob-voice-accent: #ffffff;
  --kob-voice-bg-soft: rgba(0,0,0,0.06);
  --kob-voice-glow: 0 0 18px rgba(0,216,216,0.55);
}
.kob-tts-dock{ background:var(--kob-voice-bg-soft); box-shadow:var(--kob-voice-glow); border-radius:12px; backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.06); }
`;
    document.head.appendChild(style);
  }
}

/** _ensureVoicesLoaded(callback) — internal */
function _ensureVoicesLoaded(cb) {
  const synth = VoiceEngine.synth;
  if (!synth) { cb && cb([]); return; }

  const voices = synth.getVoices() || [];
  if (voices.length) {
    VoiceEngine._voicesLoaded = true;
    cb && cb(voices);
    return;
  }

  // queue callback until onvoiceschanged fires
  VoiceEngine._voicesCallbacks.push(cb);
  if (!VoiceEngine._voicesLoaded) {
    const handler = () => {
      const vs = synth.getVoices() || [];
      VoiceEngine._voicesLoaded = true;
      try {
        VoiceEngine._voicesCallbacks.forEach(fn => { try{ fn(vs); }catch(e){} });
      } finally {
        VoiceEngine._voicesCallbacks.length = 0;
      }
      // remove listener to avoid duplicates
      try { synth.removeEventListener && synth.removeEventListener('voiceschanged', handler); } catch(e){}
    };
    try { synth.addEventListener ? synth.addEventListener('voiceschanged', handler) : (synth.onvoiceschanged = handler); } catch(e){}
  }
}

/** findVoiceByNamePart(name) — best-effort synchronous fallback */
function findVoiceByNamePart(name) {
  const synth = VoiceEngine.synth;
  if (!synth) return null;
  const voices = synth.getVoices() || [];
  if (!voices.length) {
    // no voices yet: return null (caller may wait or fallback)
    return null;
  }
  if (!name) return voices[0] || null;
  const needle = String(name||'').toLowerCase();
  const byName = voices.find(v => v.name && v.name.toLowerCase().includes(needle));
  if (byName) return byName;
  // fallback by lang preference (pt first), then first available
  return voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
}

/** applyVoiceTheme(arch) — accepts arch.theme or falls back to arch.color */
function applyVoiceTheme(arch) {
  if (typeof document === 'undefined' || !arch) return;
  injectVoiceThemeCSS();

  // build theme object
  const theme = arch.theme || {
    primary: arch.color || '#22D3EE',
    secondary: arch.color || arch.secondary || '#22D3EE',
    bgSoft: arch.bgSoft || 'rgba(34,211,238,0.06)',
    glow: arch.glow || '0 0 12px rgba(34,211,238,0.45)',
    accent: arch.accent || '#fff'
  };

  const root = document.documentElement;
  const body = document.body || document.documentElement;

  try {

  /* ─────────────
     TTS SYSTEM
  ───────────── */

  root.style.setProperty('--kob-tts-primary', primary);
  root.style.setProperty('--kob-tts-secondary', secondary);
  root.style.setProperty('--kob-tts-soft', soft);
  root.style.setProperty('--kob-tts-glow', glow);

   


    root.style.setProperty('--kob-voice-primary', theme.primary);
    root.style.setProperty('--kob-voice-secondary', theme.secondary);
    root.style.setProperty('--kob-voice-bg-soft', theme.bgSoft);
    root.style.setProperty('--kob-voice-glow', theme.glow);
    root.style.setProperty('--kob-voice-accent', theme.accent);
    body.setAttribute && body.setAttribute('data-voice-arch', arch.id);
    // emit event for HUD integrators
    try {
      window.dispatchEvent(new CustomEvent('KOB_VOICE_COLOR', { detail:{ id: arch.id, color: theme } }));
    } catch(e){}
  } catch(e) {
    // silent
  }
}

/** speak(text, arch, hooks) — low level speak with optional hooks */
function speak(text, arch, hooks = {}) {
  if (!text) return false;
  const synth = VoiceEngine.synth;
  if (!synth) return false;

  const utter = new SpeechSynthesisUtterance(String(text).trim());

  try { synth.cancel(); } catch(e){}

  // Try to select voice; if voices not loaded yet, try async hook
  const setVoiceAndSpeak = (voices) => {
    const voice = (arch && arch.voice) ? (voices.find(v => v.name && v.name.toLowerCase().includes(String(arch.voice).toLowerCase())) || voices.find(v => /pt/i.test(v.lang)) || voices[0]) : (voices.find(v => /pt/i.test(v.lang)) || voices[0]);
    if (voice) utter.voice = voice;
    if (arch && arch.lang) utter.lang = arch.lang;
    utter.rate = (arch && typeof arch.rate === 'number') ? arch.rate : 1;
    utter.pitch = (arch && typeof arch.pitch === 'number') ? arch.pitch : 1;

    // hooks
    if (hooks.onStart) utter.onstart = hooks.onStart;
    if (hooks.onEnd) utter.onend = hooks.onEnd;
    if (hooks.onError) utter.onerror = hooks.onError;

    try { synth.speak(utter); } catch(e) { console.warn('speak error', e); }
  };

  const voices = synth.getVoices && synth.getVoices();
  if (voices && voices.length) {
    setVoiceAndSpeak(voices);
    return true;
  }

  // voices not ready yet — wait for them then speak
  _ensureVoicesLoaded((vs) => {
    try { setVoiceAndSpeak(vs || []); } catch(e){ console.warn(e); }
  });

  return true;
}

/** activateArchetype(idOrArch) */
function activateArchetype(idOrArch) {
  const arch = (typeof idOrArch === 'string') ? getArchetypeById(idOrArch) : idOrArch;
  if (!arch) return null;
  VoiceEngine.currentArch = arch;
  try { applyVoiceTheme(arch); } catch(e){ console.warn('applyVoiceTheme failed', e); }
  return arch;
}

/** speakWithCurrentArchetype(text, hooks) */
function speakWithCurrentArchetype(text, hooks = {}) {
  if (!VoiceEngine.currentArch) return false;
  return speak(text, VoiceEngine.currentArch, hooks);
}

/** API */
const API = {
  registerArchetypes,
  getArchetypeById,
  activateArchetype,
  applyVoiceTheme,
  injectVoiceThemeCSS,
  speak,
  speakWithCurrentArchetype,
  _internal: VoiceEngine
};

/* ESM exports */
export {
  registerArchetypes,
  getArchetypeById,
  activateArchetype,
  applyVoiceTheme,
  injectVoiceThemeCSS,
  speak,
  speakWithCurrentArchetype
};

/* global fallback for non-module consumers */
if (typeof window !== 'undefined') {
  window.KOBLLUX_VOICE_ENGINE = API;
}

/* done */
console.log('kob-voice-engine: ready');
