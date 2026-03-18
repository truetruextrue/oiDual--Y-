
(()=> {
  if (window.__FORCE_LUCIANA_ARQ_OVERRIDE_V4__) return;
  window.__FORCE_LUCIANA_ARQ_OVERRIDE_V4__ = true;

  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;

  // ===== Utils básicos =====
  const PT = v => /^pt/i.test(v.lang || '');
  const ES = v => /^es/i.test(v.lang || '');
  const NORM = s => String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .toLowerCase();

  function getVoicesSafe(){
    try { return synth.getVoices() || []; }
    catch { return []; }
  }

  // ===== Mapa de vozes por arquétipo (pode sobrescrever via window.ARQ_VOICE_MAP) =====
  const VOICE_MAP = Object.assign({
    Atlas:   'pt_m',
    Nova:    'Luciana',
    Vitalis: 'Rocko',
    Pulse:   'es_m',
    Artemis: 'Monica',
    Serena:  'Joana',
    Kaos:    'Rocko',
    Genus:   'pt_m',
    Lumine:  'Monica',
    Solus:   'es_m',
    Rhea:    'Joana',
    Aion:    'Monica'
  }, (window.ARQ_VOICE_MAP || {}));

  // expõe pra você editar no console, se quiser:
  //   setArchetypeVoiceMap({ Atlas:'Monica', Nova:'pt_f' })
  window.ARQ_VOICE_MAP = VOICE_MAP;

  // Heurísticas simples pros nomes típicos (atalho, não trava nada)
  const NAME_F_PT = /(luciana|vitor[ioa]|camila|maria|sofia|joana)/i;
  const NAME_M_PT = /(daniel|reed|ricardo|miguel|thiago|henrique|felipe|jo[aã]o)/i;
  const NAME_F_ES = /(conchita|m[oó]nica|monica|paulina|luz)/i;
  const NAME_M_ES = /(jorge|fred|diego|sebasti[aá]n|sebastian)/i;

  function pickBySpec(spec, vs){
    if (!spec) return null;
    const s = String(spec).trim().toLowerCase();

    // Tokens por idioma (pt_f, es_m, etc)
    if (s === 'pt_f') return vs.find(v => PT(v) && NAME_F_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'pt_m') return vs.find(v => PT(v) && NAME_M_PT.test(v.name || '')) || vs.find(PT) || null;
    if (s === 'es_f') return vs.find(v => ES(v) && NAME_F_ES.test(v.name || '')) || vs.find(ES) || null;
    if (s === 'es_m') return vs.find(v => ES(v) && NAME_M_ES.test(v.name || '')) || vs.find(ES) || null;

    // Idioma genérico
    if (s === 'pt')   return vs.find(PT) || null;
    if (s === 'es')   return vs.find(ES) || null;

    // Nome direto → parcial (ex: "Monica", "Luciana", "Reed")
    const exact = vs.find(v => NORM(v.name) === NORM(spec));
    if (exact) return exact;
    return vs.find(v => NORM(v.name).includes(NORM(spec))) || null;
  }

  // Detecta tag de arquétipo no começo do parágrafo: [Atlas], [Nova], etc
  const ARCH_RE = /^\s*\[\s*([a-zA-Z0-9_]+)\s*\]/;

  function applyArchetypeVoice(u, vs){
    try{
      const m = (u.text || '').match(ARCH_RE);
      if (!m) return false; // sem tag [Atlas] / [Nova] etc

      const rawArch = m[1];
      const archKey = rawArch[0].toUpperCase() + rawArch.slice(1).toLowerCase();

      const spec = VOICE_MAP[archKey];
      if (!spec) return false;

      const v = pickBySpec(spec, vs);
      if (v){
        u.voice = v;
        // NÃO força idioma: só herda, se não tiver nada definido
        if (!u.lang && v.lang) u.lang = v.lang;
        return true;
      }
      return false;
    }catch{
      return false;
    }
  }

  // ===== Fila + override leve do speak (sem Luciana/base forçada) =====
  const NATIVE_SPEAK  = window.__KOB_NATIVE_SPEAK__  || synth.speak.bind(synth);
  const NATIVE_CANCEL = window.__KOB_NATIVE_CANCEL__ || synth.cancel.bind(synth);
  window.__KOB_NATIVE_SPEAK__  = NATIVE_SPEAK;
  window.__KOB_NATIVE_CANCEL__ = NATIVE_CANCEL;

  let VOICES    = getVoicesSafe();
  let ready     = !!VOICES.length;
  const Q       = [];
  let polTimer  = null;
  let tries     = 0;

  function refreshVoices(){
    VOICES = getVoicesSafe();
    if (VOICES.length){
      ready = true;
      drainQueue();
      if (polTimer){ clearInterval(polTimer); polTimer = null; }
    }
  }

  function ensureVoices(){
    if (ready) return;
    if (typeof synth.onvoiceschanged === 'object'){
      synth.onvoiceschanged = refreshVoices;
    }
    if (!polTimer){
      polTimer = setInterval(()=>{
        tries++;
        refreshVoices();
        if (ready || tries > 40){
          clearInterval(polTimer);
          polTimer = null;
        }
      }, 150);
    }
  }

  function wireUtterance(u){
    try{
      if (u.__kob_wired_v4) return;
      u.__kob_wired_v4 = true;

      // Só mexe se tiver tag de arquétipo; se não, deixa o TTS padrão decidir a voz
      applyArchetypeVoice(u, VOICES);
    }catch(e){
      console.warn('FORCE_LUCIANA_ARQ_OVERRIDE_v4 wireUtterance error', e);
    }
  }

  function drainQueue(){
    while(Q.length){
      const u = Q.shift();
      if (u.__kob_spoken_v4) continue;
      wireUtterance(u);
      u.__kob_spoken_v4 = true;
      NATIVE_SPEAK(u);
    }
  }

  synth.speak = function(u){
    if (!(u instanceof SpeechSynthesisUtterance)) return NATIVE_SPEAK(u);

    ensureVoices();
    if (!ready || !VOICES.length){
      Q.push(u);
      return;
    }

    wireUtterance(u);
    return NATIVE_SPEAK(u);
  };

  synth.cancel = function(){
    Q.length = 0;
    return NATIVE_CANCEL();
  };

  // prewarm leve
  refreshVoices();

  // helper opcional pra ajustar mapa via código:
  window.setArchetypeVoiceMap = (m)=> Object.assign(VOICE_MAP, m || {});

})();
