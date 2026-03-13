
document.getElementById("btn-expandir-ritual")?.addEventListener("click", () => {
const pulsos = document.getElementById("pulsos");
if (pulsos) {
pulsos.classList.toggle("expanded");
if (!pulsos.classList.contains("expanded")) {
pulsos.scrollTop = pulsos.scrollHeight;
}
}
});
