// Toast provisório para feedback visual
    window.toast = (msg) => {
      const t = document.createElement('div');
      t.textContent = msg;
      t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 16px;border-radius:8px;z-index:10000;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    };

    (()=>{ 
      if(window.__KOB_TTS_V32_ACTIVE) return; 
      window.__KOB_TTS_V32_ACTIVE = true;

      /* ---------- Constantes & Preferências ---------- */
      const POS_KEY  = 'kob_tts_pos_standalone';
      const PREF_KEY = 'kob_tts_prefs_standalone';
      const ROOTS    = ['#root', 'body'];
      const BLOCK_SEL= ['h1','h2','h3','h4','h5','h6','p','li','blockquote','.callout','.equation','pre','td','th'].join(',');

      const PREFS = Object.assign({
        outline: true,
        asciiMode: 'describe',
        clickToSpeak: true,
        preferMale: false
      }, readPrefs());

      const $  = (q, r=document)=> r.querySelector(q);
      const $$ = (q, r=document)=> [...r.querySelectorAll(q)];
      const setCSS = (v,val)=> document.documentElement.style.setProperty(v,val);
      const getRoot= ()=> { for(const s of ROOTS){ const el=document.querySelector(s); if(el) return el; } return document.body; };

      /* ---------- Criação Dinâmica do Dock    <button id="tts-prev"    title="Anterior">◀</button>
          
          <button id="tts-on"      title="Voz On/Off" aria-pressed="false">🔊</button>
            <button id="tts-next"    title="Próximo">▶</button>
          <button id="tts-sel"     title="Ler seleção">✂︎</button>

          <button id="tts-reread"  title="Re-Ler do início">⟳</button>
          <button id="tts-voice"   title="Trocar Voz PT-BR">🎙</button>
---------- */
      
        const dock = document.querySelector('.kob-tts-dock') || (()=> {
        const d = document.createElement('div');
        d.className = 'kob-tts-dock';
        d.innerHTML = `

       <div class="symbol-bar floating" id="symbolBar">
    
    <!-- Botão Menu -->
    <div class="toggle-wrap">
      <button class="symbol-button main-toggle" id="toggleBtn" title="Menu / Iniciar">≡</button>
    </div>

    <!-- Controles de Navegação de Leitura -->
    <div class="symbol-wrap">
      <button class="symbol-button" id="btn-prev" title="Voltar Bloco">◀</button>
    </div>

<div class="wrap">
  <div class="content">
    <iframe id="frame" src="about:blank"></iframe>
    <div id="kob-tts-outline"></div>
  </div>

  <!-- HUD Inteligente -->
  <div class="symbol-bar floating" id="symbolBar">
    
    <!-- Botão Menu -->
    <div class="toggle-wrap">
      <button class="symbol-button main-toggle" id="toggleBtn" title="Menu / Iniciar">≡</button>
    </div>

    <!-- Controles de Navegação de Leitura -->
    <div class="symbol-wrap">
      <button class="symbol-button" id="btn-prev" title="Voltar Bloco">◀</button>
    </div>
    <div class="symbol-wrap">
      <button class="symbol-button" id="btn-play" title="Play/Pause">▶</button>
    </div>
    <div class="symbol-wrap">
      <button class="symbol-button" id="btn-next" title="Próximo Bloco">▶▶</button>

<div class="symbol-wrap">
      <button class="symbol-button" id="tts-stop"title="Parar">■</button>
    </div>

<div class="symbol-wrap">
      <button class="symbol-button" id="tts-grid"title="Outline / Click-to-Speak">⌗</button>
    </div>

<div class="symbol-wrap">
      <button class="symbol-button" id="tts-reset"   title="Reset + próxima seção">↻</button>
    </div>

    <!-- Troca de Arquétipo com ORB integrado (Sempre visível) -->
    <button class="symbol-button" id="btn-arch" title="Trocar Arquétipo de Voz">
      <div class="orb-microphone-container">
        <div class="tts-orb-mini">
          <div class="orb" id="main-orb">
            <div class="orb-core"></div>
          </div>
        </div>
<!--
        <div class="voice-indicator" id="voiceIndicator"></div> -->

      </div>
    </button>

    <!-- Outros atalhos -->
    <div class="symbol-wrap">
      <button class="symbol-button" data-id="phi" data-url="https://kodux78k.github.io/oiDual--Y-/M0D/78F/">Φ</button>
    </div>
    <div class="symbol-wrap">
      <button class="symbol-button" data-id="viv" data-url="https://kodux78k.github.io/oiDual--Y-/M0D/78FFD/">꩜</button>
    </div>
    <div class="symbol-wrap">
      <button class="symbol-button" data-id="home" data-url="https://kodux78k.github.io/oiDual-idHome/">◌</button>
    </div>
    <div class="symbol-wrap">
      <button class="symbol-button" data-id="doc" data-url="https://kodux78k.github.io/info-Doc/index.html">◘</button>
    </div>

        <div class="symbol-wrap">

          <div class="drawer-toggle" onclick="toggleDrawer()" title="Abrir Engine de Background">🎛️</div>
        </div>
      </div>

    <div class="hud-info" id="hudStatus">KOBLLUX · ORB NEXUS</div>
  </div>
</div>
       <div id="arch-overlay"></div>
         

          

         
        `;
        document.body.appendChild(d);
        return d;
      })();

      const outline = document.getElementById('kob-tts-outline') || (()=> {
        const o = document.createElement('div');
        o.id='kob-tts-outline';
        document.body.appendChild(o);
        return o;
      })();

      /* ---------- Drag e Posição ---------- */
      applySavedPos();
      (()=>{ 
        let sx=0,sy=0,sl=0,sb=0,drag=false;
        const onDown=(ev)=>{ 
          // Evita arrastar se clicou em botão
          if(ev.target.tagName === 'BUTTON') return;
          const e=ev.touches?ev.touches[0]:ev; drag=true; dock.classList.add('is-drag'); sx=e.clientX; sy=e.clientY;
          const cs=getComputedStyle(document.documentElement);
          sl=parseFloat(cs.getPropertyValue('--tts-left'))||16;
          sb=parseFloat(cs.getPropertyValue('--tts-bottom'))||20;
          addEventListener('pointermove',onMove,{passive:false});
          addEventListener('pointerup',onUp,{passive:false});
          addEventListener('touchmove',onMove,{passive:false});
          addEventListener('touchend',onUp,{passive:false});
        };
        const onMove=(ev)=>{ 
          if(!drag) return; const e=ev.touches?ev.touches[0]:ev;
          const dx=e.clientX-sx, dy=e.clientY-sy;
          setCSS('--tts-left',   Math.max(0, sl+dx)+'px');
          setCSS('--tts-bottom', Math.max(0, sb-dy)+'px');
        };
        const onUp=()=>{ if(!drag) return; drag=false; dock.classList.remove('is-drag'); savePos(); };
        dock.addEventListener('pointerdown',onDown); dock.addEventListener('touchstart',onDown);
      })();

      /* ---------- Speech & Vozes ---------- */
      const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
      if(!synth){ console.warn('[TTS] SpeechSynthesis indisponível'); return; }
      try{ synth.cancel(); }catch{}

      let VOICES=[], baseVoice=null, voiceIdx=0;

      function loadVoices(){
        VOICES = synth.getVoices()||[];
        const pt = VOICES.filter(v=>/pt/i.test(v.lang));
        baseVoice = pt[0] || VOICES[0] || null;
        voiceIdx = 0;
      }
      synth.onvoiceschanged = ()=> loadVoices();
      loadVoices();

      function cycleVoice(){
        const pt = VOICES.filter(v=>/pt/i.test(v.lang));
        if(!pt.length) return;
        voiceIdx = (voiceIdx+1) % pt.length;
        baseVoice = pt[voiceIdx];
        setStatus(`Voz: ${baseVoice.name||baseVoice.lang}`);
      }

      /* ---------- Estado e Limpeza ---------- */
      let blocks=[], idx=0, speaking=false;

      function setPressed(btn,on){ btn?.setAttribute('aria-pressed', on?'true':'false'); }
      function setStatus(t){ const el=$('#tts-status',dock); if(!el) return; el.textContent=String(t); }
      function setStatusProgress(){ 
        const el=$('#tts-status',dock); if(!el) return;
        if(!blocks.length){ el.textContent='0/0'; return; }
        el.textContent = `${Math.min(idx+1,blocks.length)}/${blocks.length}`;
      }

      function sanitize(txt){
        let s = String(txt||'').replace(/\bCopiar\b/g, ' ').replace(/\s{2,}/g,' ').trim();
        return s;
      }

      function rebuild(){
        const root = getRoot();
        const nodes = $$(BLOCK_SEL, root);
        const out=[];
        for(const node of nodes){
          let raw = node.innerText.trim();
          if(!raw) continue;
          out.push({ node, raw });
        }
        blocks = out; idx = 0;
        setStatus(blocks.length ? `${blocks.length}/${blocks.length}` : '0/0');
      }

      /* ---------- Outline ---------- */
      function hideOutline(){ outline.style.display='none'; }
      function showOutlineFor(node){
        if(!PREFS.outline || !node) return hideOutline();
        const r=node.getBoundingClientRect();
        outline.style.display='block';
        outline.style.left  =(scrollX+r.left-6)+'px';
        outline.style.top   =(scrollY+r.top -6)+'px';
        outline.style.width =(r.width+12)+'px';
        outline.style.height=(r.height+12)+'px';
      }
      function highlight(){
        $$('[data-tts-current]').forEach(el=>el.removeAttribute('data-tts-current'));
        const b=blocks[idx]; if(!b) return;
        b.node.setAttribute('data-tts-current','true');
        try{ b.node.scrollIntoView({behavior:'smooth', block:'center'});}catch{}
        showOutlineFor(b.node);
      }
      addEventListener('scroll', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); }, {passive:true});
      addEventListener('resize', ()=>{ const b=blocks[idx]; if(PREFS.outline && b) showOutlineFor(b.node); });

      /* ---------- Speak ---------- */
      function speakCurrent(){
        if(!blocks.length) rebuild();
        if(idx<0) idx=0;
        if(idx>=blocks.length){ stop(); window.toast('Fim da leitura.'); return; }

        const b = blocks[idx];
        const text = sanitize(b.raw);
        if(!text){ idx++; setStatusProgress(); return speakCurrent(); }

        try{ synth.cancel(); }catch{}
        const u = new SpeechSynthesisUtterance(text);
        if(baseVoice) u.voice = baseVoice;
        u.lang = (baseVoice && baseVoice.lang) || 'pt-BR';
        u.rate = 1.0; u.pitch = 1.0; u.volume = 1;

        u.onend   = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };
        u.onerror = ()=>{ if(!speaking) return; idx++; setStatusProgress(); speakCurrent(); };

        highlight();
        setStatusProgress();
        synth.speak(u);
      }

      function play(){ speaking=true; setPressed($('#tts-on',dock),true); if(!blocks.length) rebuild(); speakCurrent(); }
      function stop(){ speaking=false; try{ synth.cancel(); }catch{} setPressed($('#tts-on',dock),false); setStatus(blocks.length?`${Math.min(idx+1,blocks.length)}/${blocks.length}`:'Pausado.'); hideOutline(); }
      function toggle(){ speaking ? stop() : play(); }
      function next(){ if(!blocks.length) rebuild(); speaking=true; setPressed($('#tts-on',dock),true); idx++; setStatusProgress(); speakCurrent(); }
      function prev(){ if(!blocks.length) rebuild(); speaking=true; setPressed($('#tts-on',dock),true); idx=Math.max(0,idx-1); setStatusProgress(); speakCurrent(); }

      /* ---------- Botões do Dock ---------- */
      $('#tts-on',dock)?.addEventListener('click', e=>{ e.preventDefault(); toggle(); });
      $('#tts-prev',dock)?.addEventListener('click', e=>{ e.preventDefault(); prev(); });
      $('#tts-next',dock)?.addEventListener('click', e=>{ e.preventDefault(); next(); });
      $('#tts-stop',dock)?.addEventListener('click', e=>{ e.preventDefault(); stop(); });
      
      $('#tts-reread',dock)?.addEventListener('click', e=>{ 
        e.preventDefault(); stop(); rebuild(); idx=0; play(); 
      });
      $('#tts-reset',dock)?.addEventListener('click', e=>{ 
        e.preventDefault(); stop(); rebuild(); idx=0; setStatusProgress(); 
      });

      // Seleção livre
      $('#tts-sel',dock)?.addEventListener('click', (e)=>{
        e.preventDefault();
        const t = String(window.getSelection && window.getSelection()).trim();
        if(!t){ window.toast('Selecione um trecho para ler.'); return; }
        try{ synth.cancel(); }catch{}
        const uu = new SpeechSynthesisUtterance(sanitize(t));
        if(baseVoice) uu.voice=baseVoice;
        uu.lang=(baseVoice&&baseVoice.lang)||'pt-BR';
        synth.speak(uu);
      });

      // Outline toggle (liga/desliga moldura)
      $('#tts-grid',dock)?.addEventListener('click', e=>{
        e.preventDefault();
        PREFS.outline = !PREFS.outline;
        PREFS.clickToSpeak = PREFS.outline;
        savePrefs();
        if(!PREFS.outline) hideOutline(); else { const b=blocks[idx]; b && showOutlineFor(b.node); }
        setPressed($('#tts-grid',dock), PREFS.outline);
        window.toast(PREFS.outline ? 'Outline Ativado' : 'Outline Desativado');
      });
      setPressed($('#tts-grid',dock), PREFS.outline);

      // Botão de trocar voz
      $('#tts-voice',dock)?.addEventListener('click', e=>{
        e.preventDefault(); cycleVoice(); window.toast('Voz alterada');
      });

      /* ---------- Click-to-Speak (Se Outline ligado) ---------- */
      document.addEventListener('click', (ev)=>{
        const blk = ev.target.closest(BLOCK_SEL);
        if(!blk || ev.target.closest('.kob-tts-dock')) return;
        const i = blocks.findIndex(b=> b.node===blk);
        if(i<0) return;
        idx=i;
        if(PREFS.outline) showOutlineFor(blk);
        if(PREFS.clickToSpeak){
          speaking=true; setPressed($('#tts-on',dock),true);
          speakCurrent();
        }else{
          setStatusProgress();
        }
      }, {passive:false});

      /* ---------- Boot & Storage ---------- */
      rebuild();
      setStatusProgress();

      function readPrefs(){ try{ return JSON.parse(localStorage.getItem(PREF_KEY)||'{}'); }catch{ return {}; } }
      function savePrefs(){ try{ localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); }catch{} }
      function applySavedPos(){
        try{
          const s=JSON.parse(localStorage.getItem(POS_KEY)||'null');
          if(s){ setCSS('--tts-left', s.left); setCSS('--tts-bottom', s.bottom); }
        }catch{}
      }
      function savePos(){
        try{
          const cs=getComputedStyle(document.documentElement);
          localStorage.setItem(POS_KEY, JSON.stringify({
            left: cs.getPropertyValue('--tts-left').trim(),
            bottom: cs.getPropertyValue('--tts-bottom').trim()
          }));
        }catch{}
      }
    })();
  

