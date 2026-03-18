
(()=>{'use strict';

// — heurística: checa se o conteúdo parece RTF
function looksLikeRTF(text){
  if(!text) return false;
  const t = String(text).slice(0, 250);
  if(/^\s*{\\rtf1/i.test(t)) return true;
  if(/\\rtf1\\ansi/.test(t)) return true;
  const slashCount = (t.match(/\\/g) || []).length;
  if(slashCount > 12 && /\\(fonttbl|colortbl|viewkind|pard|stylesheet)\b/.test(t)) return true;
  return false;
}

// — decoder simples RTF -> texto / Markdown cru
function decodeRTF(raw){
  if(!raw) return '';
  let txt = String(raw);

  // normaliza quebras de linha
  txt = txt.replace(/\r\n?/g, '\n');

  // \par, \pard, \line -> \n
  txt = txt.replace(/\\par[d]?\b/g, '\n')
           .replace(/\\line\b/g, '\n');

  // \'hh (hex) -> char
  txt = txt.replace(/\\'([0-9a-fA-F]{2})/g, (_,hex)=>{
    const code = parseInt(hex,16);
    return Number.isFinite(code) ? String.fromCharCode(code) : '';
  });

  // \uNNNN? -> unicode
  txt = txt.replace(/\\u(-?\d+)\??/g, (_,num)=>{
    let code = parseInt(num,10);
    if(!Number.isFinite(code)) return '';
    if(code < 0) code = 65536 + code; // corrige negativos comuns
    try{ return String.fromCharCode(code); }catch{ return ''; }
  });

  // remove outros comandos RTF (\palavra, \palavraN)
  txt = txt.replace(/\\[a-zA-Z]+-?\d*(?:\s)?/g, '');

  // remove chaves de grupo { }
  txt = txt.replace(/[{}]/g, '');

  // compacta linhas em branco
  txt = txt.replace(/\n{3,}/g, '\n\n');

  return txt.trim();
}

// — wrap do autoBuild (flat)
if(typeof window.autoBuild === 'function'){
  const orig = window.autoBuild;
  window.autoBuild = function(text){
    let t = text;
    // se for RTF, decodifica antes de tudo
    if(looksLikeRTF(t)){
      try{
        const decoded = decodeRTF(t);
        // guarda o MD decodificado como “estado atual”
        window.__current_md = decoded;
        t = decoded;
        window.__current_title = (decoded.match(/^\s*#\s+(.+)$/m)||[])[1] || window.__current_title;
        window.toast && toast('RTF decodificado → MD');
      }catch(e){
        console.warn('[RTF_RENDER] erro ao decodificar RTF', e);
      }
    }
    return orig(t);
  };
}

// — wrap do autoBuildNested (aninhado)
if(typeof window.autoBuildNested === 'function'){
  const origN = window.autoBuildNested;
  window.autoBuildNested = function(text){
    let t = text;
    if(looksLikeRTF(t)){
      try{
        const decoded = decodeRTF(t);
        window.__current_md = decoded;
        t = decoded;
        window.__current_title = (decoded.match(/^\s*#\s+(.+)$/m)||[])[1] || window.__current_title;
        window.toast && toast('RTF decodificado → MD');
      }catch(e){
        console.warn('[RTF_RENDER] erro ao decodificar RTF (nested)', e);
      }
    }
    return origN(t);
  };
}

// — helper global, se você quiser brincar via console: RTF_RENDER.decode(textoRTF)
window.RTF_RENDER = {
  looksLike: looksLikeRTF,
  decode: decodeRTF
};

})();
