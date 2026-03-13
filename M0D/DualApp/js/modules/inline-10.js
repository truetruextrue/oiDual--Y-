
document.addEventListener("DOMContentLoaded", () => {
const footer = document.querySelector(".footer-text");
const inputContainer = document.querySelector(".input-container");
const controls = document.querySelector(".control-buttons");
const pagination = document.querySelector(".pagination");
const ritualBtn = document.getElementById("btn-expandir-ritual");
if (footer && inputContainer && controls && pagination) {
footer.addEventListener("click", () => {
inputContainer.classList.toggle("hidden");
controls.classList.toggle("hidden");
pagination.classList.toggle("hidden");
ritualBtn.classList.toggle("move-to-bottom-ritual");
footer.classList.toggle("move-to-bottom");
});
}
});
