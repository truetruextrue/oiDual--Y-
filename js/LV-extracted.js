
(()=>{'use strict';
if(window.__KOBLLUX_PATCH_UNICO__) return; window.__KOBLLUX_PATCH_UNICO__=true;
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)], now=()=>new Date().toISOString().replace(/[:.]/g,'-');

/* Toast mínimo */
function toast(m,ms=1600){let t=$('#kx_toast');if(!t){t=document.createElement('div');t.id='kx_toast';
Object.assign(t.style,{position:'fixed',left:'50%',bottom:'calc(18px + env(safe-area-inset-bottom,0px))',transform:'translateX(-50%)',padding:'.6rem .9rem',borderRadius:'999px',background:'rgba(0,0,0,.7)',backdropFilter:'blur(6px)',color:'#fff',fontWeight:'600',letterSpacing:'.2px',zIndex:99999,boxShadow:'0 0 0 1px rgba(255,255,255,.08) inset'});document.body.appendChild(t);}t.textContent=m;t.style.opacity='1';clearTimeout(toast._t);toast._t=setTimeout(()=>t.style.opacity='0',ms);}

/* StorageSafe */
const NS='infodose::v3::'; const SS={ns:k=>NS+k,get(k,d=null){const r=localStorage.getItem(NS+k);if(r==null)return d;try{return JSON.parse(r);}catch(e){localStorage.setItem('backup::'+NS+k+'::'+Date.now(),r);localStorage.removeItem(NS+k);return d;}},set(k,v){try{localStorage.setItem(NS+k,JSON.stringify(v));}catch(e){}},del:k=>localStorage.removeItem(NS+k)};

/* KaTeX autorun (on-demand) */
function loadOnceCSS(h,id){return new Promise(ok=>{if($('#'+id))return ok();const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=h;l.onload=ok;document.head.appendChild(l);});}
function loadOnceJS(s,id){return new Promise(ok=>{if($('#'+id))return ok();const x=document.createElement('script');x.id=id;x.src=s;x.defer=true;x.onload=ok;document.head.appendChild(x);});}
async function ensureKaTeX(){if(window.renderMathInElement)return;const CDN="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist";
await loadOnceCSS(`${CDN}/katex.min.css`,'katex_css');await loadOnceJS(`${CDN}/katex.min.js`,'katex_js');await loadOnceJS(`${CDN}/contrib/auto-render.min.js`,'katex_auto_js');}
async function KaTeXRender(root=document.body){await ensureKaTeX();if(window.renderMathInElement){window.renderMathInElement(root,{delimiters:[{left:"$$",right:"$$",display:true},{left:"\\[",right:"\\]",display:true},{left:"$",right:"$",display:false},{left:"\\(",right:"\\)",display:false}],throwOnError:false,ignoredTags:["script","noscript","style","textarea","code","pre"]});}}
window.KaTeXRender = window.KaTeXRender||KaTeXRender;

/* TableLock */
function isNum(t){return /^[-+]?(\d{1,3}(\.\d{3})*|\d+)(,\d+|\.\d+)?(%|x)?$/.test(String(t).trim());}
function enhanceTable(tb){if(tb.matches('[data-free]'))return;let wrap=tb.closest('.table-wrap');if(!wrap){wrap=document.createElement('div');wrap.className='table-wrap stacked-sm';tb.parentNode.insertBefore(wrap,tb);wrap.appendChild(tb);}tb.classList.add('tbl-lock');
const flag=()=>wrap.toggleAttribute('data-scrolling',wrap.scrollWidth>wrap.clientWidth);flag();wrap.addEventListener('scroll',flag,{passive:true});
const heads=[...tb.querySelectorAll('thead th')].map(th=>(th.textContent||'').trim());if(heads.length){tb.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>td.setAttribute('data-label',td.getAttribute('data-label')||heads[i]||'')));}
tb.querySelectorAll('tbody td').forEach(td=>{const t=(td.textContent||'').trim();if(isNum(t)) td.classList.add('num'),td.setAttribute('data-type','num');});}
function TableLockRun(root=document){$$('table',root).forEach(enhanceTable);} window.TableLock = window.TableLock||{run:TableLockRun};

/* Tabelas Markdown → <table> */
function mdTablesToHTML(s){const rx=/(^|\n)(\|[^\n]+?\|)\n(\|[ \t:\-\|]+\|)\n((?:\|[^\n]+?\|\n?)+)/g;return s.replace(rx,(_,lead,head,sep,body)=>{const H=head.split('|').slice(1,-1).map(h=>h.trim());
const A=sep.split('|').slice(1,-1).map(a=>{a=a.trim();return(a.startsWith(':')&&a.endsWith(':'))?'center':(a.endsWith(':')?'right':'left');});
const rows=body.trim().split('\n').map(r=>r.split('|').slice(1,-1).map(c=>c.trim()));
let thead='<thead><tr>'+H.map((h,i)=>`<th style="text-align:${A[i]||'left'}">${h}</th>`).join('')+'</tr></thead>';
let tbody='<tbody>'+rows.map(r=>'<tr>'+r.map((c,i)=>{const num=isNum(c);const cls=num?' data-type="num"':'';const al=(A[i]||'left');return `<td${cls} style="text-align:${al}">${c}</td>`;}).join('')+'</tr>').join('')+'</tbody>';
return `${lead}<table>${thead}${tbody}</table>\n`;});}

