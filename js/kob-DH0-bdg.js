/* KOBLLUX: iframe <-> parent communication & TTS bridge
   - Escuta mensagens vindas do iframe (types: archetype-change, theme-change, voice-change, request-read, request-scan-and-read)
   - Posta mensagens pra iframe quando o iframe carrega (parent-ready, archetype, theme)
   - Dispara TTS no contexto do parent usando APIs expostas ou fallback*/

(function attachIframeCommHandler(){
  if(!window || !document) return;
  const LOG_NS = 'KOB_IFRAME_COMM::';
  const mainFrame = document.querySelector('#content-frame'); // já existe no monólito
  const allowedOrigins = ['*']; // se você souber os origins, coloque-os aqui para mais segurança

  // util: toast leve (usa toast do monolith quando presente)
  const _toast = msg => {
    try{ if(typeof toast === 'function') toast(msg); else console.log(LOG_NS, msg); }catch(e){ console.log(LOG_NS, msg); }
  };

  // util: find browser voice by part
  function findVoiceByNamePart(part){
    try{
      const synth = window.speechSynthesis;
      const voices = synth ? synth.getVoices() : [];
      if(!voices || !voices.length) return null;
      if(part){
        const exact = voices.find(v => v.name && v.name.toLowerCase().includes(String(part).toLowerCase()));
        if(exact) return exact;
      }
      return voices.find(v => /pt/i.test(v.lang)) || voices[0] || null;
    }catch(e){ return null; }
  }

  // util: speak using available APIs (KOB_TTS, KOBLLUX, or fallback)
  function speakText(text, opts = {}){
    const t = String(text || '').trim();
    if(!t) return;
    const archVoice = opts.voice || (opts.arch && opts.arch.voice) || null;
    const rate = typeof opts.rate === 'number' ? opts.rate : (opts.arch && opts.arch.rate) || 1.0;
    const pitch = typeof opts.pitch === 'number' ? opts.pitch : (opts.arch && opts.arch.pitch) || 1.0;

    // 1) Try KOB_TTS API (preferred)
    try{
      if(window.KOB_TTS && typeof window.KOB_TTS.play === 'function'){
        // If KOB_TTS exposes a speak-like API, call it. Otherwise fallback to simple toggle/play patterns.
        if(typeof window.KOB_TTS.speak === 'function'){
          window.KOB_TTS.speak(t, {voice: archVoice, rate, pitch});
          return;
        }
        // fallback: put text in a queue object if available (not required)
        if(typeof window.KOB_TTS.toggle === 'function'){
          // quick approach: speak using native synth but mark that parent TTS handled it
          speakWithSynthFallback(t, {voice: archVoice, rate, pitch});
          return;
        }
      }
    }catch(e){ console.warn(LOG_NS, 'KOB_TTS speak attempt failed', e); }

    // 2) Try KOBLLUX APIs (monolith)
    try{
      if(window.KOBLLUX && typeof window.KOBLLUX.startSpeech === 'function'){
        // Some monolith callers expect to build blocks and read; but we can ask monolith to speak the exact text if it has api
        if(typeof window.KOBLLUX.speakText === 'function'){
          window.KOBLLUX.speakText(t, {voice: archVoice, rate, pitch});
          return;
        }
        // fallback to synth
      }
    }catch(e){ console.warn(LOG_NS, 'KOBLLUX speak attempt failed', e); }

    // 3) Fallback: native SpeechSynthesis
    speakWithSynthFallback(t, {voice: archVoice, rate, pitch});
  }

  function speakWithSynthFallback(text, {voice=null, rate=1.0, pitch=1.0} = {}){
    try{
      const synth = window.speechSynthesis;
      if(!synth){ _toast('TTS indisponível (synth).'); return; }
      // ensure voices loaded
      const voices = synth.getVoices();
      let v = null;
      if(voice) v = findVoiceByNamePart(voice);
      if(!v && voices && voices.length) v = voices.find(x => /pt/i.test(x.lang)) || voices[0];

      const u = new SpeechSynthesisUtterance(String(text));
      if(v) u.voice = v;
      u.rate = rate;
      u.pitch = pitch;
      u.lang = 'pt-BR';
      u.onstart = () => {};
      u.onend = () => {};
      synth.cancel();
      synth.speak(u);
    }catch(e){ console.warn(LOG_NS, 'synth fallback error', e); _toast('Erro TTS'); }
  }

  // Keep the last known archetype/theme state to share with iframes
  const sharedState = {
    archetype: (window.KOBLLUX && window.KOBLLUX.state && window.KOBLLUX.state.archIdx != null) ? (window.KOBLLUX.state.archIdx) : 0,
    archetypeId: null,
    themeVars: {
      primary: getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-primary')?.trim() || '#22D3EE',
      soft: getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-bg-soft')?.trim() || 'rgba(34,211,238,0.14)',
      secondary: getComputedStyle(document.documentElement).getPropertyValue('--kob-voice-secondary')?.trim() || '#38BDF8'
    }
  };

  // utility: send message to frame (if loaded)
  function postToFrame(message, targetOrigin='*'){
    try{
      if(!mainFrame || !mainFrame.contentWindow) return false;
      mainFrame.contentWindow.postMessage(message, targetOrigin);
      return true;
    }catch(e){ console.warn(LOG_NS, 'postToFrame fail', e); return false; }
  }

  // When the iframe loads (or changes src), inform it of current state
  if(mainFrame){
    mainFrame.addEventListener('load', () => {
      // notify iframe that parent is ready and inform current archetype/theme
      const payload = {
        type: 'parent-ready',
        ts: Date.now(),
        archetypeIndex: sharedState.archetype,
        theme: sharedState.themeVars
      };
      postToFrame(payload, '*');
      _toast('iframe carregado — notificado.');
    });
  }

  // Helper: try to extract name/term matching within text payload
  function containsNameMatch(text, matchList){
    if(!text || !matchList || !matchList.length) return false;
    const lower = String(text).toLowerCase();
    return matchList.some(m => String(m||'').toLowerCase().trim() && lower.includes(String(m).toLowerCase().trim()));
  }

  // message receiver from iframe(s)
  window.addEventListener('message', (ev) => {
    try{
      // Optionally restrict by origin:
      // if(allowedOrigins.indexOf('*') === -1 && allowedOrigins.indexOf(ev.origin) === -1) return;
      const msg = ev.data;
      if(!msg || typeof msg !== 'object' || !msg.type) return;

      switch(msg.type){
        /* iframe -> parent: archetype / theme / voice updates */
        case 'archetype-change': {
          // { type:'archetype-change', id: 'kodux' or index: 3, meta: {...} }
          if(msg.id) {
            // try update parent theme via existing function(s)
            // If monolith exposes updateArchetype(index) by id we try to find index
            const idx = (function findIdxById(id){
              try{
                if(window.ARCHETYPES && Array.isArray(window.ARCHETYPES)){
                  return window.ARCHETYPES.findIndex(a => a.id === id);
                }
                // try var ARCHETYPES in this scope
                if(typeof ARCHETYPES !== 'undefined' && Array.isArray(ARCHETYPES)){
                  return ARCHETYPES.findIndex(a => a.id === id);
                }
              }catch(e){}
              return -1;
            })(msg.id);

            if(idx >= 0 && typeof window.updateArchetype === 'function'){ window.updateArchetype(idx); }
            if(idx >= 0 && window.KOBLLUX && typeof window.KOBLLUX.updateArchetype === 'function'){ window.KOBLLUX.updateArchetype(idx); }
            sharedState.archetype = (idx >= 0) ? idx : sharedState.archetype;
            sharedState.archetypeId = msg.id;
            _toast('Arquétipo recebido: ' + msg.id);
          }
          if(msg.meta && msg.meta.color){
            // apply CSS vars in parent
            const c = msg.meta.color;
            document.documentElement.style.setProperty('--kob-voice-primary', c);
            // optional: soft/secondary
            if(msg.meta.soft) document.documentElement.style.setProperty('--kob-voice-bg-soft', msg.meta.soft);
            if(msg.meta.secondary) document.documentElement.style.setProperty('--kob-voice-secondary', msg.meta.secondary);
            sharedState.themeVars.primary = c;
            sharedState.themeVars.soft = msg.meta.soft || sharedState.themeVars.soft;
            sharedState.themeVars.secondary = msg.meta.secondary || sharedState.themeVars.secondary;
          }
          break;
        }

        case 'theme-change': {
          // {type:'theme-change', primary:'#ff00aa', soft:'rgba(...)', secondary:'#...'}
          const t = msg;
          if(t.primary) document.documentElement.style.setProperty('--kob-voice-primary', t.primary);
          if(t.soft) document.documentElement.style.setProperty('--kob-voice-bg-soft', t.soft);
          if(t.secondary) document.documentElement.style.setProperty('--kob-voice-secondary', t.secondary);
          sharedState.themeVars = { primary: t.primary || sharedState.themeVars.primary, soft: t.soft || sharedState.themeVars.soft, secondary: t.secondary || sharedState.themeVars.secondary };
          _toast('Tema do iframe aplicado.');
          break;
        }

        case 'voice-change': {
          // {type:'voice-change', voice:'Luciana', rate:1.06, pitch:1.2}
          // store to sharedState so future reads use it
          sharedState.voice = msg.voice || sharedState.voice;
          sharedState.rate = msg.rate || sharedState.rate;
          sharedState.pitch = msg.pitch || sharedState.pitch;
          _toast('Voz do iframe: ' + (msg.voice||'default'));
          break;
        }

        case 'request-read': {
          // {type:'request-read', text:'...', preferVoice:'Luciana', matchNames: ['Raphael','Gemini'] }
          const txt = msg.text || '';
          const prefer = msg.preferVoice || sharedState.voice;
          // If client asked only to read when contains names, check:
          if(Array.isArray(msg.matchNames) && msg.matchNames.length){
            if(!containsNameMatch(txt, msg.matchNames)){
              // respond that no match found
              try{ ev.source.postMessage({ type:'read-declined', reason:'no-match', ts:Date.now() }, ev.origin || '*'); }catch(e){}
              _toast('Leitura ignorada (sem match).');
              return;
            }
          }
          // speak
          speakText(txt, { voice: prefer, rate: msg.rate || sharedState.rate, pitch: msg.pitch || sharedState.pitch, arch: (msg.arch ? msg.arch : null) });
          // let iframe know we started
          try{ ev.source.postMessage({ type:'read-started', ts:Date.now(), origin: location.origin }, ev.origin || '*'); }catch(e){}
          break;
        }

        case 'request-scan-and-read': {
          // {type:'request-scan-and-read', selector:'p', matchName:['Gemini'], preferVoice:'Luciana'}
          // Parent tries to scan iframe DOM ONLY if same origin; otherwise ask iframe to send text instead
          const sel = msg.selector || 'p';
          try{
            if(ev.source && ev.source.document){ /* unlikely cross-origin */ }
          }catch(e){}
          // Prefer the iframe to send back the exact text (more robust)
          // But if same-origin, parent can access and read:
          try{
            // attempt to read nodes (only works if same-origin)
            const doc = (ev.source && ev.source.document) ? ev.source.document : null;
            if(doc){
              const nodes = [...doc.querySelectorAll(sel)].filter(n=> (n.innerText||'').trim());
              if(nodes && nodes.length){
                let found = false;
                for(const n of nodes){
                  const t = n.innerText.trim();
                  if(Array.isArray(msg.matchName) && msg.matchName.length){
                    if(containsNameMatch(t, msg.matchName)){
                      speakText(t, { voice: msg.preferVoice || sharedState.voice, rate: msg.rate, pitch: msg.pitch });
                      found = true;
                      break;
                    }
                  } else {
                    // just read first item or all? we read first for safety
                    speakText(t, { voice: msg.preferVoice || sharedState.voice, rate: msg.rate, pitch: msg.pitch });
                    found = true;
                    break;
                  }
                }
                if(found){ try{ ev.source.postMessage({ type:'scan-read-done', ts:Date.now()}, ev.origin || '*'); }catch(e){} }
                else { try{ ev.source.postMessage({ type:'scan-read-none', ts:Date.now()}, ev.origin || '*'); }catch(e){} }
                break;
              }
            }
          }catch(e){ /* cross-origin or failed */ }

          // fallback: ask iframe to return matching text
          try{
            ev.source.postMessage({ type:'please-send-matching-text', selector: sel, matchName: msg.matchName || null }, ev.origin || '*');
          }catch(e){}
          break;
        }

        case 'iframe-opened': {
          // {type:'iframe-opened', url:'https://...'}
          // Useful: when iframe informs parent it became visible/active
          _toast('Iframe aberto: ' + (msg.url || '').replace(/^https?:\/\//,''));
          // respond with current archetype & theme
          try{
            ev.source.postMessage({ type:'parent-state', archetypeIndex: sharedState.archetype, theme: sharedState.themeVars, ts:Date.now() }, ev.origin || '*');
          }catch(e){}
          break;
        }

        // iframe can send text result in response to please-send-matching-text
        case 'matching-text': {
          // {type:'matching-text', text:'...', reason:'match found'}
          if(msg.text){
            const prefer = msg.preferVoice || sharedState.voice;
            speakText(msg.text, { voice: prefer, rate: msg.rate || sharedState.rate, pitch: msg.pitch || sharedState.pitch });
            try{ ev.source.postMessage({ type:'read-started-by-parent', ts:Date.now() }, ev.origin || '*'); }catch(e){}
          }
          break;
        }

        default:
          // ignore unknown
          break;
      }
    }catch(err){ console.warn(LOG_NS, 'msg handler error', err); }
  }, { passive: true });

  // Expose small API to let other parts call postToFrame easily
  window.KOB_IFRAME_COMM = window.KOB_IFRAME_COMM || {};
  Object.assign(window.KOB_IFRAME_COMM, {
    post: postToFrame,
    speak: speakText,
    sharedState,
    notifyFrameOfArchetype: (archIdxOrId) => {
      const payload = { type:'parent-archetype', arch: archIdxOrId, theme: sharedState.themeVars };
      postToFrame(payload,'*');
    }
  });

  _toast('Bridge iframe <-> parent inicializada.');
})();