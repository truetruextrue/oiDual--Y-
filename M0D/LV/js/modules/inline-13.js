
(()=>{'use strict';
function looksTitle(line){
  const t=line.trim();
  if(t.length<80 && /^[A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ0-9][^.!?]{2,}$/.test(t)) return true; // curto e sem pontuação final
  return false;
}
function isSubtitle(line){
  const t=line.trim();
  return t.length<90 && /[:—–-]\s+/.test(t); // “Título: subtítulo”
}
function bulletsNormalize(line){
  // 1) item → 1. item ; • item → - item
  return line
    .replace(/^\s*(\d+)[\)\]]\s+/,'$1. ')
    .replace(/^\s*[•·]\s+/,'- ');
}
function markdownifyPlain(text){
  const L=String(text||'').replace(/\r\n?/g,'\n').split('\n');
  if(/^\s*#\s+/.test(text)) return text; // já tem H1
  let out=[], seenH1=false, i=0;
  while(i<L.length){
    let line=L[i];

    // HR por longos traços
    if(/^\s*[—–-]{6,}\s*$/.test(line)){ out.push(''); out.push('---'); out.push(''); i++; continue; }

    // título/subtítulo heurístico
    if(!seenH1 && looksTitle(line)){
      out.push('# '+line.trim()); out.push(''); seenH1=true; i++; continue;
    }
    if(isSubtitle(line) && seenH1){
      out.push('## '+line.trim()); out.push(''); i++; continue;
    }

    // listas simples e numeradas
    line = bulletsNormalize(line);

    // “Termo: valor” vira lista de definição simples → callout
    const def = line.match(/^\s*([A-ZÁÂÃÀÉÊÍÓÔÕÚÜÇ].{1,40}):\s+(.+)$/);
    if(def){ out.push(':'+def[1]+' — '+def[2]); i++; continue; }

    // blocos de código heurísticos (muitas chaves/`;`)
    if(/[{;}=].{0,}$/.test(line) && (line.includes('function')||line.includes('=>'))){
      const buf=[line]; i++;
      while(i<L.length && L[i].trim()){
        buf.push(L[i]); i++;
        if(buf.length>1 && /;\s*$/.test(buf[buf.length-1])) break;
      }
      out.push('```js'); out.push(...buf); out.push('```'); out.push('');
      continue;
    }

    out.push(line); i++;
  }
  return out.join('\n');
}

if(typeof window.preprocessMD==='function'){
  const __orig = window.preprocessMD;
  window.preprocessMD = function(text){
    let t=String(text||'');
    // Se não há nenhum header e parece “texto corrido”, aplica markdownify
    const lacksHeaders = !/^\s*#{1,6}\s+/m.test(t) && !/^\s*\S+\n[-=]{3,}\s*$/m.test(t);
    const manyWords = (t.match(/\S+/g)||[]).length>40;
    if(lacksHeaders && manyWords) t = markdownifyPlain(t);
    return __orig(t);
  }
}
})();
