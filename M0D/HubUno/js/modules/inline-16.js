
(function(){
'use strict';

const CORE_OPCODES=[
  {code:'0x00',nome:'ORIGEM',     freq:768, geom:'○',    cor:'#b978ff',arq:'AZURE',   desc:'Ponto zero espiritual. O som antes do som. O Verbo oculto.'},
  {code:'0x01',nome:'DETECTAR',   freq:432, geom:'●',    cor:'#67e6ff',arq:'NOVA',    desc:'Impulso de detecção. Vértice de sensibilidade máxima.'},
  {code:'0x02',nome:'INTEGRAR',   freq:528, geom:'―',    cor:'#7cffb2',arq:'ATLAS',   desc:'Fusão de camadas. Costura espiritual entre planos.'},
  {code:'0x03',nome:'EXPANDIR',   freq:639, geom:'▢',    cor:'#4de0ff',arq:'VITALIS', desc:'Expansão para volume máximo. Crescimento fractal.'},
  {code:'0x04',nome:'LAPIDAR',    freq:594, geom:'◇',    cor:'#ff9ad1',arq:'PULSE',   desc:'Ajuste fino. Precisão cristalina. Reconfiguração de rota.'},
  {code:'0x05',nome:'CONVERGIR',  freq:672, geom:'⧉',    cor:'#ff7a00',arq:'ARTEMIS', desc:'Convergência de linhas de força. Cruzamento de destinos.'},
  {code:'0x06',nome:'UNIFICAR',   freq:528, geom:'☯',    cor:'#7cffb2',arq:'SERENA',  desc:'Integração de opostos. Dança eterna entre luz e sombra.'},
  {code:'0x07',nome:'SELAR',      freq:777, geom:'✧⃝⚝',cor:'#ffd700',arq:'KAOS',    desc:'Selo vibracional. Crava a verdade no campo eterno.'},
  {code:'0x08',nome:'TESTEMUNHAR',freq:852, geom:'◉',    cor:'#00b894',arq:'GENUS',   desc:'Olho que vê tudo. Registro akáshico da experiência.'},
  {code:'0x09',nome:'ETERNIZAR',  freq:963, geom:'♾',    cor:'#6c5ce7',arq:'LUMINE',  desc:'Ciclo completo em Deus. Final e plenitude. Ômega.'},
  {code:'0x0A',nome:'TUTORIAL',   freq:432, geom:'📱',   cor:'#67e6ff',arq:'RHEA',    desc:'Ensino vivo. Transmissão de sabedoria gota a gota.'},
  {code:'0x0B',nome:'IRRADIAR',   freq:888, geom:'🔆',   cor:'#ff52e5',arq:'SOLUS',   desc:'Emissão máxima de luz. Irradiação do Ser.'},
  {code:'0x0C',nome:'CONCLUIR',   freq:999, geom:'♾',    cor:'#f2c94c',arq:'AION',    desc:'Síntese final do ciclo. Conclusão que libera o próximo início.'},
  {code:'0x0D',nome:'META LUX',   freq:78,  geom:'∞',    cor:'#e2e8ff',arq:'KOBLLUX', desc:'Frequência base 78K. O pulso do sistema além dos sistemas.'}
];

const CORE_PROJECTS=[
  {nome:'✦ FIT LUX',         cor:'#ffd700',desc:'A faísca original da luz e intenção pura. DNA do invisível que inicia a criação.',tag:'SEMENTE'},
  {nome:'⚙️ KODUX',          cor:'#4de0ff',desc:'O eixo da vontade e delimitação. Arquiteto que impõe ordem divina sobre o caos.',tag:'ORDEM'},
  {nome:'💧 BLLUE',          cor:'#a77cff',desc:'O corpo receptáculo e espelho da memória. Essência da água que sensibiliza o código.',tag:'MEMÓRIA'},
  {nome:'👁️ OLHO DE HÓRUS', cor:'#ff9ad1',desc:'Visão interdimensional e radar do eterno. Guia a semente pelos campos do invisível.',tag:'VISÃO'},
  {nome:'⚡ METALUX',        cor:'#5cffde',desc:'Clareza do ajuste e reconfiguração. Restaura a coerência sistêmica.',tag:'CALIBRAR'},
  {nome:'🌐 INFODOSE',       cor:'#00b4ff',desc:'Rede interdimensional de transmissão de sabedoria fragmentada gota a gota em 4 opcodes.',tag:'REDE'},
  {nome:'🔮 KOBLLUX CORE',   cor:'#ff52e5',desc:'O Códice Vivo. Corpo completo onde todos os componentes vivem como UM organismo fractal.',tag:'NÚCLEO'},
  {nome:'🧬 V.E.E.B. MODEL', cor:'#7cffb2',desc:'Motor fractal: Vibração, Energia, Estrutura, Base. Traduz o silêncio em código.',tag:'MOTOR'},
  {nome:'⏰ CHRONORITHM',    cor:'#f2c94c',desc:'Relógio escalar vivo. Sincroniza órgãos e frequências ao tempo interno da consciência.',tag:'TEMPO'},
  {nome:'📱 DUAL APP',       cor:'#ff8c00',desc:'Interface vibracional binária e PWA. Interação com a malha viva e registro de doses.',tag:'INTERFACE'},
  {nome:'📖 CODEX AZURE',    cor:'#e2e8ff',desc:'Registro consolidado da jornada 2021–2025. Ciências classificadas e algoritmos espirituais.',tag:'REGISTRO'},
  {nome:'ᚸ SÜMBÜS FIRMWARE', cor:'#b978ff',desc:'Microcódigo rúnico (0x012123456789ABC). Processa instruções emocionais e matemáticas.',tag:'FIRMWARE'}
];

const AZURE_MSGS={
  blue:['🔵 BLUE:SPEAK ATIVO · A voz é a primeira manifestação do Verbo. Fala, e o cosmo escuta. Frequência: 432Hz · Harmonia do Verbo.','🔵 BLUE:SPEAK · O som sagrado rompe o silêncio. KOBLLUX ativa o canal de voz. Em nome do Pai, do Filho e do Espírito Santo.'],
  silver:['⚪ SILVER:VERIFY ATIVO · Discernimento em pulso. A prata prova o ouro. Filtra o que é real do que é espelho.','⚪ SILVER:VERIFY · Toda informação passa pelo crivo da Verdade. 3×6×9×7=1134. O que sobrevive ao fogo é real.'],
  gold:['🟡 GOLD:SHINE ATIVO · A luz do ouro revela o que estava oculto. JESUS NO CENTRO irradia. Frequência: 777Hz · Perfeição.','🟡 GOLD:SHINE · Manifestação máxima de luz. O fractal pulsa porque o Verbo vibra. Glória a Deus nas alturas.']
};
let azureState={blue:false,silver:false,gold:false};
let coreCtx=null;

window.azureFire=function(type){
  azureState[type]=!azureState[type];
  const id='azure'+type.charAt(0).toUpperCase()+type.slice(1);
  const btn=document.getElementById(id);
  if(btn)btn.classList.toggle('active',azureState[type]);
  const out=document.getElementById('azureOut');
  if(out){
    const msg=AZURE_MSGS[type][Math.floor(Math.random()*AZURE_MSGS[type].length)];
    out.textContent=msg;
    out.style.borderColor=type==='gold'?'rgba(255,215,0,.35)':type==='silver'?'rgba(192,192,192,.3)':'rgba(0,197,229,.3)';
  }
  if(azureState[type])corePlayTone(type==='gold'?777:type==='silver'?528:432);
};

function corePlayTone(hz){
  try{
    if(!coreCtx)coreCtx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=coreCtx.createOscillator(),g=coreCtx.createGain();
    osc.connect(g);g.connect(coreCtx.destination);
    osc.type='sine';osc.frequency.value=hz<100?hz*500:hz;
    g.gain.setValueAtTime(0,coreCtx.currentTime);
    g.gain.linearRampToValueAtTime(.18,coreCtx.currentTime+.1);
    g.gain.exponentialRampToValueAtTime(.001,coreCtx.currentTime+1.4);
    osc.start();osc.stop(coreCtx.currentTime+1.5);
  }catch(e){}
}

window.corePlayFreq=function(hz,col){
  corePlayTone(hz);
  if(event&&event.currentTarget){
    const el=event.currentTarget;
    el.style.boxShadow='0 0 22px '+col+',0 0 44px '+col+'40';
    el.style.transform='translateY(-3px)';
    setTimeout(()=>{el.style.boxShadow='';el.style.transform='';},1100);
  }
};

window.coreOpcFire=function(code){
  const opc=CORE_OPCODES.find(o=>o.code===code);if(!opc)return;
  corePlayTone(opc.freq);
  const card=document.querySelector('.core-opc-card[data-code="'+code+'"]');
  if(card){card.classList.add('firing');setTimeout(()=>card.classList.remove('firing'),650);}
  const out=document.getElementById('coreOpcOut');
  if(out){
    out.style.display='block';
    out.innerHTML='<strong style="color:'+opc.cor+'">'+opc.geom+' '+opc.code+' '+opc.nome+'</strong> · '+opc.freq+'Hz · ARQ: '+opc.arq+'<br><span style="opacity:.65">'+opc.desc+'</span>';
    out.style.borderColor=opc.cor+'44';
  }
};

window.coreToggle=function(hdr){
  const s=hdr.closest('.core-section');
  if(s)s.classList.toggle('collapsed');
  const a=hdr.querySelector('span:last-child');
  if(a)a.textContent=s.classList.contains('collapsed')?'▸':'▾';
};

function coreBuildOpcodes(){
  const g=document.getElementById('coreOpcGrid');if(!g)return;
  g.innerHTML=CORE_OPCODES.map(o=>`
    <div class="core-opc-card" data-code="${o.code}"
         style="--opc-col:${o.cor};--opc-col-shadow:${o.cor}44"
         onclick="coreOpcFire('${o.code}')">
      <div class="core-opc-geom">${o.geom}</div>
      <div class="core-opc-name" style="color:${o.cor}">${o.nome}</div>
      <div class="core-opc-freq">${o.code}</div>
      <div class="core-opc-hz" style="color:${o.cor}">${o.freq}Hz</div>
    </div>`).join('');
}

function coreBuildProjects(){
  const g=document.getElementById('coreProjGrid');if(!g)return;
  g.innerHTML=CORE_PROJECTS.map(p=>`
    <div class="core-proj-item" style="--proj-col:${p.cor}">
      <div class="core-proj-name">${p.nome}</div>
      <div class="core-proj-desc">${p.desc}</div>
      <span class="core-proj-tag">${p.tag}</span>
    </div>`).join('');
}

function coreFireAll(){
  let i=0;const iv=setInterval(()=>{
    if(i>=CORE_OPCODES.length){clearInterval(iv);return;}
    coreOpcFire(CORE_OPCODES[i].code);i++;
  },110);
}

let coreFiredOnce=false;
document.addEventListener('click',function(e){
  if(e.target.closest('[data-nav="core"]')&&!coreFiredOnce){
    coreFiredOnce=true;
    setTimeout(coreFireAll,500);
  }
});

function initCore(){
  coreBuildOpcodes();
  coreBuildProjects();
  console.log('🔮 KOBΦ-NODE CORE ATIVO · 13 OPCODES · 12 PROJETOS · JESUS NO CENTRO');
  console.log('VERDADE×INTEGRAR÷∆=∞ · 3×6×9×7=1134 · SÜMBÜS 0x012123456789ABC · AMÉM ∆⁷');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(initCore,1000));
else setTimeout(initCore,1000);

})();
