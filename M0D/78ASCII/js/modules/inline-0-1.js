const PHONETIC_MAP = {
      B: ["🦵","💧"], R: ["🚀","🤖","🐁"], N: ["🌊","🧬"], T: ["⚔️","🌳"], L: ["🦁","🔦"], V: ["⚡️","💨"], 
      S: ["✨","🔥","❄️"], K: ["🔑"], M: ["🧠","🦉","🍄"], P: ["🧱","💊"], D: ["✋","🐬"], X: ["👾","⚔️"],
      G: ["🐉","🪙"], H: ["♨️","🏠"], Y: ["🦋","🌾"], F: ["🐍","🐦‍🔥"], J: ["🧭","🪼"], C: ["🌜","🪸"], 
      W: ["🍃","🕸️"], Q: ["🔶"], Z: ["🦜","🌒"]
    };

    /* ==========================================================================
       FORGE V5 · ΛrtyΛski CORE + V.E.E.B + DETECÇÃO DE ARQUÉTIPO
       ========================================================================== */
    const ARCHETYPES = [
      "atlas", "nova", "vitalis", "pulse", "kaos", "kodux", "lumine", "aion",
      "kobllux", "artemis", "serena", "genus", "solus", "rhea",
      "uno", "dual", "trinity", "infodose", "horus", "bllue"
    ];

    const ARCH_NAMES = {
      atlas: "Atlas",
      nova: "Nova",
      vitalis: "Vitalis",
      pulse: "Pulse",
      kaos: "Kaos",
      kodux: "Kodux",
      lumine: "Lumine",
      aion: "Aion",
      kobllux: "Kobllux",
      artemis: "Artemis",
      serena: "Serena",
      genus: "Genus",
      solus: "Solus",
      rhea: "Rhea",
      uno: "Uno",
      dual: "Dual",
      trinity: "Trinity",
      infodose: "Infodose",
      horus: "Horus",
      bllue: "Bllue"
    };

    const ARCHETYPES_DB = Object.fromEntries(ARCHETYPES.map(a => [a.toUpperCase(), true]));

    const ARTYASKI_MAP = {
      'A':'Λ','B':'B','C':'C','D':'D','E':'Ξ','F':'F','G':'G','H':'H',
      'I':'I','J':'J','K':'K','L':'L','M':'M','N':'N','O':'Ø','P':'P',
      'Q':'Q','R':'R','S':'§','T':'T','U':'U','V':'V','W':'W','X':'X',
      'Y':'Y','Z':'Z','Ç':'Ç','0':'0','1':'1','2':'2','3':'3','4':'4',
      '5':'5','6':'6','7':'7','8':'8','9':'9'
    };

    const escHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m]));

    function convertToArtyaski(text) {
      return String(text || "").toUpperCase().split('').map(ch => ARTYASKI_MAP[ch] || ch).join('');
    }

    function stripVowels(str) {
      return String(str || "").toUpperCase().replace(/[AEIOUÁÉÍÓÚÂÊÎÔÛÃÕÄËÏÖÜ]/g, '');
    }

    function nameToSymbols(name) {
      const cons = stripVowels(name);
      return cons.split('').map(ch => ARTYASKI_MAP[ch] || ch).join('');
    }

    function detectArchetype(name) {
      const up = String(name || "").toUpperCase().replace(/\s/g, '');
      return Object.keys(ARCHETYPES_DB).find(a => a === up || up.startsWith(a) || a.startsWith(up)) || null;
    }

    function getVeebSimulation(name) {
      const safeName = escHtml(name || "");
      const cons = escHtml(stripVowels(name));
      const symbols = escHtml(nameToSymbols(name));
      const detected = escHtml(detectArchetype(name) || State.currentArchetype || "—");

      return `<span style="color:#3b82f6">[A] Atribuir → perfil = {'nome':'${safeName}','codigo':'${symbols}','ativo':True}</span><br>
<span style="color:#f59e0b">[E] Escolher → arquétipo detectado: ${detected}</span><br>
<span style="color:#10b981">[I] Iterar → passos = [${cons ? cons.split('').map((_,i)=>i+1).join(', ') : '—'}]</span><br>
<span style="color:#d946ef">[O] Organizar → resumo = {'consoantes':'${cons}','simbolos':'${symbols}'}</span><br>
<span style="color:#06b6d4">[U] Unir → base consolidada = IDENTIDADE SINCRONIZADA</span><br>
<span style="color:#46ffd2">✨ Ciclo V.E.E.B completo — ressonância 432Hz ativa ✨</span>`;
    }

