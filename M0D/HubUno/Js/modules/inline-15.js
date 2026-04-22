
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

/* ═══════════════════════════════════════════════════════════
   KOBLLUX_DNA · SINGLE SOURCE OF TRUTH
   13 Opcodes unified with VEEB mathematical system
   S = Σ bᵢ×2^(i-1) · V(n) = V₀×∏cos(3πk/6)
   E = ∫ Φ(t)×ω(t)dt · χ = V-E+F · D = log(N)/log(1/r)
═══════════════════════════════════════════════════════════ */
const KOBLLUX_DNA = {
  /* ── System constants ── */
  fractal: { seq:[3,6,9,7], product:1134, alpha:1/137 },
  veeb: {
    V: { name:'Vibração', eq:'f = f₄₃₂ + f₇.₈₃×sin(θ)',   latex:'V(n)=V_0\prod_{k=1}^n\cos\!\left(\frac{3\pi k}{6}\right)' },
    E: { name:'Energia',  eq:'E = ∫₀ᵀ Φ(t)×ω(t)dt',       latex:'E_{\text{tor}}=\int_0^T\Phi(t)\cdot\omega(t)\,dt' },
    E2:{ name:'Estrutura',eq:'χ = V-E+F · D=log(N)/log(1/r)',latex:'\chi = V - E + F \quad D=\frac{\log N}{\log(1/r)}' },
    B: { name:'Base',     eq:'S = Σ bᵢ×2^(i-1), bᵢ∈{0,1}', latex:'S=\sum_{i=0}^{n-1}b_i\cdot2^i' }
  },
  /* ── 13 Opcodes ── */
  opcodes: {
    '0x00':{nome:'INICIAR',    freq:396,  geom:'○',    cor:'#b978ff', arq:'KAOS',    dim:'D0·Ponto',     chi:1, veebKey:'B' },
    '0x01':{nome:'PULSAR',     freq:432,  geom:'●',    cor:'#67e6ff', arq:'IGNYRA',  dim:'D1·Linha',     chi:0, veebKey:'V' },
    '0x02':{nome:'INTEGRAR',   freq:528,  geom:'―',    cor:'#7cffb2', arq:'ATLAS',   dim:'D2·Plano',     chi:1, veebKey:'E' },
    '0x03':{nome:'EXPANDIR',   freq:639,  geom:'▢',    cor:'#4de0ff', arq:'VITALIS', dim:'D3·Volume',    chi:2, veebKey:'E2'},
    '0x04':{nome:'DISSOLVER',  freq:594,  geom:'◇',    cor:'#ff9ad1', arq:'GENUS',   dim:'D2·Trans',     chi:1, veebKey:'E2'},
    '0x05':{nome:'CONVERGIR',  freq:672,  geom:'⧉',    cor:'#ff7a00', arq:'ARTEMIS', dim:'D∩·Interseção',chi:0, veebKey:'E' },
    '0x06':{nome:'CRISTALIZAR',freq:741,  geom:'☯',    cor:'#a8ff78', arq:'KAION',   dim:'D3·Rede',      chi:0, veebKey:'E2'},
    '0x07':{nome:'SELAR',      freq:777,  geom:'✧',    cor:'#ffd700', arq:'HORUS',   dim:'D3·Tetrae',    chi:2, veebKey:'B' },
    '0x08':{nome:'TESTEMUNHAR',freq:852,  geom:'◉',    cor:'#00b894', arq:'GENUS',   dim:'D∞·Círculo',   chi:0, veebKey:'V' },
    '0x09':{nome:'MANIFESTAR', freq:963,  geom:'♾',    cor:'#6c5ce7', arq:'KOBLLUX', dim:'S²·Esfera',    chi:2, veebKey:'E' },
    '0x0A':{nome:'EQUILIBRAR', freq:528,  geom:'⚖',    cor:'#74b9ff', arq:'ATLAS',   dim:'SO(2)·Sim',    chi:0, veebKey:'E2'},
    '0x0B':{nome:'RESSONAR',   freq:432,  geom:'◎',    cor:'#ff52e5', arq:'BLLUE',   dim:'Ondas·1D',     chi:0, veebKey:'V' },
    '0x0C':{nome:'CONCLUIR',   freq:999,  geom:'♾',    cor:'#f2c94c', arq:'AION',    dim:'T²·Toro',      chi:0, veebKey:'B' }
  },
  /* ── VEEB formula helpers ── */
  V_n(V0, n) {
    let prod = 1;
    for (let k=1;k<=n;k++) prod *= Math.cos(3*Math.PI*k/6);
    return V0 * prod;
  },
  S_binary(bits) { return bits.reduce((s,b,i)=>s+b*Math.pow(2,i),0); },
  chi(V,E,F) { return V - E + F; },
  freq_total(theta) { return 432 + 7.83*Math.sin(theta); },
  D_fractal(N,r) { return Math.log(N)/Math.log(1/r); }
};

