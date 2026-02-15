
/* Helpers & LocalStorage */
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}, set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}, raw:(k)=>localStorage.getItem(k)||''};
function addRipple(el){ if(!el) return; if(!el.querySelector('.ripple')){const s=document.createElement('span'); s.className='ripple'; el.appendChild(s);} }
$$('button').forEach(addRipple);
const dualState={perf:localStorage.getItem('hub.perf')||'med', voice:localStorage.getItem('hub.voice')||'Nova', logs:[]};
function dualLog(msg){ const e='['+new Date().toLocaleTimeString()+'] '+msg; dualState.logs.unshift(e); const l=$('#logs'); if(l) l.textContent=dualState.logs.slice(0,60).join('\n');}
const toastBox=document.createElement('div'); toastBox.style.cssText='position:fixed;right:14px;bottom:calc(var(--tabsH) + 16px);display:grid;gap:8px;z-index:120'; document.body.appendChild(toastBox);
function toast(msg,type='ok'){ const el=document.createElement('div'); el.className='fx-trans';
  const bg= type==='ok'?'linear-gradient(90deg,#1b2a2a,#123c2e)':(type==='warn'?'linear-gradient(90deg,#2f261b,#3c2d12)':'linear-gradient(90deg,#2f1b1b,#3c1212)');
  el.style.cssText=`background:${bg};color:var(--fg);border:${getComputedStyle(document.documentElement).getPropertyValue('--bd')};padding:.6rem .8rem;border-radius:12px;box-shadow:var(--shadow)`;
  el.textContent=msg; toastBox.appendChild(el); setTimeout(()=>{el.style.opacity=.0; el.style.transform='translateY(6px)'; setTimeout(()=>el.remove(),220)},1600);}
