
/* ============================
   Helpers mínimos (stubs)
   Substitua pelos seus utils reais se preferir.
   ============================ */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
function addRipple(el){ /* minimal ripple: add .ripple span if missing */ if(!el) return; if(!el.querySelector('.ripple')){ const s=document.createElement('span'); s.className='ripple'; el.appendChild(s); } }
function dualLog(msg){ console.log('[DUAL]',msg); const l = $('#logs'); if(l) l.textContent = (new Date()).toLocaleTimeString() + ' • ' + msg + '\n' + l.textContent; }
function toast(msg, type='ok'){ dualLog('TOAST: '+msg); /* you can implement UI */ }
function nav(target){ document.querySelectorAll('.view').forEach(v=>v.style.display='none'); const el = document.getElementById('v-'+target); if(el) el.style.display='block'; }
function blobURL(textOrBlob){ if(typeof textOrBlob === 'string') return URL.createObjectURL(new Blob([textOrBlob], {type:'text/html'})); return URL.createObjectURL(textOrBlob); }
function getLocal(name){ /* try to read from localStorage if exists */ try{ return localStorage.getItem(name) }catch(e){return null} }
function isFav(key){ try{ const s = localStorage.getItem('fav:'+key); return s === '1' } catch { return false } }
function toggleFav(key){ try{ const cur = isFav(key); localStorage.setItem('fav:'+key, cur ? '0' : '1'); renderApps(); toast((cur ? 'Removido' : 'Favoritado') + ' • ' + key); } catch{} }
function updateHomeStatus(){ const c = $$('.session').length; $('#appsCount').textContent = c + ' sessões ativas'; $('#appsCount').classList.remove('mut'); }
function applyIcons(){ /* stub, your real applyIcons can decorate buttons */ }

/* ============================
   Frame resize binder (generic)
   ============================ */
function bindFrameResize(card){
  const shell = card.querySelector('.frame-shell');
  if (!shell) return;
  const content = shell.querySelector('.frame-content');
  const handle  = shell.querySelector('.frame-resize');
  if (!content || !handle) return;

  let startY = 0, startH = 0, dragging = false;

  function onPointerDown(ev){
    dragging = true;
    startY = ev.clientY;
    startH = content.offsetHeight;
    try { handle.setPointerCapture(ev.pointerId); } catch(e){}
  }
  function onPointerMove(ev){
    if(!dragging) return;
    const dy = ev.clientY - startY;
    content.style.height = Math.max(120, startH + dy) + 'px';
  }
  function onStop(){ dragging = false; }
  handle.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', onStop);
  handle.addEventListener('pointercancel', onStop);
}

/* ============================
   UI: cardApp (render de apps)
   ============================ */
function appIconFor(a){
  // se for data uri ou url use direto, se for texto, crie fallback svg
  if(!a) return '';
  return a.icon || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23f5f7ff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>');
}

function cardApp(a){
  const el = document.createElement('div'); el.className = 'app-card fx-trans fx-lift';
  // favorito
  const fav = document.createElement('button'); fav.className = 'fav-btn';
  const favImg = document.createElement('img'); favImg.alt='Favorito'; favImg.src = 'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%23f5f7ff" stroke-width="2"><path d="M12 17.3L5.6 20l1.1-6.3L2 9.5l6.4-.9L12 3l3.6 5.6 6.4 .9-4.7 4.2L18.4 20z"/></svg>');
  fav.appendChild(favImg);
  if(isFav(a.key)) fav.classList.add('fav');
  fav.onclick = (e)=>{ e.stopPropagation(); toggleFav(a.key); };
  el.appendChild(fav);

  const ic = document.createElement('div'); ic.className = 'app-icon';
  const img = document.createElement('img'); img.alt=''; img.width=24; img.height=24; img.src = appIconFor(a);
  ic.appendChild(img);

  const meta = document.createElement('div'); meta.style.flex='1';
  const fullTitle = String(a.title || a.key || '').trim();
  const words = fullTitle.split(/\s+/);
  const truncated = words.slice(0,3).join(' ');
  const displayTitle = words.length > 3 ? truncated + '…' : truncated;
  const t = document.createElement('div'); t.className='app-title'; t.textContent = displayTitle || fullTitle; t.title = fullTitle;
  const d = document.createElement('div'); d.className='mut'; d.textContent = a.desc || a.url;
  const open = document.createElement('button'); open.className='btn fx-trans fx-press ring'; open.textContent='Abrir';
  addRipple(open);
  open.onclick = ()=> openApp(a);
  meta.appendChild(t); meta.appendChild(d); meta.appendChild(open);
  el.appendChild(ic); el.appendChild(meta);
  return el;
}

/* ============================
   Sample apps catalogue (you can replace)
   ============================ */
const APPS = [
  { key:'serena', title:'Serena · Ampara', desc:'Acolhimento e suporte emocional.', url:'https://example.com', icon:'' },
  { key:'solus', title:'Solus · Arcana', desc:'Harmonização energética e meditação.', url:'https://example.com', icon:'' },
  { key:'atlas', title:'Atlas · Cartesius', desc:'Planejador estratégico.', url:'https://example.com', icon:'' },
  { key:'lumine', title:'Lumine · Brilhare', desc:'Inspiração leve e atividades.', url:'https://example.com', icon:'' }
];

function renderApps(){
  const wrap = $('#appsWrap');
  wrap.innerHTML = '';
  APPS.forEach(a=> wrap.appendChild(cardApp(a)));
  $('#appsCount').textContent = APPS.length + ' apps';
}
renderApps();

/* ============================
   Stack / Dock logic
   ============================ */
