/* ================================
   KOBLLUX ARCH ENGINE v2 (Bridge Mode)
   data-voice-arch (master) + data-arch (legacy)
   ================================ */

const ARCH_THEME_CACHE = new Map();

// Mantive os presets do seu V1 para garantir que as cores exatas não se percam
const ARCH_PRESETS = {
  kobllux:  { primary: "#22D3EE", secondary: "#0E7C9E" },
  kodux:    { primary: "#F97316", secondary: "#C2410C" },
  atlas:    { primary: "#38BDF8", secondary: "#1E3A8A" },
  nova:     { primary: "#F72585", secondary: "#7209B7" },
  vitalis:  { primary: "#22C55E", secondary: "#166534" },
  pulse:    { primary: "#EC4899", secondary: "#831843" },
  artemis:  { primary: "#A855F7", secondary: "#5B21B6" },
  serena:   { primary: "#38BDF8", secondary: "#1E3A8A" },
  kaos:     { primary: "#FACC15", secondary: "#B45309" },
  genus:    { primary: "#E5E7EB", secondary: "#4B5563" },
  lumine:   { primary: "#FDE047", secondary: "#CA8A04" },
  solus:    { primary: "#0EA5E9", secondary: "#0369A1" },
  rhea:     { primary: "#22C55E", secondary: "#166534" },
  aion:     { primary: "#4F46E5", secondary: "#3730A3" },
  uno:      { primary: "#F97316", secondary: "#C2410C" },
  dual:     { primary: "#06B6D4", secondary: "#0E7C9E" },
  trinity:  { primary: "#EC4899", secondary: "#831843" },
  infodose: { primary: "#22C55E", secondary: "#166534" },
  horus:    { primary: "#F59E0B", secondary: "#B45309" },
  bllue:    { primary: "#3B82F6", secondary: "#1E40AF" }
};

function hashString(input = "") {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function themeFromName(name) {
  const key = String(name || "").trim().toLowerCase() || "kodux";

  // Se já calculou, retorna do cache
  if (ARCH_THEME_CACHE.has(key)) return ARCH_THEME_CACHE.get(key);

  let primary, secondary;

  // Verifica se tem preset, se não tiver, gera via hash
  if (ARCH_PRESETS[key]) {
    primary = ARCH_PRESETS[key].primary;
    secondary = ARCH_PRESETS[key].secondary;
  } else {
    const seed = hashString(key);
    const h1 = seed % 360;
    const h2 = (h1 + 34 + (seed % 28)) % 360;
    primary = hslToHex(h1, 72, 56);
    secondary = hslToHex(h2, 78, 34);
  }

  const theme = {
    primary,
    secondary,
    bgSoft: `color-mix(in srgb, ${primary} 12%, transparent)`,
    glow: `0 0 24px color-mix(in srgb, ${primary} 55%, transparent)`,
    border: `color-mix(in srgb, ${primary} 30%, rgba(255,255,255,0.12))`
  };

  ARCH_THEME_CACHE.set(key, theme);
  return theme;
}

function normalizeArch(input) {
  if (!input) return null;
  // Se ARCHETYPES não estiver definido globalmente ainda, previne erros
  if (typeof ARCHETYPES === "undefined") return null; 
  
  if (typeof input === "string") return ARCHETYPES.find(a => a.id === input) || null;
  if (typeof input === "number") return ARCHETYPES[input] || null;
  if (typeof input === "object" && input.id) return input;
  return null;
}

function applyVoiceTheme(archLike) {
  // Tenta normalizar. Se falhar, tenta usar a string direto como ID fallback
  const arch = normalizeArch(archLike) || (typeof ARCHETYPES !== "undefined" ? ARCHETYPES[0] : { id: typeof archLike === 'string' ? archLike : "kodux" });
  if (!arch) return null;

  // Usa o tema do objeto se existir, senão calcula pelo nome
  const base = arch.theme && (arch.theme.primary || arch.theme.secondary)
    ? arch.theme
    : themeFromName(arch.id);

  const root = document.documentElement;
  const body = document.body;

  // Aplica variáveis no :root
  root.style.setProperty("--kob-voice-primary", base.primary);
  root.style.setProperty("--kob-voice-secondary", base.secondary);
  root.style.setProperty("--kob-voice-bg-soft", base.bgSoft);
  root.style.setProperty("--kob-voice-glow", base.glow);
  root.style.setProperty("--kob-voice-border", base.border);

  if (body) {
    // A MÁGICA DA COMPATIBILIDADE: Atualiza ambos os atributos
    body.setAttribute("data-voice-arch", arch.id);
    body.setAttribute("data-arch", arch.id); 
    
    // Espelha as variáveis no body por segurança
    body.style.setProperty("--kob-voice-primary", base.primary);
    body.style.setProperty("--kob-voice-secondary", base.secondary);
    body.style.setProperty("--kob-voice-bg-soft", base.bgSoft);
    body.style.setProperty("--kob-voice-glow", base.glow);
    body.style.setProperty("--kob-voice-border", base.border);
  }

  // Estiliza o orbe
  const orb = document.getElementById("orbe") || document.querySelector(".orbe, .voice-orb, .orb");
  if (orb) {
    orb.style.setProperty("--orb-primary", base.primary);
    orb.style.setProperty("--orb-secondary", base.secondary);
    orb.style.boxShadow = base.glow;
    orb.style.background = `radial-gradient(circle at 30% 30%, ${base.primary}, ${base.secondary})`;
  }

  return arch;
}

// Expõe para o resto do sistema
window.KOBLLUX_VOICE_ENGINE = window.KOBLLUX_VOICE_ENGINE || {};
window.KOBLLUX_VOICE_ENGINE.applyVoiceTheme = applyVoiceTheme;
