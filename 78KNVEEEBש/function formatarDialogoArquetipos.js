// ═══════════════════════════════════════════════════
// 🎙️ FORMATADOR DE DIÁLOGO ARQUETÍPICO · FRONTEND
// Converte: "ATLAS (⌂, 594Hz): Texto" 
// Para:     "ATLAS (⌂, 594Hz – Barítono estruturado):\n\"Texto\""
// ═══════════════════════════════════════════════════

function formatarDialogoArquetipos(texto) {
  const VOZ_ARQUETIPO = {
    'ATLAS': 'Barítono estruturado', 'NOVA': 'Soprano etéreo', 'PULSE': 'Tenor pulsante',
    'VITALIS': 'Barítono firme', 'KAOS': 'Contralto cortante', 'SERENA': 'Mezzo‑soprano doce',
    'ARTEMIS': 'Soprano lírico', 'GENUS': 'Baixo profundo', 'LUMINE': 'Soprano jubiloso',
    'RHEA': 'Contralto maternal', 'SOLUS': 'Barítono ecoante', 'AION': 'Tenor cíclico',
    'KODUX': 'Voz sintética precisa', 'BLLUE': 'Mezzo‑soprano aquático',
    'JESUS': 'Voz universal serena', 'KOBLLUX': 'Coro polifônico',
    'INFODOSE': 'Voz narrativa clara', 'META LUX': 'Voz cristalina',
    'FIT LUX': 'Tenor energético', 'DUAL APP': 'Voz equilibrada',
    'NEPHESH': 'Soprano quântico', 'DNA LUX': 'Voz técnica orgânica',
    'VESCA-X': 'Voz cíclica fluida'
  };

  const pattern = /^([A-ZÀ-Ú\s]+)\s*(?:\(([^)]+)\)\s*[:—\-\.]?\s*|—\s*)(.*)$/i;
  const linhas = texto.split('\n');
  const resultado = [];

  for (let linha of linhas) {
    const match = linha.match(pattern);
    
    if (match) {
      const nomeRaw = match[1].trim().toUpperCase();
      const meta = match[2]?.trim();
      let conteudo = match[3]?.trim() || '';

      const nomeChave = VOZ_ARQUETIPO[nomeRaw] ? nomeRaw : 
                        Object.keys(VOZ_ARQUETIPO).find(k => nomeRaw.includes(k));

      if (nomeChave) {
        const descricaoVoz = VOZ_ARQUETIPO[nomeChave];
        
        // 🔵 AJUSTE SOLICITADO: Nome sempre seguido de ":"
        let cabecalho = meta 
          ? `${nomeChave}: (${meta} – ${descricaoVoz}):` 
          : `${nomeChave}:  – ${descricaoVoz}:`;
        
        if (conteudo && !conteudo.startsWith('"')) {
          conteudo = `"${conteudo}"`;
        }
        
        resultado.push(`${cabecalho}\n${conteudo}`);
      } else {
        resultado.push(`${nomeRaw}:  – "${conteudo}"`);
      }
    } else {
      resultado.push(linha);
    }
  }

  return resultado.join('\n');
}
// Adicionar botão "🎭 Formatar Diálogo"
const toolbar = document.querySelector('#view-editor .overflow-x-auto');
if (toolbar && !document.getElementById('format-dialog-btn')) {
  const btn = document.createElement('button');
  btn.className = 'ai-tab';
  btn.id = 'format-dialog-btn';
  btn.innerHTML = '🎭 Formatar Diálogo';
  btn.title = 'Padroniza falas de arquétipos com descrição vocal';
  btn.onclick = () => {
    editor.value = formatarDialogoArquetipos(editor.value);
    editor.dispatchEvent(new Event('input'));
    toast('✓ Diálogo formatado');
  };
  toolbar.appendChild(btn);
}