const stackWrap = $('#stackWrap'), dock = $('#dock');

function badge(item){
  const b = document.createElement('button'); b.className='badge fx-trans fx-press ring'; b.textContent = item.title || 'App';
  b.title = 'Reabrir ' + (item.title || 'App');
  addRipple(b);
  b.onclick = ()=>{
    const s = document.querySelector('[data-sid="'+item.sid+'"]');
    if(s){ s.scrollIntoView({behavior:'smooth'}); s.classList.remove('min'); }
  };
  return b;
}

function updateDock(){
  dock.innerHTML = '';
  $$('.session').forEach(s=>{
    const meta = JSON.parse(s.dataset.meta || '{}');
    dock.appendChild(badge({ title: meta.title, sid: s.dataset.sid }));
  });
  try{ updateHomeStatus(); }catch(e){}
}

/* ============================
   openApp (INTEGRATED with frame-shell)
   ============================ */
function openApp(a){
  const sid = 's_' + Math.random().toString(36).slice(2);
  const isLocal = String(a.url||'').startsWith('local:');
  const lr = isLocal ? getLocal(String(a.url).slice(6)) : null;
  const url = lr ? blobURL(lr) : a.url;
  const card = document.createElement('div');
  card.className = 'session fx-trans fx-lift';
  card.dataset.sid = sid;
  card.dataset.meta = JSON.stringify({ title: a.title || 'App', url: a.url || '' });

  // header + tools
  const hdr = document.createElement('div'); hdr.className = 'hdr';
  const title = document.createElement('div'); title.className = 'title'; title.textContent = a.title || 'App';
  const tools = document.createElement('div'); tools.className = 'tools';

  const btnMin = document.createElement('button'); btnMin.className='btn ring fx-trans fx-press'; btnMin.dataset.act='min'; btnMin.title='Minimizar'; btnMin.innerHTML = '<span style="font-size:16px;line-height:1">−</span>';
  const btnRef = document.createElement('button'); btnRef.className='btn ring fx-trans fx-press'; btnRef.dataset.act='ref'; btnRef.title='Recarregar'; btnRef.innerHTML = '&#8635;';
  const btnClose = document.createElement('button'); btnClose.className='btn ring fx-trans fx-press'; btnClose.dataset.act='close'; btnClose.title='Fechar'; btnClose.innerHTML='&times;';
  [btnMin,btnRef,btnClose].forEach(b=>{ const rp=document.createElement('span'); rp.className='ripple'; b.appendChild(rp); tools.appendChild(b); });

  hdr.appendChild(title); hdr.appendChild(tools);

  // frame-shell (universal)
  const frameShell = document.createElement('div'); frameShell.className = 'frame-shell';
  const iframe = document.createElement('iframe');
  iframe.className = 'frame-content';
  iframe.src = url || 'about:blank';
  iframe.setAttribute('allow','autoplay; clipboard-read; clipboard-write; picture-in-picture; fullscreen');
  const resizeHandle = document.createElement('div'); resizeHandle.className = 'frame-resize'; resizeHandle.title = 'Arraste para ajustar a altura';
  frameShell.appendChild(iframe);
  frameShell.appendChild(resizeHandle);

  // assemble
  card.appendChild(hdr);
  card.appendChild(frameShell);

  // prepend according to openInside
  const anchor = document.getElementById('sessionsAnchor') || null;
  if($('#openInside') && $('#openInside').checked && anchor){
    anchor.prepend(card);
  } else {
    stackWrap.prepend(card);
  }

  // bind actions
  btnMin.onclick = ()=>{
    card.classList.toggle('min');
    updateDock();
    dualLog('Sessão minimizada: ' + (a.title || 'App'));
  };
  btnRef.onclick = ()=>{
    const fr = card.querySelector('.frame-content');
    try { fr.contentWindow.location.reload(); } catch(e){ fr.src = fr.src; }
  };
  btnClose.onclick = ()=>{
    card.remove();
    updateDock();
    dualLog('Sessão fechada: ' + (a.title || 'App'));
  };

  // bind generic resize
  bindFrameResize(card);

  // navigate to stack view if not opening inside
  if(!($('#openInside') && $('#openInside').checked)) nav('stack');

  updateDock();
  toast('App aberto: ' + (a.title || 'App'), 'ok');
  dualLog('Sessão aberta: ' + (a.title || 'App'));
}

/* close all */
$('#btnCloseAll').onclick = ()=>{
  if(!confirm('Fechar todas as sessões abertas?')) return;
  $$('.session').forEach(s=>s.remove());
  updateDock();
  toast('Todas as sessões fechadas','warn');
};

/* Sample: open first app on load for demo */
document.addEventListener('DOMContentLoaded', ()=>{
  // hookup tab nav
  $$('.tab').forEach(t=> t.addEventListener('click', ()=> { nav(t.dataset.nav); }));
  // show apps view by default
  nav('apps');

  // demo: open first app after render (comment if undesired)
  // openApp(APPS[0]);

  // hookup upload (simple)
  $('#btnStackUpload').addEventListener('click', ()=> $('#stackUpload').click());
  $('#stackUpload').addEventListener('change', (ev)=>{
    const f = ev.target.files && ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      // create a pseudo-app and open as local:
      const localName = 'local:' + 'uploaded:' + f.name;
      try { localStorage.setItem(localName, e.target.result); } catch(e){}
      openApp({ key: 'local_'+Date.now(), title: f.name, url: localName });
    };
    reader.readAsText(f);
  });

  // initial update
  updateDock();
});

/* Optional: expose openApp to global for dev console */
window.openApp = openApp;
