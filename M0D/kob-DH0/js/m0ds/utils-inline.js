
(()=>{'use strict';
// Non-destructive shim: preserves your existing builder and design.
// If text contains real HTML blocks, we render with a raw-aware builder;
// otherwise we delegate to the original builder untouched.

const $=(q,r=document)=>r.querySelector(q);

const RX_RAW_OPEN=/^\s*<\s*(div|figure|iframe|video|audio|svg|object|embed|table|section|article|img|pre|code|details|blockquote)\b/i;
const RX_RAW_SELF=/^\s*<(img|hr|br|embed|source|track|col|meta|link)\b[^>]*\/?>\s*$/i;
const RX_DIVIDER=/^\s*(?:---|\*\*\*)\s*$/;
const RX_HEADING=/^\s*(#{1,6})\s+(.+)$/;
// Expanded RX_CALL to also recognize shorter callouts like ":" (note) and "?" (question) and the "::." syntax for asides.
const RX_CALL=/^\s*(::(?:info|warn|tip|note|meta|ritual|success|danger|aside|question)|::\.|:|\?)\s+(.*)$/i;

function appendRaw(to, html){
  const tmp=document.createElement('div'); tmp.innerHTML = html;
  [...tmp.childNodes].forEach(n=>to.appendChild(n));
}

function rawAwareBuild(text){
  const root = $('#root'); if(!root) return;
  root.innerHTML = '';

  const lines = String(text||'').replace(/\r\n?/g,'\n').split('\n');
  let i=0, sec=null, blocks=0, sawH=false;

  function newSection(title){
    const det=document.createElement('details'); det.className='acc'; det.open=false;
    const sum=document.createElement('summary');
    sum.innerHTML=`<span class="chev"></span><h2>${title||'Seção'}</h2>`;
    const cont=document.createElement('div'); cont.className='sec';
    det.append(sum, cont); root.appendChild(det);
    sec=det; blocks=0;
  }
  function ensureSection(){ if(!sec) newSection('Seção 1'); if(blocks>=14) newSection(sec.querySelector('h2').textContent+' (cont.)'); }
  function push(el){ ensureSection(); sec.lastChild.appendChild(el); blocks++; }
  const flush = (buf)=>{
    if(!buf.length) return;
    const s = buf.join(' ').trim();
    if(/^\s*</.test(s) && RX_RAW_OPEN.test(s)){
      const d=document.createElement('div'); appendRaw(d, s); push(d);
    }else{
      const p=document.createElement('p');
      p.innerHTML = (window.inlineMD? window.inlineMD(s) : s);
      push(p);
    }
    buf.length=0;
  };

  while(i<lines.length){
    const line = lines[i];

    // hard divider
    if(RX_DIVIDER.test(line)){ flush([]); newSection(); i++; continue; }

    const mH = line.match(RX_HEADING);
    if(mH){ flush([]); newSection(mH[2].trim()); sawH=true; i++; continue; }

    const mC = line.match(RX_CALL);
    if(mC){
      flush([]);
      // Determine callout kind from the marker.
      let marker = (mC[1]||'').toLowerCase();
      let kind;
      if(marker === '::.') {
        kind = 'aside';
      } else if(marker === ':') {
        kind = 'note';
      } else if(marker === '?') {
        kind = 'question';
      } else {
        // strip leading "::" from extended callouts
        if(marker.startsWith('::')) {
          marker = marker.slice(2);
        }
        kind = marker || 'note';
      }
      const div=document.createElement('div');
      div.className=`callout ${kind} copyable`;
      div.innerHTML=`<span class="copy-hint">Copiar</span>` + (window.inlineMD? window.inlineMD(mC[2]) : mC[2]);
      push(div); i++; continue;
    }

    if(RX_RAW_OPEN.test(line)){
      // collect multi-line raw
      let tag = (line.match(RX_RAW_OPEN)||[])[1]||'div';
      const rxClose = new RegExp(`</\\s*${tag}\\s*>`, 'i');
      const buf=[line]; i++;
      while(i<lines.length && !rxClose.test(lines[i]) && !RX_RAW_SELF.test(lines[i])){
        buf.push(lines[i]); i++;
      }
      if(i<lines.length){ buf.push(lines[i]); i++; }
      const d=document.createElement('div'); appendRaw(d, buf.join('\n')); push(d);
      continue;
    }

    // code fences fallback to original builder: we gather and let original handle, or render here
    const mOpen = line.match(/^\s*(?:```|''')\s*([\w-]+)?\s*$/);
    if(mOpen){
      const lang=(mOpen[1]||'').toLowerCase(); i++; const code=[];
      while(i<lines.length && !/^\s*(?:```|''')+\s*$/.test(lines[i])){ code.push(lines[i]); i++; }
      if(i<lines.length) i++;
      const pre=document.createElement('pre'); pre.className='md-code copyable';
      const hint=document.createElement('span'); hint.className='copy-hint'; hint.textContent='Copiar';
      const c=document.createElement('code'); if(lang) c.className='lang-'+lang; c.textContent=code.join('\n');
      pre.append(hint,c); pre.onclick=()=>window.copy&&copy(pre); push(pre); continue;
    }

    if(line.trim()===''){ flush([]); i++; continue; }

    // accumulate paragraph lines
    const acc=[]; acc.push(line.trim()); i++;
    while(i<lines.length && lines[i].trim()!==''){
      if(RX_HEADING.test(lines[i])||RX_DIVIDER.test(lines[i])||RX_CALL.test(lines[i])||RX_RAW_OPEN.test(lines[i])) break;
      acc.push(lines[i].trim()); i++;
    }
    flush(acc);
  }

  // title fallback
  if(!sawH){
    const h = root.querySelector('details.acc summary h2');
    if(h && (!h.textContent || /^Seção/.test(h.textContent))) h.textContent = 'Documento';
  }

  // rename if first block is figure with caption
  root.querySelectorAll('details.acc').forEach((d,idx)=>{
    const cap=d.querySelector('figcaption'); const h=d.querySelector('summary h2');
    if(cap && h && /^Se/i.test(h.textContent||'')) h.textContent = cap.textContent.trim();
    if(!cap && h && /^Se/i.test(h.textContent||'')) h.textContent = idx===0? 'Visão' : `Bloco ${idx+1}`;
  });
}

// Wrap original autoBuild safely (idempotent)
(function(){
  const orig = window.autoBuild;
  if(typeof orig!=='function' || orig.__rawAwareWrapped) return;
  window.autoBuild = function(text){
    try{
      const hasRaw = /^(?:\s*<(?:div|figure|iframe|video|audio|svg|object|embed|table|section|article|img|pre|code|details|blockquote)\b)/mi.test(String(text||''));
      if(hasRaw){ return rawAwareBuild(text); }
    }catch{}
    return orig(text);
  };
  window.autoBuild.__rawAwareWrapped = true;
})();

})();







(()=>{'use strict';
const esc = s => String(s||'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function applySetext(lines,i){
  // Detecta "Título\n=====" (H1) ou "Subtítulo\n-----" (H2)
  if(i+1 < lines.length){
    const next = lines[i+1].trim();
    if(/^=+$/.test(next)) return { level: 1, text: lines[i].trim(), skip: 2 };
    if(/^-+$/.test(next)) return { level: 2, text: lines[i].trim(), skip: 2 };
  }
  return null;
}

// ------- Flat: sobrescreve helpers do autoBuild se existirem -------
if(typeof window.autoBuild==='function'){
  const abSrc = window.autoBuild.toString();
  if(!abSrc.includes('__TITLES_PATCHED__')){
    const _autoBuild = window.autoBuild;
    window.autoBuild = function(text){
      // wrap original com Setext + escape em H2
      const lines = String(text||'').replace(/\r\n?/g,'\n').split('\n');
      let i=0, rebuilt=[];
      while(i<lines.length){
        const l = lines[i];
        const set = applySetext(lines,i);
        if(set){ // converte para ATX
          rebuilt.push('#'.repeat(set.level)+' '+set.text);
          i+=set.skip; continue;
        }
        rebuilt.push(l); i++;
      }
      // sinaliza patch
      const marker='__TITLES_PATCHED__';
      const saved = window.__current_md;
      window.__current_md = (rebuilt.join('\n'));
      const out = _autoBuild(window.__current_md);
      // corrige todos os <summary><h2> com escape
      document.querySelectorAll('#root details.acc summary h2').forEach(h=>{
        h.innerHTML = esc(h.textContent||'');
      });
      window.__current_md = saved;
      return out;
    }
  }
}

// ------- Nested: adiciona escape no momento de criar seção -------
if(typeof window.autoBuildNested==='function'){
  const __origN = window.autoBuildNested;
  window.autoBuildNested = function(text){
    const escText = t => esc(t).replace(/\s+#+\s*$/,''); // remove hashes finais
    // monkey-patch: intercepta newSectionAt com escape
    const create = (lvl, title)=>{
      const details = document.createElement('details');
      details.className='acc'; details.open=false;
      const sum=document.createElement('summary');
      sum.innerHTML='<span class="chev"></span><h2>'+ escText(title) +'</h2>';
      const cont=document.createElement('div'); cont.className='sec';
      details.append(sum, cont);
      return {details, cont};
    };
    // roda original, depois faz um passe extra pros h2 existentes
    const out = __origN(text);
    document.querySelectorAll('#root details.acc summary h2').forEach(h=>{
      h.innerHTML = esc(h.textContent||'');
    });
    return out;
  }
}
})();
