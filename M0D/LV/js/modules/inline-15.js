
(()=>{'use strict';
function loadOnceCSS(href,id){return new Promise(ok=>{ if(document.getElementById(id)) return ok();
  const l=document.createElement('link'); l.id=id; l.rel='stylesheet'; l.href=href; l.onload=ok; document.head.appendChild(l); });}
function loadOnceJS(src,id){return new Promise(ok=>{ if(document.getElementById(id)) return ok();
  const s=document.createElement('script'); s.id=id; s.src=src; s.defer=true; s.onload=ok; document.head.appendChild(s); });}
async function ensureKaTeX(){ if(window.renderMathInElement) return;
  const CDN="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist";
  await loadOnceCSS(`${CDN}/katex.min.css`,'katex_css');
  await loadOnceJS(`${CDN}/katex.min.js`,'katex_js');
  await loadOnceJS(`${CDN}/contrib/auto-render.min.js`,'katex_auto_js');
}
async function run(root){
  await ensureKaTeX();
  if(typeof window.KaTeXRender==='function') return window.KaTeXRender(root||document.body);
  if(window.renderMathInElement) window.renderMathInElement(root||document.body,{
    delimiters:[
      {left:"$$",right:"$$",display:true},
      {left:"\$begin:math:display$",right:"\\$end:math:display$",display:true},
      {left:"$", right:"$", display:false},
      {left:"\$begin:math:text$", right:"\\$end:math:text$", display:false},
    ],
    throwOnError:false,
    ignoredTags:["script","noscript","style","textarea","code","pre"]
  });
}
// envelopa os builders
['autoBuild','autoBuildNested'].forEach(name=>{
  const f=window[name];
  if(typeof f==='function' && !f.__kxKaTeXWrapped){
    window[name]=function(text){ const out=f(text); run(document.getElementById('root')); return out; }
    window[name].__kxKaTeXWrapped=true;
  }
});
})();
