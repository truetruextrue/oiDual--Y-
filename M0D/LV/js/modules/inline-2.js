
const DEMO_MD = "# Demo \u2014 A\u00e7\u00f5es e Blocos\n\n[[btn:gerar|Gerar (texto do editor)]] [[btn:nested|Gerar (aninhado)]] [[btn:md|Salvar .md]] [[btn:pdf|Imprimir PDF]]\n\n: Esta p\u00e1gina demonstra **bot\u00f5es inline** que executam as MESMAS a\u00e7\u00f5es dos bot\u00f5es do topo.\n\n## Fun\u00e7\u00e3o em aspas (render == equa\u00e7\u00e3o)\n\u201cfunction pulse(t){ return Math.cos(t) * 0.369; }\u201d\n\n## Cita\u00e7\u00f5es\n> n\u00edvel 1\n>> n\u00edvel 2\n>>> n\u00edvel 3\n\n## Callouts\n: Nota simples\n::warn Aten\u00e7\u00e3o\n::. Aside\n? Pergunta\n\n## Lista de tarefas\n- [ ] pendente\n- [x] feita\n\n## Tabela\n| A | B |\n|---|---|\n| 1 | 2 |\n\n## C\u00f3digo (aspas)\n'''js\nconsole.log(\"ok das aspas\");\n'''\n";
const ACTIONS = {
  demo(){ autoBuild(DEMO_MD); },
  gerar(){ const v = (document.getElementById('srcText')?.value||'').trim(); autoBuild(v || DEMO_MD); },
  nested(){ const v = (document.getElementById('srcText')?.value||'').trim(); if(typeof autoBuildNested==='function') autoBuildNested(v || DEMO_MD); else autoBuild(v || DEMO_MD); },
  importar(){ if(typeof openImporter==='function') openImporter(); },
  md(){
    // Call the global exportMD implementation if available.
    if(typeof window.exportMD === 'function') window.exportMD();
  },
  pdf(){ window.print(); },
  reading(){ if(typeof toggleReading==='function') toggleReading(); },
  theme(){ if(typeof cycleTheme==='function') cycleTheme(); },
  limpar(){ const r=document.getElementById('root'); if(r) r.innerHTML=''; toast && toast('Limpou'); },
  tts(){ document.getElementById('btn-tts')?.click(); },
  'tts-sel'(){ document.getElementById('btn-tts-sel')?.click(); },
  'tts-stop'(){ document.getElementById('btn-tts-stop')?.click(); }
};
document.addEventListener('click', (e)=>{
  const a = e.target.closest('[data-action]');
  if(!a) return;
  const act = a.dataset.action;
  if(act && ACTIONS[act]){ e.preventDefault(); ACTIONS[act](a); }
});
