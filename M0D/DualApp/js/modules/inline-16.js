
function expandirPulso() {
const pulsos = document.getElementById("pulsos");
if (pulsos && !pulsos.classList.contains("expanded")) {
pulsos.classList.add("expanded");
pulsos.scrollTop = pulsos.scrollHeight;
logMistico("◉ Pulso ativado com expansão externa.");
}
}
function renderResponseBlocks({ intro = "", middle = "", ending = "" }) {
const container = document.querySelector(".pages-wrapper");
function createBlock(content, className) {
const block = document.createElement("div");
block.className = "response-block " + className;
const parsed = content
.replace(/(\p{Emoji_Presentation}|\p{Emoji})/gu, match => {
return `<button class="symbol-btn" onclick="expandirPulso(); logMistico('Emoji: ${match}')">${match}</button>`;
})
.replace(/\[(.+?)\]/g, (match, p1) => {
return `<button class="symbol-btn" onclick="expandirPulso(); logMistico('[${p1}]')">[${p1}]</button>`;
});
block.innerHTML = parsed;
block.addEventListener("click", () => {
block.classList.toggle("expanded");
expandirPulso();
logMistico("◉ Expandiu bloco: " + className);
});
return block;
}
if (intro)  container.appendChild(createBlock(intro, "intro"));
if (middle) container.appendChild(createBlock(middle, "middle"));
if (ending) container.appendChild(createBlock(ending, "ending"));
}
