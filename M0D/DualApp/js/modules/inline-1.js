
const frame = document.getElementById('frame');
const activationSound = new Audio('assets/sounds/acts/wounds/codigo-MT-OLX-0.wav');
function playSound() {
activationSound.volume = 1;
activationSound.play().catch(()=>{});
}
function loadPage(url) {
frame.classList.remove('active');
setTimeout(() => {
frame.src = url;
frame.onload = () => frame.classList.add('active');
}, 300);
}
const uploadInput = document.getElementById('uploadHTML');
document.getElementById('uploadComponentBtn').onclick = () => {
playSound();
uploadInput.click();
};
uploadInput.onchange = (e) => {
const file = e.target.files[0];
if (file && file.name.endsWith('.html')) {
const reader = new FileReader();
reader.onload = (ev) => {
const blob = new Blob([ev.target.result], { type: 'text/html' });
const blobUrl = URL.createObjectURL(blob);
const frame = document.createElement('my-frame-loader');
frame.src = blobUrl;
document.body.appendChild(frame);
};
reader.readAsText(file);
} else {
alert('Selecione um arquivo .html válido.');
}
};
document.getElementById('remoteComponentBtn').onclick = () => {
playSound();
const url = prompt("URL do componente remoto:");
if (url) {
const frame = document.createElement('my-frame-loader');
frame.src = url;
document.body.appendChild(frame);
}
};
const toggleDecoderBtn = document.getElementById('toggleDecoderBtn');
const decoderBox = document.getElementById('decoderBox');
toggleDecoderBtn.onclick = () => {
playSound();
decoderBox.style.display = decoderBox.style.display === 'none' ? 'block' : 'none';
};
const CODE_MAP = {
"DUAL": "menu.html",
"KBX": "menu-x-1.html",
"ATVR": "render-response.html",
"ATVD": "decodificador.html",
"337": "KOBLLUX_MetaLux_CLEANED.html",
"DBK": "dual-book-12.html",
"IMN": "index-manifestado.html",
"IMNN": "index-manifestado-tangle.html",
"BTS": "botao-simbolico.html",
"SBK": "SmbS-book-4.html",
"SBL": "SmbS-book-2.html",
"KDX": "menu-kobllux-v2-completo.html",
"KDI": "menu-integrado-kobllux.html",
"KDP": "menu-x-1-E-4.html",
"KDF": "menu-x-1-E-8.html",
"KDB": "menu-x-1-E-10.html",
"KDJ": "menu-x-1-E-4-com-botoes-injetados.html",
"HTM": "KBLX-HTML-v4.1-FULLSCREEN-SEPARADOR.html",
"MN6": "menu-x-1-E-6.html",
"MN7": "menu-x-1-E-7.html",
"MN8": "menu-x-1-E-8.html",
"MN9": "menu-x-1-E-9.html",
"MN10": "menu-x-1-E-10.html",
"MN11e": "menu-x-1-E-11e.html",
"MN12": "menu-x-1-E-12.html",
"MN13": "menu-final-com-pulso.html",
"MN14": "menu-pulso-final.html",
"MN15": "menu-x-1-E-15.html",
"MN16": "menu-x-1-E-16.html",
};
function decodeSymbolicCode() {
playSound();
const code = document.getElementById('codeInput').value.trim().toUpperCase();
const dest = CODE_MAP[code];
if (dest) {
const frame = document.createElement('my-frame-loader');
frame.src = dest;
document.body.appendChild(frame);
decoderBox.style.display = 'none';
} else {
alert('Selo desconhecido ou não registrado.');
}
}
