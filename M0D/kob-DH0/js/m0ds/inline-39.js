
(()=>{'use strict';
  if (!('speechSynthesis' in window)) {
    console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1: SpeechSynthesis não disponível.');
    return;
  }
  if (window.__KOB_TTS_ARCH_GATILHO_PATCH_V1__) return;
  window.__KOB_TTS_ARCH_GATILHO_PATCH_V1__ = true;

  const synth = window.speechSynthesis;
  const prevSpeak = synth.speak.bind(synth); // respeita patches anteriores

  // Mapa de vozes já existente (Atlas, Nova, etc)
  const VOICE_MAP = (window.ARQ_VOICE_MAP || {});
  const ARCH_KEYS = Object.keys(VOICE_MAP);
  if (!ARCH_KEYS.length){
    console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1: VOICE_MAP vazio, nada a fazer.');
  }

  // 🔑 Gatilhos de frase (você pode editar/expandir depois no console)
  const DEFAULT_TRIGGERS = {
    Atlas: [
      /\bupa[-\s]*atlas\b/i,
      /\bportal\s*\[\s*atlas\s*\]/i
    ],
    Nova: [
      /\bvia\s*\[\s*nova\s*\]/i,
      /\bmente nova\b/i
    ],
    Lumine: [
      /\blumine\b/i,
      /\barch[-\s]*lumine\b/i
    ]
    // adiciona mais se quiser…
  };

  // Mescla default + o que você definir manualmente:
  const TRIGGERS = Object.assign({}, DEFAULT_TRIGGERS, (window.ARQ_TRIGGERS || {}));
  window.ARQ_TRIGGERS = TRIGGERS; // expõe pra você brincar

  // Heurísticas de idioma básicas (pt/es)
  const PT    = v => /^pt\b/i.test(v.lang || '');
  const ES    = v => /^es\b/i.test(v.lang || '');

  const NORM = s => String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

  function getVoicesSafe(){
    try { return synth.getVoices() || []; }
    catch { return []; }
  }

  function pickBySpec(spec, vs){
    if (!spec) return null;
    const s = String(spec).trim().toLowerCase();

    // Tokens por idioma (pt_f, es_m, etc)
    const NAME_F_PT = /(luciana|vitor[ioa]|camila|maria|sofia|joana)/i;
    const NAME_M_PT = /(daniel|reed|ricardo|miguel|thiago|henrique|felipe|jo[aã]o)/i;
    const NAME_F_ES = /(conchita|m[oó]nica|monica|paulina|luz)/i;
    const NAME_M_ES = /(jorge|fred|diego|sebasti[aá]n|sebastian)/i;

    if (s === 'pt_f') return vs.find(v => PT(v) && NAME_F_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'pt_m') return vs.find(v => PT(v) && NAME_M_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'es_f') return vs.find(v => ES(v) && NAME_F_ES.test(v.name || '')) || vs.find(ES) || null;
    if (s === 'es_m') return vs.find(v => ES(v) && NAME_M_ES.test(v.name || '')) || vs.find(ES) || null;

    if (s === 'pt')   return vs.find(PT) || null;
    if (s === 'es')   return vs.find(ES) || null;

    const exact = vs.find(v => NORM(v.name) === NORM(spec));
    if (exact) return exact;
    return vs.find(v => NORM(v.name).includes(NORM(spec))) || null;
  }

  // 🎯 Detecta arquétipo a partir de TODAS as formas de tag + frases de gatilho
  function detectArchetypeKey(text){
    if (!text || !ARCH_KEYS.length) return null;
    const raw   = String(text);
    const lower = raw.toLowerCase();

    for (const key of ARCH_KEYS){
      const n = key.toLowerCase();

      // [Atlas], [[Atlas]], (((Atlas))), {Atlas}, <Atlas>
      const bracket = new RegExp(`[\$begin:math:display$\\\\(\\\\{<]+\\\\s*${n}\\\\s*[\\$end:math:display$\\)\\}>]+`);
      if (bracket.test(lower)) return key;

      // Nome no início com : ou traço — ex: "Atlas: ..." ou "Nova — ..."
      const header = new RegExp(`^\\s*${n}\\s*[:\\-–—·>]`);
      if (header.test(lower)) return key;

      // Nome isolado entre espaços com "modo tag" ex: "::Atlas::"
      const middle = new RegExp(`[\\s\\|:>\\-\\[]${n}[\\s\\|<\\-:!,.?]`);
      if (middle.test(lower)) return key;

      // Frases de gatilho custom
      const arr = TRIGGERS[key] || [];
      for (const rx of arr){
        try{
          if (rx.test(raw) || rx.test(lower)) return key;
        }catch(e){}
      }
    }
    return null;
  }

  // Opcional: remover tags de arquétipo do texto falado (pra não ler "[Atlas]" etc)
  function stripArchetypeTags(text, key){
    if (!text || !key) return text;
    const n = key.toLowerCase();

    // remove [Atlas], ((Atlas)), {{Atlas}}, <Atlas>, [[Atlas]] etc
    const genericBrackets = new RegExp(`[\\[\$begin:math:text$\\\\{<]+\\\\s*${n}\\\\s*[\\\\]\\$end:math:text$\\}>]+\\s*`, 'ig');
    let out = text.replace(genericBrackets, '');

    // remove "Atlas: " no começo da linha
    const header = new RegExp(`^\\s*${n}\\s*[:\\-–—·>]\\s*`, 'i');
    out = out.replace(header, '');

    return out.trim() || text;
  }

  synth.speak = function(u){
    try{
      if (u instanceof SpeechSynthesisUtterance && ARCH_KEYS.length){
        let text   = String(u.text || '');
        const arch = detectArchetypeKey(text);

        if (arch){
          const voices = getVoicesSafe();
          const spec   = VOICE_MAP[arch];
          const v      = spec ? pickBySpec(spec, voices) : null;

          if (v){
            u.voice = v;
            if (!u.lang && v.lang) u.lang = v.lang;
            // marca pra debug / painel
            u.__kob_arch = arch;
            // limpa as tags pra não serem lidas
            u.text = stripArchetypeTags(text, arch);
            console.log('🎙️ ARCH_GATILHO', arch, '→', v.name, v.lang);
          }
        }
      }
    }catch(e){
      console.warn('KOB_TTS_ARCH_GATILHO_PATCH_V1 error', e);
    }
    return prevSpeak(u); // deixa LANG_SPEC, THEME etc trabalharem depois
  };

  console.log('⚡ KOB_TTS_ARCH_GATILHO_PATCH_V1 ativo — tags & gatilhos de arquétipo liberados');
})();
