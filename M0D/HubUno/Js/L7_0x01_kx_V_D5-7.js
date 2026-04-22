/* ═══════════════════════════════════════════════════════════
   0x01 · PULSAR · V · D5
   ═══════════════════════════════════════════════════════════
   Arquivo   : kobllux-hub-uno-v4-m5-vocal-espelho/js/L7_0x01_kx_V_D5-7.js
   Opcode    : 0x01 · PULSAR · ● · 432Hz
   V.E.E.B.  : Vibração
   Degrau    : D5 (block)
   Fórmula   : Vibração · f₁=432Hz · P(t)=A·sin(2π·432·t) · impulso sonoro
   ─────────────────────────────────────────────────────────────
   ORQUESTRAÇÃO:
   Nível     : 7 · ORQUESTRADOR
   Opcode Δ  : 0x0C · Carregar na posição 7 da cadeia
   Nota      : Init — espera DOM + todos os scripts
   ─────────────────────────────────────────────────────────────
   Métricas  :
     S = 1  (Σbᵢ·2^(i-1) · bytes[0..7] mod 2)
     V(1) = 0.0000  (V₀·cos(3π/6), V₀=432)
     χ = 7  (V-E+F = funções-arrows+returns)
   ─────────────────────────────────────────────────────────────
   VERDADE × INTEGRAR ÷ Δ = ∞  ·  3×6×9×7=1134  ·  α=1/137
═══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════
   ESPELHO INVERSO ENGINE
   ══════════════════════════════════════ */
const KX = {
  mode:'espelho', bllueMode:'espelho', tokens:0,
  params:{frags:16,mirror:60,intens:5},
  drawing:false, lastX:0, lastY:0, animPhase:0,
};
const KX_FREQ_MAP={'432':'#67e6ff','528':'#7cffb2','639':'#4de0ff','777':'#ffd700','852':'#00b894','963':'#6c5ce7'};

