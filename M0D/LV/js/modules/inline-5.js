
window.FAB_MINI = window.FAB_MINI || {
  // 'hide' = esconde os outros; 'replace' = troca o menu e mantém só os botões abaixo
  mode: 'replace',
  // incluir Voltar? (false por padrão, como você pediu)
  include_back: false,
  // textos dos botões (pode mudar aqui)
  labels: { autogerar: 'Auto‑Gerar', pdf: 'PDF', tts: 'TTS', home: 'Home', back: 'Voltar' },
  // ganchos do Auto‑Gerar
  autogerar: {
    // roda antes do Auto‑Gerar (ex.: setar tema/seed/clean)
    before: null,
    // override do fluxo de geração; se não definir, tentamos openImporter() → ACTIONS.demo() → autoBuild()
    run: null
  }
};
