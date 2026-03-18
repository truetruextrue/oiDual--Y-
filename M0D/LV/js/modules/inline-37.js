
(function(){
  const fab = document.getElementById('fab');
  if (!fab) return;

  fab.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    // deixa a ação rodar normal, e logo em seguida fecha o menu
    setTimeout(()=> {
      fab.classList.remove('open');
    }, 0);
  });
})();
