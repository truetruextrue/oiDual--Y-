window.ACTIONS = {
  home(){ renderWelcome(); },
  autogerar(){ openImporter(); },
  tts(){ document.getElementById('btn-tts')?.click(); },
  pdf(){ window.print(); }
};

function buildFAB(){
  const menu = document.querySelector('#fab .menu');
  if(!menu) return;

  const buttons = [
    { label:'Home', action: ACTIONS.home },
    { label:'Auto', action: ACTIONS.autogerar },
    { label:'TTS', action: ACTIONS.tts },
    { label:'PDF', action: ACTIONS.pdf }
  ];

  menu.innerHTML = '';

  buttons.forEach(btn=>{
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = btn.label;
    b.onclick = btn.action;
    menu.appendChild(b);
  });
}

document.addEventListener('DOMContentLoaded', buildFAB);