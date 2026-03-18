
(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

const ARQ = window.ARQ || (window.ARQ = {
  current: (localStorage.getItem('tl_arq')||'madeira').toLowerCase(),
  map: {
    madeira: { a:'#36f6a2', b:'#00ffa8', name:'Madeira' },
    agua:    { a:'#67e6ff', b:'#3bd3ff', name:'Água' },
    fogo:    { a:'#ff7a00', b:'#ff3366', name:'Fogo' },
    terra:   { a:'#c8a46e', b:'#8a6c3d', name:'Terra' },
    metal:   { a:'#dfe7ff', b:'#a0b7ff', name:'Metal' },
  }
});

function applyArq(name){
  name = (name||'').toLowerCase();
  const cfg = ARQ.map[name] || ARQ.map.madeira;
  ARQ.current = name in ARQ.map ? name : 'madeira';
  localStorage.setItem('tl_arq', ARQ.current);
  const root = document.documentElement;
  root.style.setProperty('--orb-a', cfg.a);
  root.style.setProperty('--orb-b', cfg.b);
  document.body.dataset.arq = ARQ.current;
  if(window.toast) toast('Arquétipo: '+(cfg.name||name));
  window.dispatchEvent(new CustomEvent('archetypechange',{ detail:{ name: ARQ.current, colors: cfg } }));
}

function ensureOrb(){
  const fab = $('#fab'); if(!fab) return;
  let orb = $('#orb2d');
  if(!orb){
    orb = document.createElement('button');
    orb.id='orb2d'; orb.title='Abrir apps';
    fab.appendChild(orb);
  }
  // quick picker
  let picker = $('#orb-picker');
  if(!picker){
    picker = document.createElement('div');
    picker.id = 'orb-picker';
    picker.innerHTML = `
      <button class="chip" data-arq="madeira">Madeira</button>
      <button class="chip" data-arq="agua">Água</button>
      <button class="chip" data-arq="fogo">Fogo</button>
      <button class="chip" data-arq="terra">Terra</button>
      <button class="chip" data-arq="metal">Metal</button>
    `;
    fab.appendChild(picker);
  }
  // tap toggles menu
  orb.addEventListener('click', ()=> fab.classList.toggle('open'));
  // long press opens picker
  let pressTimer=null;
  orb.addEventListener('pointerdown', ()=>{
    clearTimeout(pressTimer);
    pressTimer = setTimeout(()=> fab.classList.toggle('show-picker'), 500);
  });
  ['pointerup','pointerleave','pointercancel'].forEach(evt=> orb.addEventListener(evt, ()=> clearTimeout(pressTimer)));
  picker.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-arq]'); if(!b) return;
    applyArq(b.dataset.arq);
    fab.classList.remove('show-picker');
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  ensureOrb();
  applyArq(ARQ.current);
});

// API pública
window.ARQ = Object.assign(ARQ, {
  set: applyArq,
  cycle(){
    const list = Object.keys(ARQ.map);
    const i = Math.max(0, list.indexOf(ARQ.current));
    const next = list[(i+1)%list.length];
    applyArq(next);
  }
});
})();
