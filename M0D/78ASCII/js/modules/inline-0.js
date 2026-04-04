
    /* --- DICIONÁRIOS MESTRES --- */
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

    /* --- ESTADO GLOBAL --- */
    const State = {
      exports: { textAscii: "", imageAscii: "", sigilBlob: null },
      vision: { imageElement: null }
    };

    /* --- SISTEMA CORE --- */
    const App = {
      init() {
        lucide.createIcons();
        TextForge.generate();
        SigilEngine.regenerate();
        this.setupImageUpload();
        this.toast("FUSION Engine Online");
      },
      navigate(viewId, navEl) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        navEl.classList.add('active');
        if(viewId === 'build') Packer.updateMetrics();
      },
      toast(msg) {
        const wrap = document.getElementById('toast-wrap');
        const t = document.createElement("div"); t.className = "toast";
        t.innerHTML = `<i data-lucide="check-circle" style="width:14px;height:14px;color:var(--accent)"></i> <span>${msg}</span>`;
        wrap.appendChild(t); lucide.createIcons();
        setTimeout(() => {
          t.style.opacity = "0"; t.style.transform = "translateY(10px)"; t.style.transition = "all .3s";
          setTimeout(() => t.remove(), 300);
        }, 2000);
      },
      copyToClipboard(elementId) {
        const content = document.getElementById(elementId).textContent;
        if (!content || content.includes("[ A G U A R D A N D O")) return this.toast("Vazio. Gere algo antes.");
        navigator.clipboard.writeText(content);
        this.toast("Matriz copiada!");
      },
      setupImageUpload() {
        const input = document.getElementById('img-input');
        const label = document.getElementById('img-label');
        input.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if(!file) return;
          label.textContent = file.name;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => { State.vision.imageElement = img; ImageForge.generate(); };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
    };

    /* --- TEXT FORGE --- */
    const TextForge = {
      normalize(text) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); },
      getChar(ch) { return ASCII_FONT[ch] || ASCII_FONT["?"]; },
      scalePat(pat, scale, fill) {
        const out = [];
        for (const row of pat) {
          let line = "";
          for (const ch of row) { line += (ch === "1" ? fill : " ").repeat(scale); }
          for(let s=0; s<scale; s++) out.push(line);
        }
        return out;
      },
      banner(text, fill) {
        const chars = this.normalize(text).split("");
        const rows = Array(7).fill("");
        chars.forEach(ch => {
          const pat = this.getChar(ch);
          const scaled = this.scalePat(pat, 2, fill); // Escala fixa 2 para Mobile legibility
          for (let r=0; r<scaled.length; r++) rows[r] += scaled[r] + "  ";
        });
        return rows.join("\n");
      },
      frame(ascii, title) {
        const lines = ascii.split("\n");
        const w = Math.max(...lines.map(l => l.length), title.length + 6);
        const top = `+${"-".repeat(w+2)}+`;
        const label = `| ${title.padStart(Math.floor((w+title.length)/2), " ").padEnd(w, " ")} |`;
        const body = lines.map(l => `| ${l.padEnd(w, " ")} |`).join("\n");
        return [top, label, body, top].join("\n");
      },
      wave(text, fill) {
        const clean = this.normalize(text).replace(/\s+/g, " ").trim();
        const waves = Array(7).fill("");
        for (let i=0; i<clean.length; i++) {
          const amp = (i % 2 === 0 ? 1 : 0);
          for (let r=0; r<7; r++) {
            const offset = Math.abs(3 - r) + amp;
            const pat = this.getChar(clean[i]);
            const scaled = this.scalePat(pat, 2, fill);
            waves[r] += " ".repeat(offset*2) + (scaled[r]||"") + "  ";
          }
        }
        return waves.join("\n");
      },
      generate() {
        const text = document.getElementById('txt-input').value.trim() || "FUSION";
        const fill = document.getElementById('txt-fill').value;
        const mode = document.getElementById('txt-mode').value;
        
        let out = "";
        if(mode === "frame") out = this.frame(this.banner(text, fill), text);
        else if(mode === "wave") out = this.wave(text, fill);
        else out = this.banner(text, fill);

        State.exports.textAscii = out;
        document.getElementById('txt-output').textContent = out;
        App.toast("Tipografia Forjada");
      }
    };

    /* --- IMAGE FORGE (Vision) --- */
    const ImageForge = {
      generate() {
        if(!State.vision.imageElement) return App.toast("Carregue uma imagem primeiro");
        
        const img = State.vision.imageElement;
        const cvs = document.getElementById('cvs-offline');
        const ctx = cvs.getContext('2d');
        const chars = IMG_CHARSETS[document.getElementById('img-lens').value];
        const outW = parseInt(document.getElementById('img-slider').value, 10);
        
        // Multiplicador ~0.45 para correção de distorção de fonte monospace
        const outH = Math.floor((outW / (img.width / img.height)) * 0.45);
        cvs.width = outW; cvs.height = outH;
        
        ctx.drawImage(img, 0, 0, outW, outH);
        const data = ctx.getImageData(0, 0, outW, outH).data;
        
        let ascii = "";
        for (let y = 0; y < outH; y++) {
          for (let x = 0; x < outW; x++) {
            const off = (y * outW + x) * 4;
            const luma = (0.299*data[off] + 0.587*data[off+1] + 0.114*data[off+2]);
            const charIdx = Math.floor((luma / 255) * (chars.length - 1));
            ascii += chars[charIdx];
          }
          ascii += "\n";
        }
        
        State.exports.imageAscii = ascii;
        document.getElementById('img-output').textContent = ascii;
        App.toast("Luma Mapeada com Sucesso");
      }
    };

    /* --- SIGIL ENGINE --- */
    const SigilEngine = {
      regenerate() {
        const cvs = document.getElementById('cvs-sigil');
        const ctx = cvs.getContext('2d');
        const size = 512; const center = size / 2;
        const name = document.getElementById('sigil-name').value.toUpperCase() || "FUSION";
        const fg = document.getElementById('sigil-color').value;
        const bg = document.getElementById('sigil-bg').value;

        // Fundo
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);

        // Core extraction
        const cons = name.replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '');
        const seed = cons[0] || 'X';
        const satelites = cons.split('').slice(0, 4);

        // Geometria
        ctx.strokeStyle = fg; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(center, center, 200, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(center, center, 160, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;

        // Emojis (Misticismo)
        ctx.font = "bold 160px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const mainEmo = (PHONETIC_MAP[seed] || ["💠"])[0];
        ctx.fillText(mainEmo, center, center + 15);

        // Orbitais
        if (satelites.length > 1) {
          const radius = 160;
          satelites.forEach((char, i) => {
            const map = PHONETIC_MAP[char] || ["•"];
            const emo = map[i % map.length] || map[0];
            const angle = (i * (2 * Math.PI / satelites.length)) - (Math.PI / 2);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            ctx.beginPath(); ctx.moveTo(center, center); ctx.lineTo(x, y);
            ctx.strokeStyle = fg; ctx.globalAlpha = 0.2; ctx.stroke();

            ctx.globalAlpha = 1; ctx.font = "40px sans-serif";
            ctx.fillText(emo, x, y);
          });
        }

        // Tech Decals
        ctx.font = "bold 20px var(--font-mono)"; ctx.fillStyle = fg; ctx.globalAlpha = 0.6;
        ctx.fillText("FUSION-ARCHITECT", center, 460);
        ctx.fillText("ID: " + btoa(name).substring(0,8), center, 70);

        // Save Blob
        cvs.toBlob(blob => State.exports.sigilBlob = blob, "image/png");
      }
    };

    /* --- PACKER (ZIP/BUILD) --- */
    const Packer = {
      updateMetrics() {
        const szT = new Blob([State.exports.textAscii]).size;
        const szI = new Blob([State.exports.imageAscii]).size;
        const szS = State.exports.sigilBlob ? State.exports.sigilBlob.size : 0;
        
        document.getElementById('stat-text').innerText = szT > 0 ? (szT/1024).toFixed(1) + " kb" : "0 b";
        document.getElementById('stat-img').innerText = szI > 0 ? (szI/1024).toFixed(1) + " kb" : "0 b";
        document.getElementById('stat-sigil').innerText = szS > 0 ? (szS/1024).toFixed(1) + " kb" : "0 b";
        
        const total = szT + szI + szS + 2048; // +2kb para overhead html
        document.getElementById('stat-total').innerText = "~" + (total/1024).toFixed(1) + " KB";
      },
      
      downloadZip() {
        if (!State.exports.textAscii && !State.exports.imageAscii) return App.toast("Forje algo primeiro!");
        
        const zip = new JSZip();
        
        // Add txt files
        if(State.exports.textAscii) zip.file("arte_tipografica.txt", State.exports.textAscii);
        if(State.exports.imageAscii) zip.file("arte_luma_visao.txt", State.exports.imageAscii);
        
        // Add image
        if(State.exports.sigilBlob) zip.file("sigilo_identidade.png", State.exports.sigilBlob);

        // Mini Gallery HTML Generation
        const galleryHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>KOBLLUX FUSION · Mini Gallery</title>
  <style>
    body { background: #05070a; color: #6ee7ff; font-family: monospace; padding: 40px; text-align: center; }
    .card { background: #0b1020; border: 1px solid rgba(110,231,255,0.2); border-radius: 20px; padding: 20px; margin: 20px auto; max-width: 900px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    pre { font-size: 8px; line-height: 1.1; overflow: auto; background: #000; padding: 20px; border-radius: 10px; color: #e8ecff; }
    h1 { letter-spacing: 0.2em; }
    h2 { font-size: 14px; color: #a855f7; letter-spacing: 0.1em; text-transform: uppercase; }
    img { width: 300px; height: 300px; border-radius: 50%; box-shadow: 0 0 40px rgba(110,231,255,0.3); border: 1px solid rgba(110,231,255,0.5); }
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
    <pre style="color:#6ee7ff; text-shadow:0 0 10px #6ee7ff;">${State.exports.textAscii.replace(/</g, '&lt;')}</pre>
  </div>` : ''}

  ${State.exports.imageAscii ? `
  <div class="card">
    <h2>Lente de Visão (Luma)</h2>
    <pre style="font-size:6px; line-height:0.65;">${State.exports.imageAscii.replace(/</g, '&lt;')}</pre>
  </div>` : ''}
</body>
</html>`;
        
        zip.file("index.html", galleryHtml);

        App.toast("Compilando ZIP...");
        zip.generateAsync({type:"blob"}).then(content => {
          saveAs(content, `KOBLLUX_FUSION_${Date.now()}.zip`);
          App.toast("Download Iniciado!");
        });
      }
    };

    /* --- BOOTSTRAP --- */
    window.onload = () => App.init();

  