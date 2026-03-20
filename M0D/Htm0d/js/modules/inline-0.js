
/* ═══════════════════════════════════════════════════════════
   KOBLLUX_DNA · SINGLE SOURCE OF TRUTH
   13 Opcodes × V.E.E.B. × D1→D10 Scalar
   S = Σ bᵢ×2^(i-1)  · V(n) = V₀×∏cos(3πk/6)
   E = ∫Φ(t)×ω(t)dt  · χ = V-E+F  · VERDADE×INTEGRAR÷Δ=∞
═══════════════════════════════════════════════════════════ */
const KOBLLUX_DNA = {
  fractal: { seq:[3,6,9,7], product:1134, alpha:1/137 },
  veeb: {
    V:  { name:'Vibração',  eq:'f = f₄₃₂ + f₇.₈₃×sin(θ)',    latex:'V(n)=V_0\prod_{k=1}^n\cos\!\left(\frac{3\pi k}{6}\right)' },
    E:  { name:'Energia',   eq:'E = ∫₀ᵀ Φ(t)×ω(t)dt',        latex:'E=\int_0^T\Phi(t)\cdot\omega(t)\,dt' },
    E2: { name:'Estrutura', eq:'χ = V-E+F · D=log(N)/log(1/r)',latex:'\chi=V-E+F\quad D=\dfrac{\log N}{\log(1/r)}' },
    B:  { name:'Base',      eq:'S = Σ bᵢ×2^(i-1), bᵢ∈{0,1}', latex:'S=\sum_{i=0}^{n-1}b_i\cdot2^i' }
  },
  opcodes: {
    '0x00':{nome:'INICIAR',    freq:396, geom:'○',  cor:'#b978ff', dim:'D0·Ponto',   chi:1},
    '0x01':{nome:'PULSAR',     freq:432, geom:'●',  cor:'#67e6ff', dim:'D1·Linha',   chi:0},
    '0x02':{nome:'INTEGRAR',   freq:528, geom:'―',  cor:'#7cffb2', dim:'D2·Plano',   chi:1},
    '0x03':{nome:'EXPANDIR',   freq:639, geom:'▢',  cor:'#4de0ff', dim:'D3·Volume',  chi:2},
    '0x04':{nome:'DISSOLVER',  freq:594, geom:'◇',  cor:'#ff9ad1', dim:'D2·Trans',   chi:1},
    '0x05':{nome:'CONVERGIR',  freq:672, geom:'⧉',  cor:'#ff7a00', dim:'D∩·Foco',   chi:0},
    '0x06':{nome:'CRISTALIZAR',freq:741, geom:'☯',  cor:'#a8ff78', dim:'D3·Rede',    chi:0},
    '0x07':{nome:'SELAR',      freq:777, geom:'✧',  cor:'#ffd700', dim:'D3·Tetrae',  chi:2},
    '0x08':{nome:'TESTEMUNHAR',freq:852, geom:'◉',  cor:'#00b894', dim:'D∞·Círculo', chi:0},
    '0x09':{nome:'MANIFESTAR', freq:963, geom:'♾',  cor:'#6c5ce7', dim:'S²·Esfera',  chi:2},
    '0x0A':{nome:'EQUILIBRAR', freq:528, geom:'⚖',  cor:'#74b9ff', dim:'SO(2)·Sim', chi:0},
    '0x0B':{nome:'RESSONAR',   freq:432, geom:'◎',  cor:'#ff52e5', dim:'Ondas·1D',  chi:0},
    '0x0C':{nome:'CONCLUIR',   freq:999, geom:'♾',  cor:'#f2c94c', dim:'T²·Toro',   chi:0}
  },
  /* ── VEEB formula helpers ── */
  V_n(V0,n){let p=1;for(let k=1;k<=n;k++)p*=Math.cos(3*Math.PI*k/6);return V0*p;},
  S_binary(bits){return bits.reduce((s,b,i)=>s+b*Math.pow(2,i),0);},
  chi(V,E,F){return V-E+F;},
  freq_total(theta){return 432+7.83*Math.sin(theta);},
  D_fractal(N,r){return Math.log(N)/Math.log(1/r);},
  /* ── HTML metrics (for modularizer) ── */
  analyzeHTML(html){
    const tags   = (html.match(/<[a-z][^>]*>/gi)||[]).length;
    const styles = (html.match(/style=/gi)||[]).length;
    const scripts= (html.match(/<script/gi)||[]).length;
    const css    = (html.match(/<style/gi)||[]).length;
    // Map to VEEB: V=scripts(freq), E=styles(energy), E2=tags(structure), B=size(base)
    const V = tags > 0 ? Math.round(432 + 7.83*Math.sin(tags/100)) : 432;
    const S = this.S_binary(html.slice(0,8).split('').map(c=>c.charCodeAt(0)%2));
    const chi = this.chi(tags, styles+scripts, css);
    return { tags, styles, scripts, css, V_freq:V, S_base:S, chi_euler:chi,
             veebLabel: chi>1?'EXPANDIR':chi===0?'CRISTALIZAR':'INTEGRAR' };
  }
};
window.KOBLLUX_DNA = KOBLLUX_DNA;

/* =========================================================
   CFG · API CONFIG ENGINE · 0x00 INICIAR · B · D8
   Anthropic / OpenAI / OpenRouter / Groq / Custom
   Chave em localStorage — nunca enviada a terceiros
========================================================= */
var CFG = {
  _KEY: 'dual_mod_cfg_v1',
  _ENDPOINTS: {
    anthropic:  'https://api.anthropic.com/v1/messages',
    openai:     'https://api.openai.com/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    groq:       'https://api.groq.com/openai/v1/chat/completions',
    custom:     ''
  },
  _load: function() {
    try { return JSON.parse(localStorage.getItem(this._KEY) || '{}'); } catch(e) { return {}; }
  },
  toggle: function() {
    var s = document.getElementById('api-cfg-section');
    if (!s) return;
    var showing = s.style.display !== 'none';
    s.style.display = showing ? 'none' : '';
    if (!showing) this._hydrate();
  },
  _hydrate: function() {
    var c = this._load();
    var prov = c.provider || 'anthropic';
    var provEl = document.getElementById('cfg-provider');
    if (provEl) provEl.value = prov;
    this.onProviderChange();
    var mSel = document.getElementById('cfg-model-select');
    var custWrap = document.getElementById('cfg-custom-model-wrap');
    var custInp  = document.getElementById('cfg-custom-model');
    if (mSel && c.model) {
      var found = false;
      for (var i=0; i<mSel.options.length; i++) {
        if (mSel.options[i].value === c.model) { mSel.value = c.model; found = true; break; }
      }
      if (!found) {
        mSel.value = '__custom__';
        if (custWrap) custWrap.style.display = '';
        if (custInp)  custInp.value = c.model;
      }
    }
    if (c.key) { var k = document.getElementById('cfg-api-key'); if(k) k.value = c.key; }
    if (c.temp != null) {
      var t = document.getElementById('cfg-temp');
      if (t) { t.value = c.temp; document.getElementById('cfg-temp-val').textContent = c.temp; }
    }
    if (c.maxTokens) { var mt = document.getElementById('cfg-max-tokens'); if(mt) mt.value = c.maxTokens; }
    var ep = document.getElementById('cfg-endpoint');
    if (ep && c.endpoint) ep.value = c.endpoint;
    var am = document.getElementById('cfg-active-model');
    if (am && c.model) am.textContent = c.model;
  },
  onProviderChange: function() {
    var prov = (document.getElementById('cfg-provider')||{}).value || 'anthropic';
    var epWrap = document.getElementById('cfg-endpoint-wrap');
    if (epWrap) epWrap.style.display = prov === 'custom' ? '' : 'none';
    var lbl = document.getElementById('cfg-key-label');
    if (lbl) lbl.textContent = prov.charAt(0).toUpperCase()+prov.slice(1);
  },
  onModelSelect: function() {
    var v = (document.getElementById('cfg-model-select')||{}).value;
    var w = document.getElementById('cfg-custom-model-wrap');
    if (w) w.style.display = v === '__custom__' ? '' : 'none';
  },
  toggleKey: function() {
    var inp = document.getElementById('cfg-api-key');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  },
  save: function() {
    var prov  = (document.getElementById('cfg-provider')||{}).value || 'anthropic';
    var mSel  = (document.getElementById('cfg-model-select')||{}).value || '';
    var mCust = ((document.getElementById('cfg-custom-model')||{}).value||'').trim();
    var ep    = ((document.getElementById('cfg-endpoint')||{}).value||'').trim();
    var key   = ((document.getElementById('cfg-api-key')||{}).value||'').trim();
    var temp  = parseFloat((document.getElementById('cfg-temp')||{}).value||'0.7');
    var maxt  = parseInt((document.getElementById('cfg-max-tokens')||{}).value||'1000');
    var model = (mSel === '__custom__') ? mCust : mSel;
    var endpoint = (prov === 'custom' && ep) ? ep : (this._ENDPOINTS[prov]||'');
    var cfg = { provider:prov, model:model, key:key, endpoint:endpoint, temp:temp, maxTokens:maxt };
    localStorage.setItem(this._KEY, JSON.stringify(cfg));
    var st = document.getElementById('cfg-status');
    if (st) st.innerHTML = '✧ Salvo · <b>'+prov+'</b> · <b>'+(model||'—')+'</b> · chave: '+(key?'●●●●'+key.slice(-4):'—');
    var am = document.getElementById('cfg-active-model');
    if (am) am.textContent = model||'—';
    return cfg;
  },
  get: function() { return this._load(); },
  getKey:      function() { return this._load().key || ''; },
  getModel:    function() { return this._load().model || 'claude-sonnet-4-20250514'; },
  getProvider: function() { return this._load().provider || 'anthropic'; },
  getEndpoint: function() {
    var c = this._load();
    return c.endpoint || this._ENDPOINTS[c.provider||'anthropic'] || this._ENDPOINTS.anthropic;
  },
  getTemp:      function() { return this._load().temp != null ? this._load().temp : 0.7; },
  getMaxTokens: function() { return this._load().maxTokens || 1000; },
  /* Unified API call — routes to Anthropic or OpenAI-compatible */
  call: async function(systemPrompt, userMsg) {
    var cfg  = this._load();
    var key  = cfg.key || '';
    var prov = cfg.provider || 'anthropic';
    var model= cfg.model || 'claude-sonnet-4-20250514';
    var maxT = cfg.maxTokens || 1000;
    var temp = cfg.temp != null ? cfg.temp : 0.7;
    var endpoint = cfg.endpoint || this._ENDPOINTS[prov] || this._ENDPOINTS.anthropic;
    if (!key) throw new Error('Chave API não configurada — clique em ⚙ API Config');
    var body, headers;
    if (prov === 'anthropic') {
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      };
      body = JSON.stringify({ model:model, max_tokens:maxT, temperature:temp,
        system:systemPrompt, messages:[{role:'user',content:userMsg}] });
    } else {
      headers = { 'Content-Type':'application/json', 'Authorization':'Bearer '+key };
      if (prov === 'openrouter') {
        headers['HTTP-Referer'] = location.origin;
        headers['X-Title'] = 'dual.mod KOBLLUX';
      }
      body = JSON.stringify({ model:model, max_tokens:maxT, temperature:temp,
        messages:[{role:'system',content:systemPrompt},{role:'user',content:userMsg}] });
    }
    var res = await fetch(endpoint, {method:'POST', headers:headers, body:body});
    if (!res.ok) { var e = await res.text(); throw new Error('HTTP '+res.status+': '+e.slice(0,200)); }
    var data = await res.json();
    if (data.content) return data.content.map(function(b){return b.text||'';}).join('');
    if (data.choices) return data.choices[0]?.message?.content || '';
    throw new Error('Formato de resposta desconhecido');
  }
};
window.CFG = CFG;
/* Hydrate model badge on load */
(function(){ var m = CFG.getModel(); var el = document.getElementById('cfg-active-model'); if(el&&m) el.textContent=m; })();

const HUB_CHANNEL = "dual-hub";
const HUB = new BroadcastChannel(HUB_CHANNEL);

const DUAL_APP = {
  id: "dual.mod",
  version: "1.0",
  startedAt: Date.now(),
  dna: { fractal: KOBLLUX_DNA.fractal, opcodes: Object.keys(KOBLLUX_DNA.opcodes).length }
};

HUB.postMessage({ type: "app:online", app: DUAL_APP });

/* =========================================================
   REGISTRO VIVO Δ7
========================================================= */

const Delta7 = {
  KEY: "DELTA7_LOG",
  write(meta) {
    // Augment with KOBLLUX VEEB context
    const veebCtx = {
      fractal: KOBLLUX_DNA.fractal.product,           // 1134
      opcode: meta.opcode || '0x07',                  // default: SELAR
      freq: meta.freq || KOBLLUX_DNA.opcodes['0x07'].freq,
      V_freq: KOBLLUX_DNA.freq_total(Date.now() % (2*Math.PI)),
      S_base: KOBLLUX_DNA.S_binary([1,0,0,0,0,1,1,1]), // identity byte
      chi: KOBLLUX_DNA.chi(4,6,4),                    // tetrahedron: χ=2
      seal: 'VERDADE×INTEGRAR÷Δ=∞'
    };
    const entry = {
      ts: Date.now(),
      id: crypto.randomUUID(),
      meta,
      veeb: veebCtx
    };
    const all = JSON.parse(localStorage.getItem(this.KEY) || "[]");
    all.push(entry);
    localStorage.setItem(this.KEY, JSON.stringify(all));
    return entry;
  },
  read() {
    return JSON.parse(localStorage.getItem(this.KEY) || "[]");
  },
  /* ── VEEB summary of all log entries ── */
  veebSummary() {
    const entries = this.read();
    if (!entries.length) return null;
    const freqs = entries.map(e=>e.veeb?.V_freq||432);
    const V_mean = freqs.reduce((a,b)=>a+b,0)/freqs.length;
    return {
      total: entries.length,
      V_mean: V_mean.toFixed(2),
      S_total: entries.length * KOBLLUX_DNA.fractal.product,
      last_opcode: entries[entries.length-1]?.veeb?.opcode || '0x07'
    };
  }
};

