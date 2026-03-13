
function registrarPulsoEEnviar(simbolo) {
logMistico(`🧿 Pulso simbólico ativado: ${simbolo}`);
if (!isEnabled) {
isEnabled = true;
localStorage.setItem(STORAGE_KEY, '1');
updateUI();
}
showLoading(` Pulso simbiótico de "${simbolo}" em expansão...`);
conversation.push({
role: 'user',
content: `✨ Pulso simbólico: ${simbolo}`
});
callAI();
}
