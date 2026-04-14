(function () {
      "use strict";

      const DB_NAME = "kodux-ss-db-v3";
      const LEGACY_DB = "kodux-ss-db-v2";

      const ALL_ID = "all";
      const FAVORITES_ID = "favorites";

      const PRELOADED = [
        { type: "youtube", id: "Bt_rLbMjJDk", url: "https://youtu.be/Bt_rLbMjJDk", name: "Trilhas Aromas", artist: "Dual.NextLevel", cover: "https://img.youtube.com/vi/Bt_rLbMjJDk/hqdefault.jpg" },
        { type: "youtube", id: "_0wVkryxanE", url: "https://youtu.be/_0wVkryxanE", name: "12 Arquétipos", artist: "Dual.NextLevel", cover: "https://img.youtube.com/vi/_0wVkryxanE/hqdefault.jpg" },
        { type: "soundcloud", url: "https://soundcloud.com/oi-dual-x-info-dose/sets/mapeamento-das-trilhas-pulso", name: "MAPEAMENTO PULSO", artist: "DUAL X", cover: "https://i1.sndcdn.com/artworks-000418386453-y1w0f1-t500x500.jpg" }
      ];

      let db = createDefaultDB();
      let currentTrackId = null;
      let isPlaying = false;
      let activeEngine = null;
      let ytPlayer = null;
      let scWidget = null;
      let ytReady = false;

      let widgetState = "ball";
      let isDragging = false;
      let currentX = window.innerWidth - 60;
      let currentY = window.innerHeight - 150;

      const widget = document.getElementById("kodux-widget");
      const contents = {
        ball: document.getElementById("content-ball"),
        preview: document.getElementById("content-preview"),
        footer: document.getElementById("content-footer"),
        full: document.getElementById("content-full")
      };

      const audioEl = document.getElementById("local-audio");

      function uid(prefix = "trk") {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      }

      function normalizeTrack(track) {
        return {
          id: track.id || uid(),
          type: track.type || "local",
          url: track.url || "",
          name: track.name || "Sem título",
          artist: track.artist || "Web",
          cover: track.cover || "https://picsum.photos/100",
          blob: track.blob || null,
          favorite: !!track.favorite
        };
      }

      function createDefaultDB() {
        return {
          version: 3,
          library: PRELOADED.map(normalizeTrack),
          playlists: [
            { id: ALL_ID, name: "Todas", system: true, trackIds: [] },
            { id: FAVORITES_ID, name: "Favoritos", system: true, trackIds: [] }
          ],
          activePlaylistId: ALL_ID
        };
      }

      function migrateLegacyIfNeeded() {
        const rawV3 = localStorage.getItem(DB_NAME);
        if (rawV3) {
          try {
            const parsed = JSON.parse(rawV3);
            db = {
              version: 3,
              library: Array.isArray(parsed.library) ? parsed.library.map(normalizeTrack) : [],
              playlists: Array.isArray(parsed.playlists) ? parsed.playlists.map(p => ({
                id: p.id || uid("pl"),
                name: p.name || "Playlist",
                system: !!p.system,
                trackIds: Array.isArray(p.trackIds) ? p.trackIds.slice() : []
              })) : [],
              activePlaylistId: parsed.activePlaylistId || ALL_ID
            };
            ensureSystemPlaylists();
            return;
          } catch (e) {
            db = createDefaultDB();
            ensureSystemPlaylists();
            return;
          }
        }

        const legacy = localStorage.getItem(LEGACY_DB);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed)) {
              db = createDefaultDB();
              db.library = parsed.map(normalizeTrack);
              ensureSystemPlaylists();
              saveDB();
              return;
            }
          } catch (e) {}
        }

        db = createDefaultDB();
        ensureSystemPlaylists();
        saveDB();
      }

      function ensureSystemPlaylists() {
        const hasAll = db.playlists.some(p => p.id === ALL_ID);
        const hasFav = db.playlists.some(p => p.id === FAVORITES_ID);
        if (!hasAll) db.playlists.unshift({ id: ALL_ID, name: "Todas", system: true, trackIds: [] });
        if (!hasFav) db.playlists.splice(1, 0, { id: FAVORITES_ID, name: "Favoritos", system: true, trackIds: [] });
        db.playlists = db.playlists.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
        if (!db.activePlaylistId || !db.playlists.some(p => p.id === db.activePlaylistId)) {
          db.activePlaylistId = ALL_ID;
        }
      }

      function saveDB() {
        localStorage.setItem(DB_NAME, JSON.stringify(db));
      }

      function getPlaylistById(id) {
        return db.playlists.find(p => p.id === id) || null;
      }

      function getActivePlaylist() {
        return getPlaylistById(db.activePlaylistId) || getPlaylistById(ALL_ID);
      }

      function getTrackById(id) {
        return db.library.find(t => t.id === id) || null;
      }

      function getVisibleTracks() {
        const active = getActivePlaylist();
        if (!active || active.id === ALL_ID) return db.library.slice();
        if (active.id === FAVORITES_ID) return db.library.filter(t => t.favorite);
        return active.trackIds.map(getTrackById).filter(Boolean);
      }

      function syncPreviewAndMain(track) {
        const fills = [
          { pre: "prev", title: "prev-title", artist: "prev-artist", cover: "prev-cover" },
          { pre: "foot", title: "foot-title", artist: "foot-artist", cover: "foot-cover" },
          { pre: "main", title: "main-title", artist: "main-artist", cover: "main-cover" }
        ];

        fills.forEach(({ title, artist, cover }) => {
          const titleEl = document.getElementById(title);
          const artistEl = document.getElementById(artist);
          const coverEl = document.getElementById(cover);
          if (titleEl) titleEl.innerText = track?.name || "Oráculo";
          if (artistEl) artistEl.innerText = track?.artist || "Sistema KODUX v2.5";
          if (coverEl) coverEl.src = track?.cover || "https://picsum.photos/100";
        });
      }

      function syncIcons() {
        const icon = isPlaying ? "ph-pause-circle" : "ph-play-circle";
        const iconSimple = isPlaying ? "ph-pause" : "ph-play";
        document.getElementById("prev-play-icon").className = `ph-fill ${icon} text-4xl`;
        document.getElementById("foot-play-icon").className = `ph-fill ${icon} text-5xl`;
        document.getElementById("main-play-icon").className = `ph-fill ${iconSimple} text-3xl ${isPlaying ? "" : "ml-1"}`;
      }

      function stopCurrentPlayback() {
        try { audioEl.pause(); } catch (e) {}
        try { if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo(); } catch (e) {}
        try { if (scWidget && scWidget.pause) scWidget.pause(); } catch (e) {}
        isPlaying = false;
        syncIcons();
      }

      function updateWidgetState(newState) {
        widgetState = newState;
        widget.className = `state-${newState}`;
        Object.values(contents).forEach(el => el.classList.add("hidden-content"));
        contents[newState].classList.remove("hidden-content");

        if (newState === "ball") {
          widget.style.left = `${currentX}px`;
          widget.style.top = `${currentY}px`;
          widget.style.transform = "none";
          widget.style.bottom = "auto";
        } else if (newState === "preview") {
          widget.style.left = currentX < window.innerWidth / 2 ? "10px" : (window.innerWidth - 250) + "px";
          widget.style.top = `${currentY}px`;
          widget.style.transform = "none";
          widget.style.bottom = "auto";
        } else if (newState === "full") {
          widget.style.left = "50%";
          widget.style.top = "50%";
          widget.style.transform = "translate(-50%, -50%)";
          widget.style.bottom = "auto";
        } else if (newState === "footer") {
          widget.style.transform = "none";
          widget.style.left = "0";
          widget.style.top = "auto";
          widget.style.bottom = "0";
        }
      }

      function initDrag() {
        const handleEls = [contents.ball, ...document.querySelectorAll(".drag-header")].filter(Boolean);

        let initialX = 0;
        let initialY = 0;

        const onStart = (e) => {
          if (widgetState === "full" || e.target.closest("button, input, select")) return;
          isDragging = false;
          const touch = e.type === "touchstart" ? e.touches[0] : e;
          initialX = touch.clientX - currentX;
          initialY = touch.clientY - currentY;
          widget.style.transition = "none";
          document.addEventListener("mousemove", onMove);
          document.addEventListener("mouseup", onEnd);
          document.addEventListener("touchmove", onMove, { passive: false });
          document.addEventListener("touchend", onEnd);
        };

        const onMove = (e) => {
          isDragging = true;
          e.preventDefault();
          const touch = e.type === "touchmove" ? e.touches[0] : e;
          currentX = touch.clientX - initialX;
          currentY = touch.clientY - initialY;
          widget.style.left = `${currentX}px`;
          widget.style.top = `${currentY}px`;
        };

        const onEnd = () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onEnd);
          document.removeEventListener("touchmove", onMove);
          document.removeEventListener("touchend", onEnd);
          widget.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

          if (currentY > window.innerHeight - 120) updateWidgetState("footer");
          else if (isDragging) updateWidgetState("ball");
        };

        handleEls.forEach(h => {
          h.addEventListener("mousedown", onStart);
          h.addEventListener("touchstart", onStart);
        });
      }

      function playYT(id) {
        if (!ytReady) return setTimeout(() => playYT(id), 300);

        if (!ytPlayer) {
          ytPlayer = new YT.Player("yt-container", {
            height: "0",
            width: "0",
            videoId: id,
            playerVars: { autoplay: 1, playsinline: 1 },
            events: {
              onReady: (e) => {
                e.target.playVideo();
                isPlaying = true;
                syncIcons();
              },
              onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) playNext();
                isPlaying = (e.data === YT.PlayerState.PLAYING);
                syncIcons();
              }
            }
          });
        } else {
          ytPlayer.loadVideoById(id);
        }
      }

      function playSC(url) {
        const container = document.getElementById("sc-container");
        container.innerHTML = `<iframe id="sc-frame" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false"></iframe>`;
        scWidget = SC.Widget("sc-frame");
        scWidget.bind(SC.Widget.Events.READY, () => {
          scWidget.play();
          isPlaying = true;
          syncIcons();
        });
        scWidget.bind(SC.Widget.Events.FINISH, () => playNext());
        scWidget.bind(SC.Widget.Events.PLAY, () => { isPlaying = true; syncIcons(); });
        scWidget.bind(SC.Widget.Events.PAUSE, () => { isPlaying = false; syncIcons(); });
      }

      function loadAndPlayById(trackId) {
        const track = getTrackById(trackId);
        if (!track) return;

        currentTrackId = trackId;
        activeEngine = track.type;

        stopCurrentPlayback();

        syncPreviewAndMain(track);

        if (track.type === "youtube") {
          playYT(track.id);
        } else if (track.type === "soundcloud") {
          playSC(track.url);
        } else if (track.type === "local") {
          if (!track.blob && !track.url) return;
          const src = track.blob ? URL.createObjectURL(track.blob) : track.url;
          audioEl.src = src;
          audioEl.play().catch(() => alert("Clique em Play para iniciar o áudio local (bloqueio do navegador)."));
          isPlaying = true;
          syncIcons();
        }

        renderEverything();
      }

      function togglePlay(e) {
        if (e) e.stopPropagation();

        const visible = getVisibleTracks();
        if (!visible.length) return;

        if (!currentTrackId) {
          loadAndPlayById(visible[0].id);
          return;
        }

        const current = getTrackById(currentTrackId);
        if (!current) {
          loadAndPlayById(visible[0].id);
          return;
        }

        if (isPlaying) {
          if (activeEngine === "youtube" && ytPlayer) ytPlayer.pauseVideo();
          else if (activeEngine === "soundcloud" && scWidget) scWidget.pause();
          else audioEl.pause();
          isPlaying = false;
        } else {
          if (activeEngine === "youtube" && ytPlayer) ytPlayer.playVideo();
          else if (activeEngine === "soundcloud" && scWidget) scWidget.play();
          else if (activeEngine === "local") audioEl.play();
          isPlaying = true;
        }
        syncIcons();
      }

      function playNext() {
        const visible = getVisibleTracks();
        if (!visible.length) return;
        const idx = currentTrackId ? visible.findIndex(t => t.id === currentTrackId) : -1;
        const next = visible[(idx + 1) % visible.length];
        if (next) loadAndPlayById(next.id);
      }

      function playPrev() {
        const visible = getVisibleTracks();
        if (!visible.length) return;
        const idx = currentTrackId ? visible.findIndex(t => t.id === currentTrackId) : 0;
        const prev = visible[(idx - 1 + visible.length) % visible.length];
        if (prev) loadAndPlayById(prev.id);
      }

      function setActivePlaylist(id) {
        db.activePlaylistId = id;
        saveDB();
        renderEverything();
      }

      function createPlaylist() {
        const input = document.getElementById("new-playlist-input");
        const name = input.value.trim();
        if (!name) return;

        const exists = db.playlists.some(p => p.name.toLowerCase() === name.toLowerCase());
        if (exists) return alert("Já existe uma playlist com esse nome.");

        db.playlists.push({
          id: uid("pl"),
          name,
          system: false,
          trackIds: []
        });

        input.value = "";
        saveDB();
        renderEverything();
      }

      function deletePlaylist(playlistId) {
        const playlist = getPlaylistById(playlistId);
        if (!playlist || playlist.system) return;
        if (!confirm(`Remover a playlist "${playlist.name}"?`)) return;

        db.playlists = db.playlists.filter(p => p.id !== playlistId);
        if (db.activePlaylistId === playlistId) db.activePlaylistId = ALL_ID;
        saveDB();
        renderEverything();
      }

      function toggleFavorite(trackId) {
        const track = getTrackById(trackId);
        if (!track) return;
        track.favorite = !track.favorite;
        saveDB();
        renderEverything();
      }

      function addTrackToPlaylist(trackId, playlistId) {
        const playlist = getPlaylistById(playlistId);
        const track = getTrackById(trackId);
        if (!track || !playlist) return;

        if (playlist.id === ALL_ID) {
          db.activePlaylistId = ALL_ID;
        } else if (playlist.id === FAVORITES_ID) {
          track.favorite = true;
          db.activePlaylistId = FAVORITES_ID;
        } else {
          if (!playlist.trackIds.includes(trackId)) playlist.trackIds.unshift(trackId);
          db.activePlaylistId = playlist.id;
        }

        saveDB();
        renderEverything();
      }

      function quickAddToSelectedPlaylist(trackId) {
        const dest = document.getElementById("destination-select").value;
        addTrackToPlaylist(trackId, dest);
      }

      function removeTrack(trackId) {
        const active = getActivePlaylist();
        const track = getTrackById(trackId);
        if (!track) return;

        if (active.id === FAVORITES_ID) {
          track.favorite = false;
        } else if (active.id === ALL_ID) {
          db.library = db.library.filter(t => t.id !== trackId);
          db.playlists.forEach(p => {
            if (Array.isArray(p.trackIds)) p.trackIds = p.trackIds.filter(id => id !== trackId);
          });
          if (currentTrackId === trackId) {
            currentTrackId = null;
            stopCurrentPlayback();
          }
        } else {
          active.trackIds = active.trackIds.filter(id => id !== trackId);
          if (currentTrackId === trackId) {
            currentTrackId = null;
            stopCurrentPlayback();
          }
        }

        saveDB();
        renderEverything();
      }

      function findExistingTrackByUrl(url, type, id) {
        if (type === "youtube" && id) {
          return db.library.find(t => t.type === "youtube" && t.id === id) || null;
        }
        if (type === "soundcloud") {
          return db.library.find(t => t.type === "soundcloud" && t.url === url) || null;
        }
        return db.library.find(t => t.url === url) || null;
      }

      function normalizeAndInsertToLibrary(track) {
        const normalized = normalizeTrack(track);
        const existing = findExistingTrackByUrl(normalized.url, normalized.type, normalized.id);
        if (existing) {
          existing.name = normalized.name || existing.name;
          existing.artist = normalized.artist || existing.artist;
          existing.cover = normalized.cover || existing.cover;
          if (normalized.type === "local" && normalized.blob) existing.blob = normalized.blob;
          return existing;
        }
        db.library.unshift(normalized);
        return normalized;
      }

      async function addLink() {
        const input = document.getElementById("link-input");
        const destination = document.getElementById("destination-select").value;
        const url = input.value.trim();
        if (!url) return;

        let newTrack = {
          name: "Carregando...",
          artist: "Web",
          cover: "https://picsum.photos/100",
          url,
          favorite: false
        };

        if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("youtube-nocookie.com")) {
          const id = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([0-9A-Za-z_-]{11})/)?.[1];
          if (!id) return alert("Link YouTube inválido.");

          newTrack.type = "youtube";
          newTrack.id = id;
          newTrack.cover = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

          try {
            const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            newTrack.name = data.title || "YouTube Track";
            newTrack.artist = data.author_name || "YouTube";
          } catch (e) {
            newTrack.name = "YouTube Track";
            newTrack.artist = "YouTube";
          }
        } else if (url.includes("soundcloud.com")) {
          newTrack.type = "soundcloud";
          try {
            const res = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
            const data = await res.json();
            newTrack.name = data.title || "SoundCloud Track";
            newTrack.artist = data.author_name || "SoundCloud";
            newTrack.cover = data.thumbnail_url || newTrack.cover;
          } catch (e) {
            newTrack.name = "SoundCloud Track";
            newTrack.artist = "SoundCloud";
          }
        } else {
          newTrack.type = "local";
          newTrack.name = url.split("/").pop() || "Arquivo local";
          newTrack.artist = "Local";
        }

        const inserted = normalizeAndInsertToLibrary(newTrack);

        if (destination === FAVORITES_ID) {
          inserted.favorite = true;
        } else if (destination !== ALL_ID) {
          const playlist = getPlaylistById(destination);
          if (playlist && !playlist.trackIds.includes(inserted.id)) playlist.trackIds.unshift(inserted.id);
        }

        input.value = "";
        saveDB();
        renderEverything();
      }

      function renderTabs() {
        const tabs = document.getElementById("playlist-tabs");
        tabs.innerHTML = "";

        const ordered = [
          getPlaylistById(ALL_ID),
          getPlaylistById(FAVORITES_ID),
          ...db.playlists.filter(p => !p.system && p.id !== ALL_ID && p.id !== FAVORITES_ID)
        ].filter(Boolean);

        ordered.forEach(pl => {
          const visibleCount = pl.id === ALL_ID
            ? db.library.length
            : pl.id === FAVORITES_ID
              ? db.library.filter(t => t.favorite).length
              : (pl.trackIds || []).length;

          const btn = document.createElement("button");
          btn.className = `mini-chip ${db.activePlaylistId === pl.id ? "active" : ""}`;
          btn.onclick = () => setActivePlaylist(pl.id);
          btn.innerHTML = `
            <i class="ph ${pl.id === ALL_ID ? "ph-stack" : pl.id === FAVORITES_ID ? "ph-heart" : "ph-playlist"}"></i>
            <span>${pl.name}</span>
            <span class="opacity-60">(${visibleCount})</span>
          `;
          tabs.appendChild(btn);

          if (!pl.system && pl.id !== ALL_ID && pl.id !== FAVORITES_ID) {
            const del = document.createElement("button");
            del.className = "mini-chip";
            del.style.padding = "0.55rem 0.7rem";
            del.title = "Remover playlist";
            del.onclick = (e) => {
              e.stopPropagation();
              deletePlaylist(pl.id);
            };
            del.innerHTML = `<i class="ph ph-trash"></i>`;
            tabs.appendChild(del);
          }
        });
      }

      function renderDestinationSelect() {
        const select = document.getElementById("destination-select");
        const prev = select.value || db.activePlaylistId || ALL_ID;
        const custom = db.playlists.filter(p => !p.system && p.id !== ALL_ID && p.id !== FAVORITES_ID);

        select.innerHTML = `
          <option value="${ALL_ID}">Todas</option>
          <option value="${FAVORITES_ID}">Favoritos</option>
          ${custom.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}
        `;

        if ([ALL_ID, FAVORITES_ID, ...custom.map(p => p.id)].includes(prev)) {
          select.value = prev;
        } else {
          select.value = db.activePlaylistId || ALL_ID;
        }
      }

      function renderPlaylist() {
        const container = document.getElementById("playlist-container");
        const active = getActivePlaylist();
        const visible = getVisibleTracks();

        container.innerHTML = "";

        if (!visible.length) {
          const empty = document.createElement("div");
          empty.className = "p-5 rounded-2xl border border-white/10 bg-white/5 text-center";
          empty.innerHTML = `
            <div class="text-[var(--primary)] text-3xl mb-2">
              <i class="ph ph-disc"></i>
            </div>
            <h4 class="text-sm font-bold text-white mb-1">Sem faixas aqui</h4>
            <p class="text-[11px] text-[var(--muted)]">
              Adicione um link, crie uma playlist ou marque favoritos.
            </p>
          `;
          container.appendChild(empty);
          return;
        }

        visible.forEach((t) => {
          const activeItem = t.id === currentTrackId;
          const item = document.createElement("div");
          item.className = `flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${activeItem ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30" : "bg-white/5 hover:bg-white/10"}`;

          item.innerHTML = `
            <img src="${t.cover}" class="w-10 h-10 rounded-lg object-cover border border-white/10">
            <div class="flex-1 overflow-hidden min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${t.name}</h5>
              <p class="text-[10px] text-[var(--muted)] truncate">${t.artist}</p>
            </div>

            <button class="item-action fav ${t.favorite ? "active" : ""}" title="Favoritar" onclick="event.stopPropagation(); toggleFavorite('${t.id}')">
              <i class="ph ${t.favorite ? "ph-heart-fill" : "ph-heart"}"></i>
            </button>

            <button class="item-action add" title="Adicionar à playlist escolhida" onclick="event.stopPropagation(); quickAddToSelectedPlaylist('${t.id}')">
              <i class="ph ph-plus"></i>
            </button>

            <button class="item-action" title="Excluir" onclick="event.stopPropagation(); removeTrack('${t.id}')">
              <i class="ph ph-trash"></i>
            </button>

            ${activeItem && isPlaying ? '<i class="ph-fill ph-waveform text-[var(--primary)] animate-pulse ml-1"></i>' : ""}
          `;

          item.onclick = () => loadAndPlayById(t.id);
          container.appendChild(item);
        });
      }

      function renderEverything() {
        renderTabs();
        renderDestinationSelect();
        renderPlaylist();
        const current = currentTrackId ? getTrackById(currentTrackId) : null;
        if (current) syncPreviewAndMain(current);
        else syncPreviewAndMain(null);
        syncIcons();
      }

      function openFullFromPreview(e) {
        e.stopPropagation();
        updateWidgetState("full");
      }

      function handleClickOutside(e) {
        if (widgetState === "preview" && !widget.contains(e.target)) {
          updateWidgetState("ball");
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);

      window.openFullFromPreview = openFullFromPreview;
      window.updateWidgetState = updateWidgetState;
      window.togglePlay = togglePlay;
      window.playNext = playNext;
      window.playPrev = playPrev;
      window.addLink = addLink;
      window.collapseToBall = (e) => {
        if (e) e.stopPropagation();
        updateWidgetState("ball");
      };
      window.toggleFavorite = toggleFavorite;
      window.removeTrack = removeTrack;
      window.quickAddToSelectedPlaylist = quickAddToSelectedPlaylist;
      window.createPlaylist = createPlaylist;

      window.onYouTubeIframeAPIReady = () => { ytReady = true; };

      document.getElementById("kodux-widget").onclick = (e) => {
        if (isDragging) return;
        if (widgetState === "ball") updateWidgetState("preview");
      };

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      migrateLegacyIfNeeded();
      initDrag();
      renderEverything();
      updateWidgetState("ball");
    })();









