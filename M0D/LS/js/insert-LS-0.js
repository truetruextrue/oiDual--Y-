(function(){
  'use strict';

  // ---------- CONFIGURAÇÕES ----------
  const DISABLED_KEY = 'infodose:presets.disabled';
  const LS_KEYS = {
    HTML:'lastHTML',
    COLL:'nebula_collapsed',
    USER_SYMBOL:'userSymbol',
    SKS:'openrouter_keys',
    SK_ACTIVE:'openrouter_active'
  };

  const PRESETS = [
    { key:'infodose:userName', label:'Usuário' },
    { key:'infodose:assistantName', label:'Assistente' },
    { key:'dual.keys.openrouter', label:'Chave OpenRouter (legacy)' },
    { key:'dual.openrouter.model', label:'Modelo OpenRouter' },
    { key:'uno:theme', label:'Tema' },
    { key:'uno:bg', label:'Fundo Custom' },
    { key:'infodose:cssCustom', label:'CSS Custom' },
    { key:'infodose:voices', label:'Vozes Arquetípicas' }
  ];

  // ---------- INJEÇÃO DE ESTILOS ----------
  const style = document.createElement('style');
  style.textContent = `
    /* === BAU EMBED STYLES === */
    .bau-float-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 52px;
      height: 52px;
      border-radius: 30px;
      background: linear-gradient(145deg, #ff52e5, #00c5e5);
      border: none;
      box-shadow: 0 12px 28px rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2147483640;
      transition: transform 0.2s, box-shadow 0.2s;
      color: white;
      padding: 0;
    }
    .bau-float-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 16px 32px rgba(0,0,0,0.5);
    }
    .bau-float-btn svg {
      width: 26px;
      height: 26px;
      stroke: white;
      stroke-width: 2;
      fill: none;
    }

    .bau-modal {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(10px);
      z-index: 2147483641;
      padding: 16px;
      font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
    }
    .bau-modal.bau-open { display: flex; }

    .bau-panel {
      width: min(1000px, 96vw);
      max-height: 88vh;
      background: rgba(12, 15, 28, 0.96);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 28px;
      box-shadow: 0 25px 50px -8px black;
      padding: 18px 20px;
      color: #f0f3fa;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .bau-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .bau-ttl {
      font-weight: 800;
      letter-spacing: 0.5px;
      font-size: 1.35rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .bau-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .bau-btn {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      padding: 8px 14px;
      border-radius: 40px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
      backdrop-filter: blur(4px);
    }
    .bau-btn:hover { background: rgba(255,255,255,0.2); }
    .bau-btn-ghost {
      background: transparent;
      border: 1px dashed rgba(255,255,255,0.3);
    }
    .bau-meta {
      font-size: 0.8rem;
      opacity: 0.8;
      margin: 10px 0 12px;
    }

    /* presets */
    .bau-presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 12px;
      margin: 12px 0 8px;
    }
    .bau-preset-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 12px;
    }
    .bau-preset-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .bau-preset-label { font-weight: 600; font-size: 0.9rem; }
    .bau-preset-key { font-size: 0.7rem; opacity: 0.7; }
    .bau-switch {
      width: 48px;
      height: 28px;
      background: rgba(255,255,255,0.15);
      border-radius: 40px;
      border: 1px solid rgba(255,255,255,0.2);
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .bau-switch::after {
      content: "";
      position: absolute;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 3px;
      transition: left 0.2s;
    }
    .bau-switch.bau-on {
      background: rgba(57, 255, 182, 0.25);
    }
    .bau-switch.bau-on::after { left: 23px; }

    .bau-val-preview {
      font-family: 'SF Mono', 'Menlo', monospace;
      background: #06090f;
      padding: 8px 10px;
      border-radius: 12px;
      margin-top: 8px;
      font-size: 0.75rem;
      word-break: break-word;
      max-height: 100px;
      overflow: auto;
      border: 1px solid rgba(255,255,255,0.05);
    }

    /* lista principal */
    .bau-list {
      display: grid;
      gap: 12px;
      margin-top: 6px;
    }
    .bau-item {
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 14px;
    }
    .bau-item-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .bau-key {
      font-weight: 700;
      word-break: break-word;
    }
    .bau-key small { opacity: 0.6; font-weight: 400; margin-left: 6px; }
    .bau-type {
      font-size: 0.7rem;
      opacity: 0.7;
    }
    .bau-item-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .bau-item-value {
      background: #04070c;
      border-radius: 12px;
      padding: 10px;
      font-family: monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 140px;
      overflow: auto;
      border: 1px solid #1f2a3a;
    }

    .bau-img-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .bau-img-card {
      background: rgba(255,255,255,0.03);
      border-radius: 14px;
      padding: 8px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .bau-img-card img {
      width: 100%;
      border-radius: 10px;
      display: block;
    }

    .bau-file-input { display: none; }
    .bau-close-icon { font-size: 20px; line-height: 1; }
    summary { cursor: pointer; font-weight: 600; margin: 6px 0; }
    details { margin-bottom: 8px; }
  `;
  document.head.appendChild(style);

  // ---------- ÍCONES SVG EMBUTIDOS (sem dependência externa) ----------
  const icons = {
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4"/></svg>',
    refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
    upload: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    eraser: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20H7l-4-4 9-9 9 9-1 4z"/><path d="M7 20l-4-4"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  // ---------- UTILITÁRIOS ----------
  function prettyBytes(n) {
    if (!Number.isFinite(n) || n <= 0) return '0 B';
    const u = ['B','KB','MB','GB'];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
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
      return 'json[' + typeof p + ']';
    }
    if (/^data:image\//i.test(v) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(v)) return 'image';
    if (/^(true|false|1|0)$/i.test(v)) return 'boolean-like';
    if (/^https?:\/\//i.test(v)) return 'url';
    if (/^data:/i.test(v)) return 'data-url';
    return 'string';
  }

  // ---------- SEEDS (opcional, mas mantém demo) ----------
  if (!localStorage.getItem('__baulite_seeded__')) {
    localStorage.setItem('infodose:userName','KODUX');
    localStorage.setItem('infodose:assistantName','KOBLLUX');
    localStorage.setItem('uno:theme','nebula');
    localStorage.setItem('gallery:img1','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=640');
    localStorage.setItem('feature:ritual:enabled','true');
    localStorage.setItem(LS_KEYS.HTML,'<div class="demo"><h1>Hello Nebula</h1><p>Baú Lite</p></div>');
    const demoSKs = ['di_apiKey','apiKey','sk-demo-CCC333'];
    localStorage.setItem(LS_KEYS.SKS, JSON.stringify(demoSKs));
    localStorage.setItem(LS_KEYS.SK_ACTIVE, demoSKs[0]);
    localStorage.setItem(LS_KEYS.USER_SYMBOL, `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><circle cx='13' cy='13' r='12' fill='none' stroke='#ff52e5' stroke-width='2'/><path d='M4 16 L13 4 L22 16 L13 22 Z' fill='none' stroke='#00c5e5' stroke-width='2'/></svg>`);
    localStorage.setItem('__baulite_seeded__','1');
  }

  // ---------- CRIA ELEMENTOS ----------
  // Botão flutuante
  const floatBtn = document.createElement('button');
  floatBtn.className = 'bau-float-btn';
  floatBtn.setAttribute('aria-label', 'Abrir Baú Lite');
  floatBtn.innerHTML = icons.box;
  document.body.appendChild(floatBtn);

  // Modal
  const modal = document.createElement('div');
  modal.className = 'bau-modal';
  modal.innerHTML = `
    <div class="bau-panel">
      <div class="bau-hdr">
        <div class="bau-ttl">📦 Dual · LocalStorage</div>
        <div class="bau-actions">
          <button class="bau-btn" id="bau-rescan">${icons.refresh} Re-scan</button>
          <button class="bau-btn" id="bau-export">${icons.upload} Exportar</button>
          <label class="bau-btn">
            ${icons.download} Importar
            <input type="file" id="bau-import-file" accept="application/json" style="display:none;">
          </label>
          <button class="bau-btn bau-btn-ghost" id="bau-clear-disabled">${icons.eraser} Limpar desativados</button>
          <button class="bau-btn" id="bau-close">${icons.x} Fechar</button>
        </div>
      </div>

      <details open>
        <summary><strong>🎛️ Presets (ON/OFF)</strong></summary>
        <div class="bau-presets-grid" id="bau-presetsGrid"></div>
      </details>

      <div class="bau-meta"><span id="bau-count">—</span> • <span id="bau-size">—</span></div>
      <div class="bau-list" id="bau-listContainer"></div>

      <details open style="margin-top:16px">
        <summary><strong>🖼️ Pré‑visualização de imagens</strong></summary>
        <div class="bau-img-grid" id="bau-imgGrid"></div>
      </details>
    </div>
  `;
  document.body.appendChild(modal);

  // Elemento auxiliar para download
  const downloader = document.createElement('a');
  downloader.style.display = 'none';
  document.body.appendChild(downloader);

  // Referências
  const presetsGrid = document.getElementById('bau-presetsGrid');
  const listContainer = document.getElementById('bau-listContainer');
  const imgGrid = document.getElementById('bau-imgGrid');
  const countSpan = document.getElementById('bau-count');
  const sizeSpan = document.getElementById('bau-size');
  const importFile = document.getElementById('bau-import-file');
  const closeBtn = document.getElementById('bau-close');
  const rescanBtn = document.getElementById('bau-rescan');
  const exportBtn = document.getElementById('bau-export');
  const clearDisabledBtn = document.getElementById('bau-clear-disabled');

  // ---------- LÓGICA DE ESTADO ----------
  function disabledSet() {
    try { return new Set(JSON.parse(localStorage.getItem(DISABLED_KEY) || '[]')); }
    catch { return new Set(); }
  }
  function saveDisabled(set) {
    localStorage.setItem(DISABLED_KEY, JSON.stringify(Array.from(set)));
  }
  function toggleDisabled(key) {
    const s = disabledSet();
    s.has(key) ? s.delete(key) : s.add(key);
    saveDisabled(s);
    renderAll();
  }

  function lsEntries() {
    const out = [];
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i);
      out.push({ key: k, val: localStorage.getItem(k) || '' });
    }
    return out.sort((a,b) => a.key.localeCompare(b.key));
  }

  function lsSizeBytes() {
    let sum = 0;
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      sum += k.length + v.length;
    }
    return sum;
  }

  function renderPresets() {
    if (!presetsGrid) return;
    presetsGrid.innerHTML = '';
    const dis = disabledSet();
    PRESETS.forEach(p => {
      const val = localStorage.getItem(p.key);
      const on = !dis.has(p.key);
      const card = document.createElement('div');
      card.className = 'bau-preset-card';
      card.innerHTML = `
        <div class="bau-preset-row">
          <div><span class="bau-preset-label">${p.label}</span><div class="bau-preset-key">${p.key}</div></div>
          <div class="bau-switch ${on ? 'bau-on' : ''}" data-key="${p.key}"></div>
        </div>
        <div class="bau-val-preview">${val ? (isJson(val) ? JSON.stringify(JSON.parse(val), null, 2) : val) : '—'}</div>
      `;
      card.querySelector('.bau-switch').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDisabled(p.key);
      });
      presetsGrid.appendChild(card);
    });
  }

  function renderLS() {
    if (!listContainer) return;
    listContainer.innerHTML = '';
    if (imgGrid) imgGrid.innerHTML = '';
    const entries = lsEntries();
    countSpan.textContent = entries.length + ' chave(s)';
    sizeSpan.textContent = prettyBytes(lsSizeBytes());
    const dis = disabledSet();

    entries.forEach(({key, val}) => {
      if (key === DISABLED_KEY) return;
      const item = document.createElement('div');
      item.className = 'bau-item';

      const head = document.createElement('div');
      head.className = 'bau-item-head';

      const left = document.createElement('div');
      left.innerHTML = `
        <div class="bau-key">${key} ${dis.has(key) ? '<small>(desativado)</small>' : ''}</div>
        <div class="bau-type">${inferType(val)} · ${prettyBytes((val||'').length)}</div>
      `;

      const actions = document.createElement('div');
      actions.className = 'bau-item-actions';

      const sw = document.createElement('div');
      sw.className = `bau-switch ${!dis.has(key) ? 'bau-on' : ''}`;
      sw.addEventListener('click', (e) => { e.stopPropagation(); toggleDisabled(key); });

      const editBtn = document.createElement('button');
      editBtn.className = 'bau-btn';
      editBtn.innerHTML = icons.edit + ' Editar';
      editBtn.addEventListener('click', () => {
        const next = prompt(`Editar "${key}"`, val || '');
        if (next !== null) { localStorage.setItem(key, String(next)); renderAll(); }
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'bau-btn';
      delBtn.innerHTML = icons.trash + ' Apagar';
      delBtn.addEventListener('click', () => {
        if (confirm(`Apagar "${key}"?`)) { localStorage.removeItem(key); renderAll(); }
      });

      actions.appendChild(sw);
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      if (inferType(val) === 'image') {
        const imgBtn = document.createElement('button');
        imgBtn.className = 'bau-btn';
        imgBtn.innerHTML = icons.image + ' Preview';
        imgBtn.addEventListener('click', () => addImagePreview(key, val));
        actions.appendChild(imgBtn);
      }

      head.appendChild(left);
      head.appendChild(actions);

      const valDiv = document.createElement('div');
      valDiv.className = 'bau-item-value';
      valDiv.textContent = isJson(val) ? JSON.stringify(JSON.parse(val), null, 2) : (val || '—');

      item.appendChild(head);
      item.appendChild(valDiv);
      listContainer.appendChild(item);
    });
  }

  function addImagePreview(key, src) {
    if (!imgGrid) return;
    const card = document.createElement('div');
    card.className = 'bau-img-card';
    card.innerHTML = `<div style="font-size:11px; opacity:0.7; margin-bottom:4px;">${key}</div>`;
    const img = new Image();
    img.src = src;
    img.loading = 'lazy';
    card.appendChild(img);
    imgGrid.appendChild(card);
  }

  function exportLS() {
    const dump = {};
    for (let i=0; i<localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === DISABLED_KEY) continue;
      dump[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    downloader.href = url;
    downloader.download = 'baulite_export.json';
    downloader.click();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function importLS(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        Object.entries(data).forEach(([k,v]) => localStorage.setItem(k, String(v)));
        alert('Importado com sucesso.');
        renderAll();
      } catch (e) { alert('JSON inválido.'); }
    };
    reader.readAsText(file);
  }

  function clearDisabled() {
    localStorage.setItem(DISABLED_KEY, '[]');
    renderAll();
  }

  function renderAll() {
    renderPresets();
    renderLS();
  }

  // ---------- EVENTOS ----------
  floatBtn.addEventListener('click', () => {
    modal.classList.add('bau-open');
    renderAll();
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('bau-open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('bau-open'); });

  rescanBtn.addEventListener('click', renderAll);
  exportBtn.addEventListener('click', exportLS);
  clearDisabledBtn.addEventListener('click', clearDisabled);

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importLS(file);
    importFile.value = '';
  });

  // Atualiza se houver mudança externa (storage event)
  window.addEventListener('storage', renderAll);

  // Atalho: ESC fecha
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.remove('bau-open'); });

})();
