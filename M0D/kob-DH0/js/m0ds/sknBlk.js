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