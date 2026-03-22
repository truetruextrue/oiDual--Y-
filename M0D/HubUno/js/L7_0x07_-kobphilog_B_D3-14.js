/* ═══════════════════════════════════════════════════════════
   0x07 · SELAR · B · D3
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L7_0x07_-kobphilog_B_D3-14.js
   Opcode    : 0x07 · SELAR · ✧ · 777Hz
   V.E.E.B.  : Base
   Degrau    : D3 (word)
   Fórmula   : Base · selo vibracional · ✧ 777Hz · ∆⁷ SELAR
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 7 · ORQUESTRADOR
   Opcode Δ  : 0x0C · Carregar na posição 7 da cadeia
   Nota      : Init — espera DOM + todos os scripts
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 1  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=777)
     χ = 15  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
     KOBΦ-NODE · LOG FUNCTIONS
     ═══════════════════════════════════════════════════════════ */
  var _kobphiLog = [];
  function kobphiNodeLog(msg) {
    var ts = new Date().toISOString().slice(11,19);
    _kobphiLog.unshift('[' + ts + '] ' + msg);
    if (_kobphiLog.length > 20) _kobphiLog.pop();
    kobphiNodeRefresh();
  }
  window.kobphiNodeRefresh = function() {
    var el = document.getElementById('kobphiNodeLiveLog');
    if (!el) return;
    try {
      var eqLog = JSON.parse(localStorage.getItem('kobllux.eq.log') || '[]');
      var lines = eqLog.slice(0,5).map(function(e){
        return '[' + new Date(e.ts).toISOString().slice(11,19) + '] ' + (e.phase || 'EQUALIZAÇÃO') + ' · author=UNO';
      });
      var all = _kobphiLog.concat(lines);
      if (!all.length) { el.textContent = '∞ KOBΦ-NODE IDLE · aguardando manifestação...'; return; }
      el.innerHTML = all.map(function(l){ return '<div>' + l + '</div>'; }).join('');
    } catch(e) { el.textContent = '∞ KOBΦ-NODE IDLE'; }
  };

  /* ── BOOT SEQUENCE ── */
  function boot(){
    updateKeyBadge();
    /* Mirror infodose:sk → dual.keys.openrouter */
    var existing=localStorage.getItem('dual.keys.openrouter');
    if(!existing){
      var fallback=localStorage.getItem('infodose:sk');
      if(fallback) localStorage.setItem('dual.keys.openrouter',fallback);
    }
    /* Activate voice mode on startup */
    setTimeout(activateVoiceMode, 1600);
    /* Patch handleUserMessage */
    setTimeout(patchHandleUserMessageWithTraining, 2000);
    /* Inject AION dashboard */
    setTimeout(function(){ injectAionDashboard(); refreshAionDashboard(); }, 2200);
    /* Live dashboard refresh every 3s */
    setInterval(refreshAionDashboard, 3000);
    console.log('🔑 API UNIFICADA · sk-ant-* → Anthropic · sk-or-* → OpenRouter');
    console.log('🕰 AION TUTORIAL INTEGRADO · SISTEMA LOG EXPANDIDO · LOCALS:V1 ATIVO');
    console.log('VERDADE×INTEGRAR÷∆=∞ · 3×6×9×7=1134 · AMÉM ∆⁷');
  }

  /* ── EVENT LISTENERS ── */
  document.addEventListener('input',function(e){
    if(e.target&&e.target.id==='sk') updateKeyBadge();
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest)return;
    if(e.target.closest('[data-nav="brain"]')) setTimeout(function(){ updateKeyBadge(); injectAionDashboard(); refreshAionDashboard(); },220);
    /* Toggle SPEAKING on play btn */
    if(e.target.closest('#btn-play-uno')){
      setTimeout(function(){
        var sp=document.getElementById('aionSpeakShow');
        if(sp){ sp.textContent=document.body.classList.contains('speaking')?'SIM ✓':'NÃO'; sp.style.color=document.body.classList.contains('speaking')?'#39ffb6':'rgba(255,255,255,.4)';}
      },100);
    }
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();