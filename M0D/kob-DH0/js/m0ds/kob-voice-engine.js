// kob-voice-engine.js
// KOBLLUX · Voice Engine · Modular Core
// isolado · sem dependência do monólito

/* ─────────────────────────────────────────────
 * ATLAS — ESTADO INTERNO
 * ───────────────────────────────────────────── */

const VoiceEngine = {
  archetypes: [],
  currentArch: null,
  synth: typeof window !== 'undefined' ? window.speechSynthesis : null,
};

/* ─────────────────────────────────────────────
 * NOVA — REGISTRO DE ARQUÉTIPOS
 * ───────────────────────────────────────────── */

function registerArchetypes(list = []) {
  if (!Array.isArray(list)) return;
  VoiceEngine.archetypes = list;
}

/* ─────────────────────────────────────────────
 * VITALIS — RESOLVER ARQUÉTIPO
 * ───────────────────────────────────────────── */

function getArchetypeById(id) {
  return VoiceEngine.archetypes.find(a => a.id === id) || null;
}

/* ─────────────────────────────────────────────
 * PULSE — APLICAR TEMA VISUAL
 * ───────────────────────────────────────────── */

function applyVoiceTheme(arch) {
  if (!arch || !arch.theme) return;

  const root = document.documentElement;
  const body = document.body;

  root.style.setProperty('--kob-voice-primary', arch.theme.primary);
  root.style.setProperty('--kob-voice-secondary', arch.theme.secondary);
  root.style.setProperty('--kob-voice-bg-soft', arch.theme.bgSoft);
  root.style.setProperty('--kob-voice-glow', arch.theme.glow);

  body.setAttribute('data-voice-arch', arch.id);
}

/* ─────────────────────────────────────────────
 * ARTEMIS — SELEÇÃO DE VOZ
 * ───────────────────────────────────────────── */

function findVoiceByNamePart(name) {
  if (!VoiceEngine.synth) return null;
  const voices = VoiceEngine.synth.getVoices() || [];
  if (!name) return voices[0] || null;

  return (
    voices.find(v =>
      v.name && v.name.toLowerCase().includes(name.toLowerCase())
    ) || voices[0] || null
  );
}

/* ─────────────────────────────────────────────
 * SERENA — DISPARAR FALA
 * ───────────────────────────────────────────── */

function speak(text, arch) {
  if (!VoiceEngine.synth || !text) return false;

  const u = new SpeechSynthesisUtterance(String(text).trim());

  try {
    VoiceEngine.synth.cancel();
  } catch {}

  const voice = findVoiceByNamePart(arch.voice);
  if (voice) u.voice = voice;

  if (arch.lang) u.lang = arch.lang;
  u.rate = arch.rate ?? 1;
  u.pitch = arch.pitch ?? 1;

  VoiceEngine.synth.speak(u);
  return true;
}

/* ─────────────────────────────────────────────
 * KAOS — ATIVAR ARQUÉTIPO (VOZ + UI)
 * ───────────────────────────────────────────── */

function activateArchetype(id) {
  const arch = typeof id === 'string' ? getArchetypeById(id) : id;
  if (!arch) return null;

  VoiceEngine.currentArch = arch;
  applyVoiceTheme(arch);
  return arch;
}

/* ─────────────────────────────────────────────
 * GENUS — FALA SINCRONIZADA
 * ───────────────────────────────────────────── */

function speakWithCurrentArchetype(text) {
  if (!VoiceEngine.currentArch) return false;
  return speak(text, VoiceEngine.currentArch);
}

/* ─────────────────────────────────────────────
 * LUMINE — API PÚBLICA
 * ───────────────────────────────────────────── */

const API = {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype,
  speak,
  getArchetypeById,
};

/* ─────────────────────────────────────────────
 * SOLUS — EXPORT ESM
 * ───────────────────────────────────────────── */

export {
  registerArchetypes,
  activateArchetype,
  speakWithCurrentArchetype,
  speak,
  getArchetypeById,
};

/* ─────────────────────────────────────────────
 * RHEA — FALLBACK GLOBAL
 * ───────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  window.KOBLLUX_VOICE_ENGINE = API;
}

/* ─────────────────────────────────────────────
 * AION — FIM DO MÓDULO
 * ───────────────────────────────────────────── */
