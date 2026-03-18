
/* KOBLLUX · PATCH DE VOZ POR NOME
   - Usa o NOME da voz (v.name) para cada arquétipo
   - Mantém fallback pro applyArchetypeVoice original se não achar nada
   - Ajusta o nome Aion (nada de Ion kkk)
*/
(function () {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const synth = window.speechSynthesis;

  // 🔊 EDITÁVEL: coloque aqui os nomes das vozes que você TEM no aparelho
  // Dica: use o painel de vozes que você já tem ou os nomes padrão tipo "Luciana", "Mônica", "Conchita", etc.
  const VOICE_NAME_PREFS = {
    Atlas:  ["Luciana", "pt-BR"],
    Nova:   ["Luciana", "pt-BR"],
    Vitalis:["Luciana", "pt-BR"],

    // Esses você queria em espanhol:
    Pulse:  ["Mónica", "Monica", "Conchita", "es"],
    Artemis:["Mónica", "Monica", "Conchita", "es"],
    Solus:  ["Mónica", "Monica", "Conchita", "es"],
    Aion:   ["Mónica", "Monica", "Conchita", "es"],

    Serena: ["Luciana", "pt-BR"],
    Kaos:   ["Luciana", "pt-BR"],
    Genus:  ["Luciana", "pt-BR"],
    Lumine: ["Luciana", "pt-BR"],
    Rhea:   ["Luciana", "pt-BR"],
    Horus:  ["Luciana", "pt-BR"]
  };

  // 🧠 Normaliza o nome (sem acento / caixa)
  function norm(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Procura voz por nome / pedaço do nome / lang
  function pickVoiceByNamePrefs(archetype, voices) {
    const prefs = VOICE_NAME_PREFS[archetype];
    if (!prefs || !prefs.length) return null;

    const vlist = voices || synth.getVoices();
    if (!vlist || !vlist.length) return null;

    const normPrefs = prefs.map(norm);

    // 1) match exato de nome
    for (const p of normPrefs) {
      const exact = vlist.find(v => norm(v.name) === p);
      if (exact) return exact;
    }

    // 2) nome contém o pedaço (ex: "Monica" dentro de "Mônica - es-MX")
    for (const p of normPrefs) {
      const byPart = vlist.find(v => norm(v.name).includes(p));
      if (byPart) return byPart;
    }

    // 3) se algum pref parece código de idioma (ex: "es", "pt-br"), tenta lang
    for (const p of normPrefs) {
      if (p === "es" || p === "es-es" || p === "es-mx" || p === "pt-br" || p === "pt") {
        const byLang = vlist.find(v => norm(v.lang).startsWith(p));
        if (byLang) return byLang;
      }
    }

    return null;
  }

  // Guarda referência do applyArchetypeVoice original, se existir
  const originalApply = window.applyArchetypeVoice || null;

  window.applyArchetypeVoice = function patchedApplyArchetypeVoice(utterance, archetypeName) {
    try {
      const voices = synth.getVoices();
      let arch = archetypeName;

      // Normaliza o nome do arquétipo (Atlas, Nova, Pulse, Solus, Aion...)
      if (arch && typeof arch === "string") {
        arch = arch.trim();
        // Se vier em minúsculo, ajeita a primeira letra
        const low = arch.toLowerCase();
        const mapFix = {
          atlas: "Atlas",
          nova: "Nova",
          vitalis: "Vitalis",
          pulse: "Pulse",
          artemis: "Artemis",
          serena: "Serena",
          kaos: "Kaos",
          genus: "Genus",
          lumine: "Lumine",
          rhea: "Rhea",
          solus: "Solus",
          aion: "Aion",
          horus: "Horus"
        };
        arch = mapFix[low] || arch;
      }

      let chosen = null;

      if (arch && voices && voices.length) {
        chosen = pickVoiceByNamePrefs(arch, voices);
      }

      if (chosen) {
        utterance.voice = chosen;
        // marca no body quem tá falando (pra tema / debug visual)
        try {
          document.body.dataset.voiceArch = norm(arch);
        } catch(e){/* ignora se der erro */ }
        return;
      }

      // Se não achou nada pelas prefs, cai no comportamento antigo (se existir)
      if (typeof originalApply === "function") {
        originalApply(utterance, archetypeName);
      }

    } catch (err) {
      // Falhou o patch? volta pro original pra não quebrar nada
      if (typeof originalApply === "function") {
        try { originalApply(utterance, archetypeName); } catch(e){}
      }
    }
  };

})();
