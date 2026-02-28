
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





const DEMO_MD = "# Demo \u2014 A\u00e7\u00f5es e Blocos\n\n[[btn:gerar|Gerar (texto do editor)]] [[btn:nested|Gerar (aninhado)]] [[btn:md|Salvar .md]] [[btn:pdf|Imprimir PDF]]\n\n: Esta p\u00e1gina demonstra **bot\u00f5es inline** que executam as MESMAS a\u00e7\u00f5es dos bot\u00f5es do topo.\n\n## Fun\u00e7\u00e3o em aspas (render == equa\u00e7\u00e3o)\n\u201cfunction pulse(t){ return Math.cos(t) * 0.369; }\u201d\n\n## Cita\u00e7\u00f5es\n> n\u00edvel 1\n>> n\u00edvel 2\n>>> n\u00edvel 3\n\n## Callouts\n: Nota simples\n::warn Aten\u00e7\u00e3o\n::. Aside\n? Pergunta\n\n## Lista de tarefas\n- [ ] pendente\n- [x] feita\n\n## Tabela\n| A | B |\n|---|---|\n| 1 | 2 |\n\n## C\u00f3digo (aspas)\n'''js\nconsole.log(\"ok das aspas\");\n'''\n";
const ACTIONS = {
  demo(){ autoBuild(DEMO_MD); },
  gerar(){ const v = (document.getElementById('srcText')?.value||'').trim(); autoBuild(v || DEMO_MD); },
  nested(){ const v = (document.getElementById('srcText')?.value||'').trim(); if(typeof autoBuildNested==='function') autoBuildNested(v || DEMO_MD); else autoBuild(v || DEMO_MD); },
  importar(){ if(typeof openImporter==='function') openImporter(); },
  md(){
    // Call the global exportMD implementation if available.
    if(typeof window.exportMD === 'function') window.exportMD();
  },
  pdf(){ window.print(); },
  reading(){ if(typeof toggleReading==='function') toggleReading(); },
  theme(){ if(typeof cycleTheme==='function') cycleTheme(); },
  limpar(){ const r=document.getElementById('root'); if(r) r.innerHTML=''; toast && toast('Limpou'); },
  tts(){ document.getElementById('btn-tts')?.click(); },
  'tts-sel'(){ document.getElementById('btn-tts-sel')?.click(); },
  'tts-stop'(){ document.getElementById('btn-tts-stop')?.click(); }
};
document.addEventListener('click', (e)=>{
  const a = e.target.closest('[data-action]');
  if(!a) return;
  const act = a.dataset.action;
  if(act && ACTIONS[act]){ e.preventDefault(); ACTIONS[act](a); }
});




(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);
function ensureHomeInMaster(){
  const area = $('#masterActions');
  if(!area) return;
  if(!area.querySelector('[data-act="home"]')){
    const b = document.createElement('button');
    b.className='chip'; b.textContent='Home'; b.dataset.act='home';
    // Inserir como primeiro botão (antes de Copiar tudo/Iniciar)
    area.insertBefore(b, area.firstChild);
  }
  // Delegação de clique para o Master Block
  const block = $('#masterBlock') || document;
  if(!block.dataset.boundHomeAct){
    block.dataset.boundHomeAct='1';
    block.addEventListener('click', (e)=>{
      const t = e.target.closest('[data-act="home"]'); if(!t) return;
      // Reusa ACTIONS.home quando disponível; senão fallback para stacks/topo
      if(window.ACTIONS && typeof ACTIONS.home==='function'){ ACTIONS.home(); return; }
      const acc = $('#stackHost details.acc') || $('#stackHost');
      if(acc){ try{ acc.open = true; }catch{}; acc.scrollIntoView({behavior:'smooth', block:'start'}); }
      else window.scrollTo({top:0, behavior:'smooth'});
    }, true);
  }
}
document.addEventListener('DOMContentLoaded', ensureHomeInMaster);
})();


