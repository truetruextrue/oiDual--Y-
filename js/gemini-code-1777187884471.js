// Sunrise Engine V2 - Protocol Aware
(() => {
  "use strict";

  // 1. Ouvinte de Mensagens (O Coração do Handshake)
  window.addEventListener("message", (event) => {
    // Segurança: Verifique a origem se necessário
    const { type, payload } = event.data;
    
    if (type === "SUNRISE_REGISTER_SYMBOLS") {
      console.log("🌅 Símbolos recebidos via Handshake:", payload);
      // Mescla os botões novos com os existentes sem duplicar
      const currentButtons = DI_Engine.state.buttons;
      const newButtons = payload.filter(nb => !currentButtons.find(cb => cb.id === nb.id));
      
      if(newButtons.length > 0) {
        DI_Engine.saveButtons([...currentButtons, ...newButtons]);
        DI_Engine.syncHud("Símbolos Importados");
      }
    }
  });

  // 2. Exportar API mínima para o console/outros scripts
  window.DI_Engine = {
    register: (btns) => window.postMessage({type: "SUNRISE_REGISTER_SYMBOLS", payload: btns}, "*")
  };
})();