
(()=>{ 'use strict';
const NS_VER = 'infodose::v3::';
const SUSPECT = ['infodose','book','reject','metalux','kodux','livro','tl_','LIVRO_LIB_V','LIVRO_CUR_V'];
function isSuspect(k){ return SUSPECT.some(p=>k.toLowerCase().includes(p)); }
function now(){return new Date().toISOString().replace(/[:.]/g,'-');}
function backupKey(k){
  const v = localStorage.getItem(k);
  if(v!==null){ localStorage.setItem(`backup::${k}::${Date.now()}`, v); }
}
function migrateAndClean(){
  try{
    // Migrate JSON suspect keys into namespaced infodose::v3::<safe>
    const keys = Object.keys(localStorage);
    for(const k of keys){
      if(k.startsWith(NS_VER)) continue;
      if(!isSuspect(k)) continue;
      const raw = localStorage.getItem(k);
      try{
        const val = JSON.parse(raw);
        // save under safe key
        const safeKey = k.replace(/[^a-z0-9]/gi,'_').toLowerCase();
        localStorage.setItem(`${NS_VER}${safeKey}`, JSON.stringify(Object.assign({}, val, {version:3})));
        backupKey(k);
      }catch(e){
        // not JSON, backup then remove
        backupKey(k);
      }
    }
    // Now remove suspect keys that are outside namespace
    for(const k of Object.keys(localStorage)){
      if(k.startsWith(NS_VER)) continue;
      if(isSuspect(k)){
        // Already backed up above; remove to avoid old code pulling it
        localStorage.removeItem(k);
      }
    }
    // Mark done
    localStorage.setItem(`${NS_VER}__migration_done`, now());
    console.info('[FORCE_BRUTE] migration+clean done');
  }catch(e){
    console.error('[FORCE_BRUTE] failed', e);
  }
}
window.addEventListener('DOMContentLoaded', ()=>{
  try{
    const done = localStorage.getItem(`${NS_VER}__migration_done`);
    if(!done){
      // run migration/clean
      migrateAndClean();
      // reload to let app start fresh
      try{ location.reload(); }catch(e){ console.warn('reload failed', e); }
    }
  }catch(e){ console.error(e); }
});
})();

