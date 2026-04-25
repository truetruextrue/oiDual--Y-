function loadBackgroundFromStorage() {
  const url = localStorage.getItem('di_bg_url');
  const opacity = localStorage.getItem('di_bg_opacity');
  const blend = localStorage.getItem('di_bg_blend');
  if (url && url !== 'null') {
    applyBackgroundToDOM(url, opacity || 18, blend || 'multiply');
    // sincroniza UI da drawer
  }
}
// Executado no DOMContentLoaded e no message do iframe