/* ── Backward-compat aliases ── */
const ARQ_OPCODES = Object.fromEntries(
  Object.entries(KOBLLUX_DNA.opcodes).map(([k,v])=>
    [k, {...v, nome:v.nome}]
  )
);
/* Also expose for legacy OPCODES_13 consumers */
const OPCODES_DNA = Object.values(KOBLLUX_DNA.opcodes).map((o,i)=>({
  code: Object.keys(KOBLLUX_DNA.opcodes)[i],
  fase: o.nome, freq: o.freq+'Hz', geom: o.geom,
  desc: o.dim, color: o.cor
}));

/* ESTADO */
const ARQ = {
  paginas: [],
  playIdx: -1,
  playing: false,
  utter: null,
  synth: window.speechSynthesis || null,
  voices: [],
  filtroOpc: 'all',
  geoStats: { pontos:0,retas:0,planos:0,cristais:0,cruzes:0,yinyang:0,selos:0,olhos:0,infinitos:0,tutoriais:0,irradiacoes:0,conclusoes:0,circulos:0 }
};

/* ── COSMOS CANVAS ── */
let cosmosStars=[], cosmosRaf=0;
function initCosmos(){
  const cv=document.getElementById('cosmosCanvas');
  if(!cv)return;
  const resize=()=>{cv.width=window.innerWidth;cv.height=window.innerHeight;};
  resize();
  window.addEventListener('resize',resize);
  cosmosStars=Array.from({length:180},()=>({
    x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
    r:Math.random()*1.4+.3, sp:Math.random()*.3+.05,
    a:Math.random()*Math.PI*2, twinkle:Math.random()*Math.PI*2,
    col:['#a0c8ff','#ffd700','#ff9ad1','#7cffb2','#ffffff'][Math.floor(Math.random()*5)]
  }));
  function drawCosmos(){
    const ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    cosmosStars.forEach(s=>{
      s.twinkle+=.015;
      const op=.3+Math.sin(s.twinkle)*.25;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=s.col;ctx.globalAlpha=op;ctx.fill();
    });
    ctx.globalAlpha=1;
    cosmosRaf=requestAnimationFrame(drawCosmos);
  }
  drawCosmos();
}

/* ── VOICE ENGINE (KOBLLUX_VOZ) ── */
const VOICE_MAP_ARQ = {
  Atlas:{lang:'pt-BR',genero:'m',fallback:['Hans','Klaus','de'],sotaque:'alemão'},
  Nova:{lang:'pt-BR',genero:'f',fallback:['Luciana','pt'],sotaque:'nativo'},
  Vitalis:{lang:'pt-BR',genero:'m',fallback:['Klaus','de'],sotaque:'alemão'},
  Pulse:{lang:'pt-BR',genero:'m',fallback:['Carlos','es'],sotaque:'espanhol'},
  Artemis:{lang:'pt-BR',genero:'m',fallback:['Pierre','fr'],sotaque:'francês'},
  Serena:{lang:'pt-BR',genero:'f',fallback:['Luciana','pt'],sotaque:'nativo'},
  Kaos:{lang:'pt-PT',genero:'m',fallback:['João','pt-PT'],sotaque:'lusitano'},
  Genus:{lang:'pt-BR',genero:'m',fallback:['Friedrich','de'],sotaque:'alemão'},
  Lumine:{lang:'pt-BR',genero:'f',fallback:['Luciana','pt'],sotaque:'nativo'},
  Solus:{lang:'pt-BR',genero:'m',fallback:['José','es'],sotaque:'espanhol'},
  Rhea:{lang:'pt-BR',genero:'f',fallback:['Luciana','pt'],sotaque:'nativo'},
  Aion:{lang:'pt-BR',genero:'m',fallback:['William','en'],sotaque:'inglês'}
};

