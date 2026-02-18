/* DI_CORE.V2 — ATLAS ∴ V2 (reactive storage + app shell) */
(function(global){
  "use strict";
  const di_ = global.di_ || {};

  // --- Key mapping: localStorage key -> di_.state field ---
  di_.keyMap = {
    "di_apiKey": "apiKey",
    "di_modelName": "modelName",
    "di_userName": "userName",
    "di_infodoseName": "infodoseName",
    "di_solarMode": "solarMode",
    "uno:theme": "theme",
    // adicione mais se necessário
  };

  // --- default state (fonte da verdade em memória) ---
  di_.state = {
    apiKey: localStorage.getItem('di_apiKey') || '',
    modelName: localStorage.getItem('di_modelName') || 'nvidia/nemotron-3-nano-30b-a3b:free',
    userName: localStorage.getItem('di_userName') || 'Viajante',
    infodoseName: localStorage.getItem('di_infodoseName') || 'KOBLLUX',
    theme: localStorage.getItem('uno:theme') || 'medium',
    solarMode: localStorage.getItem('di_solarMode') || 'night'
  };

  // --- event bus (pulse) ---
  di_.bus = {
    listeners: {},
    on(event, cb){ if(!this.listeners[event]) this.listeners[event]=[]; this.listeners[event].push(cb); },
    off(event, cb){ if(!this.listeners[event]) return; this.listeners[event]=this.listeners[event].filter(x=>x!==cb); },
    emit(event, data){ (this.listeners[event]||[]).forEach(cb=>{ try{cb(data);}catch(e){console.error('di_.bus cb',e);} }); }
  };

  // --- modules registry / app shell ---
  di_.modules = {};
  di_.register = function(name, initFn){
    di_.modules[name] = { init: initFn, instance: null };
    console.log(`[DI] módulo registrado: ${name}`);
  };
  di_.start = async function(){
    for(const name of Object.keys(di_.modules)){
      try{ di_.modules[name].instance = await di_.modules[name].init(di_); }
      catch(e){ console.error(`[DI] falha ao iniciar ${name}`, e); }
    }
    di_.bus.emit('ready', true);
  };

  // --- storage helpers (Genus) ---
  function tryParse(v){
    if (v===null || v===undefined) return v;
    if (typeof v !== 'string') return v;
    const t = v.trim();
    if (t === '') return '';
    if ((t[0]==='{' && t[t.length-1]==='}') || (t[0]==='[' && t[t.length-1]===']')) {
      try { return JSON.parse(t); } catch(e) { return v; }
    }
    return v;
  }

  di_.storage = {
    set(key, val){
      try{
        const storeVal = (typeof val === 'object') ? JSON.stringify(val) : String(val == null ? '' : val);
        localStorage.setItem(key, storeVal);
        const field = di_.keyMap[key];
        if (field) di_.state[field] = val;
        di_.bus.emit('state-change', { key, val, field });
        // also generic event
        di_.bus.emit(`storage:${key}`, { key, val });
        return true;
      }catch(e){
        console.error('[DI STORAGE SET]', e);
        return false;
      }
    },
    get(key, def){
      try{
        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) return def;
        return tryParse(raw);
      }catch(e){
        return def;
      }
    },
    // convenience: update state from mapped keys (on init)
    syncFromLocalStorage(){
      Object.keys(di_.keyMap).forEach(k=>{
        const field = di_.keyMap[k];
        const v = this.get(k, undefined);
        if (v !== undefined) di_.state[field] = v;
      });
      di_.bus.emit('state-sync', di_.state);
    }
  };

  // listen to window 'storage' to sync across tabs
  window.addEventListener('storage', (e)=>{
    if (!e.key) return;
    const field = di_.keyMap[e.key];
    const val = tryParse(e.newValue);
    if (field) {
      di_.state[field] = val;
      di_.bus.emit('state-change', { key: e.key, val, field, remote: true });
    } else {
      di_.bus.emit('storage:external', { key: e.key, val });
    }
  });

  // helper: reactive getter
  di_.get = (k, def) => {
    const map = di_.keyMap[k];
    if (map) return di_.state[map] !== undefined ? di_.state[map] : di_.storage.get(k, def);
    return di_.storage.get(k, def);
  };

  // helper: safe setter for modules
  di_.api = {
    set(key, val){ return di_.storage.set(key, val); },
    get(key, def){ return di_.storage.get(key, def); },
    onStateChange(cb){ di_.bus.on('state-change', cb); },
    onReady(cb){ di_.bus.on('ready', cb); }
  };

  // expose global and bootstrap
  global.di_ = di_;
  document.addEventListener('DOMContentLoaded', ()=>{
    di_.storage.syncFromLocalStorage();
    // start modules after a microtask so registered modules can exist
    setTimeout(()=> di_.start(), 0);
  });

})(window);