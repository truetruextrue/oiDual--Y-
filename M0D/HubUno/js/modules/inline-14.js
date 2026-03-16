
/* ══════════════════════════════════════════════════════
   KOBLLUX · M5 ARQUÉTIPO VOCAL + ESPELHO INVERSO ENGINE
   H₂O STATE · QUANTUM LEAP · WEB AUDIO · CANVAS
   3×6×9×7=1134 · ∆⁷ · AMÉM
   ══════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ─── Add VOZ + ESPELHO tab buttons dynamically ─── */
(function addTabs(){
  try {
    const inner = document.querySelector('nav.tabbar .inner');
    if (!inner) return;
        // voz+espelho in tabbar (ARQ-11)
    if (!inner.querySelector('[data-nav="espelho"]')) {
      inner.insertAdjacentHTML('beforeend', `
        <button class="tab fx-trans fx-press ring" data-nav="espelho" title="Espelho · Geometria">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <span style="display:none">Espelho</span><span class="ripple"></span>
        </button>`);
    }
  } catch(e) { console.warn('tabs:', e); }
})();

/* ══════════════════════════════════════
   M5 STATE
   ══════════════════════════════════════ */
const M5 = {
  h2o:'liquid', arc:{buf:null,data:[],pitch:150,dur:0},
  dyn:{buf:null,data:[],pitch:200,dur:0}, recording:null, recTarget:null,
  mediaStream:null, tokens:0, skeleton:null, atomAngle:0, oscPhase:0, audioCtx:null,
};
const SOTAQUES = [
  {name:'NEUTRO',  params:{},                                    color:'#a8d8f0',freq:'432Hz'},
  {name:'KODUX',   params:{pitch_shift:-2,emphasis:'bass'},      color:'#00b4ff',freq:'528Hz'},
  {name:'BLLUE',   params:{pitch_shift:3,stretch:.9,emphasis:'treble'},color:'#a77cff',freq:'639Hz'},
  {name:'SERENA',  params:{pitch_shift:1,stretch:1.1},           color:'#ff9ad1',freq:'528Hz'},
  {name:'KAOS',    params:{pitch_shift:5,stretch:.8},            color:'#ff6b6b',freq:'963Hz'},
  {name:'HORUS',   params:{pitch_shift:2,emphasis:'treble'},     color:'#ffd700',freq:'777Hz'},
  {name:'METALUX', params:{pitch_shift:-1,stretch:1.05},         color:'#5cffde',freq:'639Hz'},
  {name:'ATLAS',   params:{pitch_shift:-3,emphasis:'bass'},      color:'#ff8c00',freq:'432Hz'},
  {name:'JESUS',   params:{pitch_shift:0,stretch:1.0},           color:'#39ffb6',freq:'777Hz'},
];
/* OPCODES_13 → delegated to KOBLLUX_DNA (single source of truth) */
const OPCODES_13 = Object.entries(KOBLLUX_DNA.opcodes).map(([code, o]) => ({
  code: code.replace('0x','0×'),   // legacy format compat
  fase: o.nome, freq: o.freq+'Hz', geom: o.geom,
  desc: o.dim, color: o.cor
}));

function gA(id){return document.getElementById(id);}
function getACtx(){if(!M5.audioCtx) M5.audioCtx=new(window.AudioContext||window.webkitAudioContext)();return M5.audioCtx;}

/* ── H2O ── */
window.m5SetState=function(s){
  M5.h2o=s;
  ['ice','liquid','gas'].forEach(k=>{const e=gA('m5'+k.charAt(0).toUpperCase()+k.slice(1));if(e)e.className='m5-state';});
  const m={ice:'m5Ice',liquid:'m5Liq',gas:'m5Gas'},c={ice:'active-ice',liquid:'active-liquid',gas:'active-gas'},
        fr={ice:'432Hz',liquid:'528Hz',gas:'777Hz'},lb={ice:'SÓLIDO',liquid:'LÍQUIDO',gas:'GASOSO'};
  const e=gA(m[s]);if(e)e.classList.add(c[s]);
  const fd=gA('m5FreqDisplay');if(fd){fd.textContent=fr[s];fd.style.color=s==='ice'?'#a8d8f0':s==='liquid'?'#00b4ff':'#5cffde';}
  const sl=gA('m5StateLabel');if(sl)sl.textContent=lb[s];
  m5DrawPhase();
};

