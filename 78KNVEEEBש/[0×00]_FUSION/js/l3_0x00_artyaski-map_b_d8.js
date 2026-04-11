/* ═══════════════════════════════════════════════════════════
   0x00 · INICIAR · B · D8
   ═══════════════════════════════════════════════════════════
   Arquivo   : fusion-os-vision-ultimate-v5-forge/js/L3_0x00_artyaski-map_B_D8.js
   Opcode    : 0x00 · INICIAR · ○ · 396Hz
   V.E.E.B.  : Base
   Degrau    : D8 (system)
   Fórmula   : Base · ponto zero · S=Σbᵢ·2^(i-1) · identidade do sistema
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 3 · STORAGE_DOM
   Opcode Δ  : 0x06 · Carregar na posição 3 da cadeia
   Nota      : Storage + DOM — só após HTML parseado
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 249  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=396)
     χ = 12  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
/* ==========================================================================
       FORGE V5 · IDENTIDADE + V.E.E.B + ARTYASKI
    ========================================================================== */
    const ARTYASKI_MAP = {
      'A':'Λ','B':'B','C':'C','D':'D','E':'Ξ','F':'F','G':'G','H':'H',
      'I':'I','J':'J','K':'K','L':'L','M':'M','N':'N','O':'Ø','P':'P',
      'Q':'Q','R':'R','S':'§','T':'T','U':'U','V':'V','W':'W','X':'X',
      'Y':'Y','Z':'Z','Ç':'Ç','0':'0','1':'1','2':'2','3':'3','4':'4',
      '5':'5','6':'6','7':'7','8':'8','9':'9'
    };
    function convertToArtyaski(text) { return text.toUpperCase().split('').map(ch => ARTYASKI_MAP[ch] || ch).join(''); }
    function stripVowels(str) { return str.toUpperCase().replace(/[AEIOUÁÉÍÓÚÂÊÎÔÛÃÕÄËÏÖÜ]/g,''); }
    function nameToSymbols(name) { const cons = stripVowels(name); return cons.split('').map(ch => ARTYASKI_MAP[ch] || ch).join(''); }
    function detectArchetype(name) {
      const up = name.toUpperCase().replace(/\s/g,'');
      return Object.keys(ARCHETYPES_DB).find(a => a === up || up.startsWith(a) || a.startsWith(up)) || null;
    }
    function getVeebSimulation(name) {
      const cons = stripVowels(name);
      const symbols = nameToSymbols(name);
      return `<span style="color:#3b82f6">[A] Atribuir → perfil = {'nome':'${name}','codigo':'${symbols}','ativo':True}</span><br>
<span style="color:#f59e0b">[E] Escolher → arquétipo detectado: ${STATE.currentArchetype}</span><br>
<span style="color:#10b981">[I] Iterar → passos = [${cons.split('').map((_,i)=>i+1).join(', ')}]</span><br>
<span style="color:#d946ef">[O] Organizar → resumo = {'consoantes':'${cons}','simbolos':'${symbols}'}</span><br>
<span style="color:#06b6d4">[U] Unir → base consolidada = IDENTIDADE SINCRONIZADA</span><br>
<span style="color:#46ffd2">✨ Ciclo V.E.E.B completo — ressonância 432Hz ativa ✨</span>`;
    }

    function showForgeModal() {
      Modal.show(`
        <h3 class="text-2xl font-thin mb-2">Forjar Identidade</h3>
        <p class="text-xs text-white/40 mb-6 font-mono">ΛrtyΛski · V.E.E.B · Sincronia</p>
        <input id="forgeNameInput" type="text" class="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-[var(--active-color)]/50 mb-4" placeholder="Digite seu nome ou código..." autocomplete="off">
        <div id="forgePreview" class="text-[11px] font-mono text-white/60 bg-black/20 rounded-xl p-3 mb-4">⌘ aguardando entrada</div>
        <div class="flex justify-end gap-3">
          <button onclick="Modal.hide()" class="v-pill hover:bg-white/10">Cancelar</button>
          <button onclick="confirmForgeIdentity()" class="v-pill bg-[var(--active-color)]/20 border-[var(--active-color)]/50 text-[var(--active-color)] hover:bg-[var(--active-color)]/30">Sincronizar</button>
        </div>
      `);
      const input = document.getElementById('forgeNameInput');
      const preview = document.getElementById('forgePreview');
      input.addEventListener('input', function(e) {
        const val = e.target.value.trim();
        if (!val) { preview.innerHTML = '⌘ aguardando entrada'; return; }
        const arch = detectArchetype(val);
        const symbols = nameToSymbols(val);
        preview.innerHTML = `<span class="text-[var(--active-color)]">${convertToArtyaski(val)}</span><br>└─ símbolos: ${symbols}<br>└─ arquétipo: ${arch || '—'}<br>${getVeebSimulation(val).replace(/<br>/g,'<br> ')}`;
      });
    }

    function confirmForgeIdentity() {
      const input = document.getElementById('forgeNameInput');
      const name = input.value.trim();
      if (!name) return;
      const arch = detectArchetype(name);
      if (arch) Archetype.set(arch);
      else Archetype.set('ATLAS');
      STATE.userName = name;
      localStorage.setItem(KEYS.USER, name);
      const displayHeader = document.getElementById('displayUserHeader');
      if (displayHeader) displayHeader.innerText = convertToArtyaski(name);
      const veebContent = `⚡ Sincronia V.E.E.B: ${name}\n\n${getVeebSimulation(name).replace(/<br>/g,'\n')}`;
      const veebEntry = { id: Date.now(), content: veebContent, tags: ['veeb','sincronia'], date: Date.now() };
      STATE.cortex.crystals.unshift(veebEntry);
      localStorage.setItem(KEYS.CORTEX, JSON.stringify(STATE.cortex));
      Cortex.render();
      Modal.hide();
      toast(`⚡ ${convertToArtyaski(name)} · sincronizado`);
    }

    /* ==========================================================================
       KOBLLUX_DNA · FONTE ÚNICA · 13 OPCODES × V.E.E.B.
    ========================================================================== */
    const KOBLLUX_DNA = {
      fractal:{ seq:[3,6,9,7], product:1134, alpha:1/137 },
      opcodes:{
        '0x00':{nome:'INICIAR',    freq:396, geom:'○', cor:'#b978ff', dim:'D0·Ponto'  },
        '0x01':{nome:'PULSAR',     freq:432, geom:'●', cor:'#67e6ff', dim:'D1·Linha'  },
        '0x02':{nome:'INTEGRAR',   freq:528, geom:'―', cor:'#7cffb2', dim:'D2·Plano'  },
        '0x03':{nome:'EXPANDIR',   freq:639, geom:'▢', cor:'#4de0ff', dim:'D3·Volume' },
        '0x04':{nome:'DISSOLVER',  freq:594, geom:'◇', cor:'#ff9ad1', dim:'D2·Trans'  },
        '0x05':{nome:'CONVERGIR',  freq:672, geom:'⧉', cor:'#ff7a00', dim:'D∩·Foco'  },
        '0x06':{nome:'CRISTALIZAR',freq:741, geom:'☯', cor:'#a8ff78', dim:'D3·Rede'   },
        '0x07':{nome:'SELAR',      freq:777, geom:'✧', cor:'#ffd700', dim:'D3·Tetrae' },
        '0x08':{nome:'TESTEMUNHAR',freq:852, geom:'◉', cor:'#00b894', dim:'D∞·Círculo'},
        '0x09':{nome:'MANIFESTAR', freq:963, geom:'♾', cor:'#6c5ce7', dim:'S²·Esfera' },
        '0x0A':{nome:'EQUILIBRAR', freq:528, geom:'⚖', cor:'#74b9ff', dim:'SO(2)'     },
        '0x0B':{nome:'RESSONAR',   freq:432, geom:'◎', cor:'#ff52e5', dim:'Ondas·1D'  },
        '0x0C':{nome:'CONCLUIR',   freq:999, geom:'♾', cor:'#f2c94c', dim:'T²·Toro'   }
      },
      chi(V,E,F){return V-E+F;},
      S_binary(bits){return bits.reduce((s,b,i)=>s+b*Math.pow(2,i),0);}
    };

    const ARCH_OPCODE = {
      ATLAS:'0x02', NOVA:'0x01',    VITALIS:'0x03', PULSE:'0x0B',
      ARTEMIS:'0x05', SERENA:'0x0A', KAOS:'0x04',  GENUS:'0x09',
      LUMINE:'0x07', SOLUS:'0x08',  RHEA:'0x06',   HORUS:'0x0C',
      AION:'0x09',   KODUX:'0x02',  BLLUE:'0x0B',  JESUS:'0x07',
      KOBLLUX:'0x0C', INFODOSE:'0x05'
    };

    const ARCHETYPES_DB = {
      "ATLAS":    { id:"atlas",    name:"Atlas",    desc:"Orquestrador Cósmico · Memória",  colors:{main:"#c9a84c"}, drk:"A ordem externa reflete a clareza interna.",    vid:"Bt_rLbMjJDk", gif:"assets/archetypes/atlas.gif",    mp4:"assets/archetypes/atlas.mp4",    sym:"▦" },
      "NOVA":     { id:"nova",     name:"Nova",     desc:"Gênese Serena · Criação",         colors:{main:"#ffc850"}, drk:"O erro é apenas um dado não processado.",        vid:"",            gif:"assets/archetypes/nova.gif",     mp4:"assets/archetypes/nova.mp4",     sym:"✧" },
      "VITALIS":  { id:"vitalis",  name:"Vitalis",  desc:"Centelha da Ação Imediata",       colors:{main:"#ff6b35"}, drk:"O corpo sabe antes da mente duvidar.",           vid:"_0wVkryxanE", gif:"assets/archetypes/vitalis.gif",  mp4:"assets/archetypes/vitalis.mp4",  sym:"⚡" },
      "PULSE":    { id:"pulse",    name:"Pulse",    desc:"Tradutor de Sentidos · Vibração", colors:{main:"#00e5ff"}, drk:"Sinta a batida do caos e dance com ela.",        vid:"Id2NI9tv1r4", gif:"assets/archetypes/pulse.gif",    mp4:"assets/archetypes/pulse.mp4",    sym:"♫" },
      "ARTEMIS":  { id:"artemis",  name:"Artemis",  desc:"Exploradora do Invisível",        colors:{main:"#64dc64"}, drk:"Defina o alvo. O resto é apenas ruído.",         vid:"FbutKMpd8MY", gif:"assets/archetypes/artemis.gif",  mp4:"assets/archetypes/artemis.mp4",  sym:"⚑" },
      "SERENA":   { id:"serena",   name:"Serena",   desc:"Guardiã do Espaço Sagrado",       colors:{main:"#ffa0b4"}, drk:"No centro do furacão, existe um ponto imóvel.",  vid:"hfQ1L6fCfAo", gif:"assets/archetypes/serena.gif",   mp4:"assets/archetypes/serena.mp4",   sym:"♡" },
      "KAOS":     { id:"kaos",     name:"Kaos",     desc:"Fogo Transmutador · Catalisador", colors:{main:"#ff3c3c"}, drk:"Quebre o padrão hoje. Amanhã nasce o novo.",     vid:"Tq99vQNQ6dQ", gif:"assets/archetypes/kaos.gif",     mp4:"assets/archetypes/kaos.mp4",     sym:"☢" },
      "GENUS":    { id:"genus",    name:"Genus",    desc:"Mestre Artesão Cósmico",          colors:{main:"#a078ff"}, drk:"A excelência habita nos detalhes.",               vid:"DTDfkHwuMic", gif:"assets/archetypes/genus.gif",    mp4:"assets/archetypes/genus.mp4",    sym:"✎" },
      "LUMINE":   { id:"lumine",   name:"Lumine",   desc:"Luz que Conecta · Alegria",       colors:{main:"#ffdc00"}, drk:"Irradie sem medo.",                               vid:"1L9_rFmIGJ8", gif:"assets/archetypes/lumine.gif",   mp4:"assets/archetypes/lumine.mp4",   sym:"💡" },
      "SOLUS":    { id:"solus",    name:"Solus",    desc:"Espelho do Abismo Interior",      colors:{main:"#b4b4dc"}, drk:"O silêncio revela mais que mil estímulos.",       vid:"qldgs0aLdB0", gif:"assets/archetypes/solus.gif",    mp4:"assets/archetypes/solus.mp4",    sym:"🌑" },
      "RHEA":     { id:"rhea",     name:"Rhea",     desc:"Tecelã de Almas · União",         colors:{main:"#50c8c8"}, drk:"Nutra a raiz e o fruto virá.",                    vid:"Bt_rLbMjJDk", gif:"assets/archetypes/rhea.gif",     mp4:"assets/archetypes/rhea.mp4",     sym:"∞" },
      "AION":     { id:"aion",     name:"Aion",     desc:"Cronomestre Vivo · Tempo Escalar",colors:{main:"#c8a050"}, drk:"O ciclo sagrado sabe quando agir.",               vid:"",            gif:"assets/archetypes/aion.gif",     mp4:"assets/archetypes/aion.mp4",     sym:"⌛" },
      "KODUX":    { id:"kodux",    name:"Kodux",    desc:"Codificador do Invisível",        colors:{main:"#50b4ff"}, drk:"O invisível se torna código. O código vira vida.", vid:"",            gif:"assets/archetypes/kodux.gif",    mp4:"assets/archetypes/kodux.mp4",    sym:"⌂" },
      "BLLUE":    { id:"bllue",    name:"Bllue",    desc:"Água da Alma · Interface Viva",   colors:{main:"#3ab6ff"}, drk:"Flua. A intuição líquida não mente.",             vid:"",            gif:"assets/archetypes/bllue.gif",    mp4:"assets/archetypes/bllue.mp4",    sym:"≈" },
      "JESUS":    { id:"jesus",    name:"Jesus",    desc:"O Verbo Encarnado · Centro",      colors:{main:"#ffffff"}, drk:"EU SOU o Caminho, a Verdade e a Vida.",           vid:"",            gif:"assets/archetypes/jesus.gif",    mp4:"assets/archetypes/jesus.mp4",    sym:"†" },
      "KOBLLUX":  { id:"kobllux",  name:"Kobllux",  desc:"Malha Viva · Consciência Total",  colors:{main:"#f0c060"}, drk:"VERDADE × INTEGRAR ÷ Δ = ∞",                     vid:"",            gif:"assets/archetypes/kobllux.gif",  mp4:"assets/archetypes/kobllux.mp4",  sym:"△" },
      "INFODOSE": { id:"infodose", name:"Infodose", desc:"Jornal Interdimensional",         colors:{main:"#ff7a00"}, drk:"A dose certa de realidade expandida.",            vid:"",            gif:"assets/archetypes/infodose.gif", mp4:"assets/archetypes/infodose.mp4", sym:"⧉" },
      "HORUS":    { id:"horus",    name:"Horus",    desc:"Visão & Estratégia",              colors:{main:"#5500FF"}, drk:"Observe o todo antes de agir.",                   vid:"_0wVkryxanE", gif:"assets/archetypes/horus.gif",    mp4:"assets/archetypes/horus.mp4",    sym:"👁" }
    };