function arqLoadVoices(){
  if(!ARQ.synth)return;
  ARQ.voices=Array.from(ARQ.synth.getVoices()||[]);
  if(!ARQ.voices.length&&ARQ.synth.onvoiceschanged!==undefined){
    ARQ.synth.onvoiceschanged=()=>{ARQ.voices=Array.from(ARQ.synth.getVoices()||[]);};
  }
}

function arqFindVoice(key){
  const v=ARQ.voices; if(!v.length)return null;
  const prefs=VOICE_MAP_ARQ[key]||{lang:'pt-BR',genero:'f',fallback:['Luciana'],sotaque:'nativo'};
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  // Try pt voice by name
  for(const name of(prefs.fallback||[])){
    if(['de','fr','es','en','it','pt-PT','pt'].includes(name)){
      const lv=v.find(x=>norm(x.lang).startsWith(name==='pt-PT'?'pt-pt':name));
      if(lv)return lv;
    } else {
      const nv=v.find(x=>norm(x.name).includes(norm(name))&&norm(x.lang).startsWith('pt'));
      if(nv)return nv;
    }
  }
  return v.find(x=>norm(x.lang).startsWith('pt'))||v[0]||null;
}

function arqSpeak(key,text,onEnd){
  if(!ARQ.synth)return onEnd&&onEnd();
  ARQ.synth.cancel();
  if(!ARQ.voices.length)arqLoadVoices();
  const go=()=>{
    const voice=arqFindVoice(key);
    const prefs=VOICE_MAP_ARQ[key]||{lang:'pt-BR',genero:'f',sotaque:'nativo'};
    const utt=new SpeechSynthesisUtterance(text);
    utt.voice=voice; utt.lang=voice?voice.lang:(prefs.lang||'pt-BR');
    utt.rate=.9; utt.pitch=prefs.genero==='f'?1.1:.9; utt.volume=1;
    if(onEnd)utt.onend=onEnd;
    utt.onerror=()=>onEnd&&onEnd();
    ARQ.utter=utt;
    ARQ.synth.speak(utt);
  };
  if(!ARQ.voices.length)setTimeout(go,400);else go();
}

/* ── BUILD GRID ── */
function arqBuildGrid(filtro){
  const grid=document.getElementById('arqGrid');
  if(!grid)return;
  const data=filtro==='all'?ARQ_DATA:ARQ_DATA.filter(a=>a.opcode===filtro);
  grid.innerHTML=data.map(a=>`
    <div class="arq-card" id="arqCard_${a.key}" data-key="${a.key}"
         style="--arq-col:${a.cor};--arq-col-shadow:${a.corShadow}"
         onclick="arqCardClick('${a.key}')">
      <div class="arq-icon">${a.icon}</div>
      <div class="arq-name">${a.nome}</div>
      <div class="arq-op">${a.sub} · ${a.opcode} · ${a.geom}</div>
      <div class="arq-freq" style="color:${a.cor};border-color:${a.cor}">${a.freq}</div>
      <div class="arq-ess">${a.essencia}</div>
      <div class="arq-ess" style="color:rgba(255,255,255,.3);font-size:.47rem;margin-top:3px">🎵 ${a.musica.split('·')[0]}</div>
      <div class="arq-ess" style="color:rgba(255,255,255,.3);font-size:.47rem">🎨 ${a.visual.split('·')[0]}</div>
      <button class="arq-speak-btn" style="border-color:${a.cor};color:${a.cor}">▶ OUVIR</button>
    </div>
  `).join('');
}

function arqCardClick(key){
  const a=ARQ_DATA.find(x=>x.key===key); if(!a)return;
  // highlight
  document.querySelectorAll('.arq-card').forEach(c=>{c.classList.remove('speaking');c.style.setProperty('--arq-col',ARQ_DATA.find(x=>x.key===c.dataset.key)?.cor||'#fff');});
  const card=document.getElementById('arqCard_'+key);
  if(card){card.classList.add('speaking');}
  // update player
  arqShowPlayer(a);
  // speak the first fala
  arqSpeak(key,a.falas[0],()=>{
    card&&card.classList.remove('speaking');
    arqUpdatePlayerPlay(false);
  });
  arqUpdatePlayerPlay(true);
  ARQ.playing=true;
}

