
(() => {
  'use strict';

  const STORAGE = {
    USER_NAME: 'tl_user_name',
    DI_USER_NAME: 'di_userName',
    LIB: 'tl_library_v1'
  };

  // helpers
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const nowISO = () => new Date().toISOString();
  function safeParse(s, fallback = []) { try { return JSON.parse(s||'') || fallback; } catch(e){ return fallback; } }

  // lib operations
  function libLoad(){ return safeParse(localStorage.getItem(STORAGE.LIB), []).map(item => Object.assign({
      id: item.id || ('doc_'+Math.random().toString(36).slice(2,9)),
      title: item.title || 'Sem título',
      md: item.md || '',
      createdAt: item.createdAt || item.updatedAt || nowISO(),
      updatedAt: item.updatedAt || nowISO()
    }, item));
  }
  function libSave(arr){ try { localStorage.setItem(STORAGE.LIB, JSON.stringify(arr)); return true; } catch(e){ console.warn(e); return false; } }
  function libAdd(doc){ const a = libLoad(); const n = Object.assign({ id:'doc_'+Math.random().toString(36).slice(2,9), createdAt: nowISO(), updatedAt: nowISO() }, doc); a.unshift(n); libSave(a); return n; }
  function libRemove(id){ const a = libLoad().filter(x => x.id !== id); libSave(a); return a; }

  // lightweight md analyzer
  function analyzeMD(md=''){ const txt = String(md).replace(/[#_*`]/g,' '); const words = txt.trim().split(/\s+/).filter(Boolean).length; return {words}; }

  // central global API (idempotent)
  window.WELCOME_API = window.WELCOME_API || {};
  window.WELCOME_API.getSavedConstants = () => ({
    tl_user_name: localStorage.getItem(STORAGE.USER_NAME),
    di_userName: localStorage.getItem(STORAGE.DI_USER_NAME),
    tl_library_v1: safeParse(localStorage.getItem(STORAGE.LIB), [])
  });

  // The Web Component
  class KobWelcome extends HTMLElement {
    constructor(){
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._rootId = 'kob-welcome-root';
      this._fileInput = null;
      this._initTemplate();
    }

    connectedCallback(){
      // render initial
      this.render();
      // delegate clicks inside shadow
      this._shadow.addEventListener('click', this._onClick.bind(this));
    }

    disconnectedCallback(){
      this._shadow.removeEventListener('click', this._onClick.bind(this));
    }

    _initTemplate(){
      const style = `
:host { display:block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui; color:var(--text,#f0f3f9); }
.welcome{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
  border-radius:14px;padding:12px;margin:12px 0; color:var(--text,#f0f3f9)}
.welcome .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.field{width:min(360px,100%);border:1px solid rgba(255,255,255,.12);background:#0a0e18;
  color:var(--ink,#e6eef8);border-radius:10px;padding:8px 10px}
.small{font-size:.9rem;color:var(--muted,rgba(255,255,255,.45))}
.equation{white-space:pre-wrap}
.stack-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:10px}
.stack-card{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(255,255,255,.03)}
.stack-card h4{margin:0 0 6px 0}
.stack-card .meta{font-size:.85rem;color:var(--muted, rgba(255,255,255,.45));margin-bottom:8px}
.btn{background:transparent;border:1px solid rgba(255,255,255,.08);padding:8px 10px;border-radius:8px;color:var(--text);cursor:pointer}
.btn:active{transform:scale(.98)}
.controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px }
@media (max-width:640px){ .welcome .row{flex-direction:column} .field{width:100%} }
      `;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
<style>${style}</style>
<div id="${this._rootId}"></div>
`;
      this._shadow.appendChild(wrapper);
      // file input for import
      this._fileInput = document.createElement('input');
      this._fileInput.type = 'file';
      this._fileInput.accept = '.md,text/markdown,text/plain';
      this._fileInput.style.display = 'none';
      this._fileInput.addEventListener('change', async (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if(!f) return;
        const txt = await f.text().catch(()=>null);
        if(!txt) return this._toast('Arquivo vazio ou não suportado');
        const title = f.name.replace(/\.[^/.]+$/, '');
        libAdd({ title, md: txt });
        this._toast('Documento importado');
        this.render();
      });
      this._shadow.appendChild(this._fileInput);
    }

    render(){
      const host = this._shadow.getElementById(this._rootId);
      if(!host) return;
      const name = localStorage.getItem(STORAGE.USER_NAME) || localStorage.getItem(STORAGE.DI_USER_NAME) || '';
      const stacks = libLoad();

      const cards = stacks.map(d => {
        const a = analyzeMD(d.md);
        const dt = new Date(d.updatedAt||d.createdAt||Date.now()).toLocaleString();
        return `
<div class="stack-card" data-id="${esc(d.id)}">
  <h4>${esc(d.title||'Sem título')}</h4>
  <div class="meta">${esc(dt)} · ${a.words} palavras</div>
  <div class="controls">
    <button class="btn" data-action="open-doc" data-id="${esc(d.id)}">Abrir</button>
    <button class="btn" data-action="export-md" data-id="${esc(d.id)}">Exportar .md</button>
    <button class="btn" data-action="delete-doc" data-id="${esc(d.id)}">Excluir</button>
    <button class="btn" data-action="tts-read" data-id="${esc(d.id)}">Ler (TTS)</button>
  </div>
</div>`;
      }).join('');

      host.innerHTML = `
<details class="acc" open>
  <summary><h2 style="display:inline-flex;align-items:center;gap:8px;margin:0">👋 Boas-vindas${name? (', '+esc(name)) : ''}</h2></summary>
  <div class="sec">
    <div class="welcome" role="region" aria-label="Painel de boas vindas">
      <div class="row" style="gap:8px;align-items:center;">
        <input id="welcomeName" class="field" placeholder="Seu nome" value="${esc(name)}" />
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" data-action="save-name">Salvar nome</button>
          <button class="btn" data-action="import">Enviar Documento</button>
          <button class="btn" data-action="demo">Gerar Demo</button>
        </div>
      </div>
      <div class="small" style="margin-top:8px">Stacks salvos no dispositivo:</div>
      <div class="stack-grid">${cards || '<div class="small" style="opacity:.8">Sem documentos salvos ainda.</div>'}</div>
    </div>
  </div>
</details>
      `;
    }

    _onClick(ev){
      const btn = ev.target.closest && ev.target.closest('[data-action]');
      if(!btn) return;
      const action = btn.dataset.action;
      switch(action){
        case 'save-name': return this._actSaveName();
        case 'import': return this._actImport();
        case 'demo': return this._actDemo();
        case 'open-doc': return this._actOpenDoc(btn.dataset.id);
        case 'export-md': return this._actExportMD(btn.dataset.id);
        case 'delete-doc': return this._actDelete(btn.dataset.id);
        case 'tts-read': return this._actTtsRead(btn.dataset.id);
        default: return;
      }
    }

    _actSaveName(){
      const input = this._shadow.getElementById('welcomeName');
      const v = input && input.value ? input.value.trim() : '';
      if(v) { localStorage.setItem(STORAGE.USER_NAME, v); this._toast('Nome salvo'); }
      else { localStorage.removeItem(STORAGE.USER_NAME); this._toast('Nome limpo'); }
      this.render();
    }

    _actImport(){
      if(this._fileInput) this._fileInput.click();
      else this._toast('Import não disponível');
    }

    _actDemo(){
      libAdd({ title: 'Demo — ' + (new Date()).toLocaleString(), md: '# Demo\n\nDocumento de demonstração.' });
      this._toast('Demo gerado');
      this.render();
    }

    _actOpenDoc(id){
      const item = libLoad().find(x=>x.id===id);
      if(!item){ this._toast('Documento não encontrado'); return; }
      // hook: allow app to handle opening
      if(window.WELCOME_OPEN_DOC && typeof window.WELCOME_OPEN_DOC === 'function'){ window.WELCOME_OPEN_DOC(item); return; }
      // fallback: open raw md in new window
      const w = window.open('', '_blank');
      const html = `<doctype html><html><head><meta charset="utf-8"><title>${esc(item.title)}</title></head><body><pre>${esc(item.md)}</pre></body></html>`;
      w.document.write(html); w.document.close();
    }

    _actExportMD(id){
      const item = libLoad().find(x=>x.id===id);
      if(!item){ this._toast('Documento não encontrado'); return; }
      const blob = new Blob([item.md || ''], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = (item.title || 'export') + '.md';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      this._toast('Exportando .md');
    }

    _actDelete(id){
      const item = libLoad().find(x=>x.id===id);
      if(!item){ this._toast('Documento não encontrado'); return; }
      if(!confirm('Excluir "' + (item.title || 'Sem título') + '"?')) return;
      libRemove(id);
      this._toast('Excluído');
      this.render();
    }

    // TTS integration: try KOBLLUX hooks, then dispatch a global event, then fallback to speechSynthesis
    _actTtsRead(id){
      const item = libLoad().find(x=>x.id===id);
      if(!item){ this._toast('Documento não encontrado'); return; }
      const text = (item.title ? item.title + '\n\n' : '') + (item.md || '');
      this._speakWithDock(text);
    }

    _speakWithDock(text){
      // 1) If the app exposes a speakText function on KOBLLUX
      try {
        if(window.KOBLLUX && typeof window.KOBLLUX.speakText === 'function'){
          window.KOBLLUX.speakText(text);
          return;
        }
        // 2) If there is an API to receive custom event, dispatch it
        const ev = new CustomEvent('kob-tts-request', { detail: { text }, bubbles: true, cancelable: true });
        document.dispatchEvent(ev);
        // Some external listeners might call preventDefault; no guarantee. Still continue to fallback if not handled.
        // 3) Try common KOBLLUX names
        if(window.KOBLLUX && typeof window.KOBLLUX.startSpeech === 'function' && typeof window.KOBLLUX.setExternalText === 'function'){
          // hypothetical: set external text then start
          window.KOBLLUX.setExternalText(text);
          window.KOBLLUX.startSpeech();
          return;
        }
        // 4) If KOBLLUX has readSelection hook, try call it (not ideal)
        if(window.KOBLLUX && typeof window.KOBLLUX.readSelection === 'function'){
          // can't pass arbitrary text — so fallback
        }
      } catch(e){
        console.warn('KOBLLUX integration error', e);
      }

      // 5) fallback to built-in speechSynthesis
      if('speechSynthesis' in window){
        const u = new SpeechSynthesisUtterance(String(text));
        // try find pt voice first
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find(x => /pt/i.test(x.lang)) || voices[0] || null;
        if(v) u.voice = v;
        u.rate = 1.0; u.pitch = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        this._toast('Lendo via SpeechSynthesis (fallback)');
        return;
      }

      this._toast('TTS não disponível');
    }

    _toast(msg, ms=1400){
      // try global toast
      if(window.toast && typeof window.toast === 'function'){ try{ window.toast(msg, ms); return; }catch(e){} }
      // simple local toast inside shadow
      let t = this._shadow.getElementById('kob_welcome_toast');
      if(!t){
        t = document.createElement('div');
        t.id = 'kob_welcome_toast';
        t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:rgba(0,0,0,.7);color:#fff;z-index:999999;font-size:13px;opacity:0;transition:opacity .22s';
        document.body.appendChild(t); // toast attached outside shadow to show over everything
      }
      t.textContent = msg; t.style.opacity = '1';
      clearTimeout(t._t);
      t._t = setTimeout(()=> t.style.opacity = '0', ms);
    }

    // Expose instance API
    getSavedConstants(){ return {
      tl_user_name: localStorage.getItem(STORAGE.USER_NAME),
      di_userName: localStorage.getItem(STORAGE.DI_USER_NAME),
      tl_library_v1: safeParse(localStorage.getItem(STORAGE.LIB), [])
    }; }
  }

  // register component idempotently
  if(!customElements.get('kob-welcome')){
    customElements.define('kob-welcome', KobWelcome);
  }

  // expose control functions at window.WELCOME_API (merge)
  window.WELCOME_API.render = function(selector){
    // If selector is a host element, mount inside or just create a component
    if(!selector){
      // append to body if no selector
      if(!document.querySelector('kob-welcome')) {
        const el = document.createElement('kob-welcome');
        document.body.appendChild(el);
        return el;
      } else return document.querySelector('kob-welcome');
    }
    const host = document.querySelector(selector);
    if(!host){ console.warn('WELCOME_API.render: selector not found', selector); return null; }
    // if host already contains <kob-welcome> reuse
    let comp = host.querySelector('kob-welcome');
    if(!comp){ comp = document.createElement('kob-welcome'); host.prepend(comp); }
    return comp;
  };

  window.WELCOME_API.libLoad = libLoad;
  window.WELCOME_API.libSave = libSave;
  window.WELCOME_API.libAdd = libAdd;
  window.WELCOME_API.libRemove = libRemove;

  // auto-render if a <kob-welcome> exists in DOM (user may have placed it)
  window.addEventListener('DOMContentLoaded', ()=> {
    const existing = document.querySelector('kob-welcome');
    if(existing) { /* component will self-render on connectedCallback */ }
    else {
      // if no element, auto-insert at top of #root if exists
      const rootHost = document.querySelector('#root');
      if(rootHost && !rootHost.querySelector('kob-welcome')){
        const el = document.createElement('kob-welcome');
        rootHost.prepend(el);
      }
    }
  });

})();
