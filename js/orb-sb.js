(async () => {

  async function getIcon(url){
    try{
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const icon =
        doc.querySelector('link[rel="apple-touch-icon"]') ||
        doc.querySelector('link[rel="icon"]');

      if(icon){
        return new URL(icon.getAttribute('href'), url).href;
      }

      return new URL('/favicon.ico', url).href;

    }catch{
      return null;
    }
  }

  const buttons = document.querySelectorAll('.symbol-button[data-url]');

  for(const btn of buttons){
    const url = btn.dataset.url;
    if (!url) continue;

    btn.classList.add('di-hybrid-orb');

    const icon = await getIcon(url);

    btn.innerHTML = `
      <span class="di-hybrid-orb__icon" style="background-image:url('${icon}')"></span>
      <span class="di-hybrid-orb__glow"></span>
      <span class="di-hybrid-orb__core">
        <div class="orb">
          <div class="orb-core"></div>
        </div>
      </span>
    `;

    btn.onclick = () => {
      document.getElementById('frame').src = url;
    };
  }

})();