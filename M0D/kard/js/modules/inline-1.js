
    lucide.createIcons();

    const els = {
      card: document.getElementById('mainCard'),
      header: document.getElementById('cardHeader'),
      avatarTgt: document.getElementById('avatarTarget'),
      input: document.getElementById('inputUser'),
      lblHello: document.getElementById('lblHello'),
      lblName: document.getElementById('lblName'),
      clock: document.getElementById('clockTime'),
      triggerText: document.getElementById('triggerText'),
      triggerIcon: document.getElementById('triggerIcon'),
      modulesArea: document.getElementById('modulesArea'),
      cardBody: document.getElementById('cardBody'),
      smallPreview: document.getElementById('smallPreview'),
      smallMiniAvatar: document.getElementById('smallMiniAvatar'),
      smallText: document.getElementById('smallText'),
      smallIdent: document.getElementById('smallIdent'),
      activationToggle: document.getElementById('activationToggle'),
      activationCard: document.getElementById('activationCard'),
      actPre: document.getElementById('actPre'),
      actName: document.getElementById('actName'),
      actMiniAvatar: document.getElementById('actMiniAvatar'),
      actBadge: document.getElementById('actBadge'),
      copyActBtn: document.getElementById('copyActBtn'),
      downloadActBtn: document.getElementById('downloadActBtn')
    };

    function createAvatarSVG(id, size = 64){
      return `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" aria-hidden="true">
          <defs>
            <linearGradient id="g${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#00f2ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#bd00ff;stop-opacity:1" />
            </linearGradient>
            <filter id="f${id}"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#080b12" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <path d="M50 15 A35 35 0 0 1 85 50" stroke="url(#g${id})" stroke-width="4" fill="none" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite"/>
          </path>
          <path d="M50 85 A35 35 0 0 1 15 50" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5">
             <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="8s" repeatCount="indefinite"/>
          </path>
          <circle cx="50" cy="50" r="20" fill="url(#g${id})" filter="url(#f${id})" opacity="0.9"/>
        </svg>
      `;
    }
    els.avatarTgt.innerHTML = createAvatarSVG('B', 64);

    function hashString(str){
      let h = 2166136261 >>> 0;
      for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      return h >>> 0;
    }
    function seedToGradient(seed, id='s'){
      const h1 = seed % 360;
      const h2 = (seed * 37) % 360;
      return {id: `gSmall${id}`, svg: `<linearGradient id="gSmall${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${h1} 100% 55%)"/><stop offset="100%" stop-color="hsl(${h2} 90% 45%)"/></linearGradient>`};
    }
    function makeMiniAvatarHTML(name, size = 30){
      const seed = hashString(name || 'DUAL');
      const grad = seedToGradient(seed, seed.toString(36));
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>${grad.svg}</defs>
          <rect x="0" y="0" width="32" height="32" rx="6" fill="#071018" />
          <circle cx="16" cy="12" r="6" fill="url(#${grad.id})"/>
          <path d="M16 24 a8 4 0 0 1 8 -4" stroke="rgba(255,255,255,0.06)" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
      `;
    }

    function reduce369Short(name){
      if(!name || !name.trim()) return '--';
      const s = name.split('').reduce((acc,ch)=> acc + ch.charCodeAt(0), 0);
      let root = s;
      while(root > 9) root = String(root).split('').reduce((a,b)=>a+Number(b), 0);
      return root;
    }
    function createAsciiActivation(name){
      const displayName = name && name.trim() ? `${name.trim()}.Dual Infodose` : '(Convidado).Dual Infodose';
      const root = reduce369Short(name);
      const title = 'CÉREBRO-ORÁCULO — BASE v1';
      const content = `Ativar: ${displayName}`;
      const width = Math.max(title.length, content.length) + 4;
      const top = '+' + '-'.repeat(width) + '+';
      const midTitle = `| ${title.padEnd(width - 1)}|`;
      const top2 = '+' + '-'.repeat(width) + '+';
      const ascii = `${top}\n${midTitle}\n${top2}\n${content}\n`;
      return { ascii, displayName, root, title, content };
    }
    function updateActivationBlock(name){
      const r = createAsciiActivation(name);
      if(els.actPre) els.actPre.innerText = r.ascii;
      if(els.actName) els.actName.innerText = r.displayName;
      if(els.actMiniAvatar) els.actMiniAvatar.innerHTML = makeMiniAvatarHTML(name || 'DUAL', 36);
      if(els.actBadge){
        els.actBadge.innerText = `v:${r.root}`;
        els.actBadge.classList.remove('vibe-gold');
        if(r.root === 3 || r.root === 6 || r.root === 9) els.actBadge.classList.add('vibe-gold');
      }
    }
    function updateSmallPreviewFromName(name){
      const now = new Date();
      const PHRASES_24 = [
        "Ativar foco estável.","Sintonizar ritmo criativo.","Amplificar percepção sutil.","Conectar ao core de coesão.",
        "Iniciar limpeza cognitiva.","Engatar modo produtividade.","Equilibrar fluxo emocional.","Elevar nível de curiosidade.",
        "Refinar intenção principal.","Fortalecer memória ativa.","Sincronizar com ciclo terrestre.","Ativar shield de atenção.",
        "Optimizar caminhos de decisão.","Despertar intuição prática.","Atenuar ruídos internos.","Mapear prioridades do dia.",
        "Habilitar modo aprendizado.","Sintonizar voz interior clara.","Aumentar resiliência mental.","Abrir canal de insights.",
        "Energetizar campo criativo.","Ancorar objetivos curtos.","Preparar para execução suave.","Concluir com gratidão."
      ];
      const phrase = PHRASES_24[now.getHours() % 24];
      const miniText = (name && name.trim()) ? `${name.trim()} · ${phrase}` : `Ativação aparecerá aqui`;
      els.smallText.innerText = miniText;
      const root = reduce369Short(name);
      els.smallIdent.innerText = (name && name.trim()) ? `v:${root}` : '--';
      els.smallPreview.classList.remove('vibe-gold');
      if(root === 3 || root === 6 || root === 9) els.smallPreview.classList.add('vibe-gold');
      els.smallMiniAvatar.innerHTML = makeMiniAvatarHTML(name || 'DUAL', 30);
      updateActivationBlock(name || 'Convidado');
    }

    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(()=> {
        els.card.classList.add('active');
        els.avatarTgt.classList.add('shown');
        const saved = localStorage.getItem('fusion_user');
        if(saved){
          setUserName(saved);
          speak(`Bem-vindo de volta, ${saved}.`);
          updateSmallPreviewFromName(saved);
        } else {
          speak('Sistema Dual pronto.');
          updateSmallPreviewFromName('');
        }

        // bridge: if the modular script did not expose its handlers, keep fallbacks safe
        if (typeof window.toggleSection !== 'function') {
          window.toggleSection = function(id){
            const el = document.getElementById(id);
            if(!el) return;
            const hidden = el.classList.contains('activation-hidden');
            el.classList.toggle('activation-hidden');
            el.classList.toggle('activation-open');
            if(id === 'activationCard' && els.activationToggle){
              els.activationToggle.setAttribute('aria-expanded', String(hidden));
            }
          };
        }
        if (typeof window.setMode !== 'function') {
          window.setMode = function(mode){
            const map = {
              card: document.getElementById('btnModeCard'),
              orb: document.getElementById('btnModeOrb'),
              hud: document.getElementById('btnModeHud')
            };
            Object.values(map).forEach(b => b && b.classList.remove('active-mode'));
            if(map[mode]) map[mode].classList.add('active-mode');
          };
        }
      },120);
    });

    const morph = {
      closed: {
        width: '260px', padding: '14px 16px', borderRadius: '22px',
        boxShadow: '0 22px 70px rgba(0,0,0,0.75)', scale: 0.995
      },
      open: {
        width: '440px', padding: '30px 25px', borderRadius: '36px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)', scale: 1
      }
    };

    function toggleCard() {
      if(els.card.classList.contains('animating')) return;
      const isOpening = els.card.classList.contains('closed');
      els.card.classList.add('animating');

      const start = isOpening ? morph.closed : morph.open;
      const end = isOpening ? morph.open : morph.closed;

      if(isOpening) {
        els.card.classList.remove('closed');
        els.card.setAttribute('aria-expanded', 'true');
      } else {
        els.card.classList.remove('content-visible');
        if(els.card.classList.contains('open')) toggleDetails();
      }

      els.card.style.width = start.width;
      els.card.style.padding = start.padding;
      els.card.style.borderRadius = start.borderRadius;
      els.card.style.boxShadow = start.boxShadow;
      els.card.style.transform = `scale(${start.scale})`;

      const easing = isOpening ? 'cubic-bezier(0.34, 1.3, 0.64, 1)' : 'cubic-bezier(0.23, 1, 0.32, 1)';
      const duration = isOpening ? 600 : 450;

      const anim = els.card.animate([
        {
          width: start.width, padding: start.padding,
          borderRadius: start.borderRadius, boxShadow: start.boxShadow,
          transform: `scale(${start.scale})`
        },
        {
          width: end.width, padding: end.padding,
          borderRadius: end.borderRadius, boxShadow: end.boxShadow,
          transform: `scale(${end.scale})`
        }
      ], { duration, easing, fill: 'forwards' });

      anim.onfinish = () => {
        els.card.classList.remove('animating');
        els.card.style = '';
        if(isOpening) {
          els.card.classList.add('content-visible');
          els.input.focus();
        } else {
          els.card.classList.add('closed');
          els.card.setAttribute('aria-expanded', 'false');
        }
      };
    }

    els.header.addEventListener('click', toggleCard);
    els.header.addEventListener('keydown', (e)=> { if(e.key === 'Enter'||e.key===' ') {e.preventDefault(); toggleCard();} });

    els.smallPreview.addEventListener('click', (e) => {
      if(els.card.classList.contains('closed')) {
        toggleCard();
        setTimeout(()=> els.input.focus(), 500);
      } else {
        els.input.focus();
      }
    });

    els.input.addEventListener('input', (e)=>{
      const v = e.target.value;
      if(v){ els.lblHello.innerText = 'Oi,'; els.lblName.innerText = v; }
      else { els.lblHello.innerText = 'Sistema'; els.lblName.innerText = 'Convidado'; }
      updateSmallPreviewFromName(v);
    });
    els.input.addEventListener('blur', (e)=>{
      const v = e.target.value.trim();
      if(v){
        localStorage.setItem('fusion_user', v);
        speak(`Usuário ${v} confirmado.`);
        updateSmallPreviewFromName(v);
      }
    });
    els.input.addEventListener('keydown', (e)=> { if(e.key === 'Enter') e.target.blur(); });

    function setUserName(name){
      els.input.value = name; els.lblHello.innerText = 'Oi,'; els.lblName.innerText = name;
      updateSmallPreviewFromName(name);
    }

    function toggleDetails(){
      els.card.classList.toggle('open');
      const isOpen = els.card.classList.contains('open');
      els.triggerText.innerText = isOpen ? 'FECHAR MÓDULOS' : 'ABRIR MÓDULOS';
      els.triggerIcon.setAttribute('data-lucide', isOpen ? 'chevron-up' : 'chevron-down');
      if(isOpen) speak('Carregando módulos.');
      lucide.createIcons();
    }

    function updateMetrics(){
      const now = new Date();
      els.clock.innerText = now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const pct = Math.min(100, Math.max(0, ((now.getHours() + now.getMinutes()/60) / 24) * 100));
      const fill = document.getElementById('cycleFill');
      if(fill) fill.style.width = `${pct}%`;
      const cyclePercent = document.getElementById('cyclePercent');
      if(cyclePercent) cyclePercent.innerText = `${Math.floor(pct)}%`;
    }

    function speak(text){
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      if(!text) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR'; u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }

    setInterval(updateMetrics,1000); updateMetrics();

    if(els.activationToggle){
      els.activationToggle.addEventListener('click', toggleActivation);
      els.activationToggle.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleActivation(); } });
    }
    function toggleActivation(){
      if(!els.activationCard) return;
      const wasHidden = els.activationCard.classList.contains('activation-hidden');
      els.activationCard.classList.toggle('activation-hidden');
      els.activationCard.classList.toggle('activation-open');
      els.activationToggle.setAttribute('aria-expanded', String(wasHidden));
      if(wasHidden){
        const text = els.actPre ? els.actPre.innerText.replace(/\n/g,' ') : 'Ativação aberta';
        speak(text);
      }
    }

    function copyToClipboard(text){
      if(navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return Promise.resolve();
    }

    if(els.copyActBtn){
      els.copyActBtn.addEventListener('click', ()=>{
        if(!els.actPre) return;
        copyToClipboard(els.actPre.innerText).then(()=> showToaster('Ativação copiada'));
      });
    }

    if(els.downloadActBtn){
      els.downloadActBtn.addEventListener('click', async ()=>{
        if(!els.activationCard) return;
        const el = els.activationCard;
        const prevHidden = el.classList.contains('activation-hidden');
        if(prevHidden){ el.classList.remove('activation-hidden'); el.classList.add('activation-open'); }
        try {
          const canvas = await html2canvas(el, {backgroundColor:null, scale:2});
          const a = document.createElement('a');
          a.download = `activation-${(new Date()).toISOString().replace(/[:.]/g,'')}.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        } catch(e){
          console.error(e);
          showToaster('Erro exportando PNG');
        }
        if(prevHidden){ el.classList.add('activation-hidden'); el.classList.remove('activation-open'); }
      });
    }

    const toasterWrap = (() => {
      let w = document.getElementById('toasterWrap');
      if(!w){
        w = document.createElement('div');
        w.id = 'toasterWrap';
        w.className = 'toaster-wrap';
        document.body.appendChild(w);
      }
      return w;
    })();
    function showToaster(text, ms = 3000){
      const node = document.createElement('div');
      node.className = 'toaster';
      node.innerText = text + ' — (toaster: implementação futura)';
      toasterWrap.appendChild(node);
      requestAnimationFrame(()=> node.classList.add('show'));
      setTimeout(()=>{ node.classList.remove('show'); setTimeout(()=> node.remove(),300); }, ms);
    }

    (function bootstrapActivation(){
      const initial = localStorage.getItem('fusion_user') || '';
      updateActivationBlock(initial || 'Convidado');
    })();
  