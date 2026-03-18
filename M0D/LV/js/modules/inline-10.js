
(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

// — pega um container “ativo” sensato (igual ao master patch)
function getActiveRoot(){
  const picks = [
    '[data-pane="active"]','.stack .doc.active','.pane.active',
    '#renderOut','#mdOut','#viewer','#content','#root','main','article'
  ];
  for(const sel of picks){ const el=$(sel); if(el) return el; }
  return document.body;
}

// — ação KaTeX
async function runKaTeXActive(){
  try{
    const call = (root)=>{
      if(typeof window.KaTeXRender==='function') return window.KaTeXRender(root);
      // fallback: auto-render global se KaTeX já foi carregado
      if(typeof window.renderMathInElement==='function'){
        window.renderMathInElement(root||document.body,{
          delimiters:[
            {left:"$$",right:"$$",display:true},
            {left:"\\[",right:"\\]",display:true},
            {left:"$", right:"$", display:false},
            {left:"\\(", right:"\\)", display:false},
          ],
          throwOnError:false,
          ignoredTags:["script","noscript","style","textarea","code","pre"]
        });
      }
    };
    await call(getActiveRoot());
    (window.toast||console.log)('Σ KaTeX: render no painel ativo ✓');
  }catch(e){
    console.warn('[FAB_KATEX]', e);
    (window.toast||console.warn)('Falha ao renderizar KaTeX');
  }
}

// — garante ACTIONS.katex disponível
function ensureAction(){
  window.ACTIONS = window.ACTIONS || {};
  if(typeof window.ACTIONS.katex!=='function'){
    window.ACTIONS.katex = ()=> runKaTeXActive();
  }
}

// — cria/injeta o botão na #fab .menu
function ensureFabButton(){
  const menu = document.querySelector('#fab .menu');
  if(!menu) return;
  if(menu.querySelector('[data-action="katex"]')) return;
  const b = document.createElement('button');
  b.className = 'btn';
  b.dataset.action = 'katex';
  b.title = 'Render KaTeX (painel ativo)';
  b.textContent = 'Σ KaTeX';
  menu.appendChild(b);
}

// — delega clique do FAB pra chamar ACTIONS (segue o teu padrão)
function bindFabClicks(){
  const menu = document.querySelector('#fab .menu');
  if(!menu || menu.dataset.kxBound) return;
  menu.dataset.kxBound='1';
  menu.addEventListener('click',(e)=>{
    const t = e.target.closest('[data-action="katex"]'); if(!t) return;
    e.preventDefault(); ensureAction(); window.ACTIONS.katex();
  }, true);
}

// — observa o FAB para reinjetar o botão após “rebuild”
function watchFab(){
  const container = document.querySelector('#fab');
  if(!container || container.__kxObs) return;
  const obs = new MutationObserver(()=>{ ensureAction(); ensureFabButton(); bindFabClicks(); });
  obs.observe(container, { childList:true, subtree:true });
  container.__kxObs = obs;
}

// boot
function boot(){ ensureAction(); ensureFabButton(); bindFabClicks(); watchFab(); }
if(document.readyState!=='loading') boot();
else document.addEventListener('DOMContentLoaded', boot);

})();
