/* ═══════════════════════════════════════════════════
   DRAGON BALL Z · SOUNDCLOUD PLAYER CONTROLLER
   Opcode: 0x0A TRANSMITIR · 432Hz · V.E.E.B. B·D8
   Fractal: 3×6×9×7=1134 · VERDADE×INTEGRAR÷Δ=∞
   ═══════════════════════════════════════════════════ */

const DBZPlayer = (() => {

  let isOpen = false;
  let isCollapsed = false;
  let isPlaying = false;
  let scWidget = null;
  let powerInterval = null;

  const el = () => document.getElementById('dbz-player');

  function init() {
    // Load SoundCloud Widget API
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.onload = () => {
      const iframe = document.getElementById('dbz-sc-iframe');
      if (iframe && window.SC && SC.Widget) {
        scWidget = SC.Widget(iframe);
        scWidget.bind(SC.Widget.Events.PLAY, () => {
          isPlaying = true;
          el().classList.add('dbz-playing');
          startPowerLevel();
        });
        scWidget.bind(SC.Widget.Events.PAUSE, () => {
          isPlaying = false;
          el().classList.remove('dbz-playing');
          stopPowerLevel();
        });
        scWidget.bind(SC.Widget.Events.FINISH, () => {
          isPlaying = false;
          el().classList.remove('dbz-playing');
          stopPowerLevel();
        });
      }
    };
    document.head.appendChild(script);

    // Auto-show the player after a small delay
    setTimeout(() => {
      show();
    }, 1500);

    // Refresh lucide icons for the player
    setTimeout(() => {
      if (window.lucide) lucide.createIcons();
    }, 100);
  }

  function show() {
    const player = el();
    player.classList.add('dbz-active');
    player.classList.remove('dbz-collapsed');
    isOpen = true;
    isCollapsed = false;
    document.body.classList.add('dbz-player-open');
    adjustNavIndicator(true);
  }

  function close(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const player = el();
    player.classList.remove('dbz-active', 'dbz-playing', 'dbz-collapsed');
    isOpen = false;
    isCollapsed = false;
    document.body.classList.remove('dbz-player-open');
    adjustNavIndicator(false);

    // Pause audio on close
    if (scWidget) {
      try { scWidget.pause(); } catch (_) {}
    }
    isPlaying = false;
    stopPowerLevel();
  }

  function collapse(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const player = el();
    if (!isOpen) return;
    player.classList.add('dbz-collapsed');
    isCollapsed = true;
  }

  function expand(e) {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    const player = el();
    if (!isOpen) return;
    player.classList.remove('dbz-collapsed');
    isCollapsed = false;
  }

  function toggle(e) {
    // Only toggle when clicking on the topbar itself, not buttons
    if (e && (e.target.closest('.dbz-btn') || e.target.closest('.dbz-controls'))) return;
    if (!isOpen) {
      show();
      return;
    }
    if (isCollapsed) {
      expand();
    } else {
      collapse();
    }
  }

  // Power level animation
  function startPowerLevel() {
    if (powerInterval) return;
    const fill = document.getElementById('dbz-power-fill');
    const val = document.getElementById('dbz-power-value');
    if (!fill || !val) return;

    let power = 9001;
    powerInterval = setInterval(() => {
      power = 8500 + Math.floor(Math.random() * 1500);
      const pct = Math.min(100, Math.max(40, (power / 10000) * 100));
      fill.style.width = pct + '%';
      val.textContent = power.toLocaleString('pt-BR');
    }, 800);
  }

  function stopPowerLevel() {
    if (powerInterval) {
      clearInterval(powerInterval);
      powerInterval = null;
    }
    const fill = document.getElementById('dbz-power-fill');
    const val = document.getElementById('dbz-power-value');
    if (fill) fill.style.width = '0%';
    if (val) val.textContent = '9.001';
  }

  function adjustNavIndicator(open) {
    const nav = document.getElementById('nav-indicator');
    if (!nav) return;
    nav.style.transition = 'bottom 0.5s ease';
    nav.style.bottom = open ? '80px' : '';
  }

  // Public API
  const api = {
    init,
    show,
    close,
    collapse,
    expand,
    toggle,
    isPlaying: () => isPlaying,
    isOpen: () => isOpen
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return api;

})();


document.addEventListener('DOMContentLoaded', () => {
            const widget = SC.Widget(document.getElementById('dbz-sc-iframe'));
            const player = document.getElementById('dbz-player');
            const body = document.getElementById('dbz-body');
            const menu = document.getElementById('dbz-menu');
            const dynamicContent = document.getElementById('dynamic-content');
            const playIcon = document.getElementById('play-icon');
            const trackTitle = document.getElementById('dbz-track-title');
            const powerFill = document.getElementById('dbz-power-fill');
            const powerValue = document.getElementById('dbz-power-value');

            let isExpandedHoriz = false;
            let isExpandedVert = false;
            let idleTimer;

            // Função para alternar expansão horizontal (O "Botãozinho")
            const toggleHorizontal = (force) => {
                isExpandedHoriz = typeof force === 'boolean' ? force : !isExpandedHoriz;
                
                if (isExpandedHoriz) {
                    player.classList.replace('player-collapsed', 'player-expanded-horiz');
                    setTimeout(() => dynamicContent.classList.replace('opacity-0', 'opacity-100'), 200);
                } else {
                    dynamicContent.classList.replace('opacity-100', 'opacity-0');
                    isExpandedVert = false;
                    body.style.display = 'none';
                    menu.classList.remove('dbz-menu-active');
                    setTimeout(() => player.classList.replace('player-expanded-horiz', 'player-collapsed'), 200);
                }
            };

            // Play/Pause
            document.getElementById('main-action-btn').onclick = (e) => {
                e.stopPropagation();
                widget.toggle();
                if (!isExpandedHoriz) toggleHorizontal(true);
                resetIdle();
            };

            // Expandir Scouter (Vertical)
            document.getElementById('expand-trigger').onclick = (e) => {
                e.stopPropagation();
                isExpandedVert = !isExpandedVert;
                body.style.display = isExpandedVert ? 'block' : 'none';
            };

            // Próxima faixa
            document.getElementById('next-track-btn').onclick = (e) => {
                e.stopPropagation();
                widget.next();
                resetIdle();
            };

            // Menu
            document.getElementById('menu-toggle-btn').onclick = (e) => {
                e.stopPropagation();
                menu.classList.toggle('dbz-menu-active');
            };

            // Itens do Menu
            document.querySelectorAll('.dbz-menu-item').forEach(item => {
                item.onclick = function() {
                    widget.load(this.getAttribute('data-url'), { auto_play: true, visual: true });
                    menu.classList.remove('dbz-menu-active');
                };
            });

            // Listeners SoundCloud
            widget.bind(SC.Widget.Events.PLAY, () => {
                playIcon.classList.replace('ph-play-circle', 'ph-pause-circle');
                player.classList.remove('idle-state');
                widget.getCurrentSound(s => { if(s) trackTitle.innerText = s.title; });
            });

            widget.bind(SC.Widget.Events.PAUSE, () => {
                playIcon.classList.replace('ph-pause-circle', 'ph-play-circle');
            });

            widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
                const ki = Math.floor(data.relativePosition * 9001);
                powerValue.innerText = ki.toString().padStart(4, '0');
                powerFill.style.width = (data.relativePosition * 100) + "%";
            });

            // Idle e Fechamento
            function resetIdle() {
                player.classList.remove('idle-state');
                clearTimeout(idleTimer);
                idleTimer = setTimeout(() => {
                    widget.isPaused(p => { if(p) player.classList.add('idle-state'); });
                }, 5000);
            }

            document.addEventListener('mousemove', resetIdle);
            document.addEventListener('click', (e) => {
                if(!player.contains(e.target)) {
                    toggleHorizontal(false);
                }
            });
        });
