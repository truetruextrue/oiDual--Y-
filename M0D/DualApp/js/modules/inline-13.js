
// Toggle do painel de controle
document.getElementById('togglePanelBtn').addEventListener('click', function () {
const panel = document.getElementById('layoutTogglePanel');
panel.style.display = (panel.style.display === 'none' || getComputedStyle(panel).display === 'none') ? 'flex' : 'none';
});
// Funções básicas de mostrar/ocultar
function toggleElement(selector, input) {
selector.split(',').forEach(sel => {
document.querySelectorAll(sel).forEach(el => {
el.style.display = input.checked ? '' : 'none';
});
});
}
function ocultarTodos() {
['#response', '.svg-container', '#koblluxPlayer', '#uploadComponentBtn', '#remoteComponentBtn', '#toggleDecoderBtn', '.symbol-bar']
.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = 'none'));
}
function mostrarTodos() {
['#response', '.svg-container', '#koblluxPlayer', '#uploadComponentBtn', '#remoteComponentBtn', '#toggleDecoderBtn', '.symbol-bar']
.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = ''));
}
// LocalStorage
function salvarEstadoUI() {
const estado = {
response: getDisplayState('#response'),
svg: getDisplayState('.svg-container'),
player: getDisplayState('#koblluxPlayer'),
botoes: getDisplayState('#uploadComponentBtn,#remoteComponentBtn,#toggleDecoderBtn'),
bar: getDisplayState('.symbol-bar')
};
localStorage.setItem('layoutConfig', JSON.stringify(estado));
logMistico?.("🎛️ Preferência de layout salva.");
}
function getDisplayState(selector) {
const el = document.querySelector(selector.split(',')[0]);
return el?.style.display !== 'none';
}
function carregarEstadoUI() {
const saved = JSON.parse(localStorage.getItem('layoutConfig') || '{}');
Object.entries(saved).forEach(([key, visible]) => {
let sel;
if (key === 'response') sel = '#response';
if (key === 'svg') sel = '.svg-container';
if (key === 'player') sel = '#koblluxPlayer';
if (key === 'botoes') sel = '#uploadComponentBtn,#remoteComponentBtn,#toggleDecoderBtn';
if (key === 'bar') sel = '.symbol-bar';
sel && document.querySelectorAll(sel).forEach(el => el.style.display = visible ? '' : 'none');
});
}
// MODO SIMBIÓTICO PRESET
function ativarModo(modo) {
ocultarTodos();
const modos = {
pulse: ['#koblluxPlayer'],
happyHour: ['#response', '.symbol-bar'],
ritual: ['#response', '#koblluxPlayer'],
exploracao: ['#response', '.symbol-bar', '#koblluxPlayer', '#uploadComponentBtn', '#remoteComponentBtn', '#toggleDecoderBtn', '.svg-container']
};
(modos[modo] || []).forEach(sel => {
document.querySelectorAll(sel).forEach(el => el.style.display = '');
});
logMistico?.("⚙️ Modo ativado: " + modo);
}
// Carregar config ao iniciar
document.addEventListener("DOMContentLoaded", () => {
carregarEstadoUI();
});
