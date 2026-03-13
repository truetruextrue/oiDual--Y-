
document.addEventListener("click", function(e) {
window.parent.postMessage({
type: "iframeClick",
x: e.clientX,
y: e.clientY
}, "*");
});
document.addEventListener("touchstart", function(e) {
const t = e.touches[0];
if (t) {
window.parent.postMessage({
type: "iframeClick",
x: t.clientX,
y: t.clientY
}, "*");
}
});
