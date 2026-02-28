
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const toast=(m)=>{const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.querySelector('#toasts').appendChild(t);setTimeout(()=>t.remove(),2000)}
/* Reading */
function toggleReading(force){const el=document.documentElement; const will = typeof force==='boolean'? force : !el.classList.contains('reading'); el.classList.toggle('reading', will); localStorage.setItem('tl_reading', will?'1':'0'); toast(will?'Modo leitura':'Modo editor');}
document.getElementById('btn-reading').onclick=()=> toggleReading();
document.getElementById('read-exit').onclick=()=> toggleReading(false);
window.addEventListener('keydown',(e)=>{ if(e.key==='Escape') toggleReading(false); if(e.key.toLowerCase()==='r') toggleReading(); if(e.key.toLowerCase()==='t') cycleTheme(); });
/* Theme cycle */
const THEMES=['blue','gold','thermal'];
function setTheme(name){document.documentElement.classList.remove('theme-gold','theme-thermal'); if(name==='gold') document.documentElement.classList.add('theme-gold'); if(name==='thermal') document.documentElement.classList.add('theme-thermal'); localStorage.setItem('tl_theme',name); updateThemeLabel();}
function currentTheme(){return localStorage.getItem('tl_theme')||'blue'} function updateThemeLabel(){const map={blue:'Blue‑1',gold:'Gold',thermal:'Thermal'}; document.getElementById('btn-theme').textContent='Tema: '+map[currentTheme()];}
function cycleTheme(){const i=(THEMES.indexOf(currentTheme())+1)%THEMES.length; setTheme(THEMES[i]); toast('Tema: '+(THEMES[i]==='blue'?'Blue‑1':THEMES[i]==='gold'?'Gold':'Thermal'));}
document.getElementById('btn-theme').onclick=cycleTheme;
/* FAB & Tabs */
document.getElementById('fab-toggle').onclick=()=> document.getElementById('fab').classList.toggle('open');
document.getElementById('btn-imp').onclick=()=> openImporter(); document.getElementById('btn-pdf').onclick=()=> window.print();
function openImporter(){document.getElementById('imp').style.display='block'} function closeImporter(){document.getElementById('imp').style.display='none'}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab,.tab-content').forEach(e=>e.classList.remove('active'));t.classList.add('active');document.getElementById('tab-'+t.dataset.tab).classList.add('active')})
/* Audio */
let rec;if('webkitSpeechRecognition' in window||'SpeechRecognition' in window){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;rec=new SR();rec.lang='pt-BR';rec.continuous=true;rec.interimResults=true;rec.onresult=(e)=>{let txt='';for(let i=e.resultIndex;i<e.results.length;++i)txt+=e.results[i][0].transcript+(e.results[i].isFinal?'. ':'');document.getElementById('audioOutput').value=txt;};rec.onerror=()=>toast('Erro/Permissão negada');}else toast('STT não suportado.');
document.getElementById('startRec').onclick=()=>{try{rec.start();toast('Gravando...')}catch{toast('Não suportado')}};document.getElementById('stopRec').onclick=()=>{try{rec.stop();toast('Parado')}catch{}}
/* Files */