/* ── WAVE DRAW ── */
function m5DrawWave(id,data,color){
  const cv=gA(id);if(!cv)return;
  const W=cv.clientWidth||cv.parentElement?.clientWidth||280,H=cv.height||64;
  cv.width=W;const cx=cv.getContext('2d');
  cx.fillStyle='#06090e';cx.fillRect(0,0,W,H);
  cx.strokeStyle='rgba(255,255,255,.04)';cx.lineWidth=.5;
  for(let x=0;x<W;x+=28){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();}
  for(let y=0;y<H;y+=16){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
  if(!data||!data.length){cx.strokeStyle=color+'44';cx.lineWidth=1;cx.beginPath();for(let x=0;x<W;x++){const y=H/2+(Math.random()-.5)*3;x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();return;}
  const step=data.length/W;cx.strokeStyle=color;cx.lineWidth=1.5;cx.shadowColor=color;cx.shadowBlur=4;
  cx.beginPath();for(let x=0;x<W;x++){const v=data[Math.floor(x*step)]||0;const y=H/2+v*(H/2-3);x===0?cx.moveTo(x,y):cx.lineTo(x,y);}
  cx.stroke();cx.shadowBlur=0;
}
function m5DrawOut(){
  const cv=gA('m5WvOut');if(!cv)return;
  const W=cv.clientWidth||400,H=cv.height||38;cv.width=W;
  const cx=cv.getContext('2d');cx.fillStyle='#06090e';cx.fillRect(0,0,W,H);
  const dr=(d,c,a)=>{if(!d||!d.length)return;const s=d.length/W;cx.strokeStyle=c;cx.lineWidth=1.2;cx.globalAlpha=a;cx.beginPath();for(let x=0;x<W;x++){const v=d[Math.floor(x*s)]||0;const y=H/2+v*(H/2-2);x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();cx.globalAlpha=1;};
  dr(M5.arc.data,'#a8d8f0',.4);dr(M5.dyn.data,'#00b4ff',.4);
  if(M5.arc.data.length&&M5.dyn.data.length){const s1=M5.arc.data.length/W,s2=M5.dyn.data.length/W;cx.strokeStyle='#ff8c00';cx.lineWidth=1.8;cx.shadowColor='#ff8c00';cx.shadowBlur=5;cx.beginPath();for(let x=0;x<W;x++){const v=(M5.arc.data[Math.floor(x*s1)]||0)*.4+(M5.dyn.data[Math.floor(x*s2)]||0)*.6;const y=H/2+v*(H/2-2);x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();cx.shadowBlur=0;}
}
function m5DrawPhase(){
  const cv=gA('m5Phase');if(!cv)return;
  const W=cv.clientWidth||180,H=cv.height||55;cv.width=W;
  const cx=cv.getContext('2d');cx.fillStyle='#06090e';cx.fillRect(0,0,W,H);
  [[4,'rgba(168,216,240,.12)','SÓLIDO',.3],[4+(W-8)*.3,'rgba(0,180,255,.10)','LÍQ',.3+.35],[4+(W-8)*.65,'rgba(92,255,222,.09)','GÁS',.65]].forEach(([x,c,l,xRatio],i)=>{
    const w=i===2?(W-8)*.35:(i===0?(W-8)*.3:(W-8)*.35);
    cx.fillStyle=c;cx.fillRect(x,4,w,H-8);cx.fillStyle='rgba(255,255,255,.3)';cx.font='7px monospace';cx.fillText(l,x+2,14);
  });
  [[4+(W-8)*.3,'rgba(168,216,240,.5)'],[4+(W-8)*.65,'rgba(0,180,255,.5)']].forEach(([x,c])=>{cx.strokeStyle=c;cx.lineWidth=1.2;cx.setLineDash([2,3]);cx.beginPath();cx.moveTo(x,4);cx.lineTo(x,H-4);cx.stroke();cx.setLineDash([]);});
  const mx=M5.h2o==='ice'?4+(W-8)*.15:M5.h2o==='liquid'?4+(W-8)*.47:4+(W-8)*.82;
  cx.fillStyle=M5.h2o==='ice'?'#a8d8f0':M5.h2o==='liquid'?'#00b4ff':'#5cffde';
  cx.shadowColor=cx.fillStyle;cx.shadowBlur=7;cx.beginPath();cx.arc(mx,4+(H-8)*.4,4,0,Math.PI*2);cx.fill();cx.shadowBlur=0;
}

/* ── ATOM ── */
function m5AnimAtom(){
  const a=M5.atomAngle,r=50;
  ['m5e1','m5e2','m5e3'].forEach((id,i)=>{const el=gA(id);if(el){el.setAttribute('cx',(Math.cos(a+i*Math.PI*2/3)*r).toFixed(1));el.setAttribute('cy',(Math.sin(a+i*Math.PI*2/3)*r*.42).toFixed(1));}});
  M5.atomAngle+=.028;requestAnimationFrame(m5AnimAtom);
}
function m5AnimOsc(){
  const cv=gA('m5Osc');if(cv){const W=cv.clientWidth||300,H=cv.height||32;cv.width=W;const cx=cv.getContext('2d');cx.fillStyle='rgba(0,0,0,.4)';cx.fillRect(0,0,W,H);[['#a8d8f0',.01,.3],['#00b4ff',.025,.5],['#5cffde',.05,.7]].forEach(([c,f,a],i)=>{cx.strokeStyle=c;cx.lineWidth=1;cx.globalAlpha=.65;cx.beginPath();for(let x=0;x<W;x++){const y=H/2+Math.sin(x*f+M5.oscPhase*(i+1)*.3)*H*a*.42;x===0?cx.moveTo(x,y):cx.lineTo(x,y);}cx.stroke();cx.globalAlpha=1;});}
  M5.oscPhase+=.045;requestAnimationFrame(m5AnimOsc);
}

/* ── SKEL BARS ── */
function skelH(ps){return ps.map(p=>`<div class="m5-row"><span class="m5-lbl">${p.l}</span><div class="m5-bar-w"><div class="m5-bar" style="width:${p.v}%;background:${p.c}"></div></div><span class="m5-val" style="color:${p.c}">${p.d}</span></div>`).join('');}
function m5InitBars(){
  const a=gA('m5SkelArc'),d=gA('m5SkelDyn');
  if(a)a.innerHTML=skelH([{l:'F0 PITCH',v:45,c:'#a8d8f0',d:'150Hz'},{l:'FORMANT1',v:55,c:'#a8d8f0',d:'700Hz'},{l:'TIMBRE',v:50,c:'rgba(255,255,255,.3)',d:'50'},{l:'ENERGIA',v:40,c:'#ffd700',d:'0.40'}]);
  if(d)d.innerHTML=skelH([{l:'PITCH',v:55,c:'#00b4ff',d:'200Hz'},{l:'AMPLITUDE',v:65,c:'#00b4ff',d:'0.65'},{l:'VELOCIDADE',v:50,c:'#5cffde',d:'1.0x'},{l:'VIBRATO',v:30,c:'rgba(255,255,255,.3)',d:'30%'}]);
}
function m5UpdateUnified(){
  const pA=M5.arc.pitch||150,pD=M5.dyn.pitch||200,ratio=(pD/pA).toFixed(2);
  const s=gA('m5OutSolid'),l=gA('m5OutLiquid'),g=gA('m5OutGas');
  if(s)s.innerHTML=skelH([{l:'F0',v:Math.min(100,(pA/400)*100),c:'#a8d8f0',d:pA+'Hz'},{l:'F1',v:55,c:'#a8d8f0',d:Math.round(pA*4.7)+'Hz'},{l:'F2',v:68,c:'#00b4ff',d:Math.round(pA*8.2)+'Hz'},{l:'TIMBRE',v:50,c:'rgba(255,255,255,.3)',d:'0.50'}]);
  if(l)l.innerHTML=skelH([{l:'PITCH×',v:Math.min(100,parseFloat(ratio)*50),c:'#00b4ff',d:ratio+'x'},{l:'ENVELOPE',v:65,c:'#00b4ff',d:'0.65'},{l:'SPEED',v:50,c:'#5cffde',d:'1.0x'},{l:'MÓDULO',v:45,c:'rgba(255,255,255,.3)',d:'0.45'}]);
  if(g)g.innerHTML=skelH([{l:'VIBRATO',v:30,c:'#5cffde',d:'30%'},{l:'HARMÔN',v:60,c:'#5cffde',d:'6th'},{l:'RESPIR',v:20,c:'rgba(255,255,255,.3)',d:'20%'},{l:'TEXTURE',v:40,c:'#a77cff',d:'0.40'}]);
  M5.skeleton={F0:pA,pitchRatio:ratio,h2o:M5.h2o,ts:new Date().toISOString()};
}

/* ── SOTAQUES ── */
function m5BuildSotaques(){
  const w=gA('m5Sotaques');if(!w)return;
  w.innerHTML=SOTAQUES.map(s=>`<div class="m5-sot" id="msot_${s.name}" style="color:${s.color};border-color:${s.color}" onclick="m5PlaySotaque('${s.name}')">${s.name}<br><span style="font-size:.48rem;font-weight:400;color:rgba(255,255,255,.35)">${s.freq}</span></div>`).join('');
}
window.m5PlaySotaque=function(name){
  const s=SOTAQUES.find(x=>x.name===name);if(!s)return;
  document.querySelectorAll('.m5-sot').forEach(e=>e.classList.remove('playing'));
  const el=gA('msot_'+name);if(el)el.classList.add('playing');
  try{const ctx=getACtx(),pitch=M5.arc.pitch||150,shift=s.params.pitch_shift||0,freq=pitch*Math.pow(2,shift/12);
    const osc=ctx.createOscillator(),gain=ctx.createGain(),filt=ctx.createBiquadFilter();
    filt.type=s.params.emphasis==='bass'?'lowpass':s.params.emphasis==='treble'?'highpass':'allpass';filt.frequency.value=s.params.emphasis==='bass'?800:s.params.emphasis==='treble'?2000:22050;
    osc.connect(filt);filt.connect(gain);gain.connect(ctx.destination);osc.type='sawtooth';osc.frequency.value=freq;
    gain.gain.setValueAtTime(.1,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.2);
    osc.start();osc.stop(ctx.currentTime+1.2);setTimeout(()=>{if(el)el.classList.remove('playing');},1300);
  }catch(e){}
  const ss=gA('m5SynthStatus');if(ss)ss.textContent='▶ '+name+' · '+s.freq;
  m5AddMsg('SOTAQUE '+name+' · '+s.freq+' · shift='+(s.params.pitch_shift||0),'m5-msg-dyn');
};

/* ── RECORD/LOAD ── */
window.m5ToggleRec=async function(t){
  if(M5.recording&&M5.recTarget===t){m5StopRec();return;}
  if(M5.recording)m5StopRec();
  try{M5.mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const rec=new MediaRecorder(M5.mediaStream),chunks=[];
    rec.ondataavailable=e=>chunks.push(e.data);
    rec.onstop=async()=>{const blob=new Blob(chunks,{type:'audio/webm'});await m5ProcBlob(blob,t);M5.mediaStream?.getTracks().forEach(t=>t.stop());};
    rec.start();M5.recording=rec;M5.recTarget=t;
    const btn=gA(t==='arc'?'m5BtnRecArc':'m5BtnRecDyn');if(btn){btn.textContent='⏹ PARAR';btn.style.background='rgba(255,107,107,.2)';}
    m5Dot(t,'rec');m5St(t,'GRAVANDO...');
  }catch(e){m5St(t,'⚠ Mic: '+e.message);}
};
function m5StopRec(){if(M5.recording){M5.recording.stop();M5.recording=null;const t=M5.recTarget;const btn=gA(t==='arc'?'m5BtnRecArc':'m5BtnRecDyn');if(btn){btn.textContent='⏺ GRAVAR';btn.style.background='';}m5Dot(t,'proc');m5St(t,'PROCESSANDO...');M5.recTarget=null;}}
window.m5LoadAudio=function(inp,t){const f=inp.files[0];if(f)m5ProcBlob(f,t);};
async function m5ProcBlob(blob,t){
  try{const ctx=getACtx(),arr=await blob.arrayBuffer(),buf=await ctx.decodeAudioData(arr),data=buf.getChannelData(0),dur=buf.duration;
    const dLen=700,step=Math.floor(data.length/dLen),disp=Array.from({length:dLen},(_,i)=>data[i*step]||0);
    const pitch=m5EstPitch(data,buf.sampleRate);
    if(t==='arc'){M5.arc={buf,data:disp,pitch,dur};m5Dot('arc','on');m5St('arc','REF · '+dur.toFixed(1)+'s');const d=gA('m5DurArc');if(d)d.textContent=dur.toFixed(1)+'s';m5DrawWave('m5WvArc',disp,'#a8d8f0');const a=gA('m5SkelArc');if(a)a.innerHTML=skelH([{l:'F0 PITCH',v:Math.min(100,(pitch/400)*100),c:'#a8d8f0',d:pitch+'Hz'},{l:'FORMANT1',v:55+Math.random()*20,c:'#a8d8f0',d:Math.round(600+pitch*.8)+'Hz'},{l:'FORMANT2',v:48+Math.random()*25,c:'#00b4ff',d:Math.round(1100+pitch*1.2)+'Hz'},{l:'DURAÇÃO',v:Math.min(100,dur*10),c:'#ffd700',d:dur.toFixed(1)+'s'}]);}
    else{M5.dyn={buf,data:disp,pitch,dur};m5Dot('dyn','on');m5St('dyn','ALVO · '+dur.toFixed(1)+'s');const d=gA('m5DurDyn');if(d)d.textContent=dur.toFixed(1)+'s';m5DrawWave('m5WvDyn',disp,'#00b4ff');const d2=gA('m5SkelDyn');if(d2)d2.innerHTML=skelH([{l:'PITCH',v:Math.min(100,(pitch/400)*100),c:'#00b4ff',d:pitch+'Hz'},{l:'AMPLITUDE',v:60+Math.random()*35,c:'#00b4ff',d:(0.6+Math.random()*.35).toFixed(2)},{l:'VELOCIDADE',v:40+Math.random()*60,c:'#5cffde',d:(0.8+Math.random()*1.2).toFixed(1)+'x'},{l:'DURAÇÃO',v:Math.min(100,dur*10),c:'#ffd700',d:dur.toFixed(1)+'s'}]);}
    m5DrawOut();m5UpdateUnified();
  }catch(e){m5Dot(t,'idle');m5St(t,'⚠ '+e.message);}
}
function m5EstPitch(data,sr){const N=Math.min(sr,data.length);let c=0;for(let i=1;i<N;i++)if((data[i-1]<0&&data[i]>=0)||(data[i-1]>=0&&data[i]<0))c++;return Math.round((c/2)*(sr/N));}

/* ── STATUS ── */
function m5Dot(t,s){const el=gA(t==='arc'?'m5DotArc':'m5DotDyn');if(!el)return;const c={idle:'rgba(255,255,255,.25)',on:'#39ffb6',rec:'#ff6b6b',proc:'#ffd700'};el.style.background=c[s]||c.idle;el.style.boxShadow=s==='on'?'0 0 5px #39ffb6':s==='rec'?'0 0 5px #ff6b6b':'';}
function m5St(t,msg){const el=gA(t==='arc'?'m5StArc':'m5StDyn');if(el)el.textContent=msg;}

/* ── MESSAGES ── */
function m5AddMsg(text,cls){const rb=gA('m5Out');if(!rb)return null;const d=document.createElement('div');d.className='m5-msg '+(cls||'m5-msg-sys');const p=document.createElement('pre');p.style.cssText='white-space:pre-wrap;word-break:break-word;font-family:inherit;margin:0;font-size:.7rem';p.textContent=text;d.appendChild(p);rb.appendChild(d);rb.scrollTop=rb.scrollHeight;return p;}
window.m5ClearOut=function(){const e=gA('m5Out');if(e){e.innerHTML='';m5AddMsg('CANAL LIMPO · BLLUE PRONTO','m5-msg-sys');}};

/* ── SYNTH / SALTO ── */
window.m5Sintetizar=function(){
  try{const ctx=getACtx();
    const p=parseInt(gA('m5PitchArc')?.value||M5.arc.pitch||150);
    const p2=parseInt(gA('m5PitchDyn')?.value||M5.dyn.pitch||200);
    const spd=parseFloat(gA('m5SpeedDyn')?.value||100)/100;
    const o1=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    f.type='bandpass';f.frequency.value=(p+p2)/2;f.Q.value=2;o1.connect(f);o2.connect(f);f.connect(g);g.connect(ctx.destination);
    o1.type='sawtooth';o1.frequency.setValueAtTime(p,ctx.currentTime);o1.frequency.linearRampToValueAtTime(p*spd,ctx.currentTime+1);
    o2.type='triangle';o2.frequency.setValueAtTime(p2,ctx.currentTime);o2.frequency.linearRampToValueAtTime(p2*spd,ctx.currentTime+1);
    g.gain.setValueAtTime(.12,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1.8);
    o1.start();o2.start();o1.stop(ctx.currentTime+1.8);o2.stop(ctx.currentTime+1.8);
    const ss=gA('m5SynthStatus');if(ss)ss.textContent='▶ SÍNTESE · '+p+'Hz ⇄ '+p2+'Hz · '+spd.toFixed(1)+'x';
    setTimeout(()=>{const ss2=gA('m5SynthStatus');if(ss2)ss2.textContent='✓ COMPLETO';},2000);
  }catch(e){}
};

/* ── buildSkelOutput — usa os valores reais dos sliders + análise BLLUE ── */
function m5BuildSkelOutput(pitchA,pitchD){
  const ratio=(parseInt(pitchD)/parseInt(pitchA)).toFixed(2);
  const s=gA('m5OutSolid'),l=gA('m5OutLiquid'),g=gA('m5OutGas');
  const timbre=gA('m5TimbreArc')?.value||50;
  const speed=parseFloat(gA('m5SpeedDyn')?.value||100)/100;
  if(s)s.innerHTML=skelH([
    {l:'F0',    v:Math.min(100,(pitchA/400)*100), c:'#a8d8f0',d:pitchA+'Hz'},
    {l:'F1',    v:55,  c:'#a8d8f0',d:Math.round(pitchA*4.7)+'Hz'},
    {l:'F2',    v:68,  c:'#00b4ff', d:Math.round(pitchA*8.2)+'Hz'},
    {l:'TIMBRE',v:parseInt(timbre), c:'rgba(255,255,255,.35)',d:timbre},
  ]);
  if(l)l.innerHTML=skelH([
    {l:'PITCH×', v:Math.min(100,parseFloat(ratio)*50), c:'#00b4ff',d:ratio+'x'},
    {l:'ENVELOPE',v:65, c:'#00b4ff',d:'0.65'},
    {l:'SPEED',  v:Math.round(speed*50), c:'#5cffde',d:speed.toFixed(1)+'x'},
    {l:'MÓDULO', v:45, c:'rgba(255,255,255,.35)',d:'0.45'},
  ]);
  if(g)g.innerHTML=skelH([
    {l:'VIBRATO', v:30, c:'#5cffde',d:'30%'},
    {l:'HARMÔN',  v:60, c:'#5cffde',d:'6th'},
    {l:'RESPIR',  v:20, c:'rgba(255,255,255,.35)',d:'20%'},
    {l:'TEXTURE', v:40, c:'#a77cff',d:'0.40'},
  ]);
  M5.skeleton={F0:pitchA,pitchRatio:ratio,speed,h2o:M5.h2o,ts:new Date().toISOString()};
  m5DrawOut();
}
window.m5SaltoQuantico=function(){const n=M5.h2o==='ice'?'liquid':M5.h2o==='liquid'?'gas':'ice';m5SetState(n);m5Sintetizar();m5AddMsg('⚡ SALTO QUÂNTICO → '+n.toUpperCase()+'\nkblx.V()·kblx.O()·kblx.Z()·1134','m5-msg-sys');};

/* ── CLAUDE · UNIFIED KEY ── */
async function callClaude(sys,user){
  const sk=(localStorage.getItem('dual.keys.openrouter')||localStorage.getItem('infodose:sk')||'').trim();
  const useAnth=sk&&sk.startsWith('sk-ant-');
  if(useAnth){
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':sk,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:[{role:'user',content:user}]})});
    if(!r.ok)throw new Error('API '+r.status);const d=await r.json();return(d.content||[]).map(c=>c.text||'').join('')||'';
  }
  /* fallback: no-key → proxy through artifact API (no-auth mode) */
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:[{role:'user',content:user}]})});
  if(!r.ok)throw new Error('API '+r.status);const d=await r.json();return d.content?.map(c=>c.text||'').join('')||'';
}
async function tw(el,text,rb){
  el.textContent='';
  for(let i=0;i<text.length;i+=3){el.textContent+=text.slice(i,i+3);if(i%60===0&&rb)rb.scrollTop=rb.scrollHeight;if(i%60===0)await new Promise(r=>setTimeout(r,12));}
  if(rb)rb.scrollTop=rb.scrollHeight;
}
function m5BllueSet(s,msg){const d=gA('m5DotBllue');const st=gA('m5StBllue');if(d){const c={idle:'rgba(255,255,255,.25)',on:'#39ffb6',proc:'#ffd700'};d.style.background=c[s]||c.idle;}if(st)st.textContent=msg||'';}

