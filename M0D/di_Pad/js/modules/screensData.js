 // ═══════════════════════════════════════════════════════════════════
    //  CONFIGURAÇÃO DAS 9 TELAS (3×3) — edite aqui o conteúdo de cada
    // ═══════════════════════════════════════════════════════════════════
    const screensData = [
      [ // ── LINHA 0 ──────────────────────────────────────────────────

        { // (0,0) Apresentação / Marca
          bg: 'screen-white',
          content: `
            <div class="flex flex-col items-center justify-center text-center p-8 md:p-16 min-h-screen">
              <div class="max-w-content w-full">
                <span class="font-tech text-xs uppercase tracking-[0.4em] text-brand-gold">Frequência Decorativa · 528Hz</span>
                <h1 class="font-serif hero-title mt-5 text-[#05070a]">Design que<br><em>respira.</em></h1>
                <p class="text-gray-500 text-lg md:text-xl mt-7 max-w-xl mx-auto leading-relaxed">
                  Transformamos espaços em refúgios sensoriais — cortinas fluidas, mobiliário orgânico, curadoria intencional.
                </p>
                <div class="mt-10 flex flex-wrap gap-4 justify-center">
                  <button onclick="navigateTo(1,1)" class="btn-lux" style="background:#05070a;color:#fff;">Explorar</button>
                  <button onclick="navigateTo(2,1)" class="btn-line" style="border-color:#999;color:#333;">Ver Projetos</button>
                </div>
                <p class="font-tech text-xs text-gray-300 mt-10 tracking-widest">SWIPE OU USE AS SETAS DO TECLADO</p>
              </div>
            </div>
          `
        },

        { // (0,1) Filosofia
          bg: 'screen-dark',
          content: `
            <div class="flex flex-col items-center justify-center text-center p-8 md:p-16 min-h-screen">
              <div class="max-w-content w-full">
                <h2 class="sub-title font-serif italic mb-8">
                  Onde o <strong class="not-italic font-black">invisível</strong><br>
                  se torna <span class="text-brand-gold">emoção.</span>
                </h2>
                <p class="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
                  Não trabalhamos apenas com decoração. Trabalhamos com ritmo, proporção e sensação. O ambiente certo não grita — ele acolhe, organiza e faz o espaço conversar com quem vive nele.
                </p>
                <div class="mt-10 w-full max-w-3xl mx-auto">
                  <div class="video-wrap">
                    <video src="https://kodux78k.github.io/oiDual-Vivivi-1/media/destaque/apt.mp4"
                      class="w-full h-full object-cover" autoplay muted loop playsinline></video>
                  </div>
                </div>
              </div>
            </div>
          `
        },

        { // (0,2) Metodologia
          bg: 'screen-white',
          content: `
            <div class="flex flex-col items-center justify-center p-8 md:p-16 min-h-screen">
              <div class="max-w-content w-full grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <span class="font-tech text-xs uppercase tracking-widest text-brand-gold">Leitura de ambiente</span>
                  <h2 class="font-serif sub-title mt-3 text-[#05070a]">Clareza que<br>dá forma<br>ao cotidiano</h2>
                  <p class="text-gray-500 mt-6 leading-relaxed text-lg">
                    A proposta nasce da observação do espaço, das rotinas e do que o ambiente precisa transmitir. O resultado é uma composição leve, refinada e funcional.
                  </p>
                </div>
                <div class="video-wrap">
                  <video src="https://kodux78k.github.io/oiDual-Vivivi-1/media/portifolio/piso1.mp4"
                    class="w-full h-full object-cover" autoplay muted loop playsinline></video>
                </div>
              </div>
            </div>
          `
        }
      ],

      [ // ── LINHA 1 ──────────────────────────────────────────────────

        { // (1,0) Curadoria
          bg: 'screen-white',
          content: `
            <div class="flex flex-col items-center justify-start pt-24 p-6 md:p-12">
              <div class="max-w-content w-full">
                <h2 class="hero-title font-serif font-black text-[#05070a] mb-12">
                  Curadoria<br><em class="text-brand-gold">Exclusiva.</em>
                </h2>
                <div class="media-grid media-grid-3">
                  <div class="group">
                    <div class="cursor-pointer">
                      <div class="aspect-[4/5] rounded-2xl overflow-hidden">
                        <video src="https://kodux78k.github.io/oiDual-Vivivi-1/media/portifolio/piso0.mp4"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          autoplay muted loop playsinline></video>
                      </div>
                      <h3 class="font-serif text-xl mt-3 text-[#05070a]">Fluidez Intencional</h3>
                      <p class="font-tech text-xs text-gray-400 mt-1">Toque para ativar/desativar som</p>
                    </div>
                  </div>

                  <div class="group">
                    <div class="cursor-pointer">
                      <div class="aspect-[4/5] rounded-2xl overflow-hidden">
                        <img src="https://kodux78k.github.io/oiDual-Vivivi-1/media/conceito/img1.jpg"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                      </div>
                      <h3 class="font-serif text-xl mt-3 text-[#05070a]">Essência Viva</h3>
                      <p class="font-tech text-xs text-gray-400 mt-1">Imagem de referência</p>
                    </div>
                  </div>

                  <div class="group">
                    <div class="cursor-pointer">
                      <div class="aspect-[4/5] rounded-2xl overflow-hidden">
                        <img src="https://kodux78k.github.io/oiDual-Vivivi-1/media/conceito/img3.jpg"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                      </div>
                      <h3 class="font-serif text-xl mt-3 text-[#05070a]">Curadoria Orgânica</h3>
                      <p class="font-tech text-xs text-gray-400 mt-1">Imagem de referência</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `
        },

        { // (1,1) HOME CENTRAL
          bg: 'screen-dark',
          content: `
            <div class="relative overflow-hidden flex flex-col items-center justify-center text-center min-h-screen"
              style="background: url('https://kodux78k.github.io/oiDual-Vivivi-1/media/portifolio/img5.jpg') center/cover no-repeat;">
              <div class="absolute inset-0 bg-black/50"></div>
              <img src="https://kodux78k.github.io/oiDual-Vivivi-1/media/hero/mandala.png"
                class="mandala right-[-8vw] bottom-0">
              <div class="relative z-10 text-white px-6 py-20">
                <p class="font-tech text-xs uppercase tracking-[0.6em] text-brand-gold mb-4">Feeling Decor</p>
                <h1 class="hero-title font-serif font-black">Design<br><em class="font-normal">Sensorial.</em></h1>
                <p class="font-tech text-xs mt-6 uppercase tracking-[0.4em] text-white/50">Frequência · Harmonia · Fluidez</p>
                <div class="mt-12 flex gap-4 justify-center flex-wrap">
                  <button onclick="navigateTo(1,0)" class="btn-lux">Curadoria</button>
                  <button onclick="navigateTo(2,1)" class="btn-line">Projetos</button>
                </div>
              </div>
            </div>
          `
        },

        { // (1,2) Catálogo Vivo (GitHub JSON)
          bg: 'screen-dark',
          content: `
            <div class="flex flex-col items-center justify-start pt-24 p-6 md:p-12 min-h-screen" style="background:#0a0a0a;">
              <div class="max-w-content w-full">
                <div class="text-center mb-8">
                  <h2 class="sub-title font-serif italic">Catálogo <strong class="text-brand-gold">Vivo</strong></h2>
                  <p class="text-white/40 text-xs font-tech mt-2 tracking-widest">Sincronizado via GitHub · 672Hz</p>
                </div>
                <div class="flex justify-end mb-5">
                  <button id="btnCarregarFeed" class="btn-lux text-xs px-5 py-2" style="background:var(--brand-gold);color:#000;">
                    ⟳ Carregar Catálogo
                  </button>
                </div>
                <div id="feedContainer" class="grid grid-cols-1 md:grid-cols-2 gap-5"></div>
                <p id="mensagemFeed" class="text-center text-white/30 mt-8 font-tech text-sm hidden">Nenhuma mídia encontrada.</p>
              </div>
            </div>
          `
        }
      ],

      [ // ── LINHA 2 ──────────────────────────────────────────────────

        { // (2,0) Bastidores
          bg: 'screen-black',
          content: `
            <div class="flex flex-col items-center justify-start pt-24 p-6 md:p-12 min-h-screen bg-black text-white">
              <div class="max-w-content w-full">
                <h2 class="sub-title font-serif italic mb-10">
                  Bastidores da <strong class="not-italic text-brand-gold">Perfeição.</strong>
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="video-wrap">
                    <video src="https://kodux78k.github.io/oiDual-Vivivi-1/media/portifolio/piso0.mp4"
                      class="w-full h-full object-cover" autoplay muted loop playsinline></video>
                  </div>
                  <div class="video-wrap">
                    <iframe class="w-full h-full"
                      src="https://www.youtube.com/embed/koKhjQKGJSc"
                      frameborder="0" allowfullscreen loading="lazy"></iframe>
                  </div>
                </div>
              </div>
            </div>
          `
        },

        { // (2,1) Projetos / Galeria
          bg: 'screen-white',
          content: `
            <div class="flex flex-col items-center justify-start pt-24 p-6 md:p-12 min-h-screen bg-white">
              <div class="max-w-content w-full">
                <h2 class="hero-title font-serif font-black text-[#05070a] mb-4">
                  Imagens que<br><em>respiram<br>presença</em>
                </h2>
               <div class="media-grid media-grid-2 mt-8">
  <div class="rounded-3xl overflow-hidden shadow-lg">
    <img 
      src="https://kodux78k.github.io/oiDual-Vivivi-1/media/conceito/img2.jpg"
      class="w-full h-full object-cover scale-125"
      loading="lazy"
    >
  </div>
</div>
                  <div class="rounded-3xl overflow-hidden shadow-lg">
                    <img src="https://kodux78k.github.io/oiDual-Vivivi-1/media/conceito/img1.jpg"
                      class="w-full h-auto object-cover" loading="lazy">
                  </div>
                </div>
                <p class="text-gray-400 text-center mt-10 max-w-2xl mx-auto text-lg leading-relaxed">
                  O objetivo não é impressionar pelo excesso. É criar uma experiência silenciosa, onde tudo parece estar no lugar certo.
                </p>
              </div>
            </div>
          `
        },

        { // (2,2) Contato
          bg: 'screen-dark',
          content: `
            <div class="flex flex-col items-center justify-center text-center p-8 md:p-16 min-h-screen" style="background:#0b0c10;">
              <div class="max-w-content w-full">
                <p class="font-tech text-xs uppercase tracking-[0.5em] text-brand-gold mb-4">São Paulo · SP · Brasil</p>
                <h2 class="hero-title font-serif font-black italic mb-8">Fale<br>conosco.</h2>
                <div class="flex flex-wrap gap-6 justify-center">
                  <a href="#" class="btn-lux">WhatsApp Oficial</a>
                  <button type="button" class="btn-line" onclick="navigateTo(1,2)">Projetos</button>
                </div>
                <div class="mt-12 video-wrap max-w-md mx-auto">
                  <video src="https://kodux78k.github.io/oiDual-Vivivi-1/media/portifolio/piso1.mp4"
                    class="w-full h-full object-cover" autoplay muted loop playsinline></video>
                </div>
              </div>
            </div>
          `
        }
      ]
    ];