/* RAW HTML compat + CSS inline seguro */
function CSS_INNER_SAFE(root=document){let css='';root.querySelectorAll('style[data-inline]').forEach(el=>{const t=(el.textContent||'').trim();if(t) css+='\n'+t;});if(css){let s=$('#INLINE_CSS_RENDER_SAFE_V2');if(!s){s=document.createElement('style');s.id='INLINE_CSS_RENDER_SAFE_V2';document.head.appendChild(s);}s.appendChild(document.createTextNode('\n'+css));}}
function looksRaw(s){return /<\/?(div|figure|iframe|video|audio|svg|object|embed|table|section|article|img|pre|code|details|blockquote|style)\b/i.test(s);}
function renderRawHTML(html,into){const slot=document.createElement('div');slot.innerHTML=html;into.appendChild(slot); if(slot.querySelector('table')) TableLockRun(slot); CSS_INNER_SAFE(slot);}

/* Markdownify básico + callouts */
function looksTitle(l){const t=l.trim();return t.length<80&&/^[A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ0-9][^.!?]{2,}$/.test(t);}
function isSubtitle(l){const t=l.trim();return t.length<90&&/[:—–-]\s+/.test(t);}
function bullets(l){return l.replace(/^\s*(\d+)[\)\]]\s+/,'$1. ').replace(/^\s*[•·]\s+/,'- ');}
function markdownifyPlain(txt){const L=String(txt||'').replace(/\r\n?/g,'\n').split('\n');if(/^\s*#\s+/.test(txt))return txt;let out=[],h1=false,i=0;while(i<L.length){let ln=L[i];
if(/^\s*[—–-]{6,}\s*$/.test(ln)){out.push('','---','');i++;continue;} if(!h1&&looksTitle(ln)){out.push('# '+ln.trim(),'');h1=true;i++;continue;}
if(isSubtitle(ln)&&h1){out.push('## '+ln.trim(),'');i++;continue;} ln=bullets(ln); const m=ln.match(/^\s*([A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ].{1,40}):\s+(.+)$/); if(m){out.push(':'+m[1]+' — '+m[2]);i++;continue;}
out.push(ln);i++;}return out.join('\n');}

/* Hook preprocessMD (se existir) */
(function hookupPreprocess(){
  if(typeof window.preprocessMD==='function' && !window.preprocessMD.__kxPatched){
    const orig=window.preprocessMD;
    window.preprocessMD=function(t){let x=String(t||''); const lacks=!/^\s*#{1,6}\s+/m.test(x)&&!/^\s*\S+\n[-=]{3,}\s*$/m.test(x); const many=(x.match(/\S+/g)||[]).length>40;
      if(lacks&&many) x=markdownifyPlain(x);
      x=x.replace(/^::(note|aside|success|danger|question)\s*\n([\s\S]*?)(?=\n\n|$)/gm,(m,k,b)=>`> **${k.toUpperCase()}:**\n> ${b.replace(/\n/g,'\n> ')}`);
      return orig(x);
    }; window.preprocessMD.__kxPatched=true;
  }
})();

/* Envelopa builders para KaTeX+TableLock+MD tables+RAW */
['autoBuild','autoBuildNested'].forEach(name=>{
  const f=window[name];
  if(typeof f==='function' && !f.__kxWrap){
    window[name]=function(text){
      const root=$('#root')||document.body;
      const src=String(text||'');
      // MD tables pré
      const src2 = mdTablesToHTML(src);
      // RAW?
      if(looksRaw(src2)){ root.innerHTML=''; const d=document.createElement('div'); d.className='card'; root.appendChild(d); renderRawHTML(src2,d); KaTeXRender(d); TableLockRun(d); toast('Render (RAW) ✓'); return; }
      const out=f(src2);
      try{ KaTeXRender(root); TableLockRun(root); }catch(e){}
      return out;
    }; window[name].__kxWrap=true;
  }
});

