
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