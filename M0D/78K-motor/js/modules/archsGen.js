/* ================================
   KOBLLUX ARCH ENGINE v1
   data-arch + cor automática por hash
   ================================ */

const ARCH_THEME_CACHE = new Map();

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

function makeDynamicTheme(name) {
  const key = (name || "").trim().toLowerCase() || "kodux";

  if (ARCH_PRESETS[key]) {
    const { primary, secondary } = ARCH_PRESETS[key];
    return {
      primary,
      secondary,
      bgSoft: `color-mix(in srgb, ${primary} 12%, transparent)`,
      glow: `0 0 24px color-mix(in srgb, ${primary} 55%, transparent)`,
      border: `color-mix(in srgb, ${primary} 30%, rgba(255,255,255,0.12))`
    };
  }

  if (ARCH_THEME_CACHE.has(key)) return ARCH_THEME_CACHE.get(key);

  const seed = hashString(key);
  const h1 = seed % 360;
  const h2 = (h1 + 34 + (seed % 28)) % 360;
  const s1 = 72;
  const l1 = 56;
  const s2 = 78;
  const l2 = 34;

  const primary = hslToHex(h1, s1, l1);
  const secondary = hslToHex(h2, s2, l2);

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

function applyArchTheme(archName, target = document.body) {
  const theme = makeDynamicTheme(archName);
  const name = (archName || "").trim().toLowerCase() || "kodux";

  target.setAttribute("data-arch", name);
  target.style.setProperty("--kob-voice-primary", theme.primary);
  target.style.setProperty("--kob-voice-secondary", theme.secondary);
  target.style.setProperty("--kob-voice-bg-soft", theme.bgSoft);
  target.style.setProperty("--kob-voice-glow", theme.glow);
  target.style.setProperty("--kob-voice-border", theme.border);

  document.documentElement.style.setProperty("--kob-voice-primary", theme.primary);
  document.documentElement.style.setProperty("--kob-voice-secondary", theme.secondary);
  document.documentElement.style.setProperty("--kob-voice-bg-soft", theme.bgSoft);
  document.documentElement.style.setProperty("--kob-voice-glow", theme.glow);
  document.documentElement.style.setProperty("--kob-voice-border", theme.border);

  const orb = document.getElementById("orbe") || document.querySelector(".orbe, .voice-orb, .orb");
  if (orb) {
    orb.style.setProperty("--orb-primary", theme.primary);
    orb.style.setProperty("--orb-secondary", theme.secondary);
    orb.style.boxShadow = theme.glow;
    orb.style.background = `radial-gradient(circle at 30% 30%, ${theme.primary}, ${theme.secondary})`;
  }

  return theme;
}

function bindArchEngine() {
  const select = document.getElementById("startArch");
  const saved = (localStorage.getItem("di_userName") || "").trim().toLowerCase();
  const initial = select?.value || saved || "kodux";

  applyArchTheme(initial);

  if (select) {
    select.addEventListener("change", (e) => applyArchTheme(e.target.value));
  }

  const observer = new MutationObserver(() => {
    const arch = document.body.getAttribute("data-arch") || initial;
    applyArchTheme(arch);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-arch"]
  });
}

document.addEventListener("DOMContentLoaded", bindArchEngine);
