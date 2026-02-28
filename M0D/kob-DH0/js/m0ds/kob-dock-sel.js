/* ---------- Criação Dinâmica do Dock ---------- */
      const dock = document.querySelector('.kob-tts-dock') || (()=> {
        const d = document.createElement('div');
        d.className = 'kob-tts-dock';
        d.innerHTML = `
          <button id="tts-on"      title="Voz On/Off" aria-pressed="false">🔊</button>
          <button id="tts-prev"    title="Anterior">◀</button>
          <button id="tts-next"    title="Próximo">▶</button>
          <button id="tts-sel"     title="Ler seleção">✂︎</button>
          <button id="tts-stop"    title="Parar">■</button>
          <button id="tts-reread"  title="Re-Ler do início">⟳</button>
          <button id="tts-reset"   title="Reset + próxima seção">↻</button>
          <button id="tts-grid"    title="Outline / Click-to-Speak">⌗</button>
          <button id="tts-voice"   title="Trocar Voz PT-BR">🎙</button>
          <small id="tts-status">Pronto.</small>
        `;
        document.body.appendChild(d);
        return d;
      })();