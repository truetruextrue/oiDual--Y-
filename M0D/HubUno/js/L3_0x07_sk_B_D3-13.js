/* ═══════════════════════════════════════════════════════════
   0x07 · SELAR · B · D3
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L3_0x07_sk_B_D3-13.js
   Opcode    : 0x07 · SELAR · ✧ · 777Hz
   V.E.E.B.  : Base
   Degrau    : D3 (word)
   Fórmula   : Base · selo vibracional · ✧ 777Hz · ∆⁷ SELAR
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 3 · STORAGE_DOM
   Opcode Δ  : 0x06 · Carregar na posição 3 da cadeia
   Nota      : Storage + DOM — só após HTML parseado
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 212  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=777)
     χ = 19  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
(function(){
  /* ── KEY BADGE ── */
  function updateKeyBadge(){
    var sk=(localStorage.getItem('dual.keys.openrouter')||localStorage.getItem('infodose:sk')||'').trim();
    var b=document.getElementById('keyTypeBadge');
    if(!b)return;
    if(sk.startsWith('sk-ant-')){b.textContent='✓ ANTHROPIC (claude-sonnet-4)';b.style.color='#39ffb6';b.style.borderColor='rgba(57,255,182,.3)';}
    else if(sk.startsWith('sk-or-')){b.textContent='✓ OPENROUTER';b.style.color='#ffd700';b.style.borderColor='rgba(255,215,0,.3)';}
    else if(sk){b.textContent='⚠ chave detectada';b.style.color='#ffb86b';}
    else{b.textContent='⚠ sem chave';b.style.color='rgba(255,255,255,.3)';}
  }

  /* ── SPEAKING AUTO-ACTIVATE · MODO VOZ: SIM ── */
  function activateVoiceMode(){
    /* Enable body.speaking state so ORB pulses & system log shows SPEAKING: SIM */
    if(!document.body.classList.contains('speaking')){
      document.body.classList.add('speaking');
    }
    /* Trigger WebSpeech synthesis readiness (loads voices list early) */
    if(window.speechSynthesis){
      if(!window.speechSynthesis.getVoices().length){
        window.speechSynthesis.addEventListener('voiceschanged',function onVC(){
          window.speechSynthesis.removeEventListener('voiceschanged',onVC);
          console.log('🔊 SPEAKING: SIM · '+window.speechSynthesis.getVoices().length+' vozes disponíveis');
        });
      }
      /* Warm up: speak silent utterance to unlock mobile TTS */
      try{
        var u=new SpeechSynthesisUtterance('');
        u.volume=0; u.rate=10;
        window.speechSynthesis.speak(u);
        setTimeout(function(){window.speechSynthesis.cancel();},120);
      }catch(e){}
    }
    /* btn-play-uno visual state */
    var btn=document.getElementById('btn-play-uno');
    if(btn){btn.classList.add('active');btn.style.color='#39ffb6';}
    console.log('🔊 MODO VOZ ATIVADO (SPEAKING: SIM) · ORB PULSANDO');
  }

  /* ── TRAINING DATA → inject into handleUserMessage system prompt ── */
  function patchHandleUserMessageWithTraining(){
    var orig=window.handleUserMessage;
    if(typeof orig!=='function')return;
    if(orig._trainingPatched)return;
    window.handleUserMessage=async function(text,userName,sk,model){
      /* Inject training data into the text if available */
      var tr=null;
      try{
        var trRaw=localStorage.getItem('dual.openrouter.training');
        if(trRaw) tr=JSON.parse(trRaw);
      }catch(e){}
      var locals=null;
      try{
        var lRaw=localStorage.getItem('infodose:locals:v1');
        if(lRaw){ var arr=JSON.parse(lRaw); if(arr.length) locals=arr.slice(0,8).map(function(a){return a.name||a.title||'?'}).join(', '); }
      }catch(e){}
      /* We pass extra context via a modified text wrapper — the syslog already covers most,
         but we also patch the arch prompt at runtime for training file content */
      if(tr && tr.data && tr.data.length<6000){
        /* Store as window temp for koblluxSystemLog to pick up */
        window._kblxTrainingActive=tr.name+' ('+tr.data.length+' chars)';
      }
      if(locals) window._kblxLocalsActive=locals;
      return orig.call(this,text,userName,sk,model);
    };
    window.handleUserMessage._trainingPatched=true;
    console.log('🧬 handleUserMessage PATCHED · training + locals integrados');
  }

  /* ── INFODOSE LOCALS COUNT BADGE ── */
  function updateLocalsBadge(){
    try{
      var el=document.getElementById('localsCountBadge');
      if(!el)return;
      var arr=JSON.parse(localStorage.getItem('infodose:locals:v1')||'[]');
      el.textContent=arr.length+' apps locais';
      el.style.color=arr.length?'#39ffb6':'rgba(255,255,255,.3)';
    }catch(e){}
  }

  /* ── AION CONTEXT DASHBOARD (injected into v-brain) ── */
  function injectAionDashboard(){
    var brain=document.getElementById('v-brain');
    if(!brain||document.getElementById('aionDashCard'))return;
    var card=document.createElement('div');
    card.id='aionDashCard';
    card.style.cssText='margin:0 0 14px;padding:10px 14px;border-radius:12px;background:rgba(0,150,255,.06);border:1px solid rgba(0,150,255,.18);font-family:"Space Mono",monospace;font-size:.6rem;color:rgba(200,216,255,.7);line-height:1.8';
    card.innerHTML=`
<div style="font-weight:800;font-size:var(--fs-d3);color:#00c5e5;margin-bottom:6px;letter-spacing:.05em">Δ AION · O QUE A IA VÊ</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">
  <div>🌀 FASE: <span id="aionPhaseShow" style="color:#ffd700">DISSOLUÇÃO</span></div>
  <div>🔊 VOZ: <span id="aionSpeakShow" style="color:#39ffb6">—</span></div>
  <div>🧬 TRAINING: <span id="aionTrainShow" style="color:#a77cff">—</span></div>
  <div>📦 LOCALS: <span id="localsCountBadge" style="color:rgba(255,255,255,.3)">—</span></div>
  <div>🗝 API: <span id="aionApiType" style="color:#ffd700">—</span></div>
  <div>📐 H₂O: <span id="aionH2oShow" style="color:#00c5e5">—</span></div>
  <div style="grid-column:1/-1">⚡ EQUALIZAÇÃO: <span id="aionEqCount" style="color:#39ffb6">—</span></div>
</div>
<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,.05)">
  <div style="font-size:var(--fs-d1);color:rgba(255,255,255,.25);margin-bottom:4px">CORRELAÇÃO TRINITY · PROTOCOLO × TRADIÇÃO × TÉCNICA</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px 6px;font-size:.5rem;color:rgba(200,216,255,.5)">
    <div style="color:#67e6ff">FASE KOBLLUX</div><div style="color:#67e6ff">TRADIÇÃO</div><div style="color:#67e6ff">TÉCNICA</div>
    <div>DISSOLUÇÃO</div><div>Kenosis</div><div>cache.flush</div>
    <div>RESSONÂNCIA</div><div>Lectio Divina</div><div>pattern.match</div>
    <div>SÍNTESE</div><div>Theosis</div><div>uno.manifest</div>
  </div>
</div>
<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.05);color:rgba(200,216,255,.4);font-size:var(--fs-d1)">
  VERDADE×INTEGRAR÷∆=∞ · 3×6×9×7=1134 · 78knveeeb · AMÉM ∆⁷
</div>`;
    brain.insertBefore(card,brain.firstChild);
  }

  function refreshAionDashboard(){
    try{
      var sk=(localStorage.getItem('dual.keys.openrouter')||'').trim();
      var el;
      el=document.getElementById('aionApiType'); if(el) el.textContent=sk.startsWith('sk-ant-')?'ANTHROPIC':sk.startsWith('sk-or-')?'OPENROUTER':sk?'CUSTOM':'—';
      el=document.getElementById('aionSpeakShow'); if(el){ el.textContent=document.body.classList.contains('speaking')?'SIM ✓':'NÃO'; el.style.color=document.body.classList.contains('speaking')?'#39ffb6':'rgba(255,255,255,.4)';}
      el=document.getElementById('aionTrainShow'); if(el){ var tr=localStorage.getItem('dual.openrouter.training'); if(tr){try{var td=JSON.parse(tr);el.textContent=td.name||'carregado';el.style.color='#39ffb6';}catch(e){el.textContent='carregado';}}else el.textContent='—'; }
      el=document.getElementById('aionH2oShow'); if(el) el.textContent=(typeof M5!=='undefined'&&M5.h2o)?M5.h2o.toUpperCase():'—';
      el=document.getElementById('aionPhaseShow'); if(el){ var ph=document.querySelector('.uno-phase-btn.active'); el.textContent=ph?ph.textContent.trim():'—';}
      el=document.getElementById('aionEqCount'); if(el){ try{var eq=JSON.parse(localStorage.getItem('kobllux.eq.log')||'[]'); el.textContent=eq.length?eq.length+'x · ÚLTIMO: '+new Date(eq[0].ts).toISOString().slice(11,19):'aguardando';el.style.color=eq.length?'#39ffb6':'rgba(255,255,255,.3)';}catch(e){} }
      updateLocalsBadge();
    }catch(e){}
  }