
const pulsos = document.getElementById("pulsos");
function logMistico(msg) {
const el = document.createElement("div");
el.className = "debug-mistico";
el.innerText = "◉ " + msg;
pulsos.appendChild(el);
if (!pulsos.classList.contains("expanded")) {
pulsos.scrollTop = pulsos.scrollHeight;
}
}
pulsos.addEventListener("click", () => {
pulsos.classList.toggle("expanded");
if (!pulsos.classList.contains("expanded")) {
pulsos.scrollTop = pulsos.scrollHeight;
}
});
function spawnCosmicExplosion(x, y) {
const boom = document.createElement("div");
boom.style.position = "absolute";
boom.style.left = x + "px";
boom.style.top = y + "px";
boom.style.width = boom.style.height = "12px";
boom.style.borderRadius = "50%";
boom.style.background = "radial-gradient(circle, #0ff, #f0f0ff, transparent)";
boom.style.pointerEvents = "none";
boom.style.animation = "pulse 0.4s ease-out";
document.body.appendChild(boom);
setTimeout(() => boom.remove(), 1000);
}
// Pulso na página principal
document.addEventListener("click", e => {
spawnCosmicExplosion(e.clientX, e.clientY);
navigator.vibrate?.([5, 15, 5]);
logMistico("Pulso simbiótico em " + e.clientX + ", " + e.clientY);
});
// Recebe cliques do iframe
window.addEventListener("message", function(event) {
if (event.data?.type === "iframeClick") {
const iframe = document.getElementById("seuIframeID"); // Troque para o ID real do seu iframe
if (!iframe) return;
const rect = iframe.getBoundingClientRect();
const xGlobal = rect.left + event.data.x;
const yGlobal = rect.top + event.data.y;
spawnCosmicExplosion(xGlobal, yGlobal);
navigator.vibrate?.([5, 15, 5]);
logMistico("⚡ Pulso no iFrame em " + event.data.x + ", " + event.data.y);
}
});
