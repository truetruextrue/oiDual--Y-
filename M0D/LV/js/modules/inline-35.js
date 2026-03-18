
(function(){
  const fab = document.getElementById('fab');
  const toggle = document.getElementById('fab-toggle');
  if(!fab || !toggle) return;
  // Close when clicking an action
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('[data-action]');
    if (a && fab.classList.contains('open')) fab.classList.remove('open');
  });
  // Close when clicking outside
  document.addEventListener('click', (e)=>{
    const withinFab = e.target.closest('#fab');
    if (!withinFab && fab.classList.contains('open')) fab.classList.remove('open');
  }, true);
})();
