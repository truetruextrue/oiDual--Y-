
(()=>{'use strict';

// ===== Detectores =====
function looksLikeRTF(text){
  if(!text) return false;
  const t = String(text).slice(0, 250);
  if(/^\s*{\\rtf1/i.test(t)) return true;
  if(/\\rtf1\\ansi/.test(t)) return true;
  const slashCount = (t.match(/\\/g) || []).length;
  if(slashCount > 12 && /\\(fonttbl|colortbl|viewkind|pard|stylesheet)\b/.test(t)) return true;
  return false;
}

function looksLikeHTML(text){
  if(!text) return false;
  const t = String(text).slice(0, 400);
  if(/<!DOCTYPE html/i.test(t)) return true;
  if(/<html[\s>]/i.test(t)) return true;
  if(/<body[\s>]/i.test(t)) return true;
  // fallback: muitas tags de abertura
  const tagCount = (t.match(/<\w+/g)||[]).length;
  return tagCount > 5;
}

// ===== RTF → texto =====
function decodeRTF(raw){
  if(!raw) return '';
  let txt = String(raw);

  txt = txt.replace(/\r\n?/g, '\n');
  txt = txt.replace(/\\par[d]?\b/g, '\n')
           .replace(/\\line\b/g, '\n');

  txt = txt.replace(/\\'([0-9a-fA-F]{2})/g, (_,hex)=>{
    const code = parseInt(hex,16);
    return Number.isFinite(code) ? String.fromCharCode(code) : '';
  });

  txt = txt.replace(/\\u(-?\d+)\??/g, (_,num)=>{
    let code = parseInt(num,10);
    if(!Number.isFinite(code)) return '';
    if(code < 0) code = 65536 + code;
    try{ return String.fromCharCode(code); }catch{ return ''; }
  });

  txt = txt.replace(/\\[a-zA-Z]+-?\d*(?:\s)?/g, '');
  txt = txt.replace(/[{}]/g, '');
  txt = txt.replace(/\n{3,}/g, '\n\n');

  return txt.trim();
}

// ===== HTML → texto (estilo 78konvert) =====
function htmlToPlain(mdLike){
  let t = String(mdLike||'');
  // quebras básicas
  t = t.replace(/<br\s*\/?>/gi, '\n')
       .replace(/<\/p>/gi, '\n\n')
       .replace(/<\/div>/gi, '\n')
       .replace(/<\/li>/gi, '\n');

  // listas
  t = t.replace(/<li[^>]*>/gi, '- ');
  // headings → #
  t = t.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_m,g)=>'\n# '+g.trim()+'\n')
       .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m,g)=>'\n## '+g.trim()+'\n')
       .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_m,g)=>'\n### '+g.trim()+'\n');

  // blockquote
  t = t.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m,g)=>{
    const inner = g.replace(/<[^>]+>/g,'').trim();
    return inner ? '\n> '+inner+'\n' : '\n';
  });

  // remove qualquer outra tag
  t = t.replace(/<style[\s\S]*?<\/style>/gi, '')
       .replace(/<script[\s\S]*?<\/script>/gi, '')
       .replace(/<[^>]+>/g, '');

  // espaços & entidades simples
  t = t.replace(/&nbsp;/g, ' ')
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'");

  t = t.replace(/[ \t]+\n/g, '\n')
       .replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

// ===== Wraps nos builders =====
function preprocessMaybe(text){
  let t = text;
  if(!t) return t;

  if(looksLikeRTF(t)){
    try{
      const decoded = decodeRTF(t);
      window.__current_md = decoded;
      window.__current_title = (decoded.match(/^\s*#\s+(.+)$/m)||[])[1] || window.__current_title;
      window.toast && toast('RTF decodificado → MD');
      return decoded;
    }catch(e){
      console.warn('[RTF/HTML_RENDER] erro RTF', e);
      return t;
    }
  }

  if(looksLikeHTML(t)){
    try{
      const plain = htmlToPlain(t);
      window.__current_md = plain;
      window.__current_title = (plain.match(/^\s*#\s+(.+)$/m)||[])[1] || window.__current_title;
      window.toast && toast('HTML limpo → texto');
      return plain;
    }catch(e){
      console.warn('[RTF/HTML_RENDER] erro HTML', e);
      return t;
    }
  }

  return t;
}

// autoBuild (flat)
if(typeof window.autoBuild === 'function'){
  const orig = window.autoBuild;
  window.autoBuild = function(text){
    const t = preprocessMaybe(text);
    return orig(t);
  };
}

// autoBuildNested (aninhado)
if(typeof window.autoBuildNested === 'function'){
  const origN = window.autoBuildNested;
  window.autoBuildNested = function(text){
    const t = preprocessMaybe(text);
    return origN(t);
  };
}

// helper global p/ brincar no console
window.RTF_RENDER = {
  looksLikeRTF,
  looksLikeHTML,
  decodeRTF,
  htmlToPlain
};

})();