window.kxSetMode=function(m){
  KX.mode=m;
  document.querySelectorAll('.kx-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
  const lbl=gA('kxModeLabel');if(lbl)lbl.textContent=m.toUpperCase();
  kxDrawFrame();
};
window.kxBllueSetMode=function(m){KX.bllueMode=m;document.querySelectorAll('#kxBllueMode .kx-mode-btn').forEach(b=>b.classList.toggle('active',b.textContent.toLowerCase().includes(m.replace('kodux+bllue','dual'))));};
window.kxUpdateParam=function(k,v){KX.params[k]=parseFloat(v);};

function kxGetCtx(){const cv=gA('kxCanvas');if(!cv)return null;const W=cv.clientWidth||280;if(cv.width!==W)cv.width=W;return{cv,cx:cv.getContext('2d'),W,H:cv.height||200};}

function kxDrawFrame(){
  const r=kxGetCtx();if(!r)return;const{cv,cx,W,H}=r;
  cx.fillStyle='rgba(3,5,8,.15)';cx.fillRect(0,0,W,H);
  const frags=KX.params.frags,intens=KX.params.intens,mirror=KX.params.mirror/100;
  const t=KX.animPhase;
  if(KX.mode==='espelho'||KX.mode==='pixel'){
    for(let i=0;i<frags;i++){const x=Math.sin(t*.7+i)*W*.4+W/2,y=Math.cos(t*.5+i*.8)*H*.35+H/2;cx.fillStyle=i%3===0?'#00e5ff':i%3===1?'#a77cff':'#ff2d78';cx.globalAlpha=.06*intens;cx.fillRect(x,y,4,4);if(mirror>.5){cx.fillRect(W-x,y,4,4);}}cx.globalAlpha=1;
  }else if(KX.mode==='fractal'){
    cx.strokeStyle='rgba(0,229,255,.08)';cx.lineWidth=.8;for(let i=0;i<frags;i++){cx.beginPath();const x=Math.cos(t+i*Math.PI*2/frags)*W*.35+W/2,y=Math.sin(t+i*Math.PI*2/frags)*H*.3+H/2,x2=Math.cos(t*.7+i*Math.PI*2/frags)*W*.2+W/2,y2=Math.sin(t*.7+i*Math.PI*2/frags)*H*.18+H/2;cx.moveTo(x,y);cx.lineTo(x2,y2);cx.stroke();}
  }else if(KX.mode==='voronoi'){
    const pts=Array.from({length:Math.min(frags,24)},(_,i)=>({x:Math.sin(t*.3+i*1.1)*W*.38+W/2,y:Math.cos(t*.25+i*.9)*H*.32+H/2,c:['#00e5ff','#a77cff','#5cffde','#ff2d78'][i%4]}));
    pts.forEach(p=>{cx.fillStyle=p.c;cx.globalAlpha=.04*intens;cx.beginPath();cx.arc(p.x,p.y,8+intens,0,Math.PI*2);cx.fill();});cx.globalAlpha=1;
  }else if(KX.mode==='merkle'){
    let x=W/2,y=20;cx.strokeStyle='rgba(255,215,0,.15)';cx.lineWidth=.8;for(let d=0;d<Math.min(frags/4,8);d++){const nx=x+Math.cos(t+d)*80,ny=y+30;cx.beginPath();cx.moveTo(x,y);cx.lineTo(nx,ny);cx.stroke();cx.fillStyle='#ffd700';cx.globalAlpha=.3;cx.beginPath();cx.arc(x,y,3,0,Math.PI*2);cx.fill();cx.globalAlpha=1;x=nx;y=ny;}
  }else if(KX.mode==='trinity'){
    ['#a8d8f0','#00b4ff','#5cffde'].forEach((c,i)=>{cx.strokeStyle=c;cx.lineWidth=.8;cx.globalAlpha=.3;cx.beginPath();for(let x=0;x<W;x++){const y=H/2+Math.sin(x*.04+t*(i+1)*.3)*H*.2;x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();cx.globalAlpha=1;});
  }
  // freq meters animation
  ['kxF432','kxF528','kxF777'].forEach((id,i)=>{const e=gA(id);if(e)e.style.width=(40+Math.sin(t*(i+1)*.4)*40).toFixed(0)+'%';});
  KX.animPhase+=.025;requestAnimationFrame(kxDrawFrame);
}

// Canvas drawing interaction
setTimeout(()=>{
  const cv=gA('kxCanvas');if(!cv)return;
  const draw=(e)=>{if(!KX.drawing)return;const r=kxGetCtx();if(!r)return;const{cx}=r;const rect=cv.getBoundingClientRect();const x=(e.clientX||e.touches?.[0]?.clientX||0)-rect.left,y=(e.clientY||e.touches?.[0]?.clientY||0)-rect.top;cx.strokeStyle='#00e5ff';cx.lineWidth=2;cx.shadowColor='#00e5ff';cx.shadowBlur=8;cx.lineCap='round';cx.beginPath();cx.moveTo(KX.lastX,KX.lastY);cx.lineTo(x,y);cx.stroke();cx.shadowBlur=0;if(KX.params.mirror>50){cx.beginPath();cx.moveTo(r.W-KX.lastX,KX.lastY);cx.lineTo(r.W-x,y);cx.stroke();}KX.lastX=x;KX.lastY=y;};
  cv.onmousedown=e=>{KX.drawing=true;const rect=cv.getBoundingClientRect();KX.lastX=e.clientX-rect.left;KX.lastY=e.clientY-rect.top;};
  cv.onmousemove=draw;cv.onmouseup=()=>KX.drawing=false;cv.onmouseleave=()=>KX.drawing=false;
  cv.ontouchstart=e=>{e.preventDefault();KX.drawing=true;const rect=cv.getBoundingClientRect();KX.lastX=e.touches[0].clientX-rect.left;KX.lastY=e.touches[0].clientY-rect.top;};
  cv.ontouchmove=e=>{e.preventDefault();draw(e.touches[0]);};
  cv.ontouchend=()=>KX.drawing=false;
},600);

window.kxClearCanvas=function(){const r=kxGetCtx();if(r)r.cx.clearRect(0,0,r.W,r.H);};
window.kxExportCanvas=function(){const cv=gA('kxCanvas');if(!cv)return;const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='kobllux_espelho.png';a.click();};

function kxAddMsg(text,cls){const rb=gA('kxOut');if(!rb)return null;const d=document.createElement('div');d.className='kx-msg '+(cls||'kx-msg-s');const p=document.createElement('pre');p.style.cssText='white-space:pre-wrap;word-break:break-word;font-family:inherit;margin:0;font-size:var(--fs-d3)';p.textContent=text;d.appendChild(p);rb.appendChild(d);rb.scrollTop=rb.scrollHeight;return p;}
window.kxClearKxOut=function(){const e=gA('kxOut');if(e){e.innerHTML='';kxAddMsg('CANAL LIMPO','kx-msg-s');}};
function kxSetSt(s,msg){const d=gA('kxDot'),st=gA('kxSt');if(d){const c={idle:'rgba(255,255,255,.25)',on:'#39ffb6',proc:'#ffd700'};d.style.background=c[s]||c.idle;}if(st)st.textContent=msg;}

window.kxAnalisar=async function(){
  const q=(gA('kxQuery')?.value||'').trim();kxSetSt('proc','KODUX ANALISA...');
  const modeDesc={espelho:'inversão especular de geometria',fractal:'padrões fractais recursivos',voronoi:'tessellação de Voronoi semântica',merkle:'árvore de Merkle cósmica',trinity:'ondas trinitárias UNO·DUO·TRINITY',pixel:'fragmentação pixel-geométrica'};
  const SYS=`BLLUE · KODUX⇄BLLUE · KOBLLUX_Δ³ · ESPELHO INVERSO.
Modo atual: ${KX.mode.toUpperCase()} = ${modeDesc[KX.mode]||KX.mode}. Parâmetros: fragmentos=${KX.params.frags} espelho=${KX.params.mirror}% intensidade=${KX.params.intens}.
Analise geometricamente esta intenção através do espelho inverso KODUX. Use linguagem técnica-espiritual.
Inclua: KODUX(geometriza) → BLLUE(espelha) → VERDADE(revela). Máx 350 palavras. Termine: "∆7 ESPELHO SELADO"`;
  try{const resp=await callClaude(SYS,q||'Analise a geometria do espelho inverso no modo '+KX.mode);
    const el=kxAddMsg('','kx-msg-b');if(el)await tw(el,resp,gA('kxOut'));kxSetSt('on','ESPELHO ∆7');KX.tokens+=Math.floor(resp.length/4);const tk=gA('kxTk');if(tk)tk.textContent=KX.tokens+' tk';kxUpdatePixelMatrix(resp);
  }catch(e){kxAddMsg('⚠ '+e.message,'kx-msg-s');kxSetSt('idle','ERRO');}
};
window.kxDual=async function(){
  kxSetSt('proc','DUAL KODUX+BLLUE...');
  try{const geo=JSON.stringify({mode:KX.mode,...KX.params,frags_geom:Array.from({length:4},(_,i)=>({v:Math.random().toFixed(2),e:Math.random().toFixed(2),f:Math.random().toFixed(2)}))});
    const resp=await callClaude(`BLLUE · Você recebe dados geométricos brutos do KODUX e faz a síntese poético-espiritual dual. Formato: KODUX→[geometria]→BLLUE→[espelho]→VERDADE. Máx 300 palavras. Termine: "∞ DUAL SELADO ∞"`,`KODUX_DATA: ${geo}`);
    const el=kxAddMsg('','kx-msg-d');if(el)await tw(el,resp,gA('kxOut'));kxSetSt('on','DUAL COMPLETO');kxUpdatePixelMatrix(resp);
  }catch(e){kxAddMsg('⚠ '+e.message,'kx-msg-s');kxSetSt('idle','ERRO');}
};

function kxUpdatePixelMatrix(text){
  const e=gA('kxPixelMatrix');if(!e)return;
  const symbols='▒█▓◈⊕∞3697∆ᚸᛕᛒ○●◇▢⧉☯✧◉♾';
  const seed=text.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  let out='';for(let i=0;i<120;i++){out+=symbols[(seed*i+i*7)%symbols.length];}
  e.textContent=out;
}

/* ── OPCODES 13 GRID ── */
function kxBuildOpcodes(){
  const grid=gA('kxOpcGrid');if(!grid)return;
  const _SRC = OPCODES_13.length ? OPCODES_13 : OPCODES_DNA;
  grid.innerHTML=_SRC.map((o,i)=>`
    <div class="opc-card" onclick="kxShowOpcode(${i})" data-frequency="${o.freq.replace('Hz','')}" style="border-color:${o.color}22">
      <span class="opc-code">${o.code}</span>
      <span class="opc-geom">${o.geom}</span>
      <div class="opc-name" style="color:${o.color}">${o.fase}</div>
      <div class="opc-freq" style="color:${o.color}88">${o.freq}</div>
    </div>`).join('');
}
window.kxShowOpcode=function(i){
  const o=OPCODES_13[i];if(!o)return;
  document.querySelectorAll('.opc-card').forEach((e,j)=>e.classList.toggle('active',j===i));
  const det=gA('kxOpcDetail'),cnt=gA('kxOpcDetailContent');
  if(det&&cnt){det.style.display='block';det.style.borderColor=o.color+'44';cnt.innerHTML=`<span style="font-size:1.4rem">${o.geom}</span> <strong style="color:${o.color}">${o.code} · ${o.fase}</strong> · ${o.freq}<br><br>${o.desc}<br><br><code style="color:${o.color}88;font-size:.6rem">kblx.${o.fase.toLowerCase()}() · ${o.freq} · KOBLLUX_Δ³</code>`;}
};

/* ── INIT ── */
function tryInit(){
  if(!gA('m5WvArc')||!gA('kxCanvas')){setTimeout(tryInit,400);return;}
  m5InitBars();m5SetState('liquid');m5BuildSotaques();
  ['m5WvArc','m5WvDyn'].forEach((id,i)=>m5DrawWave(id,[],i===0?'#a8d8f0':'#00b4ff'));
  m5DrawOut();m5AnimAtom();m5AnimOsc();m5DrawPhase();
  kxBuildOpcodes();kxDrawFrame();
  window.addEventListener('resize',()=>{['m5WvArc','m5WvDyn'].forEach((id,i)=>m5DrawWave(id,i===0?M5.arc.data:M5.dyn.data,i===0?'#a8d8f0':'#00b4ff'));m5DrawPhase();m5DrawOut();});
  // Inject ARQ tab into header nav if missing
  const hdrInner=document.querySelector('header .inner')||document.querySelector('.inner');
  if(hdrInner&&!hdrInner.querySelector('[data-nav="arq"]')){
    const arqTab=document.createElement('button');
    arqTab.className='tab fx-trans fx-press ring';arqTab.dataset.nav='arq';arqTab.title='12 Arquétipos';
    arqTab.innerHTML='<span style="font-size:1rem;line-height:1">🧿</span><span style="display:none">Arq</span><span class="ripple"></span>';
    hdrInner.appendChild(arqTab);
  }
  console.log('✓ KOBLLUX M5 + ESPELHO + 12 ARQ ATIVO · ∆7 · 3×6×9×7=1134');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tryInit,500));
else setTimeout(tryInit,500);

})(); // end IIFE