function autoBuildNested(text){
  closeImporter();
  const root = document.getElementById('root');
  root.innerHTML = '';

  const stack = [];
  function newSectionAt(level, title){
    const details = document.createElement('details');
    details.className = 'acc';
    details.open = false;
    const sum = document.createElement('summary');
    sum.innerHTML = '<span class="chev"></span><h2>'+ title +'</h2>';
    const cont = document.createElement('div'); cont.className = 'sec';
    details.append(sum, cont);
    const parentContainer = stack.length ? stack[stack.length-1].container : root;
    parentContainer.appendChild(details);
    stack.push({level, details, container: cont});
  }
  function currentContainer(){ return stack.length ? stack[stack.length-1].container : root; }

  const lines = text.replace(/\r\n?/g,'\n').split('\n');
  let i = 0, inCode = false, codeLang = '', buf = [];
  let inFn = false, fnDepth = 0;
  // RAW HTML inline (iframe, video, etc.) para o builder aninhado
  const RX_RAW_INLINE = /^\s*<\s*(iframe|video|audio|img|figure|div|section|article|embed|object|svg)\b/i;
    const flushParagraph = ()=>{
    if(!buf.length) return;
    const content = buf.join(' ').trim();

    // Bloco de função inteira (continua igual)
    if(/^\s*(?:export\s+)?function\s+\w+\s*\([^)]*\)\s*\{[^]*\}\s*$/.test(content)){
      const div = document.createElement('div');
      div.className = 'equation copyable fn';
      div.innerHTML = '<span class="copy-hint">Copiar</span>' + content;
      div.onclick = ()=>copy(div);
      currentContainer().appendChild(div);
      buf.length = 0;
      return;
    }

    // 🔥 HTML inline (iframe, video, etc.) — renderiza como HTML real
    if(/^\s*</.test(content) && RX_RAW_INLINE.test(content)){
      const wrap = document.createElement('div');
      wrap.innerHTML = content;
      currentContainer().appendChild(wrap);
      buf.length = 0;
      return;
    }

    // Padrão: parágrafo markdown
    const p = document.createElement('p');
    p.innerHTML = inlineMD(content);
    currentContainer().appendChild(p);
    buf.length = 0;
  };

  while(i < lines.length){
    let line = lines[i];
    let norm = line.replace(/[’‘]/g, "'");

    // headings aninhados
    const mH = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if(mH){
      flushParagraph();
      const level = mH[1].length, title = mH[2].trim();
      while(stack.length && stack[stack.length-1].level >= level) stack.pop();
      newSectionAt(level, title);
      i++; continue;
    }

    // code fences
    const mFenceOpen = norm.match(/^\s*(?:```|''')([\w-]+)?\s*$/);
    if(!inCode && mFenceOpen){
      flushParagraph();
      inCode = true; codeLang = (mFenceOpen[1]||'').toLowerCase();
      i++; continue;
    }
    if(inCode){
      const mFenceClose = norm.match(/^\s*(?:```|''')+\s*$/);
      if(mFenceClose){
        const pre = document.createElement('pre');
        pre.className = 'md-code copyable';
        const hint = document.createElement('span'); hint.className = 'copy-hint'; hint.textContent = 'Copiar';
        const code = document.createElement('code');
        if(codeLang) code.className = 'lang-'+codeLang;
        code.textContent = buf.join('\n');
        pre.append(hint, code);
        pre.onclick = ()=>copy(pre);
        currentContainer().appendChild(pre);
        buf.length = 0; inCode = false; codeLang = '';
      }else{
        buf.push(line);
      }
      i++; continue;
    }

    // função multi-linha
    if(!inFn){
      const mFnStart = norm.match(/^\s*(?:export\s+)?function\s+\w+\s*\([^)]*\)\s*\{\s*$/);
      if(mFnStart){
        flushParagraph();
        inFn = true; fnDepth = 1; buf.length = 0; i++; continue;
      }
    }
    if(inFn){
      buf.push(line);
      const open = (line.match(/\{/g) || []).length;
      const close = (line.match(/\}/g) || []).length;
      fnDepth += open - close;
      i++;
      if(fnDepth <= 0){
        const div = document.createElement('div');
        div.className = 'equation copyable fn';
        div.innerHTML = '<span class="copy-hint">Copiar</span>' + escapeHtml(buf.join('\\n'));
        div.onclick = ()=>copy(div);
        currentContainer().appendChild(div);
        buf.length = 0; inFn = false; fnDepth = 0;
      }
      continue;
    }

    // hr
    if(/^\s*(?:---|\*\*\*)\s*$/.test(line)){
      flushParagraph();
      const hr = document.createElement('div'); hr.className = 'hr';
      currentContainer().appendChild(hr); i++; continue;
    }

    // blockquotes aninhados
    if(/^\s*>+/.test(line)){
      flushParagraph();
      const items = [];
      while(i < lines.length && /^\s*>+/.test(lines[i])){
        const m = lines[i].match(/^\s*(>+)\s?(.*)$/);
        items.push({ level: m[1].length, text: m[2] });
        i++;
      }
      const rootBQ = document.createElement('blockquote');
      rootBQ.className = 'bq copyable bq-l1';
      rootBQ.innerHTML = '<span class="copy-hint">Copiar</span>';
      let currentLevel = 1;
      const stackBQ = [rootBQ];
      items.forEach(({level, text})=>{
        while(level > currentLevel){
          const inner = document.createElement('blockquote');
          inner.className = 'bq bq-l' + Math.min(currentLevel+1,3);
          stackBQ[stackBQ.length-1].appendChild(inner);
          stackBQ.push(inner);
          currentLevel++;
        }
        while(level < currentLevel){
          stackBQ.pop();
          currentLevel--;
        }
        const divLine = document.createElement('div');
        divLine.className = 'bq-line';
        divLine.innerHTML = inlineMD(text);
        stackBQ[stackBQ.length-1].appendChild(divLine);
      });
      rootBQ.onclick = ()=>copy(rootBQ);
      currentContainer().appendChild(rootBQ);
      continue;
    }

    // callouts estendidos
    const mCallAny = norm.match(/^\s*(::(info|warn|tip|note|success|danger)|::\.|:|\?)\s+(.*)$/i);
    if(mCallAny){
      flushParagraph();
      let kind = 'note';
      if(mCallAny[1] === '::.') kind = 'aside';
      else if(mCallAny[1] === ':') kind = 'note';
      else if(mCallAny[1] === '?') kind = 'question';
      else kind = (mCallAny[2] || 'info').toLowerCase();

      let textBuf = [mCallAny[3]];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const nextNorm = nextLine.replace(/[’‘]/g, "'").trim();
        if (nextNorm === '') break;
        if (/^\s*(::(info|warn|tip|note|success|danger)|::\.|:|\?)\s+/i.test(nextNorm)) break;
        textBuf.push(nextLine.trim());
        j++;
      }
      i = j;
      const div = document.createElement('div');
      div.className = 'callout copyable ' + kind;
      div.innerHTML = '<span class="copy-hint">Copiar</span>' + inlineMD(textBuf.join(' '));
      div.onclick = ()=>copy(div);
      currentContainer().appendChild(div);
      continue;
    }

    // math $$ … $$
    if(/^\s*\$\$\s*$/.test(line)){
      flushParagraph(); i++;
      let math = '';
      while(i<lines.length && !/^\s*\$\$\s*$/.test(lines[i])){ math += lines[i++] + '\\n'; }
      const eq = document.createElement('div');
      eq.className = 'equation copyable';
      eq.innerHTML = '<span class="copy-hint">Copiar</span>'+ escapeHtml(math.trim());
      eq.onclick = ()=>copy(eq);
      currentContainer().appendChild(eq);
      if(i<lines.length) i++;
      continue;
    }

    // table
    if(/^\s*\|.*\|\s*$/.test(line)){
      flushParagraph();
      let rows = [ line ];
      while(i+1<lines.length && /^\s*\|.*\|\s*$/.test(lines[i+1])){ rows.push(lines[++i]); }
      const tbl = document.createElement('table'); tbl.className='md-table';
      rows.forEach((r,idx)=>{
        const tr = document.createElement('tr');
        const cells = r.trim().slice(1,-1).split('|').map(c=>c.trim());
        const isSep = (idx===1 && cells.every(x=>/^:?-{3,}:?$/.test(x)));
        if(isSep) return;
        cells.forEach(c=>{
          const cell = document.createElement((idx===0)?'th':'td');
          cell.innerHTML = inlineMD(c);
          tr.appendChild(cell);
        });
        tbl.appendChild(tr);
      });
      currentContainer().appendChild(tbl); i++; continue;
    }

    // listas
    const mLi = line.match(/^\s*(?:([-*+])\s+|\d+\.\s+)(.+)$/);
    if(mLi){
      flushParagraph();
      const ordered = /^\s*\d+\.\s+/.test(line);
      const list = document.createElement(ordered?'ol':'ul');
      list.className = 'md-list';
      while(i<lines.length){
        const l = lines[i];
        if(!/^\s*(?:[-*+]\s+|\d+\.\s+)/.test(l)) break;
        const raw = l.replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/,'');
        const task = raw.match(/^\s*\[( |x|X)\]\s*(.*)$/);
        const li = document.createElement('li');
        li.className = 'md-li';
        if(task){
          if(!list.classList.contains('md-task')) list.classList.add('md-task');
          const box = document.createElement('input'); box.type='checkbox'; box.checked = /x/i.test(task[1]); box.disabled = true;
          const span = document.createElement('span'); span.innerHTML = inlineMD(task[2]);
          li.append(box, span);
        }else{
          li.innerHTML = inlineMD(raw);
        }
        list.appendChild(li); i++;
      }
      currentContainer().appendChild(list); continue;
    }

    // parágrafos
    if(line.trim()===''){ flushParagraph(); i++; continue; }
    buf.push(line.trim()); i++;
  }
  flushParagraph();
  toast('Livro (aninhado) gerado!');
}

