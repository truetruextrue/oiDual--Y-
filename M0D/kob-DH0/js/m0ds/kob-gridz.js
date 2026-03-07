function scanBlocks(){

  const doc = frame.contentDocument || frame.contentWindow.document;

  const MIN_TEXT = 60;   // para parágrafos
  const IGNORE = ['SCRIPT','STYLE','NOSCRIPT','SVG','NAV','HEADER','FOOTER','ASIDE'];

  const nodes = [...doc.querySelectorAll('article,main,section,div')];

  let bestNode = null;
  let bestScore = 0;

  // --- detectar container principal ---
  nodes.forEach(el => {

    if(IGNORE.includes(el.tagName)) return;

    const text = el.innerText?.trim();
    if(!text || text.length < MIN_TEXT) return;

    const pCount = el.querySelectorAll('p').length;
    const linkCount = el.querySelectorAll('a').length;

    const score =
      text.length +
      (pCount * 120) -
      (linkCount * 30);

    if(score > bestScore){
      bestScore = score;
      bestNode = el;
    }

  });

  if(!bestNode){
    state.blocks = [];
    return;
  }

  // --- extrair blocos ---
  const elements = [...bestNode.querySelectorAll(
    'h1,h2,h3,h4,h5,p,li,blockquote'
  )];

  state.blocks = elements.filter(el => {

    const txt = el.innerText?.trim();
    if(!txt) return false;

    // títulos sempre entram
    if(/^H[1-6]$/.test(el.tagName)) return true;

    // texto normal precisa ter tamanho mínimo
    if(txt.length < 40) return false;

    return true;

  });

  state.currentBlockIdx = 0;

}
/* HOST side: send request to iframe and handle responses */
const contentFrame = document.getElementById('content-frame');

function requestIframeBlocks() {
  if (!contentFrame || !contentFrame.contentWindow) return;
  contentFrame.contentWindow.postMessage({ cmd: 'kob-request-blocks' }, '*');
}

/* receive blocks from iframe */
window.addEventListener('message', (ev) => {
  try {
    const d = ev.data || {};
    if (d && d.cmd === 'kob-blocks') {
      // d.blocks = [{text:"...", selector:"..."} ...]
      // Build invisible nodes or set state so kob-hud.js.scanBlocks() uses them
      // We'll create simple container elements inside #root for HUD scanning:
      const root = document.getElementById('root');
      let proxy = document.getElementById('kob-block-proxy');
      if (!proxy) { proxy = document.createElement('div'); proxy.id = 'kob-block-proxy'; proxy.style.display = 'none'; root.appendChild(proxy); }
      proxy.innerHTML = d.blocks.map((b, i) => `<p data-kob-proxy-index="${i}">${b.text.replace(/</g,'&lt;')}</p>`).join('');
      // now force kob-hud to rebuild blocks
      window.KOBLLUX && window.KOBLLUX.rebuildBlocks && window.KOBLLUX.rebuildBlocks();
      // optional: auto play
      // window.KOBLLUX.startSpeech && window.KOBLLUX.startSpeech();
    }
  } catch (e) { console.warn('postmsg host err', e); }
}, { passive: true });

<!-- INJETAR no site que roda dentro do iframe -->
window.addEventListener('message', (ev) => {
  const d = ev.data || {};
  if (d && d.cmd === 'kob-request-blocks') {
    // coleta textos relevantes
    const sel = 'h1,h2,h3,p,li,blockquote,pre,td,th';
    const nodes = Array.from(document.querySelectorAll(sel)).filter(n => (n.innerText||'').trim().length);
    const blocks = nodes.map(n => ({ text: (n.innerText||'').trim() }));
    // envia de volta ao top
    ev.source.postMessage({ cmd: 'kob-blocks', blocks }, ev.origin || '*');
  }
});