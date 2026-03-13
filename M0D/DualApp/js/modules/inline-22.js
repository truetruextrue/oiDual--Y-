
function ATIVAR_KOBLLUX_PATCH() {
// CSS refinado com bordas suaves
const style = document.createElement("style");
style.textContent = `
:root {
--mask-gradient: linear-gradient(45deg, #F0F, #0FF);
}
button,
.symbol-button,
.response-container,
.login-container,
#decoderBox,
#koblluxPlayer,
#pulsos-container {
-webkit-mask-image: var(--mask-gradient);
mask-image: var(--mask-gradient);
border-image: var(--mask-gradient);
border-image-slice: 1;
border-width: 1px;
border-style: solid;
border-radius: 28px;
transition: transform 0.2s, box-shadow 0.3s;
cursor: pointer;
}
.symbol-btn {
-webkit-mask-image: var(--mask-gradient);
mask-image: var(--mask-gradient);
border-image: var(--mask-gradient);
border-image-slice: 1;
background: var(--bg);
border: 1px solid rgba(0, 255, 255, 0.2);
color: #0ff;
border-radius: 8px;
padding: 2px 6px;
margin: 2px;
cursor: pointer;
font-size: 0.9em;
}
.response-block {
padding: 1.8rem !important;
}
`;
document.head.appendChild(style);
// renderResponse aprimorado
window.renderResponse = function(text) {
const container = document.querySelector(".pages-wrapper");
if (!container) return;
container.innerHTML = "";
const sentences = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
const classes = ["intro", "middle", "ending"];
sentences.forEach((para, index) => {
const block = document.createElement("div");
block.className = "response-block " + classes[index % 3];
const parsed = para
.replace(/(\p{Emoji_Presentation}|\p{Emoji})/gu, match =>
`<button class="symbol-btn" onclick="logMistico('Emoji: ${match}')">${match}</button>`
)
.replace(/\[(.+?)\]/g, (match, p1) =>
`<button class="symbol-btn" onclick="logMistico('[${p1}]')">[${p1}]</button>`
);
block.innerHTML = parsed;
block.addEventListener("click", () => {
block.classList.toggle("expanded");
const pulsos = document.getElementById("pulsos");
if (pulsos) pulsos.classList.toggle("expanded");
logMistico("◉ Expandiu bloco: " + block.className);
});
container.appendChild(block);
});
logMistico("✅ renderResponse executado com " + sentences.length + " blocos");
};
// VoiceBtn refinado
const voiceBtn = document.getElementById("voiceBtn");
if (voiceBtn) {
voiceBtn.addEventListener("click", () => {
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'pt-BR';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.start();
recognition.onresult = (event) => {
const transcript = event.results[0][0].transcript;
const inputField = document.getElementById("userInput");
if (inputField) {
inputField.value = transcript;
document.getElementById("sendBtn")?.click();
logMistico("🎤 Voz capturada: " + transcript);
}
};
recognition.onerror = (event) => {
logMistico("❌ Erro no microfone: " + event.error);
};
logMistico("🎤 Microfone ativado");
});
}
// LOG MISTICO — Universal logging visual + ações opcionais
window.logMistico = function(msg, options = {}) {
const el = document.createElement("div");
el.className = "debug-mistico";
el.innerText = "◉ " + msg;
const pulsos = document.getElementById("pulsos");
if (pulsos) {
pulsos.appendChild(el);
pulsos.scrollTop = pulsos.scrollHeight;
} else {
console.log("[KOBLLUX LOG]:", msg);
}
// Ações opcionais integradas ao log
if (options.enviarPulso && options.simbolo) {
registrarPulsoEEnviar(options.simbolo);
}
if (options.callAI) {
callAI();
}
if (options.updateUI) {
updateUI();
}
};
// Eventos extras
document.getElementById("toggleBtn")?.addEventListener("click", () => logMistico("🧠 Assistente Toggled"));
document.getElementById("kittyBtn")?.addEventListener("click", () => logMistico("🐱 Kitty ativado"));
document.getElementById("sendBtn")?.addEventListener("click", () => {
const msg = document.getElementById("userInput")?.value;
logMistico("📤 Enviado: " + msg);
});
logMistico("✨ PATCH KOBLLUX SUPREMO ativado");
}
