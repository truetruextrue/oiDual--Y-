/*!
 * INFODOSE CORE ENGINE v1.0 · Sunrise ZPR
 * Usage: <script src="infodose-core.js" data-mode="card|orb|hud"></script>
 * Deps: Zero. Auto-injeta CSS + HTML + Estado
 */
(() => {
  "use strict";
  if(window.__INFODOSE_CORE__) return;
  window.__INFODOSE_CORE__ = true;

  // CONFIG GLOBAL - FONTE DE VERDADE
  window.DI = window.DI || {
    user: localStorage.getItem('di_userName') || 'Convidado',
    model: localStorage.getItem('di_model') || 'nvidia/nemotron-3-nano-30b-a3b:free',
    voice: localStorage.getItem('di_voice_primary') || 'atlas',
    speed: 8,
    theme: document.currentScript?.dataset.theme || 'kxtsk',
    mode: document.currentScript?.dataset.mode || 'card'
  };

  // CSS CORE - INJETADO 1X
  const CSS = `
    :root{--z-base:0;--z-content:100;--z-widget:500;--z-overlay:1000;--z-system:5000;
      --bg:#05070a;--fg:#e8f0ff;--mut:#8a93a3;--grad-a:#ff52e5;--grad-b:#00c5e5;--ok:#39FFB6;
      --glass:rgba(15,17,32,.85);--r:20px;--bd:1px solid rgba(255,255,255,.12)}
    *{box-sizing:border-box;margin:0;padding:0}
    body{margin:0;background:var(--bg);color:var(--fg);font-family:'Montserrat',system-ui,sans-serif;min-height:100vh}
    
    /* AMBIENT */
    .ambient-light{position:fixed;inset:0;z-index:var(--z-base);pointer-events:none}
    .blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.15}
    .blob-1{width:400px;height:400px;background:var(--grad-a);top:-100px;left:-100px;animation:float 20s infinite}
    .blob-2{width:300px;height:300px;background:var(--grad-b);bottom:-50px;right:-50px;animation:float 15s infinite reverse}
    @keyframes float{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,30px)}}

    /* ORB UNIFICADO */
    .orb{width:100%;height:100%;border-radius:50%;display:flex;place-items:center}
    .orb-core{width:100%;height:100%;border-radius:50%;background:
      radial-gradient(circle at 30% 30%, var(--orb-accent,#ff52e5), transparent 60%),
      radial-gradient(circle at 70% 70%, var(--orb-primary,#00c5e5), var(--orb-secondary,#7f5af0));
      box-shadow:0 0 18px var(--orb-primary),0 0 36px rgba(120,227,255,0.4);
      animation:orbSpin var(--orb-speed,8s) linear infinite}
    @keyframes orbSpin{to{transform:rotate(360deg)}}
    @keyframes orbPulse{from{transform:scale(1)}to{transform:scale(1.15)}}
    #orb-root.speaking .orb-core{animation:orbSpin 2s linear infinite,orbPulse .5s ease-in-out infinite alternate}

    /* FUSION CARD */
    #di-app-root{position:relative;z-index:var(--z-content);padding:20px;max-width:1400px;margin:0 auto}
    .fusion-card{background:var(--glass);backdrop-filter:blur(20px);border:var(--bd);border-radius:var(--r);
      box-shadow:0 20px 60px rgba(0,0,0,.5);overflow:hidden;transition:all .4s cubic-bezier(.2,.9,.3,1)}
    .fusion-card.closed{max-width:420px;margin:60px auto}
    .card-header{display:flex;align-items:center;gap:14px;padding:20px;border-bottom:var(--bd)}
    .avatar-slot{width:64px;height:64px;border-radius:16px;cursor:pointer}
    .text-block{flex:1}
    .greeting-row{display:flex;align-items:baseline;gap:8px}
    .txt-thin{font-weight:200;opacity:.7}.txt-heavy{font-weight:800;font-size:18px}
    .brand-dual{font-size:11px;opacity:.5;letter-spacing:.1em;margin-top:2px}
    .clock-widget{text-align:right}
    .time-display{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700}
    .status-led{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:800;
      color:var(--ok);letter-spacing:.05em}
    .status-led::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--ok);
      box-shadow:0 0 8px var(--ok);animation:blink 2s infinite}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
    .card-body{padding:20px;display:grid;gap:16px}
    .cyber-input{width:100%;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.15);
      background:rgba(0,0,0,.3);color:#fff;font:inherit}
    .trigger-btn{padding:12px 20px;border-radius:12px;border:0;background:#fff;color:#0a0d12;
      font:inherit;font-weight:800;cursor:pointer}

    /* SYMBOL BAR */
    .symbol-bar{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:var(--z-widget);
      display:flex;gap:10px;padding:12px;background:var(--glass);backdrop-filter:blur(16px);
      border:var(--bd);border-radius:var(--r);box-shadow:0 12px 40px rgba(0,0,0,.4)}
    .symbol-button{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.15);color:var(--fg);cursor:pointer;transition:.2s;
      display:flex;align-items:center;justify-content:center;font-size:18px}
    .symbol-button:hover{background:rgba(255,255,255,.15);transform:translateY(-2px)}
    #btn-arch #main-orb{width:56px;height:56px;display:flex;padding:0}

    /* TTS DOCK */
    .kob-tts-dock{transition:transform .35s ease,opacity .65s ease;box-shadow:none!important}
    .kob-tts-dock.idle{opacity:.18;transform:scale(.92)}
    .kob-tts-dock:hover{opacity:1;transform:scale(1)}

    /* TOPBAR KXT5K */
    .kxt-topbar{position:fixed;top:0;left:0;right:0;z-index:var(--z-system);padding:12px 20px;
      background:var(--glass);backdrop-filter:blur(16px);border-bottom:var(--bd);display:flex;
      align-items:center;gap:12px;font-size:12px;font-weight:700;letter-spacing:.05em}
    .kxt-dot{width:10px;height:10px;border-radius:50%}
    .kxt-tabs{display:flex;gap:8px;margin-left:20px}
    .kxt-tab{padding:8px 16px;border-radius:10px;background:rgba(255,255,255,.05);
      border:1px solid rgba(255,255,255,.1);cursor:pointer;font-size:12px}
    .kxt-tab.active{background:rgba(255,82,229,.15);border-color:var(--grad-a)}
  `;

  // ORB GENERATOR
  function makeOrbAvatar(name, size = 36){
    const safe = name || 'DUAL';
    const seed = safe.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    const h1 = seed % 360, h2 = (seed * 37) % 360;
    const uid = Math.random().toString(36).slice(2,6);
    const id = 'g' + seed.toString(36) + uid;
    return `<svg width="${size}" height="${size}" viewBox="0 0 32 32">
      <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${h1},100%,55%)"/>
        <stop offset="100%" stop-color="hsl(${h2},90%,45%)"/></linearGradient></defs>
      <rect width="32" height="32" rx="7" fill="#071018"/>
      <circle cx="16" cy="16" r="9" fill="url(#${id})" opacity="0.25"/>
      <circle cx="16" cy="16" r="7" fill="url(#${id})"/>
      <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
    </svg>`;
  }
  window.makeOrbAvatar = makeOrbAvatar;

  // INJETAR CSS
  if(!document.getElementById('infodose-core-css')){
    const style = document.createElement('style');
    style.id = 'infodose-core-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // RENDER ENGINE
  function render(){
    // Ambient
    if(!document.querySelector('.ambient-light')){
      const amb = document.createElement('div');
      amb.className = 'ambient-light';
      amb.innerHTML = '<div class="blob blob-1"></div><div class="blob blob-2"></div>';
      document.body.prepend(amb);
    }

    // Topbar KXT5K
    if(!document.querySelector('.kxt-topbar')){
      const top = document.createElement('div');
      top.className = 'kxt-topbar';
      top.innerHTML = `
        <div class="kxt-dot" style="background:#ff4757"></div>
        <div class="kxt-dot" style="background:#ffa502"></div>
        <div class="kxt-dot" style="background:#2ed573"></div>
        <span style="margin-left:12px;opacity:.7">ENGINE: SYNCHRONIZED</span>
        <div class="kxt-tabs">
          <div class="kxt-tab active">KXT5K</div>
          <div class="kxt-tab">Unified</div>
          <div class="kxt-tab">+ Abrir KOB</div>
          <div class="kxt-tab">Logs</div>
        </div>
      `;
      document.body.prepend(top);
    }

    // App Root
    let root = document.getElementById('app-root') || document.getElementById('di-app-root');
    if(!root){
      root = document.createElement('div');
      root.id = 'di-app-root';
      document.body.appendChild(root);
    }

    // Voice colors
    const voiceColors = {
      atlas:{primary:'#00c5e5',secondary:'#0077ff',accent:'#ff52e5'},
      nova:{primary:'#ff52e5',secondary:'#ff0077',accent:'#00c5e5'},
      kodux:{primary:'#7f5af0',secondary:'#5a3fc0',accent:'#39FFB6'}
    };
    const v = voiceColors[DI.voice] || voiceColors.atlas;
    Object.entries(v).forEach(([k,val])=>document.documentElement.style.setProperty(`--orb-${k}`,val));
    document.documentElement.style.setProperty('--orb-speed', DI.speed + 's');

    // Render baseado no mode
    if(DI.mode === 'card'){
      root.innerHTML = `
        <div class="fusion-card" id="mainCard">
          <div class="card-header">
            <div class="avatar-slot" id="orb-root">${makeOrbAvatar(DI.user, 64)}</div>
            <div class="text-block">
              <div class="greeting-row">
                <span class="txt-thin">Oi,</span>
                <span class="txt-heavy">${DI.user}</span>
              </div>
              <div class="brand-dual">DUAL INFODOSE</div>
            </div>
            <div class="clock-widget">
              <div class="time-display" id="clockTime">${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
              <span class="status-led">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <input type="text" class="cyber-input" id="inputUser" placeholder="Identifique-se..." value="${DI.user}">
            <button class="trigger-btn" id="saveUserBtn">SALVAR CONFIGURAÇÃO</button>
          </div>
        </div>
      `;
    }

    // Symbol Bar
    if(!document.getElementById('symbolBar')){
      const bar = document.createElement('div');
      bar.className = 'symbol-bar floating';
      bar.id = 'symbolBar';
      bar.innerHTML = `
        <div class="toggle-wrap"><button class="symbol-button main-toggle" id="toggleBtn">≡</button></div>
        <div class="symbol-wrap"><button class="symbol-button" id="btn-prev">◀</button></div>
        <div class="symbol-wrap"><button class="symbol-button" id="btn-play">▶</button></div>
        <div class="symbol-wrap"><button class="symbol-button" id="btn-next">▶▶</button></div>
        <button class="symbol-button" id="btn-arch" title="Trocar Arquétipo">
          <div class="orb-microphone-container">
            <div class="tts-orb-mini"><div class="orb" id="main-orb"><div class="orb-core"></div></div></div>
          </div>
        </button>
      `;
      document.body.appendChild(bar);
    }

    // Clock
    setInterval(()=>{
      const el = document.getElementById('clockTime');
      if(el) el.textContent = new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    },1000);

    // Save user
    document.getElementById('saveUserBtn')?.addEventListener('click',()=>{
      const name = document.getElementById('inputUser').value.trim();
      if(name){
        localStorage.setItem('di_userName', name);
        window.DI.user = name;
        render(); // re-render com novo nome
      }
    });
  }

  // BOOT
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', render);
  }else{
    render();
  }

  // API PÚBLICA
  window.InfodoseCore = {
    render,
    setMode: (m) => { DI.mode = m; render(); },
    setUser: (u) => { DI.user = u; localStorage.setItem('di_userName', u); render(); },
    speak: () => document.getElementById('orb-root')?.classList.add('speaking'),
    idle: () => document.getElementById('orb-root')?.classList.remove('speaking')
  };
})();