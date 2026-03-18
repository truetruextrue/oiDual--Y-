
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

