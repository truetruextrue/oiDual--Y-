
(function(){
  function exists(id){ return !!document.getElementById(id); }
  function logWarn(msg){ try{ console.warn("[MASTER DIAG]", msg); }catch(e){} }

  var critical = ["userInput","sendBtn","voiceBtn"];
  critical.forEach(function(id){
    if(!exists(id)){ logWarn("Elemento não encontrado: #"+id); }
  });

  // Optional: if onSend is missing, try to shim it to avoid dead clicks.
  if (typeof window.onSend !== "function") {
    window.onSend = function(){
      var input = document.getElementById("userInput");
      var txt = (input && input.value || "").trim();
      if(!txt){ if(input) input.focus(); return; }
      // Fallback render-only path if callAI não estiver disponível
      if (typeof window.callAI === "function") {
        try { window.callAI(txt); return; } catch(e){}
      }
      if (typeof window.renderResponse === "function") {
        try { window.renderResponse("[Echo] "+txt); } catch(e){}
      } else if (typeof window.renderResponseBlocks === "function") {
        try { window.renderResponseBlocks({intro:"", middle:"[Echo] "+txt, ending:""}); } catch(e){}
      } else {
        logWarn("Nem callAI nem renderResponse encontrados.");
      }
    };
  }
})();
