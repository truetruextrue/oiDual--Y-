/* KOBLLUX FUSION · patched bridge
   - Safe against missing legacy IDs
   - Compatible with current HTML
   - ZIP export fallback included
*/

(() => {
  'use strict';

  const pickEl = (...ids) => ids.map(id => document.getElementById(id)).find(Boolean);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const ASCII_FONT = {
    "A":["  1  "," 1 1 ","1   1","11111","1   1","1   1","1   1"], "B":["1111 ","1   1","1111 ","1   1","1   1","1   1","1111 "],
    "C":[" 1111","1    ","1    ","1    ","1    ","1    "," 1111"], "D":["1111 ","1   1","1   1","1   1","1   1","1   1","1111 "],
    "E":["11111","1    ","1111 ","1    ","1    ","1    ","11111"], "F":["11111","1    ","1111 ","1    ","1    ","1    ","1    "],
    "G":[" 1111","1    ","1    ","1 111","1   1","1   1"," 1111"], "H":["1   1","1   1","11111","1   1","1   1","1   1","1   1"],
    "I":["11111","  1  ","  1  ","  1  ","  1  ","  1  ","11111"], "J":["11111","   1 ","   1 ","   1 ","1  1 ","1  1 "," 11  "],
    "K":["1   1","1  1 ","111  ","1  1 ","1   1","1   1","1   1"], "L":["1    ","1    ","1    ","1    ","1    ","1    ","11111"],
    "M":["1   1","11 11","1 1 1","1   1","1   1","1   1","1   1"], "N":["1   1","11  1","1 1 1","1  11","1   1","1   1","1   1"],
    "O":[" 111 ","1   1","1   1","1   1","1   1","1   1"," 111 "], "P":["1111 ","1   1","1   1","1111 ","1    ","1    ","1    "],
    "Q":[" 111 ","1   1","1   1","1   1","1 1 1","1  1 "," 11 1"], "R":["1111 ","1   1","1   1","1111 ","1  1 ","1   1","1   1"],
    "S":[" 1111","1    ","1    "," 111 ","    1","    1","1111 "], "T":["11111","  1  ","  1  ","  1  ","  1  ","  1  ","  1  "],
    "U":["1   1","1   1","1   1","1   1","1   1","1   1"," 111 "], "V":["1   1","1   1","1   1","1   1","1   1"," 1 1 ","  1  "],
    "W":["1   1","1   1","1   1","1 1 1","1 1 1","11 11","1   1"], "X":["1   1","1   1"," 1 1 ","  1  "," 1 1 ","1   1","1   1"],
    "Y":["1   1","1   1"," 1 1 ","  1  ","  1  ","  1  ","  1  "], "Z":["11111","    1","   1 ","  1  "," 1   ","1    ","11111"],
    "0":[" 111 ","1   1","1  11","1 1 1","11  1","1   1"," 111 "], "1":["  1  "," 11  ","1 1  ","  1  ","  1  ","  1  ","11111"],
    "2":[" 111 ","1   1","    1","   1 ","  1  "," 1   ","11111"], "3":["1111 ","    1","   1 "," 111 ","    1","    1","1111 "],
    "4":["1   1","1   1","1   1","11111","    1","    1","    1"], "5":["11111","1    ","1    ","1111 ","    1","    1","1111 "],
    "6":[" 111 ","1    ","1    ","1111 ","1   1","1   1"," 111 "], "7":["11111","    1","   1 ","  1  "," 1   ","1    ","1    "],
    "8":[" 111 ","1   1","1   1"," 111 ","1   1","1   1"," 111 "], "9":[" 111 ","1   1","1   1"," 1111","    1","    1"," 111 "],
    "?":["11111","    1","   1 ","  1  ","  1  ","     ","  1  "],
    " ":["  ","  ","  ","  ","  ","  ","  "]
  };

  const IMG_CHARSETS = {
    atlas: " .`-_':,;^=+/\"|)\\<>)iv%xclrs{*}I?!][1taeo7zjLuT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@HBNWD0RQKMMM",
    nova: "  ░▒▓█",
    kaos: " 01",
    kobllux: " .LUXKOB"
  };

  const PHONETIC_MAP = {
    B: ["🦵","💧"], R: ["🚀","🤖","🐁"], N: ["🌊","🧬"], T: ["⚔️","🌳"], L: ["🦁","🔦"], V: ["⚡️","💨"],
    S: ["✨","🔥","❄️"], K: ["🔑"], M: ["🧠","🦉","🍄"], P: ["🧱","💊"], D: ["✋","🐬"], X: ["👾","⚔️"],
    G: ["🐉","🪙"], H: ["♨️","🏠"], Y: ["🦋","🌾"], F: ["🐍","🐦‍🔥"], J: ["🧭","🪼"], C: ["🌜","🪸"],
    W: ["🍃","🕸️"], Q: ["🔶"], Z: ["🦜","🌒"]
  };

  const State = {
    exports: { textAscii: "", imageAscii: "", sigilBlob: null },
    vision: { imageElement: null }
  };

  const App = {
    init() {
      try { if (window.lucide?.createIcons) window.lucide.createIcons(); } catch (_) {}

      this.setupImageUpload();
      this.syncLegacyUserLabel();

      // generate default artifacts only when the DOM pieces exist
      try { TextForge.generate(false); } catch (_) {}
      try { SigilEngine.regenerate(); } catch (_) {}

      this.toast("FUSION Engine Online");
    },

    syncLegacyUserLabel() {
      const userName = (localStorage.getItem("di_userName") || "User").trim();
      const userOption = document.getElementById("diUserOption");
      if (userOption) {
        userOption.value = userName.toLowerCase();
        userOption.textContent = `${userName} (Usuário/Núcleo)`;
      }
    },

    navigate(viewId, navEl) {
      qsa('.view-section').forEach(el => el.classList.remove('active'));
      qsa('.nav-item').forEach(el => el.classList.remove('active'));
      const target = document.getElementById(`view-${viewId}`);
      if (target) target.classList.add('active');
      if (navEl) navEl.classList.add('active');
      if (viewId === 'build') Packer.updateMetrics();
    },

    toast(msg) {
      const wrap = pickEl('toast-wrap', 'toast-container');
      if (!wrap) return;
      const t = document.createElement("div");
      t.className = "toast";
      t.innerHTML = `<i data-lucide="check-circle" style="width:14px;height:14px;color:var(--accent)"></i> <span>${escapeHtml(msg)}</span>`;
      wrap.appendChild(t);
      try { if (window.lucide?.createIcons) window.lucide.createIcons(); } catch (_) {}

      setTimeout(() => {
        t.style.opacity = "0";
        t.style.transform = "translateY(10px)";
        t.style.transition = "all .3s";
        setTimeout(() => t.remove(), 300);
      }, 2000);
    },

    async copyToClipboard(elementId) {
      const el = document.getElementById(elementId);
      const content = el ? el.textContent : "";
      if (!content || content.includes("[ A G U A R D A N D O")) return this.toast("Vazio. Gere algo antes.");

      try {
        await navigator.clipboard.writeText(content);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = content;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      this.toast("Matriz copiada!");
    },

    setupImageUpload() {
      const input = pickEl('img-input');
      const label = pickEl('img-label');
      if (!input || !label) return;

      input.addEventListener('change', (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        label.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            State.vision.imageElement = img;
            ImageForge.generate();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const TextForge = {
    normalize(text) {
      return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    },

    getChar(ch) {
      return ASCII_FONT[ch] || ASCII_FONT["?"] || ASCII_FONT[" "];
    },

    scalePat(pat, scale, fill) {
      const out = [];
      for (const row of pat) {
        let line = "";
        for (const ch of row) line += (ch === "1" ? fill : " ").repeat(scale);
        for (let s = 0; s < scale; s++) out.push(line);
      }
      return out;
    },

    banner(text, fill) {
      const chars = this.normalize(text).split("");
      const rows = Array(7).fill("");
      chars.forEach(ch => {
        const pat = this.getChar(ch);
        const scaled = this.scalePat(pat, 2, fill);
        for (let r = 0; r < scaled.length; r++) rows[r] += scaled[r] + "  ";
      });
      return rows.join("\n");
    },

    frame(ascii, title) {
      const lines = ascii.split("\n");
      const w = Math.max(...lines.map(l => l.length), title.length + 6);
      const top = `+${"-".repeat(w + 2)}+`;
      const label = `| ${title.padStart(Math.floor((w + title.length) / 2), " ").padEnd(w, " ")} |`;
      const body = lines.map(l => `| ${l.padEnd(w, " ")} |`).join("\n");
      return [top, label, body, top].join("\n");
    },

    wave(text, fill) {
      const clean = this.normalize(text).replace(/\s+/g, " ").trim();
      const waves = Array(14).fill("");
      for (let i = 0; i < clean.length; i++) {
        const pat = this.getChar(clean[i]);
        const scaled = this.scalePat(pat, 2, fill);
        for (let r = 0; r < 7; r++) {
          const offset = Math.abs(3 - r) + (i % 2 === 0 ? 1 : 0);
          waves[r] += " ".repeat(offset * 2) + (scaled[r] || "") + "  ";
        }
      }
      return waves.slice(0, 7).join("\n");
    },

    generate(showToast = true) {
      const input = pickEl('txt-input', 'inputText');
      const outEl = pickEl('txt-output', 'outputContainer');
      const fillEl = pickEl('txt-fill');
      const modeEl = pickEl('txt-mode');

      if (!input || !outEl || !fillEl || !modeEl) return;

      const text = input.value.trim() || "FUSION";
      const fill = fillEl.value || "█";
      const mode = modeEl.value || "banner";

      let out = "";
      if (mode === "frame") out = this.frame(this.banner(text, fill), text);
      else if (mode === "wave") out = this.wave(text, fill);
      else out = this.banner(text, fill);

      State.exports.textAscii = out;
      outEl.textContent = out;
      App.toast(showToast ? "Tipografia Forjada" : " ");
      Packer.updateMetrics();
    }
  };

  const ImageForge = {
    generate() {
      if (!State.vision.imageElement) return App.toast("Carregue uma imagem primeiro");

      const img = State.vision.imageElement;
      const cvs = pickEl('cvs-offline');
      const outEl = pickEl('img-output');
      const lensEl = pickEl('img-lens');
      const sliderEl = pickEl('img-slider');

      if (!cvs || !outEl || !lensEl || !sliderEl) return App.toast("Interface de visão indisponível");

      const ctx = cvs.getContext('2d');
      const chars = IMG_CHARSETS[lensEl.value] || IMG_CHARSETS.atlas;
      const outW = parseInt(sliderEl.value, 10) || 80;
      const outH = Math.max(1, Math.floor((outW / (img.width / img.height)) * 0.45));

      cvs.width = outW;
      cvs.height = outH;

      ctx.clearRect(0, 0, outW, outH);
      ctx.drawImage(img, 0, 0, outW, outH);

      const data = ctx.getImageData(0, 0, outW, outH).data;

      let ascii = "";
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          const off = (y * outW + x) * 4;
          const luma = (0.299 * data[off] + 0.587 * data[off + 1] + 0.114 * data[off + 2]);
          const charIdx = Math.floor((luma / 255) * (chars.length - 1));
          ascii += chars[Math.max(0, Math.min(chars.length - 1, charIdx))];
        }
        ascii += "\n";
      }

      State.exports.imageAscii = ascii;
      outEl.textContent = ascii;
      App.toast("Luma Mapeada com Sucesso");
      Packer.updateMetrics();
    }
  };

  const SigilEngine = {
    regenerate() {
      const cvs = pickEl('cvs-sigil');
      const nameEl = pickEl('sigil-name');
      const fgEl = pickEl('sigil-color');
      const bgEl = pickEl('sigil-bg');
      if (!cvs || !nameEl || !fgEl || !bgEl) return;

      const ctx = cvs.getContext('2d');
      const size = 512;
      const center = size / 2;
      const name = (nameEl.value || "FUSION").toUpperCase();
      const fg = fgEl.value || "#6ee7ff";
      const bg = bgEl.value || "#000000";

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      const cons = name.replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '');
      const seed = cons[0] || 'X';
      const satellites = cons.split('').slice(0, 4);

      ctx.strokeStyle = fg;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(center, center, 200, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(center, center, 160, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.font = "bold 160px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const mainEmo = (PHONETIC_MAP[seed] || ["💠"])[0];
      ctx.fillText(mainEmo, center, center + 15);

      if (satellites.length > 1) {
        const radius = 160;
        satellites.forEach((char, i) => {
          const map = PHONETIC_MAP[char] || ["•"];
          const emo = map[i % map.length] || map[0];
          const angle = (i * (2 * Math.PI / satellites.length)) - (Math.PI / 2);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          ctx.beginPath();
          ctx.moveTo(center, center);
          ctx.lineTo(x, y);
          ctx.strokeStyle = fg;
          ctx.globalAlpha = 0.2;
          ctx.stroke();

          ctx.globalAlpha = 1;
          ctx.font = "40px sans-serif";
          ctx.fillText(emo, x, y);
        });
      }

      ctx.font = "bold 20px monospace";
      ctx.fillStyle = fg;
      ctx.globalAlpha = 0.6;
      ctx.fillText("FUSION-ARCHITECT", center, 460);
      let idText = "";
      try { idText = "ID: " + btoa(unescape(encodeURIComponent(name))).substring(0, 8); }
      catch (_) { idText = "ID: " + name.slice(0, 8); }
      ctx.fillText(idText, center, 70);

      ctx.restore();

      cvs.toBlob(blob => {
        State.exports.sigilBlob = blob;
        Packer.updateMetrics();
      }, "image/png");
    }
  };

  const Packer = {
    updateMetrics() {
      const statText = pickEl('stat-text');
      const statImg = pickEl('stat-img');
      const statSigil = pickEl('stat-sigil');
      const statTotal = pickEl('stat-total');
      if (!statText || !statImg || !statSigil || !statTotal) return;

      const szT = new Blob([State.exports.textAscii || ""]).size;
      const szI = new Blob([State.exports.imageAscii || ""]).size;
      const szS = State.exports.sigilBlob ? State.exports.sigilBlob.size : 0;

      statText.innerText = szT > 0 ? (szT / 1024).toFixed(1) + " kb" : "0 b";
      statImg.innerText = szI > 0 ? (szI / 1024).toFixed(1) + " kb" : "0 b";
      statSigil.innerText = szS > 0 ? (szS / 1024).toFixed(1) + " kb" : "0 b";

      const total = szT + szI + szS + 2048;
      statTotal.innerText = "~" + (total / 1024).toFixed(1) + " KB";
    },

    async downloadZip() {
      if (!State.exports.textAscii && !State.exports.imageAscii && !State.exports.sigilBlob) {
        return App.toast("Forje algo primeiro!");
      }

      // Fallback if external libs are missing
      if (!window.JSZip) {
        const fallbackText = [
          "KOBLLUX FUSION EXPORT",
          "",
          State.exports.textAscii ? "=== TEXTO ===\n" + State.exports.textAscii : "",
          State.exports.imageAscii ? "\n=== IMAGEM ===\n" + State.exports.imageAscii : "",
          State.exports.sigilBlob ? "\n=== SIGILO ===\n[PNG em blob não incluído sem JSZip]" : ""
        ].join("\n");

        const blob = new Blob([fallbackText], { type: "text/plain;charset=utf-8" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `KOBLLUX_FUSION_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        return App.toast("Exportação básica concluída");
      }

      const zip = new JSZip();

      if (State.exports.textAscii) zip.file("arte_tipografica.txt", State.exports.textAscii);
      if (State.exports.imageAscii) zip.file("arte_luma_visao.txt", State.exports.imageAscii);
      if (State.exports.sigilBlob) zip.file("sigilo_identidade.png", State.exports.sigilBlob);

      const galleryHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>KOBLLUX FUSION · Mini Gallery</title>
  <style>
    body { background: #05070a; color: #6ee7ff; font-family: monospace; padding: 40px; text-align: center; }
    .card { background: #0b1020; border: 1px solid rgba(110,231,255,0.2); border-radius: 20px; padding: 20px; margin: 20px auto; max-width: 900px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    pre { font-size: 8px; line-height: 1.1; overflow: auto; background: #000; padding: 20px; border-radius: 10px; color: #e8ecff; white-space: pre-wrap; word-break: break-word; }
    h1 { letter-spacing: 0.2em; }
    h2 { font-size: 14px; color: #a855f7; letter-spacing: 0.1em; text-transform: uppercase; }
    img { width: 300px; height: 300px; border-radius: 50%; box-shadow: 0 0 40px rgba(110,231,255,0.3); border: 1px solid rgba(110,231,255,0.5); object-fit: cover; }
  </style>
</head>
<body>
  <h1>KOBLLUX FUSION GALLERY</h1>
  <p style="color: #666;">Arte gerada pelo Ultimate ASCII Architect</p>

  ${State.exports.sigilBlob ? `
  <div class="card">
    <h2>Matriz de Identidade (Sigilo)</h2>
    <img src="sigilo_identidade.png" alt="Sigil">
  </div>` : ''}

  ${State.exports.textAscii ? `
  <div class="card">
    <h2>Forja Tipográfica</h2>
    <pre style="color:#6ee7ff; text-shadow:0 0 10px #6ee7ff;">${escapeHtml(State.exports.textAscii)}</pre>
  </div>` : ''}

  ${State.exports.imageAscii ? `
  <div class="card">
    <h2>Lente de Visão (Luma)</h2>
    <pre style="font-size:6px; line-height:0.65;">${escapeHtml(State.exports.imageAscii)}</pre>
  </div>` : ''}
</body>
</html>`;

      zip.file("index.html", galleryHtml);

      App.toast("Compilando ZIP...");
      const content = await zip.generateAsync({ type: "blob" });

      if (window.saveAs) {
        saveAs(content, `KOBLLUX_FUSION_${Date.now()}.zip`);
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `KOBLLUX_FUSION_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }

      App.toast("Download Iniciado!");
    }
  };

  // Legacy bridge for older engines if they are loaded elsewhere
  window.App = App;
  window.TextForge = TextForge;
  window.ImageForge = ImageForge;
  window.SigilEngine = SigilEngine;
  window.Packer = Packer;

  document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Safely wire any optional legacy IDs without requiring them.
    const legacyBtn = pickEl('genBtn');
    if (legacyBtn && !legacyBtn.dataset.bound) {
      legacyBtn.dataset.bound = "true";
      legacyBtn.addEventListener('click', () => {
        try { TextForge.generate(); } catch (_) {}
      });
    }

    // Compatibility aliases for older "motor" DOMs, if the old markup ever appears.
    window.KobAccordion = window.KobAccordion || {
      open: (card) => {
        card = (typeof card === 'string') ? document.querySelector(card) : card;
        if (!card) return;
        card.classList.remove('is-collapsed');
        card.classList.add('is-open');
      },
      close: (card) => {
        card = (typeof card === 'string') ? document.querySelector(card) : card;
        if (!card) return;
        card.classList.remove('is-open');
        card.classList.add('is-collapsed');
      },
      toggle: (card) => {
        card = (typeof card === 'string') ? document.querySelector(card) : card;
        const header = card?.querySelector('.accordion-header');
        if (header) header.click();
      }
    };
  });
})();