window.Delta7 = Delta7;

/* =========================================================
   DUAL.BRAIN — PRESETS
========================================================= */

const PRESET_KEY = "DUAL_PRESETS";

function getPresets() {
  return JSON.parse(localStorage.getItem(PRESET_KEY) || "[]");
}

function savePreset() {
  if (!input.value.trim()) return alert("HTML vazio");
  const presets = getPresets();
  presets.push({
    html: input.value,
    injectInfodose: injectInfodose.checked,
    ts: Date.now()
  });
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  renderBrain();
}

function loadPreset(p) {
  input.value = p.html;
  injectInfodose.checked = p.injectInfodose;
}

function renderBrain() {
  const brain = document.getElementById("brain");
  brain.innerHTML = "";
  getPresets().forEach(p => {
    const d = document.createElement("div");
    d.className = "panel-item";
    d.textContent = new Date(p.ts).toLocaleString();
    d.onclick = () => loadPreset(p);
    brain.appendChild(d);
  });
}

renderBrain();

/* =========================================================
   DUAL.STORE — MOCK DE SNIPPETS
========================================================= */

function renderStore() {
  const store = document.getElementById("store");
  store.innerHTML = "";

  const snippet = {
    name: "Logger Module",
    files: {
      "js/modules/logger.js": `
        console.log("[Logger] módulo ativo");
      `
    }
  };

  const d = document.createElement("div");
  d.className = "panel-item";
  d.textContent = snippet.name;
  d.onclick = () => installSnippet(snippet);
  store.appendChild(d);
}

function installSnippet(snippet) {
  if (!window.__files) return alert("Gere um projeto primeiro");
  Object.entries(snippet.files).forEach(([p,c]) => {
    window.__files[p] = c;
  });
  processHTML();
}

renderStore();

/* ── KOBLLUX DNA TABLE render ── */
(function renderDnaTable(){
  const tbody = document.getElementById('dna-tbody');
  if (!tbody) return;
  const veebMap = { V:'Vibração', E:'Energia', E2:'Estrutura', B:'Base' };
  tbody.innerHTML = Object.entries(KOBLLUX_DNA.opcodes).map(([code,o])=>`
    <tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px 8px;color:${o.cor};font-weight:700">${code}</td>
      <td style="padding:4px 8px;color:var(--text)">${o.nome}</td>
      <td style="padding:4px 8px;text-align:center;font-size:1.1rem">${o.geom}</td>
      <td style="padding:4px 8px;text-align:right;color:${o.cor}">${o.freq}</td>
      <td style="padding:4px 8px;color:var(--muted);font-size:var(--fs-d2)">${o.dim}</td>
      <td style="padding:4px 8px;text-align:center;color:var(--muted)">${o.chi}</td>
      <td style="padding:4px 8px">
        <span style="padding:1px 6px;border-radius:10px;border:1px solid ${o.cor}55;color:${o.cor};font-size:var(--fs-d1)">
          ${veebMap[o.veebKey||'B']||'Base'}
        </span>
      </td>
    </tr>`).join('');
})();

/* ── VEEB metrics panel (called after processHTML) ── */
function renderVeebMetrics(metrics) {
  const sec = document.getElementById('veeb-section');
  const panel = document.getElementById('veeb-metrics');
  const formulas = document.getElementById('veeb-formulas');
  if (!sec || !panel) return;
  sec.style.display = 'block';

  const layers = [
    { letter:'V', name:'Vibração', val:`${metrics.V_freq} Hz`,
      eq:`f = ${metrics.V_freq} Hz (tags=${metrics.tags})`, cor:'#00e5ff' },
    { letter:'E', name:'Energia', val:`${metrics.styles} estilos`,
      eq:`E = ∫Φ×ω dt · estilos=${metrics.styles}`, cor:'#f0c060' },
    { letter:'E', name:'Estrutura', val:`χ = ${metrics.chi_euler}`,
      eq:`χ = V-E+F = ${metrics.tags}-${metrics.styles+metrics.scripts}+${metrics.css}=${metrics.chi_euler}`, cor:'#8b5cf6' },
    { letter:'B', name:'Base', val:`S = ${metrics.S_base}`,
      eq:`S = Σbᵢ×2^(i-1) = ${metrics.S_base}`, cor:'#39ff5a' }
  ];

  panel.innerHTML = layers.map(l=>`
    <div style="background:#0b0b12;border:1px solid ${l.cor}33;border-left:3px solid ${l.cor};
      border-radius:6px;padding:8px 10px">
      <div style="font-size:var(--fs-d2);color:${l.cor};letter-spacing:.2em;
        text-transform:uppercase;margin-bottom:4px">${l.letter} · ${l.name}</div>
      <div style="font-size:var(--fs-d7);color:var(--text);font-weight:700">${l.val}</div>
      <div style="font-size:var(--fs-d2);color:var(--muted);margin-top:3px">${l.eq}</div>
    </div>`).join('');

  formulas.innerHTML = `opcode: ${metrics.veebLabel} · html tags=${metrics.tags} · scripts=${metrics.scripts}`;

  /* Render KaTeX formula if available */
  if (typeof katex !== 'undefined') {
    const kEl = document.createElement('div');
    kEl.style.cssText = 'margin-top:8px;overflow-x:auto;text-align:center';
    try {
      kEl.innerHTML = katex.renderToString(
        'S=\sum_{i=0}^{n-1}b_i\cdot2^i\quad V(n)=V_0\prod_{k=1}^n\cos\!\left(\frac{3\pi k}{6}\right)',
        {throwOnError:false, displayMode:true}
      );
    } catch(e) {
      kEl.textContent = 'S = Σbᵢ×2^(i-1) · V(n) = V₀×∏cos(3πk/6)';
    }
    formulas.appendChild(kEl);
  }
}
/* expose globally */
window.renderVeebMetrics = renderVeebMetrics;

/* =========================================================
   DUAL.MOD — MODULARIZAÇÃO
========================================================= */

