
(function(){
  'use strict';

  /* ====== CONFIG / STORAGE KEYS ====== */
  const STORAGE = {
    USER_NAME: 'tl_user_name',
    DI_USER_NAME: 'di_userName',
    LIB: 'tl_library_v1'
  };

  const DEFAULT_ROOT_SELECTOR = '#root';
  const ROOT_ID = 'kob_welcome_root';
  const STYLE_ID = 'kob-welcome-styles-v1';

  /* ====== UTIL HELPERS ====== */
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function nowISO(){ return new Date().toISOString(); }

  function analyzeMD(md){
    // lightweight analyzer: word count + headings
    const txt = String(md||'').replace(/[#_*`]/g,' ');
    const words = txt.trim().split(/\s+/).filter(Boolean).length;
    const headings = (String(md||'').match(/^\s*#+\s+/gm) || []).length;
    return { words, headings };
  }

  function safeParseJSON(s, fallback=[]){
    try{ return JSON.parse(s||'') || fallback; }catch(e){ return fallback; }
  }

  /* ====== LIB LOAD / SAVE ====== */
  function libLoad(){
    const raw = localStorage.getItem(STORAGE.LIB);
    const arr = safeParseJSON(raw, []);
    // ensure consistent shape (id, title, md, createdAt, updatedAt)
    return arr.map(item => Object.assign({
      id: item.id || ('doc_' + Math.random().toString(36).slice(2,9)),
      title: item.title || 'Sem título',
      md: item.md || '',
      createdAt: item.createdAt || item.createdAt === 0 ? item.createdAt : (item.createdAt || item.updatedAt || nowISO()),
      updatedAt: item.updatedAt || item.updatedAt === 0 ? item.updatedAt : (item.updatedAt || nowISO())
    }, item));
  }

  function libSave(arr){
    try{
      localStorage.setItem(STORAGE.LIB, JSON.stringify(arr));
      return true;
    }catch(e){ console.warn('libSave failed', e); return false; }
  }

  function libAdd(doc){
    const arr = libLoad();
    arr.unshift(Object.assign({
      id: 'doc_' + Math.random().toString(36).slice(2,9),
      title: doc.title || 'Sem título',
      md: doc.md || '',
      createdAt: nowISO(),
      updatedAt: nowISO()
    }, doc));
    libSave(arr);
    return arr[0];
  }

  function libRemove(id){
    let arr = libLoad();
    arr = arr.filter(x => x.id !== id);
    libSave(arr);
    return arr;
  }

  /* ====== CSS (namespaced to avoid override) ====== */
  if(!document.getElementById(STYLE_ID)){
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
/* kob-welcome (namespaced; won't clash com .welcome) */
.kob-welcome{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
  border-radius:14px;padding:12px;margin:12px 0; color:var(--text, #f0f3f9)}
.kob-welcome .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.kob-welcome .field{width:min(360px,100%);border:1px solid rgba(255,255,255,.12);background:#0a0e18;
  color:var(--ink, #e6eef8);border-radius:10px;padding:8px 10px}
.kob-welcome .small{font-size:.9rem;color:var(--muted, rgba(255,255,255,.45))}
.kob-welcome .equation{white-space:pre-wrap}
.kob-welcome .stack-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px}
.kob-welcome .stack-card{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(255,255,255,.03)}
.kob-welcome .stack-card h4{margin:0 0 6px 0}
.kob-welcome .stack-card .meta{font-size:.85rem;color:var(--muted, rgba(255,255,255,.45));margin-bottom:8px}
.kob-welcome .btn{background:transparent;border:1px solid rgba(255,255,255,.08);padding:8px 10px;border-radius:8px;color:var(--text);cursor:pointer}
.kob-welcome .btn:active{transform:scale(.98);}
/* small responsive */
@media (max-width:640px){ .kob-welcome .row{flex-direction:column} .kob-welcome .field{width:100%} }
    `;
    document.head.appendChild(style);
  }

  /* ====== RENDER FUNCTION ====== */
  function renderWelcome(options = {}){
    const rootSelector = options.rootSelector || DEFAULT_ROOT_SELECTOR;
    const host = document.querySelector(rootSelector);
    if(!host){
      console.warn('WELCOME: root not found:', rootSelector);
      return;
    }
    // create a safe container (avoid clobbering existing important content)
    let container = host.querySelector('#' + ROOT_ID);
    if(!container){
      container = document.createElement('div');
      container.id = ROOT_ID;
      host.prepend(container);
    }

    const name = localStorage.getItem(STORAGE.USER_NAME) || localStorage.getItem(STORAGE.DI_USER_NAME) || '';
    const stacks = libLoad();

    const cards = stacks.map(d => {
      const a = analyzeMD(d.md);
      const dt = new Date(d.updatedAt||d.createdAt||Date.now()).toLocaleString();
      return `
    <div class="stack-card" data-id="${escapeHtml(d.id)}">
      <h4>${escapeHtml(d.title||'Sem título')}</h4>
      <div class="meta">${escapeHtml(dt)} · ${a.words} palavras</div>
      <div class="row">
        <button class="btn" data-action="open-doc" data-id="${escapeHtml(d.id)}">Abrir</button>
        <button class="btn" data-action="md-doc" data-id="${escapeHtml(d.id)}">Exportar .md</button>
        <button class="btn" data-action="del-doc" data-id="${escapeHtml(d.id)}">Excluir</button>
      </div>
    </div>`;
    }).join('');

    container.innerHTML = `
  <details class="acc kob-acc" open>
    <summary><h2 style="display:inline-flex;align-items:center;gap:8px;margin:0">👋 Boas-vindas${name? (', '+escapeHtml(name)) : ''}</h2></summary>
    <div class="sec">
      <div class="kob-welcome" role="region" aria-label="Painel de boas vindas">
        <div class="row" style="gap:8px;align-items:center;">
          <input id="kob_welcome_name" class="field" placeholder="Seu nome" value="${escapeHtml(name)}" />
          <button class="btn" data-action="save-name">Salvar nome</button>
          <button class="btn" data-action="importar">Enviar Documento</button>
          <button class="btn" data-action="demo">Gerar Demo</button>
        </div>
        <div class="small" style="margin-top:8px">Stacks salvos no dispositivo:</div>
        <div class="stack-grid">${cards || '<div class="small" style="opacity:.8">Sem documentos salvos ainda.</div>'}</div>
      </div>
    </div>
  </details>
    `;

    // attach file input (one per container) for importar
    if(!container._fileInput){
      const fi = document.createElement('input');
      fi.type = 'file';
      fi.accept = '.md, text/markdown, text/plain';
      fi.style.display = 'none';
      fi.addEventListener('change', async (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if(!f) return;
        const txt = await f.text().catch(()=>null);
        if(!txt) return toast('Arquivo vazio ou não suportado');
        const title = f.name.replace(/\.[^/.]+$/, '');
        libAdd({ title, md: txt });
        toast('Documento importado');
        renderWelcome({rootSelector});
      });
      container.appendChild(fi);
      container._fileInput = fi;
    }
  }

  /* ====== ACTION HANDLERS (delegation) ====== */
  document.addEventListener('click', function(ev){
    const btn = ev.target.closest && ev.target.closest('.btn, [data-action]');
    if(!btn) return;
    const action = btn.dataset.action;
    if(!action) return;
    // find nearest root container to scope actions
    const host = document.getElementById(ROOT_ID);
    if(!host) return;

    // actions:
    if(action === 'save-name'){
      const el = host.querySelector('#kob_welcome_name');
      const v = el && el.value ? el.value.trim() : '';
      if(v){
        localStorage.setItem(STORAGE.USER_NAME, v);
        toast('Nome salvo');
      } else {
        localStorage.removeItem(STORAGE.USER_NAME);
        toast('Nome limpo');
      }
      renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR });
      return;
    }

    if(action === 'importar'){
      // trigger hidden file input
      const fi = host._fileInput;
      if(fi) fi.click();
      else toast('Import não disponível');
      return;
    }

    if(action === 'demo'){
      // quick demo item
      const sample = {
        title: 'Demo — ' + (new Date()).toLocaleString(),
        md: '# Demo\n\nEste é um documento de demonstração gerado automaticamente.',
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      libAdd(sample);
      toast('Demo gerado');
      renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR });
      return;
    }

    if(action === 'open-doc' || action === 'md-doc' || action === 'del-doc'){
      const id = btn.dataset.id;
      if(!id){ toast('ID ausente'); return; }
      const lib = libLoad();
      const item = lib.find(x => x.id === id);
      if(!item){ toast('Documento não encontrado'); renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR }); return; }

      if(action === 'open-doc'){
        // prefer using app-specific open handler if present
        if(window.WELCOME_OPEN_DOC && typeof window.WELCOME_OPEN_DOC === 'function'){
          window.WELCOME_OPEN_DOC(item);
        } else {
          // fallback: open new window with markdown rendered crude
          const w = window.open('about:blank','_blank');
          const html = `<html><head><title>${escapeHtml(item.title)}</title></head><body><pre>${escapeHtml(item.md)}</pre></body></html>`;
          w.document.write(html); w.document.close();
        }
        return;
      }

      if(action === 'md-doc'){
        // download .md
        const blob = new Blob([item.md || ''], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (item.title || 'export') + '.md';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('Exportando .md');
        return;
      }

      if(action === 'del-doc'){
        // delete with confirmation
        if(!confirm('Excluir "' + (item.title || 'Sem título') + '"?')) return;
        libRemove(id);
        toast('Excluído');
        renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR });
        return;
      }
    }

    // fallback: unknown action
  }, {passive:true});

  /* ====== small toast util (local, safe) ====== */
  function toast(msg, ms=1200){
    // try use existing global toast; otherwise create small one
    if(window.toast && typeof window.toast === 'function'){ try{ window.toast(msg, ms); return; }catch(e){} }
    let el = document.getElementById('kob_welcome_toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'kob_welcome_toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:rgba(0,0,0,.7);color:#fff;z-index:999999;font-size:13px;opacity:0;transition:opacity .22s';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(()=> el.style.opacity = '0', ms);
  }

  /* ====== expose API requested: getSavedConstants + init ====== */
  window.WELCOME_API = window.WELCOME_API || {};
  window.WELCOME_API.getSavedConstants = function(){
    return {
      tl_user_name: localStorage.getItem(STORAGE.USER_NAME),
      di_userName: localStorage.getItem(STORAGE.DI_USER_NAME),
      tl_library_v1: safeParseJSON(localStorage.getItem(STORAGE.LIB), [])
    };
  };

  window.WELCOME_API.render = function(opts){ renderWelcome(opts || {}); };
  window.WELCOME_API.libLoad = libLoad;
  window.WELCOME_API.libSave = libSave;
  window.WELCOME_API.libAdd = libAdd;
  window.WELCOME_API.libRemove = libRemove;

  /* ====== Auto-init on DOM ready (safe) ====== */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR }));
  } else {
    renderWelcome({ rootSelector: DEFAULT_ROOT_SELECTOR });
  }

})();
