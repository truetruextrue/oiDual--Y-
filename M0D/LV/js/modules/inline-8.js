
(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);

const HERBIE = window.HERBIE || (window.HERBIE = {
  preset: (localStorage.getItem('herbiePreset')||'blue').toLowerCase(),
  presets: {
    blue:    { a:'#67e6ff', b:'#3bd3ff', name:'Blue' },
    gold:    { a:'#f7d774', b:'#ffcc55', name:'Gold' },
    thermal: { a:'#ff7a00', b:'#ff3366', name:'Thermal' },
  },
  setPreset(name){
    name=(name||'').toLowerCase();
    const p=this.presets[name]||this.presets.blue;
    this.preset = name in this.presets ? name : 'blue';
    localStorage.setItem('herbiePreset', this.preset);
    const root=document.documentElement;
    root.style.setProperty('--orb-a', p.a);
    root.style.setProperty('--orb-b', p.b);
    window.dispatchEvent(new CustomEvent('herbiechange',{detail:{ name:this.preset, colors:p }}));
    if(window.toast) toast('Preset: '+(p.name||name));
  },
  setButtonsOpacity(v){
    const val=Math.max(.2, Math.min(1, Number(v)||.92));
    document.documentElement.style.setProperty('--fab-btn-opacity', String(val));
    localStorage.setItem('herbieBtnOpacity', String(val));
  },
  cyclePresets(){
    const list=Object.keys(this.presets); const i=list.indexOf(this.preset);
    this.setPreset(list[(i+1)%list.length]);
  }
});

// augment ORB picker with preset chips
function enhancePicker(){
  const fab=$('#fab'); if(!fab) return;
  let picker = $('#orb-picker');
  if(!picker) return;
  if(!picker.querySelector('.row-presets')){
    const row = document.createElement('div');
    row.className='row-presets';
    row.style.marginTop='6px';
    row.innerHTML = `
      <button class="chip" data-preset="blue">Blue</button>
      <button class="chip" data-preset="gold">Gold</button>
      <button class="chip" data-preset="thermal">Thermal</button>`;
    picker.appendChild(row);
    picker.addEventListener('click', (e)=>{
      const b=e.target.closest('[data-preset]'); if(!b) return;
      HERBIE.setPreset(b.dataset.preset);
      fab.classList.remove('show-picker');
    });
  }
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  const savedOpacity = parseFloat(localStorage.getItem('herbieBtnOpacity')||'0');
  if(savedOpacity>0){ HERBIE.setButtonsOpacity(savedOpacity); }
  enhancePicker();
  HERBIE.setPreset(HERBIE.preset);
});

window.HERBIE = HERBIE;
})();
