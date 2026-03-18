
(()=>{'use strict';
function initAsciiCarousel(root=document){
  const marks=[...root.querySelectorAll('p')].filter(p=>p.textContent.trim().toLowerCase().startsWith('::anim'));
  for(const mark of marks){
    const cfg=mark.textContent.trim().slice(6).trim();
    const ms=(/(\d{2,5})/.exec(cfg)||[])[1]||1200;
    const frames=[];
    let n=mark.nextSibling;
    while(n && !(n.nodeType===1 && n.matches('p') && n.textContent.trim().toLowerCase()==='::end')){
      if(n.nodeType===1 && (n.matches('figure.ascii-card')||n.matches('pre[class*="language-ascii"],pre.language-text'))){
        frames.push(n);
      }
      n=n.nextSibling;
    }
    if(!frames.length) continue;
    const wrap=document.createElement('div');
    wrap.className='ascii-anim'; wrap.dataset.interval=ms;
    mark.replaceWith(wrap);
    frames.forEach(f=>wrap.appendChild(f));
    if(n && n.textContent.trim().toLowerCase()==='::end') n.remove();
    setupAnim(wrap, +ms);
  }
}
function setupAnim(wrap, ms){
  const frames=[...wrap.children];
  frames.forEach((el,i)=>{ el.style.display=i?'none':'block'; el.classList.add('ascii-frame'); });
  let i=0, playing=true, t=null;
  function step(){ if(!playing) return; frames[i].style.display='none'; i=(i+1)%frames.length; frames[i].style.display='block'; t=setTimeout(step, ms); }
  t=setTimeout(step, ms);
  const ctrl=document.createElement('button'); ctrl.className='anim-ctrl'; ctrl.textContent='⏸︎';
  ctrl.onclick=()=>{ playing=!playing; ctrl.textContent=playing?'⏸︎':'▶︎'; if(playing){ t=setTimeout(step, ms);} else{ clearTimeout(t);} };
  wrap.prepend(ctrl);
}
document.addEventListener('DOMContentLoaded', ()=>initAsciiCarousel(document));
new MutationObserver(m=>m.forEach(x=>x.addedNodes&&x.addedNodes.forEach(n=>n.nodeType===1&&initAsciiCarousel(n))))
  .observe(document.body,{childList:true,subtree:true});
})();
