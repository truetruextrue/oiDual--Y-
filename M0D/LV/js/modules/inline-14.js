
(()=>{'use strict';
const STYLE_ID='INLINE_CSS_RENDER_SAFE_V2';
function appendSafe(css){
  if(!css || !css.trim()) return;
  let s=document.getElementById(STYLE_ID);
  if(!s){ s=document.createElement('style'); s.id=STYLE_ID; document.head.appendChild(s); }
  s.appendChild(document.createTextNode('\n'+css));
}
window.CSS_INNER_SAFE = {
  applyFromDOM(root=document){
    let css='';
    root.querySelectorAll('style[data-inline]').forEach(el=>{
      const t=(el.textContent||'').trim(); if(t) css+='\n'+t;
    });
    appendSafe(css);
  },
  applyFromHTML(html){
    if(!html) return;
    // só <style data-inline>…</style>
    const re=/<style[^>]*\bdata-inline\b[^>]*>([\s\S]*?)<\/style>/gi; let m, css='';
    while((m=re.exec(html))) css+='\n'+(m[1]||'');
    appendSafe(css);
  }
};
document.addEventListener('DOMContentLoaded',()=> CSS_INNER_SAFE.applyFromDOM());
})();
