/* ╔════════════════════════════════════╗
   ║  KOBLLUX · FUSION ↔ SYMBOL BRIDGE ║
   ╚════════════════════════════════════╝ */

function di_renderSymbolBar() {
  const bar = document.getElementById("symbolBar");
  const frame = document.getElementById("frame");
  if (!bar || !frame) return;

  // remove antigos dinâmicos
  bar.querySelectorAll("[data-fusion]").forEach(el => el.remove());

  const raw = localStorage.getItem("fusion_os_state_v2_3");
  if (!raw) return;

  const state = JSON.parse(raw);
  const apps = state.installed || [];

  apps.forEach(app => {
    const wrap = document.createElement("div");
    wrap.className = "symbol-wrap";
    wrap.dataset.fusion = "true";

    const btn = document.createElement("button");
    btn.className = "symbol-button";

    // label inteligente
    btn.textContent = app.code?.slice(0,2) || app.name?.slice(0,2) || "◉";

    btn.title = app.name;

    btn.onclick = () => {
      if (app.url) {
        frame.src = app.url;
      } else if (app.html) {
        frame.srcdoc = app.html;
      }
    };

    wrap.appendChild(btn);

    bar.insertBefore(wrap, document.getElementById("hudStatus"));
  });
}

function di_hookFusion() {
  if (!window.FusionOS) return;

  // intercepta register
  const original = FusionOS.register;

  FusionOS.register = function(...args){
    const res = original.apply(FusionOS, args);
    setTimeout(di_renderSymbolBar, 120);
    return res;
  };window.addEventListener("load", () => {
  setTimeout(() => {
    di_renderSymbolBar();
    di_hookFusion();
  }, 600);
});
}
