
function renderSplitText(txt) {
const groups = txt.split("---").map(str => str.trim()).filter(Boolean);
return {
intro: groups[0] || "",
middle: groups[1] || "",
ending: groups[2] || ""
};
}
function renderResponse(input) {
const wrap = document.querySelector(".pages-wrapper") || document.getElementById("pagesWrapper");
if (!wrap) return console.warn("⚠️ .pages-wrapper não encontrado");
wrap.innerHTML = "";
// Aceita string dividida ou objeto Trinity
const { intro, middle, ending } = typeof input === "string" ? renderSplitText(input) : input;
const renderBlock = (text, className, icon) => {
const block = document.createElement("div");
block.className = `response-block ${className}`;
// Submenu dinâmico
const submenu = document.createElement("div");
submenu.className = "submenu hidden";
submenu.innerHTML = `
<button onclick="logMistico('🔁 Reiniciando pulso: ${className}')">🔄 Repetir Pulso</button><button onclick="mostrarNucleoAntecipacao()">◉ Ativar Núcleo</button><button onclick="alert('💾 Exportar conteúdo em construção')">📥 Exportar</button>
`;
block.innerHTML = `
<div class="nestedBlock"><div class="symbol-header">${icon}</div><div class="symbol-body">${text}</div></div>
`;
block.appendChild(submenu);
// Toggle de submenu
block.addEventListener("click", () => {
submenu.classList.toggle("hidden");
block.classList.toggle("expanded");
logMistico(`🧬 Pulso expandido: ${className}`);
pg.appendChild(block);
});
wrap.appendChild(pg);
pages.push(pg);
});
return block;
};
if (intro) wrap.appendChild(renderBlock(intro, "intro", "🎁"));
if (middle) wrap.appendChild(renderBlock(middle, "middle", "👁️"));
if (ending) wrap.appendChild(renderBlock(ending, "ending", "◉"));
}