(function() {
      // Aguarda o DOM e o script original carregarem
      window.addEventListener('load', () => {
        setTimeout(() => {
          const mainProgress = document.getElementById('main-progress');
          const timeCurrent = document.getElementById('kodux-time-current');
          const timeTotal = document.getElementById('kodux-time-total');
          const localAudio = document.getElementById('local-audio');
          const footerClick = document.getElementById('footer-progress-click');

          let isDragging = false;
          let activeDuration = 0;

          // Utilitário para formatar segundos em MM:SS
          const formatTime = (seconds) => {
            if (!seconds || isNaN(seconds)) return "00:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          };

          // Função para buscar o tempo de onde estiver tocando
          const syncTimers = () => {
            if (isDragging) return; // Não atualiza se o usuário estiver segurando a barra

            let cTime = 0;
            let dur = 0;
            
            // Procura a mídia nativa tocando (Áudio HTML5 ou Vídeo em background)
            const mediaEl = (localAudio && localAudio.src) ? localAudio : document.querySelector('video, audio:not(#local-audio)');
            
            if (mediaEl && !mediaEl.paused && mediaEl.duration) {
                cTime = mediaEl.currentTime;
                dur = mediaEl.duration;
            } else if (window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function' && window.ytPlayer.getPlayerState() === 1) {
                // Se a API global do YouTube existir e estiver tocando
                cTime = window.ytPlayer.getCurrentTime();
                dur = window.ytPlayer.getDuration();
            }

            if (dur > 0) {
                activeDuration = dur;
                timeTotal.innerText = formatTime(dur);
                timeCurrent.innerText = formatTime(cTime);
                
                // Se o script original não atualizar a barra sozinho, a gente atualiza
                if (mainProgress && document.activeElement !== mainProgress) {
                   // mainProgress.value = (cTime / dur) * 100; // Descomente se a barra original parar de andar
                }
            } else {
                // Fallback: Se não conseguir pegar a duração da API, mas o ss5.js atualiza o mainProgress (0-100)
                let pct = parseFloat(mainProgress.value);
                if (activeDuration > 0 && pct >= 0) {
                   timeCurrent.innerText = formatTime((pct / 100) * activeDuration);
                }
            }
          };

          // Loop de sincronização de tempo rodando a cada 500ms
          setInterval(syncTimers, 500);

          // Lógica de "SEEK" (Avançar/Mudar a parte da música)
          const performSeek = (percent) => {
             const mediaEl = (localAudio && localAudio.src) ? localAudio : document.querySelector('video, audio:not(#local-audio)');
             
             // 1. Tenta injetar direto no elemento de Media
             if (mediaEl && mediaEl.duration) {
                 mediaEl.currentTime = (percent / 100) * mediaEl.duration;
             } 
             // 2. Tenta injetar na API do YouTube
             else if (window.ytPlayer && typeof window.ytPlayer.seekTo === 'function') {
                 window.ytPlayer.seekTo((percent / 100) * window.ytPlayer.getDuration(), true);
             }
             
             // 3. Força um evento nativo 'change' para o ss5.js original capturar (se ele tiver essa função programada)
             if (mainProgress) {
                 mainProgress.value = percent;
                 mainProgress.dispatchEvent(new Event('change', { bubbles: true }));
             }
          };

          // Eventos para arrastar a barra principal (main-progress)
          if (mainProgress) {
            mainProgress.addEventListener('mousedown', () => isDragging = true);
            mainProgress.addEventListener('touchstart', () => isDragging = true);

            // Atualiza o texto do tempo dinamicamente enquanto arrasta
            mainProgress.addEventListener('input', (e) => {
               if (activeDuration > 0) {
                   timeCurrent.innerText = formatTime((e.target.value / 100) * activeDuration);
               }
            });

            // Aplica o "Pulo" quando soltar a barra
            mainProgress.addEventListener('change', (e) => {
              isDragging = false;
              performSeek(e.target.value);
            });

            mainProgress.addEventListener('mouseup', () => isDragging = false);
            mainProgress.addEventListener('touchend', () => isDragging = false);
          }

          // Permitir clicar na barra pequena que fica rodapé do widget para avançar
          if (footerClick) {
              footerClick.addEventListener('click', (e) => {
                  const rect = footerClick.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = (x / rect.width) * 100;
                  
                  // Atualiza visualmente a barra menor
                  const fBar = document.getElementById('footer-progress-bar');
                  if (fBar) fBar.style.width = `${percent}%`;
                  
                  performSeek(percent);
              });
          }

        }, 1000); // delay de 1 segundo pra garantir que o ss5.js carregou tudo
      });
    })();
