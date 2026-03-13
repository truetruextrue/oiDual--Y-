
// 🎧 Novos sons com base em IDs
const uiBL = {
toggle: new Audio('assets/sounds/uiSamples/toggleBtn-sfx.wav'),
kitty: new Audio('assets/sounds/uiSamples/kittyBtn-sfx.wav'),
ativar: new Audio('assets/sounds/uiSamples/ativar-click-toggleBtn.wav'),
nav: new Audio('assets/sounds/uiSamples/navigation.wav'),
cancel: new Audio('assets/sounds/uiSamples/cancel.wav')
};
// Volume padrão
for (const k in uiBL) uiBL[k].volume = 0.45;
document.addEventListener("DOMContentLoaded", () => {
// Botão toggle (login)
const toggle = document.getElementById("toggleBtn");
if (toggle) toggle.addEventListener("click", () => {
uiBL.toggle.currentTime = 0;
uiBL.toggle.play().catch(()=>{});
});
// Botão kitty
const kitty = document.getElementById("kittyBtn");
if (kitty) kitty.addEventListener("click", () => {
uiBL.kitty.currentTime = 0;
uiBL.kitty.play().catch(()=>{});
});
// Botão ativar no login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
loginForm.addEventListener("submit", () => {
uiBL.ativar.currentTime = 0;
uiBL.ativar.play().catch(()=>{});
});
}
// Copiar / colar
document.querySelectorAll('.copy-button, .paste-button').forEach(btn =>
btn.addEventListener("click", () => {
uiBL.cancel.currentTime = 0;
uiBL.cancel.play().catch(()=>{});
})
);
});
