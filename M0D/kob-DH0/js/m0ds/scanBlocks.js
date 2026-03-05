function scanBlocks(){

  const doc = frame.contentDocument || frame.contentWindow.document;

  const MIN_TEXT = 40;      // mínimo de caracteres
  const MAX_CHILDREN = 6;   // evita containers gigantes
  const IGNORE = ['SCRIPT','STYLE','NOSCRIPT','SVG'];

  const nodes = [...doc.querySelectorAll('body *')];

  state.blocks = nodes.filter(el => {

    if(IGNORE.includes(el.tagName)) return false;

    const txt = el.innerText?.trim();
    if(!txt) return false;

    // evita textos muito curtos
    if(txt.length < MIN_TEXT) return false;

    // evita containers com muitos filhos
    if(el.children.length > MAX_CHILDREN) return false;

    // evita elementos invisíveis
    const style = getComputedStyle(el);
    if(style.display === "none" || style.visibility === "hidden") return false;

    return true;
  });

  // remove duplicações de texto (containers pai/filho)
  const seen = new Set();
  state.blocks = state.blocks.filter(el=>{
    const t = el.innerText.trim();
    if(seen.has(t)) return false;
    seen.add(t);
    return true;
  });

  state.currentBlockIdx = 0;

}