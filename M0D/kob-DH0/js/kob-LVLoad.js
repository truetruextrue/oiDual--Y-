/*<script>*/
/* TRINITY Loader — fused modules (recommended) */
(function () {
  const CONFIG = {
    base: "https://kodux78k.github.io/oiDual--Y-/M0D/kob-DH0/js/m0ds/",
    order: [
      "core-inline.js",
      "utils-inline.js",
      "ui-stubs-inline.js"   // opcional: só se precisar dos stubs
    ],
    debug: true
  };

  const Runtime = { loaded: [], failed: [], start: Date.now() };
  window.KOBLLUX_TRINITY_RUNTIME = Runtime;

  function log(...a){ if(CONFIG.debug) console.log("[TRINITY]", ...a); }

  function load(url){
    return new Promise(res => {
      const s = document.createElement('script');
      s.src = `${CONFIG.base}${url}`;
      s.onload = () => { Runtime.loaded.push(url); log('loaded', url); res(true); };
      s.onerror = () => { Runtime.failed.push(url); log('error', url); res(false); };
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const file of CONFIG.order) {
      // optionally check HEAD here — omitted for speed in fusion mode
      await load(file);
    }
    log('TRINITY fused load complete', Runtime);
  })();
})();
/*</script>*/