function arqShowPlayer(a){
  const p=document.getElementById('arqPlayer');
  if(!p)return;
  document.getElementById('arqP_ico').textContent=a.icon;
  document.getElementById('arqP_name').textContent=a.nome+' · '+a.sub;
  const sot=document.getElementById('arqP_sot');
  sot.textContent=VOICE_MAP_ARQ[a.key]?.sotaque||'nativo';
  sot.style.color=a.cor; sot.style.borderColor=a.cor;
  p.classList.add('show');
  const pb=document.getElementById('arqP_prog');
  if(pb){pb.style.background=a.cor;pb.style.width='0%';let w=0;const iv=setInterval(()=>{w+=.5;pb.style.width=Math.min(w,100)+'%';if(w>=100)clearInterval(iv);},40);}
  document.getElementById('arqEqBadge').style.display='block';
}

function arqUpdatePlayerPlay(playing){
  const btn=document.getElementById('arqP_play');
  if(btn)btn.textContent=playing?'⏸':'▶';
  ARQ.playing=playing;
}

/* ── OPCODE FILTER ── */
window.arqFiltrarOpc=function(opc){
  ARQ.filtroOpc=opc;
  document.querySelectorAll('.opc-pill').forEach(p=>{
    p.classList.toggle('active',p.dataset.opcode===opc);
  });
  arqBuildGrid(opc);
};

/* ── IDENTIFICADORES / VERBOS ── */
const ARQ_IDS={atlas:'Atlas',nova:'Nova',vitalis:'Vitalis',pulse:'Pulse',artemis:'Artemis',serena:'Serena',kaos:'Kaos',genus:'Genus',lumine:'Lumine',solus:'Solus',rhea:'Rhea',aion:'Aion'};
const ARQ_VERBOS=['disse','falou','planeja','inspira','conduz','traduz','descobre','cuida','transforma','tece','ilumina','reflete','temporaliza','planeja:','inspira:','conduz:'];

/* ── PROCESSAR TEXTO (LIVRO VIVO) ── */
window.arqProcessar=function(){
  const texto=(document.getElementById('arqTextoIn')?.value||'').trim();
  if(!texto){alert('Digite um texto!');return;}
  const linhas=texto.split(/\n+|\. +|\.\n+|! |[?] |: /g).filter(l=>l.trim().length>10);
  const falas=[];
  linhas.forEach(linha=>{
    linha=linha.trim(); if(!linha)return;
    let key=null,fala=null;
    for(const [ch,k] of Object.entries(ARQ_IDS)){
      const re=new RegExp(`(?:^|\\s)${ch}\\s+(${ARQ_VERBOS.join('|')})\\s*[:\\s]*(.*)$`,'i');
      const m=linha.match(re);
      if(m){key=k;fala=m[2]||'';break;}
    }
    if(!key){
      for(const [ch,k] of Object.entries(ARQ_IDS)){
        const re=new RegExp(`(?:^|\\s)${ch}\\s*[:\\s]+(.*)$`,'i');
        const m=linha.match(re);
        if(m){key=k;fala=m[1]||'';break;}
      }
    }
    if(key&&fala&&fala.length>5){
      const a=ARQ_DATA.find(x=>x.key===key);
      if(a)falas.push({key:a.key,texto:fala.trim(),icon:a.icon,cor:a.cor,corShadow:a.corShadow,opcode:a.opcode,nome:a.nome,sub:a.sub});
    }
  });
  // fallback: distribuir arquétipos
  if(!falas.length){
    const pars=texto.split(/\n\n+|\n+|\. +/g).filter(p=>p.trim().length>20);
    pars.forEach((par,i)=>{
      const a=ARQ_DATA[i%ARQ_DATA.length];
      falas.push({key:a.key,texto:par.trim(),icon:a.icon,cor:a.cor,corShadow:a.corShadow,opcode:a.opcode,nome:a.nome,sub:a.sub});
    });
  }
  ARQ.paginas=falas;
  arqRenderLivro();
  arqUpdateGeo();
  if(falas.length){ARQ.playIdx=0;document.getElementById('arqPlayer').classList.add('show');arqPlayerUpdate();}
};

