
// 🎧 Sons de interface - Coblux UI Samples
const uiSounds = {
click: new Audio('assets/sounds/uiSamples/navigation.wav'),
hover: new Audio('assets/sounds/uiSamples/hover.wav'),
confirm: new Audio('assets/sounds/uiSamples/confirm.wav'),
back: new Audio('assets/sounds/uiSamples/back.wav'),
temaUp: new Audio('assets/sounds/uiSamples/back-action.wav'),
temaDown: new Audio('assets/sounds/uiSamples/back-action.wav'),
};
// Volume padrão
for (const key in uiSounds) {
uiSounds[key].volume = 0.4;
}
// ⛔ Remover microfone automático
// window.SpeechRecognition = null;
// window.webkitSpeechRecognition = null;
// 🎯 Sons ao interagir
document.addEventListener("DOMContentLoaded", () => {
// Clique em qualquer botão
document.querySelectorAll("button").forEach(btn => {
btn.addEventListener("click", () => {
uiSounds.click.currentTime = 0;
uiSounds.click.play().catch(() => {});
});
btn.addEventListener("mouseover", () => {
uiSounds.hover.currentTime = 0;
uiSounds.hover.play().catch(() => {});
});
});
// Enviar mensagem (confirmar)
const sendBtn = document.getElementById("sendBtn");
if (sendBtn) {
sendBtn.addEventListener("click", () => {
uiSounds.confirm.currentTime = 0;
uiSounds.confirm.play().catch(() => {});
});
}
// Trocar tema manualmente (temaSelector)
const themeSelector = document.getElementById("themeSelector");
if (themeSelector) {
let lastIndex = themeSelector.selectedIndex;
themeSelector.addEventListener("change", () => {
const newIndex = themeSelector.selectedIndex;
if (newIndex > lastIndex) {
uiSounds.temaUp.currentTime = 0;
uiSounds.temaUp.play().catch(() => {});
} else if (newIndex < lastIndex) {
uiSounds.temaDown.currentTime = 0;
uiSounds.temaDown.play().catch(() => {});
}
lastIndex = newIndex;
});
}
// Navegação entre páginas
document.querySelectorAll('[data-action="prev"]').forEach(btn =>
btn.addEventListener("click", () => {
uiSounds.back.currentTime = 0;
uiSounds.back.play().catch(() => {});
})
);
document.querySelectorAll('[data-action="next"]').forEach(btn =>
btn.addEventListener("click", () => {
uiSounds.confirm.currentTime = 0;
uiSounds.confirm.play().catch(() => {});
})
);
});
