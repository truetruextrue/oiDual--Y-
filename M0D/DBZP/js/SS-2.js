const TrinityEngine = (function(){
        "use strict";

        // ==========================================
        // ESTADO GLOBAL (Delta)
        // ==========================================
        const DB_NAME = 'kodux-ss-db-v3';
        const State = {
            tracks: [],
            playlists: ['Daily Mix', 'Deep Work'],
            currentIdx: -1,
            isPlaying: false,
            activeEngine: null,
            widgetState: 'ball',
            currentTab: 'all', // all, fav, lists
            activePlaylistFilter: null,
            
            // Motores
            ytPlayer: null,
            scWidget: null,
            ytReady: false,
            audioEl: document.getElementById('local-audio'),
            
            // Drag
            drag: { isDragging: false, x: window.innerWidth - 60, y: window.innerHeight - 150 }
        };

        const PRELOADED = [
            { type: 'youtube', id: 'Bt_rLbMjJDk', url: 'https://youtu.be/Bt_rLbMjJDk', name: 'Trilhas Aromas', artist: 'Dual.NextLevel', cover: 'https://img.youtube.com/vi/Bt_rLbMjJDk/hqdefault.jpg', isFav: true, playlist: 'Daily Mix' },
            { type: 'soundcloud', url: 'https://soundcloud.com/oi-dual-x-info-dose/sets/mapeamento-das-trilhas-pulso', name: 'MAPEAMENTO PULSO', artist: 'DUAL X', cover: 'https://i1.sndcdn.com/artworks-000418386453-y1w0f1-t500x500.jpg', isFav: false, playlist: 'Deep Work' }
        ];

        const UI = {
            widget: document.getElementById('kodux-widget'),
            contents: {
                ball: document.getElementById('content-ball'),
                preview: document.getElementById('content-preview'),
                footer: document.getElementById('content-footer'),
                full: document.getElementById('content-full')
            }
        };

        // ==========================================
        // THEME ENGINE (Energia Dinâmica)
        // ==========================================
        function applyDynamicKi() {
            const hour = new Date().getHours();
            let color = '#32d7cb'; // Default KODUX (Cyan)
            let rgb = '50, 215, 203';
            
            if(hour >= 6 && hour < 12) { color = '#f59e0b'; rgb = '245, 158, 11'; } // Manhã (Laranja SSJ)
            else if(hour >= 12 && hour < 18) { color = '#ff5500'; rgb = '255, 85, 0'; } // Tarde (Vermelho Fodósi)
            else if(hour >= 18 && hour < 22) { color = '#8b5cf6'; rgb = '139, 92, 246'; } // Noite (Roxo Oráculo)

            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--kob-voice-primary', color);
            document.documentElement.style.setProperty('--primary-rgb', rgb);
        }

        // ==========================================
        // DATA LAYER
        // ==========================================
        function saveData() {
            // Limpa os blobs se houver áudio local antes de salvar
            const safeTracks = State.tracks.map(t => ({...t, blob: null}));
            localStorage.setItem(DB_NAME, JSON.stringify({ tracks: safeTracks, playlists: State.playlists }));
        }

        function loadData() {
            const saved = localStorage.getItem(DB_NAME);
            if(saved) {
                const parsed = JSON.parse(saved);
                State.tracks = parsed.tracks || [...PRELOADED];
                State.playlists = parsed.playlists || ['Daily Mix', 'Deep Work'];
            } else {
                State.tracks = [...PRELOADED];
            }
        }

        // ==========================================
        // RENDER LAYER (HUD)
        // ==========================================
        function renderPlaylistsManager() {
            const container = document.getElementById('playlist-badges');
            container.innerHTML = State.playlists.map(pl => `
                <button onclick="TrinityEngine.dispatch('0x06:view:filterList', '${pl}')" 
                        class="px-3 py-1 rounded-full text-[10px] font-bold transition border 
                        ${State.activePlaylistFilter === pl ? 'bg-[var(--primary)] text-black border-[var(--primary)]' : 'bg-black/40 text-[var(--muted)] border-white/10 hover:border-white/30'}">
                    ${pl}
                </button>
            `).join('');
        }

        function renderPlaylist() {
            const container = document.getElementById('playlist-container');
            container.innerHTML = '';
            
            let filteredTracks = State.tracks.map((t, i) => ({...t, originalIndex: i}));

            if(State.currentTab === 'fav') {
                filteredTracks = filteredTracks.filter(t => t.isFav);
            } else if (State.currentTab === 'lists' && State.activePlaylistFilter) {
                filteredTracks = filteredTracks.filter(t => t.playlist === State.activePlaylistFilter);
            }

            if(filteredTracks.length === 0) {
                container.innerHTML = `<div class="text-center text-[var(--muted)] text-xs py-8">Nenhuma faixa encontrada nesta dimensão.</div>`;
                return;
            }

            filteredTracks.forEach((t) => {
                const i = t.originalIndex;
                const active = i === State.currentIdx;
                const favIcon = t.isFav ? 'ph-fill ph-heart text-[var(--primary)]' : 'ph ph-heart text-[var(--muted)] hover:text-white';
                
                const item = document.createElement('div');
                item.className = `group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${active ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`;
                
                item.innerHTML = `
                    <div class="relative w-10 h-10 rounded-lg overflow-hidden shrink-0" onclick="TrinityEngine.dispatch('0x05:audio:load', ${i})">
                        <img src="${t.cover}" class="w-full h-full object-cover">
                        ${active && State.isPlaying ? '<div class="absolute inset-0 bg-black/40 flex items-center justify-center"><i class="ph-fill ph-waveform text-[var(--primary)] animate-pulse"></i></div>' : ''}
                    </div>
                    <div class="flex-1 overflow-hidden" onclick="TrinityEngine.dispatch('0x05:audio:load', ${i})">
                        <h5 class="text-xs font-bold text-white truncate ${active ? 'glow-text' : ''}">${t.name}</h5>
                        <div class="flex items-center gap-2">
                            <p class="text-[10px] text-[var(--muted)] truncate">${t.artist}</p>
                            ${t.playlist ? `<span class="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-[var(--muted)]">${t.playlist}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="TrinityEngine.dispatch('0x07:data:assignPlaylist', ${i})" class="text-[var(--muted)] hover:text-white p-1" title="Adicionar à Playlist">
                            <i class="ph ph-list-plus text-lg"></i>
                        </button>
                        <button onclick="TrinityEngine.dispatch('0x07:data:toggleFav', ${i})" class="p-1 transition-transform hover:scale-110">
                            <i class="${favIcon} text-lg"></i>
                        </button>
                        <button onclick="TrinityEngine.dispatch('0x07:data:delete', ${i})" class="text-[var(--muted)] hover:text-red-500 p-1 transition-colors" title="Deletar">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        // ==========================================
        // AUDIO ENGINE
        // ==========================================
        function syncIcons() {
            const icon = State.isPlaying ? 'ph-pause-circle' : 'ph-play-circle';
            const iconSimple = State.isPlaying ? 'ph-pause' : 'ph-play';
            document.getElementById('prev-play-icon').className = `ph-fill ${icon} text-4xl`;
            document.getElementById('foot-play-icon').className = `ph-fill ${icon} text-5xl`;
            document.getElementById('main-play-icon').className = `ph-fill ${iconSimple} text-3xl ${State.isPlaying ? '' : 'ml-1'}`;
        }

        function loadAndPlay(idx) {
            if(idx < 0 || idx >= State.tracks.length) return;
            State.currentIdx = idx;
            const track = State.tracks[idx];
            State.activeEngine = track.type;

            State.audioEl.pause();
            if(State.ytPlayer && State.ytPlayer.stopVideo) State.ytPlayer.stopVideo();
            
            ['prev', 'foot', 'main'].forEach(pre => {
                document.getElementById(`${pre}-title`).innerText = track.name;
                document.getElementById(`${pre}-artist`).innerText = track.artist;
                document.getElementById(`${pre}-cover`).src = track.cover;
            });

            if(track.type === 'youtube') playYT(track.id);
            else if(track.type === 'soundcloud') playSC(track.url);
            
            renderPlaylist();
        }

        function playYT(id) {
            if(!State.ytReady) return setTimeout(() => playYT(id), 300);
            if(!State.ytPlayer) {
                State.ytPlayer = new YT.Player('yt-container', {
                    height: '0', width: '0', videoId: id,
                    playerVars: { autoplay: 1, playsinline: 1 },
                    events: {
                        onReady: (e) => { e.target.playVideo(); State.isPlaying = true; syncIcons(); },
                        onStateChange: (e) => {
                            if(e.data === YT.PlayerState.ENDED) TrinityEngine.dispatch('0x05:audio:next');
                            State.isPlaying = (e.data === YT.PlayerState.PLAYING);
                            syncIcons();
                        }
                    }
                });
            } else { State.ytPlayer.loadVideoById(id); }
        }

        function playSC(url) {
            const container = document.getElementById('sc-container');
            container.innerHTML = `<iframe id="sc-frame" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false"></iframe>`;
            State.scWidget = SC.Widget('sc-frame');
            State.scWidget.bind(SC.Widget.Events.READY, () => {
                State.scWidget.play();
                State.isPlaying = true;
                syncIcons();
            });
            State.scWidget.bind(SC.Widget.Events.FINISH, () => TrinityEngine.dispatch('0x05:audio:next'));
            State.scWidget.bind(SC.Widget.Events.PLAY, () => { State.isPlaying = true; syncIcons(); });
            State.scWidget.bind(SC.Widget.Events.PAUSE, () => { State.isPlaying = false; syncIcons(); });
        }

        // Progress Loop
        setInterval(() => {
            if(!State.isPlaying) return;
            let pct = 0;
            if(State.activeEngine === 'youtube' && State.ytPlayer.getCurrentTime) pct = (State.ytPlayer.getCurrentTime() / State.ytPlayer.getDuration()) * 100;
            else if(State.activeEngine === 'soundcloud' && State.scWidget) {
                State.scWidget.getPosition(p => State.scWidget.getDuration(d => {
                    const scPct = (p/d) * 100;
                    document.getElementById('main-progress').value = scPct;
                    document.getElementById('footer-progress-bar').style.width = scPct + '%';
                }));
                return;
            }
            document.getElementById('main-progress').value = pct || 0;
            document.getElementById('footer-progress-bar').style.width = (pct || 0) + '%';
        }, 1000);


        // ==========================================
        // UI & DRAG LOGIC (Orb-to-HUD)
        // ==========================================
        function changeWidgetState(newState) {
            State.widgetState = newState;
            UI.widget.className = `state-${newState}`;
            Object.values(UI.contents).forEach(el => el.classList.add('hidden-content'));
            UI.contents[newState].classList.remove('hidden-content');

            if(newState === 'ball') {
                UI.widget.style.left = `${State.drag.x}px`;
                UI.widget.style.top = `${State.drag.y}px`;
            } else if(newState === 'preview') {
                UI.widget.style.left = (State.drag.x < window.innerWidth/2) ? '10px' : (window.innerWidth - 250) + 'px';
            } else if(newState === 'full') {
                UI.widget.style.left = '50%'; UI.widget.style.top = '50%';
                UI.widget.style.transform = 'translate(-50%, -50%)';
            } else if(newState === 'footer') {
                UI.widget.style.transform = 'none';
                UI.widget.style.left = '0'; UI.widget.style.top = 'auto'; UI.widget.style.bottom = '0';
            }
        }

        function initDrag() {
            let initialX, initialY;
            const onStart = (e) => {
                if(State.widgetState === 'full' || e.target.closest('button, input, .preview-clickable')) return;
                State.drag.isDragging = false;
                const touch = e.type === 'touchstart' ? e.touches[0] : e;
                initialX = touch.clientX - State.drag.x;
                initialY = touch.clientY - State.drag.y;
                UI.widget.style.transition = 'none';
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchmove', onMove, {passive: false});
                document.addEventListener('touchend', onEnd);
            };

            const onMove = (e) => {
                State.drag.isDragging = true;
                e.preventDefault();
                const touch = e.type === 'touchmove' ? e.touches[0] : e;
                State.drag.x = touch.clientX - initialX;
                State.drag.y = touch.clientY - initialY;
                UI.widget.style.left = `${State.drag.x}px`;
                UI.widget.style.top = `${State.drag.y}px`;
            };

            const onEnd = () => {
                document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd);
                UI.widget.style.transition = 'all var(--transition-fluid)';
                
                // Snap to top logic adaptado para rodapé
                if(State.drag.y > window.innerHeight - 120) changeWidgetState('footer');
                else if(State.drag.isDragging) changeWidgetState('ball');
            };

            UI.contents.ball.addEventListener('mousedown', onStart);
            UI.contents.ball.addEventListener('touchstart', onStart);
            document.querySelectorAll('.drag-header').forEach(h => {
                h.addEventListener('mousedown', onStart); h.addEventListener('touchstart', onStart);
            });
        }

        // ==========================================
        // DISPATCHER (The Opcode Router)
        // ==========================================
        return {
            init: () => {
                applyDynamicKi();
                loadData();
                window.onYouTubeIframeAPIReady = () => { State.ytReady = true; };
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                document.head.appendChild(tag);
                
                initDrag();
                renderPlaylistsManager();
                renderPlaylist();
                changeWidgetState('ball');

                // Global Clicks
                UI.widget.onclick = (e) => {
                    if(State.drag.isDragging) return;
                    if(State.widgetState === 'ball') changeWidgetState('preview');
                };
                document.addEventListener('mousedown', (e) => {
                    if (State.widgetState === 'preview' && !UI.widget.contains(e.target)) changeWidgetState('ball');
                });
                document.addEventListener('touchstart', (e) => {
                    if (State.widgetState === 'preview' && !UI.widget.contains(e.target)) changeWidgetState('ball');
                });
            },

            dispatch: async (opcode, payload) => {
                // UI Management
                if(opcode === '0x04:ui:changeState') changeWidgetState(payload);
                if(opcode === '0x04:ui:openFull') { if(payload) payload.stopPropagation(); changeWidgetState('full'); }
                if(opcode === '0x04:ui:collapse') { if(payload) payload.stopPropagation(); changeWidgetState('ball'); }
                
                // View / Tabs
                if(opcode === '0x06:view:tab') {
                    State.currentTab = payload;
                    ['all', 'fav', 'lists'].forEach(t => document.getElementById(`tab-${t}`).classList.remove('active'));
                    document.getElementById(`tab-${payload}`).classList.add('active');
                    
                    const listManager = document.getElementById('playlist-manager');
                    if(payload === 'lists') {
                        listManager.classList.remove('hidden');
                        if(!State.activePlaylistFilter && State.playlists.length > 0) State.activePlaylistFilter = State.playlists[0];
                    } else {
                        listManager.classList.add('hidden');
                    }
                    renderPlaylistsManager();
                    renderPlaylist();
                }
                if(opcode === '0x06:view:filterList') {
                    State.activePlaylistFilter = payload;
                    renderPlaylistsManager();
                    renderPlaylist();
                }

                // Audio Management
                if(opcode === '0x05:audio:load') loadAndPlay(payload);
                if(opcode === '0x05:audio:next') loadAndPlay((State.currentIdx + 1) % State.tracks.length);
                if(opcode === '0x05:audio:prev') loadAndPlay((State.currentIdx - 1 + State.tracks.length) % State.tracks.length);
                if(opcode === '0x05:audio:toggle') {
                    if(payload && payload.stopPropagation) payload.stopPropagation();
                    if(State.currentIdx === -1) return loadAndPlay(0);
                    if(State.isPlaying) {
                        if(State.activeEngine === 'youtube') State.ytPlayer.pauseVideo();
                        else if(State.activeEngine === 'soundcloud') State.scWidget.pause();
                        State.isPlaying = false;
                    } else {
                        if(State.activeEngine === 'youtube') State.ytPlayer.playVideo();
                        else if(State.activeEngine === 'soundcloud') State.scWidget.play();
                        State.isPlaying = true;
                    }
                    syncIcons();
                    renderPlaylist(); // Força update do waveform
                }

                // Data Management
                if(opcode === '0x07:data:toggleFav') {
                    if(payload.stopPropagation) payload.stopPropagation(); // Previne load
                    State.tracks[payload].isFav = !State.tracks[payload].isFav;
                    saveData(); renderPlaylist();
                }
                if(opcode === '0x07:data:delete') {
                    if(payload.stopPropagation) payload.stopPropagation();
                    State.tracks.splice(payload, 1);
                    if(State.currentIdx === payload && State.isPlaying) TrinityEngine.dispatch('0x05:audio:toggle');
                    if(State.currentIdx > payload) State.currentIdx--; // Ajusta indice
                    saveData(); renderPlaylist();
                }
                if(opcode === '0x08:data:createPlaylist') {
                    const input = document.getElementById('new-playlist-input');
                    const name = input.value.trim();
                    if(name && !State.playlists.includes(name)) {
                        State.playlists.push(name);
                        State.activePlaylistFilter = name;
                        input.value = '';
                        saveData(); renderPlaylistsManager(); renderPlaylist();
                    }
                }
                if(opcode === '0x07:data:assignPlaylist') {
                    if(payload.stopPropagation) payload.stopPropagation();
                    if(State.playlists.length === 0) return alert("Crie uma playlist na aba PLAYLISTS primeiro.");
                    // UX simples: cicla entre as playlists existentes
                    const track = State.tracks[payload];
                    const currentPlIdx = State.playlists.indexOf(track.playlist);
                    const nextPlIdx = (currentPlIdx + 1) % State.playlists.length;
                    track.playlist = State.playlists[nextPlIdx];
                    saveData(); renderPlaylist();
                }
                if(opcode === '0x07:data:addLink') {
                    const input = document.getElementById('link-input');
                    const url = input.value.trim();
                    if(!url) return;
                    let newTrack = { name: 'Carregando...', artist: 'Web', cover: 'https://picsum.photos/100', url, isFav: false, playlist: State.activePlaylistFilter || null };
                    
                    if(url.includes('youtube.com') || url.includes('youtu.be')) {
                        const id = url.match(/(?:v=|youtu\.be\/|shorts\/)([0-9A-Za-z_-]{11})/)?.[1];
                        if(!id) return alert("Link YouTube Inválido");
                        newTrack.type = 'youtube'; newTrack.id = id; newTrack.cover = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                        try { const res = await fetch(`https://noembed.com/embed?url=${url}`); const data = await res.json(); newTrack.name = data.title || "YouTube Track"; } catch(e) {}
                    } else if(url.includes('soundcloud.com')) {
                        newTrack.type = 'soundcloud';
                        try { const res = await fetch(`https://soundcloud.com/oembed?url=${url}&format=json`); const data = await res.json(); newTrack.name = data.title; newTrack.artist = data.author_name; newTrack.cover = data.thumbnail_url; } catch(e) {}
                    }
                    State.tracks.unshift(newTrack);
                    input.value = ''; saveData(); renderPlaylist();
                }
            }
        };
    })();

    // Boot System
    window.addEventListener('DOMContentLoaded', TrinityEngine.init);
    