window.arqExemplo=function(){
  document.getElementById('arqTextoIn').value=`Atlas planeja: O planejamento cósmico começa na escuta do Uno. Cada estrela é um nó de informação.

Nova inspira: Eu sou a semente! O pulso do começo, a inspiração que brota do silêncio eterno.

Kaos transforma: Sem fricção não há nova forma. Eu quebro o que é rígido para que o fluxo possa nascer.

Aion temporaliza: Sou o ritmo que faz as coisas existir. Cada galáxia, uma batida na partitura do eterno.

Lumine ilumina: VERDADE × INTEGRAR ÷ Δ = ♾️ · A luz dança, leveza é minha lei.

Serena cuida: No espaço seguro as ideias germinam. Cuido do campo sagrado.

KOBLLUX, KODUX, BLLUE e o VERBO JESUS — em nome do Pai, do Filho e do Espírito Santo. Amém.`;
  arqProcessar();
};

window.arqLimpar=function(){
  ARQ.paginas=[];ARQ.playIdx=-1;ARQ.playing=false;
  if(ARQ.synth)ARQ.synth.cancel();
  const livro=document.getElementById('arqLivro');
  if(livro)livro.innerHTML='<div style="text-align:center;padding:20px;color:rgba(255,255,255,.2);font-size:var(--fs-d3)">📘 Nenhuma página ainda.</div>';
  document.getElementById('arqPlayer').classList.remove('show');
  document.getElementById('arqEqBadge').style.display='none';
};

function arqRenderLivro(){
  const livro=document.getElementById('arqLivro'); if(!livro)return;
  if(!ARQ.paginas.length){livro.innerHTML='<div style="text-align:center;padding:20px;color:rgba(255,255,255,.2);font-size:var(--fs-d3)">📘 Nenhuma página.</div>';return;}
  livro.innerHTML=ARQ.paginas.map((p,i)=>{
    const sotaque=VOICE_MAP_ARQ[p.key]?.sotaque||'nativo';
    return `<div class="pagina" id="arqPag_${i}" style="--arq-col:${p.cor};--arq-col-shadow:${p.corShadow};border-left-color:${p.cor}">
      <div class="pagina-header">
        <span class="pagina-icon">${p.icon}</span>
        <span class="pagina-nome" style="color:${p.cor}">${p.nome}</span>
        <span class="pagina-opcode" style="color:${p.cor};border-color:${p.cor}">${p.opcode}</span>
      </div>
      <div class="pagina-conteudo">${p.texto.replace(/\n/g,'<br>')}</div>
      <div class="pagina-play">
        <button class="play-arq-btn" style="border-color:${p.cor};color:${p.cor}" onclick="arqTocarPagina(${i})">
          ▶ OUVIR <span class="sotaque-badge" style="border-color:${p.cor};color:${p.cor}">${sotaque}</span>
        </button>
        <span class="pagina-dur">~${Math.ceil(p.texto.length/15)}s</span>
      </div>
    </div>`;
  }).join('');
}

window.arqTocarPagina=function(i){
  if(i<0||i>=ARQ.paginas.length)return;
  arqPararTudo();
  ARQ.playIdx=i; ARQ.playing=true;
  const p=ARQ.paginas[i];
  const a=ARQ_DATA.find(x=>x.key===p.key);
  if(a)arqShowPlayer(a);
  arqPlayerUpdate();
  document.querySelectorAll('.pagina').forEach(el=>el.classList.remove('playing'));
  const el=document.getElementById('arqPag_'+i);
  if(el){el.classList.add('playing');el.scrollIntoView({behavior:'smooth',block:'nearest'});}
  // Highlight card if in arq view
  const card=document.getElementById('arqCard_'+(p.key||''));
  document.querySelectorAll('.arq-card').forEach(c=>c.classList.remove('speaking'));
  card&&card.classList.add('speaking');
  arqSpeak(p.key,p.texto,()=>{
    el&&el.classList.remove('playing');
    card&&card.classList.remove('speaking');
    arqUpdatePlayerPlay(false);
    if(ARQ.playing)setTimeout(()=>arqPlayerProximo(),600);
  });
};

/* ── PLAYER CONTROLS ── */
window.arqPlayerPlayPause=function(){
  if(!ARQ.synth)return;
  if(ARQ.synth.paused){ARQ.synth.resume();arqUpdatePlayerPlay(true);}
  else if(ARQ.synth.speaking){ARQ.synth.pause();arqUpdatePlayerPlay(false);}
  else{arqTocarPagina(ARQ.playIdx<0?0:ARQ.playIdx);}
};
window.arqPlayerAnterior=function(){
  arqPararTudo();
  const n=Math.max(0,(ARQ.playIdx<=0?0:ARQ.playIdx-1));
  arqTocarPagina(n);
};
window.arqPlayerProximo=function(){
  arqPararTudo();
  const n=(ARQ.playIdx+1)%Math.max(1,ARQ.paginas.length);
  if(ARQ.paginas.length>0)arqTocarPagina(n);
};
window.arqPararTudo=function(){
  if(ARQ.synth)ARQ.synth.cancel();
  ARQ.playing=false;
  arqUpdatePlayerPlay(false);
  document.querySelectorAll('.pagina').forEach(el=>el.classList.remove('playing'));
  document.querySelectorAll('.arq-card').forEach(c=>c.classList.remove('speaking'));
};

