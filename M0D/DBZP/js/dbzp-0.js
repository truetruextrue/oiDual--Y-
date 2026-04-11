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
