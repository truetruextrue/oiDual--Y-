
document.addEventListener("DOMContentLoaded", () => {
const uploadBtn = document.getElementById("uploadFileBtn");
const inputFile = document.getElementById("symbolicFileInput");
uploadBtn?.addEventListener("click", () => {
inputFile?.click();
});
inputFile?.addEventListener("change", () => {
const file = inputFile.files[0];
if (file) {
logMistico("📂 Arquivo enviado: " + file.name);
const reader = new FileReader();
reader.onload = () => {
logMistico("📖 Conteúdo: " + reader.result.slice(0, 300) + "...");
};
reader.readAsText(file);
}
});
});
