
/* ---------- Dock (espelho do HUD / FAB) ---------- */
const dock = document.querySelector('.kob-tts-dock') || (()=> {
  const d = document.createElement('div');
  d.className = 'kob-tts-dock';
  d.innerHTML = `
    <button id="btn-tts"        title="Voz On/Off">🔊</button>

    <button id="btn-prev"       title="Anterior">◀</button>
    <button id="btn-play"       title="Play / Pause">▶</button>
    <button id="btn-next"       title="Próximo">▶▶</button>

    <button id="btn-tts-sel"    title="Ler seleção">✂︎</button>
    <button id="btn-tts-stop"   title="Parar">■</button>

    <button id="tts-openall"    title="Abrir tudo">◎</button>
    <button id="tts-grid"       title="Outline / Click-to-Speak">⌗</button>

    <button id="btn-arch"       title="Trocar Voz / Arquétipo">🎙</button>

    <small id="tts-status">Pronto.</small>
  `;
  document.body.appendChild(d);
  return d;
})();