if(!LS.get('uno:theme')) LS.set('uno:theme','medium');
applyTheme();
function applyTheme(){
  const theme=LS.get('uno:theme','medium');
  if(theme==='default') delete document.body.dataset.theme; else document.body.dataset.theme=theme;
  const bg=$('#custom-bg'); if(!bg) return; if(theme!=='custom'){ bg.innerHTML=''; return; }
  const d=LS.get('uno:bg',''); bg.innerHTML=''; if(!d) return;
  if(/^data:video\//.test(d)){ const v=document.createElement('video'); Object.assign(v,{src:d,autoplay:true,loop:true,muted:true,playsInline:true}); v.style.width='100%'; v.style.height='100%'; v.style.objectFit='cover'; bg.appendChild(v);}
  else { const i=document.createElement('img'); i.src=d; i.style.width='100%'; i.style.height='100%'; i.style.objectFit='cover'; bg.appendChild(i); }
}
function showArchMessage(text,type='info'){ const el=$('#archMsg'); if(!el) return; el.textContent=text;
  if(type==='ok'){el.style.background='rgba(57,255,182,0.75)'; el.style.color='#0b0f14';}
  else if(type==='warn'){el.style.background='rgba(255,184,107,0.78)'; el.style.color='#0b0f14';}
  else if(type==='err'){el.style.background='rgba(255,107,107,0.78)'; el.style.color='#0b0f14';}
  else{el.style.background='rgba(15,17,32,0.72)'; el.style.color='';}
  el.classList.add('show'); clearTimeout(el._tm); el._tm=setTimeout(()=>el.classList.remove('show'),4000);
}
function speakWithActiveArch(text){ try{
  const sel=$('#arch-select'); let f=sel?sel.value||'':''; const key=(f.replace(/\.html$/i,'')||'Nova'); const saved=LS.get('infodose:voices',{})||{};
  const voices=speechSynthesis.getVoices(); let voice=saved[key] ? voices.find(v=>v.name===saved[key]) : voices.find(v=>v.lang&&(v.lang.startsWith('pt')||v.lang.startsWith('en')));
  if(!voice && voices.length) voice=voices[0]; if(!voice) return; const u=new SpeechSynthesisUtterance(text); u.voice=voice; speechSynthesis.cancel(); speechSynthesis.speak(u);
}catch(e){} }
function nav(key){
  const tabs=['home','apps','stack','chat','brain'];
  tabs.forEach(k=>{$('#v-'+k).classList.toggle('active',k===key); $(`.tab[data-nav="${k}"]`).classList.toggle('active',k===key);});
  LS.set('uno:lastTab',key);
  const phrases={home:'Página inicial',apps:'Abrindo apps',stack:'Abrindo stack',brain:'Abrindo usuário',chat:'Abrindo chat'};
  if(phrases[key]){ speakWithActiveArch(phrases[key]); showArchMessage(phrases[key]); }
  if(key==='home') updateHomeStatus();
}
$$('.tab,[data-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.nav||'home')));
$('#btnBack').onclick=()=>{ try{history.length>1&&history.back()}catch{} };
$('#btnBrain').onclick=()=>nav('brain');
const last=LS.get('uno:lastTab','home'); nav(last);
const RAW={apps:[]};
(function loadEmbeddedApps(){
  try{ const raw=JSON.parse($('#APPS_JSON').textContent||'{}'); RAW.apps=Array.isArray(raw.apps)?raw.apps:[] }catch{ RAW.apps=[] }
  updateHomeStatus();
})();
function updateHomeStatus(){
  try{ const total=(RAW.apps||[]).length; const el=$('#homeAppsStatus'); if(el) el.textContent=total+' app'+(total===1?'':'s'); }catch(e){}
  try{ const sess=document.querySelectorAll('#stackWrap .session').length; const el=$('#homeStackStatus'); if(el) el.textContent=sess+' sessão'+(sess===1?'':'s'); }catch(e){}
  try{ const name=(localStorage.getItem('infodose:userName')||'').trim(); const theme=LS.get('uno:theme','medium');
       const label={'default':'padrão','medium':'cinza','custom':'personalizado'}[theme]||theme;
       const el=$('#homeUserStatus'); if(el) el.textContent=(name||'Usuário')+' · '+label; }catch(e){}
  try{ const sel=$('#arch-select'); let n=''; if(sel&&sel.options.length){ const opt=sel.options[sel.selectedIndex]; if(opt) n=opt.textContent.replace(/\.html$/i,''); }
       const el=$('#homeArchStatus'); if(el) el.textContent=n||'Nenhum'; }catch(e){}
}
(function(){
  const list=['luxara.html','rhea.html','aion.html','atlas.html','nova.html','genus.html','lumine.html','kaion.html','kaos.html','horus.html','elysha.html'];
  const sel=$('#arch-select'), frame=$('#arch-frame'), fade=$('#arch-fadeCover'); let cur=0;
  function populate(){ sel.innerHTML=''; list.forEach(n=>{ const o=document.createElement('option'); o.value=n; o.textContent=n; sel.appendChild(o); }); }
  function setSrcByIndex(i){ if(!list.length) return; const n=(i+list.length)%list.length; cur=n; sel.selectedIndex=n; const file=list[n]; frame.src='./archetypes/'+file;
    try{ speakWithActiveArch('Olá, eu sou '+file.replace(/\.html$/i,'')); }catch(e){} updateHomeStatus(); }
  populate(); if(list.length) setSrcByIndex(0);
  $('#arch-prev').addEventListener('click',()=>{ fade.classList.add('show'); setTimeout(()=>{ setSrcByIndex(cur-1); setTimeout(()=>fade.classList.remove('show'),200); },140); });
  $('#arch-next').addEventListener('click',()=>{ fade.classList.add('show'); setTimeout(()=>{ setSrcByIndex(cur+1); setTimeout(()=>fade.classList.remove('show'),200); },140); });
  sel.addEventListener('change',()=>{ cur=sel.selectedIndex; fade.classList.add('show'); setTimeout(()=>{ setSrcByIndex(cur); setTimeout(()=>fade.classList.remove('show'),200); },140); });
})();
(function initAudioRipple(){
  const clickLayer=$('#audioRipple'); const archCircleEl=document.querySelector('.arch-circle'); if(!clickLayer||!archCircleEl) return;
  let enabled=false, audioCtx=null, analyser=null, micStream=null;
  async function start(){ try{ const stream=await navigator.mediaDevices.getUserMedia({audio:true}); micStream=stream;
      audioCtx=new (window.AudioContext||window.webkitAudioContext)(); const src=audioCtx.createMediaStreamSource(stream);
      analyser=audioCtx.createAnalyser(); analyser.fftSize=256; src.connect(analyser); animate(); }catch(e){ toast('Não foi possível acessar o microfone.','err'); enabled=false; archCircleEl.classList.remove('audio-on'); } }
  function stop(){ if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; } if(audioCtx){ try{audioCtx.close()}catch{} audioCtx=null; archCircleEl.style.boxShadow=''; } }
  function animate(){ if(!enabled||!analyser) return; const buf=new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(buf);
    let sum=0; for(let i=0;i<buf.length;i++){ const v=(buf[i]-128)/128; sum+=v*v; } const rms=Math.sqrt(sum/buf.length);
    const intensity=Math.min(0.8, rms*4), blur=rms*80; archCircleEl.style.boxShadow=`0 0 ${blur}px rgba(255,255,255,${intensity})`; requestAnimationFrame(animate); }
  clickLayer.addEventListener('click', ()=> startDualInteraction());
  window.toggleAudio=function(){ enabled=!enabled; archCircleEl.classList.toggle('audio-on',enabled); if(enabled) start(); else stop(); };
})();
function startDualInteraction(){ const archCircle=$('.arch-circle'); if(!archCircle) return; archCircle.classList.add('pressed'); setTimeout(()=>archCircle.classList.remove('pressed'),180);
  const greet='Oi Dual'; showArchMessage(greet,'ok'); try{ speakWithActiveArch(greet);}catch{} }
const MODELS=['openrouter/auto','anthropic/claude-3.5-sonnet','openai/gpt-4.1-mini','google/gemini-1.5-pro','meta/llama-3.1-405b-instruct','mistral/mistral-large-latest'];
(function initBrain(){ const sel=$('#model'); sel.innerHTML=''; MODELS.forEach(m=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o) });
  sel.value=LS.get('dual.openrouter.model', MODELS[0]); $('#sk').value=LS.raw('dual.keys.openrouter');
  $('#saveSK').onclick=()=>{ LS.set('dual.openrouter.model', sel.value); localStorage.setItem('dual.keys.openrouter',$('#sk').value||''); toast('Configurações salvas','ok'); };
  $('#saveName').onclick=()=>{ localStorage.setItem('infodose:userName', ($('#userName').value||'').trim()); toast('Nome salvo','ok'); updateHomeStatus(); };
})();
const chatWrap=$('#chatWrap'), chatInput=$('#chatInput'), btnSend=$('#btnSend'), btnMic=$('#btnMic');
function addMsg(text, who='bot'){ const box=document.createElement('div'); box.className='msg '+(who==='user'?'user':'bot');
  const content=document.createElement('div'); content.textContent=text; box.appendChild(content);
  const meta=document.createElement('div'); meta.className='meta';
  const ts=new Date().toLocaleTimeString(); meta.innerHTML=`<span>${ts}</span>`;
  if(who==='bot'){ const play=document.createElement('button'); play.className='play'; play.title='Ouvir'; play.textContent='▶️';
    play.onclick=()=>speakWithActiveArch(text); meta.prepend(play); }
  box.appendChild(meta); $('.chat-empty', chatWrap)?.remove(); chatWrap.appendChild(box); chatWrap.scrollTop=chatWrap.scrollHeight; return box; }
