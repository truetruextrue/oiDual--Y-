
/* ===== Biblioteca local (Stacks) ===== */
const LIB_NS = 'tl_library_v1';
function libLoad(){ try{ return JSON.parse(localStorage.getItem(LIB_NS)||'[]'); }catch{return []} }
function libSave(arr){ localStorage.setItem(LIB_NS, JSON.stringify(arr)); }
function libAdd(doc){ const arr=libLoad(); arr.unshift(doc); libSave(arr); }
function libDel(id){ libSave(libLoad().filter(d=>d.id!==id)); }
function libUpdate(id, patch){ libSave(libLoad().map(d=> d.id===id? Object.assign({}, d, patch): d)); }
function analyzeMD(md){
  const words=(md.match(/\S+/g)||[]).length;
  const headings=(md.match(/^\s*#/gm)||[]).length;
  const code=(md.match(/^\s*```/gm)||[]).length;
  const quotes=(md.match(/^\s*>/gm)||[]).length;
  return {words, headings, code, quotes};
}

/* ===== Helpers de MD ===== */
function buildMDFromDOM(){
  const parts=[];
  document.querySelectorAll('#root details.acc').forEach(d=>{
    const h=d.querySelector('summary h2'); if(h) parts.push('# '+h.textContent.trim());
    d.querySelectorAll('.sec > *').forEach(node=>{
      if(node.matches('p')) parts.push(node.innerText.trim());
      else if(node.matches('blockquote')) parts.push('> '+node.innerText.replace('Copiar','').trim());
      else if(node.matches('pre.md-code')) parts.push('```\n'+(node.querySelector('code')?.textContent||'')+'\n```');
      else if(node.matches('.equation')) parts.push('$$\n'+node.innerText.replace('Copiar','').trim()+'\n$$');
      else if(node.matches('ul.md-task')){
        node.querySelectorAll('li').forEach(li=>{
          const chk=li.querySelector('input[type=checkbox]'); const t=li.innerText.replace('Copiar','').trim();
          parts.push(`- [${chk&&chk.checked?'x':' '}] ${t}`);
        });
      }else if(node.matches('ul,ol')){
        const isOl=node.matches('ol'); let idx=1;
        node.querySelectorAll('li').forEach(li=>{
          const txt=li.innerText.trim();
          parts.push((isOl? (idx++)+'. ' : '- ')+txt);
        });
      }else if(node.matches('table.md-table')){
        const rows=[...node.querySelectorAll('tr')].map(tr=>[...tr.children].map(td=>td.innerText.trim()));
        if(rows.length){
          parts.push('| '+rows[0].join(' | ')+' |');
          parts.push('| '+rows[0].map(()=> '---').join(' | ')+' |');
          rows.slice(1).forEach(r=>parts.push('| '+r.join(' | ')+' |'));
        }
      }
    });
  });
  return parts.join('\n\n');
}
function getCurrentMarkdown(){ return (window.__current_md && window.__current_md.trim()) ? window.__current_md : buildMDFromDOM(); }
window.exportMD = function(){
  const md = buildMDFromDOM();
  const blob=new Blob([md],{type:'text/markdown'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  const basename = (window.__current_title||'export').replace(/[\\\/:*?"<>|]+/g,'-').slice(0,80)||'export';
  a.download= basename + '.md'; a.click(); URL.revokeObjectURL(a.href);
  toast && toast('.md exportado');
};

/* ===== Bloco Mestre (sempre topo) ===== */
function ensureMasterBlock(){
  const root=document.getElementById('root'); if(!root) return;
  let mb=document.getElementById('masterBlock');
  if(!mb){
    mb=document.createElement('div'); mb.id='masterBlock'; mb.className='master-block';
    root.prepend(mb);
  }
  const safeTitle=(window.__current_title||'').replace(/[<>&]/g, s=>({ '<':'&lt;','>':'&gt;','&':'&amp;' }[s]));
  mb.innerHTML = `<div class="row">
    <input id="docTitle" class="title" placeholder="Título do documento" value="${safeTitle}">
    <button class="btn" data-action="copiar-tudo">Copiar tudo</button>
    <button class="btn" data-action="tts">TTS On/Off</button>
    <button class="btn" data-action="md">Exportar .md</button>
    <button class="btn" data-action="pdf">Imprimir (PDF)</button>
    <button class="btn" data-action="abrir-tudo">Abrir tudo</button>
    <button class="btn" data-action="fechar-tudo">Fechar tudo</button>
    <button class="btn" data-action="save">Salvar</button>
  </div>`;
}

/* ===== Comandos do Bloco Mestre ===== */
function openAll(){ document.querySelectorAll('#root details.acc').forEach(d=> d.open=true); }
function closeAll(){ document.querySelectorAll('#root details.acc').forEach(d=> d.open=false); }
async function copyAll(){
  const md=getCurrentMarkdown();
  try{ await navigator.clipboard.writeText(md); toast && toast('Conteúdo copiado'); }catch(e){ console.warn(e); }
}
function saveCurrent(){
  const md=getCurrentMarkdown();
  const titleInput=document.getElementById('docTitle');
  const title=(titleInput&&titleInput.value.trim()) || (md.match(/^\s*#\s+(.+)$/m)?.[1]) || 'Sem título';
  const now=new Date().toISOString();
  const id='doc_'+Date.now();
  const doc={id,title,md,createdAt:now,updatedAt:now,bytes:md.length};
  libAdd(doc);
  localStorage.setItem('tl_last_doc_id', id);
  toast && toast('Salvo em Stacks');
}

/* ===== Pré-processamento (arrow => $$, aside normalizado) ===== */
function preprocessMD(text){
  const lines = String(text||'').replace(/\r\n?/g,'\n').split('\n');
  const out=[]; let i=0;
  while(i<lines.length){
    let l=lines[i];
    let norm=l.replace(/[’‘]/g,"'").replace(/[“”]/g,'"');

    // ::aside -> ::. ; e garante "::. " (com espaço) quando vazio
    if(/^\s*::aside\b/i.test(norm)){ l = l.replace(/^\s*::aside\b/i, '::.'); norm=l.replace(/[’‘]/g,"'").replace(/[“”]/g,'"'); }
    if(/^\s*::\.\s*$/.test(norm)){ l = '::. '; norm = l; }

    // Arrow block multilinha com chaves
    if(/^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*$/.test(norm)){
      const buf=[l]; let depth=((l.match(/\{/g)||[]).length - (l.match(/\}/g)||[]).length); i++;
      while(i<lines.length){
        buf.push(lines[i]);
        depth += ((lines[i].match(/\{/g)||[]).length - (lines[i].match(/\}/g)||[]).length);
        i++;
        if(depth<=0) break;
      }
      out.push('$$'); out.push(...buf); out.push('$$'); continue;
    }
    // Função citada "function ... { ... }"
    let m = norm.match(/^[\"']\s*((?:export\s+)?function\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{[^}]*\})\s*[\"']\s*$/);
    if(m){ out.push('$$'); out.push(m[1]); out.push('$$'); i++; continue; }
    // Arrow citada "const f = ... => ..."
    let m2 = norm.match(/^[\"']\s*((?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*(?:\{[^}]*\}|[^;]+;?))\s*[\"']\s*$/);
    if(m2){ out.push('$$'); out.push(m2[1]); out.push('$$'); i++; continue; }
    // Arrow one-liner
    if(/^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*(?:\{[^}]*\}|[^;]+;?)\s*$/.test(norm)){
      out.push('$$'); out.push(l); out.push('$$'); i++; continue;
    }
    out.push(l); i++;
  }
  return out.join('\n');
}

/* ===== Envelopa os builders para usar preprocess + bloco mestre ===== */
(function(){
  if(typeof window.autoBuild==='function'){
    const __orig = window.autoBuild;
    window.autoBuild = function(text){
      text = preprocessMD(text||'');
      window.__current_md = text;
      window.__current_title = (text.match(/^\s*#\s+(.+)$/m)||[])[1] || (document.title||'');
      __orig(text);
      ensureMasterBlock();
    }
  }
  if(typeof window.autoBuildNested==='function'){
    const __origN = window.autoBuildNested;
    window.autoBuildNested = function(text){
      text = preprocessMD(text||'');
      window.__current_md = text;
      window.__current_title = (text.match(/^\s*#\s+(.+)$/m)||[])[1] || (document.title||'');
      __origN(text);
      ensureMasterBlock();
    }
  }
})();

/* ===== Home (stacks) ===== */
function renderWelcome(){
const name =
  localStorage.getItem('tl_user_name') ||
  localStorage.getItem('di_userName') ||
  '';
  const root = document.getElementById('root');
  const stacks = libLoad();
  const cards = stacks.map(d=>{
    const a = analyzeMD(d.md);
    const dt = new Date(d.updatedAt||d.createdAt||Date.now()).toLocaleString();
    return `
    <div class="stack-card">
      <h4>${escapeHtml(d.title||'Sem título')}</h4>
      <div class="meta">${dt} · ${a.words} palavras</div>
      <div class="row">
        <button class="btn" data-action="open-doc" data-id="${d.id}">Abrir</button>
        <button class="btn" data-action="rename-doc" data-id="${d.id}">Renomear</button>
        <button class="btn" data-action="analisar-doc" data-id="${d.id}">Analisar</button>
        <button class="btn" data-action="md-doc" data-id="${d.id}">Exportar .md</button>
        <button class="btn" data-action="del-doc" data-id="${d.id}">Excluir</button>
      </div>
    </div>`;
  }).join('');

  root.innerHTML = `
  <details class="acc" open>
    <summary><span class="chev"></span><h2>👋 Boas‑vindas${name? (', '+escapeHtml(name)) : ''}</h2></summary>
    <div class="sec">
      <div class="welcome">
        <div class="row" style="gap:8px;align-items:center;">
          <input id="welcomeName" class="field" placeholder="Seu nome" value="${escapeHtml(name)}"/>
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
        <div class="stack-grid">${cards || '<div class="small" style="opacity:.8">Sem documentos salvos ainda.</div>'}</div>
      </div>
    </div>
  </details>`;
}

/* ===== Estende ACTIONS ===== */
window.ACTIONS = window.ACTIONS || {};
Object.assign(ACTIONS, {
  'back'(){ try{ if(history.length>1){ history.back(); } else { renderWelcome(); } }catch(e){ renderWelcome(); } },
  
  'abrir-tudo'(){ openAll(); },
  'fechar-tudo'(){ closeAll(); },
  'copiar-tudo'(){ copyAll(); },
  'save'(){ saveCurrent(); },
  'open-doc'(el){ const id = el?.dataset?.id; const doc = libLoad().find(d=>d.id===id); if(!doc) return; autoBuild(doc.md); },
  'del-doc'(el){ const id = el?.dataset?.id; libDel(id); renderWelcome(); toast && toast('Documento removido'); },
  'rename-doc'(el){ const id = el?.dataset?.id; const doc = libLoad().find(d=>d.id===id); if(!doc) return; const novo = prompt('Novo título', doc.title)||''; if(novo.trim()){ libUpdate(id,{title:novo.trim(),updatedAt:new Date().toISOString()}); renderWelcome(); toast && toast('Renomeado'); } },
  'analisar-doc'(el){ const id = el?.dataset?.id; const doc = libLoad().find(d=>d.id===id); if(!doc) return; const a = analyzeMD(doc.md); toast && toast(`Palavras: ${a.words} · H1+: ${a.headings} · Código: ${a.code} · Citações: ${a.quotes}`); },
  'md-doc'(el){ const id = el?.dataset?.id; const doc = libLoad().find(d=>d.id===id); if(!doc) return; const blob=new Blob([doc.md],{type:'text/markdown'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(doc.title||'documento')+'.md'; a.click(); URL.revokeObjectURL(a.href); },
  'save-name'(){ const el = document.getElementById('welcomeName'); const v=(el&&el.value||'').trim(); if(v){ localStorage.setItem('tl_user_name', v); toast && toast('Nome salvo'); } else { localStorage.removeItem('tl_user_name'); toast && toast('Nome limpo'); } renderWelcome(); },
  'home'(){ renderWelcome(); },
  'welcome'(){ renderWelcome(); }
});

/* ===== Primeira carga: Home ===== */
document.addEventListener('DOMContentLoaded', ()=>{ renderWelcome(); });
