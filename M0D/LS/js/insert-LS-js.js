
(function(){
  'use strict';

  /* ================= CONFIG ================= */
  const BTN_SIZE = 52;
  const OFFSET_TOP = 12;
  const OFFSET_RIGHT = -12;

  /* ================= STYLE INJECTION ================= */
  const style = document.createElement('style');
  style.innerHTML = `

 :root{
      --grad-a:#ff52e5;
      --grad-b:#00c5e5;
      --bg: linear-gradient(135deg,var(--grad-a),var(--grad-b));
      --fg:#fff;
      --mut:#cfd8dc;
      --glass:rgba(0,0,0,.45);
      --r:22px;
      --shadow:0 12px 34px rgba(0,0,0,.4);
      --bd:1px solid rgba(255,255,255,.15);
      --ok:#39FFB6;
    }

    *{box-sizing:border-box;margin:0;padding:0}

    body{
      font-family:'Montserrat',system-ui,sans-serif;
      background:var(--bg);
      color:var(--fg);
      min-height:100vh;
      display:flex;
      justify-content:center;
      padding:22px;
    }

    .app{
      width:100%;
      max-width:860px;
      display:flex;
      flex-direction:column;
      gap:18px;
    }

    .card{
      background:var(--glass);
      backdrop-filter:blur(18px);
      border-radius:var(--r);
      box-shadow:var(--shadow);
      padding:14px 16px;
      position:relative;
      overflow:visible;
      min-height:120px;
    }

    .open-ls-btn{
      position:absolute;
      top:12px;
      right:-12px;
      width:44px;
      height:44px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:0;
      z-index:10;
      background:rgba(255,255,255,.12);
      border:1px solid rgba(255,255,255,.18);
      box-shadow:0 10px 24px rgba(0,0,0,.35);
      color:#fff;
      cursor:pointer;
      transition:.2s;
    }

    .open-ls-btn:hover{
      background:rgba(255,255,255,.22);
      transform:translateY(-1px);
    }

    .small{
      font-size:.8rem;
      color:var(--mut);
      margin-top:8px;
    }

    .loader{
      width:22px;
      height:22px;
      border:3px solid rgba(255,255,255,.2);
      border-top:3px solid #fff;
      border-radius:50%;
      animation:spin 1s linear infinite;
      margin:8px auto;
    }

    @keyframes spin{
      100%{transform:rotate(360deg)}
    }

    .modal{
      position:fixed;
      inset:0;
      display:none;
      align-items:center;
      justify-content:center;
      z-index:1000;
      background:rgba(0,0,0,.55);
      backdrop-filter:blur(8px);
      padding:14px;
    }

    .modal.open{display:flex}

    .panel{
      width:min(980px,95vw);
      max-height:86vh;
      overflow:auto;
      background:rgba(15,17,32,.92);
      border:var(--bd);
      border-radius:18px;
      box-shadow:var(--shadow);
      padding:14px;
    }

    .hdr{
      display:flex;
      gap:10px;
      align-items:center;
      justify-content:space-between;
      border-bottom:var(--bd);
      padding-bottom:10px;
      margin-bottom:10px;
      flex-wrap:wrap;
    }

    .hdr .ttl{
      font-weight:900;
      letter-spacing:.06em;
    }

    .actions{
      display:flex;
      gap:8px;
      flex-wrap:wrap;
    }

    .meta{
      color:var(--mut);
      font-size:12px;
      margin:6px 0 10px;
    }

    .list{
      display:grid;
      gap:10px;
    }

    .item{
      background:rgba(255,255,255,.05);
      border:var(--bd);
      border-radius:14px;
      padding:10px;
      display:grid;
      gap:8px;
    }

    .item .head{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:8px;
      flex-wrap:wrap;
    }

    .key{
      font-weight:800;
      max-width:56vw;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .type{
      font-size:11px;
      color:var(--mut);
    }

    .val{
      font:12px/1.4 ui-monospace,monospace;
      background:#0b0f1a;
      border:var(--bd);
      border-radius:10px;
      padding:8px;
      max-height:140px;
      overflow:auto;
      word-break:break-word;
      white-space:pre-wrap;
    }

    .switch{
      inline-size:46px;
      block-size:28px;
      border-radius:999px;
      border:var(--bd);
      background:rgba(255,255,255,.15);
      position:relative;
      cursor:pointer;
      flex:0 0 auto;
    }

    .switch::after{
      content:"";
      position:absolute;
      inset:4px auto 4px 4px;
      width:20px;
      border-radius:999px;
      background:#fff;
      transition:all .18s;
    }

    .switch.on{
      background:rgba(25,226,123,.28);
    }

    .switch.on::after{
      left:22px;
    }

    details.presets{
      border:var(--bd);
      border-radius:14px;
      padding:8px;
      background:rgba(255,255,255,.04);
      margin-bottom:10px;
    }

    .presets-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:10px;
      margin-top:8px;
    }

    .preset{
      border:var(--bd);
      border-radius:12px;
      background:rgba(255,255,255,.04);
      padding:10px;
      display:grid;
      gap:6px;
    }

    .img-grid{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
      gap:10px;
    }

    .img-card{
      border:var(--bd);
      background:rgba(255,255,255,.04);
      border-radius:10px;
      padding:8px;
    }

    .img-card img{
      width:100%;
      height:auto;
      display:block;
      border-radius:8px;
    }

    button{
      background:rgba(255,255,255,.1);
      border:0;
      color:#fff;
      padding:8px 12px;
      border-radius:12px;
      font-size:.9rem;
      cursor:pointer;
      transition:.2s;
      display:inline-flex;
      gap:6px;
      align-items:center;
    }

    button:hover{background:rgba(255,255,255,.2)}
    .btn-ghost{background:transparent;border:1px dashed rgba(255,255,255,.25)}

    textarea,input,select{
      width:100%;
      margin:6px 0;
      padding:10px;
      border-radius:10px;
      border:none;
      font-family:inherit;
      outline:none;
    }

    @media (max-width:560px){
      .key{max-width:46vw}
      .open-ls-btn{
        top:10px;
        right:-10px;
      }
    }

  .bau-fab{
    position:fixed;
    top:${OFFSET_TOP}px;
    right:${OFFSET_RIGHT}px;
    width:${BTN_SIZE}px;
    height:${BTN_SIZE}px;
    border-radius:50%;
    background:linear-gradient(135deg,#ff52e5,#00c5e5);
    border:none;
    box-shadow:0 8px 24px rgba(0,0,0,.4);
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    z-index:999999;
    transition:.25s;
  }
  .bau-fab:hover{ transform:scale(1.08); }
  .bau-fab i{ color:#fff; font-size:22px; }

  .bau-modal{
    position:fixed;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    background:rgba(0,0,0,.6);
    backdrop-filter:blur(8px);
    z-index:999998;
  }
  .bau-modal.open{ display:flex; }

  .bau-panel{
    width:min(900px,95vw);
    max-height:85vh;
    overflow:auto;
    background:#0f1120;
    color:#fff;
    border-radius:18px;
    padding:16px;
    font-family:system-ui;
  }

  .bau-head{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:10px;
  }

  .bau-list{
    display:grid;
    gap:10px;
  }

  .bau-item{
    background:rgba(255,255,255,.05);
    padding:10px;
    border-radius:10px;
    font-size:12px;
  }

  .bau-key{ font-weight:bold; margin-bottom:4px; }
  .bau-val{ opacity:.8; word-break:break-word; }
  `;
  document.head.appendChild(style);

  /* ================= ICON (lucide fallback) ================= */
  const icon = `<svg width="22" height="22" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
    <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/>
    <path d="M3 7l9 4 9-4"/>
  </svg>`;

  /* ================= BUTTON ================= */
  const btn = document.createElement('button');
  btn.className = 'bau-fab';
  btn.innerHTML = icon;
  document.body.appendChild(btn);

  /* ================= MODAL ================= */
  const modal = document.createElement('div');
  modal.className = 'bau-modal';
  modal.innerHTML = `
    <div class="bau-panel">
      <div class="bau-head">
        <strong>Baú • LocalStorage</strong>
        <button id="bau-close">✕</button>
      </div>
      <div id="bau-list" class="bau-list"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const list = modal.querySelector('#bau-list');

  /* ================= RENDER ================= */
  function render(){
    list.innerHTML = '';
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);

      const item = document.createElement('div');
      item.className = 'bau-item';
      item.innerHTML = `
        <div class="bau-key">${k}</div>
        <div class="bau-val">${(v||'').slice(0,500)}</div>
      `;
      list.appendChild(item);
    }
  }

  /* ================= EVENTS ================= */
  btn.onclick = () => {
    modal.classList.add('open');
    render();
  };

  modal.onclick = (e)=>{
    if(e.target === modal) modal.classList.remove('open');
  };

  modal.querySelector('#bau-close').onclick = ()=>{
    modal.classList.remove('open');
  };

})();