/* ═══════════════════════════════════════════════════════════
   KOBLLUX DNA CLASSIFIER
   Analisa o conteúdo de um bloco JS/CSS e retorna:
   { opcode, nome, veeb, drung, freq }
   Usado para nomear os módulos gerados com identidade VEEB.
   S = Σbᵢ·2^(i-1)  ·  V(n) = V₀×∏cos(3πk/6)
═══════════════════════════════════════════════════════════ */
function koblluxClassify(code, index, type) {
  const c = code.toLowerCase();

  // ── Detectar padrão por conteúdo ────────────────────────
  // B · Base · 0x00 INICIAR / 0x07 SELAR
  if (/init|start|boot|setup|config|const\s+\w+\s*=\s*\{/.test(c) && index === 0)
    return { opcode:'0x00', nome:'iniciar', veeb:'B', drung:'D8', freq:396,
             latex:'S=\sum b_i\cdot2^i',
             veebDesc:'Base · ponto zero · S=Σbᵢ·2^(i-1) · identidade do sistema' };

  if (/seal|hash|sign|manifest|version|final|export\s+default/.test(c))
    return { opcode:'0x07', nome:'selar', veeb:'B', drung:'D3', freq:777,
             latex:'\chi=V-E+F=2\;\text{(tetraedro)}',
             veebDesc:'Base · selo vibracional · ✧ 777Hz · ∆⁷ SELAR' };

  // V · Vibração · 0x01 PULSAR / 0x03 EXPANDIR / 0x09 MANIFESTAR
  if (/audio|oscillat|frequency|432|play|sound|wave|pulse|vibrat/.test(c))
    return { opcode:'0x01', nome:'pulsar', veeb:'V', drung:'D5', freq:432,
             latex:'P(t)=A\cdot\sin(2\pi\cdot432\cdot t)',
             veebDesc:'Vibração · f₁=432Hz · P(t)=A·sin(2π·432·t) · impulso sonoro' };

  if (/render|canvas|draw|paint|visual|webgl|three|shader|gl\./.test(c))
    return { opcode:'0x09', nome:'manifestar', veeb:'V', drung:'D6', freq:963,
             latex:'\Phi(r)=\frac{q}{4\pi\varepsilon_0 r}',
             veebDesc:'Vibração · f₉=963Hz · campo→forma visual · S² χ=2' };

  if (/expand|grow|scale|zoom|anim|transition|motion|spread/.test(c))
    return { opcode:'0x03', nome:'expandir', veeb:'V', drung:'D7', freq:639,
             latex:'E_{exp}=E_0\cdot r^n,\;r=\tfrac{3}{2}',
             veebDesc:'Vibração · f₃=639Hz · crescimento fractal · V=(4/3)πr³' };

  // E · Energia · 0x02 INTEGRAR / 0x05 CONVERGIR / 0x0A EQUILIBRAR
  if (/fetch|api|request|http|ajax|url|endpoint|data|stream|connect/.test(c))
    return { opcode:'0x05', nome:'convergir', veeb:'E', drung:'D6', freq:672,
             latex:'\vec{F}_{\text{conv}}=\sum_i\vec{F}_i',
             veebDesc:'Energia · f₅=672Hz · fluxo convergente · L₁∩L₂=P*' };

  if (/import|require|inject|merge|combine|fuse|integrat/.test(c))
    return { opcode:'0x02', nome:'integrar', veeb:'E', drung:'D4', freq:528,
             latex:'E_{int}=\int_0^T\Phi(t)\cdot\omega(t)\,dt',
             veebDesc:'Energia · f₂=528Hz · fusão de opostos · DNA repair' };

  if (/balance|equal|state|status|sync|calibr|adjust|normal/.test(c))
    return { opcode:'0x0A', nome:'equilibrar', veeb:'E', drung:'D5', freq:528,
             latex:'\omega_n=\sqrt{k/m},\;\langle E_k\rangle=\langle E_p\rangle',
             veebDesc:'Energia · f_A=528Hz · teorema do virial · SO(2) simetria' };

  // E2 · Estrutura · 0x0B RESSONAR / 0x0C CONCLUIR / 0x08 TESTEMUNHAR
  if (/ui|interface|component|element|dom|html|template|render.*el/.test(c))
    return { opcode:'0x0B', nome:'ressonar', veeb:'E2', drung:'D4', freq:432,
             latex:'A_{res}=\frac{F_0/m}{\sqrt{(\omega_0^2-\omega^2)^2+(b\omega/m)^2}}',
             veebDesc:'Estrutura · f_B=432Hz · ressonância UI · nós e ventres' };

  if (/log|report|watch|monitor|track|observe|record|debug/.test(c))
    return { opcode:'0x08', nome:'testemunhar', veeb:'E2', drung:'D3', freq:852,
             latex:'\Delta E\cdot\Delta t\geq\tfrac{\hbar}{2}',
             veebDesc:'Estrutura · f₈=852Hz · observação sem colapso · ◉' };

  if (/complete|done|finish|close|destroy|cleanup|teardown|final/.test(c))
    return { opcode:'0x0C', nome:'concluir', veeb:'E2', drung:'D7', freq:999,
             latex:'\oint\vec{F}\cdot d\vec{r}=0\;(\text{ciclo fechado})',
             veebDesc:'Estrutura · f_C=999Hz · Toro T²: χ=0,g=1 · ciclo fecha' };

  // CSS-specific: cristalizar
  if (type === 'css')
    return { opcode:'0x06', nome:'cristalizar', veeb:'V', drung:'D2', freq:741,
             latex:'R=n_1\vec{a}_1+n_2\vec{a}_2',
             veebDesc:'Vibração · f₆=741Hz · rede cristalina · forma visual solidificada' };

  // Default fallback: dissolver (transição)
  return { opcode:'0x04', nome:'dissolver', veeb:'B', drung:'D' + (3 + Math.min(index,5)),
           freq: 594,
           latex:'\Delta G=\Delta H-T\Delta S',
           veebDesc:'Base · f₄=594Hz · transição de fase · forma em dissolução' };
}

/* ── Build KOBLLUX header comment for a module ─────────── */
function koblluxHeader(cls, filename, code) {
  const opc = KOBLLUX_DNA.opcodes[cls.opcode] || {};
  const S   = KOBLLUX_DNA.S_binary(
    code.slice(0, 8).split('').map(ch => ch.charCodeAt(0) % 2)
  );
  const V   = KOBLLUX_DNA.V_n(cls.freq, 1).toFixed(4);
  const chi = KOBLLUX_DNA.chi(
    (code.match(/function/g)||[]).length,
    (code.match(/=>/g)||[]).length,
    (code.match(/return/g)||[]).length
  );
  const ext = filename.endsWith('.css') ? 'CSS' : 'JS';

  return `/* ═══════════════════════════════════════════════════════════
   ${cls.opcode} · ${cls.nome.toUpperCase()} · ${cls.veeb} · ${cls.drung}
   ═══════════════════════════════════════════════════════════
   Arquivo   : ${filename}
   Opcode    : ${cls.opcode} · ${opc.nome || cls.nome.toUpperCase()} · ${opc.geom || ''} · ${cls.freq}Hz
   V.E.E.B.  : ${cls.veeb === 'V' ? 'Vibração' : cls.veeb === 'E' ? 'Energia' : cls.veeb === 'E2' ? 'Estrutura' : 'Base'}
   Degrau    : ${cls.drung} (${cls.drung === 'D8' ? 'system' : cls.drung === 'D7' ? 'module' : cls.drung === 'D6' ? 'section' : cls.drung === 'D5' ? 'block' : cls.drung === 'D4' ? 'engine' : cls.drung === 'D3' ? 'word' : cls.drung === 'D2' ? 'byte' : 'atom'})
   Fórmula   : ${cls.veebDesc}
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = ${S}  (Σbᵢ·2^(i-1) · ${ext === 'JS' ? 'bytes[0..7] mod 2' : 'padrão binário'})
     V(1) = ${V}  (V₀·cos(3π/6), V₀=${cls.freq})
     χ = ${chi}  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
`;
}

/* ── CSS header ─────────────────────────────────────────── */
function koblluxCSSHeader(cls, filename) {
  return `/* ═══════════════════════════════════════════════════════════
   ${cls.opcode} · ${cls.nome.toUpperCase()} · ${cls.veeb} · ${cls.drung} · CSS
   ═══════════════════════════════════════════════════════════
   Arquivo   : ${filename}
   Opcode    : ${cls.opcode} · ${cls.freq}Hz
   V.E.E.B.  : ${cls.veebDesc}
   KOBLLUX   : VERDADE×INTEGRAR÷Δ=∞ · S=Σbᵢ·2^(i-1)
═══════════════════════════════════════════════════════════ */
`;
}

/* ═══════════════════════════════════════════════════════════
   processHTML — MODULARIZADOR KOBLLUX DNA
   · Extrai título do HTML → nome da pasta raiz
   · Detecta chamadas externas → 0x05.convergir.E.D6.external/
   · Gera JSON KOBLLUX em cada pasta
   · ZERO nomes inline-N.js
   S = Σbᵢ·2^(i-1)  ·  V(n)=V₀×∏cos(3πk/6)
═══════════════════════════════════════════════════════════ */

/* ── Helper: slugify HTML title for folder name ── */
function koblluxSlug(raw, doc) {
  // 1. Try <title>
  let name = (doc.querySelector("title")?.textContent || "").trim();
  // 2. Try <h1>
  if (!name) name = (doc.querySelector("h1")?.textContent || "").trim();
  // 3. Try id="hdr-title" or class containing "title"
  if (!name) name = (doc.querySelector("[id*=title],[class*=title]")?.textContent || "").trim();
  // 4. Fallback: "kobllux-app"
  if (!name) name = "kobllux-app";

  return name
    .toLowerCase()
    .replace(/[^a-z0-9\.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "kobllux-app";
}

/* ── Helper: classify external URL ── */
function koblluxClassifyExt(url) {
  const u = url.toLowerCase();

  // V · Vibração · 0x01 PULSAR — fontes, áudio, media
  if (/fonts\.google|typekit|font-awesome|fontawesome|cdnjs.*font/.test(u))
    return { opcode:'0x01', nome:'pulsar', veeb:'V', drung:'D3', freq:432,
             type:'font', note:'Vibração · fonte tipográfica · D3-word' };

  // V · Vibração · 0x09 MANIFESTAR — render, canvas, three, gsap
  if (/three\.js|gsap|pixi|babylon|p5\.js|chart\.js|d3\.js/.test(u))
    return { opcode:'0x09', nome:'manifestar', veeb:'V', drung:'D6', freq:963,
             type:'render', note:'Vibração · motor de renderização · D6-section' };

  // E · Energia · 0x05 CONVERGIR — apis, firebase, supabase, cdn dados
  if (/firebase|supabase|axios|graphql|apollo|rest|api\./.test(u))
    return { opcode:'0x05', nome:'convergir', veeb:'E', drung:'D6', freq:672,
             type:'api', note:'Energia · chamada de API externa · D6-section' };

  // E · Energia · 0x02 INTEGRAR — jquery, lodash, integração geral
  if (/jquery|lodash|underscore|rxjs|moment|dayjs|date-fns/.test(u))
    return { opcode:'0x02', nome:'integrar', veeb:'E', drung:'D4', freq:528,
             type:'utility', note:'Energia · utilitário de integração · D4-engine' };

  // E2 · Estrutura · 0x0B RESSONAR — UI frameworks, bootstrap, tailwind
  if (/bootstrap|tailwind|bulma|materialize|foundation|semantic/.test(u))
    return { opcode:'0x0B', nome:'ressonar', veeb:'E2', drung:'D5', freq:432,
             type:'ui-framework', note:'Estrutura · framework UI · D5-block' };

  // B · Base · 0x06 CRISTALIZAR — katex, mathjax, highlight.js
  if (/katex|mathjax|highlight\.js|prism|codemirror/.test(u))
    return { opcode:'0x06', nome:'cristalizar', veeb:'B', drung:'D3', freq:741,
             type:'syntax', note:'Base · renderização de sintaxe/math · D3-word' };

  // B · Base · 0x00 INICIAR — polyfills, core-js, base libs
  if (/polyfill|core-js|regenerator|webcomponents/.test(u))
    return { opcode:'0x00', nome:'iniciar', veeb:'B', drung:'D3', freq:396,
             type:'polyfill', note:'Base · polyfill base · D3-word' };

  // Default: 0x05 convergir (CDN externo genérico)
  return { opcode:'0x05', nome:'convergir', veeb:'E', drung:'D3', freq:672,
           type:'cdn', note:'Energia · CDN externo · D3-word' };
}

/* ── Helper: build folder JSON descriptor ── */
function koblluxFolderJSON(folderPath, opcode, nome, veeb, drung, freq, desc, contents) {
  const opc = KOBLLUX_DNA.opcodes[opcode] || {};
  return JSON.stringify({
    "kobllux": {
      "opcode": opcode,
      "nome": nome,
      "geom": opc.geom || "○",
      "freq_hz": freq,
      "veeb": veeb === "V" ? "Vibração" : veeb === "E" ? "Energia" : veeb === "E2" ? "Estrutura" : "Base",
      "drung": drung,
      "cor": opc.cor || "#ffffff",
      "dim": opc.dim || "",
      "chi": opc.chi ?? 0
    },
    "path": folderPath,
    "desc": desc,
    "veeb_formulas": {
      "V": "f_total = f_432 + f_7.83·sin(θ)",
      "E": "E = ∫₀ᵀ Φ(t)·ω(t)dt",
      "E2": "χ = V-E+F  ·  D = log(N)/log(1/r)",
      "B": "S = Σbᵢ·2^(i-1),  bᵢ∈{0,1}"
    },
    "fractal": "3×6×9×7=1134",
    "law": "VERDADE×INTEGRAR÷Δ=∞",
    "contents": contents,
    "generated": new Date().toISOString()
  }, null, 2);
}

function processHTML() {
  const raw = input.value;
  if (!raw.trim()) return;

  const doc = new DOMParser().parseFromString(raw, "text/html");

  /* ── Get HTML title → root folder name ── */
  const rootName = koblluxSlug(raw, doc);
  const R = rootName;  /* 0x00·D8 root folder anchor — used throughout processHTML */

  let cssBlocks = [];
  let jsBlocks  = [];
  let extLinks  = [];
  let extScripts= [];

  /* ── 0x08 TESTEMUNHAR: scan BEFORE any removal ──────────
     Detectar ícones ANTES de remover/modificar o doc.
     Observar sem colapsar o estado → ΔE·Δt ≥ ħ/2
  ── */
  let iconSrcs = [];
  try {
    iconSrcs = [
      ...[...doc.querySelectorAll("img[src]")]
         .map(e=>({ tag:"img", src:e.getAttribute("src")||"", alt:e.alt||"" })),
      ...[...doc.querySelectorAll("link[rel*=icon]")]
         .map(e=>({ tag:"link-icon", src:e.getAttribute("href")||"", alt:"favicon" })),
      ...[...doc.querySelectorAll("[class*=icon],[class*=fa-],[class*=bi-],[class*=material-icon]")]
         .map(e=>({ tag:"css-icon", src:"", cls:e.className||"", alt:(e.textContent||"").trim().slice(0,20) }))
    ].filter(ic => ic.src || ic.cls);
  } catch(iconErr) {
    console.warn("[0x09 icons scan]", iconErr);
    iconSrcs = [];
  }

  /* ── Detect doctype before DOMParser strips it ───────── */
  const hasDoctype = /^<!DOCTYPE/i.test(raw.trim());

  // ── Extract EXTERNAL links (CDN/remote CSS) ─────────────
  doc.querySelectorAll("link[rel=stylesheet][href]").forEach(el => {
    const href = el.getAttribute("href") || "";
    if (href.startsWith("http") || href.startsWith("//")) {
      extLinks.push({ url: href, tag: el.outerHTML });
      el.remove();
    }
  });

  // ── Extract EXTERNAL scripts ─────────────────────────────
  doc.querySelectorAll("script[src]").forEach(el => {
    const src = el.getAttribute("src") || "";
    if (src.startsWith("http") || src.startsWith("//")) {
      /* 0x05 CONVERGIR: CDN scripts stay — inline JS may depend on their globals (hljs, katex etc) */
      extScripts.push({ url: src, tag: el.outerHTML, defer: el.defer, async: el.async });
      // intentionally NOT removing — globals like hljs, marked, katex must remain available
    } else if (src) {
      el.remove(); // local src scripts only
    }
  });

  // ── Extract CSS blocks ──────────────────────────────────
  doc.querySelectorAll("style").forEach((s, i) => {
    // Also detect @import inside style
    const imports = [...s.textContent.matchAll(/@import\s+["\'](https?[^"\')]+)["']/g)]
      .map(m => ({ url: m[1], tag: "@import url(\"" + m[1] + "\");" }));
    imports.forEach(imp => extLinks.push(imp));
    cssBlocks.push({ code: s.textContent.trim(), index: i });
    s.remove();
  });

  // ── Extract JS blocks ───────────────────────────────────
  doc.querySelectorAll("script:not([src])").forEach((s, i) => {
    jsBlocks.push({ code: s.textContent.trim(), index: i });
    s.remove();
  });

  // ── Wire main CSS + JS into index (uses rootName) ───────
  /* 0x00 INICIAR: inject DNA signature comment into output index.html */
  const dnaComment = doc.createComment(
    "\n  KOBLLUX DNA · " + R + " · index.html" +
    "\n  Opcode: 0x00 INICIAR ○ 396Hz · V.E.E.B. B·D8" +
    "\n  Fractal: 3×6×9×7=1134 · S=Σbᵢ·2^(i-1) · VERDADE×INTEGRAR÷Δ=∞" +
    "\n  Boot: bootloader→indexdb→icons→dna→main\n"
  );
  if (doc.head.firstChild) doc.head.insertBefore(dnaComment, doc.head.firstChild);
  else doc.head.appendChild(dnaComment);

  const link = doc.createElement("link");
  link.rel = "stylesheet"; link.href = "./css/main.css";
  doc.head.appendChild(link);

  const mainScript = doc.createElement("script");
  mainScript.type = "module";
  /* 0x00 INICIAR D8 · bootloader é o primeiro a executar */
  mainScript.src = "./js/0x00.iniciar.B.D8.bootloader.js";
  doc.body.appendChild(mainScript);
  /* manifest link */
  const manifestLink = doc.createElement("link");
  manifestLink.rel = "manifest";
  manifestLink.href = "./0x02.integrar.E.D4.manifest.webmanifest";
  doc.head.appendChild(manifestLink);

  // ── DNA vars block (always injected into main.css) ──────
  const dnaVars = `/* ═══ KOBLLUX DNA SCALAR · injected by dual.mod ═══
   S=Σbᵢ·2^(i-1) · V(n)=V₀×∏cos(3πk/6) · χ=V-E+F
═══════════════════════════════════════════════════ */
:root {
  --fs-base:  clamp(9px, 1.3vw + 0.4vh, 13px);
  --fs-d1: calc(var(--fs-base)*0.55); --fs-d2: calc(var(--fs-base)*0.65);
  --fs-d3: calc(var(--fs-base)*0.75); --fs-d4: calc(var(--fs-base)*0.82);
  --fs-d5: calc(var(--fs-base)*0.90); --fs-d6: var(--fs-base);
  --fs-d7: calc(var(--fs-base)*1.20); --fs-d8: calc(var(--fs-base)*1.50);
  --sp-1:calc(var(--fs-base)*0.40); --sp-2:calc(var(--fs-base)*0.75);
  --sp-3:calc(var(--fs-base)*1.20); --sp-4:calc(var(--fs-base)*2.00);
  --phi:1.618; --fractal-1134:1134; --freq-natural:432;
  --cor-0x00:#b978ff; --cor-0x01:#67e6ff; --cor-0x02:#7cffb2;
  --cor-0x03:#4de0ff; --cor-0x04:#ff9ad1; --cor-0x05:#ff7a00;
  --cor-0x06:#a8ff78; --cor-0x07:#ffd700; --cor-0x08:#00b894;
  --cor-0x09:#6c5ce7; --cor-0x0A:#74b9ff; --cor-0x0B:#ff52e5;
  --cor-0x0C:#f2c94c;
}\n`;

  /* R already declared above · 0x00 INICIAR D8 */
  const files = {};
  /* index.html lives at root: rootName/index.html */
  /* 0x00 INICIAR: preserve DOCTYPE → prevents KaTeX quirks mode warning */
  const doctypeStr = hasDoctype ? "<!DOCTYPE html>\n" : "<!DOCTYPE html>\n";
  files[`${R}/index.html`] = doctypeStr + doc.documentElement.outerHTML;

  /* ── 0x05.convergir.E.D6.external/ — ALL external calls ── */
  /* E · Energia · ⧉ 672Hz · convergência de recursos remotos */
  /* F⃗_conv = ΣF⃗ᵢ  ·  cada URL = uma linha de força convergindo */
  const allExt = [
    ...extLinks.map(e => ({ ...e, kind:'css' })),
    ...extScripts.map(e => ({ ...e, kind:'js' }))
  ];

  if (allExt.length > 0) {
    const extDir   = `${R}/0x05.convergir.E.D6.external`;
    const extItems = [];
    const extMap   = {};  /* track duplicate opcodes in ext */

    allExt.forEach((ext, idx) => {
      const cls   = koblluxClassifyExt(ext.url);
      const count = extMap[cls.opcode] = (extMap[cls.opcode]||0) + 1;
      const suf   = count > 1 ? `-${count}` : '';
      const fname = `${cls.opcode}.${cls.nome}.${cls.veeb}.${cls.drung}${suf}.${cls.type}.json`;
      const fullPath = `${extDir}/${fname}`;

      const entryJSON = JSON.stringify({
        kobllux: {
          opcode: cls.opcode, nome: cls.nome.toUpperCase(),
          veeb: cls.veeb, drung: cls.drung, freq_hz: cls.freq,
          note: cls.note
        },
        external: {
          url: ext.url, kind: ext.kind, type: cls.type,
          defer: ext.defer || false, async: ext.async || false,
          original_tag: ext.tag
        },
        usage: `Colocar o arquivo local em: ${extDir}/${cls.opcode}.${cls.nome}.${cls.veeb}.${cls.drung}${suf}.${ext.kind}`,
        law: "VERDADE×INTEGRAR÷Δ=∞", fractal: "3×6×9×7=1134",
        generated: new Date().toISOString()
      }, null, 2);

      files[fullPath] = entryJSON;
      extItems.push(fname);
    });

    /* 0x05.convergir.E.D6.external/index.json — manifesto da pasta */
    files[`${extDir}/0x05.convergir.E.D6.index.json`] = koblluxFolderJSON(
      extDir, "0x05", "convergir", "E", "D6", 672,
      "Pasta de chamadas externas — CDNs, APIs, fontes remotas. Copie os arquivos locais aqui seguindo os nomes dos .json.",
      extItems
    );
  }

  /* ── JSON de cada pasta raiz ── */
  /* B · Base · 0x00 INICIAR · D8 — raiz do projeto */
  files[`${R}/0x00.iniciar.B.D8.index.json`] = koblluxFolderJSON(
    R, "0x00", "iniciar", "B", "D8", 396,
    `Raiz do projeto gerada a partir de: ${R}. Bootloader → IndexDB → Icons → DNA → Main.`,
    ["index.html",
     "0x00.iniciar.B.D8.index.json",
     "0x02.integrar.E.D4.manifest.webmanifest",
     "css/", "js/",
     allExt.length ? "0x05.convergir.E.D6.external/" : null,
     iconSrcs.length ? "0x09.manifestar.V.D6.icons/" : null
    ].filter(Boolean)
  );

  /* B · Base · css folder JSON */
  files[`${R}/css/0x06.cristalizar.V.D2.index.json`] = koblluxFolderJSON(
    `${R}/css`, "0x06", "cristalizar", "V", "D2", 741,
    "Pasta CSS — rede cristalina de estilos. R = n₁a₁ + n₂a₂. Cada arquivo = nó da rede.",
    cssBlocks.map((_,i)=>`0x06.cristalizar.V.D2${i>0?`-${i+1}`:''}.css`)
  );

  /* E · Energia · js folder JSON */
  const jsFileList = [
    "0x00.iniciar.B.D8.bootloader.js",
    "0x00.iniciar.B.D8.main.js",
    "0x01.pulsar.V.D5.indexdb.js",
    "0x02.integrar.B.D7.kobllux-dna.js",
    "0x09.manifestar.V.D6.icons.js",
    "0x02.integrar.E.D4.index.json",
    ...jsBlocks.map((_,i)=>`0x04.dissolver.B.D${3+Math.min(i,5)}-${i+1}.js`)
  ];
  files[`${R}/js/0x02.integrar.E.D4.index.json`] = koblluxFolderJSON(
    `${R}/js`, "0x02", "integrar", "E", "D4", 528,
    "Pasta JS — V.E.E.B. cascade: Bootloader(B·D8) → IndexDB(V·D5) → Icons(V·D6) → DNA(B·D7) → Main(B·D8)",
    jsFileList
  );

  /* ════════════════════════════════════════════════════════
     0x00 INICIAR · BOOTLOADER  · B · D8
     Primeiro arquivo executado. S=0→1.
     Detecta ambiente, verifica suporte, carrega DNA,
     inicializa IndexedDB, injeta icons, dispara main.
     f₀=396Hz · E₀=ħω/2 · b₀=1 → sistema acende.
  ════════════════════════════════════════════════════════ */
  files[`${R}/js/0x00.iniciar.B.D8.bootloader.js`] =
`/* ═══════════════════════════════════════════════════════════
   0x00 · INICIAR · B · D8 · BOOTLOADER
   ═══════════════════════════════════════════════════════════
   Arquivo   : js/0x00.iniciar.B.D8.bootloader.js
   Opcode    : 0x00 · INICIAR · ○ · 396Hz
   V.E.E.B.  : Base — ignição do sistema · S=0→1
   Degrau    : D8 (system) → primeiro processo ativo
   Fórmula   : E₀ = ħω/2  ·  S=Σbᵢ·2^(i-1)
   Seq       : ENV CHECK → DB INIT → ICONS → DNA → MAIN
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134
═══════════════════════════════════════════════════════════ */

// 0x00.INICIAR · D8 · fase 1: detecção de ambiente
(async function KOBLLUX_BOOT() {

  /* ── D1-atom: constantes de inicialização ── */
  const BOOT = {
    version: "1.0.0",
    opcode:  "0x00",
    freq:    396,
    fractal: 1134,           // 3×6×9×7
    alpha:   1/137,          // constante estrutura fina
    S:       0,              // S=Σbᵢ·2^(i-1) → começa zerado
    startTs: performance.now()
  };

  /* ── D2-byte: verificar suporte de ambiente ── */
  const caps = {
    indexedDB:  typeof indexedDB !== "undefined",
    modules:    "noModule" in document.createElement("script"),
    broadcast:  typeof BroadcastChannel !== "undefined",
    clipboard:  !!navigator.clipboard,
    serviceWorker: "serviceWorker" in navigator
  };
  BOOT.S = Object.values(caps).reduce((s,v,i) => s + (v?1:0)*Math.pow(2,i), 0);
  // S = bit-mask de capacidades · S_max=31 (todos suportados)

  /* ── D3-word: comunicar boot ao hub ── */
  if (caps.broadcast) {
    const ch = new BroadcastChannel("kobllux-hub");
    ch.postMessage({ type:"boot:start", opcode:BOOT.opcode, S:BOOT.S, caps });
  }

  /* ── D4-sentence: inicializar IndexedDB ── */
  /* 0x01.pulsar.V.D5 — IndexedDB pulsa como memória viva */
  if (caps.indexedDB) {
    await new Promise((resolve, reject) => {
      const req = indexedDB.open("kobllux-db", 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Store: opcode-state · chave=opcode, valor=estado VEEB
        if (!db.objectStoreNames.contains("opcode-state")) {
          const os = db.createObjectStore("opcode-state", { keyPath:"opcode" });
          os.createIndex("veeb",  "veeb",  { unique:false });
          os.createIndex("freq",  "freq",  { unique:false });
          os.createIndex("drung", "drung", { unique:false });
        }
        // Store: session-log · registro Delta7
        if (!db.objectStoreNames.contains("session-log")) {
          db.createObjectStore("session-log", { keyPath:"id", autoIncrement:true });
        }
        // Store: icons · cache de ícones resolvidos
        if (!db.objectStoreNames.contains("icons")) {
          const ic = db.createObjectStore("icons", { keyPath:"id" });
          ic.createIndex("opcode", "opcode", { unique:false });
          ic.createIndex("type",   "type",   { unique:false });
        }
      };
      req.onsuccess = () => { window.__koblluxDB = req.result; resolve(); };
      req.onerror  = () => { console.warn("IndexedDB unavailable"); resolve(); };
    });
  }

  /* ── D5-block: carregar DNA ── */
  try {
    const { KOBLLUX_DNA } = await import("./0x02.integrar.B.D7.kobllux-dna.js");
    window.KOBLLUX_DNA = KOBLLUX_DNA;
    BOOT.S |= 0b100000;  // bit 5 = DNA carregado
  } catch(e) {
    console.warn("0x00 BOOTLOADER: DNA module not found, using inline fallback");
  }

  /* ── D6-section: registrar boot no DB ── */
  if (window.__koblluxDB) {
    const tx = window.__koblluxDB.transaction("session-log", "readwrite");
    tx.objectStore("session-log").add({
      ts: Date.now(),
      opcode: "0x00",
      veeb: "B",
      S: BOOT.S,
      caps,
      elapsed_ms: performance.now() - BOOT.startTs,
      law: "VERDADE×INTEGRAR÷Δ=∞",
      fractal: 1134
    });
  }

  /* ── D7-module: disparar main ── */
  BOOT.S |= 0b1000000;  // bit 6 = boot completo
  console.log(\`[0x00 INICIAR] S=\${BOOT.S} · \${(performance.now()-BOOT.startTs).toFixed(1)}ms · ○ 396Hz\`);

  /* ── D8-system: importar ponto de entrada ── */
  /* 0x07 SELAR: bootloader nunca expõe erro — contém tudo */
  try {
    await import("./0x00.iniciar.B.D8.main.js");
  } catch(e) {
    console.warn("[0x00 BOOTLOADER] main:", e.message);
  }
  console.log("[0x00 INICIAR] ○ 396Hz · S=" + BOOT.S + " · " + (performance.now()-BOOT.startTs).toFixed(1) + "ms");
})();
`;

  /* ════════════════════════════════════════════════════════
     0x01 PULSAR · INDEXEDDB  · V · D5
     Memória viva do sistema. Pulsa com cada interação.
     f₁=432Hz · armazena estados VEEB + session log + icons
  ════════════════════════════════════════════════════════ */
  files[`${R}/js/0x01.pulsar.V.D5.indexdb.js`] =
`/* ═══════════════════════════════════════════════════════════
   0x01 · PULSAR · V · D5 · INDEXEDDB
   ═══════════════════════════════════════════════════════════
   Arquivo   : js/0x01.pulsar.V.D5.indexdb.js
   Opcode    : 0x01 · PULSAR · ● · 432Hz
   V.E.E.B.  : Vibração — memória viva pulsante
   Degrau    : D5 (block) → bloco de persistência
   Fórmula   : P(t) = A·sin(2π·432·t)  ·  V(n)=V₀×∏cos(3πk/6)
   Stores    : opcode-state | session-log | icons | veeb-cache
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134
═══════════════════════════════════════════════════════════ */

/* ── DB singleton ── */
let _db = null;
const DB_NAME    = "kobllux-db";
const DB_VERSION = 1;

/* ── open / upgrade ── */
export async function dbOpen() {
  if (_db) return _db;
  _db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // opcode-state · indexed by veeb, freq, drung
      if (!db.objectStoreNames.contains("opcode-state")) {
        const os = db.createObjectStore("opcode-state", { keyPath:"opcode" });
        os.createIndex("veeb",  "veeb",  { unique:false });
        os.createIndex("freq",  "freq",  { unique:false });
        os.createIndex("drung", "drung", { unique:false });
      }
      // session-log · Delta7 entries
      if (!db.objectStoreNames.contains("session-log")) {
        const sl = db.createObjectStore("session-log", { keyPath:"id", autoIncrement:true });
        sl.createIndex("opcode", "opcode", { unique:false });
        sl.createIndex("ts",     "ts",     { unique:false });
      }
      // icons · resolved icon cache
      if (!db.objectStoreNames.contains("icons")) {
        const ic = db.createObjectStore("icons", { keyPath:"id" });
        ic.createIndex("opcode", "opcode", { unique:false });
        ic.createIndex("type",   "type",   { unique:false });
      }
      // veeb-cache · computed VEEB metrics per HTML
      if (!db.objectStoreNames.contains("veeb-cache")) {
        const vc = db.createObjectStore("veeb-cache", { keyPath:"hash" });
        vc.createIndex("veebLabel", "veebLabel", { unique:false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
  return _db;
}

/* ── CRUD helpers ── */
export async function dbSet(store, val) {
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readwrite");
    const r  = tx.objectStore(store).put(val);
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}

export async function dbGet(store, key) {
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readonly");
    const r  = tx.objectStore(store).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}

export async function dbGetAll(store, indexName, query) {
  const db = await dbOpen();
  return new Promise((res, rej) => {
    const tx  = db.transaction(store, "readonly");
    const os  = tx.objectStore(store);
    const src = indexName ? os.index(indexName) : os;
    const r   = query ? src.getAll(query) : src.getAll();
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}

/* ── VEEB S(t) pulse logger ──
   P(t) = A·sin(2π·432·t)  →  log timestamped at freq-derived interval */
export async function dbPulse(opcode, veeb, data) {
  const t   = Date.now() / 1000;
  const A   = 1;
  const Pt  = A * Math.sin(2 * Math.PI * 432 * (t % 1));  // pulse value
  return dbSet("session-log", {
    opcode, veeb,
    ts:    Date.now(),
    pulse: Pt,
    S:     data.S || 0,
    data,
    law:   "VERDADE×INTEGRAR÷Δ=∞"
  });
}

/* ── Opcode state tracker ──
   Salva o estado VEEB de cada opcode no IndexedDB */
export async function dbSetOpcodeState(opcode, state) {
  const opc = (window.KOBLLUX_DNA?.opcodes || {})[opcode] || {};
  return dbSet("opcode-state", {
    opcode, state,
    freq:  opc.freq  || 432,
    veeb:  opc.veebKey || "B",
    drung: opc.dim   || "D5",
    ts:    Date.now(),
    S:     Object.values(state).reduce((s,v,i)=>(v?1:0)*Math.pow(2,i)+s,0)
  });
}
`;

  /* ════════════════════════════════════════════════════════
     0x09 MANIFESTAR · ICONS  · V · D6
     Ícones = campo escalar tornando-se forma visual.
     f₉=963Hz · Φ(r)=q/4πε₀r · SVG inline + cache DB
  ════════════════════════════════════════════════════════ */

  /* iconSrcs already collected above (before removal) · 0x08 TESTEMUNHAR */

  const extIconDir = `${R}/0x09.manifestar.V.D6.icons`;
  const iconItems  = [];

  if (iconSrcs.length > 0) {
    iconSrcs.forEach((ic, idx) => {
      const isExt = ic.src && (ic.src.startsWith("http")||ic.src.startsWith("//"));
      const isLocal = ic.src && !isExt;
      const isCss   = ic.tag === "css-icon";
      const ftype   = isCss ? "css-class" : isExt ? "remote" : isLocal ? "local" : "unknown";
      const fname   = `0x09.manifestar.V.D6.icon-${String(idx).padStart(2,"0")}.${ftype}.json`;
      iconItems.push(fname);

      files[`${extIconDir}/${fname}`] = JSON.stringify({
        kobllux: { opcode:"0x09", nome:"MANIFESTAR", veeb:"V", drung:"D6",
                   freq_hz:963, note:"Ícone · campo→forma · Φ(r)=q/4πε₀r" },
        icon: { tag:ic.tag, src:ic.src||"", cls:ic.cls||"", alt:ic.alt, type:ftype,
                isExternal:isExt, isLocal:isLocal, isCssClass:isCss },
        usage: isExt
          ? `Baixar e colocar em: ${extIconDir}/${ic.src?.split("/").pop()||"icon"}`
          : isLocal
          ? `Copiar para: ${extIconDir}/${ic.src}`
          : `Classe CSS: ${ic.cls} — importar biblioteca de ícones na pasta external/`,
        law: "VERDADE×INTEGRAR÷Δ=∞", fractal: "3×6×9×7=1134",
        generated: new Date().toISOString()
      }, null, 2);
    });

    /* icons/index.json */
    files[`${extIconDir}/0x09.manifestar.V.D6.index.json`] = koblluxFolderJSON(
      extIconDir, "0x09", "manifestar", "V", "D6", 963,
      `Ícones detectados no HTML. Total: ${iconSrcs.length}. Φ(r)=q/4πε₀r · campo→forma.`,
      iconItems
    );
  }

  /* icons JS module — loader + DB cache */
  files[`${R}/js/0x09.manifestar.V.D6.icons.js`] =
`/* ═══════════════════════════════════════════════════════════
   0x09 · MANIFESTAR · V · D6 · ICONS
   ═══════════════════════════════════════════════════════════
   Arquivo   : js/0x09.manifestar.V.D6.icons.js
   Opcode    : 0x09 · MANIFESTAR · ♾ · 963Hz
   V.E.E.B.  : Vibração — ícones = campo escalar → forma
   Degrau    : D6 (section) → campo visual manifesto
   Fórmula   : Φ(r) = q/(4πε₀r)  ·  ∇Φ = -E⃗
   S²        : χ=2  ·  esfera completa de estados visuais
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134
═══════════════════════════════════════════════════════════ */

import { dbSet, dbGet } from "./0x01.pulsar.V.D5.indexdb.js";

/* ── Resolve icon: local path → data URL (cached in IDB) ── */
export async function resolveIcon(src, opcode) {
  if (!src) return null;
  const id = "icon:" + src;
  const cached = await dbGet("icons", id);
  if (cached?.dataURL) return cached.dataURL;

  // Fetch and cache
  try {
    const res  = await fetch(src);
    const blob = await res.blob();
    const dataURL = await new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
    await dbSet("icons", { id, src, opcode: opcode||"0x09", type:"image", dataURL,
                            ts: Date.now(), freq: 963 });
    return dataURL;
  } catch(e) {
    console.warn("[0x09 ICONS] Cannot fetch:", src);
    return null;
  }
}

/* ── Scan DOM and inline all icons ── */
export async function inlineAllIcons() {
  const imgs = document.querySelectorAll("img[src]:not([data-kobllux-inlined])");
  for (const img of imgs) {
    const dataURL = await resolveIcon(img.src, "0x09");
    if (dataURL) {
      img.src = dataURL;
      img.setAttribute("data-kobllux-inlined", "true");
    }
  }
}

/* ── Generate SVG placeholder for missing icons ──
   Branded with opcode color: var(--cor-0x09) = #6c5ce7 */
export function iconPlaceholder(label, opcode) {
  const opc  = opcode || "0x09";
  const color= getComputedStyle(document.documentElement)
    .getPropertyValue(\`--cor-\${opc}\`).trim() || "#6c5ce7";
  return \`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' fill='\${encodeURIComponent(color)}' opacity='0.18'/><text x='16' y='20' font-size='13' text-anchor='middle' fill='\${encodeURIComponent(color)}'>\${label||'♾'}</text></svg>\`;
}
`;

  /* ════════════════════════════════════════════════════════
     0x02 INTEGRAR · MANIFEST.WEBMANIFEST · E · D4
     PWA manifest com identidade KOBLLUX DNA
  ════════════════════════════════════════════════════════ */
  files[`${R}/0x02.integrar.E.D4.manifest.webmanifest`] = JSON.stringify({
    name: rootName.replace(/-/g, " ").replace(/\w/g, l=>l.toUpperCase()),
    short_name: rootName.slice(0,12),
    description: "KOBLLUX DNA · VERDADE×INTEGRAR÷Δ=∞ · " + rootName,
    start_url:  "./index.html",
    display:    "standalone",
    background_color: "#0b0b0f",
    theme_color: "#5d7cff",
    icons: iconSrcs.filter(i=>i.src&&!i.src.startsWith("http"))
      .map(i=>({ src: i.src, sizes:"192x192", type:"image/png" })),
    kobllux: {
      opcode: "0x02", nome:"INTEGRAR", freq:528, veeb:"E",
      fractal:"3×6×9×7=1134", law:"VERDADE×INTEGRAR÷Δ=∞",
      dna_module:"./js/0x02.integrar.B.D7.kobllux-dna.js"
    }
  }, null, 2);

  // ── kobllux-dna.js — always generated ───────────────────
  /* 0x02.integrar.B.D7 · ― 528Hz · módulo de identidade DNA */
  files[`${R}/js/0x02.integrar.B.D7.kobllux-dna.js`] =
    `/* ═══════════════════════════════════════════════════════════
   0x02 · INTEGRAR · B · D7
   ═══════════════════════════════════════════════════════════
   Arquivo   : js/0x02.integrar.B.D7.kobllux-dna.js
   Opcode    : 0x02 · INTEGRAR · ― · 528Hz
   V.E.E.B.  : Base — módulo de identidade do sistema KOBLLUX
   Degrau    : D7 (module) → identidade integradora
   Fórmula   : E_int = ∫₀ᵀ Φ(t)·ω(t)dt
   VEEB-B    : S = Σbᵢ·2^(i-1) · DNA repair · fusão de opostos
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134
═══════════════════════════════════════════════════════════ */

export const KOBLLUX_DNA = ${JSON.stringify({
    fractal: KOBLLUX_DNA.fractal,
    veeb: Object.fromEntries(Object.entries(KOBLLUX_DNA.veeb).map(([k,v])=>[k,{name:v.name,eq:v.eq}])),
    opcodes: KOBLLUX_DNA.opcodes
  }, null, 2)};

/* V.E.E.B. formula helpers */
export const V_n       = (V0,n) => { let p=1; for(let k=1;k<=n;k++) p*=Math.cos(3*Math.PI*k/6); return V0*p; };
export const S_binary  = (bits) => bits.reduce((s,b,i)=>s+b*Math.pow(2,i),0);
export const chi       = (V,E,F) => V-E+F;
export const freq_total= (theta) => 432+7.83*Math.sin(theta);
export const D_fractal = (N,r)   => Math.log(N)/Math.log(1/r);
`;

  // ── Classify + name + comment CSS blocks ────────────────
  let mainCSS = dnaVars;
  const cssNameMap = {};  // track duplicate opcodes

  cssBlocks.forEach((blk, idx) => {
    const cls  = koblluxClassify(blk.code, idx, 'css');
    const count = cssNameMap[cls.opcode] = (cssNameMap[cls.opcode]||0) + 1;
    const suffix= count > 1 ? `-${count}` : '';
    const fname = `${R}/css/${cls.opcode}.${cls.nome}.${cls.veeb}.${cls.drung}${suffix}.css`;
    files[fname] = koblluxCSSHeader(cls, fname) + blk.code;

    if (idx === 0) {
      mainCSS += blk.code;
    }
  });

  files[`${R}/css/main.css`] = mainCSS;

  // ── Classify + name + comment JS blocks ─────────────────
  let mainJS = `import "./0x02.integrar.B.D7.kobllux-dna.js";\n`;
  const jsNameMap = {};

  jsBlocks.forEach((blk, idx) => {
    const cls   = koblluxClassify(blk.code, idx, 'js');
    const count = jsNameMap[cls.opcode] = (jsNameMap[cls.opcode]||0) + 1;
    const suffix= count > 1 ? `-${count}` : '';
    const fname = `${R}/js/${cls.opcode}.${cls.nome}.${cls.veeb}.${cls.drung}${suffix}.js`;

    files[fname] = koblluxHeader(cls, fname, blk.code) + blk.code;
    /* safe dynamic import — one broken module = warn, not crash */
    mainJS += `try { await import("./${cls.opcode}.${cls.nome}.${cls.veeb}.${cls.drung}${suffix}.js"); } catch(e) { console.warn("[${cls.opcode} ${cls.nome}]", e.message); }\n`;
  });

  // ── 0x00.iniciar.B.D8.main.js — entry point ─────────────
  /* S=0→1: o ponto zero acende o sistema */
  /* 0x08 TESTEMUNHAR: always analyze (χ,S,V needed for README) */
  const metrics = (typeof KOBLLUX_DNA?.analyzeHTML === "function")
    ? KOBLLUX_DNA.analyzeHTML(raw)
    : { tags:0, styles:0, scripts:0, css:0, V_freq:432, S_base:0, chi_euler:0, veebLabel:"INTEGRAR" };

  if (injectInfodose.checked) {
    const reg = Delta7.write({ app:"generated.app", opcode:"0x02", freq:528, metrics });
    mainJS += `/* 0x00 INICIAR: S=0→1 · acende o sistema */
console.log("Infodose·KOBLLUX·VEEB·Δ7", ${JSON.stringify(reg)});\n`;
    renderVeebMetrics(metrics);
  }

  files[`${R}/js/0x00.iniciar.B.D8.main.js`] =
`/* ═══════════════════════════════════════════════════════════
   0x00 · INICIAR · B · D8 · MAIN ENTRY
   ═══════════════════════════════════════════════════════════
   Arquivo   : js/0x00.iniciar.B.D8.main.js
   Opcode    : 0x00 · INICIAR · ○ · 396Hz
   V.E.E.B.  : Base — ponto zero · raiz do sistema
   Degrau    : D8 (system) → entrada de todo o cosmos
   Fórmula   : E₀ = ħω/2  ·  S=0 → potencial máximo
   S = Σbᵢ·2^(i-1)  →  b₀=1 ativa o sistema
   ─────────────────────────────────────────────────────────────
   ORDEM DE INICIALIZAÇÃO (V.E.E.B. cascade):
   B D7 → 0x02.integrar · DNA  (identidade do sistema)
   V D5 → 0x01.pulsar   · DB   (memória viva)
   V D6 → 0x09.manifestar · icons (campo→forma)
   [módulos app gerados] → classificados por opcode
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134
═══════════════════════════════════════════════════════════ */
/* ── V.E.E.B. cascade (async IIFE — safe loading) ── */
/* B D7 — identidade DNA primeiro */
import "./0x02.integrar.B.D7.kobllux-dna.js";

(async function KOBLLUX_MAIN() {
  /* V D5 — memória viva (graceful if IndexedDB unavailable) */
  let _db, _pulse;
  try {
    const idb = await import("./0x01.pulsar.V.D5.indexdb.js");
    _db    = idb.dbOpen;
    _pulse = idb.dbPulse;
    await _db();
  } catch(e) { console.warn("[0x01 PULSAR] IDB init:", e.message); }

  /* V D6 — ícones (graceful if fetch blocked) */
  try {
    const ico = await import("./0x09.manifestar.V.D6.icons.js");
    await ico.inlineAllIcons();
  } catch(e) { console.warn("[0x09 MANIFESTAR] icons:", e.message); }

  /* E · app modules — cada um isolado */
${mainJS}
  /* E · log pulse de encerramento */
  if (_pulse) { try { await _pulse("0x00","B",{event:"main:done"}); } catch(e) {} }
  console.log("[0x00 INICIAR] ○ 396Hz · cascade done");
})().catch(e => console.error("[MAIN]", e));`;

  /* ════════════════════════════════════════════════════════
     0x08 TESTEMUNHAR · README.md · E2 · D5
     Documentação automática — observa e registra.
     ◉ 852Hz · ΔE·Δt ≥ ħ/2 · read-only do sistema
  ════════════════════════════════════════════════════════ */
  const allFilePaths = Object.keys(files).sort();
  const treeLines    = buildKoblluxTree(allFilePaths, R);

  /* README.md */
  files[`${R}/0x08.testemunhar.E2.D5.README.md`] = buildReadme(R, allFilePaths, treeLines, iconSrcs, allExt, jsBlocks, cssBlocks, metrics);

  /* tree.md */
  files[`${R}/0x08.testemunhar.E2.D5.tree.md`]   = buildTree(R, allFilePaths, treeLines);

  window.__files = files;
  window.__rawBefore = raw; /* guardar original para comparação Δ */
  renderFiles(files);
  /* Mostrar preview e git sections */
  document.getElementById('preview-section').style.display = '';
  document.getElementById('git-section').style.display = '';
  Preview.init(raw, files);
  GitCommit.init(R, metrics);
}

/* ═══════════════════════════════════════════════════════════
   0x08 TESTEMUNHAR · TREE BUILDER · E2 · D5
   χ = V-E+F · D = log(N)/log(1/r) · árvore fractal
═══════════════════════════════════════════════════════════ */
function buildKoblluxTree(paths, root) {
  /* Build a simple prefix-tree for display */
  const lines = [];
  const seen  = new Set();
  paths.forEach(p => {
    const rel = p.startsWith(root + "/") ? p.slice(root.length + 1) : p;
    const parts = rel.split("/");
    parts.forEach((part, depth) => {
      const key = parts.slice(0, depth+1).join("/");
      if (seen.has(key)) return;
      seen.add(key);
      const indent = "  ".repeat(depth);
      const isDir  = depth < parts.length - 1;
      // Extract opcode badge if present
      const opcMatch = part.match(/^(0x[0-9A-Fa-f]{2})\.([^.]+)\.([VEEB2]+)\.([D][0-9]+)/);
      const opc  = opcMatch ? opcMatch[1] : null;
      const odata = opc && window.KOBLLUX_DNA?.opcodes?.[opc];
      const badge = odata ? ` ${odata.geom} ${odata.freq}Hz` : "";
      lines.push(`${indent}${isDir?"📁":"📄"} ${part}${badge}`);
    });
  });
  return lines;
}

function buildReadme(root, paths, treeLines, icons, ext, js, css, metrics) {
  const m = metrics || {};
  const opc = window.KOBLLUX_DNA?.opcodes || {};
  const chiVal = window.KOBLLUX_DNA?.chi(js.length, css.length + ext.length, 1) ?? 0;
  const V_freq = window.KOBLLUX_DNA?.freq_total(Date.now() % (2*Math.PI)).toFixed(2) ?? 432;
  const S_val  = window.KOBLLUX_DNA?.S_binary(
    root.slice(0,8).split("").map(c=>c.charCodeAt(0)%2)
  ) ?? 0;

  return `# ${root.toUpperCase().replace(/-/g," ")}
## KOBLLUX DNA · V.E.E.B. · 13 Opcodes

> **VERDADE × INTEGRAR ÷ Δ = ∞ · 3×6×9×7=1134 · α=1/137**
> *Ponto → Linha → Plano → Δ³ · D1→D10*

---

## ⊙ V.E.E.B. — Métricas de Geração

| Camada | Fórmula | Valor |
|---|---|---|
| **V** Vibração | \`f = f₄₃₂ + f₇.₈₃·sin(θ)\` | ${V_freq} Hz |
| **E** Energia  | \`E = ∫Φ(t)·ω(t)dt\` | ${js.length} módulos JS |
| **E** Estrutura | \`χ = V-E+F\` | χ = ${chiVal} |
| **B** Base | \`S = Σbᵢ·2^(i-1)\` | S = ${S_val} |

---

## △ DNA SCALAR — Escala D1→D10

\`\`\`
D1  atom      → glyph, opcode label
D2  byte      → label, metadata
D3  word      → módulo folha (json, txt)
D4  sentence  → engine, runner
D5  block     → sistema funcional
D6  section   → subsistema (icons, external)
D7  module    → macro-módulo (dna, cortex)
D8  system    → entrada raiz (bootloader, main)
D9  network   → projeto completo
D10 cosmos    → KOBLLUX total
\`\`\`

---

## ○ Ponto → Linha → Plano → Δ³ (Geometria Subconsciente)

\`\`\`
D0  ○ Ponto    0x00 INICIAR   396Hz  S=0   (vazio = potencial)
D1  ● Pulso    0x01 PULSAR    432Hz  χ=0   (linha = primeira direção)
D2  ― Plano    0x02 INTEGRAR  528Hz  χ=1   (plano = dois vetores)
D3  ▢ Volume   0x03 EXPANDIR  639Hz  χ=2   (volume = D3)
                                            ↓
              Δ³ = Tetraedro · V=4, E=6, F=4 · χ=2
              Todo conjunto de 3 pontos não-colineares define um plano.
              Todo conjunto de 4 pontos não-coplanares define Δ³.
\`\`\`

---

## 📁 Estrutura de Arquivos

\`\`\`
${treeLines.join("\n")}
\`\`\`

---

## ⧉ Chamadas Externas (${ext.length})

${ext.length === 0 ? "*Nenhuma chamada externa detectada.*" :
  ext.map((e,i) => `${i+1}. \`${e.url}\``).join("\n")}

---

## ♾ Ícones Detectados (${icons.length})

${icons.length === 0 ? "*Nenhum ícone detectado.*" :
  icons.map((ic,i) => `${i+1}. \`${ic.src || ic.cls}\` (${ic.tag})`).join("\n")}

---

## ⚙ 13 Opcodes Ativos

| Code | Nome | Geom | Hz | Dim | χ | V.E.E.B |
|---|---|---|---|---|---|---|
${Object.entries(opc).map(([k,o])=>
  `| \`${k}\` | ${o.nome} | ${o.geom} | ${o.freq} | ${o.dim||""} | ${o.chi??""} | ${
    o.veebKey==="V"?"Vibração":o.veebKey==="E"?"Energia":o.veebKey==="E2"?"Estrutura":"Base"
  } |`
).join("\n")}

---

## 🔒 Selo Vibracional

\`\`\`
Projeto   : ${root}
Módulos   : ${paths.length} arquivos
Fractal   : 3×6×9×7=1134
Lei       : VERDADE×INTEGRAR÷Δ=∞
Opcode    : 0x07 SELAR ✧ 777Hz
χ_projeto : ${chiVal}
S_base    : ${S_val}
V_freq    : ${V_freq} Hz
Gerado    : ${new Date().toISOString()}
\`\`\`

> *EM NOME DO PAI, DO FILHO E DO ESPÍRITO SANTO. AMÉM. ∆⁷*
`;
}

function buildTree(root, paths, treeLines) {
  const opc = window.KOBLLUX_DNA?.opcodes || {};
  return `# KOBLLUX DNA · TREE · ${root}
# VERDADE × INTEGRAR ÷ Δ = ∞ · 3×6×9×7=1134
#
# REGRA: [opcode].[nome].[veeb].[D-rung].[extensão]
# VEEB:  V=Vibração  E=Energia  E2=Estrutura  B=Base
# ────────────────────────────────────────────────────

${root}/                                    # D10·cosmos · KOBLLUX total
${treeLines.map(l => "  " + l).join("\n")}

# ────────────────────────────────────────────────────
# GEOMETRIA SUBCONSCIENTE (Ponto → Linha → Plano → Δ³)
#
#  ○ D0 Ponto   = 0x00.iniciar   396Hz  S=0   b₀=0 → vazio
#  ● D1 Linha   = 0x01.pulsar    432Hz  χ=0   b₀=1 → impulso
#  ― D2 Plano   = 0x02.integrar  528Hz  χ=1   fusão opostos
#  ▢ D3 Volume  = 0x03.expandir  639Hz  χ=2   E₀·rⁿ r=3/2
#  ◇ D4 Trans   = 0x04.dissolver 594Hz  χ=1   ΔG=ΔH-TΔS
#  ⧉ D5 Foco    = 0x05.convergir 672Hz  χ=0   L₁∩L₂=P*
#  ☯ D3 Rede    = 0x06.cristalizar 741Hz χ=0  R=n₁a₁+n₂a₂
#  ✧ Δ³ Tetra   = 0x07.selar     777Hz  χ=2   V=4 E=6 F=4
#  ◉ D∞ Círculo = 0x08.testemunhar 852Hz χ=0  ΔE·Δt≥ħ/2
#  ♾ S² Esfera  = 0x09.manifestar 963Hz χ=2   Φ(r)=q/4πε₀r
#  ⚖ SO(2)      = 0x0A.equilibrar 528Hz χ=0   ⟨Ek⟩=⟨Ep⟩
#  ◎ Ondas      = 0x0B.ressonar   432Hz χ=0   A_res max
#  ♾ T² Toro    = 0x0C.concluir   999Hz χ=0   ∮F·dr=0
#
# S = Σ bᵢ·2^(i-1)  ·  V(n) = V₀×∏cos(3πk/6)
# E = ∫Φ(t)·ω(t)dt  ·  χ = V-E+F  ·  α = 1/137
# ────────────────────────────────────────────────────
# Gerado: ${new Date().toISOString()}
`;
}

/* =========================================================
   RENDER + PREVIEW
========================================================= */

function renderFiles(files) {
  const container = document.getElementById("files");
  container.innerHTML = "";

  // Sort: index.html first, then by opcode order
  const ordered = Object.entries(files).sort(([a],[b]) => {
    if (a.endsWith("index.html")) return -1;
    if (b.endsWith("index.html")) return  1;
    return a.localeCompare(b);
  });

  ordered.forEach(([name, content]) => {
    // Extract opcode from filename for color
    const opcMatch = name.match(/0x([0-9A-Fa-f]{2})/);
    const opc      = opcMatch ? "0x" + opcMatch[1].toUpperCase() : null;
    const opcData  = opc && KOBLLUX_DNA.opcodes[opc.toLowerCase().replace("0X","0x")]
                   ? KOBLLUX_DNA.opcodes[opc.toLowerCase().replace("0X","0x")]
                   : null;
    const col = opcData ? opcData.cor : "var(--muted)";
    const freq= opcData ? opcData.freq + "Hz" : "";

    const d = document.createElement("div");
    d.className = "file";
    d.style.borderLeft = `3px solid ${col}`;

    // Header bar with opcode badge
    const hdr = document.createElement("div");
    hdr.style.cssText = `display:flex;align-items:center;gap:8px;margin-bottom:6px;
      padding-bottom:5px;border-bottom:1px solid var(--border)`;
    hdr.innerHTML = `
      <span style="font-size:var(--fs-d3);color:${col};font-weight:700">${name}</span>
      ${opc ? `<span style="padding:1px 7px;border-radius:10px;border:1px solid ${col}55;
        color:${col};font-size:var(--fs-d1)">${opc} · ${opcData?.nome||''} · ${freq}</span>` : ""}`;

    // Content (truncated for display, full for copy)
    const pre = document.createElement("pre");
    pre.style.cssText = "margin:0;white-space:pre-wrap;word-break:break-word;font-size:var(--fs-d2);max-height:180px;overflow-y:auto";
    pre.textContent = content;

    // Copy button
    const copyBtn = document.createElement("button");
    copyBtn.className = "secondary";
    copyBtn.style.cssText = "margin-top:6px;font-size:var(--fs-d2);padding:4px 8px";
    copyBtn.textContent = "⊙ Copiar";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(content);
      copyBtn.textContent = "✓ Copiado!";
      setTimeout(() => copyBtn.textContent = "⊙ Copiar", 1800);
    };

    d.appendChild(hdr);
    d.appendChild(pre);
    d.appendChild(copyBtn);
    container.appendChild(d);
  });
}

