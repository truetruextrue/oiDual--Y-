
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