(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

const CFG = window.FAB_MINI || (window.FAB_MINI = {
  mode:'replace', include_back:false,
  labels:{ autogerar:'Auto‑Gerar', pdf:'PDF', tts:'TTS', home:'Home', back:'Voltar' },
  autogerar:{ before:null, run:null }
});

function ensureActions(){
  if(!window.ACTIONS) window.ACTIONS = {};

  if(typeof ACTIONS.home!=='function'){
    ACTIONS.home = ()=>{
      if(typeof window.renderWelcome==='function'){ renderWelcome(); return; }
      const acc = $('#stackHost details.acc') || $('#stackHost');
      if(acc){ try{ acc.open = true; }catch{}; acc.scrollIntoView({behavior:'smooth', block:'start'}); }
      else window.scrollTo({top:0, behavior:'smooth'});
    };
  }
  if(typeof ACTIONS.ttsToggle!=='function'){
    ACTIONS.ttsToggle = ()=>{ const b=document.getElementById('btn-tts'); if(b) b.click(); };
  }
  if(typeof ACTIONS.autoGerar!=='function'){
    ACTIONS.autoGerar = ()=>{
      try{ if(typeof CFG.autogerar.before==='function') CFG.autogerar.before(); }catch{}
      if(typeof CFG.autogerar.run==='function') return CFG.autogerar.run();
      if(typeof window.openImporter==='function') return openImporter();
      if(window.ACTIONS?.demo) return ACTIONS.demo();
      if(typeof window.autoBuild==='function') return autoBuild('# Demo\n\n...');
    };
  }
  if(typeof ACTIONS.pdf!=='function'){ ACTIONS.pdf = ()=>window.print(); }
  if(typeof ACTIONS.back!=='function'){
    ACTIONS.back = ()=>{ if(history.length>1) history.back(); else ACTIONS.home?.(); };
  }
}

function rebuildFAB(){
  const menu = $('.fab .menu') || $('#fab .menu') || $('.menu[data-fab]');
  if(!menu) return;

  const keep = ['home','autogerar','tts','pdf']; // ordem desejada
  if(CFG.include_back) keep.splice(1,0,'back'); // opção: Home, Back, Auto‑Gerar, TTS, PDF

  if(CFG.mode==='replace'){
    menu.innerHTML='';
  }else{
    // hide todos os outros
    menu.querySelectorAll('.btn,button,a').forEach(el=>{
      if(!keep.includes(el.dataset.action)) el.style.display='none';
    });
  }

  const make = (act,text)=>{
    const b=document.createElement('button'); b.className='btn'; b.dataset.action=act; b.textContent=text; return b;
  };
  const label = CFG.labels || {};
  keep.forEach(act=>{
    const sel = `[data-action="${act}"]`;
    const txt = label[act] || ({home:'Home',back:'Voltar',autogerar:'Auto‑Gerar',tts:'TTS',pdf:'PDF'})[act];
    const exists = menu.querySelector(sel);
    if(exists){ exists.textContent = txt; exists.style.display=''; }
    else menu.appendChild(make(act, txt));
  });

  if(!menu.dataset.boundMini){
    menu.dataset.boundMini='1';
    menu.addEventListener('click',(e)=>{
      const b=e.target.closest('[data-action]'); if(!b) return;
      const act=b.dataset.action;
      const map = {home:'home',back:'back',autogerar:'autoGerar',tts:'ttsToggle',pdf:'pdf', dts:'ttsToggle'};
      const fn = map[act] && ACTIONS[map[act]];
      if(typeof fn==='function'){ e.preventDefault(); fn(); }
    }, true);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ ensureActions(); rebuildFAB(); });
})();



