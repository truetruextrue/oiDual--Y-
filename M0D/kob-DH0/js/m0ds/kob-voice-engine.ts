// kob-voice-engine.ts
// KOBLLUX · Voice Engine · TypeScript Core
// isolado · morph por tag · pronto para módulos

/* ─────────────────────────────────────────────
 * ATLAS — TIPOS
 * ───────────────────────────────────────────── */

export interface VoiceTheme {
  primary: string;
  secondary: string;
  bgSoft: string;
  glow: string;
}

export interface Archetype {
  id: string;
  name: string;
  voice?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  theme: VoiceTheme;
  tags?: string[]; // morph tags
}

interface MorphChunk {
  text: string;
  arch: Archetype;
}

/* ─────────────────────────────────────────────
 * NOVA — ESTADO INTERNO
 * ───────────────────────────────────────────── */

const VoiceEngine = {
  archetypes: [] as Archetype[],
  currentArch: null as Archetype | null,
  synth: typeof window !== 'undefined' ? window.speechSynthesis : null
};

/* ─────────────────────────────────────────────
 * VITALIS — REGISTRO
 * ───────────────────────────────────────────── */

export function registerArchetypes(list: Archetype[]): void {
  VoiceEngine.archetypes = Array.isArray(list) ? list : [];
}

/* ─────────────────────────────────────────────
 * PULSE — RESOLVER
 * ───────────────────────────────────────────── */

export function getArchetypeById(id: string): Archetype | null {
  return VoiceEngine.archetypes.find(a => a.id === id) || null;
}

/* ─────────────────────────────────────────────
 * ARTEMIS — APPLY THEME
 * ───────────────────────────────────────────── */

export function applyVoiceTheme(arch: Archetype): void {
  const root = document.documentElement;
  root.style.setProperty('--kob-voice-primary', arch.theme.primary);
  root.style.setProperty('--kob-voice-secondary', arch.theme.secondary);
  root.style.setProperty('--kob-voice-bg-soft', arch.theme.bgSoft);
  root.style.setProperty('--kob-voice-outline', arch.theme.glow);
  document.body.setAttribute('data-voice-arch', arch.id);
}

/* ─────────────────────────────────────────────
 * SERENA — VOICE PICKER
 * ───────────────────────────────────────────── */

function findVoice(name?: string): SpeechSynthesisVoice | null {
  if (!VoiceEngine.synth) return null;
  const voices = VoiceEngine.synth.getVoices() || [];
  if (!name) return voices[0] || null;
  return voices.find(v => v.name.toLowerCase().includes(name.toLowerCase())) || voices[0] || null;
}

/* ─────────────────────────────────────────────
 * KAOS — ACTIVATE ARCHETYPE
 * ───────────────────────────────────────────── */

export function activateArchetype(id: string | Archetype): Archetype | null {
  const arch = typeof id === 'string' ? getArchetypeById(id) : id;
  if (!arch) return null;
  VoiceEngine.currentArch = arch;
  applyVoiceTheme(arch);
  return arch;
}

/* ─────────────────────────────────────────────
 * GENUS — MORPH PARSER
 * Sintaxe:
 * [atlas]texto[/atlas]
 * [nova]texto[/nova]
 * ───────────────────────────────────────────── */

function parseMorph(text: string): MorphChunk[] {
  const chunks: MorphChunk[] = [];
  const regex = /\[([a-z0-9_-]+)\]([\s\S]*?)\[\/\1\]/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex && VoiceEngine.currentArch) {
      chunks.push({
        text: text.slice(lastIndex, match.index),
        arch: VoiceEngine.currentArch
      });
    }

    const arch = getArchetypeById(match[1]);
    if (arch) {
      chunks.push({ text: match[2], arch });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length && VoiceEngine.currentArch) {
    chunks.push({
      text: text.slice(lastIndex),
      arch: VoiceEngine.currentArch
    });
  }

  return chunks.length ? chunks : [{
    text,
    arch: VoiceEngine.currentArch!
  }];
}

/* ─────────────────────────────────────────────
 * LUMINE — SPEAK SINGLE CHUNK
 * ───────────────────────────────────────────── */

function speakChunk(chunk: MorphChunk, onEnd: () => void): void {
  if (!VoiceEngine.synth) return onEnd();

  const u = new SpeechSynthesisUtterance(chunk.text.trim());
  const v = findVoice(chunk.arch.voice);
  if (v) u.voice = v;

  u.lang = chunk.arch.lang || 'pt-BR';
  u.rate = chunk.arch.rate ?? 1;
  u.pitch = chunk.arch.pitch ?? 1;

  applyVoiceTheme(chunk.arch);

  u.onend = onEnd;
  u.onerror = onEnd;

  VoiceEngine.synth.speak(u);
}

/* ─────────────────────────────────────────────
 * SOLUS — SPEAK WITH MORPH (CORE)
 * ───────────────────────────────────────────── */

export function speakCurrentWithMorph(text: string): void {
  if (!VoiceEngine.currentArch || !VoiceEngine.synth) return;

  const parts = parseMorph(text);
  let idx = 0;

  try { VoiceEngine.synth.cancel(); } catch {}

  const next = () => {
    if (idx >= parts.length) return;
    speakChunk(parts[idx++], next);
  };

  next();
}

/* ─────────────────────────────────────────────
 * RHEA — FALLBACK GLOBAL
 * ───────────────────────────────────────────── */

if (typeof window !== 'undefined') {
  (window as any).KOBLLUX_VOICE_ENGINE = {
    registerArchetypes,
    activateArchetype,
    speakCurrentWithMorph
  };
}

/* ─────────────────────────────────────────────
 * AION — END
 * ───────────────────────────────────────────── */
