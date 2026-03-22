(function () {

  /* =========================
     ARQUÉTIPOS + ORB
  ========================= */

  const ARCHS = [
    'kobllux','kodux','atlas','nova','vitalis','pulse','artemis',
    'serena','kaos','genus','lumine','solus','rhea','aion',
    'uno','dual','trinity','infodose','horus'
  ];

  function setVoiceArch(name){
    if(!name) return;

    document.body.dataset.voiceArch = name;

    const neb = document.querySelector('.nebula');
    if(neb) neb.dataset.voiceArch = name;

    const hud = document.getElementById('hudStatus');
    if(hud) hud.textContent = 'KOBLLUX · ' + name.toUpperCase();

    const dock = document.querySelector('.kob-tts-dock, .symbol-bar');
    if(dock){
      dock.animate(
        [{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],
        {duration:420, easing:'ease-out'}
      );
    }
  }

  const orbBtn = document.getElementById('btn-arch');

  let archIndex = ARCHS.indexOf(
    document.body.dataset.voiceArch || 'kobllux'
  );

  if(archIndex < 0) archIndex = 0;

  if(orbBtn){

    orbBtn.addEventListener('click', () => {
      archIndex = (archIndex + 1) % ARCHS.length;
      setVoiceArch(ARCHS[archIndex]);
      document.body.dataset.archActive = '78knveeeb';
    });

    let pressTimer;

    orbBtn.addEventListener('pointerdown', () => {
      pressTimer = setTimeout(() => {
        archIndex = (archIndex - 1 + ARCHS.length) % ARCHS.length;
        setVoiceArch(ARCHS[archIndex]);
      }, 450);
    });

    ['pointerup','pointerleave','pointercancel'].forEach(ev => {
      orbBtn.addEventListener(ev, () => clearTimeout(pressTimer));
    });
  }


  /* =========================
     IDLE DOCK
  ========================= */

  const dock = document.querySelector('.kob-tts-dock, .symbol-bar');

  let idleTimer;

  function resetIdle(){
    if(!dock) return;
    dock.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => dock.classList.add('idle'), 1870);
  }

  ['pointerdown','pointermove','touchstart','mousemove','keydown']
    .forEach(ev => document.addEventListener(ev, resetIdle));

  resetIdle();


  /* =========================
     INIT
  ========================= */

  document.addEventListener('DOMContentLoaded', () => {
    const initial = document.body.dataset.voiceArch || 'kobllux';
    setVoiceArch(initial);
    document.body.dataset.archActive ||= '78knveeeb';
  });


  /* =========================
     BOTÕES
  ========================= */

  document.getElementById('btn-play')?.addEventListener('click', () => {
    document.body.classList.toggle('speaking');
  });

  document.querySelectorAll('.symbol-button[data-url]').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      if(url && url !== 'about:blank') window.open(url, '_blank');
    });
  });

})();