"""
text = text.replace("    const PHONETIC_MAP = {\n      B: [\"🦵\",\"💧\"], R: [\"🚀\",\"🤖\",\"🐁\"], N: [\"🌊\",\"🧬\"], T: [\"⚔️\",\"🌳\"], L: [\"🦁\",\"🔦\"], V: [\"⚡️\",\"💨\"], \n      S: [\"✨\",\"🔥\",\"❄️\"], K: [\"🔑\"], M: [\"🧠\",\"🦉\",\"🍄\"], P: [\"🧱\",\"💊\"], D: [\"✋\",\"🐬\"], X: [\"👾\",\"⚔️\"],\n      G: [\"🐉\",\"🪙\"], H: [\"♨️\",\"🏠\"], Y: [\"🦋\",\"🌾\"], F: [\"🐍\",\"🐦‍🔥\"], J: [\"🧭\",\"🪼\"], C: [\"🌜\",\"🪸\"], \n      W: [\"🍃\",\"🕸️\"], Q: [\"🔶\"], Z: [\"🦜\",\"🌒\"]\n    };\n\n    /* --- ESTADO GLOBAL --- */\n", insert_after_phonetic + "\n    /* --- ESTADO GLOBAL --- */\n")

text = text.replace("""    /* --- ESTADO GLOBAL --- */
    const State = {
      exports: { textAscii: "", imageAscii: "", sigilBlob: null },
      vision: { imageElement: null }
    };
""", """    /* --- ESTADO GLOBAL --- */
    const State = {
      exports: { textAscii: "", imageAscii: "", sigilBlob: null, veebHtml: "" },
      vision: { imageElement: null },
      currentArchetype: null
    };
