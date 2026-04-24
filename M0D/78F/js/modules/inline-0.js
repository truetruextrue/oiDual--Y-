
    const catalogo78Frames = [
      {
        id: "hero-3",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero3.jpg",
        badge: "obra viva",
        kicker: "Síntese Cognitiva",
        tituloNormal: "Espelho ",
        tituloDestaque: "Vivo",
        lead: "A obra é um espelho vivo onde a mente toca a si mesma, transformando ruído em ritmo e tensão em presença.",
        versoes: [
          { titulo: "A Síntese do Loop", texto: "Ruído que vira ritmo. Tensão que vira presença. Dopamina sutil que convida o olhar a permanecer e se reorganizar num estado de flow pacífico." },
          { titulo: "Engenharia Cognitiva", texto: "A estética em glitch tipográfico cria micro-recompensas visuais. A imagem não se fecha de uma vez — ela chama o próximo nível de interpretação do cérebro." }
        ]
      },
      {
        id: "hero-2",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero0.jpg",
        badge: "ritual interativo",
        kicker: "Arquétipo Ocitocina",
        tituloNormal: "Espaço da ",
        tituloDestaque: "Mente",
        lead: "A obra invoca a sensação onde cessa conflitos e apazigua. Onde a Ocitocina ensina o peso de forma equilibrada.",
        versoes: [
          { titulo: "Vibe de Ambiente", texto: "Reduz drasticamente o que pesa. Ideal para áreas gourmet e momentos de descompressão. A ocitocina media as ações de maneira atemporal." },
          { titulo: "Selo Álcool Blues", texto: "O peso vira ritmo e flui. Luz baixa, mente acesa. Funciona como modulador de estado mental leve, mantendo o ambiente fluindo sem atrito." }
        ]
      },
      {
        id: "hero-0",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero2.jpg",
        badge: "zero state",
        kicker: "Zero Base",
        tituloNormal: "Ponto ",
        tituloDestaque: "Zero",
        lead: "O início do código visual. Onde a forma encontra o vácuo criativo e a mente descansa na ausência de ruído.",
        versoes: [
          { titulo: "A Ausência", texto: "Retirar o excesso para que a mente do observador possa preencher as lacunas. O design focado no 'nada' permite um reset cognitivo imediato." },
          { titulo: "Vácuo Criativo", texto: "Ideal para iniciar sessões de trabalho profundo. O olhar não tropeça, ele desliza sem barreiras estruturais." }
        ]
      },
      {
        id: "hero-1",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero5.jpg",
        badge: "frequência azul",
        kicker: "Expansão Bllue",
        tituloNormal: "Fluxo ",
        tituloDestaque: "Contínuo",
        lead: "Arquitetura visual baseada em ciclos incompletos que mantêm o cérebro em estado de flow perceptivo.",
        versoes: [
          { titulo: "Pattern Recognition", texto: "A mente tenta fechar as formas, gerando um estado de engajamento ativo e prazeroso, sem exaustão visual." },
          { titulo: "Aplicação Constante", texto: "Induz um estado semelhante ao de olhar o mar ou o fogo. Perfeito para manter pessoas confortáveis no ambiente por mais tempo." }
        ]
      },
      {
        id: "hero-4",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero1.jpeg",
        badge: "infodose peak",
        kicker: "Infodose High",
        tituloNormal: "Cume ",
        tituloDestaque: "Digital",
        lead: "Exploração de contrastes e cores vibrantes para ativação imediata. O choque elétrico que acorda o córtex.",
        versoes: [
          { titulo: "Choque Visual", texto: "Cores saturadas que elevam a frequência cardíaca sutilmente e quebram o estado de 'piloto automático' instantaneamente." },
          { titulo: "Gatilho Criativo", texto: "Ambientes vibrantes estimulam associações de ideias mais rápidas. Inspira coragem e audácia em salas de ideação." }
        ]
      },
      {
        id: "hero-5",
        imagemSrc: "https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/media/hero/hero4.jpg",
        badge: "omega",
        kicker: "Final Code",
        tituloNormal: "Última ",
        tituloDestaque: "Frequência",
        lead: "O fechamento do ciclo cromático. Uma imersão profunda e definitiva, onde observador e obra se fundem.",
        versoes: [
          { titulo: "A Síntese Final", texto: "Cores densas que puxam o olhar para um núcleo infinito, onde o limite entre o espaço físico e a arte digital desaparece." },
          { titulo: "Conexão Profunda", texto: "Um peso visual ancorador que traz foco absoluto ao presente. A liberação final das tensões acumuladas em puro silêncio." }
        ]
      }
    ];

    const KEYS = {
      images: 'di_bgImages',
      opacity: 'di_bg_opacity',
      blend: 'di_bg_blend',
      active: 'di_bg_active',
      auto: 'di_bg_auto'
    };

    let currentIndex = 0;

    function el(id) { return document.getElementById(id); }

    function safeParse(raw, fallback) {
      try { return raw ? JSON.parse(raw) : fallback; }
      catch { return fallback; }
    }

    function emitBgStorageChange(key) {
      window.dispatchEvent(new CustomEvent('di:storage', {
        detail: { key }
      }));
    }

    function getBgList() {
      return safeParse(localStorage.getItem(KEYS.images), []);
    }

    function setBgList(list) {
      localStorage.setItem(KEYS.images, JSON.stringify(list));
      emitBgStorageChange(KEYS.images);
    }

    function upsertBg(url, name = 'background') {
      if (!url) return;

      const list = getBgList();
      const idx = list.findIndex(item => item && item.data === url);

      if (idx === -1) {
        list.unshift({
          id: `bg_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`,
          name,
          data: url,
          active: true
        });
      } else {
        list.forEach((item, i) => item.active = i === idx);
        list[idx].name = name || list[idx].name || 'background';
      }

      setBgList(list);
      const activeIndex = list.findIndex(item => item.active);
      localStorage.setItem(KEYS.active, activeIndex >= 0 ? String(activeIndex) : '');
      emitBgStorageChange(KEYS.active);
      renderLibrary();
    }

    function setActiveBgByUrl(url) {
      const list = getBgList();
      const idx = list.findIndex(item => item && item.data === url);
      if (idx === -1) return;

      list.forEach((item, i) => item.active = i === idx);
      setBgList(list);
      localStorage.setItem(KEYS.active, String(idx));
      emitBgStorageChange(KEYS.active);
      syncFromStorage();
      renderLibrary();
    }

    function getActiveBg() {
      const list = getBgList();
      const activeIndexRaw = localStorage.getItem(KEYS.active);

      if (activeIndexRaw !== null && activeIndexRaw !== '') {
        const idx = Number(activeIndexRaw);
        if (Number.isFinite(idx) && list[idx]?.data) {
          return {
            url: list[idx].data,
            label: list[idx].name || list[idx].id || 'background',
            opacity: localStorage.getItem(KEYS.opacity),
            blend: localStorage.getItem(KEYS.blend),
            auto: localStorage.getItem(KEYS.auto)
          };
        }
      }

      const activeItem = list.find(item => item && item.active && item.data);
      if (activeItem) {
        return {
          url: activeItem.data,
          label: activeItem.name || activeItem.id || 'background',
          opacity: localStorage.getItem(KEYS.opacity),
          blend: localStorage.getItem(KEYS.blend),
          auto: localStorage.getItem(KEYS.auto)
        };
      }

      return {
        url: '',
        label: 'Nenhum',
        opacity: localStorage.getItem(KEYS.opacity),
        blend: localStorage.getItem(KEYS.blend),
        auto: localStorage.getItem(KEYS.auto)
      };
    }

    function applyStateToUI(state) {
      const layer = el('bg-layer-fixed');
      if (layer) {
        const opacity = state.opacity !== null && state.opacity !== undefined ? Number(state.opacity) : 18;
        const blend = state.blend || 'overlay';
        layer.style.opacity = String(Math.max(0, Math.min(1, opacity / 100)));
        layer.style.mixBlendMode = blend;
        layer.style.backgroundImage = state.url ? `url("${state.url}")` : 'none';
      }

      const status = el('bgStatusText');
      if (status) status.textContent = state.label || (state.url ? 'Ativo' : 'Nenhum');

      const opacityLabel = el('val-op');
      if (opacityLabel) {
        const op = state.opacity !== null && state.opacity !== undefined ? Number(state.opacity) : 18;
        opacityLabel.textContent = `${op}%`;
      }

      const opacityInput = el('bgOpacity');
      if (opacityInput) {
        const op = state.opacity !== null && state.opacity !== undefined ? String(state.opacity) : '18';
        if (opacityInput.value !== op) opacityInput.value = op;
      }

      const blendSelect = el('bgBlend');
      if (blendSelect) {
        const blend = state.blend || 'overlay';
        if (blendSelect.value !== blend) blendSelect.value = blend;
      }

      const count = el('libCount');
      if (count) count.textContent = String(getBgList().length);

      renderLibrary();
    }

    function syncFromStorage() {
      const state = getActiveBg();
      applyStateToUI(state);
      window.dispatchEvent(new CustomEvent('di:bg:sync', { detail: state }));
    }

    function startPollingFallback() {
      let last = [
        localStorage.getItem(KEYS.images) || '',
        localStorage.getItem(KEYS.opacity) || '',
        localStorage.getItem(KEYS.blend) || '',
        localStorage.getItem(KEYS.active) || '',
        localStorage.getItem(KEYS.auto) || ''
      ].join('||');

      setInterval(() => {
        const now = [
          localStorage.getItem(KEYS.images) || '',
          localStorage.getItem(KEYS.opacity) || '',
          localStorage.getItem(KEYS.blend) || '',
          localStorage.getItem(KEYS.active) || '',
          localStorage.getItem(KEYS.auto) || ''
        ].join('||');

        if (now !== last) {
          last = now;
          syncFromStorage();
        }
      }, 800);
    }

    function bindEvents() {
      window.addEventListener('storage', (e) => {
        if (!e || !Object.values(KEYS).includes(e.key)) return;
        syncFromStorage();
      });

      window.addEventListener('di:storage', (e) => {
        const key = e?.detail?.key;
        if (key && !Object.values(KEYS).includes(key)) return;
        syncFromStorage();
      });

      window.addEventListener('di:bg:requestSync', syncFromStorage);
    }

    window.toggleDrawer = function() {
      el('drawerOverlay').classList.toggle('active');
      el('drawerPanel').classList.toggle('active');
    };

    window.updateBgAttr = function(type, val) {
      if (type === 'opacity') {
        localStorage.setItem(KEYS.opacity, String(val));
        emitBgStorageChange(KEYS.opacity);
      } else if (type === 'blend') {
        localStorage.setItem(KEYS.blend, String(val));
        emitBgStorageChange(KEYS.blend);
      }
      syncFromStorage();
    };

    window.applyPreset = function(mode) {
      const bgOpacity = el('bgOpacity');
      const bgBlend = el('bgBlend');

      let newOp = 15;
      let newBlend = 'overlay';

      if (mode === 'ghost') {
        newOp = 10;
        newBlend = 'luminosity';
      } else if (mode === 'vivid') {
        newOp = 35;
        newBlend = 'overlay';
      } else if (mode === 'deep') {
        newOp = 50;
        newBlend = 'multiply';
      }

      if (bgOpacity) bgOpacity.value = newOp;
      if (bgBlend) bgBlend.value = newBlend;

      updateBgAttr('opacity', newOp);
      updateBgAttr('blend', newBlend);

      document.querySelectorAll('[data-bg-preset]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.bgPreset === mode);
      });
    };

    function applyBg(url, label = 'background', persist = true) {
      if (!url) return;

      if (persist) {
        upsertBg(url, label);
      } else {
        const list = getBgList();
        const idx = list.findIndex(item => item && item.data === url);
        if (idx >= 0) {
          list.forEach((item, i) => item.active = i === idx);
          setBgList(list);
          localStorage.setItem(KEYS.active, String(idx));
          emitBgStorageChange(KEYS.active);
        } else {
          upsertBg(url, label);
        }
      }

      syncFromStorage();
      renderLibrary();
    }

    window.setAsBg = function() {
      const currentImg = catalogo78Frames[currentIndex].imagemSrc;
      applyBg(currentImg, catalogo78Frames[currentIndex].tituloNormal.trim() + catalogo78Frames[currentIndex].tituloDestaque, true);
    };

    window.handleUpload = function(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const url = e.target.result;
          applyBg(url, input.files[0].name || 'upload', true);
        };
        reader.readAsDataURL(input.files[0]);
      }
    };

    function saveCurrentFrameToLibrary() {
      catalogo78Frames.forEach(f => upsertBg(f.imagemSrc, f.tituloNormal.trim() + f.tituloDestaque));
    }

    function renderLibrary() {
      const items = getBgList();
      const activeUrl = getActiveBg().url;
      const container = el('thumb-list');
      if (!container) return;

      el('libCount').textContent = String(items.length);

      container.innerHTML = items.map(item => `
        <div class="thumb-item ${item.data === activeUrl ? 'active' : ''}"
             style="background-image:url('${item.data}')"
             title="${(item.name || 'background').replace(/"/g,'&quot;')}"
             data-url="${encodeURIComponent(item.data)}">
        </div>
      `).join('');

      container.querySelectorAll('.thumb-item').forEach(node => {
        node.onclick = () => {
          const url = decodeURIComponent(node.dataset.url || '');
          setActiveBgByUrl(url);
        };
      });
    }

    function initSwipe() {
      const area = document.getElementById('swipe-area');
      if (!area || area.__diSwipeBound) return;
      area.__diSwipeBound = true;

      let startX = 0;
      let isDown = false;

      area.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      area.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        handleGesture(startX, endX);
      });

      area.addEventListener('mousedown', e => { startX = e.clientX; isDown = true; });
      area.addEventListener('mouseup', e => {
        if (!isDown) return;
        handleGesture(startX, e.clientX);
        isDown = false;
      });
      area.addEventListener('mouseleave', () => isDown = false);
    }

    function handleGesture(sX, eX) {
      const threshold = 60;
      if (sX - eX > threshold) changeFrame(1);
      else if (eX - sX > threshold) changeFrame(-1);
    }

    window.changeFrame = function(dir) {
      const newIndex = currentIndex + dir;
      if (newIndex >= 0 && newIndex < catalogo78Frames.length) {
        currentIndex = newIndex;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const root = document.getElementById('app-root');
        root.style.animation = 'none';
        root.offsetHeight;
        root.style.animation = null;

        setTimeout(() => renderFrame(currentIndex), 10);
      }
    };

    function renderFrame(index) {
      const data = catalogo78Frames[index];
      const root = el('app-root');

      el('ui-catalog-counter').innerText = `QUADRO ${String(index + 1).padStart(2, '0')} DE ${catalogo78Frames.length}`;

      root.innerHTML = `
        <div class="hero">
          <div class="hero-media" id="swipe-area" title="Deslize para os lados">
            <img src="${data.imagemSrc}" alt="${data.tituloNormal}${data.tituloDestaque}">
            <div class="badge"><span class="dot"></span> ${data.badge}</div>
            <div class="swipe-hint">← Deslize para navegar →</div>
          </div>
          <div class="hero-content">
            <div class="kicker"><span>${data.kicker}</span><div class="line"></div></div>
            <h2 class="hero-title"><span>${data.tituloNormal}</span>${data.tituloDestaque}</h2>
            <p class="hero-desc">${data.lead}</p>
            <button class="btn-action" onclick="setAsBg()">Ativar no Background</button>
          </div>
        </div>

        <div class="accordion-group">
          ${data.versoes.map((v, i) => `
            <details ${i === 0 ? 'open' : ''}>
              <summary>${v.titulo} <span class="icon">▼</span></summary>
              <div class="acc-content">${v.texto}</div>
            </details>
          `).join('')}
        </div>
      `;

      el('btn-prev').disabled = index === 0;
      el('btn-next').disabled = index === catalogo78Frames.length - 1;
      initSwipe();
    }

    // ===== FX LAB =====
    const fxCanvas = () => el('fxCanvas');
    const fxCtx = () => fxCanvas().getContext('2d', { willReadFrequently: true });
    const fxSrc = document.createElement('canvas');
    const fxSrcCtx = fxSrc.getContext('2d', { willReadFrequently: true });

    const fxState = {
      mode: 'texture',
      loaded: false,
      img: null,
      name: 'fx'
    };

    const fxControls = {
      blur: el('fxBlur'),
      intensity: el('fxIntensity'),
      liquify: el('fxLiquify'),
      grain: el('fxGrain'),
      contrast: el('fxContrast'),
      saturation: el('fxSaturation')
    };

    function updateFXLabels() {
      el('fxBlurVal').textContent = fxControls.blur.value;
      el('fxIntensityVal').textContent = fxControls.intensity.value;
      el('fxLiquifyVal').textContent = fxControls.liquify.value;
      el('fxGrainVal').textContent = fxControls.grain.value;
      el('fxContrastVal').textContent = fxControls.contrast.value;
      el('fxSaturationVal').textContent = fxControls.saturation.value;
    }

    function setFXMode(mode) {
      fxState.mode = mode;
      document.querySelectorAll('[data-fx-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.fxMode === mode);
      });
      renderFX();
    }

    window.setFXMode = setFXMode;

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function resizeFXCanvasToImage(maxW = 1200) {
      if (!fxState.img || !fxState.img.naturalWidth || !fxState.img.naturalHeight) return;
      const ratio = fxState.img.naturalHeight / fxState.img.naturalWidth;
      const w = Math.min(fxState.img.naturalWidth, maxW);
      const h = Math.max(1, Math.round(w * ratio));
      fxCanvas().width = w;
      fxCanvas().height = h;
      fxSrc.width = w;
      fxSrc.height = h;
    }

    function loadFxImageFromUrl(url, name = 'image') {
      if (!url) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        fxState.img = img;
        fxState.loaded = true;
        fxState.name = name || 'image';
        resizeFXCanvasToImage();
        renderFX();
      };
      img.src = url;
    }

    function loadFxImageFromFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => loadFxImageFromUrl(e.target.result, file.name || 'upload');
      reader.readAsDataURL(file);
    }

    function renderFX() {
      if (!fxState.loaded || !fxState.img) {
        const c = fxCanvas();
        const ctx = fxCtx();
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#edf2fb';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#64708a';
        ctx.font = '700 24px Inter, system-ui, sans-serif';
        ctx.fillText('Carregue um quadro ou uma imagem', 32, 56);
        return;
      }

      const c = fxCanvas();
      const ctx = fxCtx();
      const w = c.width;
      const h = c.height;

      fxSrcCtx.clearRect(0, 0, w, h);
      fxSrcCtx.drawImage(fxState.img, 0, 0, w, h);

      const blur = Number(fxControls.blur.value);
      ctx.clearRect(0, 0, w, h);
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(fxSrc, 0, 0, w, h);
      ctx.filter = 'none';

      let imageData = ctx.getImageData(0, 0, w, h);
      const srcData = fxSrcCtx.getImageData(0, 0, w, h).data;
      const out = new Uint8ClampedArray(imageData.data.length);

      const intensity = Number(fxControls.intensity.value) / 100;
      const liquify = Number(fxControls.liquify.value) / 100;
      const grain = Number(fxControls.grain.value) / 100;
      const contrast = Number(fxControls.contrast.value) / 100;
      const saturation = Number(fxControls.saturation.value) / 100;

      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;

      function sampleNearest(x, y) {
        const ix = clamp(Math.round(x), 0, w - 1);
        const iy = clamp(Math.round(y), 0, h - 1);
        const idx = (iy * w + ix) * 4;
        return [srcData[idx], srcData[idx + 1], srcData[idx + 2], srcData[idx + 3]];
      }

      function posterize(v, levels) {
        const step = 255 / (levels - 1);
        return Math.round(v / step) * step;
      }

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          let dx = x;
          let dy = y;

          if (fxState.mode === 'liquid' || liquify > 0) {
            const nx = x / w;
            const ny = y / h;
            const waveX = Math.sin((ny * 10.0) + (nx * 6.0)) * 18 * liquify;
            const waveY = Math.cos((nx * 8.0) - (ny * 5.0)) * 14 * liquify;
            const swirl = ((x - cx) / maxDist) * ((y - cy) / maxDist);
            dx = x + waveX + swirl * 10 * liquify;
            dy = y + waveY - swirl * 8 * liquify;
          }

          const px = sampleNearest(dx, dy);
          let r = px[0], g = px[1], b = px[2], a = px[3];

          if (fxState.mode === 'texture') {
            const grainStrength = 24 * grain * intensity;
            const n = (Math.random() - 0.5) * grainStrength;
            r += n; g += n; b += n;
          }

          if (fxState.mode === 'liquid') {
            const edge = Math.sin((x + y) * 0.03) * 10 * intensity;
            r += edge;
            g += edge * 0.8;
            b += edge * 1.05;
          }

          if (fxState.mode === 'paint') {
            const levels = 7 - Math.floor(intensity * 3);
            const safeLevels = clamp(levels, 3, 9);
            r = posterize(r, safeLevels);
            g = posterize(g, safeLevels);
            b = posterize(b, safeLevels);
          }

          r = (r - 128) * contrast + 128;
          g = (g - 128) * contrast + 128;
          b = (b - 128) * contrast + 128;

          const avg = (r + g + b) / 3;
          r = avg + (r - avg) * saturation;
          g = avg + (g - avg) * saturation;
          b = avg + (b - avg) * saturation;

          out[i] = clamp(r, 0, 255);
          out[i + 1] = clamp(g, 0, 255);
          out[i + 2] = clamp(b, 0, 255);
          out[i + 3] = a;
        }
      }

      imageData.data.set(out);
      ctx.putImageData(imageData, 0, 0);

      ctx.save();
      ctx.globalAlpha = 0.10 * intensity;
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'blur(8px)';
      ctx.drawImage(fxSrc, 0, 0, w, h);
      ctx.restore();
    }

    function downloadFX() {
      if (!fxState.loaded) return;
      const link = document.createElement('a');
      link.download = `infodose-fx-${fxState.mode}.png`;
      link.href = fxCanvas().toDataURL('image/png');
      link.click();
    }

    function applyFXToBackground() {
      if (!fxState.loaded) return;
      const url = fxCanvas().toDataURL('image/png');
      applyBg(url, `fx-${fxState.mode}`, true);
    }

    function bindFXControls() {
      Object.values(fxControls).forEach(input => {
        input.addEventListener('input', () => {
          updateFXLabels();
          renderFX();
        });
      });

      const upload = el('fx-upload');
      upload.addEventListener('change', e => loadFxImageFromFile(e.target.files[0]));
    }

    window.loadCurrentFrameToFX = function() {
      const img = catalogo78Frames[currentIndex];
      loadFxImageFromUrl(img.imagemSrc, img.tituloNormal.trim() + img.tituloDestaque);
    };

    window.downloadFX = downloadFX;
    window.applyFXToBackground = applyFXToBackground;
    window.renderFX = renderFX;

    window.addEventListener('DOMContentLoaded', () => {
      saveCurrentFrameToLibrary();
      renderFrame(0);
      applyPreset('vivid');

      const initialBg = catalogo78Frames[0].imagemSrc;
      applyBg(initialBg, catalogo78Frames[0].tituloNormal.trim() + catalogo78Frames[0].tituloDestaque, true);

      updateFXLabels();
      bindFXControls();
      renderFX();
      syncFromStorage();

      window.di_renderBgThumbs = renderLibrary;
      window.di_syncBgFromStorage = syncFromStorage;
      window.di_renderBgPanel = renderLibrary;

      loadCurrentFrameToFX();

      bindEvents();
      startPollingFallback();
    });
  
