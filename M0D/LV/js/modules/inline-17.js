
(()=>{'use strict';
if (window.__KOBLLUX_HOTFIX_BUNDLE_V1__) return;
window.__KOBLLUX_HOTFIX_BUNDLE_V1__ = true;

/* ========= Helpers ========= */
const $ = (q, r=document)=>r.querySelector(q);

/* Biblioteca (Stacks) */
function _libLoad(){ try{ return JSON.parse(localStorage.getItem('tl_library_v1')||'[]'); }catch{ return []; } }
function _libSave(arr){ localStorage.setItem('tl_library_v1', JSON.stringify(arr)); }
function _upsertDoc(doc){
  const arr = _libLoad();
  const idx = arr.findIndex(d => d.id === doc.id);
  if (idx >= 0) arr[idx] = doc; else arr.unshift(doc);
  _libSave(arr);
}

/* Render helper (não quebra se autoBuild não existir) */
async function _openText(md){
  window.__current_md = md || '';
  if (typeof autoBuild === 'function') autoBuild(md);
}

/* ========= 1) Exportar .md (iOS/Safari-safe) ========= */
window.exportMD = function(){
  const md = (typeof buildMDFromDOM === 'function' ? buildMDFromDOM() : (window.__current_md || ''));
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  const base = (window.__current_title || 'export').replace(/[\\\/:*?"<>|]+/g,'-').slice(0,80) || 'export';
  a.download = base + '.md';
  a.href = URL.createObjectURL(blob);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1200);
  if (window.toast) toast('.md exportado');
};

/* ========= 2) Upload cria novo contexto (sem sobrescrever) ========= */
const _fi = document.getElementById('fileInput');
if (_fi && !_fi.dataset._ctxFix){
  _fi.dataset._ctxFix = '1';
  _fi.addEventListener('change', async (e)=>{
    const f = e.target.files?.[0];
    if (!f) return;
    const prev = document.getElementById('filePreview');
    if (prev) prev.textContent = 'Lendo ' + f.name + '...';

    // Zera o contexto para evitar sobrescrita no Salvar
    window.__current_doc_id = null;
    window.__current_title  = (f.name || 'Documento').replace(/\.(pdf|txt|md|markdown|html|htm)$/i, '');

    // PDF (se pdfjsLib estiver disponível)
    if (/\.(pdf)$/i.test(f.name) && window.pdfjsLib){
      try{
        const buf = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        let txt = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i);
          const c = await p.getTextContent();
          txt += c.items.map(it => it.str).join(' ') + '\n';
        }
        await _openText(txt);
      }catch(err){
        console.warn('[upload pdf] falhou:', err);
        await _openText(''); if (window.toast) toast('Falha ao ler PDF');
      }
    } else {
      // Demais extensões: lê como texto
      const txt = await f.text();
      await _openText(txt);
    }
  }, { capture: true });
}

/* ========= 3) Salvar vira update quando há __current_doc_id ========= */
(function(){
  window.saveCurrent = function(){
    const md = (typeof getCurrentMarkdown === 'function' ? getCurrentMarkdown() : (window.__current_md || ''));
    const ti = document.getElementById('docTitle');
    const titleFromH1 = md.match(/^\s*#\s+(.+)$/m)?.[1];
    const title = (ti && ti.value.trim()) || titleFromH1 || (window.__current_title || 'Sem título');
    const now = new Date().toISOString();

    const arr = _libLoad();
    const existing = arr.find(d => d.id === window.__current_doc_id);
    const id = window.__current_doc_id || (self.crypto?.randomUUID ? ('doc_' + crypto.randomUUID()) : ('doc_' + Date.now()));

    const doc = {
      id,
      title,
      md,
      bytes: md.length,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    _upsertDoc(doc);
    window.__current_doc_id = id;   // fixa o contexto
    window.__current_title  = title;
    localStorage.setItem('tl_last_doc_id', id);
    if (window.toast) toast(existing ? 'Atualizado em Stacks' : 'Salvo em Stacks');
  };
})();

/* ========= 4) Patches de ações (Stacks) ========= */
if (window.ACTIONS && !window.ACTIONS.__koblluxFixed){
  // open-doc: abre do acervo e seta contexto para update
  const _oldOpen = window.ACTIONS['open-doc'];
  window.ACTIONS['open-doc'] = function(el){
    const id = el?.dataset?.id;
    const doc = _libLoad().find(d => d.id === id);
    if (!doc) return;
    window.__current_doc_id = id;
    window.__current_title  = doc.title || '';
    window.__current_md     = doc.md || '';
    _openText(doc.md);
  };

  // md-doc: exporta .md (iOS-safe)
  window.ACTIONS['md-doc'] = function(el){
    const id = el?.dataset?.id;
    const doc = _libLoad().find(d => d.id === id);
    if (!doc) return;
    const blob = new Blob([doc.md||''], { type:'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.download = (doc.title || 'documento') + '.md';
    a.href = URL.createObjectURL(blob);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1200);
  };

  window.ACTIONS.__koblluxFixed = true;
}

/* ========= 5) Opcional: limpar SW + caches (PWA hard refresh) ========= */
window.forceHardRefresh = function(){
  (async()=>{
    try{
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }catch{}
    if ('serviceWorker' in navigator){
      try{
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }catch{}
    }
    location.reload();
  })();
};
})();
