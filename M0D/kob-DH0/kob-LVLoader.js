/*<script>*/
/* TRINITY Loader — current inline-Ns (sequential, debug, runtime) */
(function () {
  const CONFIG = {
    base: "https://kodux78k.github.io/oiDual--Y-/M0D/kob-DH0/js/m0ds/",
    groups: {
      core: [0,3,16],
      utils: [9,12],
     // ui: [24,25,26,27,28,29,30,31,39],
  //    extras: [1,2,4,6,8,20]
    },
    sequential: true,
    debug: true
  };

  const Runtime = { loaded: [], failed: [], start: Date.now() };
  window.KOBLLUX_INLINE_RUNTIME = Runtime;

  function log(...args) {
    if (!CONFIG.debug) return;
    console.log("[TRINITY-LOADER]", ...args);
  }

  function loadScript(src){
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => { log("loaded", src); resolve(true); };
      s.onerror = () => { log("error", src); resolve(false); };
      document.head.appendChild(s);
    });
  }

  async function exists(url) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      return r.ok;
    } catch {
      return false;
    }
  }

  (async () => {
    for (const grpName of Object.keys(CONFIG.groups)) {
      const list = CONFIG.groups[grpName];
      log("start group", grpName, list);
      for (const n of list) {
        const url = `${CONFIG.base}inline-${n}.js`;
        const ok = await exists(url);
        if (!ok) {
          log("missing", url);
          Runtime.failed.push(url);
          continue;
        }
        const okLoad = await loadScript(url);
        if (okLoad) Runtime.loaded.push(url);
        else Runtime.failed.push(url);
      }
    }
    log("TRINITY loader finished", Runtime);
  })();
})();
/*</script>*/
