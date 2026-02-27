
    // ---------- 1. RELÓGIO ----------
    function updateClock() {
      document.getElementById('clock').innerText = new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ---------- 2. LÓGICA DO SANFONADO (Accordion) ----------
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const acc = header.parentElement;
        acc.classList.toggle('open');
      });
    });

    // ---------- 3. SISTEMA DE ARQUÉTIPOS ----------
    const ARCHETYPES = [
  // Núcleo
  { id: 'kobllux', name: 'KOBLLUX', color: '#22D3EE', rate: 0.98, pitch: 0.48 },

  // Roda Viva 12
  { id: 'atlas',   name: 'ATLAS',   color: '#38BDF8', rate: 1.00, pitch: 0.93 },
  { id: 'nova',    name: 'NOVA',    color: '#F97316', rate: 1.06, pitch: 1.34 },
  { id: 'vitalis', name: 'VITALIS', color: '#22C55E', rate: 0.96, pitch: 1.42 },
  { id: 'pulse',   name: 'PULSE',   color: '#EC4899', rate: 1.00, pitch: 1.14 },
  { id: 'artemis', name: 'ARTEMIS', color: '#A855F7', rate: 1.00, pitch: 1.23 },
  { id: 'serena',  name: 'SERENA',  color: '#38BDF8', rate: 0.92, pitch: 0.90 },
  { id: 'kaos',    name: 'KAOS',    color: '#FACC15', rate: 1.09, pitch: 1.28 },
  { id: 'genus',   name: 'GENUS',   color: '#E5E7EB', rate: 0.98, pitch: 1.20 },
  { id: 'lumine',  name: 'LUMINE',  color: '#FDE047', rate: 1.03, pitch: 1.55 },
  { id: 'solus',   name: 'SOLUS',   color: '#0EA5E9', rate: 0.88, pitch: 0.87 },
  { id: 'rhea',    name: 'RHEA',    color: '#22C55E', rate: 1.02, pitch: 0.59 },
  { id: 'aion',    name: 'AION',    color: '#4F46E5', rate: 0.98, pitch: 1.00 },

  // Expansão simbólica
  { id: 'uno',     name: 'UNO',     color: '#F97316', rate: 0.90, pitch: 0.93 },
  { id: 'dual',    name: 'DUAL',    color: '#06B6D4', rate: 1.02, pitch: 1.02 },
  { id: 'trinity', name: 'TRINITY', color: '#EC4899', rate: 1.04, pitch: 1.04 },
  { id: 'infodose',name: 'INFODOSE',color: '#22C55E', rate: 1.06, pitch: 0.96 },
  { id: 'kodux',   name: 'KODUX',   color: '#F97316', rate: 0.86, pitch: 0.68 }
];
    let currentArchIdx = 0;

    function updateArchetype() {
      const arch = ARCHETYPES[currentArchIdx];
      // Atualizar Variáveis CSS
      document.documentElement.style.setProperty('--kob-voice-primary', arch.color);
      document.documentElement.style.setProperty('--kob-voice-bg-soft', hexToRgba(arch.color, 0.15));
      
      document.getElementById('hudStatus').innerText = arch.name;
      
      // Se estiver a ler, reinicia a voz com o novo pitch/rate
      if (state.isSpeaking) {
        stopSpeech();
        speakCurrent();
      }
    }

    document.getElementById('btn-arch').addEventListener('click', () => {
      currentArchIdx = (currentArchIdx + 1) % ARCHETYPES.length;
      updateArchetype();
    });

    function hexToRgba(hex, alpha) {
      let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ---------- 4. SISTEMA HUD DRAG & SNAP ----------
    const bar = document.getElementById('symbolBar');
    let isDragging = false;
    let startPos = { x: 0, y: 0 };

    bar.addEventListener('pointerdown', e => {
      if(e.target.closest('.symbol-button')) return;
      isDragging = true;
      const rect = bar.getBoundingClientRect();
      startPos = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
      bar.classList.add('is-dragging');
      bar.style.transform = 'none'; // Desativar transform CSS para drag livre
      bar.setPointerCapture(e.pointerId);
    });

    bar.addEventListener('pointermove', e => {
      if(!isDragging) return;
      let x = e.clientX - startPos.x;
      let y = e.clientY - startPos.y;
      
      // Limites do ecrã
      const maxX = window.innerWidth - bar.offsetWidth;
      const maxY = window.innerHeight - bar.offsetHeight;
      
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      
      bar.style.left = x + 'px';
      bar.style.top = y + 'px';
      bar.style.bottom = 'auto'; // Substitui o bottom inicial
    });

    bar.addEventListener('pointerup', () => {
      isDragging = false;
      bar.classList.remove('is-dragging');
    });

    // ---------- 5. SISTEMA TTS (Text-To-Speech) ----------
    const synth = window.speechSynthesis;
    let state = {
      isSpeaking: false,
      blocks: Array.from(document.querySelectorAll('#reader-content p')),
      currentBlockIdx: 0
    };

    function clearHighlight() {
      state.blocks.forEach(p => p.removeAttribute('data-tts-current'));
    }

    function highlightBlock(index) {
      clearHighlight();
      if(index >= 0 && index < state.blocks.length) {
        const el = state.blocks[index];
        el.setAttribute('data-tts-current', 'true');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function startSpeech() {
      state.isSpeaking = true;
      document.getElementById('btn-play').textContent = '⏸';
      speakCurrent();
    }

    function stopSpeech() {
      state.isSpeaking = false;
      synth.cancel();
      document.getElementById('btn-play').textContent = '▶';
      clearHighlight();
    }

    function speakCurrent() {
      if(state.currentBlockIdx >= state.blocks.length) {
        stopSpeech();
        state.currentBlockIdx = 0; // Reset
        return;
      }

      synth.cancel();
      highlightBlock(state.currentBlockIdx);
      
      const text = state.blocks[state.currentBlockIdx].innerText;
      const utter = new SpeechSynthesisUtterance(text);
      
      // Aplicar dinâmicas do Arquétipo atual
      const arch = ARCHETYPES[currentArchIdx];
      utter.rate = arch.rate;
      utter.pitch = arch.pitch;
      utter.lang = 'pt-PT';

      utter.onend = () => {
        if(state.isSpeaking) {
          state.currentBlockIdx++;
          speakCurrent();
        }
      };

      utter.onerror = (e) => {
        console.warn("TTS Error:", e);
        // Fallback visual se a voz falhar ou for bloqueada
        if(state.isSpeaking) {
            setTimeout(() => {
                state.currentBlockIdx++;
                speakCurrent();
            }, text.length * 50); // Simula tempo de leitura
        }
      };

      synth.speak(utter);
    }

    // Listeners dos Botões TTS
    document.getElementById('btn-play').addEventListener('click', () => {
      if(state.isSpeaking) stopSpeech();
      else startSpeech();
    });

    document.getElementById('btn-next').addEventListener('click', () => {
      if(state.currentBlockIdx < state.blocks.length - 1) {
        state.currentBlockIdx++;
        if(state.isSpeaking) speakCurrent();
        else highlightBlock(state.currentBlockIdx);
      }
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
      if(state.currentBlockIdx > 0) {
        state.currentBlockIdx--;
        if(state.isSpeaking) speakCurrent();
        else highlightBlock(state.currentBlockIdx);
      }
    });

    // Iniciar com as cores do Kobllux padrão
    updateArchetype();

  
