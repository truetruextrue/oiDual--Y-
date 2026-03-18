
(()=>{'use strict';
if(window.__LIST_BEAUTY_V2__) return; window.__LIST_BEAUTY_V2__=true;

const q=(s,r=document)=>[...r.querySelectorAll(s)];

const wrapLists=(root=document)=>{
  const lists = q('ul,ol',root).filter(el=>{
    if(el.closest('nav,menu,.no-beauty,.editor,.toolbar')) return false;
    if(el.classList.contains('ul-neo')||el.classList.contains('ol-neo')) return false; // já cuidado
    return true;
  });
  for(const el of lists){
    const isOL = el.tagName==='OL';
    el.classList.add(isOL?'ol-neo':'ul-neo');
    // preserva estilos existentes do usuário
    if(!el.parentElement.classList.contains('list-card')){
      const wrap = document.createElement('div');
      wrap.className='list-card';
      el.replaceWith(wrap); wrap.appendChild(el);
    }
  }
};

const asciiScore = t=>{
  const box=/[─│┌┐└┘╭╮╰╯═╬╠╣╦╩]+/g, grid=/[-_=+*#\\/|]{3,}/g;
  const L=t.split('\n'); let h=0;
  for(const ln of L){ if(box.test(ln)||grid.test(ln)||ln.trim().startsWith('> ')) h++; }
  return h>=Math.max(2,Math.ceil(L.length*0.2));
};

const enhanceASCII=(root=document)=>{
  const cand=new Set([...q('pre',root),...q('code.language-text, code[class*="language-plaintext"]',root)]);
  q('p',root).forEach(p=>{ const x=p.innerText||''; if(x.includes('\n')&&asciiScore(x)) cand.add(p); });
  for(const el of cand){
    if(el.closest('.ascii-card,.no-beauty')) continue;
    const txt=(el.innerText||'').trim(); if(!asciiScore(txt)) continue;
    const fig=document.createElement('figure'); fig.className='ascii-card';
    const pre=document.createElement('pre'); pre.textContent=txt; fig.appendChild(pre);
    if(!el.closest('pre')){ const fc=document.createElement('figcaption'); fc.className='ascii-cap'; fc.textContent='ASCII • renderizado em bloco'; fig.appendChild(fc); }
    el.replaceWith(fig);
  }
};

/* Heurística opcional: se o UL já tiver data-bullet="dash" ou class style-dash, mantém.
   Caso NÃO tenha, deixamos como diamante (padrão), para não interferir nos teus looks. */
const applyDashCapsuleByAttr=(root=document)=>{
  q('ul.ul-neo',root).forEach(ul=>{
    if(ul.matches('.style-dash,[data-bullet="dash"]')) return;
    // não força nada; o usuário decide via classe/atributo
  });
};

const run=(ctx=document)=>{
  wrapLists(ctx);
  enhanceASCII(ctx);
  applyDashCapsuleByAttr(ctx);
};

if(window.__RENDERBUS__?.on){
  window.__RENDERBUS__.on('after', run, {name:'list-ascii-beauty-v2', priority:95});
}else{
  (document.readyState==='loading') ? document.addEventListener('DOMContentLoaded',()=>run(document)) : run(document);
  new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>n.nodeType===1&&run(n))))
    .observe(document.body,{childList:true,subtree:true});
}
})();
