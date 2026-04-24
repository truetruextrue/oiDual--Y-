async function di_loadApp({ html, css, js }) {
  // HTML
  const root = document.querySelector('#app-root') || document.body;
  root.innerHTML = html;

  // CSS
  if (css) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css;
    document.head.appendChild(link);
  }

  // JS (module)
  if (js) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = js;
    document.body.appendChild(script);
  }
}
di_loadApp({
  html: `<div class="bg-gradient-base"></div> ...`,
  css: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/css/main.css",
  js: "https://kodux78k.github.io/oiDual--Y-/M0D/78F/js/main.js"
});
