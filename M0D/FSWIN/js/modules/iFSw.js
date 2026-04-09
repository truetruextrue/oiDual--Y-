const clickTimers = {};

function getWin(id){ return document.getElementById(id); }

function handleHeaderClick(e,id){
  if(e.target.closest('.win-controls')) return;
  const w=getWin(id);

  if(!clickTimers[id]){
    clickTimers[id]=setTimeout(()=>{
      delete clickTimers[id];
      togglePeek(id);
    },250);
  }else{
    clearTimeout(clickTimers[id]);
    delete clickTimers[id];
    toggleMaximize(id);
  }
}

function togglePeek(id){
  const w=getWin(id);
  w.classList.toggle('peeked');
  w.classList.remove('collapsed');
}

function toggleCollapse(id){
  const w=getWin(id);
  w.classList.toggle('collapsed');
  w.classList.remove('peeked');
}

function toggleMaximize(id){
  const w=getWin(id);
  w.classList.toggle('maximized');
  w.classList.remove('minimized');
}

function minimizeWindow(id){
  const w=getWin(id);
  w.classList.add('minimized');
  w.classList.remove('maximized','collapsed','peeked');

  const dock=document.getElementById('dock');
  const b=document.createElement('div');
  b.className='dock-bubble';
  b.innerHTML='🔘';

  b.onclick=()=>{
    w.classList.remove('minimized');
    b.remove();
  };

  dock.appendChild(b);
}