async function sendAIMessage(content, sk, model){
  const payload={model, messages:[{role:'system',content:'Você é um assistente amistoso que responde em português.'},{role:'user',content:content}], max_tokens:200, temperature:0.7};
  const url='https://openrouter.ai/api/v1/chat/completions';
  const res=await fetch(url,{method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${sk}`}, body:JSON.stringify(payload)});
  if(!res.ok) throw new Error('API: '+res.status); const data=await res.json();
  return data.choices?.[0]?.message?.content || '';
}
async function handleUserMessage(text){
  if(!text.trim()) return;
  addMsg(text,'user');
  const userName=(localStorage.getItem('infodose:userName')||'').trim()||'Dual';
  const sk=localStorage.getItem('dual.keys.openrouter')||''; const model=LS.get('dual.openrouter.model', MODELS[0]);
  let reply='';
  try{
    if(sk){ reply=await sendAIMessage(`${userName} disse: ${text}`, sk, model); }
    else{
      const sel=$('#arch-select'); const arch=(sel && sel.value ? sel.value.replace(/\.html$/i,'') : 'Nova');
      const presets={
        Nova:(t)=>`Vamos expandir isso juntos: \"${t}\". Experimente uma variação com 10% a mais de risco criativo.`,
        Atlas:(t)=>`Plano rápido: 1) Definir objetivo de \"${t}\". 2) 3 microações. 3) Iterar em 30min.`,
        Kaos:(t)=>`Desalinha e relinha: que regra você pode quebrar em \"${t}\" sem perder o sentido?`
      };
      reply=(presets[arch]?.(text)) || `(${arch}) Entendi: \"${text}\". Vamos em frente.`;
    }
  }catch(e){ reply='Desculpe, não consegui responder agora.'; }
  const b=addMsg(reply,'bot'); try{ speakWithActiveArch(reply); }catch{}
}
btnSend.onclick=()=>{ const t=chatInput.value; chatInput.value=''; handleUserMessage(t); };
chatInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); btnSend.click(); } });
btnMic.onclick=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ toast('Reconhecimento de fala não suportado.','err'); return; }
  const r=new SR(); r.lang='pt-BR'; r.interimResults=false; r.maxAlternatives=1;
  r.onresult=(ev)=>{ const tx=ev.results[0][0].transcript.trim(); handleUserMessage(tx); };
  r.onerror=()=>toast('Erro no microfone','err'); r.start(); toast('Estou ouvindo…','ok');
};
function downloadSelf(){ try{ const clone=document.documentElement.cloneNode(true); const html='<!doctype html>\n'+clone.outerHTML;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='HUB-UNO-Chat.html'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); toast('HTML exportado','ok'); }catch(e){ alert('Falha ao exportar: '+e.message); } }
$('#btnDownload').onclick=downloadSelf;
const modalHelp=document.createElement('div'); modalHelp.className='modal'; modalHelp.innerHTML='<div class="panel"><h3 style="margin:0">Ajuda</h3><div class="mut" style="margin-top:8px">g+h Home · g+c Chat · Ctrl/Cmd+S exporta</div></div>';
document.body.appendChild(modalHelp); $('#btnHelp').onclick=()=>{ modalHelp.classList.add('open'); modalHelp.setAttribute('aria-hidden','false'); };
modalHelp.addEventListener('click',e=>{ if(e.target===modalHelp){ modalHelp.classList.remove('open'); modalHelp.setAttribute('aria-hidden','true'); }});
window.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){ e.preventDefault(); downloadSelf(); return; }
  if(e.key.toLowerCase()==='g'){ window._gT=true; setTimeout(()=>window._gT=false,600); return; }
  if(!window._gT) return; const k=e.key.toLowerCase(); if(k==='h') nav('home'); if(k==='c') nav('chat'); if(k==='a') nav('apps'); if(k==='s') nav('stack'); if(k==='b') nav('brain'); window._gT=false;});
(function welcome(){ const name=(localStorage.getItem('infodose:userName')||'').trim();
  if(!name){ showArchMessage('Salve! Ative sua Dual Infodose registrando seu nome na seção Brain.','warn'); }
  else{ showArchMessage(`Bem-vindo de volta, ${name}. UNO está ao seu lado.`,'ok'); }
})();
  