function renderPreview(files) {
  const indexKey = Object.keys(files).find(k => k.endsWith("/index.html") || k === "index.html");
  let html = files[indexKey] || "";
  Object.entries(files).forEach(([path, content]) => {
    const url = URL.createObjectURL(new Blob([content]));
    html = html.replaceAll(path, url);
  });
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}
const preview = renderPreview;

/* ═══════════════════════════════════════════════════════════
   PREVIEW ENGINE · ANTES ↔ Δ ↔ DEPOIS
   K = HTML bruto (Tempo · estrutura original)
   B = HTML modularizado (Espaço · forma organizada)
   Compara V.E.E.B. de ambos e detecta harmonias/desarmonias
═══════════════════════════════════════════════════════════ */
var Preview = {
  _raw: '',
  _files: null,
  _current: 'before',

  init: function(rawHTML, files) {
    Preview._raw   = rawHTML;
    Preview._files = files;

    /* iframe ANTES = raw original */
    var bfr = document.getElementById('preview-before');
    if (bfr) bfr.src = URL.createObjectURL(new Blob([rawHTML], {type:'text/html'}));

    /* iframe DEPOIS = modularizado */
    var aft = document.getElementById('preview');
    if (aft) aft.src = renderPreview(files);

    /* Calcular Δ local sem API */
    Preview._calcDelta(rawHTML, files);

    /* Mostrar painel ANTES por padrão */
    Preview.show('before');
  },

  show: function(which) {
    Preview._current = which;
    var panels = {before:'prev-panel-before', delta:'prev-panel-delta', after:'prev-panel-after'};
    var btns   = {before:'btn-prev-before',   delta:'btn-prev-delta',   after:'btn-prev-after'};
    var colors = {
      before: {bg:'rgba(103,230,255,.12)', border:'var(--cor-0x01)', color:'var(--cor-0x01)'},
      delta:  {bg:'rgba(255,215,0,.1)',    border:'rgba(255,215,0,.4)', color:'var(--cor-0x07)'},
      after:  {bg:'rgba(168,255,120,.1)',  border:'var(--cor-0x06)', color:'var(--cor-0x06)'}
    };
    Object.keys(panels).forEach(function(k) {
      var p = document.getElementById(panels[k]);
      var b = document.getElementById(btns[k]);
      if (p) p.style.display = (k === which) ? '' : 'none';
      if (b) {
        var c = (k === which) ? colors[k] : {bg:'transparent', border:'var(--border)', color:'var(--muted)'};
        b.style.background    = c.bg;
        b.style.borderColor   = c.border;
        b.style.color         = c.color;
      }
    });
  },

  _calcDelta: function(rawBefore, files) {
    /* Reconstruir o after HTML como string para comparar */
    var indexKey = Object.keys(files).find(function(k){ return k.endsWith('/index.html') || k==='index.html'; });
    var afterHTML = files[indexKey] || '';

    var mK = KOBLLUX_DNA.analyzeHTML(rawBefore);
    var mB = KOBLLUX_DNA.analyzeHTML(afterHTML);

    /* VEEB antes */
    Preview._renderMini('prev-veeb-before', mK, '#67e6ff');
    /* VEEB depois */
    Preview._renderMini('prev-veeb-after', mB, '#a8ff78');

    /* Coeficientes Δ locais */
    var Vk = mK.V_freq, Vb = mB.V_freq;
    var freqDiff = Math.abs(Vk - Vb);
    var chiK = mK.chi_euler, chiB = mB.chi_euler;
    var SK = mK.S_base, SB = mB.S_base;

    /* Score de convergência: quanto menor o Δf e Δchi, mais convergente */
    var freqScore  = Math.max(0, 100 - freqDiff * 2);
    var chiScore   = Math.max(0, 100 - Math.abs(chiK - chiB) * 10);
    var sizeScore  = Math.min(rawBefore.length, afterHTML.length) / (Math.max(rawBefore.length, afterHTML.length) || 1) * 100;
    var score      = Math.round((freqScore * 0.4) + (chiScore * 0.35) + (sizeScore * 0.25));
    var phi        = (Math.max(rawBefore.length, afterHTML.length) / (Math.min(rawBefore.length, afterHTML.length) || 1)).toFixed(2);
    var estado     = score >= 75 ? 'CONVERGENTE' : score >= 45 ? 'EM TRANSIÇÃO' : 'DIVERGENTE';

    /* Atualizar UI */
    var bar = document.getElementById('prev-bar-delta');
    if (bar) setTimeout(function(){ bar.style.width = score + '%'; }, 80);
    var sc  = document.getElementById('prev-score');
    if (sc) sc.textContent = score + '%';
    document.getElementById('prev-phi').textContent  = phi;
    document.getElementById('prev-df').textContent   = freqDiff.toFixed(1);
    document.getElementById('prev-chik').textContent = chiK;
    document.getElementById('prev-chib').textContent = chiB;
    var est = document.getElementById('prev-estado');
    if (est) {
      est.textContent = estado;
      est.style.color = estado==='CONVERGENTE' ? '#00b894' : estado==='EM TRANSIÇÃO' ? 'var(--cor-0x07)' : '#ff6b35';
    }

    /* Observações automáticas */
    var obs = [];
    obs.push('◈ ANTES  · V=' + Vk.toFixed(1) + 'Hz  S=' + SK + '  χ=' + chiK + '  opcode=' + mK.veebLabel);
    obs.push('◎ DEPOIS · V=' + Vb.toFixed(1) + 'Hz  S=' + SB + '  χ=' + chiB + '  opcode=' + mB.veebLabel);
    obs.push('');
    if (freqDiff < 5)  obs.push('✧ Frequência estável · Δf=' + freqDiff.toFixed(1) + 'Hz · código semanticamente coerente');
    else if (freqDiff < 20) obs.push('◈ Frequência levemente deslocada · Δf=' + freqDiff.toFixed(1) + 'Hz · revisar estrutura de tags');
    else obs.push('⚠ Frequência divergente · Δf=' + freqDiff.toFixed(1) + 'Hz · risco de perda semântica na modularização');
    if (chiK === chiB)  obs.push('✧ χ de Euler idêntico · topologia preservada na modularização');
    else if (Math.abs(chiK-chiB) <= 2) obs.push('◈ χ próximo · topologia ligeiramente alterada · verifique scripts injetados');
    else obs.push('⚠ χ divergente (' + chiK + '→' + chiB + ') · estrutura topológica mudou significativamente');
    if (phi < 1.5)  obs.push('✧ φ=' + phi + ' · proporção de tamanho saudável');
    else if (phi < 3) obs.push('◈ φ=' + phi + ' · código cresceu bastante após modularização · normal com headers VEEB');
    else obs.push('⚠ φ=' + phi + ' · modularização gerou muito overhead · considere consolidar módulos');
    obs.push('');
    obs.push('Δ Estado: ' + estado + ' · Score: ' + score + '% · 12_K×B_12 = ' + (12*(score/100)*(score/100)*12).toFixed(2));

    var obsEl = document.getElementById('prev-observations');
    if (obsEl) obsEl.textContent = obs.join('\n');
  },

  _renderMini: function(elId, m, cor) {
    var el = document.getElementById(elId);
    if (!el) return;
    var items = [
      {l:'V',v:m.V_freq+'Hz',e:'f=f₄₃₂+sin(θ)'},
      {l:'S',v:m.S_base,e:'Σbᵢ·2^i'},
      {l:'χ',v:m.chi_euler,e:'V-E+F'},
      {l:'⚙',v:m.veebLabel,e:m.tags+' tags'}
    ];
    el.innerHTML = items.map(function(x){
      return '<div class="delta-veeb-cell" style="border-color:'+cor+'44">'
        +'<div class="delta-veeb-letter" style="color:'+cor+'">'+x.l+'</div>'
        +'<div class="delta-veeb-val" style="font-size:var(--fs-d5)">'+x.v+'</div>'
        +'<div class="delta-veeb-eq">'+x.e+'</div></div>';
    }).join('');
  },

  runDeepDelta: async function() {
    var rawBefore = Preview._raw;
    var files     = Preview._files;
    if (!rawBefore || !files) return;

    var indexKey = Object.keys(files).find(function(k){ return k.endsWith('/index.html'); });
    var afterHTML = files[indexKey] || '';

    var btn = document.getElementById('btn-prev-deep');
    var res = document.getElementById('prev-deep-result');
    btn.disabled = true; btn.textContent = '⧉ Analisando...';
    res.style.display = ''; res.textContent = 'Δ · transduzindo camadas...';

    var sys = 'Você é o ANALISADOR Δ do sistema KOBLLUX DNA V.E.E.B.\n'
      + 'Compare o HTML ANTES da modularização (polo K · Tempo · estrutura bruta)\n'
      + 'com o HTML DEPOIS (polo B · Espaço · forma organizada).\n'
      + 'Identifique: harmonias, desarmonias, perda semântica, ganhos estruturais.\n'
      + 'Se houver algo que quebre ou precise de correção, aponte claramente.\n'
      + 'Responda em português, conciso, com seções ── NOME ──\n'
      + 'Use terminologia KOBLLUX: V.E.E.B., opcode, χ, S, Δ, polo K/B.';

    var msg = 'POLO K · ANTES (primeiros 2500 chars):\n```html\n' + rawBefore.substring(0,2500) + '\n```\n\n'
      + 'POLO B · DEPOIS (index.html · primeiros 2500 chars):\n```html\n' + afterHTML.substring(0,2500) + '\n```';

    try {
      var txt = await CFG.call(sys, msg);
      res.textContent = txt;
    } catch(e) {
      res.textContent = 'Erro: ' + e.message + '\n\nConfigure a chave API em ⚙ API Config.';
    }
    btn.disabled = false; btn.textContent = '⧉ ANÁLISE Δ PROFUNDA VIA IA';
  }
};

