
function salvarHistorico(pulso) {
logResponseHistorico.push({ ...pulso, timestamp: new Date().toISOString() });
const pulsos = document.getElementById("pulsos");
if (pulsos) {
const item = document.createElement("div");
item.className = "pulso-item";
item.innerHTML = `
<div><strong>🕒</strong> ${new Date().toLocaleTimeString()}</div><div>🎁 ${pulso.intro?.slice(0, 30) || ''}</div><div>👁️ ${pulso.middle?.slice(0, 30) || ''}</div><div>◉ ${pulso.ending?.slice(0, 30) || ''}</div><button class="replay-btn">🔁 Repetir</button><hr/>
`;
item.querySelector("button").addEventListener("click", () => {
renderResponse(pulso);
logMistico("♻️ Pulso do histórico reativado.");
});
pulsos.prepend(item);
}
}
