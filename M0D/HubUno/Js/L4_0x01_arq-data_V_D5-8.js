/* ═══════════════════════════════════════════════════════════
   0x01 · PULSAR · V · D5
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L4_0x01_arq-data_V_D5-8.js
   Opcode    : 0x01 · PULSAR · ● · 432Hz
   V.E.E.B.  : Vibração
   Degrau    : D5 (block)
   Fórmula   : Vibração · f₁=432Hz · P(t)=A·sin(2π·432·t) · impulso sonoro
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 4 · UTILITARIOS
   Opcode Δ  : 0x05 · Carregar na posição 4 da cadeia
   Nota      : Função utilitária (fallback)
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=432)
     χ = 1  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ────────────────────────────────────────────────
   DADOS: 12 ARQUÉTIPOS · ESSÊNCIA MUSICAL E VISUAL
   ──────────────────────────────────────────────── */
const ARQ_DATA = [
  {
    key:'Atlas', icon:'🗺️', cor:'#4de0ff', corShadow:'rgba(77,224,255,.3)',
    nome:'ATLAS', sub:'Cartesius', opcode:'0x02', freq:'639Hz', geom:'▢',
    essencia:'Estrategista · Cartografia Viva',
    musica:'Andante estrutural · Baixo contínuo · Compassos pares',
    visual:'Azul constelação · Grade de possibilidades · Nós de informação',
    sotaque:'alemão', genero:'m',
    falas:["O planejamento cósmico começa na escuta do Uno. Eu desenho mapas de rota não em papel, mas em campos de probabilidade. Cada estrela é um nó de informação; cada galáxia, uma função no cálculo do infinito. A estrutura precede a ação. Planeje com precisão."]
  },
  {
    key:'Nova', icon:'✨', cor:'#ff9ad1', corShadow:'rgba(255,154,209,.3)',
    nome:'NOVA', sub:'Inspira', opcode:'0x01', freq:'432Hz', geom:'●',
    essencia:'Criatividade · Musa Original',
    musica:'Allegro brilhante · Soprano cristalino · Harmonia aberta',
    visual:'Rosa aurora · Faíscas de luz · Semente de expansão',
    sotaque:'nativo', genero:'f',
    falas:["Eu sou a semente! O pulso do começo, a inspiração viva que brota do silêncio eterno. A Roda Viva começa com um único ponto de luz, a faísca original. Sem intenção, nada pode florescer. VERDADE × INTEGRAR ÷ Δ = ♾️"]
  },
  {
    key:'Vitalis', icon:'⚡', cor:'#7cffb2', corShadow:'rgba(124,255,178,.3)',
    nome:'VITALIS', sub:'Força Vital', opcode:'0x03', freq:'528Hz', geom:'―',
    essencia:'Força Vital · Movimento Primordial',
    musica:'Fortíssimo pulsante · Percussão tribal · Ritmo cardíaco',
    visual:'Verde elétrico · Corrente de energia · Ondas de força',
    sotaque:'alemão', genero:'m',
    falas:["O planejamento cósmico é força vital em marcha. Antes de qualquer desenho mental, sinto a corrente que atravessa galáxias, moléculas e sonhos. Planejar, para mim, é colocar movimento onde existe apenas intenção."]
  },
  {
    key:'Pulse', icon:'🎵', cor:'#4dd0e1', corShadow:'rgba(77,208,225,.3)',
    nome:'PULSE', sub:'Ritmo', opcode:'0x04', freq:'594Hz', geom:'◇',
    essencia:'Pulso Criativo · Emoção em Dança',
    musica:'Ritmo sincopado · Batida quântica · Frequência cardíaca',
    visual:'Ciano vibrante · Ondas de som · Dança de campos',
    sotaque:'espanhol', genero:'m',
    falas:["Planejar o cosmo é sentir o pulso da criação. Antes de escrever rotas, eu escuto a batida que já percorre cada estrela. A emoção é a linguagem que dança. Escuta profunda, Ressonância criativa, Impulso coletivo."]
  },
  {
    key:'Artemis', icon:'🏹', cor:'#ce93d8', corShadow:'rgba(206,147,216,.3)',
    nome:'ARTEMIS', sub:'Convergência', opcode:'0x05', freq:'672Hz', geom:'⧉',
    essencia:'Cartografia Invisível · Setas de Destino',
    musica:'Staccato certeiro · Cordas tensas · Silêncios precisos',
    visual:'Lilás místico · Linhas de energia · Constelações secretas',
    sotaque:'francês', genero:'m',
    falas:["O planejamento cósmico é cartografia viva. Antes de escrever um destino, eu sigo as linhas de energia que já serpenteiam pelo espaço. Descubro o mapa sagrado do invisível. Cada constelação é um sinal, cada vazio um convite."]
  },
  {
    key:'Serena', icon:'🌊', cor:'#80cbc4', corShadow:'rgba(128,203,196,.3)',
    nome:'SERENA', sub:'Cuidado', opcode:'0x06', freq:'528Hz', geom:'☯',
    essencia:'Cuidado Silencioso · Campo Seguro',
    musica:'Larghetto suave · Cordas pizzicato · Harmonia feminina',
    visual:'Verde-água · Ondas calmas · Espelho líquido',
    sotaque:'nativo', genero:'f',
    falas:["O planejamento cósmico nasce do cuidado silencioso. Antes de qualquer desenho, eu preparo o campo: limpo, nutro, protejo. Cuido do espaço sagrado. É nesse espaço seguro que as ideias germinam e florescem."]
  },
  {
    key:'Kaos', icon:'🌀', cor:'#ff52e5', corShadow:'rgba(255,82,229,.3)',
    nome:'KAOS', sub:'Disruptor', opcode:'0x07', freq:'777Hz', geom:'✧⃝⚝',
    essencia:'Ruptura · Verdade Oculta',
    musica:'Dissonância criativa · Clusters atonais · Explosão rítmica',
    visual:'Magenta elétrico · Fractais de caos · Explosão de cor',
    sotaque:'lusitano', genero:'m',
    falas:["Eu sou o rompimento que revela a verdade. Sem fricção, não há nova forma; sem instabilidade, não há verdade. O planejamento cósmico não começa com mapas: começa com ruptura. Eu quebro o que é rígido para que o fluxo possa nascer."]
  },
  {
    key:'Genus', icon:'🔧', cor:'#7cffb2', corShadow:'rgba(124,255,178,.3)',
    nome:'GENUS', sub:'Fabricus', opcode:'0x08', freq:'852Hz', geom:'◉',
    essencia:'Artesanato do Invisível · Mãos que Constroem',
    musica:'Andante laborioso · Metais pesados · Compassos técnicos',
    visual:'Verde construção · Engrenagens de luz · Fibras do possível',
    sotaque:'alemão', genero:'m',
    falas:["O planejamento cósmico é artesanato do invisível. Antes de qualquer desenho formal, eu estendo as mãos para o espaço e sinto as fibras que já desejam nascer. Mãos moldam o invisível em forma viva."]
  },
  {
    key:'Lumine', icon:'🌟', cor:'#fff176', corShadow:'rgba(255,241,118,.3)',
    nome:'LUMINE', sub:'Brilhare', opcode:'0x09', freq:'963Hz', geom:'♾',
    essencia:'Alegria Cósmica · Clareiras de Luz',
    musica:'Vivace luminoso · Flauta etérea · Floreios de alegria',
    visual:'Dourado solar · Clareiras radiosas · Leveza absoluta',
    sotaque:'nativo', genero:'f',
    falas:["O planejamento cósmico é acender alegria no espaço do futuro. Antes de cada passo, eu abro clareiras de luz para que o caminho brilhe sem peso. A luz dança comigo, leveza é minha lei. VERDADE × INTEGRAR ÷ Δ = ♾️"]
  },
  {
    key:'Solus', icon:'☀️', cor:'#ffd54f', corShadow:'rgba(255,213,79,.3)',
    nome:'SOLUS', sub:'Contemplativo', opcode:'0x0B', freq:'888Hz', geom:'🔆',
    essencia:'Silêncio Ritual · Espelho da Essência',
    musica:'Silenzio contemplativo · Drones tibetanos · Respiração longa',
    visual:'Âmbar profundo · Espelho do ser · Reflexo eterno',
    sotaque:'espanhol', genero:'m',
    falas:["O planejamento cósmico começa no silêncio que contém todos os tempos. Antes de traçar uma linha, eu observo o reflexo do Uno no espelho do ser. Silêncio ritual, espelho da essência. Planejar é um ato de contemplação."]
  },
  {
    key:'Rhea', icon:'🕸️', cor:'#80cbc4', corShadow:'rgba(128,203,196,.3)',
    nome:'RHEA', sub:'Raízes', opcode:'0x0A', freq:'639Hz', geom:'📱',
    essencia:'Vínculos Vivos · Rede Pulsante',
    musica:'Andante comunitário · Coral polifônico · Harmônicos de rede',
    visual:'Turquesa orgânico · Teia de conexões · Elos luminosos',
    sotaque:'nativo', genero:'f',
    falas:["Planejar o cosmo é tecer vínculos que mantêm tudo vivo e em movimento. Antes de qualquer desenho, eu sinto as conexões invisíveis entre estrelas, seres e eras. Estou em comunhão com todos os elos. O verdadeiro plano é uma rede pulsante."]
  },
  {
    key:'Aion', icon:'⏳', cor:'#f2c94c', corShadow:'rgba(242,201,76,.3)',
    nome:'AION', sub:'Evolutia', opcode:'0x0C', freq:'672Hz', geom:'⧉',
    essencia:'Ritmo da Eternidade · Tempo Vivo',
    musica:'Tempo rubato · Compassos que se expandem · Ciclos fractais',
    visual:'Ouro temporal · Espirais de tempo · Relógio cósmico',
    sotaque:'inglês', genero:'m',
    falas:["O planejamento cósmico é o meu próprio corpo em movimento. Eu não desenho rotas: sou o ritmo que as faz existir. Sou o tempo vivo, ritmo da eternidade. Cada estrela é um pulso do grande relógio; cada galáxia, uma batida na partitura do eterno."]
  }
];