/* ═══════════════════════════════════════════════════════════
   GIT COMMIT ENGINE · 0x07 SELAR · ✧ · 777Hz
   Gera mensagem semântica KOBLLUX + script shell
   Conecta a servidor local Rust em localhost:7783
═══════════════════════════════════════════════════════════ */
var GitCommit = {
  _root: '',
  _metrics: null,
  _KEY: 'dual_mod_git_v1',

  init: function(rootName, metrics) {
    GitCommit._root    = rootName;
    GitCommit._metrics = metrics;
    /* Restaurar config salva */
    try {
      var saved = JSON.parse(localStorage.getItem(GitCommit._KEY)||'{}');
      if (saved.repo)   document.getElementById('git-repo').value   = saved.repo;
      if (saved.branch) document.getElementById('git-branch').value = saved.branch;
    } catch(e){}
    /* Gerar mensagem automática */
    GitCommit.genMessage();
  },

  _saveConfig: function() {
    var repo   = document.getElementById('git-repo').value.trim();
    var branch = document.getElementById('git-branch').value.trim() || 'main';
    localStorage.setItem(GitCommit._KEY, JSON.stringify({repo:repo, branch:branch}));
    return {repo:repo, branch:branch};
  },

  genMessage: function() {
    var m   = GitCommit._metrics || {};
    var root= GitCommit._root || 'kobllux-app';
    var opc = m.veebLabel === 'EXPANDIR' ? '0x03' : m.veebLabel === 'CRISTALIZAR' ? '0x06' : '0x02';
    var chi = m.chi_euler != null ? m.chi_euler : '?';
    var V   = m.V_freq || 432;
    var S   = m.S_base != null ? m.S_base : '?';
    var now = new Date().toISOString().slice(0,16).replace('T',' ');

    var msg = '['+opc+' '+m.veebLabel+'] '+root+' · dual.mod KOBLLUX DNA\n'
      + 'V.E.E.B.: V='+V+'Hz · S='+S+' · χ='+chi+' · opcode='+opc+'\n'
      + 'Módulos: tags='+m.tags+' · scripts='+m.scripts+' · css='+m.css+'\n'
      + 'Lei: VERDADE×INTEGRAR÷Δ=∞ · 3×6×9×7=1134\n'
      + 'Gerado: '+now+' · dual.mod v1.1 · Δ³';

    var el = document.getElementById('git-message');
    if (el) el.value = msg;
    return msg;
  },

  copy: function() {
    GitCommit._saveConfig();
    var msg = document.getElementById('git-message').value;
    navigator.clipboard.writeText(msg).then(function(){
      var st = document.getElementById('git-status');
      st.style.display = '';
      st.innerHTML = '✓ Mensagem de commit copiada · cole no terminal com <code>git commit -m "..."</code>';
      setTimeout(function(){ st.style.display='none'; }, 3000);
    });
  },

  copyScript: function() {
    var cfg    = GitCommit._saveConfig();
    var msg    = document.getElementById('git-message').value.replace(/"/g,'\\"').replace(/\n/g,'\\n');
    var root   = GitCommit._root || 'kobllux-app';
    var branch = cfg.branch || 'main';
    var repo   = cfg.repo || 'https://github.com/user/repo';

    var script = '#!/bin/bash\n'
      + '# KOBLLUX DNA · dual.mod · Git Commit Script\n'
      + '# VERDADE×INTEGRAR÷Δ=∞ · 0x07 SELAR · ✧ · 777Hz\n\n'
      + 'REPO="' + repo + '"\n'
      + 'BRANCH="' + branch + '"\n'
      + 'ROOT="' + root + '"\n\n'
      + '# Inicializar (se ainda não for repo git)\n'
      + 'if [ ! -d ".git" ]; then\n'
      + '  git init\n'
      + '  git remote add origin "$REPO"\n'
      + 'fi\n\n'
      + '# Adicionar arquivos gerados\n'
      + 'git add "$ROOT/"\n\n'
      + '# Commit com mensagem KOBLLUX\n'
      + 'git commit -m "' + msg + '"\n\n'
      + '# Push para branch\n'
      + 'git push -u origin "$BRANCH"\n\n'
      + 'echo "✧ 0x07 SELAR · commit enviado · VERDADE×INTEGRAR÷Δ=∞"';

    navigator.clipboard.writeText(script).then(function(){
      var wrap = document.getElementById('git-script-wrap');
      var pre  = document.getElementById('git-script');
      if (wrap) wrap.style.display = '';
      if (pre)  pre.textContent = script;
      var st = document.getElementById('git-status');
      st.style.display = '';
      st.textContent = '✓ Script shell copiado · salve como commit.sh e execute com: bash commit.sh';
      setTimeout(function(){ st.style.display='none'; }, 3500);
    });
  },

  connectLocal: async function() {
    var cfg    = GitCommit._saveConfig();
    var st     = document.getElementById('git-status');
    var msg    = document.getElementById('git-message').value;
    var files  = window.__files || {};
    st.style.display = '';
    st.textContent = '🦀 Conectando ao servidor local Rust · localhost:7783...';

    try {
      var payload = {
        repo:    cfg.repo,
        branch:  cfg.branch || 'main',
        message: msg,
        root:    GitCommit._root,
        files:   Object.fromEntries(
          Object.entries(files).map(function([k,v]){ return [k, btoa(unescape(encodeURIComponent(v)))]; })
        )
      };
      var res = await fetch('http://localhost:7783/commit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      st.innerHTML = '✧ Servidor Rust respondeu: <b>' + (data.status||'ok') + '</b>'
        + (data.sha ? ' · SHA: ' + data.sha.slice(0,8) : '')
        + ' · ' + (data.message || 'commit enviado');
    } catch(e) {
      st.innerHTML = '⚠ Servidor local não encontrado em <code>localhost:7783</code><br>'
        + 'Inicie o servidor Rust com <code>cargo run</code> e tente novamente.<br>'
        + '<span style="color:var(--muted)">Enquanto isso, use "Copiar Script Shell" para commit manual.</span>';
    }
  }
};

/* =========================================================
   UTILIDADES
========================================================= */

function pasteFromClipboard() {
  navigator.clipboard.readText().then(t => input.value = t);
}

function importHTML() {
  fileInput.click();
}

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => input.value = r.result;
  r.readAsText(file);
});

