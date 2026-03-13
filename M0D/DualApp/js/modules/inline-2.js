
document.getElementById("btn-expandir-ritual").onclick = () => {
const alvo = document.getElementById("corpo-espelho") || document.getElementById("pulsos");
if (alvo) {
alvo.style.display = alvo.style.display === "none" ? "block" : "none";
logMistico("⧉ Expandiu o plano ritual oculto.");
}
};
