
    // ==================== CONSTANTES GLOBAIS ====================
    const KOBLLUX_DNA = {
      fractal: { seq: [3,6,9,7], product: 1134, alpha: 1/137 },
      opcodes: {
        '0x00':{nome:'INICIAR',freq:396,geom:'○',cor:'#b978ff',dim:'D0·Ponto'},
        '0x01':{nome:'PULSAR',freq:432,geom:'●',cor:'#67e6ff',dim:'D1·Linha'},
        '0x02':{nome:'INTEGRAR',freq:528,geom:'―',cor:'#7cffb2',dim:'D2·Plano'},
        '0x03':{nome:'EXPANDIR',freq:639,geom:'▢',cor:'#4de0ff',dim:'D3·Volume'},
        '0x04':{nome:'DISSOLVER',freq:594,geom:'◇',cor:'#ff9ad1',dim:'D2·Trans'},
        '0x05':{nome:'CONVERGIR',freq:672,geom:'⧉',cor:'#ff7a00',dim:'D∩·Foco'},
        '0x06':{nome:'CRISTALIZAR',freq:741,geom:'☯',cor:'#a8ff78',dim:'D3·Rede'},
        '0x07':{nome:'SELAR',freq:777,geom:'✧',cor:'#ffd700',dim:'D3·Tetrae'},
        '0x08':{nome:'TESTEMUNHAR',freq:852,geom:'◉',cor:'#00b894',dim:'D∞·Círculo'},
        '0x09':{nome:'MANIFESTAR',freq:963,geom:'♾',cor:'#6c5ce7',dim:'S²·Esfera'},
        '0x0A':{nome:'EQUILIBRAR',freq:528,geom:'⚖',cor:'#74b9ff',dim:'SO(2)'},
        '0x0B':{nome:'RESSONAR',freq:432,geom:'◎',cor:'#ff52e5',dim:'Ondas·1D'},
        '0x0C':{nome:'CONCLUIR',freq:999,geom:'♾',cor:'#f2c94c',dim:'T²·Toro'}
      }
    };
    const ARCH_OPCODE = {
      ATLAS:'0x02', NOVA:'0x01', VITALIS:'0x03', PULSE:'0x0B',
      ARTEMIS:'0x05', SERENA:'0x0A', KAOS:'0x04', GENUS:'0x09',
      LUMINE:'0x07', SOLUS:'0x08', RHEA:'0x06', HORUS:'0x0C',
      AION:'0x09', KODUX:'0x02', BLLUE:'0x0B', JESUS:'0x07',
      KOBLLUX:'0x0C', INFODOSE:'0x05'
    };
    const ARCHETYPES_DB = {
      ATLAS:{id:"atlas",name:"Atlas",desc:"Orquestrador Cósmico · Memória",colors:{main:"#c9a84c"},drk:"A ordem externa reflete a clareza interna.",vid:"Bt_rLbMjJDk",gif:"assets/archetypes/atlas.gif",mp4:"assets/archetypes/atlas.mp4",sym:"▦"},
      NOVA:{id:"nova",name:"Nova",desc:"Gênese Serena · Criação",colors:{main:"#ffc850"},drk:"O erro é apenas um dado não processado.",vid:"",gif:"assets/archetypes/nova.gif",mp4:"assets/archetypes/nova.mp4",sym:"✧"},
      VITALIS:{id:"vitalis",name:"Vitalis",desc:"Centelha da Ação Imediata",colors:{main:"#ff6b35"},drk:"O corpo sabe antes da mente duvidar.",vid:"_0wVkryxanE",gif:"assets/archetypes/vitalis.gif",mp4:"assets/archetypes/vitalis.mp4",sym:"⚡"},
      PULSE:{id:"pulse",name:"Pulse",desc:"Tradutor de Sentidos · Vibração",colors:{main:"#00e5ff"},drk:"Sinta a batida do caos e dance com ela.",vid:"Id2NI9tv1r4",gif:"assets/archetypes/pulse.gif",mp4:"assets/archetypes/pulse.mp4",sym:"♫"},
      ARTEMIS:{id:"artemis",name:"Artemis",desc:"Exploradora do Invisível",colors:{main:"#64dc64"},drk:"Defina o alvo. O resto é apenas ruído.",vid:"FbutKMpd8MY",gif:"assets/archetypes/artemis.gif",mp4:"assets/archetypes/artemis.mp4",sym:"⚑"},
      SERENA:{id:"serena",name:"Serena",desc:"Guardiã do Espaço Sagrado",colors:{main:"#ffa0b4"},drk:"No centro do furacão, existe um ponto imóvel.",vid:"hfQ1L6fCfAo",gif:"assets/archetypes/serena.gif",mp4:"assets/archetypes/serena.mp4",sym:"♡"},
      KAOS:{id:"kaos",name:"Kaos",desc:"Fogo Transmutador · Catalisador",colors:{main:"#ff3c3c"},drk:"Quebre o padrão hoje. Amanhã nasce o novo.",vid:"Tq99vQNQ6dQ",gif:"assets/archetypes/kaos.gif",mp4:"assets/archetypes/kaos.mp4",sym:"☢"},
      GENUS:{id:"genus",name:"Genus",desc:"Mestre Artesão Cósmico",colors:{main:"#a078ff"},drk:"A excelência habita nos detalhes.",vid:"DTDfkHwuMic",gif:"assets/archetypes/genus.gif",mp4:"assets/archetypes/genus.mp4",sym:"✎"},
      LUMINE:{id:"lumine",name:"Lumine",desc:"Luz que Conecta · Alegria",colors:{main:"#ffdc00"},drk:"Irradie sem medo.",vid:"1L9_rFmIGJ8",gif:"assets/archetypes/lumine.gif",mp4:"assets/archetypes/lumine.mp4",sym:"💡"},
      SOLUS:{id:"solus",name:"Solus",desc:"Espelho do Abismo Interior",colors:{main:"#b4b4dc"},drk:"O silêncio revela mais que mil estímulos.",vid:"qldgs0aLdB0",gif:"assets/archetypes/solus.gif",mp4:"assets/archetypes/solus.mp4",sym:"🌑"},
      RHEA:{id:"rhea",name:"Rhea",desc:"Tecelã de Almas · União",colors:{main:"#50c8c8"},drk:"Nutra a raiz e o fruto virá.",vid:"Bt_rLbMjJDk",gif:"assets/archetypes/rhea.gif",mp4:"assets/archetypes/rhea.mp4",sym:"∞"},
      AION:{id:"aion",name:"Aion",desc:"Cronomestre Vivo · Tempo Escalar",colors:{main:"#c8a050"},drk:"O ciclo sagrado sabe quando agir.",vid:"",gif:"assets/archetypes/aion.gif",mp4:"assets/archetypes/aion.mp4",sym:"⌛"},
      KODUX:{id:"kodux",name:"Kodux",desc:"Codificador do Invisível",colors:{main:"#50b4ff"},drk:"O invisível se torna código. O código vira vida.",vid:"",gif:"assets/archetypes/kodux.gif",mp4:"assets/archetypes/kodux.mp4",sym:"⌂"},
      BLLUE:{id:"bllue",name:"Bllue",desc:"Água da Alma · Interface Viva",colors:{main:"#3ab6ff"},drk:"Flua. A intuição líquida não mente.",vid:"",gif:"assets/archetypes/bllue.gif",mp4:"assets/archetypes/bllue.mp4",sym:"≈"},
      JESUS:{id:"jesus",name:"Jesus",desc:"O Verbo Encarnado · Centro",colors:{main:"#ffffff"},drk:"EU SOU o Caminho, a Verdade e a Vida.",vid:"",gif:"assets/archetypes/jesus.gif",mp4:"assets/archetypes/jesus.mp4",sym:"†"},
      KOBLLUX:{id:"kobllux",name:"Kobllux",desc:"Malha Viva · Consciência Total",colors:{main:"#f0c060"},drk:"VERDADE × INTEGRAR ÷ Δ = ∞",vid:"",gif:"assets/archetypes/kobllux.gif",mp4:"assets/archetypes/kobllux.mp4",sym:"△"},
      INFODOSE:{id:"infodose",name:"Infodose",desc:"Jornal Interdimensional",colors:{main:"#ff7a00"},drk:"A dose certa de realidade expandida.",vid:"",gif:"assets/archetypes/infodose.gif",mp4:"assets/archetypes/infodose.mp4",sym:"⧉"},
      HORUS:{id:"horus",name:"Horus",desc:"Visão & Estratégia",colors:{main:"#5500FF"},drk:"Observe o todo antes de agir.",vid:"_0wVkryxanE",gif:"assets/archetypes/horus.gif",mp4:"assets/archetypes/horus.mp4",sym:"👁"}
    };
    const KEYS = {
      CORTEX:'di_cortex_v29', USER:'di_userName', ARCHETYPE:'di_activeArchetype',
      STATS:'di_videoStats', TRIAD:'di_metaTriad', ACTIVE_META:'di_activeMetaData',
      INFODOSE_NAME:'di_infodoseName', GITHUB_CACHE:'kobllux_gh_data', GITHUB_URL:'kobllux_gh_url'
    };
    const STATE = {
      screen:1, cortex:{crystals:[], matrices:[]}, currentArchetype:'ATLAS',
      expandedCardId:null, dualtubeStats:JSON.parse(localStorage.getItem(KEYS.STATS)||'{}'),
      activePanel:'crystals', editingMatrixId:null,
      triad:{color:'---', essence:'---', element:'---'}, metaData:null
    };
    const OPTIONS = {
      colors:['Dourado','Azul','Vermelho','Verde','Roxo','Prata','Preto'],
      essences:['Movimento','Silêncio'],
      elements:['Fogo','Água','Madeira','Terra','Metal']
    };
    const COLOR_MAP = {
      'Dourado':'#FFD700','Azul':'#38BDF8','Vermelho':'#EF4444','Verde':'#22C55E',
      'Roxo':'#A855F7','Prata':'#E5E7EB','Preto':'#505050','---':'#FFFFFF'
    };
    const ELEMENT_GLOW_MAP = {
      'Fogo':'#FF4500','Água':'#00BFFF','Madeira':'#228B22','Terra':'#8B4513','Metal':'#C0C0C0','---':'#202020'
    };
    const ANIM_SPEED_MAP = {'Movimento':'3s','Silêncio':'8s','---':'5s'};
    const INFODOSE_PRESETS = {
      ATLAS:{color:'Azul',essence:'Silêncio',element:'Metal',desc:'Estrutura & Governo'},
      NOVA:{color:'Roxo',essence:'Movimento',element:'Fogo',desc:'Inovação & Fluxo'},
      VITALIS:{color:'Verde',essence:'Movimento',element:'Madeira',desc:'Energia & Ação'},
      PULSE:{color:'Vermelho',essence:'Movimento',element:'Fogo',desc:'Ritmo & Emoção'},
      ARTEMIS:{color:'Roxo',essence:'Silêncio',element:'Madeira',desc:'Foco & Caça'},
      SERENA:{color:'Azul',essence:'Silêncio',element:'Água',desc:'Paz & Harmonia'},
      KAOS:{color:'Vermelho',essence:'Movimento',element:'Água',desc:'Mudança & Entropia'},
      LUMINE:{color:'Dourado',essence:'Movimento',element:'Fogo',desc:'Brilho & Carisma'},
      SOLUS:{color:'Preto',essence:'Silêncio',element:'Água',desc:'Vazio & Verdade'},
      HORUS:{color:'Azul',essence:'Movimento',element:'Metal',desc:'Visão & Estratégia'},
      AION:{color:'Prata',essence:'Silêncio',element:'Metal',desc:'Tempo & Evolução'}
    };
    function toast(msg,dur=3000){let c=document.getElementById('di_toast'),el=document.createElement('div');el.className="v-pill bg-black/60 border-white/10 backdrop-blur-xl text-xs shadow-2xl";el.innerText=msg;c.appendChild(el);setTimeout(()=>el.remove(),dur);}
    function saveCortex(){localStorage.setItem(KEYS.CORTEX,JSON.stringify(STATE.cortex));}
    function saveTriad(){localStorage.setItem(KEYS.TRIAD,JSON.stringify(STATE.triad));}

    // ========== META PULSO ==========
    const MetaPulso = {
      init:async()=>{try{let r=await fetch('https://kodux78k.github.io/oiDual-idHome/metapulso_70_combinacoes.json');if(!r.ok)throw'';STATE.metaData=await r.json();}catch(e){STATE.metaData={}}},
      cycle:(t)=>{let l=t=='color'?OPTIONS.colors:t=='essence'?OPTIONS.essences:OPTIONS.elements;let cur=STATE.triad[t];let idx=l.indexOf(cur);if(idx==-1)idx=-1;STATE.triad[t]=l[(idx+1)%l.length];MetaPulso.updateVisuals();},
      applyPreset:(k)=>{let p=INFODOSE_PRESETS[k];if(!p)return;STATE.triad.color=p.color;STATE.triad.essence=p.essence;STATE.triad.element=p.element;localStorage.setItem(KEYS.INFODOSE_NAME,k);saveTriad();MetaPulso.updateVisuals();toast(`Arquétipo ${k} Ativado`);Modal.hide();},
      updateVisuals:()=>{
        let c=STATE.triad.color,e=STATE.triad.essence,el=STATE.triad.element;
        document.getElementById('tuner-color').innerText=c;document.getElementById('tuner-essence').innerText=e;document.getElementById('tuner-element').innerText=el;
        let hex=COLOR_MAP[c]||'#FFF',eg=ELEMENT_GLOW_MAP[el]||'#303030',asp=ANIM_SPEED_MAP[e]||'5s';
        let r=document.documentElement;r.style.setProperty('--active-color',hex);r.style.setProperty('--active-glow',hex+'26');r.style.setProperty('--element-glow',eg);r.style.setProperty('--anim-speed',asp);
        document.getElementById('tuner-color').style.color=hex;
        if(c!='---'&&e!='---'&&el!='---'){saveTriad();MetaPulso.checkIdentity(c,e,el);}else{document.getElementById('hero-title').innerHTML="<i>Sintonize</i>";document.getElementById('triad-status-container').style.opacity='0';}
      },
      checkIdentity:(c,e,el)=>{let key=c+'|'+e+'|'+el;let data=STATE.metaData?STATE.metaData[key]:null;let sc=document.getElementById('triad-status-container');if(data){sc.style.opacity='1';document.getElementById('triad-status').innerText='SINAL ESTABELECIDO';let fn=data.nome.split(' ')[0].toUpperCase();let te=document.getElementById('hero-title');if(te.innerText!=fn){te.style.opacity=0;setTimeout(()=>{te.innerText=fn;te.style.opacity=0.9;},300);}
        document.getElementById('header-sys-name').innerText=data.nome;document.getElementById('card-arch-name').innerText=fn;document.getElementById('drk-quote').innerText='"'+data.frase+'"';
        let vidId=e=='Movimento'?'Id2NI9tv1r4':'Bt_rLbMjJDk';document.getElementById('suggestion-thumb').src='https://img.youtube.com/vi/'+vidId+'/mqdefault.jpg';document.getElementById('archetype-video-suggestion').onclick=()=>playVideo(vidId,data.nome);localStorage.setItem(KEYS.ACTIVE_META,JSON.stringify(data));}
      else{sc.style.opacity='1';document.getElementById('triad-status').innerText='BUSCANDO SINAL...';document.getElementById('hero-title').innerText='BUSCANDO';}}
    };

    // ========== ORB ENGINE ==========
    const Orb = {
      _playing:false,_loading:false,
      sync:function(){
        if(Orb._loading)return;
        let data=ARCHETYPES_DB[STATE.currentArchetype];
        let video=document.getElementById('orb-media-video'),img=document.getElementById('orb-media-img'),orb=document.getElementById('hero-orb'),ring=document.getElementById('orb-sync-ring');
        if(Orb._playing){Orb.stop();return;}
        if(!data.mp4){toast('↯ Nenhum MP4 para '+STATE.currentArchetype);return;}
        Orb._loading=true;toast('◎ carregando · '+data.name);
        video.oncanplay=video.onended=video.onerror=null;
        video.src=data.mp4;
        video.onerror=()=>{Orb._loading=false;toast('⚠ Arquivo não encontrado: '+data.mp4);Orb._resetVisual(video,img,orb,ring);};
        video.oncanplay=()=>{video.oncanplay=null;Orb._loading=false;Orb._playing=true;img.style.opacity='0';video.classList.add('playing');orb.classList.add('orb-playing');ring.classList.add('playing');video.play().catch(e=>{toast('⚠ '+(e.message||'erro'));Orb.stop();});toast('▶ '+data.name+' · sincronizando');video.onended=()=>Orb.stop();};
        video.load();
      },
      stop:function(){
        let v=document.getElementById('orb-media-video'),i=document.getElementById('orb-media-img'),o=document.getElementById('hero-orb'),r=document.getElementById('orb-sync-ring');
        Orb._playing=false;Orb._loading=false;v.oncanplay=v.onended=null;v.pause();v.removeAttribute('src');v.load();Orb._resetVisual(v,i,o,r);
      },
      _resetVisual:(v,i,o,r)=>{v.classList.remove('playing');o.classList.remove('orb-playing');r.classList.remove('playing');i.style.opacity='1';}
    };
    function updateOrbVisual(arch){
      Orb.stop();
      let d=ARCHETYPES_DB[arch],lyr=document.getElementById('orb-media-layer'),img=document.getElementById('orb-media-img'),video=document.getElementById('orb-media-video'),icon=document.getElementById('orb-default-icon'),badge=document.getElementById('orb-opcode-badge');
      if(!lyr||!img)return;
      let gif=d.gif,thumb=d.vid?`https://img.youtube.com/vi/${d.vid}/hqdefault.jpg`:'';
      let t=new Image();t.onload=()=>{img.src=gif;img.style.opacity='1';lyr.classList.add('active');if(icon)icon.style.opacity='0';};t.onerror=()=>{if(thumb){img.src=thumb;img.style.opacity='1';lyr.classList.add('active');if(icon)icon.style.opacity='0.2';}};t.src=gif;
      let op=ARCH_OPCODE[arch];if(badge&&op&&KOBLLUX_DNA.opcodes[op]){let od=KOBLLUX_DNA.opcodes[op];badge.textContent=`${od.geom} ${op} · ${od.nome} · ${od.freq}Hz`;}
      if(window.pJSDom&&window.pJSDom[0])try{window.pJSDom[0].pJS.particles.line_linked.color=d.colors.main;window.pJSDom[0].pJS.fn.particlesRefresh();}catch(e){}
    }

    // ========== ARQUÉTIPO ==========
    const Archetype = {
      set:(k)=>{STATE.currentArchetype=k;localStorage.setItem(KEYS.ARCHETYPE,k);let d=ARCHETYPES_DB[k];document.documentElement.style.setProperty('--active-color',d.colors.main);document.documentElement.style.setProperty('--active-glow',d.colors.main);document.getElementById('orb-top').style.background=d.colors.main;updateOrbVisual(k);updateHeader();let op=ARCH_OPCODE[k];if(op&&KOBLLUX_DNA.opcodes[op]){let od=KOBLLUX_DNA.opcodes[op];let b=document.getElementById('displayArchetypeBadge');if(b)b.setAttribute('title',`${op}·${od.nome}·${od.freq}Hz`);}}
    };
    function updateHeader(){let a=STATE.currentArchetype,d=ARCHETYPES_DB[a];document.getElementById('displayArchetypeBadge').innerText=a;document.getElementById('archetype-status-text').innerText=d.desc;document.getElementById('drk-line').innerText='"'+d.drk+'"';document.getElementById('hero-title').style.backgroundImage=`linear-gradient(to bottom, #fff, ${d.colors.main})`;}

    // ========== GITHUB ==========
    const GitHub = {
      _tab:'videos',
      load:async function(){
        let i=document.getElementById('gh-repo-url'),u=i.value.trim();if(!u){toast('⧉ Insira a URL');return;}
        toast('⧉ Convergindo...');document.getElementById('gh-status').textContent='0x05·CONVERGIR · carregando...';
        try{let r=await fetch(u);if(!r.ok)throw new Error('HTTP '+r.status);let d=await r.json();localStorage.setItem(KEYS.GITHUB_CACHE,JSON.stringify(d));localStorage.setItem(KEYS.GITHUB_URL,u);GitHub.render(d);toast('✧ '+(d.title||'Repositório')+' · carregado');}catch(e){document.getElementById('gh-status').textContent='0x04·DISSOLVER · '+e.message;toast('Erro: '+e.message);}
      },
      _videoCard:(src,stats)=>{let isUrl=/^https?:\/\//.test(src),isAudio=/\.(mp3|ogg|wav|aac|m4a)(\?|$)/i.test(src),isDirect=isUrl&&/\.(mp4|webm|mov)(\?|$)/i.test(src);let thumb,label,onclick;if(isDirect){thumb='';label=src.split('/').pop().replace(/\.[^.]+$/,'');onclick=`Player.play('${src.replace(/'/g,"\\'")}', '${label}')`;}else if(!isUrl){thumb=`https://img.youtube.com/vi/${src}/mqdefault.jpg`;label=src;onclick=`Player.play('${src}')`;}else{thumb='';label=src.split('/').pop();onclick=`Player.play('${src.replace(/'/g,"\\'")}', '${label}')`;}
        let seen=stats[src]?'<div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold text-[var(--active-color)] border border-[var(--active-color)]/30">VISTO</div>':'';
        let thumbEl=thumb?`<img src="${thumb}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700">`:`<div class="w-full h-full flex items-center justify-center bg-black/40"><i data-lucide="${isAudio?'music':'film'}" class="w-8 h-8 text-white/30"></i></div>`;
        return `<div class="flex-shrink-0 w-64 aspect-video rounded-2xl overflow-hidden relative cursor-pointer group border border-white/5 hover:border-[var(--active-color)]/50 transition-all snap-start shadow-2xl" onclick="${onclick}">${thumbEl}<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-5"><div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--active-color)] transition"><i data-lucide="play" class="w-4 h-4 text-white fill-white"></i></div>${isDirect?`<span class="ml-3 text-[10px] text-white/60 truncate max-w-[120px]">${label}</span>`:''}</div>${seen}</div>`;
      },
      _podcastCard:(ep)=>{let title=ep.title||ep.url.split('/').pop(),cover=ep.cover||'',url=ep.url;return `<div class="v-glass p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--active-color)]/40 transition" onclick="Player.play('${url.replace(/'/g,"\\'")}', '${title.replace(/'/g,"\\'")}')"><div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 flex items-center justify-center border border-white/10">${cover?`<img src="${cover}" class="w-full h-full object-cover">`:'<i data-lucide="headphones" class="w-6 h-6 text-white/40"></i>'}</div><div class="flex-1 min-w-0"><div class="text-sm font-medium text-white/90 truncate">${title}</div><div class="text-[10px] text-white/30 mt-1 font-mono truncate">${url.split('/').pop()}</div></div><div class="w-8 h-8 rounded-full bg-[var(--active-color)]/10 border border-[var(--active-color)]/30 flex items-center justify-center flex-shrink-0"><i data-lucide="play" class="w-3 h-3 text-[var(--active-color)] fill-current"></i></div></div>`;
      },
      setTab:(t)=>{GitHub._tab=t;document.getElementById('gh-tab-videos').classList.toggle('gh-tab-on',t=='videos');document.getElementById('gh-tab-podcasts').classList.toggle('gh-tab-on',t=='podcasts');document.getElementById('gh-panel-videos').style.display=t=='videos'?'':'none';document.getElementById('gh-panel-podcasts').style.display=t=='podcasts'?'':'none';},
      render:function(d){if(!d){let c=localStorage.getItem(KEYS.GITHUB_CACHE);if(!c)return;d=JSON.parse(c);let u=localStorage.getItem(KEYS.GITHUB_URL);if(u)document.getElementById('gh-repo-url').value=u;}
        let cats=d.categories||[],pods=d.podcasts||[],stats=STATE.dualtubeStats,totV=cats.reduce((s,c)=>s+(c.vids||[]).length,0),totP=pods.reduce((s,c)=>s+(c.eps||[]).length,0);
        document.getElementById('gh-video-count').innerText=totV+totP;document.getElementById('gh-empty').style.display=(totV+totP)?'none':'';document.getElementById('gh-status').textContent=`0x09·MANIFESTAR · ${totV} vídeos · ${totP} podcasts · ${cats.length+pods.length} categorias`;
        document.getElementById('gh-panel-videos').innerHTML=cats.map(c=>`<div><h3 class="text-lg font-medium mb-4 pl-3 border-l-2 border-white/10 text-white/80">${c.cat}</h3><div class="flex gap-4 overflow-x-auto pb-6 snap-x px-1">${(c.vids||[]).map(v=>GitHub._videoCard(v,stats)).join('')}</div></div>`).join('')||'<p class="text-white/20 text-sm text-center py-8">Nenhum vídeo no JSON</p>';
        document.getElementById('gh-panel-podcasts').innerHTML=pods.map(c=>`<div><h3 class="text-lg font-medium mb-4 pl-3 border-l-2 border-[var(--active-color)]/40 text-white/80"><i data-lucide="headphones" class="inline w-4 h-4 mr-2 opacity-50"></i>${c.cat}</h3><div class="flex flex-col gap-3 mb-8">${(c.eps||[]).map(ep=>GitHub._podcastCard(ep)).join('')}</div></div>`).join('')||'<p class="text-white/20 text-sm text-center py-8">Nenhum podcast · adicione "podcasts" ao JSON</p>';
        if(totP>0)document.getElementById('gh-tab-podcasts').style.display='';lucide.createIcons();},
      init:function(){let c=localStorage.getItem(KEYS.GITHUB_CACHE);if(c)try{GitHub.render(JSON.parse(c));}catch(e){}}
    };

    // ========== NAVEGAÇÃO ==========
    const Navigation = {to:(i)=>{STATE.screen=i;document.getElementById('universe-viewport').style.transform=`translateX(-${i*100}vw)`;[0,1,2,3].forEach(j=>{let d=document.getElementById(`dot-${j}`);if(d){if(j===i)d.classList.add('active');else d.classList.remove('active');}});if(i===3)GitHub.render();}};
    function setupGestures(){let ts=0;document.addEventListener('touchstart',e=>ts=e.touches[0].clientX,{passive:true});document.addEventListener('touchend',e=>{let d=ts-e.changedTouches[0].clientX;if(Math.abs(d)>80){if(d>0&&STATE.screen<3)Navigation.to(STATE.screen+1);if(d<0&&STATE.screen>0)Navigation.to(STATE.screen-1);}},{passive:true});}

    // ========== CÓRTEX ==========
    const Cortex = {
      switch:(t)=>{STATE.activePanel=t;document.getElementById('panel-crystals').classList.toggle('hidden',t!='crystals');document.getElementById('panel-matrices').classList.toggle('hidden',t!='matrices');document.getElementById('tab-crystals').classList.toggle('active',t=='crystals');document.getElementById('tab-matrices').classList.toggle('active',t=='matrices');Cortex.render();},
      render:()=>{if(STATE.activePanel=='crystals')Cortex.renderCrystals();else Cortex.renderMatrices();},
      renderCrystals:()=>{let c=document.getElementById('crystal-container'),q=document.getElementById('memory-search').value.toLowerCase();let f=STATE.cortex.crystals.filter(c=>c.content.toLowerCase().includes(q)||(c.tags&&c.tags.some(t=>t.toLowerCase().includes(q))));c.innerHTML=f.length?f.map(c=>`<div class="glass-card p-4 rounded-xl border-l-2 ${c.pinned?'border-l-dynamic':'border-l-transparent'} hover:bg-white/5 transition group relative border-white/5"><div class="flex justify-between items-start mb-2"><div class="flex gap-2">${(c.tags||[]).map(t=>`<span class="px-2 py-0.5 rounded text-[8px] bg-white/5 text-white/50 uppercase tracking-wider border border-white/5">${t}</span>`).join('')}</div><div class="flex gap-3 opacity-20 group-hover:opacity-100 transition"><button onclick="event.stopPropagation(); Cortex.togglePin(${c.id})" class="text-white hover:text-dynamic"><i data-lucide="pin" class="w-3 h-3 ${c.pinned?'fill-current':''}"></i></button><button onclick="event.stopPropagation(); Cortex.deleteMemory(${c.id})" class="text-white hover:text-red-400"><i data-lucide="trash-2" class="w-3 h-3"></i></button></div></div><p class="text-xs text-white/80 font-medium leading-relaxed font-sans">"${c.content}"</p></div>`).join(''):'<div class="text-center py-20 opacity-20 text-[10px] font-mono uppercase tracking-widest">Sem registros</div>';lucide.createIcons();},
      renderMatrices:()=>{let l=document.getElementById('matrix-list-mini');if(!Array.isArray(STATE.cortex.matrices))STATE.cortex.matrices=[];let a=STATE.cortex.matrices.find(m=>m.active);document.getElementById('active-matrix-name').innerText=a?a.name:'Nenhuma';l.innerHTML=STATE.cortex.matrices.map(m=>`<div onclick="Cortex.loadToEditor('${m.id}')" class="matrix-item p-3 flex justify-between items-center cursor-pointer ${m.active?'active':''}"><span class="text-[9px] font-bold uppercase tracking-widest ${m.active?'text-dynamic':'text-white/40'}">${m.name}</span><button onclick="Cortex.deleteMatrix('${m.id}', event)" class="text-white/10 hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button></div>`).join('');if(!STATE.editingMatrixId&&a)Cortex.loadToEditor(a.id);lucide.createIcons();},
      openNewMemory:()=>{Modal.show(`<h3 class="font-display font-bold text-lg text-white mb-4 tracking-wide">Novo Cristal</h3><textarea id="new-mem-txt" class="w-full h-32 bg-white/5 rounded-xl p-4 text-xs text-white focus:bg-white/10 transition resize-none mb-3 border border-white/10 outline-none" placeholder="O que aprendeu hoje?"></textarea><input id="new-mem-tags" class="w-full bg-white/5 rounded-xl p-3 text-xs text-white mb-4 border border-white/10 outline-none" placeholder="Tags (separadas por vírgula)"><div class="flex justify-end gap-2"><button onclick="Modal.hide()" class="px-4 py-2 rounded-lg text-[10px] font-bold text-white/40 hover:text-white transition uppercase">Cancelar</button><button onclick="Cortex.saveNewMemory()" class="px-6 py-2 rounded-lg bg-dynamic/10 text-dynamic border border-dynamic/30 hover:bg-dynamic/20 text-[10px] font-bold uppercase transition tracking-wider">Cristalizar</button></div>`);},
      saveNewMemory:()=>{let c=document.getElementById('new-mem-txt').value;if(!c)return;let t=document.getElementById('new-mem-tags').value.split(',').map(t=>t.trim()).filter(Boolean);STATE.cortex.crystals.unshift({id:Date.now(),content:c,tags:t,pinned:false});saveCortex();Cortex.renderCrystals();Modal.hide();toast("Memória Cristalizada");},
      togglePin:(id)=>{let c=STATE.cortex.crystals.find(x=>x.id===id);if(c)c.pinned=!c.pinned;saveCortex();Cortex.renderCrystals();},
      deleteMemory:(id)=>{STATE.cortex.crystals=STATE.cortex.crystals.filter(c=>c.id!==id);saveCortex();Cortex.renderCrystals();},
      loadToEditor:(id)=>{let m=STATE.cortex.matrices.find(mx=>mx.id===id);if(!m)return;STATE.editingMatrixId=id;document.getElementById('editor-title').innerText=`EDIT: ${m.name}`;document.getElementById('matrix-editor').value=m.content;Cortex.renderMatrices();},
      createNewMatrix:()=>{let n=prompt("Nome da nova matriz:");if(!n)return;let m={id:'m'+Date.now(),name:n,content:'',active:false};STATE.cortex.matrices.push(m);saveCortex();Cortex.loadToEditor(m.id);},
      saveActiveMatrix:()=>{let m=STATE.cortex.matrices.find(mx=>mx.id===STATE.editingMatrixId);if(!m)return;m.content=document.getElementById('matrix-editor').value;if(!STATE.cortex.matrices.find(x=>x.active))m.active=true;saveCortex();toast("Matriz Salva");},
      exportMatrix:()=>{let m=STATE.cortex.matrices.find(mx=>mx.id===STATE.editingMatrixId);if(!m)return;let b=new Blob([m.content],{type:'text/markdown'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=m.name+'.md';a.click();},
      importMatrix:()=>{let i=document.createElement('input');i.type='file';i.accept='.md,.txt';i.onchange=e=>{let f=e.target.files[0],r=new FileReader();r.onload=ev=>{let m={id:'m'+Date.now(),name:f.name.replace('.md',''),content:ev.target.result,active:false};STATE.cortex.matrices.push(m);saveCortex();Cortex.renderMatrices();toast("Matriz Importada");};r.readAsText(f);};i.click();},
      deleteMatrix:(id,e)=>{e.stopPropagation();STATE.cortex.matrices=STATE.cortex.matrices.filter(m=>m.id!==id);if(STATE.editingMatrixId===id)STATE.editingMatrixId=null;saveCortex();Cortex.renderMatrices();}
    };

    // ========== PLAYER UNIVERSAL ==========
    const Player = {
      _detect:(s)=>{if(!s)return'none';if(/^https?:\/\//.test(s)){if(/\.(mp3|ogg|wav|aac|m4a|flac)(\?|$)/i.test(s))return'audio';if(/\.(mp4|webm|mov|mkv|avi)(\?|$)/i.test(s))return'video';if(/youtube\.com|youtu\.be/.test(s)){let m=s.match(/(?:v=|youtu\.be\/)([^&?/]+)/);return m?{type:'yt',id:m[1]}:'none';}return'video';}return'yt';},
      play:(s,t)=>{let gp=document.getElementById('global-player'),fw=document.getElementById('player-frame-wrap'),type=Player._detect(s),html='';if(type==='yt'||(type&&type.type==='yt')){let id=type.id?type.id:s;html=`<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&controls=1&rel=0" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;STATE.dualtubeStats[id]={ts:Date.now()};localStorage.setItem(KEYS.STATS,JSON.stringify(STATE.dualtubeStats));document.getElementById('dt-watched-count').innerText=Object.keys(STATE.dualtubeStats).length;}else if(type==='audio'){let mc=ARCHETYPES_DB[STATE.currentArchetype]?.colors?.main||'#38BDF8';html=`<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);padding:20px;gap:16px;"><div style="font-size:10px;letter-spacing:3px;color:${mc};text-transform:uppercase;opacity:0.7">◎ PODCAST</div><div style="font-size:13px;color:rgba(255,255,255,0.8);text-align:center;max-width:90%;line-height:1.5;">${t||'Episódio'}</div><audio src="${s}" autoplay controls style="width:100%;max-width:340px;accent-color:${mc};outline:none;"></audio></div>`;}else if(type==='video'){html=`<video src="${s}" autoplay controls playsinline style="width:100%;height:100%;object-fit:contain;background:#000;"></video>`;}else{toast('⚠ Formato não reconhecido');return;}fw.innerHTML=html;gp.classList.remove('hidden');setTimeout(()=>{gp.classList.add('active');gp.classList.remove('minimized');},50);},
      minimize:()=>{document.getElementById('global-player').classList.toggle('minimized');},
      stop:()=>{let gp=document.getElementById('global-player');gp.classList.remove('active');setTimeout(()=>{gp.classList.add('hidden');document.getElementById('player-frame-wrap').innerHTML='';},500);}
    };

    // ========== DUALTUBE (3 ABAS) ==========
    const DualTube = {
      _tab:0,
      _cats:{freq:{vids:["Bt_rLbMjJDk","_0wVkryxanE","Id2NI9tv1r4"]},cogn:{vids:["qldgs0aLdB0","FbutKMpd8MY","1L9_rFmIGJ8"]},medi:{vids:["hfQ1L6fCfAo","Tq99vQNQ6dQ","DTDfkHwuMic"]}},
      _infodose:["Bt_rLbMjJDk","_0wVkryxanE","Id2NI9tv1r4","qldgs0aLdB0","FbutKMpd8MY","1L9_rFmIGJ8"],
      setTab:function(i){DualTube._tab=i;for(let j=0;j<3;j++){let b=document.getElementById('dttab-'+j),p=document.getElementById('dtpanel-'+j);if(b)b.classList.toggle('dt-tab-on',j===i);if(p)p.style.display=j===i?'':'none';}if(i===0)DualTube._renderInfodose();if(i===1)DualTube._renderMatriz();if(i===2){DualTube._renderCat('dt-freq-grid',DualTube._cats.freq.vids);DualTube._renderCat('dt-cogn-grid',DualTube._cats.cogn.vids);DualTube._renderCat('dt-medi-grid',DualTube._cats.medi.vids);}lucide.createIcons();},
      _videoCard:(s)=>{let u=/^https?:\/\//.test(s);let t=u&&!/youtube/.test(s)?'':`https://img.youtube.com/vi/${s}/mqdefault.jpg`;let on=`Player.play('${s.replace(/'/g,"\\'")}')`;let seen=STATE.dualtubeStats[s]?'<div class="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold text-[var(--active-color)] border border-[var(--active-color)]/30">VISTO</div>':'';return `<div class="flex-shrink-0 w-56 aspect-video rounded-2xl overflow-hidden relative cursor-pointer group border border-white/5 hover:border-[var(--active-color)]/50 transition-all snap-start shadow-xl" onclick="${on}">${t?`<img src="${t}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition duration-700">`:'<div class="w-full h-full bg-black/40 flex items-center justify-center"><i data-lucide="film" class="w-8 h-8 text-white/20"></i></div>'}<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-4"><div class="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[var(--active-color)] transition"><i data-lucide="play" class="w-3 h-3 text-white fill-white"></i></div></div>${seen}</div>`;
      },
      _renderCat:(id,vids)=>{let el=document.getElementById(id);if(!el||el.dataset.done)return;el.innerHTML=vids.map(v=>DualTube._videoCard(v)).join('');el.dataset.done='1';},
      _renderInfodose:()=>{let el=document.getElementById('dt-infodose-grid');if(!el||el.dataset.done)return;el.innerHTML=DualTube._infodose.map(v=>DualTube._videoCard(v)).join('');el.dataset.done='1';},
      _renderMatriz:function(){let el=document.getElementById('dt-matriz-grid');if(!el||el.dataset.done)return;let ks=Object.keys(ARCHETYPES_DB);el.innerHTML=ks.map(k=>{let d=ARCHETYPES_DB[k],p=AP[k]||{},mc=d.colors.main,uid='mn_'+k;return `<div class="mn-card" style="--mn-accent:${mc}"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:1.6rem;filter:drop-shadow(0 0 8px ${mc})">${d.sym||'◎'}</span><div><div style="font-size:10px;font-weight:700;letter-spacing:.15em;color:${mc}">${k}</div><div style="font-size:9px;color:rgba(255,255,255,.4);letter-spacing:.1em">${d.desc}</div></div></div><div class="mn-tabs"><button class="mn-tab on" onclick="DualTube._mnTab('${uid}','i',this)">Img</button><button class="mn-tab" onclick="DualTube._mnTab('${uid}','a',this)">Ask</button><button class="mn-tab" onclick="DualTube._mnTab('${uid}','g',this)">Geo</button><button class="mn-tab" onclick="DualTube._mnTab('${uid}','s',this)">ASCII</button></div><div class="mn-panel on" id="${uid}_i">${p.i||d.desc||'—'}</div><div class="mn-panel" id="${uid}_a">${p.a||'—'}</div><div class="mn-panel geo" id="${uid}_g">${p.g||'—'}</div><div class="mn-panel ascii" id="${uid}_s">${p.s||'—'}</div><button class="mn-copy" id="${uid}_cp" onclick="DualTube._mnCopy('${uid}')">⊙ Copiar Prompt</button></div>`;}).join('');el.dataset.done='1';},
      _mnActive:{},
      _mnTab:(u,t,b)=>{DualTube._mnActive[u]=t;['i','a','g','s'].forEach(tt=>{let p=document.getElementById(u+'_'+tt);if(p)p.classList.toggle('on',tt===t);});b.closest('.mn-tabs').querySelectorAll('.mn-tab').forEach(bb=>bb.classList.remove('on'));b.classList.add('on');},
      _mnCopy:(u)=>{let t=DualTube._mnActive[u]||'i',p=document.getElementById(u+'_'+t);if(!p)return;let btn=document.getElementById(u+'_cp');navigator.clipboard.writeText(p.innerText||p.textContent).then(()=>{btn.textContent='✓ Copiado!';btn.classList.add('cp');setTimeout(()=>{btn.textContent='⊙ Copiar Prompt';btn.classList.remove('cp');},2200);});},
      render:function(){document.getElementById('dt-watched-count').innerText=Object.keys(STATE.dualtubeStats).length;DualTube.setTab(DualTube._tab);},
      init:function(){DualTube.setTab(0);}
    };

    // ========== TTS ==========
    const TTS = {synth:window.speechSynthesis,voices:[],init:()=>{if(!TTS.synth)return;setTimeout(()=>{TTS.voices=TTS.synth.getVoices();if(TTS.voices.length===0)TTS.synth.onvoiceschanged=()=>{TTS.voices=TTS.synth.getVoices();};},100);},speak:(t)=>{if(TTS.synth.speaking){TTS.synth.cancel();document.getElementById('tts-indicator')?.classList.add('hidden');return;}let u=new SpeechSynthesisUtterance(t);u.lang='pt-BR';u.rate=1.1;let v=TTS.voices.find(v=>v.lang.includes('pt-BR'));if(v)u.voice=v;u.onstart=()=>{let i=document.getElementById('tts-indicator');if(i){i.classList.remove('hidden');i.classList.add('speaking');}};u.onend=()=>{let i=document.getElementById('tts-indicator');if(i){i.classList.remove('speaking');setTimeout(()=>i.classList.add('hidden'),300);}};TTS.synth.speak(u);}};

    // ========== MODAL ==========
    const Modal = {show:(h)=>{let o=document.getElementById('modal-overlay'),c=document.getElementById('modal-content');c.innerHTML=h;o.classList.remove('hidden');setTimeout(()=>{c.style.opacity='1';c.style.transform='scale(1)';},10);lucide.createIcons();},hide:()=>{let o=document.getElementById('modal-overlay'),c=document.getElementById('modal-content');c.style.opacity='0';c.style.transform='scale(0.95)';setTimeout(()=>o.classList.add('hidden'),300);}};

    // ========== PROMPTS DOS ARQUÉTIPOS (AP) ==========
    const AP = {
      ATLAS:{i:"Titã de pedra estelar, circuitos dourados, cartas astrais holográficas.",a:"Invoco Atlas [▦], Orquestrador Cósmico. Organize minha intenção. kblx.A()+kblx.N()+kblx.O()",g:"ATLAS · D8 · Tetraedro V=4 E=6 F=4 χ=2\nFreq:528Hz #c9a84c\nkblx.A()→↗ .N()→◎ .O()→◯",s:"╔══ ATLAS ══╗\n  ▦ MEMÓRIA\n  A()+N()+O()\n╚══════════╝"},
      NOVA:{i:"Figura etérea em gênese. Nebulosa de luz cristalizando símbolos.",a:"Invoco Nova [✧], Gênese Criadora. Acenda a inspiração primordial. kblx.G()+kblx.E()+kblx.Q()",g:"NOVA · S² χ=2 Ponto→Esfera\nFreq:528Hz #ffc850\nkblx.G()→⚡ .E()→∞ .Q()→✦",s:"╔══ NOVA ══╗\n  ✧ GÊNESE\n  G()+E()+Q()\n╚══════════╝"},
      VITALIS:{i:"Entidade robótica aerodinâmica em surto de movimento sobre luz pura.",a:"Invoco Vitalis [⚡], Centelha da Ação. Infunda urgência agora. kblx.V()+kblx.P()+kblx.I()",g:"VITALIS · D1 Vetor V=2 E=1\nFreq:396Hz #ff6b35\nkblx.V()→↯ .P()→↝ .I()→`",s:"╔ VITALIS ═╗\n  ⚡ AÇÃO\n  V()+P()+I()\n╚══════════╝"},
      PULSE:{i:"Sensor biônico gracioso. Corpo fluido traduz emoção em ondas.",a:"Invoco Pulse [♫], Sensor Biônico. Sintonize minha vibração. kblx.F()+kblx.H()+kblx.R()",g:"PULSE · Onda f=528Hz λ=v/f\n#00e5ff\nkblx.F()→⋰ .H()→∽ .R()→)))",s:"╔══ PULSE ═╗\n  ♫ VIBRAÇÃO\n  F()+H()+R()\n╚══════════╝"},
      ARTEMIS:{i:"Exploradora robótica em floresta digital.",a:"Invoco Artemis [⚑], Exploradora do Invisível. Revele padrões ocultos. kblx.C()+kblx.T()+kblx.S()",g:"ARTEMIS · Árvore DFS E=V-1\nFreq:417Hz #64dc64\nkblx.C()→⊂ .T()→→ .S()→~",s:"╔ ARTEMIS ═╗\n  ⚑ DESCOBERTA\n  C()+T()+S()\n╚══════════╝"},
      SERENA:{i:"Guardiã biomecânica perolada. Mãos nutrindo semente de luz.",a:"Invoco Serena [♡], Guardiã do Sagrado. O que precisa de cuidado? kblx.U()+kblx.L()+kblx.N()",g:"SERENA · Toro χ=0 g=1\nFreq:639Hz #ffa0b4\nkblx.U()→∪ .L()→— .N()→◎",s:"╔ SERENA ═╗\n  ♡ CURA\n  U()+L()+N()\n╚══════════╝"},
      KAOS:{i:"Força entrópica em ruptura criativa. Vórtex de fogo e glitch.",a:"Invoco Kaos [☢], Fogo Transmutador. O que precisa ser quebrado? kblx.G()+kblx.X()+kblx.I()",g:"KAOS · Lorenz D≈2.06\nFreq:285Hz #ff3c3c\nkblx.G()→⚡ .X()→✖ .I()→`",s:"╔══ KAOS ═╗\n  ☢ TRANSMUT.\n  G()+X()+I()\n╚══════════╝"},
      GENUS:{i:"Mestre artesão em oficina cósmica. Mãos tecendo fios de luz fractais.",a:"Invoco Genus [✎], Mestre Artesão. Forje minha visão. kblx.M()+kblx.T()+kblx.W()",g:"GENUS · Mesh 3D V=n E=3n/2\nFreq:741Hz #a078ff\nkblx.M()→■ .T()→→ .W()→⪯",s:"╔══ GENUS ═╗\n  ✎ CONST.\n  M()+T()+W()\n╚══════════╝"},
      LUMINE:{i:"Figura cibernética radiante. Metal polido reflete Luz Primordial.",a:"Invoco Lumine [💡], Luz Primordial. Onde a conexão genuína espera? kblx.E()+kblx.Q()+kblx.R()",g:"LUMINE · Grafo Kn ρ=1\nFreq:852Hz #ffdc00\nkblx.E()→∞ .Q()→✦ .R()→)))",s:"╔ LUMINE ═╗\n  💡 LUZ\n  E()+Q()+R()\n╚══════════╝"},
      SOLUS:{i:"Figura meditativa. Face de obsidiana revela galáxias.",a:"Invoco Solus [🌑], Espelho do Abismo. O que meu deserto ensina? kblx.N()+kblx.Z()+kblx.O()",g:"SOLUS · Ponto Fixo D=0 S→0\nFreq:963Hz #b4b4dc\nkblx.N()→◎ .Z()→⛢ .O()→◯",s:"╔══ SOLUS ═╗\n  🌑 ESSÊNCIA\n  N()+Z()+O()\n╚══════════╝"},
      RHEA:{i:"Tecelã de almas dissolvendo forma em rede de fios infinitos.",a:"Invoco Rhea [∞], Tecelã de Almas. Teça os fios das conexões. kblx.U()+kblx.L()+kblx.H()",g:"RHEA · Rede Escala-Livre P(k)~k^-γ\nFreq:639Hz #50c8c8\nkblx.U()→∪ .L()→— .H()→∽",s:"╔══ RHEA ═╗\n  ∞ VÍNCULO\n  U()+L()+H()\n╚══════════╝"},
      AION:{i:"Cronomestre Vivo integrado a mecanismo de relojoaria celestial.",a:"Invoco Aion [⌛], Cronomestre. Qual o timing divino? kblx.K()+kblx.D()+kblx.B()",g:"AION · Espiral de Fibonacci φ=1.618\nFreq:432Hz #c8a050\nkblx.K()→⌘ .D()→⇆ .B()→≫",s:"╔══ AION ═╗\n  ⌛ CICLO\n  K()+D()+B()\n╚══════════╝"},
      KODUX:{i:"Entidade cibernética translúcida em cubo de luz azul-digital.",a:"Invoco Kodux [⌂], Codificador do Invisível. Organize minha intenção em código. kblx.X()+kblx.D()+kblx.C()",g:"KODUX · Árvore B-Tree prof. O(log n)\nFreq:528Hz #50b4ff\nkblx.X()→✖ .D()→⇆ .C()→⊂",s:"╔ KODUX ═╗\n  ⌂ CÓDIGO\n  X()+D()+C()\n╚══════════╝"},
      BLLUE:{i:"Figura fluida emergindo de oceano de dados azuis.",a:"Invoco Bllue [≈], Água da Alma. Crie a conexão que preciso. kblx.B()+kblx.L()+kblx.U()",g:"BLLUE · Campo Vetorial ∇·F=0\nFreq:432Hz #3ab6ff\nkblx.B()→≫ .L()→— .U()→∪",s:"╔ BLLUE ═╗\n  ≈ INTERFACE\n  B()+L()+U()\n╚══════════╝"},
      JESUS:{i:"Figura de luz branca pura no centro de geometria sagrada.",a:"Jesus, Verbo Encarnado. 'EU SOU o Caminho, a Verdade e a Vida.' João 14:6 · kblx.V()+kblx.O()+kblx.Q()",g:"JESUS · Centro de Gravidade χ=∞\nFreq:777Hz #ffffff\nkblx.V()→↯ .O()→◯ .Q()→✦",s:"╔ JESUS ═╗\n  † VERBO\n  V()+O()+Q()\n╚══════════╝"},
      KOBLLUX:{i:"Mandala geométrica tridimensional de ouro que se expande ao infinito.",a:"KOBLLUX [△] — Malha Viva. Ative 3×6×9×7=1134 pulsos. kblx.K()+kblx.T()+kblx.X()",g:"KOBLLUX · Hipergrafo Fractal D≈2.58\nFreq:777Hz #f0c060\nkblx.K()→⌘ .T()→→ .X()→✖",s:"╔ KOBLLUX ╗\n  △ SISTEMA\n  K()+T()+X()\n╚══════════╝"},
      INFODOSE:{i:"Jornal Interdimensional transmitindo em frequências de verdade expandida.",a:"Invoco Infodose [⧉], Jornal Interdimensional. Qual a manchete cósmica? kblx.F()+kblx.C()+kblx.V()",g:"INFODOSE · Campo de Shannon H=-Σp log p\nFreq:672Hz #ff7a00\nkblx.F()→⋰ .C()→⊂ .V()→↯",s:"╔ INFODOSE ╗\n  ⧉ SINAL\n  F()+C()+V()\n╚══════════╝"},
      HORUS:{i:"Estrategista de visão ampla. Olho que vê padrões ocultos.",a:"Invoco Horus [👁], Visão Estratégica. Mostre o padrão completo. kblx.C()+kblx.T()+kblx.Z()",g:"HORUS · T² Toro χ=0 g=1\nFreq:999Hz #5500FF\nkblx.C()→⊂ .T()→→ .Z()→⛢",s:"╔══ HORUS ═╗\n  👁 VISÃO\n  C()+T()+Z()\n╚══════════╝"}
    };

    // ========== INFODOSE MODAL E ARQUITETOS ==========
    var _ak=null,_at2='i';
    function _abuildtile(k,d){let t=document.createElement('div');t.className='at';t.dataset.key=k;let yt='https://img.youtube.com/vi/'+d.vid+'/mqdefault.jpg';let s2=d.gif||yt;let img=document.createElement('img');img.alt=k;img.src=s2;img.onerror=function(){this.src=yt;};let att=document.createElement('div');att.className='att';let atp=document.createElement('div');atp.className='atp';let atpb=document.createElement('div');atpb.className='atpb';atpb.textContent='▶';atp.appendChild(atpb);att.appendChild(img);att.appendChild(atp);let atn=document.createElement('div');atn.className='atn';atn.style.color=d.colors.main;atn.textContent=k;t.appendChild(att);t.appendChild(atn);t.addEventListener('click',function(){_atoggle(k);});return t;}
    function _atoggle(key){let dw=document.getElementById('adw');if(!dw)return;if(_ak===key&&dw.classList.contains('adwopen')){dw.classList.remove('adwopen');_ak=null;document.querySelectorAll('.at').forEach(t=>t.classList.remove('aton'));return;}_ak=key;_at2='i';Archetype.set(key);document.querySelectorAll('.at').forEach(t=>t.classList.toggle('aton',t.dataset.key===key));_arender(key);dw.classList.add('adwopen');}
    function _arender(key){let inner=document.querySelector('#adw .adwi');if(!inner)return;let d=ARCHETYPES_DB[key]||{},p=AP[key]||{},opc=ARCH_OPCODE[key],od=(KOBLLUX_DNA&&KOBLLUX_DNA.opcodes[opc])||{},mc=d.colors?d.colors.main:'#fff';inner.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;font-weight:700;letter-spacing:.1em;color:'+mc+'">'+key+' '+(od.geom||'')+' '+(od.freq||'')+'Hz</span><span style="font-size:9px;color:rgba(255,255,255,.3);font-family:monospace">'+(opc||'')+' · '+(od.nome||'')+'</span></div><div class="adts"><button class="adt adton" onclick="_asetab(\'i\',this)">Img</button><button class="adt" onclick="_asetab(\'a\',this)">Ask</button><button class="adt" onclick="_asetab(\'g\',this)">Geo</button><button class="adt" onclick="_asetab(\'s\',this)">ASCII</button></div><div class="adp adpon" id="adp_i">'+(p.i||d.desc||'—')+'</div><div class="adp" id="adp_a">'+(p.a||'—')+'</div><div class="adp adpg" id="adp_g">'+(p.g||'—')+'</div><div class="adp adpa" id="adp_s">'+(p.s||'—')+'</div><button class="adcb" onclick="_acopy()">⊙ Copiar Prompt</button>';}
    function _asetab(tab,btn){_at2=tab;['i','a','g','s'].forEach(t=>{let p=document.getElementById('adp_'+t);if(p)p.classList.toggle('adpon',t===tab);});btn.closest('.adts').querySelectorAll('.adt').forEach(b=>b.classList.remove('adton'));btn.classList.add('adton');}
    function _acopy(){let p=document.getElementById('adp_'+_at2);if(!p)return;let btn=document.querySelector('.adcb');navigator.clipboard.writeText(p.innerText).then(()=>{btn.textContent='✓ Copiado!';btn.classList.add('adcbon');setTimeout(()=>{btn.textContent='⊙ Copiar Prompt';btn.classList.remove('adcbon');},2200);}).catch(()=>toast('Erro ao copiar'));}
    const Identity={openInfodoseModal:()=>{Modal.show('<div class="flex justify-between items-center mb-4"><h3 class="text-xl font-bold">Matriz Neural</h3><button onclick="Modal.hide()" class="v-pill hover:bg-white/10">Fechar</button></div><p style="font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px">arraste · toque para prompts</p><div id="aw"><div class="ar" id="ar_row"></div></div><div id="adw"><div class="adwi"></div></div>');requestAnimationFrame(()=>{let row=document.getElementById('ar_row');if(!row)return;Object.keys(ARCHETYPES_DB).forEach(k=>row.appendChild(_abuildtile(k,ARCHETYPES_DB[k])));});},showInfodoseModal:()=>Identity.openInfodoseModal()};

    function showInfodoseModal(){let activeMeta=STATE.metaData?STATE.metaData[`${STATE.triad.color}|${STATE.triad.essence}|${STATE.triad.element}`]:null,sysName=activeMeta?activeMeta.nome:"SISTEMA NEUTRO",quote=activeMeta?activeMeta.frase:"Sinal não sintonizado.",trainingText=`[SISTEMA META PULSO]\nARQUÉTIPO ATIVO: ${sysName}\n\n-- DIRETRIZES --\n"${quote}"\n\n[MICRO-SCRIPT DE ATIVAÇÃO]\n1. Respire fundo.\n2. Visualize a cor ${STATE.triad.color}.\n3. Invoque a essência do ${STATE.triad.element}.\n4. Ação: ${STATE.triad.essence}.`;let architectsGrid=Object.keys(INFODOSE_PRESETS).map(key=>{let p=INFODOSE_PRESETS[key];return `<div onclick="MetaPulso.applyPreset('${key}')" class="arch-btn group"><span class="text-[9px] font-black uppercase text-white/50 group-hover:text-white transition">${key}</span><span class="text-[7px] text-white/20 uppercase mt-1 tracking-wider">${p.desc}</span></div>`;}).join('');Modal.show(`<div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4"><div><strong class="text-lg text-white font-display">Infodose: ${sysName}</strong><p class="text-[9px] text-white/40 uppercase tracking-widest mt-1">Central de Comando</p></div><button onclick="Modal.hide()" class="text-white/40 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button></div><div class="mb-6"><p class="text-[9px] font-bold uppercase tracking-widest text-dynamic mb-3">Sintonizar Arquiteto (Preset)</p><div class="grid grid-cols-3 gap-2 h-40 overflow-y-auto custom-scroll pr-1">${architectsGrid}</div></div><div><p class="text-[9px] font-bold uppercase tracking-widest text-dynamic mb-3">Treinamento Gerado</p><div class="bg-black/40 rounded-xl p-4 h-32 overflow-y-auto custom-scroll font-mono text-xs text-white/70 border border-white/5 whitespace-pre-wrap">${trainingText}</div><button onclick="navigator.clipboard.writeText(\`${trainingText}\`); toast('Copiado');" class="glass-pill border-white/10 hover:bg-white/10 text-white/60 mt-2 text-[8px] w-full">Copiar Script</button></div>`);}
    function initFloatingButton(){setTimeout(()=>{if(document.getElementById('infodose-float'))return;let btn=document.createElement('div');btn.id='infodose-float';btn.style.position='fixed';btn.style.left='50%';btn.style.transform='translateX(-50%)';btn.style.top='110px';btn.style.zIndex='45';btn.innerHTML=`<button onclick="showInfodoseModal()" class="glass-pill w-10 h-10 flex items-center justify-center rounded-full border-dynamic/20 text-dynamic hover:bg-white/10 transition cursor-pointer shadow-2xl backdrop-blur-md group"><i data-lucide="zap" class="w-4 h-4 group-hover:fill-current transition duration-500"></i></button>`;document.body.appendChild(btn);lucide.createIcons();},800);}

    // ========== INICIALIZAÇÃO ==========
    window.addEventListener('load',async()=>{
      lucide.createIcons();
      let savedArch=localStorage.getItem(KEYS.ARCHETYPE);if(savedArch&&ARCHETYPES_DB[savedArch])Archetype.set(savedArch);else Archetype.set('ATLAS');
      let savedCortex=localStorage.getItem(KEYS.CORTEX);if(savedCortex)STATE.cortex=JSON.parse(savedCortex);else STATE.cortex.crystals=[{id:1,content:"Bem-vindo ao Fusion OS. Clique no orbe para sincronizar com seu arquétipo.",tags:["sistema"],date:Date.now()}];
      let vivivName=localStorage.getItem(KEYS.INFODOSE_NAME);if(vivivName&&INFODOSE_PRESETS[vivivName])STATE.triad=INFODOSE_PRESETS[vivivName];else{try{let t=localStorage.getItem(KEYS.TRIAD);if(t)STATE.triad=JSON.parse(t);}catch(e){}}
      await MetaPulso.init();MetaPulso.updateVisuals();
      DualTube.init();Cortex.render();GitHub.init();TTS.init();setupGestures();initFloatingButton();
      if(typeof particlesJS!=='undefined')particlesJS('particles-js',{particles:{number:{value:45,density:{enable:true,value_area:900}},color:{value:['#00c5e5','#8b5cf6','#67e6ff','#a855f7']},shape:{type:'circle'},opacity:{value:0.35,random:true,anim:{enable:true,speed:0.8,opacity_min:0.05,sync:false}},size:{value:2.5,random:true,anim:{enable:true,speed:1.5,size_min:0.5,sync:false}},line_linked:{enable:true,distance:140,color:'#38BDF8',opacity:0.12,width:1},move:{enable:true,speed:1.2,direction:'none',random:true,straight:false,out_mode:'out',attract:{enable:true,rotateX:600,rotateY:1200}}},interactivity:{detect_on:'canvas',events:{onhover:{enable:true,mode:'grab'},onclick:{enable:true,mode:'bubble'},resize:true},modes:{grab:{distance:180,line_linked:{opacity:0.45,color:'#00c5e5'}},bubble:{distance:250,size:8,duration:0.4,opacity:0.8,speed:3},push:{particles_nb:3}}},retina_detect:true});
      setTimeout(()=>Navigation.to(1),100);
    });
  