// Removed explicit onclick handler: md button is handled via data-action="md" and window.exportMD
// Legacy duplicate export function retained for reference but unused
function exportMD_deprecated(){
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
  const blob=new Blob([parts.join('\n\n')],{type:'text/markdown'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='export.md'; a.click(); URL.revokeObjectURL(a.href);
  toast('.md exportado');
}

document.getElementById('fileInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;document.getElementById('filePreview').textContent='Lendo '+f.name+'...'; if(f.name.endsWith('.pdf')){const buf=await f.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf}).promise;let txt='';for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const c=await p.getTextContent();txt+=c.items.map(it=>it.str).join(' ')+'\n';}autoBuild(txt);} else {autoBuild(await f.text());}});
/* Builder */


/* Builder (Markdown+ → DOM com seções) */

function autoBuild(text){
  closeImporter();
  const root = document.getElementById('root');
  root.innerHTML = '';

  const AUTO_SPLIT_EVERY = 14;
  let sectionCount = 0, blocksInSection = 0;
  let sec = null;

  function newSection(title){
    sectionCount++;
    const details = document.createElement('details');
    details.className = 'acc';
    details.open = false;
    const sum = document.createElement('summary');
    sum.innerHTML = '<span class="chev"></span><h2>'+ (title || ('Seção '+sectionCount)) +'</h2>';
    const cont = document.createElement('div'); cont.className = 'sec';
    details.append(sum, cont);
    root.appendChild(details);
    blocksInSection = 0;
    return details;
  }
  function ensureSection(titleIfNew){
    if(!sec) sec = newSection(titleIfNew||'Seção 1');
    if(blocksInSection >= AUTO_SPLIT_EVERY){
      sec = newSection((getSummary(sec)+' (cont.)'));
    }
    return sec;
  }
  function getSummary(details){
    const h = details.querySelector('summary h2');
    return h ? h.textContent : 'Seção';
  }
  function appendToSection(el){ ensureSection(); sec.lastChild.appendChild(el); blocksInSection++; }

  const lines = text.replace(/\r\n?/g,'\n').split('\n');
  let i = 0, inCode = false, codeLang = '', buf = [];
  let inFn = false, fnDepth = 0;

  const flushParagraph = ()=>{
    if(!buf.length) return;
    const content = buf.join(' ').trim();
    if(/^\s*(?:export\s+)?function\s+\w+\s*\([^)]*\)\s*\{[^]*\}\s*$/.test(content)){
      const div = document.createElement('div');
      div.className = 'equation copyable fn';
      div.innerHTML = '<span class="copy-hint">Copiar</span>' + content;
      div.onclick = ()=>copy(div);
      appendToSection(div);
      buf.length = 0;
      return;
    }
    const p = document.createElement('p');
    p.innerHTML = inlineMD(content);
    appendToSection(p);
    buf.length = 0;
  };

  while(i < lines.length){
    let line = lines[i];
    let norm = line.replace(/[’‘]/g, "'");

    // cercas de código: ``` e '''
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
        appendToSection(pre);
        buf.length = 0; inCode = false; codeLang = '';
      }else{
        buf.push(line);
      }
      i++; continue;
    }

    // função JS multi-linha sem cercas
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
        appendToSection(div);
        buf.length = 0; inFn = false; fnDepth = 0;
      }
      continue;
    }

    // headings
    const mH = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if(mH){
      flushParagraph();
      sec = newSection(mH[2].trim());
      i++; continue;
    }

    // hr
    if(/^\s*(?:---|\*\*\*)\s*$/.test(line)){
      flushParagraph();
      const hr = document.createElement('div'); hr.className = 'hr';
      appendToSection(hr); i++; continue;
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
      const stack = [rootBQ];
      items.forEach(({level, text})=>{
        while(level > currentLevel){
          const inner = document.createElement('blockquote');
          inner.className = 'bq bq-l' + Math.min(currentLevel+1,3);
          stack[stack.length-1].appendChild(inner);
          stack.push(inner);
          currentLevel++;
        }
        while(level < currentLevel){
          stack.pop();
          currentLevel--;
        }
        const div = document.createElement('div');
        div.className = 'bq-line';
        div.innerHTML = inlineMD(text);
        stack[stack.length-1].appendChild(div);
      });
      rootBQ.onclick = ()=>copy(rootBQ);
      appendToSection(rootBQ);
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
        // stop if blank line or another callout marker encountered
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
      appendToSection(div);
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
      appendToSection(eq);
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
      appendToSection(tbl); i++; continue;
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
      appendToSection(list); continue;
    }

    // parágrafos
    if(line.trim()===''){ flushParagraph(); i++; continue; }
    buf.push(line.trim()); i++;
  }
  flushParagraph();
  toast('Livro gerado!');
}


