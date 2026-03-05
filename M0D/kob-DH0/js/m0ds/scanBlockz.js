function scanBlocks(){

  const doc = frame.contentDocument || frame.contentWindow.document;

  const MIN_TEXT = 60;
  const IGNORE = ['SCRIPT','STYLE','NOSCRIPT','SVG','NAV','HEADER','FOOTER','ASIDE'];

  const nodes = [...doc.querySelectorAll('article,main,section,div')];

  let bestNode = null;
  let bestScore = 0;

  // --- Encontrar container principal ---
  nodes.forEach(el => {

    if(IGNORE.includes(el.tagName)) return;

    const text = el.innerText?.trim();
    if(!text || text.length < MIN_TEXT) return;

    const pCount = el.querySelectorAll('p').length;
    const linkCount = el.querySelectorAll('a').length;

    const textLength = text.length;

    // fórmula simples de densidade
    const score =
      textLength +
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

  // --- Extrair blocos de leitura ---
  const blocks = [...bestNode.querySelectorAll(
    'h1,h2,h3,h4,p,li,blockquote'
  )];

  state.blocks = blocks.filter(el=>{
    const txt = el.innerText?.trim();
    return txt && txt.length > 30;
  });

  state.currentBlockIdx = 0;

}