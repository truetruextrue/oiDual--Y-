
function convertSourceToMD(raw){
  if (!raw) return '';
  // RTF → texto básico
  if (/^{\\rtf/i.test(raw)) {
    raw = raw
      .replace(/\\par[d]?/g, '\n')
      .replace(/\\tab/g, '\t')
      .replace(/\\'[0-9a-fA-F]{2}/g, ' ')      // escapes hex → espaço
      .replace(/\\[a-zA-Z]+\d*/g, '')          // comandos \b \i \fs...
      .replace(/[{}]/g, '')                    // remove braces do RTF
      .replace(/\n{2,}/g, '\n\n');
  }
  // normalizações
  let text = raw
    .replace(/[“”]/g,'"').replace(/[‘’]/g,"'")
    .replace(/\r\n?/g, '\n')
    .trim();

  // TABELISTA (pula 1–2; 3 = header; 4 = <auto>; 5+ dados)
  text = text.replace(
    /(?:^|\n)#[^\n]*\n#[^\n]*\n\s*([\w\W]*?)\n\s*<auto>\n([\w\W]*?)(?=\n{2,}|$)/g,
    function(_, headerLine, dataBlock){
      const header = headerLine.split('|').map(s=>s.trim()).filter(Boolean);
      if (!header.length) return _;
      const sep = '|' + header.map(()=> '---').join('|') + '|';
      const rows = dataBlock.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#'))
        .map(l => {
          const cols = l.split('|').map(s=>s.trim());
          return '| ' + cols.join(' | ') + ' |';
        });
      return '\n| ' + header.join(' | ') + ' |\n' + sep + '\n' + rows.join('\n') + '\n';
    }
  );

  // botões [[btn:acao|Rótulo]] → HTML
  text = text.replace(/\[\[btn:([a-z0-9_-]+)(?:\|([^\]]+))?\]\]/gi,
    function(_,act,label){ return '<button class="btn action" data-action="'+act+'">'+(label||act)+'</button>'; });

  // tokens [voz:] [arch:] saneados (mantidos para o TTS parser)
  text = text.replace(/\[voz:\s*([^\]]+)\s*\]/gi, '[voz:$1]')
             .replace(/\[arch:\s*([^\]]+)\s*\]/gi, '[arch:$1]');

  // fences simples: fecha ``` se contar ímpar
  const fences = (text.match(/```/g)||[]).length;
  if (fences % 2 === 1) text += '\n```';

  return text;
}

// Bind converter button if present
document.addEventListener('click',(e)=>{
  const btn = e.target.closest('#btn-converter');
  if(!btn) return;
  const ta = document.getElementById('srcText');
  if(!ta) return;
  const md = convertSourceToMD(ta.value||'');
  ta.value = md;
  if (window.toast) toast('Convertido (RTF→MD, tabelista, tokens, botões)');
});