/* ===== Helpers p/ Markdown inline & util ===== */
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function autoLink(url){
  try{ const u = new URL(url); return `<a href="${u.href}" target="_blank" rel="noopener">${u.href}</a>`; }catch{return url;}
}

function inlineMD(s){
  s = escapeHtml(s);
  // imagens ![alt](src)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_,a,src)=>`<img class="md-img" alt="${a}" src="${src}">`);
  // links [txt](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_,t,href)=>`<a href="${href}" target="_blank" rel="noopener">${t}</a>`);
  // inline code
  s = s.replace(/`([^`]+)`/g, (_,c)=> `<code class="code-inline">${c}</code>`);
  // strong + em
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
  // strike
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  // autolink
  s = s.replace(/\bhttps?:\/\/[^\s)]+/g, m => autoLink(m));
  // action buttons: [[btn:act|Label]] and [Label](action:act)
  s = s.replace(/\[\[btn:([a-z0-9_-]+)(?:\|([^\]]+))?\]\]/gi, (_,a,label)=>`<button class="btn action" data-action="${a}">${label?escapeHtml(label):a}</button>`);
  s = s.replace(/\[([^\]]+)\]\(action:([a-z0-9_-]+)\)/gi, (_,label,act)=>`<button class="btn action" data-action="${act}">${escapeHtml(label)}</button>`);
  return s;
}




/* Restore */
(function(){ setTheme(localStorage.getItem('tl_theme')||'blue'); if(localStorage.getItem('tl_reading')==='1') document.documentElement.classList.add('reading'); })();

// ====== TTS (SpeechSynthesis) ======
(function(){
  if(!('speechSynthesis' in window)){ console.warn('SpeechSynthesis não suportado'); return; }
  window.__tts_on = false;
  let __tts_voice = null;
  function pickPTBRVoice(){
    const voices = speechSynthesis.getVoices();
    const cand = voices.find(v => /pt[-_]BR/i.test(v.lang)) || voices.find(v => /pt/i.test(v.lang));
    return cand || voices[0] || null;
  }
  function ensureVoice(){
    if(!__tts_voice){ __tts_voice = pickPTBRVoice(); }
  }
  function speakText(text){
    if(!window.__tts_on) { if(window.toast) toast('Ative a Voz'); return; }
    if(!text || !text.trim()) return;
    ensureVoice();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if(__tts_voice) u.voice = __tts_voice;
    u.lang = (__tts_voice && __tts_voice.lang) || 'pt-BR';
    u.rate = 1.0; u.pitch = 1.0; u.volume = 1.0;
    speechSynthesis.speak(u);
  }
  function stopTTS(){ speechSynthesis.cancel(); }
  function getSelectedText(){ return (window.getSelection && String(window.getSelection())) || ''; }
  function setTTS(on){
    window.__tts_on = !!on;
    const b = document.getElementById('btn-tts');
    if(b) b.textContent = 'Voz: ' + (window.__tts_on ? 'On' : 'Off');
    if(window.toast) toast(window.__tts_on ? 'Voz ativada' : 'Voz desativada');
  }
  document.addEventListener('click',(e)=>{
    if(e.target && e.target.id==='btn-tts'){ setTTS(!window.__tts_on); return; }
    if(e.target && e.target.id==='btn-tts-sel'){ const t=getSelectedText(); if(t) speakText(t); else if(window.toast) toast('Selecione um trecho primeiro'); return; }
    if(e.target && e.target.id==='btn-tts-stop'){ stopTTS(); return; }
    if(!window.__tts_on) return;
    const block = e.target.closest('p, li, blockquote, .coach, .callout, .equation, pre, td, th');
    if(!block) return;
    if(e.target.closest('button,a,.emoji-btn,.chip,.btn,#fab,.menu,#ttsDock')) return;
    let text = block.innerText || '';
    text = text.replace('Copiar','').trim();
    if(text) speakText(text);
  });
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = () => { if(!__tts_voice) __tts_voice = pickPTBRVoice(); };
  }
  window.__tts = { set:setTTS, speak:speakText, stop:stopTTS };
})();
// ====================================

async function copy(el){
  const txt=(el.innerText||'').replace('Copiar','').trim();
  try{ await navigator.clipboard.writeText(txt); toast('Copiado'); }
  catch(e){ console.warn('copy fail', e); }
}

  // Allow pasting clipboard content into the Auto‑Gerar textarea.
  async function pasteSrcText(){
    try{
      const text = await navigator.clipboard.readText();
      const ta = document.getElementById('srcText');
      if(ta){
        ta.value = text || '';
        toast('Colado do clipboard');
      }
    }catch(e){
      console.warn('paste fail', e);
      toast('Falha ao colar');
    }
  }






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







(()=>{'use strict';
if(window.__TEXT_BEAUTY_V3__) return; window.__TEXT_BEAUTY_V3__=true;

/* Utilitários */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=(s)=>s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

/* 0) Toggle edição rápida */
let EDIT_ON=false;
const toggleEdit=()=>{
  EDIT_ON=!EDIT_ON;
  document.body.toggleAttribute('data-edit', EDIT_ON);
  const host = document.getElementById('CONTENT') || document.querySelector('main, article, .render, .reader, body');
  if(host) host.contentEditable = EDIT_ON ? 'plaintext-only' : 'false';
};
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='e'){ e.preventDefault(); toggleEdit(); }
});

/* 1) Key:Value negrito (palavra:) + parênteses + chips [ ]
   - roda apenas em blocos de texto (p, li) e não mexe dentro de code/pre */
const processInline = (root=document)=>{
  const targets = $$('p, li, h1, h2, h3, h4, h5, h6', root).filter(n=>!n.closest('pre, code, .no-beauty'));
  const rxKV = /(^|\s)([A-Za-zÀ-ÿ0-9_]+):(?=\s|$)/g; // Palavra:
  const rxParen = /\(([^\n)]+)\)/g;                  // ( … )
  const rxChip  = /\[\[([^[\]]+)\]\]|\[([^[\]]+)\]/g; // [[a]] | [a]

  for(const el of targets){
    // evita processar múltiplas vezes
    if(el.dataset.inlineProcessed==='1') continue;
    el.dataset.inlineProcessed='1';

    const html = el.innerHTML;
    if(/<pre|<code|contenteditable/i.test(html)) continue;

    let out = html;

    // 1. Palavra:  → <strong>
    out = out.replace(rxKV, (m, sp, key)=> `${sp}<strong class="kv-key">${key}:</strong>`);

    // 2. ( ... )   → span-paren
    out = out.replace(rxParen, (m, inside)=> `<span class="span-paren">(${inside})</span>`);

    // 3. [ ... ] / [[ ... ]]  → chip/chip-btn
    out = out.replace(rxChip, (m, dbl, sgl)=>{
      const label = (dbl||sgl||'').trim();
      return `<span class="${dbl?'chip-btn':'chip'}" data-chip="${esc(label)}">${esc(label)}</span>`;
    });

    el.innerHTML = out;
  }
};

/* 2) Perguntas → .q-card (frases que terminam com '?') */
const processQuestions=(root=document)=>{
  const paras = $$('p', root).filter(n=>!n.closest('.q-card, pre, code, .no-beauty'));
  for(const p of paras){
    const txt = (p.innerText||'').trim();
    if(txt.endsWith('?') && !p.dataset.qProcessed){
      p.dataset.qProcessed='1';
      const wrap=document.createElement('div'); wrap.className='q-card';
      wrap.innerHTML = `<div class="q-ico">?</div><div class="q-body">${esc(txt)}</div>`;
      p.replaceWith(wrap);
    }
  }
};

/* 3) Flow text: melhora texto corrido, cria heading leve se linha for "Algo:" sozinha */
const beautifyFlow=(root=document)=>{
  const container = root.querySelector('.flow-text') || root; // se já tiver classe, usa; senão aplica heurística suave
  $$('p', container).forEach(p=>{
    const t=(p.innerText||'').trim();
    if(/^[^:\n]{3,}:\s*$/.test(t)){ // linha que termina com ":" vira heading leve
      p.classList.add('kv-head');
    }
    // Quebra parágrafos absurdamente longos em dois (heurística)
    if(t.length>600 && t.includes('. ')){
      const mark = t.indexOf('. ', Math.floor(t.length/2));
      if(mark>0){
        const a=t.slice(0, mark+1), b=t.slice(mark+1);
        const p2=p.cloneNode(); p2.textContent=b.trim();
        p.textContent=a.trim();
        p.insertAdjacentElement('afterend', p2);
      }
    }
  });
};

/* 4) Listas copiáveis: badge + click copy */
const enableCopyLists=(root=document)=>{
  const lists = $$('.list-card', root);
  for(const card of lists){
    if(card.querySelector('.copy-badge')) continue;
    const badge = document.createElement('div');
    badge.className='copy-badge'; badge.textContent='copiar';
    card.appendChild(badge);
    card.addEventListener('click', e=>{
      // evita copiar quando clicou em link/botão dentro
      if(e.target.closest('a,button,.chip,.chip-btn')) return;
      const txt = [...card.querySelectorAll('li')].map(li=>li.innerText.trim()).join('\n');
      navigator.clipboard.writeText(txt).then(()=>{
        badge.textContent='copiado!'; setTimeout(()=>badge.textContent='copiar',1200);
      });
    }, {passive:true});
  }
};

/* 5) HTML/SVG pass-through
   - ```html-raw ... ``` → renderiza
   - <div data-raw-html>…(escapado)…</div> → renderiza
*/
const renderRawHTML=(root=document)=>{
  // code fence transform
  $$('pre code', root).forEach(code=>{
    const cls = (code.className||'').toLowerCase();
    if(cls.includes('language-html-raw') || cls.includes('lang-html-raw')){
      const raw = code.textContent;
      const box = document.createElement('div');
      box.className='raw-html-card';
      box.innerHTML = `<div class="raw-note">HTML/SVG renderizado a partir de bloco <code>html-raw</code></div>`;
      const slot = document.createElement('div');
      slot.className='raw-slot';
      // injeta SEM esc, assumindo que o autor confia no conteúdo
      slot.innerHTML = raw;
      box.appendChild(slot);
      const pre = code.closest('pre');
      pre.replaceWith(box);
    }
  });

  // <div data-raw-html>…</div>
  $$('div[data-raw-html]', root).forEach(div=>{
    const raw = div.textContent; // assume texto escapado pelo md
    const box = document.createElement('div'); box.className='raw-html-card';
    const slot = document.createElement('div'); slot.className='raw-slot';
    slot.innerHTML = raw;
    box.appendChild(slot);
    div.replaceWith(box);
  });
};

/* 6) Delegação de cliques para chips (colchetes) */
document.addEventListener('click', e=>{
  const chip = e.target.closest('.chip, .chip-btn');
  if(chip){
    const label = chip.dataset.chip||chip.textContent.trim();
    // dispara um evento customizado para teu bus/orquestrador
    const ev = new CustomEvent('chip:click', {detail:{label, source:'text-beauty-v3'}});
    document.dispatchEvent(ev);
  }
}, {passive:true});

/* 7) Orquestração */
const run=(ctx=document)=>{
  processInline(ctx);
  processQuestions(ctx);
  beautifyFlow(ctx);
  enableCopyLists(ctx);
  renderRawHTML(ctx);
};

if(window.__RENDERBUS__?.on){
  window.__RENDERBUS__.on('after', run, {name:'text-beauty-v3', priority: 96});
}else{
  (document.readyState==='loading') ? document.addEventListener('DOMContentLoaded',()=>run(document)) : run(document);
  new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>n.nodeType===1&&run(n))))
    .observe(document.body,{childList:true,subtree:true});
}
})();