
function salvarConfiguracoesAvancadas() {
const newSK = document.getElementById("skInput")?.value.trim();
const roleSystem = document.getElementById("roleSystemInput")?.value.trim();
const newModel = document.getElementById("modelSelector")?.value;
if (newSK) {
localStorage.setItem("INFODOSE_SK", newSK);
logMistico("🔐 Nova chave SK salva.");
}
if (roleSystem) {
sessionStorage.setItem("ROLE_SYSTEM_DOC", roleSystem);
logMistico("📜 Role System atualizado.");
}
if (newModel) {
localStorage.setItem("INFODOSE_MODEL", newModel);
logMistico("🤖 Modelo alterado para: " + newModel);
}
alert("Configurações avançadas aplicadas.");
}
