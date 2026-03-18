
(()=>{'use strict';
if(window.__KOBLLUX_TTS_PATCH_V1__) return;
window.__KOBLLUX_TTS_PATCH_V1__ = true;

const synth = window.speechSynthesis;
let speaking = false, paused = false;
let currentUtter = null;

/* ===== Botão ON/OFF ===== */
const fab = document.createElement('button');
fab.id = 'ttsToggle';
fab.textContent = '🔊';
fab.style.cssText = `
position:fixed;top:66px;right:16px;z-index:99999;
border:none;border-radius:50%;width:32px;height:32px;
font-size:24px;cursor:pointer;
background:linear-gradient(42deg,#0f0,#0ff);
box-shadow:0 0 12px rgba(0,255,255,.4);
`;
fab.title = 'TTS: desligado';
document.body.appendChild(fab);

/* ===== Funções ===== */
function readAll(){
  if(speaking) return;
  const area = document.querySelector('#renderArea, main, article, #book') || document.body;
  const blocks = [...area.querySelectorAll('h1,h2,h3,p,li,blockquote,section,div')]
    .map(x => x.innerText.trim()).filter(Boolean);
  if(!blocks.length){ toast?.('Nada para ler'); return; }

  speaking = true; paused = false;
  fab.style.background = 'linear-gradient(42deg,#0ff,#0f0)';
  fab.title = 'TTS: ligado';

  let i = 0;
  const readNext = ()=>{
    if(!speaking || i>=blocks.length){ stopTTS(); return; }
    const text = blocks[i];
    currentUtter = new SpeechSynthesisUtterance(text);
    currentUtter.lang = 'pt-BR';
    currentUtter.rate = 1.0;
    currentUtter.pitch = 1.0;
    currentUtter.volume = 1.0;

    const el = area.querySelectorAll('h1,h2,h3,p,li,blockquote,section,div')[i];
    if(el){ el.style.outline='2px solid #0ff'; el.scrollIntoView({behavior:'smooth',block:'center'}); }

    currentUtter.onend = ()=>{
      if(el) el.style.outline='none';
      i++; readNext();
    };
    synth.speak(currentUtter);
  };
  readNext();
}

function stopTTS(){
  if(currentUtter) synth.cancel();
  speaking = false; paused = false;
  fab.style.background = 'linear-gradient(42deg,#0f0,#0ff)';
  fab.title = 'TTS: desligado';
}

/* ===== Botão toggle ===== */
fab.addEventListener('click', ()=>{
  if(!speaking){ readAll(); }
  else{ stopTTS(); toast?.('Leitura parada'); }
});

/* ===== Teclas rápidas (opcional) ===== */
document.addEventListener('keydown', e=>{
  if(e.key==='F2'){ fab.click(); } // F2 = liga/desliga
});

})();
