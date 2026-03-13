
document.addEventListener("DOMContentLoaded", () => {
const voiceBtn = document.getElementById("voiceBtn");
if (!voiceBtn) return;
let recognition;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
console.warn("Reconhecimento de voz não suportado.");
voiceBtn.style.opacity = 0.2;
return;
}
recognition = new SpeechRecognition();
recognition.lang = "pt-BR";
recognition.continuous = false;
recognition.interimResults = false;
recognition.onstart = () => {
voiceBtn.classList.add("listening");
logMistico("🎤 Pulso iniciado: ouvindo...");
};
recognition.onresult = (event) => {
const transcript = event.results[0][0].transcript.trim();
document.getElementById("userInput").value = transcript;
logMistico("🎤 Voz detectada: " + transcript);
document.getElementById("sendBtn").click();
};
recognition.onerror = (event) => {
logMistico("⚠️ Erro de voz: " + event.error);
};
recognition.onend = () => {
voiceBtn.classList.remove("listening");
logMistico("🛑 Pulso finalizado");
};
voiceBtn.addEventListener("click", () => {
try {
recognition.start();
} catch (err) {
logMistico("🚫 Falha ao iniciar reconhecimento: " + err.message);
}
});
});
