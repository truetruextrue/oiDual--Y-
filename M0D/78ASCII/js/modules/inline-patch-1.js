// <script>
(function(){
  'use strict';

  /* =========================
     1. USERNAME → data-user
  ========================= */
  const rawUser = localStorage.getItem("di_userName") || "visitante";
  const safeUser = rawUser.toLowerCase().replace(/[^a-z0-9]/g,'');

  if(safeUser){
    document.documentElement.setAttribute("data-user", safeUser);
  }

  /* =========================
     2. DETECÇÃO DE ARQUÉTIPO
     (usa global se existir)
  ========================= */
  const ARCHS = [
    "atlas","nova","vitalis","pulse","kaos","kodux","lumine","aion",
    "kobllux","artemis","serena","genus","solus","rhea",
    "uno","dual","trinity","infodose","horus"
  ];

  const ARCH_DB = Object.fromEntries(ARCHS.map(a=>[a.toUpperCase(),1]));

  function localDetect(name){
    const up = String(name||"").toUpperCase().replace(/\s/g,'');
    return Object.keys(ARCH_DB).find(a =>
      up.startsWith(a) || a.startsWith(up)
    ) || null;
  }

  const detect = window.detectArchetype || localDetect;

  function applyArch(name){
    const arch = detect(name);
    if(arch){
      document.documentElement.setAttribute("data-arch", arch.toLowerCase());
      document.documentElement.setAttribute("data-arch-voice", arch.toLowerCase());
    }else{
      document.documentElement.removeAttribute("data-arch");
      document.documentElement.removeAttribute("data-arch-voice");
    }
  }

  /* =========================
     3. SOURCE DO NOME
  ========================= */
  const nameInput =
    document.querySelector('#sigil-name') ||
    document.querySelector('#project-name') ||
    document.querySelector('#arch-name');

  function resolveName(){
    if(nameInput && nameInput.value){
      return nameInput.value;
    }
    return rawUser;
  }

  function updateArch(){
    applyArch(resolveName());
  }

  if(nameInput){
    nameInput.addEventListener('input', updateArch);
  }

  updateArch();

  /* =========================
     4. ACCORDION (SANFONA)
     usando tua HUD real
  ========================= */
  const header = document.querySelector('#symbolBar');
  const content = document.querySelector('.wrap .content');

  if(header && content){

    const style = document.createElement('style');
    style.textContent = `
      .kob-accordion {
        transition: max-height .45s cubic-bezier(.4,0,.2,1),
                    opacity .3s ease,
                    transform .3s ease;
        overflow: hidden;
        max-height: 2000px;
        opacity: 1;
      }

      .kob-accordion.closed {
        max-height: 0 !important;
        opacity: 0;
        transform: scale(.98);
        pointer-events: none;
      }

      #symbolBar {
        cursor: pointer;
      }

      html[data-arch="kobllux"] #symbolBar {
        box-shadow: 0 0 20px rgba(255,180,71,.25);
      }

      html[data-arch="kaos"] #symbolBar {
        filter: grayscale(1) contrast(1.4);
      }

      html[data-user="${safeUser}"] .orb-core {
        box-shadow: 0 0 12px rgba(110,231,255,.6);
      }
    `;
    document.head.appendChild(style);

    content.classList.add('kob-accordion');

    let closed = localStorage.getItem('kob_view_closed') === 'true';

    if(closed){
      content.classList.add('closed');
    }

    header.addEventListener('click', (e)=>{
      if(e.target.closest('button')) return;

      closed = !closed;

      content.classList.toggle('closed', closed);

      localStorage.setItem('kob_view_closed', closed);
    });
  }

  /* =========================
     5. DEBUG MINIMAL
  ========================= */
  console.log(
    "%cKOBLLUX FUSION OK",
    "color:#6ee7ff",
    {
      user: rawUser,
      arch: document.documentElement.getAttribute("data-arch")
    }
  );

})();
// </script>