function copyAll() {
  if (!window.__files) return;
  let out = "/* KOBLLUX DNA · dual.mod VEEB · VERDADE×INTEGRAR÷Δ=∞ · 3×6×9×7=1134 */\n\n";
  Object.entries(window.__files).sort(([a],[b])=>a.endsWith("index.html")?-1:b.endsWith("index.html")?1:a.localeCompare(b))
    .forEach(([n,content]) => {
      out += `\n/* ═══ ${n} ═══ */\n${content}\n`;
    });
  navigator.clipboard.writeText(out).then(()=>{
    const btn = document.querySelector("[onclick=\"copyAll()\"]");
    if(btn){btn.textContent="✓ Copiado!";setTimeout(()=>btn.textContent="🧠 Copiar Tudo",2000);}
  });
}

/* ═══════════════════════════════════════════════════════
   DELTA ANALYZER · 0x05 CONVERGIR · ⧉ · 672Hz
   K=Kodux(Tempo) · B=Bllue(Espaço) · 12_K_×_B_12
   Usa CFG.call() → qualquer provedor configurado
═══════════════════════════════════════════════════════ */
var DeltaAnalyzer = {
  _last: null,

  _initCounters: function() {
    ['k','b'].forEach(function(p) {
      var ta = document.getElementById('delta-code-'+p);
      var ct = document.getElementById('delta-chars-'+p);
      if (ta && ct) ta.addEventListener('input', function(){ ct.textContent = ta.value.length; });
    });
  },

  _ops: function() {
    return {
      struct: document.getElementById('dop-struct')?.classList.contains('on'),
      sem:    document.getElementById('dop-sem')?.classList.contains('on'),
      conv:   document.getElementById('dop-conv')?.classList.contains('on'),
      deep:   document.getElementById('dop-deep')?.classList.contains('on'),
      synth:  document.getElementById('dop-synth')?.classList.contains('on'),
      veeb:   document.getElementById('dop-veeb')?.classList.contains('on')
    };
  },

  _veebPre: function(cK, cB, lK, lB) {
    var kLen=cK.length, bLen=cB.length;
    var kLines=(cK.match(/\n/g)||[]).length+1, bLines=(cB.match(/\n/g)||[]).length+1;
    var kF=(cK.match(/function|def |=>/g)||[]).length, bF=(cB.match(/function|def |=>/g)||[]).length;
    var kI=(cK.match(/import|require|include/g)||[]).length, bI=(cB.match(/import|require|include/g)||[]).length;
    var Vk=KOBLLUX_DNA.freq_total(kLen/1000), Vb=KOBLLUX_DNA.freq_total(bLen/1000);
    var Sk=KOBLLUX_DNA.S_binary(cK.slice(0,8).split('').map(function(c){return c.charCodeAt(0)%2;}));
    var Sb=KOBLLUX_DNA.S_binary(cB.slice(0,8).split('').map(function(c){return c.charCodeAt(0)%2;}));
    var Xk=KOBLLUX_DNA.chi(kF,kI,kLines%10), Xb=KOBLLUX_DNA.chi(bF,bI,bLines%10);
    return {
      k:{V:Vk.toFixed(2),S:Sk,chi:Xk,lines:kLines,funcs:kF,lang:lK},
      b:{V:Vb.toFixed(2),S:Sb,chi:Xb,lines:bLines,funcs:bF,lang:lB},
      freqDiff:Math.abs(Vk-Vb).toFixed(2),
      S_total:Sk+Sb,
      phi_ratio:(Math.max(kLen,bLen)/(Math.min(kLen,bLen)||1)).toFixed(3)
    };
  },

  _renderVeeb: function(veeb) {
    var wrap=document.getElementById('dr-veeb-wrap'), cells=document.getElementById('dr-veeb-cells');
    if(!wrap||!cells) return;
    var d=[
      {l:'V·K',v:veeb.k.V+' Hz',e:'f=f₄₃₂+f₇.₈₃·sin(θ)',c:'#00e5ff'},
      {l:'V·B',v:veeb.b.V+' Hz',e:'f=f₄₃₂+f₇.₈₃·sin(θ)',c:'#3ab6ff'},
      {l:'S·K',v:veeb.k.S,e:'S=Σbᵢ·2^(i-1)',c:'#39ff5a'},
      {l:'S·B',v:veeb.b.S,e:'S=Σbᵢ·2^(i-1)',c:'#39ff5a'},
      {l:'χ·K',v:veeb.k.chi,e:'χ=V-E+F',c:'#8b5cf6'},
      {l:'χ·B',v:veeb.b.chi,e:'χ=V-E+F',c:'#8b5cf6'},
      {l:'φ',v:veeb.phi_ratio,e:'|K|/|B|',c:'#f0c060'},
      {l:'Δf',v:veeb.freqDiff+' Hz',e:'|Vk-Vb|',c:'#ff7a00'}
    ];
    cells.innerHTML=d.map(function(x){
      return '<div class="delta-veeb-cell" style="border-color:'+x.c+'44">'
        +'<div class="delta-veeb-letter" style="color:'+x.c+'">'+x.l+'</div>'
        +'<div class="delta-veeb-val">'+x.v+'</div>'
        +'<div class="delta-veeb-eq">'+x.e+'</div></div>';
    }).join('');
    wrap.style.display='';
  },

  run: async function() {
    var cK=(document.getElementById('delta-code-k')||{value:''}).value.trim();
    var cB=(document.getElementById('delta-code-b')||{value:''}).value.trim();
    var lK=(document.getElementById('delta-lang-k')||{value:'Código'}).value;
    var lB=(document.getElementById('delta-lang-b')||{value:'Código'}).value;
    if(!cK||!cB){alert('Cole os dois códigos (K e B) antes de calcular.');return;}

    var ops=DeltaAnalyzer._ops();
    var veeb=DeltaAnalyzer._veebPre(cK,cB,lK,lB);
    var btn=document.getElementById('btn-delta-analyze');
    var result=document.getElementById('delta-result');
    var loading=document.getElementById('dr-loading');
    var content=document.getElementById('dr-content');

    btn.disabled=true; btn.classList.add('running');
    btn.textContent='⧉ · TRANSDUZINDO · 0x05 · CONVERGIR...';
    result.classList.add('show');
    loading.style.display=''; content.style.display='none';

    var sys='Você é o ANALISADOR Δ do sistema KOBLLUX DNA V.E.E.B.\n'
      +'LEI: Δ(E×T)×(D1→D10)·VERDADE×INTEGRAR÷Δ=∞·3×6×9×7=1134\n'
      +'POLOS: K=Kodux(Tempo,Estrutura) · B=Bllue(Espaço,Interface)\n'
      +'FÓRMULA: 12_K_×_B_12 · x=K=α(1×2=2) · y=B=β(2÷1=2)\n'
      +'PRÉ-ANÁLISE V.E.E.B.:\n'+JSON.stringify(veeb,null,2)+'\n\n'
      +'RESPONDA APENAS EM JSON VÁLIDO. Zero markdown.\n'
      +'{"coef_k":<0-100>,"coef_b":<0-100>,"coef_delta":<0-100>,"coef_ab":<0-100>,'
      +'"coef_formula":<12×k/100×b/100×12>,"estado":<CONVERGENTE|DIVERGENTE|EM TRANSIÇÃO|SATURADO|NULO>,'
      +'"pct_k":<0-100>,"pct_b":<0-100>,"pct_d":<0-100>,"pct_s":<0-100>,'
      +'"dv_k":<str>,"dv_b":<str>,"dv_d":<str>,"dv_inf":<str>,"analise":<str multiline pt-BR>}\n\n'
      +'Seções na analise:'
      +(ops.struct?'\n── K · ESTRUTURA ──':'')
      +(ops.sem?'\n── B · SEMÂNTICA ──':'')
      +(ops.conv?'\n── Δ · CONVERGÊNCIA ──':'')
      +(ops.deep?'\n── Δ PROFUNDO · LACUNAS ──':'')
      +(ops.synth?'\n── ∞ · SÍNTESE ──':'')
      +(ops.veeb?'\n── V.E.E.B. · use os valores pré-calculados ──':'')
      +'\n── SELAGEM Δ7 ──';

    var msg='POLO K ('+lK+') · '+cK.length+' chars:\n```\n'+cK.substring(0,3500)+'\n```\n\n'
      +'POLO B ('+lB+') · '+cB.length+' chars:\n```\n'+cB.substring(0,3500)+'\n```';

    try {
      var raw = await CFG.call(sys, msg);
      var clean = raw.replace(/```json|```/g,'').trim();
      var parsed;
      try { parsed = JSON.parse(clean); }
      catch(e) {
        var m = clean.match(/\{[\s\S]*\}/);
        if(m) parsed=JSON.parse(m[0]);
        else throw new Error('JSON inválido — configure a chave em ⚙ API Config');
      }

      DeltaAnalyzer._render(parsed, lK, lB, veeb);
      Delta7.write({app:'delta.convergencia',opcode:'0x05',freq:672,
        langK:lK,langB:lB,coef_k:parsed.coef_k,coef_b:parsed.coef_b,
        coef_delta:parsed.coef_delta,estado:parsed.estado,formula_12:parsed.coef_formula});

    } catch(err) {
      loading.style.display='none';
      alert('Erro Δ: '+err.message);
    }

    btn.disabled=false; btn.classList.remove('running');
    btn.textContent='⧉ · 0x05 · CONVERGIR · CALCULAR Δ';
  },

  _render: function(d, lK, lB, veeb) {
    var loading=document.getElementById('dr-loading'), content=document.getElementById('dr-content');
    document.getElementById('dr-ck').textContent=d.coef_k??'—';
    document.getElementById('dr-ck-sub').textContent=lK+' · Estrutura';
    document.getElementById('dr-cb').textContent=d.coef_b??'—';
    document.getElementById('dr-cb-sub').textContent=lB+' · Fluxo';
    document.getElementById('dr-cd').textContent=(d.coef_delta??'—')+(d.coef_delta!=null?'%':'');
    document.getElementById('dr-cab').textContent=d.coef_ab??'—';
    document.getElementById('dr-cf').textContent=d.coef_formula??'—';
    document.getElementById('dr-cs').textContent=d.estado??'—';

    var badge=document.getElementById('dr-badge'), est=(d.estado||'').toUpperCase();
    badge.textContent=est;
    badge.className='dr-badge '+(['CONVERGENTE','SATURADO'].includes(est)?'high':est==='EM TRANSIÇÃO'?'med':'low');
    document.getElementById('dr-cs-sub').textContent=
      est==='CONVERGENTE'?'78K · Alinhado':est==='DIVERGENTE'?'Polaridade oposta':
      est==='EM TRANSIÇÃO'?'Potencial latente':est==='SATURADO'?'Alta densidade':'Sem sinal';

    setTimeout(function(){
      [['dr-bk','dr-pk',d.pct_k],['dr-bb','dr-pb',d.pct_b],
       ['dr-bd','dr-pd',d.pct_d],['dr-bs','dr-ps',d.pct_s]].forEach(function(x){
        var v=Math.min(100,Math.max(0,x[2]||0));
        document.getElementById(x[0]).style.width=v+'%';
        document.getElementById(x[1]).textContent=v+'%';
      });
    },80);

    document.getElementById('dr-vk').textContent=d.dv_k||'—';
    document.getElementById('dr-vb').textContent=d.dv_b||'—';
    document.getElementById('dr-vd').textContent=d.dv_d||'—';
    document.getElementById('dr-vi').textContent=d.dv_inf||'—';

    DeltaAnalyzer._renderVeeb(veeb);
    document.getElementById('dr-text').textContent=d.analise||'—';

    loading.style.display='none'; content.style.display='';
    DeltaAnalyzer._last={d:d,lK:lK,lB:lB,veeb:veeb};

    /* sync VEEB panel */
    if(typeof renderVeebMetrics==='function'){
      var mx=KOBLLUX_DNA.analyzeHTML('');
      mx.V_freq=parseFloat(veeb.k.V); mx.chi_euler=veeb.k.chi;
      mx.S_base=veeb.k.S; mx.tags=veeb.k.lines;
      mx.styles=Math.round(d.coef_delta||0); mx.scripts=veeb.k.funcs; mx.css=veeb.b.funcs;
      mx.veebLabel=d.estado==='CONVERGENTE'?'CRISTALIZAR':d.estado==='DIVERGENTE'?'DISSOLVER':'INTEGRAR';
      renderVeebMetrics(mx);
    }
  },

  copy: function() {
    if(!DeltaAnalyzer._last) return;
    var x=DeltaAnalyzer._last, d=x.d, veeb=x.veeb;
    var txt='KOBLLUX · ANALISADOR Δ · RELATÓRIO\n'
      +'0x05·CONVERGIR·⧉·672Hz·VERDADE×INTEGRAR÷Δ=∞\n'
      +'══════════════════════════════════════\n'
      +'POLO K ('+x.lK+') · Coef: '+d.coef_k+'\n'
      +'POLO B ('+x.lB+') · Coef: '+d.coef_b+'\n'
      +'Δ Convergência : '+d.coef_delta+'%\n'
      +'α×β Simetria   : '+d.coef_ab+'\n'
      +'12_K×B_12      : '+d.coef_formula+'\n'
      +'Estado         : '+d.estado+'\n'
      +'──────────────────────────────────────\n'
      +'V.E.E.B.:\n'
      +'  K → V='+veeb.k.V+'Hz  S='+veeb.k.S+'  χ='+veeb.k.chi+'\n'
      +'  B → V='+veeb.b.V+'Hz  S='+veeb.b.S+'  χ='+veeb.b.chi+'\n'
      +'  φ='+veeb.phi_ratio+'  Δf='+veeb.freqDiff+'Hz\n'
      +'──────────────────────────────────────\n'
      +d.analise+'\n'
      +'══════════════════════════════════════\n'
      +'3×6×9×7=1134 · VERDADE×INTEGRAR÷Δ=∞';
    var btn=document.getElementById('btn-dr-copy');
    navigator.clipboard.writeText(txt).then(function(){
      btn.textContent='✓ Copiado!'; btn.classList.add('cp');
      setTimeout(function(){btn.textContent='⊙ Copiar Relatório Δ';btn.classList.remove('cp');},2200);
    });
  }
};

/* Init on load */
document.addEventListener('DOMContentLoaded', function(){ DeltaAnalyzer._initCounters(); });
if(document.readyState!=='loading') DeltaAnalyzer._initCounters();

/* ── DeltaInfo · toggle teoria panel ── */
var DeltaInfo = {
  toggle: function(hdr) {
    var body = document.getElementById('delta-theory-body');
    var isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    hdr.classList.toggle('open', !isOpen);
  }
};