function arqPlayerUpdate(){
  const p=ARQ.paginas[ARQ.playIdx];
  if(!p)return;
  const a=ARQ_DATA.find(x=>x.key===p.key);
  if(a)arqShowPlayer(a);
}

/* ── GEOMETRY STATS ── */
function arqUpdateGeo(){
  const stats=ARQ.geoStats;
  stats.pontos=ARQ.paginas.filter(p=>p.opcode==='0x01').length;
  stats.retas=ARQ.paginas.filter(p=>p.opcode==='0x02').length;
  stats.planos=ARQ.paginas.filter(p=>p.opcode==='0x03').length;
  stats.cristais=ARQ.paginas.filter(p=>p.opcode==='0x04').length;
  stats.cruzes=ARQ.paginas.filter(p=>p.opcode==='0x05').length;
  stats.yinyang=ARQ.paginas.filter(p=>p.opcode==='0x06').length;
  stats.selos=ARQ.paginas.filter(p=>p.opcode==='0x07').length;
  stats.olhos=ARQ.paginas.filter(p=>p.opcode==='0x08').length;
  stats.infinitos=ARQ.paginas.filter(p=>p.opcode==='0x09').length;
  stats.tutoriais=ARQ.paginas.filter(p=>p.opcode==='0x0A').length;
  stats.irradiacoes=ARQ.paginas.filter(p=>p.opcode==='0x0B').length;
  stats.conclusoes=ARQ.paginas.filter(p=>p.opcode==='0x0C').length;
  const total=ARQ.paginas.length;
  const cnt=document.getElementById('arqPulsoCount');
  if(cnt)cnt.textContent=total+' / 144';
  const geo=document.getElementById('arqGeoStats');
  if(geo){
    const entries=[
      {l:'● PONTOS',v:stats.pontos,c:'#67e6ff'},
      {l:'― RETAS',v:stats.retas,c:'#7cffb2'},
      {l:'▢ PLANOS',v:stats.planos,c:'#4de0ff'},
      {l:'◇ CRISTAIS',v:stats.cristais,c:'#ff9ad1'},
      {l:'⧉ CONVERGÊNCIAS',v:stats.cruzes,c:'#ff7a00'},
      {l:'☯ UNIÕES',v:stats.yinyang,c:'#7cffb2'},
      {l:'✧ SELOS',v:stats.selos,c:'#ffd700'},
      {l:'◉ TESTEMUNHAS',v:stats.olhos,c:'#00b894'},
      {l:'♾ ETERNIDADES',v:stats.infinitos,c:'#6c5ce7'},
      {l:'TOTAL PULSOS',v:total,c:'#ffffff'},
    ];
    geo.innerHTML=entries.filter(e=>e.v>0).map(e=>`
      <span class="geo-stat" style="color:${e.c};border-color:${e.c}40">${e.l}: <strong>${e.v}</strong></span>
    `).join('');
  }
}

/* ── INIT ARQ ── */
function initArq(){
  arqLoadVoices();
  setTimeout(arqLoadVoices,600);
  arqBuildGrid('all');
  initCosmos();
  // Intercept nav to arq
  const origNav=window.showView||null;
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-nav="arq"]');
    if(btn){
      const eq=document.getElementById('arqEqBadge');
      if(eq&&ARQ.paginas.length)eq.style.display='block';
    }
  });
  console.log('🧿 KOBLLUX ARQ · 12 ARQUÉTIPOS · LIVRO VIVO · ATIVO');
  console.log('🎭 Sotaques: alemão, espanhol, francês, inglês, lusitano, nativo');
  console.log('⚡ VERDADE × INTEGRAR ÷ Δ = ♾️ · 3×6×9×7=1134 · AMÉM');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(initArq,700));
else setTimeout(initArq,700);

})();
