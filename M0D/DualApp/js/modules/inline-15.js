
function transformarSimbolosAvancado() {
const targetBlocks = document.querySelectorAll('.renderResponse, .response-block, .output-block, .console');
targetBlocks.forEach(block => {
if (!block.dataset.parsed) {
let html = block.innerHTML;
// Colchetes [simbolo]
html = html.replace(/\[(.+?)\]/g, (_, simbolo) =>
`<span class="symbol-button tipo-colchete" onclick="registrarPulsoEEnviar('${simbolo}')">[${simbolo}]</span>`
);
// Chaves {simbolo}
//html = html.replace(/\{(.+?)\}/g, (_, simbolo) =>
//  `<span class="symbol-button tipo-chave" onclick="enviarPulsoSimbolico('${simbolo}')">{${simbolo}}</span>`
//);
// Parênteses (simbolo)
//html = html.replace(/\((.+?)\)/g, (_, simbolo) =>
//  `<span class="symbol-button tipo-parenteses" onclick="enviarPulsoSimbolico('${simbolo}')">(${simbolo})</span>`
//);
// Emojis únicos (corrigido: evita quadrado duplicado)
html = html.replace(/([\p{Emoji}])/gu, (_, emoji) =>
`<span class="symbol-button tipo-emoji" onclick="registrarPulsoEEnviar('${emoji}')">${emoji}</span>`
);
// ASCII blocks (3+ linhas)
//* html = html.replace(/(?:<br\s*\/?>\s*){2,}([\s\S]+?)(?:<br\s*\/?>\s*){2,}/g, (_, ascii) => {
//const id = 'ascii-' + Math.random().toString(36).substr(2, 6);
//return `
//  <div class="ascii-container">
//   <span class="symbol-button tipo-ascii-toggle" onclick="toggleNested('${id}')">▶️ ASCII</span>
//    <pre id="${id}" class="nestedBlock hidden">${ascii.trim()}</pre>
//   </div>`;
// });
block.innerHTML = html;
block.dataset.parsed = "true";
}
});
}
function enviarPulsoSimbolico(simbolo, tipo = "SimboloAvancado") {
const role = localStorage.getItem("role") || "user";
const system = localStorage.getItem("system") || "";
const entradaSimbolica = {
role,
content: `[${simbolo}]`,
system,
tipo,
};
renderResponse(entradaSimbolica.content, tipo);
console.log("🔮 Pulso simbiótico:", entradaSimbolica);
}
function toggleNested(id) {
const el = document.getElementById(id);
if (el) {
el.classList.toggle('hidden');
const toggle = el.previousElementSibling;
toggle.innerText = el.classList.contains('hidden') ? '▶️ ASCII' : '▼ ASCII';
}
}
// Otimizado com MutationObserver (sem setInterval)
const observer = new MutationObserver(transformarSimbolosAvancado);
observer.observe(document.body, { childList: true, subtree: true });