""")

# Replace App object
old_app = """    /* --- SISTEMA CORE --- */
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
"""
new_app = """    /* --- SISTEMA CORE --- */
    const App = {
      async init() {
        if (window.lucide?.createIcons) {
          lucide.createIcons();
        }
        TextForge.generate();
        SigilEngine.regenerate();
        this.setupImageUpload();
        this.toast("FUSION Engine Online");
      },
      navigate(viewId, navEl) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(`view-${viewId}`);
        if (target) target.classList.add('active');
        if (navEl) navEl.classList.add('active');
        if(viewId === 'build') Packer.updateMetrics();
      },
      toast(msg) {
        const wrap = document.getElementById('toast-wrap');
        if (!wrap) return;
        const t = document.createElement("div");
        t.className = "toast";
        t.innerHTML = `<i data-lucide="check-circle" style="width:14px;height:14px;color:var(--accent)"></i> <span>${escHtml(msg)}</span>`;
        wrap.appendChild(t);
        if (window.lucide?.createIcons) lucide.createIcons();
        setTimeout(() => {
          t.style.opacity = "0";
          t.style.transform = "translateY(10px)";
          t.style.transition = "all .3s";
          setTimeout(() => t.remove(), 300);
        }, 2000);
      },
      copyToClipboard(elementId) {
        const el = document.getElementById(elementId);
        const content = el ? el.textContent : "";
        if (!content || content.includes("[ A G U A R D A N D O")) return this.toast("Vazio. Gere algo antes.");
        navigator.clipboard?.writeText(content);
        this.toast("Matriz copiada!");
      },
      setupImageUpload() {
        const input = document.getElementById('img-input');
        const label = document.getElementById('img-label');
        if (!input || !label) return;
        input.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
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
"""
text = text.replace(old_app, new_app)

# Update getChar fallback
text = text.replace('      getChar(ch) { return ASCII_FONT[ch] || ASCII_FONT["?"]; },', '      getChar(ch) { return ASCII_FONT[ch] || ASCII_FONT[" "]; },')

# Add State.currentArchetype and veebHtml in SigilEngine
old_sigil = """    /* --- SIGIL ENGINE --- */
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
"""
new_sigil = """    /* --- SIGIL ENGINE --- */
    const SigilEngine = {
      regenerate() {
        const cvs = document.getElementById('cvs-sigil');
        const ctx = cvs && cvs.getContext ? cvs.getContext('2d') : null;
        if (!cvs || !ctx) return;

        const size = 512;
        const center = size / 2;
        const nameInput = document.getElementById('sigil-name');
        const fgInput = document.getElementById('sigil-color');
        const bgInput = document.getElementById('sigil-bg');

        const name = (nameInput?.value || "FUSION").toUpperCase();
        const fg = fgInput?.value || "#6ee7ff";
        const bg = bgInput?.value || "#000000";

        State.currentArchetype = detectArchetype(name);
        State.exports.veebHtml = getVeebSimulation(name);

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
"""
text = text.replace(old_sigil, new_sigil)

# Add ensureZipLibs and update downloadZip + gallery html
old_packer = """    /* --- PACKER (ZIP/BUILD) --- */
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
"""
new_packer = """    /* --- PACKER (ZIP/BUILD) --- */
    const Packer = {
      updateMetrics() {
        const szT = new Blob([State.exports.textAscii || ""]).size;
        const szI = new Blob([State.exports.imageAscii || ""]).size;
        const szS = State.exports.sigilBlob ? State.exports.sigilBlob.size : 0;
        
        const textStat = document.getElementById('stat-text');
        const imgStat = document.getElementById('stat-img');
        const sigilStat = document.getElementById('stat-sigil');
        const totalStat = document.getElementById('stat-total');

        if (textStat) textStat.innerText = szT > 0 ? (szT/1024).toFixed(1) + " kb" : "0 b";
        if (imgStat) imgStat.innerText = szI > 0 ? (szI/1024).toFixed(1) + " kb" : "0 b";
        if (sigilStat) sigilStat.innerText = szS > 0 ? (szS/1024).toFixed(1) + " kb" : "0 b";
        
        const total = szT + szI + szS + 2048;
        if (totalStat) totalStat.innerText = "~" + (total/1024).toFixed(1) + " KB";
      },

      loadScript(src) {
        return new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            if (window.JSZip || window.saveAs) return resolve();
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
          document.head.appendChild(s);
        });
      },

      async ensureZipLibs() {
        if (!window.JSZip) {
          await this.loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");
        }
        if (!window.saveAs) {
          await this.loadScript("https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js");
        }
      },
      
      async downloadZip() {
        if (!State.exports.textAscii && !State.exports.imageAscii && !State.exports.veebHtml) {
          return App.toast("Forje algo primeiro!");
        }

        try {
          await this.ensureZipLibs();
        } catch (err) {
          console.warn(err);
          return App.toast("Bibliotecas ZIP indisponíveis no momento.");
        }
        
        const zip = new JSZip();
        
        if(State.exports.textAscii) zip.file("arte_tipografica.txt", State.exports.textAscii);
        if(State.exports.imageAscii) zip.file("arte_luma_visao.txt", State.exports.imageAscii);
        if(State.exports.veebHtml) zip.file("veeb_core.html", State.exports.veebHtml);
        if(State.exports.sigilBlob) zip.file("sigilo_identidade.png", State.exports.sigilBlob);

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
    .veeb-core { margin-top: 12px; font-size: 12px; line-height: 1.6; color: #d9f7ff; text-align: left; white-space: normal; }
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
    <pre style="color:#6ee7ff; text-shadow:0 0 10px #6ee7ff;">${escHtml(State.exports.textAscii)}</pre>
  </div>` : ''}

  ${State.exports.imageAscii ? `
  <div class="card">
    <h2>Lente de Visão (Luma)</h2>
    <pre style="font-size:6px; line-height:0.65;">${escHtml(State.exports.imageAscii)}</pre>
  </div>` : ''}

  ${State.exports.veebHtml ? `
  <div class="card">
    <h2>V.E.E.B Core</h2>
    <div class="veeb-core">${State.exports.veebHtml}</div>
  </div>` : ''}
</body>
</html>`;
        
        zip.file("index.html", galleryHtml);

        App.toast("Compilando ZIP...");
        const content = await zip.generateAsync({type:"blob"});
        saveAs(content, `KOBLLUX_FUSION_${Date.now()}.zip`);
        App.toast("Download Iniciado!");
      }
    };
"""
text = text.replace(old_packer, new_packer)

# Add window export maybe before bootstrap
bootstrap_old = """    /* --- BOOTSTRAP --- */
    window.onload = () => App.init();

  """
bootstrap_new = """    /* --- BOOTSTRAP --- */
    window.App = App;
    window.TextForge = TextForge;
    window.ImageForge = ImageForge;
    window.SigilEngine = SigilEngine;
    window.Packer = Packer;
    window.detectArchetype = detectArchetype;
    window.getVeebSimulation = getVeebSimulation;
    window.convertToArtyaski = convertToArtyaski;
    window.stripVowels = stripVowels;
    window.nameToSymbols = nameToSymbols;
    window.ARCHETYPES_DB = ARCHETYPES_DB;

    window.onload = () => App.init();

  """