/* FAB Σ KaTeX */
(function FAB_KATEX(){
  function activeRoot(){const picks=['[data-pane="active"]','.stack .doc.active','.pane.active','#renderOut','#mdOut','#viewer','#content','#root','main','article']; for(const s of picks){const el=$(s); if(el)return el;} return document.body;}
  function ensureAction(){window.ACTIONS=window.ACTIONS||{}; if(typeof window.ACTIONS.katex!=='function'){window.ACTIONS.katex=()=>KaTeXRender(activeRoot()).then(()=>toast('Σ KaTeX: render ✓'));}}
  function ensureBtn(){const m=$('#fab .menu'); if(!m||m.querySelector('[data-action="katex"]'))return; const b=document.createElement('button'); b.className='btn'; b.dataset.action='katex'; b.textContent='Σ KaTeX'; b.title='Render KaTeX'; m.appendChild(b);}
  function bind(){const m=$('#fab .menu'); if(!m||m.dataset.kxBound)return; m.dataset.kxBound='1'; m.addEventListener('click',e=>{const t=e.target.closest('[data-action="katex"]'); if(!t)return; e.preventDefault(); ensureAction(); window.ACTIONS.katex();},true);}
  function watch(){const f=$('#fab'); if(!f||f.__kxObs)return; const o=new MutationObserver(()=>{ensureAction(); ensureBtn(); bind();}); o.observe(f,{childList:true,subtree:true}); f.__kxObs=o;}
  (document.readyState!=='loading')?(ensureAction(),ensureBtn(),bind(),watch()):document.addEventListener('DOMContentLoaded',()=>{ensureAction();ensureBtn();bind();watch();});
})();

/* FAB minificado (ícones básicos) */
(function FAB_MINI(){
  const ICON={home:'🏠',importar:'📥',save:'💾',pdf:'🖨️',md:'📝',reading:'📖',theme:'🎨',back:'↩️'};
  function build(items){const fab=$('#fab'); if(!fab)return; fab.classList.add('compact'); const m=fab.querySelector('.menu'); if(!m)return; if(!m.dataset._orig) m.dataset._orig=m.innerHTML; m.innerHTML=''; (items||window.FAB_MINI_ITEMS||['home','importar','save','pdf']).forEach(act=>{const b=document.createElement('button'); b.className='btn mini-icon'; b.dataset.action=act; b.title=act; b.textContent=ICON[act]||'•'; m.appendChild(b);});}
  function apply(){build();} function watch(){const f=$('#fab'); if(!f||f.__mini)return; f.__mini=true; new MutationObserver(apply).observe(f,{childList:true,subtree:true});}
  (document.readyState!=='loading')?(apply(),watch()):document.addEventListener('DOMContentLoaded',()=>{apply();watch();});
  window.FAB_MINI={apply,set:arr=>{window.FAB_MINI_ITEMS=arr;apply();}};
})();