(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

const HERBIE = window.HERBIE || (window.HERBIE = {
  preset: (localStorage.getItem('herbiePreset')||'blue').toLowerCase(),
  presets: {
    blue:    { a:'#67e6ff', b:'#3bd3ff', name:'Blue' },
    gold:    { a:'#f7d774', b:'#ffcc55', name:'Gold' },
    thermal: { a:'#ff7a00', b:'#ff3366', name:'Thermal' },
  },
  setPreset(name){
    name=(name||'').toLowerCase();
    const p=this.presets[name]||this.presets.blue;
    this.preset = name in this.presets ? name : 'blue';
    localStorage.setItem('herbiePreset', this.preset);
    const root=document.documentElement;
    root.style.setProperty('--orb-a', p.a);
    root.style.setProperty('--orb-b', p.b);
    window.dispatchEvent(new CustomEvent('herbiechange',{detail:{ name:this.preset, colors:p }}));
    if(window.toast) toast('Preset: '+(p.name||name));
  },
  setButtonsOpacity(v){
    const val=Math.max(.2, Math.min(1, Number(v)||.92));
    document.documentElement.style.setProperty('--fab-btn-opacity', String(val));
    localStorage.setItem('herbieBtnOpacity', String(val));
  },
  cyclePresets(){
    const list=Object.keys(this.presets); const i=list.indexOf(this.preset);
    this.setPreset(list[(i+1)%list.length]);
  }
});

// augment ORB picker with preset chips
function enhancePicker(){
  const fab=$('#fab'); if(!fab) return;
  let picker = $('#orb-picker');
  if(!picker) return;
  if(!picker.querySelector('.row-presets')){
    const row = document.createElement('div');
    row.className='row-presets';
    row.style.marginTop='6px';
    row.innerHTML = `
      <button class="chip" data-preset="blue">Blue</button>
      <button class="chip" data-preset="gold">Gold</button>
      <button class="chip" data-preset="thermal">Thermal</button>`;
    picker.appendChild(row);
    picker.addEventListener('click', (e)=>{
      const b=e.target.closest('[data-preset]'); if(!b) return;
      HERBIE.setPreset(b.dataset.preset);
      fab.classList.remove('show-picker');
    });
  }
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  const savedOpacity = parseFloat(localStorage.getItem('herbieBtnOpacity')||'0');
  if(savedOpacity>0){ HERBIE.setButtonsOpacity(savedOpacity); }
  enhancePicker();
  HERBIE.setPreset(HERBIE.preset);
});

window.HERBIE = HERBIE;
})();



/* ============================================================
   Monolithic MD Generator (BUGADÃO) — v3
   - Default: "Glitch Mode" ON (windows-1252 decode)
   - Toggle Glitch/UTF-8 sem reupload (mantém bytes em cache)
   - Upload → textarea (staging), só render se pedir
   - Converter → MD / Converter+Gerar
   - Callouts inline ::info/::warn/::aside
   - Tabela pipe → lista-tabela (linhas "- "), coluna-chave → (parênteses)
   ============================================================ */
let MDGEN_GLITCH_MODE = true;
let __mdgen_lastBytes = null;   // ArrayBuffer dos bytes do último upload
let __mdgen_filename  = null;

function tryFindTextarea(){
  return document.querySelector('#srcText, #src, textarea[name="src"], textarea');
}

function decodeBytes(ab, label){
  try{
    const dec = new TextDecoder(label || (MDGEN_GLITCH_MODE ? 'windows-1252' : 'utf-8'), {fatal:false});
    return dec.decode(new Uint8Array(ab));
  }catch(e){
    console.warn('Decoder falhou, fallback utf-8', e);
    return new TextDecoder('utf-8').decode(new Uint8Array(ab));
  }
}

function setTextarea(text){
  const ta = tryFindTextarea();
  if(!ta) return;
  ta.value = text;
  ta.focus();
  ta.setSelectionRange(0, Math.min(text.length, 2000));
}

