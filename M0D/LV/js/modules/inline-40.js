
  // 📣 Mapa de VOZ por arquétipo
  // Esses valores entram em cima do VOICE_MAP padrão via Object.assign
  window.ARQ_VOICE_MAP = {
    // deixa Atlas/Nova no eixo padrão
    Atlas:   'pt_m',  // PT macho
    Nova:    'pt_f',  // PT feminina (Luciana / Joana / etc)

    // QUATRO QUE VOCÊ FALOU:
    Ion:     'es_m',  // espanhol macho
    Solus:   'es_m',  // espanhol macho
    Artemis: 'es_f',  // espanhol feminino
    Pulse:   'es_m',  // espanhol macho, ritmo

    // Se quiser forçar outros:
    // Lumine: 'pt_f',
    // Kaos:   'pt_m',
    // etc...
  };

  // 🧠 Tabelas de gatilhos de frase por arquétipo
  // Lembrando: isso soma com DEFAULT_TRIGGERS dentro do patch
  window.ARQ_TRIGGERS = {
    Atlas: [
      /\bUPA-ATLAS\b/i,
      /\bPORTAL\s*\[\s*ATLAS\s*\]/i,
      'BASE ATLAS',
      'ATLAS NA BASE'
    ],
    Nova: [
      /\bMENTE NOVA\b/i,
      /\bTRINDADE\s+NOVA\b/i,
      'NOVA ARQUETÍPICA',
      'NOVA EM CENA'
    ],

    Aion: [
      'MODO ION',
      'ION EM CARGA',
      'IONIZAR O CAMPO',
      'ION FLUXO',
      'AI·ON LIGADO' // A I ON 🔥
    ],
    Solus: [
      'EIXO SOLUS',
      'SOLUS CENTRAL',
      'SOLUS NO COMANDO',
      'SOLUS EM ÓRBITA',
      'DECISÃO SOLUS'
    ],
    Artemis: [
      'ALVO ARTEMIS',
      'MIRA ARTEMIS',
      'ARTEMIS EM CAÇA',
      'FOCO ARTEMIS',
      'RITUAL ARTEMIS'
    ],
    Pulse: [
      'PULSO ATIVO',
      'PULSE 3·6·9',
      'RITMO DO PULSE',
      'BPM DO PULSE',
      'PULSE NO BPM'
    ]
  };
