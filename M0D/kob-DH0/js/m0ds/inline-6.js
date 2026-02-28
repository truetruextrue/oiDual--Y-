
(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

const CFG = window.FAB_MINI || (window.FAB_MINI = {
  mode:'replace', include_back:false,
  labels:{ autogerar:'Auto‑Gerar', pdf:'PDF', tts:'TTS', home:'Home', back:'Voltar' },
  autogerar:{ before:null, run:null }
});

function ensureActions(){
  if(!window.ACTIONS) window.ACTIONS = {};

  if(typeof ACTIONS.home!=='function'){
    ACTIONS.home = ()=>{
      if(typeof window.renderWelcome==='function'){ renderWelcome(); return; }
      const acc = $('#stackHost details.acc') || $('#stackHost');
      if(acc){ try{ acc.open = true; }catch{}; acc.scrollIntoView({behavior:'smooth', block:'start'}); }
      else window.scrollTo({top:0, behavior:'smooth'});
    };
  }
  if(typeof ACTIONS.ttsToggle!=='function'){
    ACTIONS.ttsToggle = ()=>{ const b=document.getElementById('btn-tts'); if(b) b.click(); };
  }
  if(typeof ACTIONS.autoGerar!=='function'){
    ACTIONS.autoGerar = ()=>{
      try{ if(typeof CFG.autogerar.before==='function') CFG.autogerar.before(); }catch{}
      if(typeof CFG.autogerar.run==='function') return CFG.autogerar.run();
      if(typeof window.openImporter==='function') return openImporter();
      if(window.ACTIONS?.demo) return ACTIONS.demo();
      if(typeof window.autoBuild==='function') return autoBuild('# Demo\n\n...');
    };
  }
  if(typeof ACTIONS.pdf!=='function'){ ACTIONS.pdf = ()=>window.print(); }
  if(typeof ACTIONS.back!=='function'){
    ACTIONS.back = ()=>{ if(history.length>1) history.back(); else ACTIONS.home?.(); };
  }
}

function rebuildFAB(){
  const menu = $('.fab .menu') || $('#fab .menu') || $('.menu[data-fab]');
  if(!menu) return;

  const keep = ['home','autogerar','tts','pdf']; // ordem desejada
  if(CFG.include_back) keep.splice(1,0,'back'); // opção: Home, Back, Auto‑Gerar, TTS, PDF

  if(CFG.mode==='replace'){
    menu.innerHTML='';
  }else{
    // hide todos os outros
    menu.querySelectorAll('.btn,button,a').forEach(el=>{
      if(!keep.includes(el.dataset.action)) el.style.display='none';
    });
  }

  const make = (act,text)=>{
    const b=document.createElement('button'); b.className='btn'; b.dataset.action=act; b.textContent=text; return b;
  };
  const label = CFG.labels || {};
  keep.forEach(act=>{
    const sel = `[data-action="${act}"]`;
    const txt = label[act] || ({home:'Home',back:'Voltar',autogerar:'Auto‑Gerar',tts:'TTS',pdf:'PDF'})[act];
    const exists = menu.querySelector(sel);
    if(exists){ exists.textContent = txt; exists.style.display=''; }
    else menu.appendChild(make(act, txt));
  });

  if(!menu.dataset.boundMini){
    menu.dataset.boundMini='1';
    menu.addEventListener('click',(e)=>{
      const b=e.target.closest('[data-action]'); if(!b) return;
      const act=b.dataset.action;
      const map = {home:'home',back:'back',autogerar:'autoGerar',tts:'ttsToggle',pdf:'pdf', dts:'ttsToggle'};
      const fn = map[act] && ACTIONS[map[act]];
      if(typeof fn==='function'){ e.preventDefault(); fn(); }
    }, true);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ ensureActions(); rebuildFAB(); });
})();
