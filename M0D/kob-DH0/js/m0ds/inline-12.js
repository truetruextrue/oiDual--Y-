
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
