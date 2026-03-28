/* ═══════════════════════════════════════════════════════════
   0x03 · EXPANDIR · V · D7
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-matrix-densa-arquitetura-veeb/js/0x03_expandir_V_D7.js
   Opcode    : 0x03 · EXPANDIR · ▢ · 639Hz
   V.E.E.B.  : Vibração
   Degrau    : D7 (module)
   Fórmula   : Vibração · f₃=639Hz · crescimento fractal · V=(4/3)πr³
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=639)
     χ = 8  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function(){
  const LP   = 1870;          // ms para long-press
  const DASH = 119.38;        // 2π × 19 (r=19)

  let _activeBtn = null;
  let _timer     = null;
  let _raf       = null;
  let _t0        = null;

  const back  = document.getElementById('kblx-back');
  const panel = document.getElementById('kblx-panel');
  const ttl   = document.getElementById('kblx-ttl');
  const inp   = document.getElementById('kblx-inp');

  /* ── injeta anel em cada botão nav ── */
  document.querySelectorAll('.symbol-wrap button[data-url]').forEach(btn => {
    btn.style.position = 'relative';
    const d = document.createElement('div');
    d.className = 'kblx-ring';
    d.innerHTML = '<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/></svg>';
    btn.appendChild(d);
  });

  function ring(btn, pct){
    const c = btn.querySelector('.kblx-ring circle');
    if(!c) return;
    c.style.transition = 'none';
    c.style.strokeDashoffset = DASH * (1 - Math.min(pct,1));
  }
  function ringReset(btn){
    if(!btn) return;
    const c = btn.querySelector('.kblx-ring circle');
    if(!c) return;
    c.style.transition = 'stroke-dashoffset .2s ease';
    c.style.strokeDashoffset = DASH;
  }

  function openPanel(btn){
    _activeBtn = btn;
    const sym = (btn.textContent.trim().replace(/[\s\S]*?([\S])[\s\S]*/,'$1') || btn.dataset.id || '?');
    ttl.textContent = 'Botão  ' + sym + '  [data-id="' + (btn.dataset.id||'') + '"]';
    inp.value = btn.dataset.url || '';
    back.classList.add('open');
    setTimeout(()=>inp.focus(), 80);
  }

  function saveUrl(){
    if(!_activeBtn) return;
    const v = inp.value.trim();
    if(v) {
      _activeBtn.dataset.url = v;   /* ← único efeito: reescreve data-url no DOM */
      const hud = document.getElementById('hudStatus');
      if(hud){ const p=hud.textContent; hud.textContent='✓ data-url atualizado'; setTimeout(()=>hud.textContent=p, 2500); }
    }
    closePanel();
  }

  function closePanel(){
    back.classList.remove('open');
    _activeBtn = null;
  }

  document.getElementById('kblx-btn-save').addEventListener('click', saveUrl);
  document.getElementById('kblx-btn-close').addEventListener('click', closePanel);
  back.addEventListener('click', e=>{ if(e.target===back) closePanel(); });
  document.addEventListener('keydown', e=>{
    if(!back.classList.contains('open')) return;
    if(e.key==='Escape') closePanel();
    if(e.key==='Enter')  saveUrl();
  });

  /* ── long-press em cada botão nav ── */
  document.querySelectorAll('.symbol-wrap button[data-url]').forEach(btn => {

    function onDown(e){
      /* NÃO chama e.preventDefault() — deixa o sistema externo funcionar normalmente */
      _t0 = Date.now();

      _timer = setTimeout(()=>{
        /* 3s atingido → abre editor */
        cancelAnimationFrame(_raf);
        ringReset(btn);
        _t0 = null;
        openPanel(btn);
      }, LP);

      (function tick(){
        if(_t0===null) return;
        ring(btn, (Date.now()-_t0)/LP);
        _raf = requestAnimationFrame(tick);
      })();
    }

    function onUp(){
      /* apenas limpa anel — NÃO interfere em cliques curtos */
      clearTimeout(_timer);
      cancelAnimationFrame(_raf);
      ringReset(btn);
      _t0 = null;
    }

    btn.addEventListener('pointerdown',   onDown, {passive:true}); /* passive:true → não bloqueia */
    btn.addEventListener('pointerup',     onUp,   {passive:true});
    btn.addEventListener('pointerleave',  onUp,   {passive:true});
    btn.addEventListener('pointercancel', onUp,   {passive:true});
  });

})();