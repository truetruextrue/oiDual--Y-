
(()=>{
  try{
    const K='kob_tts_prefs_v32';
    const p = Object.assign({preferMale:false,userLockedBase:false,voiceName:''}, JSON.parse(localStorage.getItem(K)||'{}'));
    p.preferMale=false; p.userLockedBase=false; p.voiceName='';
    localStorage.setItem(K, JSON.stringify(p));
  }catch{}
  // opcional: expõe um atalho pro console
  window.__kob_reset_tts_prefs = ()=>{
    try{
      const K='kob_tts_prefs_v32';
      const p = {preferMale:false,userLockedBase:false,voiceName:''};
      localStorage.setItem(K, JSON.stringify(p));
      return p;
    }catch(e){ return e&&e.message; }
  };
})();