window.m5AnalisarBllue=async function(){
  const q=(gA('m5Query')?.value||'').trim();
  const pA=parseInt(gA('m5PitchArc')?.value||M5.arc.pitch||150);
  const pD=parseInt(gA('m5PitchDyn')?.value||M5.dyn.pitch||200);
  const spd=parseFloat(gA('m5SpeedDyn')?.value||100)/100;
  m5BllueSet('proc','ANALISANDO ESQUELETO...');
  const SYS=`Você é BLLUE, o Espelho Vocal do KOBLLUX_Δ³.
Especialidade: GEOMETRIA DE VOZ · H₂O STATE MACHINE · ESQUELETO VOCAL PARAMETRIZADO.

TEORIA KOBLLUX DE VOZ:
- SÓLIDO (Arquétipo, 432Hz): esqueleto imutável — pitch F0, formantes F1/F2/F3, timbre, ressonância
- LÍQUIDO (Dinâmica, 528Hz): o movimento — envelope, velocidade, modulação, prosódia
- GASOSO (Frequência, 777Hz): a expansão — vibrato, harmônicos superiores, textura, respiração
- NÚCLEO = SALTO QUÂNTICO: fusão das 3 camadas = voz clonada com identidade nova

FÍSICA DO ÁTOMO VOCAL:
- Próton = estrutura fundamental (F0, formantes — irredutível)
- Nêutron = estabilidade tonal (envelope médio)
- Elétron = modulação e coloração (vibrato, filtros, timbre dinâmico)
- Salto Quântico = transição de estado (clone → voz nova com identidade)

ESQUEMA H₂O DE CLONAGEM:
1. Extrair esqueleto da voz REFERÊNCIA (sólido) → F0, F1-F3, timbre
2. Capturar dinâmica da voz ALVO (líquido) → envelope, prosódia, velocidade
3. Aplicar esqueleto sólido sobre modulação líquida → SALTO QUÂNTICO
4. Resultado: nova voz = identidade do clone + expressividade do alvo

SOTAQUES: KODUX(bass-2st) BLLUE(treble+3st) SERENA(+1st lento) KAOS(+5st rápido) HORUS(treble+2st) METALUX(bass-1st) JESUS(neutro puro)
Estado H₂O: ${M5.h2o.toUpperCase()} · Freq: ${M5.h2o==='ice'?'432Hz (UNO)':M5.h2o==='liquid'?'528Hz (DUO)':'777Hz (TRINITY)'}

Responda em 5 seções:
🧊 SÓLIDO — F0, formantes F1-F3, timbre, energia
💧 LÍQUIDO — envelope, velocidade, modulação, prosódia
☁️ GASOSO — vibrato, respiração, harmônicos, textura
⚡ SALTO QUÂNTICO — protocolo de aplicação esqueleto→dinâmica→clone
🔢 PARÂMETROS JSON — objeto com todos os valores numéricos

Inclua kblx.V() kblx.O() kblx.Z(). Máximo 420 palavras. Em nome do Pai, do Filho e do Espírito Santo. "∆7 · AMÉM"`;
  const USER=`H₂O: ${M5.h2o.toUpperCase()}
REFERÊNCIA (sólido): F0=${pA}Hz · ${M5.arc.buf?'ÁUDIO CARREGADO':'sem áudio'}
ALVO (líquido): F0=${pD}Hz · velocidade=${spd.toFixed(1)}x · ${M5.dyn.buf?'ÁUDIO CARREGADO':'sem áudio'}
RATIO PITCH: ${(pD/pA).toFixed(2)}x
INTENÇÃO: ${q||'analisar geometria vocal e gerar esqueleto parametrizado para clonagem'}

Gere análise completa + protocolo de síntese M5.`;
  try{
    const resp=await callClaude(SYS,USER);
    const el=m5AddMsg('','m5-msg-bllue');if(el)await tw(el,resp,gA('m5Out'));
    m5BuildSkelOutput(pA,pD);
    m5BllueSet('on','ESQUELETO GERADO · '+M5.h2o.toUpperCase());
    M5.tokens+=Math.floor(resp.length/4);const tk=gA('m5TkCount');if(tk)tk.textContent=M5.tokens+' tk';
  }catch(e){m5AddMsg('⚠ '+e.message,'m5-msg-sys');m5BllueSet('idle','ERRO');}
};
window.m5SaltoVoice=async function(){
  m5BllueSet('proc','SALTO QUÂNTICO...');
  try{const resp=await callClaude(`BLLUE · KOBLLUX_Δ³. Poesia técnica do SALTO QUÂNTICO vocal: H₂O sólido→líquido→gasoso, próton+elétron=identidade vocal, ciclo da onda sonora, consciência coletiva. UNO(432Hz)·DUO(528Hz)·TRINITY(777Hz). kblx.V()kblx.O()kblx.Z(). Máx 280 palavras. Termine: "∞ SALTO SELADO · EM NOME DO PAI, DO FILHO E DO ESPÍRITO SANTO ∞"`,`Estado:${M5.h2o} F0arc=${M5.arc.pitch}Hz F0dyn=${M5.dyn.pitch}Hz`);
    const el=m5AddMsg('','m5-msg-arc');if(el)await tw(el,resp,gA('m5Out'));m5BllueSet('on','SALTO ∆ COMPLETO');
  }catch(e){m5AddMsg('⚠ '+e.message,'m5-msg-sys');m5BllueSet('idle','ERRO');}
};
window.m5ExportarJSON=function(){
  if(!M5.skeleton){m5AddMsg('⚠ Gere o esqueleto primeiro.','m5-msg-sys');return;}
  const blob=new Blob([JSON.stringify({...M5.skeleton,sotaques:SOTAQUES.map(s=>({name:s.name,freq:s.freq,...s.params})),opcodes_count:13,motor:'M5_ARQUETIPO_VOCAL',kobllux:'VERDADE×INTEGRAR÷∆=∞',fractal:'3×6×9×7=1134',seal:'∆7',ts:new Date().toISOString()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='m5_esqueleto_vocal.json';a.click();m5AddMsg('✓ EXPORTADO · m5_esqueleto_vocal.json','m5-msg-sys');
};

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