function generateSmartMD(input, opts={}){
  const o = Object.assign({ title:'Documento Convertido', addHeaderButtons:true, addMeta:true }, opts||{});
  let txt = String(input||'').replace(/\r\n?/g,'\n').replace(/[“”]/g,'"').replace(/[’‘]/g,"'").replace(/'''/g,'```');
  if(!/^#\s/m.test(txt)){ txt = `# ${o.title}\n\n` + txt; }

  const lines = txt.split('\n'), OUT=[]; let i=0;
  const KEY_WARN=/\b(atenç(ã|a)o|cuidado|risco|quebra|bug|perigo)\b/i;
  const KEY_INFO=/\b(nota|observa(ç|c)[aã]o|info|dica|lembrete)\b/i;
  const KEY_ASIDE=/\b(contexto|bastidor|extra|observa(ç|c)[aã]o lateral)\b/i;
  const KEY_OK=/\b(sucesso|ok|pronto|feito)\b/i;
  const KEY_Q=/\?\s*$/;
  function push(s){ OUT.push(s); }

  while(i<lines.length){
    let line=lines[i];
    if(/^\s*```/.test(line)){ push(line); i++; while(i<lines.length && !/^\s*```/.test(lines[i])) push(lines[i++]); if(i<lines.length) push(lines[i++]); continue; }
    const mFn=line.match(/^\s*["“”](.+function\s+[a-zA-Z_$][\w$]*\s*\([^)]*\)\s*\{.*\})["“”]\s*$/);
    if(mFn){ push('```js'); push(mFn[1]); push('```'); i++; continue; }
    const plain=line.trim();
    if(plain){
      if(KEY_WARN.test(plain)){  push(`::warn ${plain}`);  i++; continue; }
      if(KEY_ASIDE.test(plain)){ push(`::aside ${plain}`); i++; continue; }
      if(KEY_INFO.test(plain)){  push(`::info ${plain}`);  i++; continue; }
      if(KEY_OK.test(plain)){    push(`: ${plain}`);       i++; continue; }
      if(KEY_Q.test(plain)){     push(`? ${plain}`);       i++; continue; }
    }
    push(line); i++;
  }
  let md=OUT.join('\n');

  // Normaliza callouts multiline → linha única
  md = md.replace(
    /(^|\n)::(info|warn|aside|pulse|loop)\s*\n+([^:\n>][^\n]+(?:\n(?!::(info|warn|aside|pulse|loop)\b)[^\n]+)*)/gi,
    (m, pre, kind, body)=>`${pre}::${kind} ${body.replace(/\s*\n\s*/g,' ').trim()}`
  );

  // Tabelas pipe → lista-tabela (com coluna-chave opcional)
  md = md.replace(
    /(^|\n)\|([^\n]+)\|\n\|([ :\-|]+)\|\n((?:\|[^\n]+\|\n?)+)/g,
    (m, pre, headerRow, sepRow, bodyRows) => {
      const headers = headerRow.split('|').map(s=>s.trim());
      let keyIdx = -1;
      for(let i=0;i<headers.length;i++){
        const h=headers[i];
        if(/\(key\)|\[key\]|\*$/i.test(h) || /\b(chave|key)\b/i.test(h)){
          keyIdx=i; headers[i]=h.replace(/\s*(\(key\)|\[key\]|\*)\s*$/i,''); break;
        }
      }
      const body = bodyRows.trim().split('\n').map(r=>r.trim()).filter(Boolean).map(r=>{
        const cells = r.replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim());
        if(keyIdx>=0 && keyIdx<cells.length){ const c=cells[keyIdx]; cells[keyIdx]=/^\(.*\)$/.test(c)?c:`(${c})`; }
        return '- | '+cells.join(' | ')+' |';
      }).join('\n');
      return `${pre}|${headers.join(' | ')}|\n|${sepRow}|\n${body}\n`;
    }
  );

  if(o.addHeaderButtons){
    md = md.replace(/^#\s+.+$/m, (h1)=>`${h1}\n\n[[btn:gerar|Gerar]] [[btn:nested|Gerar (aninhado)]] [[btn:md|Salvar .md]] [[btn:pdf|Imprimir PDF]]\n`);
  }
  if(o.addMeta){ md += `\n\n::aside Documento gerado por MD Smart Generator (BUGADÃO v3)`;}
  return md;
}

// Exportador .md no padrão "lista-tabela"
function installExportMD_ListTable(){
  if(window.exportMD) return;
  window.exportMD = function(){
    const root=document.getElementById('root'); if(!root){ alert('Sem root'); return; }
    const parts=[];
    root.querySelectorAll('details.acc').forEach((d,secIdx)=>{
      const h=d.querySelector('summary h2'); if(h){ const mark='#'.repeat(secIdx===0?1:2); parts.push(`${mark} ${h.textContent.trim()}`); }
      d.querySelectorAll('.sec > *').forEach(el=>{
        if(el.matches('p')) parts.push(el.innerText.replace('Copiar','').trim());
        else if(el.matches('blockquote')) parts.push('> '+el.innerText.replace('Copiar','').trim());
        else if(el.matches('.callout')){
          const t=el.className.match(/\b(info|warn|tip|note|success|danger|aside|question)\b/);
          const kind=t?(t[1]==='note'?':': t[1]==='question'?'?': t[1]==='aside'?'::aside':'::'+t[1]):': ';
          parts.push(`${kind} `+el.innerText.replace('Copiar','').trim());
        }else if(el.matches('pre.md-code')){
          const code=el.querySelector('code')?.textContent||''; parts.push('```\n'+code+'\n```');
        }else if(el.matches('table.md-table')){
          const rows=[...el.querySelectorAll('tr')].map(tr=>[...tr.children].map(td=>td.innerText.trim()));
          if(rows.length){
            parts.push('| '+rows[0].join(' | ')+' |');
            parts.push('| '+rows[0].map(()=> '---').join(' | ')+' |');
            rows.slice(1).forEach(r=> parts.push('- | '+r.join(' | ')+' |'));
          }
        }else if(el.matches('ul,ol')){
          el.querySelectorAll('li').forEach(li=>parts.push('- '+li.innerText.trim()));
        }
      });
    });
    const blob=new Blob([parts.join('\n\n')],{type:'text/markdown'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='export_listTable.md'; a.click(); URL.revokeObjectURL(a.href);
    (window.toast||console.log)('.md exportado (lista-tabela)');
  };
}

// Upload → staging: LÊ COMO BYTES e decodifica com windows-1252 (Glitch ON) ou utf-8 (Glitch OFF)
function installUploadStagingBugadao(opts={}){
  const o = Object.assign({inputSelector:'input[type=file], #upload, #fileUpload, .upload-input'}, opts||{});
  const inputs = Array.from(document.querySelectorAll(o.inputSelector));
  const ta = tryFindTextarea();
  inputs.forEach(inp=>{
    if(inp.dataset.mdgenUpload==='1') return;
    inp.dataset.mdgenUpload='1';
    inp.addEventListener('change', (ev)=>{
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      __mdgen_filename = f.name;
      const reader = new FileReader();
      reader.readAsArrayBuffer(f); // bytes puros
      reader.onload = ()=>{
        __mdgen_lastBytes = reader.result;
        const text = decodeBytes(__mdgen_lastBytes, MDGEN_GLITCH_MODE ? 'windows-1252' : 'utf-8');
        setTextarea(text);
        (window.toast||console.log)(`Upload carregado no input (staging, ${MDGEN_GLITCH_MODE?'GLITCH 1252':'UTF-8'})`);
      };
    }, false);
  });
}

// Monta UI (botões + toggle Glitch)
function mountMDGeneratorUI(){
  const tab=document.querySelector('#tab-text')||document.body;
  if(tab.querySelector('.btn-converter')) return;
  const ta = tryFindTextarea();
  const bar=document.createElement('div'); bar.style.display='flex'; bar.style.gap='8px'; bar.style.marginTop='8px'; bar.style.flexWrap='wrap';

  const b1=document.createElement('button'); b1.className='btn btn-converter'; b1.textContent='Converter → MD';
  b1.onclick=()=>{ const raw=(ta&&ta.value)?ta.value:''; const md=generateSmartMD(raw||'# Documento\n\nTexto aqui...'); if(ta){ ta.value=md; ta.focus(); ta.setSelectionRange(0,md.length);} (window.toast||console.log)('Texto convertido para MD'); };

  const b2=document.createElement('button'); b2.className='btn btn-gen-inteligente'; b2.textContent='Converter+Gerar';
  b2.onclick=()=>{ const raw=(ta&&ta.value)?ta.value:''; const md=generateSmartMD(raw||'# Documento\n\nTexto aqui...'); if(typeof window.autoBuild==='function'){ window.autoBuild(md); (window.toast||console.log)('Convertido e renderizado (ARN)'); } else { alert(md);} };

  const wrap=document.createElement('label'); wrap.style.display='inline-flex'; wrap.style.alignItems='center'; wrap.style.gap='6px';
  const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=true; cb.title='Glitch Mode (windows-1252)';
  const sp=document.createElement('span'); sp.textContent='😵‍💫 Glitch Mode';
  cb.onchange=()=>{
    MDGEN_GLITCH_MODE = cb.checked;
    if(__mdgen_lastBytes){
      const text = decodeBytes(__mdgen_lastBytes, MDGEN_GLITCH_MODE ? 'windows-1252' : 'utf-8');
      setTextarea(text);
      (window.toast||console.log)(`Re-decodificado ${__mdgen_filename||''} → ${MDGEN_GLITCH_MODE?'GLITCH 1252':'UTF-8'}`);
    }
  };
  wrap.appendChild(cb); wrap.appendChild(sp);

  bar.appendChild(b1); bar.appendChild(b2); bar.appendChild(wrap);
  tab.appendChild(bar);
}

function autoMountBugadao(){
  mountMDGeneratorUI();
  installUploadStagingBugadao();
  // exportador md
  installExportMD_ListTable();
  console.info('[MD Smart Generator · BUGADÃO v3] pronto.');
}
window.addEventListener('DOMContentLoaded', autoMountBugadao);