/* Stacks Home (biblioteca local) */
const LIB='tl_library_v1';
function libLoad(){try{return JSON.parse(localStorage.getItem(LIB)||'[]')}catch{return []}}
function libSave(a){localStorage.setItem(LIB,JSON.stringify(a))}
function libAdd(d){const a=libLoad(); a.unshift(d); libSave(a);}
function analyzeMD(md){const w=(md.match(/\S+/g)||[]).length,h=(md.match(/^\s*#/gm)||[]).length,c=(md.match(/^\s*```/gm)||[]).length,q=(md.match(/^\s*>/gm)||[]).length; return {w,h,c,q};}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
window.renderWelcome=function(){
  const name = localStorage.getItem('tl_user_name')||'';
  const root=$('#root')||document.body; const items=libLoad();
  const cards = items.map(d=>{const a=analyzeMD(d.md); const dt=new Date(d.updatedAt||d.createdAt||Date.now()).toLocaleString();
    return `<div class="stack-card"><h4>${esc(d.title||'Sem título')}</h4><div class="meta">${dt} · ${a.w} palavras</div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-action="open-doc" data-id="${d.id}">Abrir</button>
        <button class="btn" data-action="rename-doc" data-id="${d.id}">Renomear</button>
        <button class="btn" data-action="analisar-doc" data-id="${d.id}">Analisar</button>
        <button class="btn" data-action="md-doc" data-id="${d.id}">Exportar .md</button>
        <button class="btn" data-action="del-doc" data-id="${d.id}">Excluir</button>
      </div></div>`;}).join('');
  root.innerHTML = `<details class="acc" open><summary><span class="chev">›</span><h2>👋 Boas-vindas${name? (', '+esc(name)) : ''}</h2></summary>
    <div class="sec"><div class="welcome"><div class="row" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input id="welcomeName" class="field" placeholder="Seu nome" value="${esc(name)}" />
      <button class="btn" data-action="save-name">Salvar nome</button>
      <button class="btn" data-action="importar">Enviar Documento</button>
      <button class="btn" data-action="demo">Gerar Demo</button>
      <button class="btn" data-action="gerar">Gerar do Editor</button>
      <button class="btn" data-action="nested">Gerar (aninhado)</button>
      <button class="btn" data-action="md">Exportar .md</button>
      <button class="btn" data-action="pdf">Imprimir (PDF)</button>
      <button class="btn" data-action="reading">Modo Leitura</button>
      <button class="btn" data-action="theme">Trocar Tema</button>
    </div>
    <div class="small" style="margin-top:8px">Stacks salvos no dispositivo:</div>
    <div class="stack-grid">${cards||'<div class="small" style="opacity:.8">Sem documentos salvos ainda.</div>'}</div>
  </div></div></details>`;
}
/* Ações Stacks/Home */
window.ACTIONS = window.ACTIONS||{};
Object.assign(window.ACTIONS,{
  home(){ renderWelcome(); },
  gerar(){ const ta=$('#srcText'); if(ta&&typeof window.autoBuild==='function') autoBuild(ta.value||''); },
  nested(){ const ta=$('#srcText'); if(ta&&typeof window.autoBuildNested==='function') autoBuildNested(ta.value||''); },
  'open-doc'(el){ const id=el?.dataset?.id; const doc=libLoad().find(x=>x.id===id); if(doc && typeof window.autoBuild==='function') autoBuild(doc.md); },
  'del-doc'(el){ const id=el?.dataset?.id; libSave(libLoad().filter(d=>d.id!==id)); renderWelcome(); },
  'rename-doc'(el){ const id=el?.dataset?.id; const arr=libLoad(); const i=arr.findIndex(x=>x.id===id); if(i<0)return; const v=prompt('Novo título',arr[i].title)||''; if(v.trim()){arr[i].title=v.trim(); arr[i].updatedAt=new Date().toISOString(); libSave(arr); renderWelcome();} },
  'analisar-doc'(el){ const id=el?.dataset?.id; const d=libLoad().find(x=>x.id===id); if(!d) return; const a=analyzeMD(d.md); toast(`Palavras: ${a.w} · H#: ${a.h} · Código: ${a.c} · Citações: ${a.q}`); },
  'md-doc'(el){ const id=el?.dataset?.id; const d=libLoad().find(x=>x.id===id); if(!d)return; const b=new Blob([d.md],{type:'text/markdown'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=(d.title||'documento')+'.md'; a.click(); URL.revokeObjectURL(a.href); },
  'save-name'(){ const el=$('#welcomeName'); const v=(el&&el.value||'').trim(); if(v){localStorage.setItem('tl_user_name',v);} else {localStorage.removeItem('tl_user_name');} renderWelcome(); }
});
document.addEventListener('click',e=>{
  const on=(a)=>{const t=e.target.closest(`[data-action="${a}"]`); if(t){e.preventDefault(); (window.ACTIONS[a]||(()=>toast('Ação indisponível'))) (t);}};
  ['open-doc','del-doc','rename-doc','analisar-doc','md-doc','save-name'].forEach(on);
});

/* ROM (Read-Only Models) */
(function ROM(){
  const make=(id,title,md)=>({id,title,md,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  const ROMS=[
    make('rom_katex_tables','Demo — KaTeX + Tabelas',`# Demo — KaTeX + Tabelas
Inline: $E = mc^2$
Bloco: $$\\int_{0}^{1} x^2\\,dx = \\tfrac{1}{3}$$

| Produto | Qtd | Preço |
|---------|----:|------:|
| Orbe Azul | 2 | 79,90 |
| Pad Nebula | 4 | 15,00 |`),
    make('rom_369','Ritual 3·6·9 (modelo)',`# Ritual 3·6·9
## 3 • Foco
- Respiração 3 min
- Intenção: **clareza**
## 6 • Expansão
- Escrever 6 linhas
## 9 • Integração
- Ler em voz alta por 90s`),
    make('rom_html_svg','HTML + SVG (raw)',`# HTML + SVG
<style data-inline>.box{border:1px dashed #67e6ff;padding:8px;border-radius:8px;margin:6px 0}</style>
<div class="box">Bloco HTML com <b>CSS inline seguro</b>.</div>
<svg viewBox="0 0 120 20" width="160" height="28" style="display:block"><text x="0" y="14" fill="#8ff296">KOBLLUX</text></svg>`),
    make('rom_callouts','Callouts + Código',`# Callouts
::note
Dica: use **Stacks** para salvar e reabrir.
## Código
\`\`\`js
function ola(){ console.log('Nebula Pro + Base Madeira'); }
ola();
\`\`\``)
  ];
  function romCards(){return `<div class="stack-grid" id="rom-grid">${
    ROMS.map(d=>`<div class="stack-card"><h4>${d.title}</h4><div class="meta">ROM • modelo</div>
    <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" data-action="rom-open" data-id="${d.id}">Pré-visualizar</button>
      <button class="btn" data-action="rom-clone" data-id="${d.id}">Clonar para Stacks</button>
    </div></div>`).join('')}</div>`;}
  function attach(){const root=$('#root'); if(!root)return; const sec=root.querySelector('.welcome'); let host=sec?sec:root; if(!$('#rom-grid')){const h3=document.createElement('h3');h3.style.margin='12px 0 6px 0';h3.textContent='ROM (modelos)'; const wrap=document.createElement('div'); wrap.innerHTML=romCards(); if(sec){sec.appendChild(h3);sec.appendChild(wrap.firstElementChild);} else {host.appendChild(h3);host.appendChild(wrap.firstElementChild);} }
  }
  const rw=window.renderWelcome;
  window.renderWelcome=function(){const out=rw&&rw.apply(this,arguments); try{attach();}catch{} return out;}
  document.addEventListener('click',e=>{
    const open=e.target.closest('[data-action="rom-open"]'); const clone=e.target.closest('[data-action="rom-clone"]');
    if(open){const id=open.dataset.id; const doc=ROMS.find(x=>x.id===id); if(doc&&typeof window.autoBuild==='function') autoBuild(doc.md);}
    if(clone){const id=clone.dataset.id; const doc=ROMS.find(x=>x.id===id); if(!doc)return; const d={id:'s_'+Date.now(),title:doc.title,md:doc.md,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; const a=libLoad(); a.unshift(d); libSave(a); toast('ROM clonado ✓'); renderWelcome(); }
  });
})();

/* Inicia Home/Stacks na primeira carga */
document.addEventListener('DOMContentLoaded', ()=>{ try{ renderWelcome(); }catch{} });

/* FAB listener genérico (se faltar) */
const FAB=$('#fab'); if(FAB && !FAB.__bind){FAB.__bind=true; FAB.addEventListener('click',e=>{const b=e.target.closest('[data-action]'); if(!b)return; e.preventDefault(); const act=b.dataset.action; (window.ACTIONS&&window.ACTIONS[act]||(()=>toast('Ação indisponível')))();});}
})();


/* ---- extracted inline script ---- */



(async function inlineStylesAndExtractScripts(){
  // Runner by ChatGPT — inline + extract
  try {
    // collect CSS property names referenced in same-origin stylesheets (best-effort)
    const propSet = new Set();
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (!sheet.cssRules) continue;
        for (const rule of Array.from(sheet.cssRules)) {
          // recursive for media/page/namespace rules
          const walkRules = (r) => {
            if (r.type === CSSRule.STYLE_RULE && r.style) {
              for (let i = 0; i < r.style.length; i++) propSet.add(r.style[i]);
            } else if (r.cssRules && r.cssRules.length) {
              for (const rr of Array.from(r.cssRules)) walkRules(rr);
            }
          };
          walkRules(rule);
        }
      } catch (e) {
        // cross-origin sheet, skip (fallback below will handle)
        // console.warn('sheet blocked', e);
        continue;
      }
    }

    const usePropList = propSet.size > 0 ? Array.from(propSet) : null;
    const origDocEl = document.documentElement;
    const clone = origDocEl.cloneNode(true);

    // Map original elements to clone elements by walk order
    const origEls = Array.from(document.querySelectorAll('*'));
    const cloneEls = Array.from(clone.querySelectorAll('*'));

    // If root <html> and <body> included, include them too
    if (!origEls.length && document.documentElement) {
      origEls.push(document.documentElement);
      cloneEls.push(clone);
    }

    const applyInline = (orig, cln) => {
      const cs = window.getComputedStyle(orig);
      let out = '';
      if (usePropList) {
        for (const p of usePropList) {
          const v = cs.getPropertyValue(p);
          if (v && v !== '' && v !== 'initial' && v !== 'unset') {
            out += `${p}: ${v}; `;
          }
        }
      } else {
        // fallback: iterate computed style keys
        for (let i = 0; i < cs.length; i++) {
          const p = cs[i];
          const v = cs.getPropertyValue(p);
          if (v && v !== '' && v !== 'initial' && v !== 'unset') {
            out += `${p}: ${v}; `;
          }
        }
      }
      if (out.trim()) {
        // preserve existing inline style as well (append)
        const existing = cln.getAttribute('style') || '';
        cln.setAttribute('style', (existing + ' ' + out).trim());
      }
    };

    const len = Math.min(origEls.length, cloneEls.length);
    for (let i = 0; i < len; i++) {
      try { applyInline(origEls[i], cloneEls[i]); } catch(e){/*ignore per-element errors*/}
    }
    // also set computed styles for html and body if present
    try { applyInline(document.documentElement, clone); } catch(e){}
    const origBody = document.body;
    const cloneBody = clone.querySelector('body');
    if (origBody && cloneBody) try { applyInline(origBody, cloneBody); } catch(e){}

    // remove all <style> and <link rel=stylesheet> from clone (we inlined)
    clone.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());

    // Extract scripts
    const allScripts = Array.from(document.querySelectorAll('script'));
    const inlineScripts = allScripts.filter(s => !s.src).map(s => s.textContent || '');
    const externalScripts = allScripts.filter(s => s.src).map(s => s.src);

    // Build extracted JS content
    const extractedInlineJS = inlineScripts.join('\n\n/* ---- extracted inline script ---- */\n\n');

    // Build loader for external scripts (keeps original order)
    const externalLoader = externalScripts.length ? `
// external-scripts-loader.js
// This inserts original external scripts in document order
(function loadExternalScripts() {
  const urls = ${JSON.stringify(externalScripts, null, 2)};
  for (const url of urls) {
    try {
      const s = document.createElement('script');
      s.src = url;
      s.async = false;
      document.head.appendChild(s);
    } catch(e) {
      console.warn('failed inject external script', url, e);
    }
  }
})();
` : '';

    // Create final inlined HTML: clone outerHTML + doctype
    const doctype = '<!doctype html>\n';
    // If clone is <html> element, serialise full document
    const inlinedHTML = doctype + clone.outerHTML;

    // helper download
    function downloadBlob(content, filename, type='text/plain;charset=utf-8') {
      const blob = new Blob([content], {type});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=> {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1500);
    }

    // Trigger downloads
    downloadBlob(inlinedHTML, 'inlined.html', 'text/html;charset=utf-8');
    if (extractedInlineJS.trim()) downloadBlob(extractedInlineJS, 'extracted-scripts.js', 'application/javascript;charset=utf-8');
    if (externalLoader.trim()) downloadBlob(externalLoader, 'external-scripts-loader.js', 'application/javascript;charset=utf-8');

    // Quick summary in console
    console.log('✅ Inlining feito. Baixados: inlined.html' +
      (extractedInlineJS.trim()? ', extracted-scripts.js' : '') +
      (externalLoader.trim()? ', external-scripts-loader.js' : '') +
      '\nNota: revise o inlined.html para ajustar pseudo-elements e event-listeners que dependem de scripts in-page.'
    );
  } catch (err) {
    console.error('Erro no processo de inlining/extract:', err);
  }
})();/* localstorage-panel.js
   Versão: 1.0
   Insere no document um painel modal para gerenciar localStorage (abrir, exportar, importar, limpar desativados, ver imagens).
   Expondo: window.NebulaLS.open(), window.NebulaLS.close(), window.NebulaLS.renderAll()
*/
(function _nebula_ls_panel(){
  if(window.NebulaLS) return; // não duplicar

  /* ---------- Helpers ---------- */
  const LS = { DISABLED_KEY: 'infodose:presets.disabled' };
  const $ = (s, r=document)=> r.querySelector(s);
  const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
  function saveFile(name,str){
    const blob=new Blob([str],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.style.display='none'; a.href=url; a.download=name; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); },800);
  }
  function prettyBytes(n){ if(!Number.isFinite(n)||n<=0) return '0 B'; const u=['B','KB','MB','GB']; let i=0; while(n>=1024&&i<u.length-1){n/=1024;i++} return n.toFixed(2)+' '+u[i] }
  function isJson(v){ try{ JSON.parse(v); return true }catch{ return false } }
  function inferType(v){
    if(v==null||v==='') return 'empty';
    if(isJson(v)){ const p=JSON.parse(v); if(Array.isArray(p)) return 'json[array]'; if(p&&typeof p==='object') return 'json[object]'; return 'json['+(typeof p)+']' }
    if(/^data:image\//i.test(v)||/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(v)) return 'image';
    if(/^(true|false|1|0)$/i.test(v)) return 'boolean-like';
    if(/^https?:\/\//i.test(v)) return 'url';
    if(/^data:/i.test(v)) return 'data-url';
    return 'string';
  }

  /* ---------- Inject CSS ---------- */
  const style = document.createElement('style');
  style.textContent = `
  /* Minimal styles for LS panel */
  .nebula-ls-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(6px)}
  .nebula-ls-modal.open{display:flex}
  .nebula-ls-panel{width:min(920px,95vw);max-height:86vh;overflow:auto;background:#0f1118;color:#fff;border-radius:12px;padding:12px;box-shadow:0 12px 34px rgba(0,0,0,.6);font-family:system-ui,Segoe UI,Helvetica,Arial}
  .nebula-ls-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .nebula-ls-actions{display:flex;gap:8px;flex-wrap:wrap}
  .nebula-ls-actions button{padding:8px 10px;border-radius:10px;border:0;background:rgba(255,255,255,.06);color:#fff;cursor:pointer}
  .nebula-ls-presets{border-radius:10px;padding:8px;background:rgba(255,255,255,.03);margin-bottom:8px}
  .nebula-ls-grid{display:grid;gap:10px}
  .nebula-ls-item{background:rgba(255,255,255,.03);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.04);margin-bottom:8px}
  .nebula-ls-row{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}
  .nebula-ls-key{font-weight:700;max-width:70% ;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nebula-ls-val{font-family:ui-monospace,monospace;background:#07101a;padding:8px;border-radius:8px;max-height:140px;overflow:auto}
  .nebula-ls-switch{display:inline-block;width:46px;height:26px;border-radius:999px;background:rgba(255,255,255,.08);position:relative;cursor:pointer}
  .nebula-ls-switch.on{background:rgba(25,226,123,.22)}
  .nebula-ls-switch::after{content:'';position:absolute;left:4px;top:4px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .18s}
  .nebula-ls-switch.on::after{left:24px}
  .nebula-ls-img-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:8px}
  .nebula-ls-img-card img{width:100%;height:auto;border-radius:8px;display:block}
  .nebula-ls-meta{color:rgba(255,255,255,.55);font-size:.9rem;margin-bottom:6px}
  .nebula-ls-hidden{display:none}
  @media (max-width:560px){ .nebula-ls-key{max-width:50%} }
  `;
  document.head.appendChild(style);

  /* ---------- Inject HTML ---------- */
  const modal = document.createElement('div');
  modal.id = 'lsModal';
  modal.className = 'nebula-ls-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML = `
    <div class="nebula-ls-panel" role="dialog" aria-modal="true">
      <div class="nebula-ls-hdr">
        <div style="font-weight:900">LocalStorage • Painel</div>
        <div class="nebula-ls-actions">
          <button id="lsRescanBtn">Re-scan</button>
          <button id="lsExportBtn">Exportar</button>
          <label style="margin:0"><button id="lsImportBtn">Importar</button><input id="lsImportFile" type="file" accept="application/json" class="nebula-ls-hidden"></label>
          <button id="lsClearDisabledBtn">Limpar desativados</button>
          <button id="lsCloseBtn">Fechar</button>
        </div>
      </div>

      <div class="nebula-ls-presets">
        <strong>Presets (exemplo)</strong>
        <div id="presetsGrid" style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px"></div>
      </div>

      <div class="nebula-ls-meta"><span id="lsCount">—</span> • <span id="lsSize">—</span></div>
      <div id="lsList" class="nebula-ls-grid"></div>

      <details style="margin-top:10px" open>
        <summary style="cursor:pointer">Pré-visualização de imagens</summary>
        <div id="imgGrid" class="nebula-ls-img-grid"></div>
      </details>
    </div>
  `;
  document.body.appendChild(modal);

  /* ---------- State & Presets (can be adapted) ---------- */
  const PRESETS = [
    { key:'infodose:userName', label:'Usuário' },
    { key:'infodose:assistantName', label:'Assistente' },
    { key:'uno:theme', label:'Tema' },
    { key:'infodose:cssCustom', label:'CSS Custom' },
    { key:'infodose:voices', label:'Vozes' }
  ];

  /* ---------- Utility: disabledSet ---------- */
  function disabledSet(){ try{ return new Set(JSON.parse(localStorage.getItem(LS.DISABLED_KEY)||'[]')) }catch{ return new Set() } }
  function saveDisabled(set){ localStorage.setItem(LS.DISABLED_KEY, JSON.stringify(Array.from(set))) }

  /* ---------- Renderers ---------- */
  function lsEntries(){ const out=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const v=localStorage.getItem(k)||''; out.push({key:k,val:v}) } return out.sort((a,b)=>a.key.localeCompare(b.key)) }
  function lsSizeBytes(){ let sum=0; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const v=localStorage.getItem(k)||''; sum += (k.length + (v?v.length:0)) } return sum }

  function renderPresets(){
    const grid = $('#presetsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    const dis = disabledSet();
    PRESETS.forEach(p=>{
      const val = localStorage.getItem(p.key)||'';
      const on = !dis.has(p.key);
      const wrap = document.createElement('div'); wrap.style.background='rgba(255,255,255,.02)'; wrap.style.padding='8px'; wrap.style.borderRadius='8px';
      const name = document.createElement('div'); name.innerHTML = `<strong>${p.label}</strong><div style="font-size:.8rem;color:rgba(255,255,255,.5)">${p.key}</div>`;
      const sw = document.createElement('div'); sw.className='nebula-ls-switch'+(on?' on':''); sw.title = on?'Desativar':'Ativar'; sw.onclick = ()=>{ toggleDisabled(p.key) };
      const meta = document.createElement('pre'); meta.style.margin='8px 0 0'; meta.style.whiteSpace='pre-wrap'; meta.style.fontFamily='ui-monospace,monospace';
      meta.textContent = val ? (inferType(val).startsWith('json')? JSON.stringify(JSON.parse(val),null,2): val) : '—';
      wrap.appendChild(name); wrap.appendChild(sw); wrap.appendChild(meta);
      grid.appendChild(wrap);
    });
  }

  function renderLS(){
    const list = $('#lsList'); if(!list) return;
    list.innerHTML = ''; $('#imgGrid').innerHTML='';
    const entries = lsEntries();
    $('#lsCount').textContent = entries.length+' chave(s)';
    $('#lsSize').textContent = prettyBytes(lsSizeBytes());
    const dis = disabledSet();
    entries.forEach(({key,val})=>{
      if(key === LS.DISABLED_KEY) return;
      const it = document.createElement('div'); it.className='nebula-ls-item';
      const row = document.createElement('div'); row.className='nebula-ls-row';
      const left = document.createElement('div'); left.innerHTML = `<div class="nebula-ls-key">${key}${dis.has(key)?' <span style="opacity:.7">(desativado)</span>':''}</div><div style="font-size:.85rem;color:rgba(255,255,255,.55)">${inferType(val)} • ${prettyBytes((val||'').length)}</div>`;
      const ctr = document.createElement('div'); ctr.style.display='flex'; ctr.style.gap='8px';
      const sw = document.createElement('div'); sw.className='nebula-ls-switch'+(!dis.has(key)?' on':''); sw.title = (!dis.has(key)?'Desativar':'Ativar'); sw.onclick = ()=>toggleDisabled(key);
      const bEdit = document.createElement('button'); bEdit.textContent='Editar'; bEdit.onclick = ()=>{ const next = prompt(`Editar valor de\n${key}`, val ?? ''); if(next==null) return; localStorage.setItem(key,String(next)); renderAll(); };
      const bDel = document.createElement('button'); bDel.textContent='Apagar'; bDel.onclick = ()=>{ if(confirm('Apagar '+key+'?')){ localStorage.removeItem(key); renderAll(); } };
      ctr.append(sw,bEdit,bDel);
      if(inferType(val)==='image'){ const bImg = document.createElement('button'); bImg.textContent='Ver imagem'; bImg.onclick=()=>addImagePreview(key,val); ctr.append(bImg); }
      row.append(left,ctr);
      const v = document.createElement('div'); v.className='nebula-ls-val'; v.textContent = inferType(val).startsWith('json')? JSON.stringify(JSON.parse(val),null,2): (val??'—');
      it.append(row,v); list.append(it);
    });
  }

  function addImagePreview(key,src){
    const g = $('#imgGrid');
    const card = document.createElement('div'); card.className='nebula-ls-img-card';
    const cap = document.createElement('div'); cap.style.fontSize='.85rem'; cap.style.marginBottom='6px'; cap.textContent = key;
    const im = new Image(); im.src = src; im.loading = 'lazy'; im.alt = key;
    card.append(cap,im); g.append(card);
  }

  /* ---------- Actions ---------- */
  function exportLS(){
    const dump = {};
    for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k===LS.DISABLED_KEY) continue; dump[k]=localStorage.getItem(k); }
    saveFile('localstorage_export.json', JSON.stringify(dump,null,2));
  }
  function importLS(file){
    if(!(file instanceof File)) return;
    const r=new FileReader();
    r.onload = ()=>{ try{ const data = JSON.parse(r.result||'{}'); Object.entries(data).forEach(([k,v])=>localStorage.setItem(k,String(v))); alert('Importado com sucesso.'); renderAll(); } catch(e){ alert('JSON inválido.'); } };
    r.readAsText(file);
  }
  function exportLSviaPrompt(){
    const dump = {};
    for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k===LS.DISABLED_KEY) continue; dump[k]=localStorage.getItem(k); }
    saveFile('localstorage_export.json', JSON.stringify(dump,null,2));
  }
  function clearDisabled(){ localStorage.setItem(LS.DISABLED_KEY,'[]'); renderAll(); }

  function toggleDisabled(k){
    const s = disabledSet();
    if(s.has(k)) s.delete(k); else s.add(k);
    saveDisabled(s);
    renderPresets();
    renderLS();
    window.dispatchEvent(new CustomEvent('ls:disabled-changed',{detail:{key:k,disabled:s.has(k)}}));
  }

  /* ---------- Modal controls ---------- */
  function openLS(){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); renderAll(); }
  function closeLS(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  function renderAll(){ renderPresets(); renderLS(); }

  /* ---------- Bind buttons & events ---------- */
  // Buttons
  modal.querySelector('#lsRescanBtn').addEventListener('click', renderAll);
  modal.querySelector('#lsExportBtn').addEventListener('click', exportLS);
  modal.querySelector('#lsClearDisabledBtn').addEventListener('click', clearDisabled);
  modal.querySelector('#lsCloseBtn').addEventListener('click', closeLS);

  // import file input
  const fileInput = modal.querySelector('#lsImportFile');
  modal.querySelector('#lsImportBtn').addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', ev=>{
    const f = ev.target.files?.[0]; if(f) importLS(f); ev.target.value='';
  });

  // Close modal by clicking backdrop
  document.addEventListener('click', (ev)=>{ if(ev.target && ev.target.id === 'lsCloseBtn') closeLS(); });
  window.addEventListener('click', e=>{ if(e.target && e.target.id === 'lsModal') closeLS(); });

  // storage changes from other tabs
  window.addEventListener('storage', renderAll);
  window.addEventListener('ls:disabled-changed', ()=>{ /* hook disponível */ });

  // expose API
  window.NebulaLS = {
    open: openLS,
    close: closeLS,
    renderAll,
    export: exportLS,
    importFromFile: importLS
  };

  // auto-attach small toggle on page (optional): um botão discreto no canto que abre o painel
  (function addFloatingBtn(){
    const b = document.createElement('button');
    b.innerHTML = 'LS';
    Object.assign(b.style,{position:'fixed',right:'14px',bottom:'14px',zIndex:999999,padding:'10px 12px',borderRadius:'10px',background:'rgba(0,0,0,.5)',color:'#fff',border:'1px solid rgba(255,255,255,.06)',cursor:'pointer'});
    b.title = 'Abrir LocalStorage Panel';
    b.addEventListener('click', openLS);
    document.body.appendChild(b);
  })();

  // initial render if modal opened later
  renderAll();

})(); // fim IIFE

