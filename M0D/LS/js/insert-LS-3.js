(function(){
  'use strict';

  // ========== CONFIGURAÇÃO ==========
  /* const LS_KEYS = {
    HTML: 'lastHTML',
    COLL: 'nebula_collapsed',
    USER_SYMBOL: 'userSymbol',
    SKS: 'openrouter_keys',
    SK_ACTIVE: 'openrouter_active'
  };

  const DISABLED_KEY = 'infodose:presets.disabled';
  const PRESETS = [
    { key: 'infodose:userName', label: 'Usuário' },
    { key: 'infodose:assistantName', label: 'Assistente' },
    { key: 'dual.keys.openrouter', label: 'Chave OpenRouter (legacy)' },
    { key: 'dual.openrouter.model', label: 'Modelo OpenRouter' },
    { key: 'uno:theme', label: 'Tema' },
    { key: 'uno:bg', label: 'Fundo Custom' },
    { key: 'infodose:cssCustom', label: 'CSS Custom' },
    { key: 'infodose:voices', label: 'Vozes Arquetípicas' }
  ];*/
  
const LS_KEYS = {
      HTML:'lastHTML',
      USER_SYMBOL:'userSymbol',
      SKS:'di_apiKey',
      SK_ACTIVE:'openrouter_active'
    };

    const DISABLED_KEY = 'infodose:presets.disabled';
    const PRESETS = [
      { key:'di_userName', label:'Usuário' },
      { key:'di_assistantName', label:'Assistente' },
      { key:'di_apiKey', label:'Chave OpenRouter (legacy)' },
      { key:'di_modelName', label:'Modelo IA' },
      { key:'uno:theme', label:'Tema' },
      { key:'uno:bg', label:'Fundo Custom' },
      { key:'infodose:cssCustom', label:'CSS Custom' },
      { key:'infodose:voices', label:'Vozes Arquetípicas' }
    ];
  // ========== VERIFICA SE JÁ EXISTE ==========
  if (document.getElementById('baulite-root')) return;

  // ========== INJETA CSS ==========
  const style = document.createElement('style');
  style.textContent = `
    /* Baú Lite - Estilos */
    :root{
      --grad-a:#ff52e5;
      --grad-b:#00c5e5;
      --bg: linear-gradient(135deg,var(--grad-a),var(--grad-b));
      --fg:#fff;
      --mut:#cfd8dc;
      --glass:rgba(0,0,0,.45);
      --r:22px;
      --shadow:0 12px 34px rgba(0,0,0,.4);
      --bd:1px solid rgba(255,255,255,.15);
      --ok:#39FFB6;
    }
    .baulite *{box-sizing:border-box;margin:0;padding:0}
    .baulite{
      font-family:'Montserrat',system-ui,sans-serif;
      position:relative;
      z-index:2147483647;
    }
    .baulite .app{
      width:100%;
      max-width:860px;
      display:flex;
      flex-direction:column;
      gap:18px;
    }
    .baulite .card{
      background:var(--glass);
      backdrop-filter:blur(18px);
      border-radius:var(--r);
      box-shadow:var(--shadow);
      padding:14px 16px;
      position:relative;
      overflow:visible;
      min-height:120px;
    }
    .baulite .open-ls-btn{
      position:absolute;
      top:12px;
      right:-12px;
      width:44px;
      height:44px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:0;
      z-index:10;
      background:rgba(255,255,255,.12);
      border:1px solid rgba(255,255,255,.18);
      box-shadow:0 10px 24px rgba(0,0,0,.35);
      color:#fff;
      cursor:pointer;
      transition:.2s;
    }
    .baulite .open-ls-btn:hover{
      background:rgba(255,255,255,.22);
      transform:translateY(-1px);
    }
    .baulite .small{font-size:.8rem;color:var(--mut);margin-top:8px;}
    .baulite .loader{
      width:22px;height:22px;
      border:3px solid rgba(255,255,255,.2);
      border-top:3px solid #fff;
      border-radius:50%;
      animation:baulite-spin 1s linear infinite;
      margin:8px auto;
    }
    @keyframes baulite-spin{100%{transform:rotate(360deg)}}
    .baulite .modal{
      position:fixed;
      inset:0;
      display:none;
      align-items:center;
      justify-content:center;
      z-index:2147483647;
      background:rgba(0,0,0,.55);
      backdrop-filter:blur(8px);
      padding:14px;
    }
    .baulite .modal.open{display:flex}
    .baulite .panel{
      width:min(980px,95vw);
      max-height:86vh;
      overflow:auto;
      background:rgba(15,17,32,.92);
      border:var(--bd);
      border-radius:18px;
      box-shadow:var(--shadow);
      padding:14px;
    }
    .baulite .hdr{
      display:flex;
      gap:10px;
      align-items:center;
      justify-content:space-between;
      border-bottom:var(--bd);
      padding-bottom:10px;
      margin-bottom:10px;
      flex-wrap:wrap;
    }
    .baulite .hdr .ttl{
      font-weight:900;
      letter-spacing:.06em;
    }
    .baulite .actions{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
    }
    .baulite .meta{
      color:var(--mut);
      font-size:12px;
      margin:6px 0 10px;
    }
    .baulite .list{
      display:grid;
      gap:10px;
    }
    .baulite .item{
      background:rgba(255,255,255,.05);
      border:var(--bd);
      border-radius:14px;
      padding:10px;
      display:grid;
      gap:8px;
    }
    .baulite .item .head{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:8px;
      flex-wrap:wrap;
    }
    .baulite .key{
      font-weight:800;
      max-width:56vw;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .baulite .type{
      font-size:11px;
      color:var(--mut);
    }
    .baulite .val{
      font:12px/1.4 ui-monospace,monospace;
      background:#0b0f1a;
      border:var(--bd);
      border-radius:10px;
      padding:8px;
      max-height:140px;
      overflow:auto;
      word-break:break-word;
      white-space:pre-wrap;
    }
    .baulite .switch{
      inline-size:46px;
      block-size:28px;
      border-radius:999px;
      border:var(--bd);
      background:rgba(255,255,255,.15);
      position:relative;
      cursor:pointer;
      flex:0 0 auto;
    }
    .baulite .switch::after{
      content:"";
      position:absolute;
      inset:4px auto 4px 4px;
      width:20px;
      border-radius:999px;
      background:#fff;
      transition:all .18s;
    }
    .baulite .switch.on{
      background:rgba(25,226,123,.28);
    }
    .baulite .switch.on::after{
      left:22px;
    }
    .baulite details.presets{
      border:var(--bd);
      border-radius:14px;
      padding:8px;
      background:rgba(255,255,255,.04);
      margin-bottom:10px;
    }
    .baulite .presets-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:10px;
      margin-top:8px;
    }
    .baulite .preset{
      border:var(--bd);
      border-radius:12px;
      background:rgba(255,255,255,.04);
      padding:10px;
      display:grid;
      gap:6px;
    }
    .baulite .img-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
      gap:10px;
    }
    .baulite .img-card{
      border:var(--bd);
      background:rgba(255,255,255,.04);
      border-radius:10px;
      padding:8px;
    }
    .baulite .img-card img{
      width:100%;
      height:auto;
      display:block;
      border-radius:8px;
    }
    .baulite button{
      background:rgba(255,255,255,.1);
      border:0;
      color:#fff;
      padding:8px 12px;
      border-radius:12px;
      font-size:.9rem;
      cursor:pointer;
      transition:.2s;
      display:inline-flex;
      gap:6px;
      align-items:center;
    }
    .baulite button:hover{background:rgba(255,255,255,.2)}
    .baulite .btn-ghost{background:transparent;border:1px dashed rgba(255,255,255,.25)}
    .baulite textarea,.baulite input,.baulite select{
      width:100%;
      margin:6px 0;
      padding:10px;
      border-radius:10px;
      border:none;
      font-family:inherit;
      outline:none;
    }
    @media (max-width:560px){
      .baulite .key{max-width:46vw}
      .baulite .open-ls-btn{top:10px;right:-10px}
    }
    /* Ícones simples (fallback caso Lucide não carregue) */
    .baulite i{font-style:normal;display:inline-block;width:1.2em;text-align:center}
    .baulite i::before{content:"●";opacity:0.8}
  `;
  document.head.appendChild(style);

  // ========== CRIA ESTRUTURA BASE ==========
  const root = document.createElement('div');
  root.id = 'baulite-root';
  root.className = 'baulite';
  document.body.appendChild(root);

  // Elemento oculto para download
  const dlLink = document.createElement('a');
  dlLink.id = 'baulite-dl';
  dlLink.style.display = 'none';
  root.appendChild(dlLink);

  // Container do app
  const appDiv = document.createElement('div');
  appDiv.className = 'app';
  appDiv.id = 'baulite-app';
  root.appendChild(appDiv);

  // Modal
  const modalDiv = document.createElement('div');
  modalDiv.id = 'baulite-modal';
  modalDiv.className = 'modal';
  modalDiv.setAttribute('aria-hidden', 'true');
  modalDiv.innerHTML = `
    <div class="panel">
      <div class="hdr">
        <div class="ttl">LocalStorage • Baú Lite</div>
        <div class="actions">
          <button id="baulite-lsRescan"><i>⟳</i> Re-scan</button>
          <button id="baulite-lsExport"><i>⬆</i> Exportar</button>
          <label for="baulite-lsImportFile" style="display:inline-block">
            <button type="button"><i>⬇</i> Importar</button>
          </label>
          <input id="baulite-lsImportFile" type="file" accept="application/json" hidden>
          <button id="baulite-lsClearDisabled" class="btn-ghost"><i>⌫</i> Limpar desativados</button>
          <button id="baulite-lsClose"><i>✕</i> Fechar</button>
        </div>
      </div>

      <details class="presets" open>
        <summary><strong>Presets (ON/OFF global)</strong></summary>
        <div class="presets-grid" id="baulite-presetsGrid"></div>
      </details>

      <div class="meta"><span id="baulite-lsCount">—</span> • <span id="baulite-lsSize">—</span></div>
      <div class="list" id="baulite-lsList"></div>

      <details class="presets" style="margin-top:10px" open>
        <summary><strong>Pré-visualização de Imagens</strong></summary>
        <div class="img-grid" id="baulite-imgGrid"></div>
      </details>
    </div>
  `;
  root.appendChild(modalDiv);

  // ========== UTILITÁRIOS ==========
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

  function saveFile(name, str) {
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = $('#baulite-dl', root);
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function prettyBytes(n) {
    if (!Number.isFinite(n) || n <= 0) return '0 B';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) {
      n /= 1024;
      i++;
    }
    return n.toFixed(2) + ' ' + u[i];
  }

  function isJson(v) {
    try { JSON.parse(v); return true; } catch { return false; }
  }

  function inferType(v) {
    if (v == null || v === '') return 'empty';
    if (isJson(v)) {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return 'json[array]';
      if (p && typeof p === 'object') return 'json[object]';
      return 'json[' + (typeof p) + ']';
    }
    if (/^data:image\//i.test(v) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(v)) return 'image';
    if (/^(true|false|1|0)$/i.test(v)) return 'boolean-like';
    if (/^https?:\/\//i.test(v)) return 'url';
    if (/^data:/i.test(v)) return 'data-url';
    return 'string';
  }

  // ========== GERENCIAMENTO DE DADOS ==========
  function disabledSet() {
    try { return new Set(JSON.parse(localStorage.getItem(DISABLED_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function saveDisabled(set) {
    localStorage.setItem(DISABLED_KEY, JSON.stringify(Array.from(set)));
  }

  function toggleDisabled(k) {
    const s = disabledSet();
    s.has(k) ? s.delete(k) : s.add(k);
    saveDisabled(s);
    renderPresets();
    renderLS();
  }

  function lsEntries() {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      out.push({ key: k, val: v });
    }
    return out.sort((a, b) => a.key.localeCompare(b.key));
  }

  function lsSizeBytes() {
    let sum = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      sum += k.length + v.length;
    }
    return sum;
  }

  // ========== RENDERIZAÇÃO ==========
  function renderPresets() {
    const grid = $('#baulite-presetsGrid', root);
    if (!grid) return;
    grid.innerHTML = '';
    const dis = disabledSet();

    PRESETS.forEach(p => {
      const val = localStorage.getItem(p.key);
      const on = !dis.has(p.key);

      const wrap = document.createElement('div');
      wrap.className = 'preset';

      const head = document.createElement('div');
      head.style.padding = '0';
      head.style.border = '0';
      head.style.display = 'flex';
      head.style.justifyContent = 'space-between';
      head.style.alignItems = 'center';

      const nameDiv = document.createElement('div');
      nameDiv.innerHTML = `<strong>${p.label}</strong><div class="type">${p.key}</div>`;

      const sw = document.createElement('div');
      sw.className = 'switch' + (on ? ' on' : '');
      sw.title = on ? 'Desativar (não apaga)' : 'Ativar';
      sw.addEventListener('click', () => toggleDisabled(p.key));

      head.append(nameDiv, sw);

      const meta = document.createElement('div');
      meta.className = 'val';
      meta.textContent = val
        ? (inferType(val).startsWith('json') ? JSON.stringify(JSON.parse(val), null, 2) : val)
        : '—';

      wrap.append(head, meta);
      grid.append(wrap);
    });
  }

  function addImagePreview(key, src) {
    const g = $('#baulite-imgGrid', root);
    const card = document.createElement('div');
    card.className = 'img-card';

    const cap = document.createElement('div');
    cap.className = 'small';
    cap.textContent = key;

    const im = new Image();
    im.src = src;
    im.loading = 'lazy';
    im.style.maxWidth = '100%';

    card.append(cap, im);
    g.append(card);
  }

  function renderLS() {
    const list = $('#baulite-lsList', root);
    const imgGrid = $('#baulite-imgGrid', root);
    if (!list) return;

    list.innerHTML = '';
    imgGrid.innerHTML = '';

    const entries = lsEntries();
    $('#baulite-lsCount', root).textContent = entries.length + ' chave(s)';
    $('#baulite-lsSize', root).textContent = prettyBytes(lsSizeBytes());

    const dis = disabledSet();

    entries.forEach(({ key, val }) => {
      if (key === DISABLED_KEY) return;

      const it = document.createElement('div');
      it.className = 'item';

      const head = document.createElement('div');
      head.className = 'head';

      const left = document.createElement('div');
      left.innerHTML = `
        <div class="key">${key}${dis.has(key) ? ' <span class="type">(desativado)</span>' : ''}</div>
        <div class="type">${inferType(val)} • ${prettyBytes((val || '').length)}</div>
      `;

      const ctr = document.createElement('div');
      ctr.style.display = 'flex';
      ctr.style.gap = '8px';
      ctr.style.flexWrap = 'wrap';
      ctr.style.alignItems = 'center';

      const sw = document.createElement('div');
      sw.className = 'switch' + (!dis.has(key) ? ' on' : '');
      sw.title = !dis.has(key) ? 'Desativar' : 'Ativar';
      sw.addEventListener('click', () => toggleDisabled(key));

      const bEdit = document.createElement('button');
      bEdit.innerHTML = '<i>✎</i> Editar';
      bEdit.addEventListener('click', () => {
        const next = prompt(`Editar valor de\n${key}`, val ?? '');
        if (next == null) return;
        localStorage.setItem(key, String(next));
        renderAll();
      });

      const bDel = document.createElement('button');
      bDel.innerHTML = '<i>🗑</i> Apagar';
      bDel.addEventListener('click', () => {
        if (confirm('Apagar ' + key + '?')) {
          localStorage.removeItem(key);
          renderAll();
        }
      });

      ctr.append(sw, bEdit, bDel);

      if (inferType(val) === 'image') {
        const bImg = document.createElement('button');
        bImg.innerHTML = '<i>🖼</i> Ver imagem';
        bImg.addEventListener('click', () => addImagePreview(key, val));
        ctr.append(bImg);
      }

      head.append(left, ctr);

      const v = document.createElement('div');
      v.className = 'val';
      v.textContent = inferType(val).startsWith('json')
        ? JSON.stringify(JSON.parse(val), null, 2)
        : (val ?? '—');

      it.append(head, v);
      list.append(it);
    });
  }

  function renderAll() {
    renderPresets();
    renderLS();
  }

  // ========== AÇÕES DO MODAL ==========
  function openModal() {
    modalDiv.classList.add('open');
    modalDiv.setAttribute('aria-hidden', 'false');
    renderAll();
  }

  function closeModal() {
    modalDiv.classList.remove('open');
    modalDiv.setAttribute('aria-hidden', 'true');
  }

  function exportLS() {
    const dump = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === DISABLED_KEY) continue;
      dump[k] = localStorage.getItem(k);
    }
    saveFile('localstorage_export.json', JSON.stringify(dump, null, 2));
  }

  function importLS(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result || '{}');
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, String(v)));
        alert('Importado com sucesso.');
        renderAll();
      } catch (e) {
        alert('JSON inválido.');
      }
    };
    reader.readAsText(file);
  }

  function clearDisabled() {
    localStorage.setItem(DISABLED_KEY, '[]');
    renderAll();
  }

  // ========== INICIALIZAÇÃO DO APP ==========
  function renderApp() {
    appDiv.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <button id="baulite-btnOpenLS" class="open-ls-btn" title="Abrir painel" aria-label="Abrir painel">
        <i>📦</i>
      </button>
      <div class="small">Baú Lite pronto.</div>
    `;
    appDiv.appendChild(card);

    $('#baulite-btnOpenLS', root).addEventListener('click', openModal);
  }

  // ========== SEEDS (dados de exemplo) ==========
  function seedData() {
    if (localStorage.getItem('__baulite_seeded__')) return;
    localStorage.setItem('infodose:userName', 'KODUX');
    localStorage.setItem('infodose:assistantName', 'Dual Infodose');
    localStorage.setItem('uno:theme', 'nebula');
    localStorage.setItem('gallery:img1', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=640');
    localStorage.setItem('feature:ritual:enabled', 'true');
    localStorage.setItem(LS_KEYS.HTML, '<div class="demo"><h1>Hello Nebula</h1><p>Baú Lite</p></div>');

    const demoSKs = ['sk-demo-AAA111', 'sk-demo-BBB222', 'sk-demo-CCC333'];
    localStorage.setItem(LS_KEYS.SKS, JSON.stringify(demoSKs));
    localStorage.setItem(LS_KEYS.SK_ACTIVE, demoSKs[0]);

    const demoSig = `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><circle cx='13' cy='13' r='12' fill='none' stroke='#ff52e5' stroke-width='2'/><path d='M4 16 L13 4 L22 16 L13 22 Z' fill='none' stroke='#00c5e5' stroke-width='2'/></svg>`;
    localStorage.setItem(LS_KEYS.USER_SYMBOL, demoSig);

    localStorage.setItem('__baulite_seeded__', '1');
  }

  // ========== EVENT LISTENERS ==========
  function bindEvents() {
    $('#baulite-lsClose', root).addEventListener('click', closeModal);
    modalDiv.addEventListener('click', (e) => {
      if (e.target === modalDiv) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalDiv.classList.contains('open')) closeModal();
    });

    $('#baulite-lsRescan', root).addEventListener('click', renderAll);
    $('#baulite-lsExport', root).addEventListener('click', exportLS);
    $('#baulite-lsImportFile', root).addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) importLS(f);
      e.target.value = '';
    });
    $('#baulite-lsClearDisabled', root).addEventListener('click', clearDisabled);

    window.addEventListener('storage', renderAll);
  }

  // ========== EXECUÇÃO ==========
  seedData();
  renderApp();
  bindEvents();

  console.log('🎒 Baú Lite embarcado! Clique no botão flutuante para abrir.');
})();
