(() => {
  const CACHE_KEY = 'di_btn_icon_cache_v2';
  const buttons = () => Array.from(document.querySelectorAll('.symbol-button[data-url]'));

  const loadCache = () => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch { return {}; }
  };

  const saveCache = (cache) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
  };

  const cache = loadCache();

  const normKey = (url) => {
    try {
      const u = new URL(url, location.href);
      return u.href;
    } catch {
      return url;
    }
  };

  async function fetchText(url) {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  function pickBestIcon(icons = []) {
    if (!Array.isArray(icons) || !icons.length) return null;

    const parsed = icons
      .map(i => ({
        ...i,
        sizeNum: (() => {
          const m = String(i.sizes || '').match(/(\d+)\s*x\s*(\d+)/i);
          return m ? Math.max(+m[1], +m[2]) : 0;
        })()
      }))
      .sort((a, b) => b.sizeNum - a.sizeNum);

    return (
      parsed.find(i => String(i.sizes || '').includes('192')) ||
      parsed.find(i => i.sizeNum >= 192) ||
      parsed[0] ||
      null
    );
  }

  async function resolveIcon(url) {
    const key = normKey(url);
    if (cache[key]) return cache[key];

    try {
      const base = new URL(key);
      const html = await fetchText(base.href);
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const manifestLink = doc.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        const manifestUrl = new URL(manifestLink.getAttribute('href'), base).href;
        try {
          const manifest = await fetchJSON(manifestUrl);
          const icon = pickBestIcon(manifest?.icons);
          if (icon?.src) {
            const resolved = new URL(icon.src, manifestUrl).href;
            cache[key] = resolved;
            saveCache(cache);
            return resolved;
          }
        } catch {}
      }

      const apple = doc.querySelector(
        'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
      );
      if (apple?.href) {
        const resolved = new URL(apple.getAttribute('href'), base).href;
        cache[key] = resolved;
        saveCache(cache);
        return resolved;
      }

      const shortcut = doc.querySelector('link[rel="shortcut icon"], link[rel="icon"]');
      if (shortcut?.href) {
        const resolved = new URL(shortcut.getAttribute('href'), base).href;
        cache[key] = resolved;
        saveCache(cache);
        return resolved;
      }

      const fallback = new URL('/favicon.ico', base).href;
      cache[key] = fallback;
      saveCache(cache);
      return fallback;
    } catch (err) {
      const fallback = (() => {
        try { return new URL('/favicon.ico', new URL(key, location.href)).href; }
        catch { return null; }
      })();

      if (fallback) {
        cache[key] = fallback;
        saveCache(cache);
      }
      return fallback;
    }
  }

  function paintButton(btn, iconUrl) {
    if (!btn) return;

    btn.classList.add('di-icon-ready');
    btn.innerHTML = '';

    const img = document.createElement('img');
    img.className = 'di-btn-icon-img';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = iconUrl;

    img.onerror = () => {
      const fallback = document.createElement('span');
      fallback.className = 'di-btn-icon-fallback';
      fallback.textContent = btn.dataset.fallback || '◉';
      btn.innerHTML = '';
      btn.appendChild(fallback);
    };

    btn.appendChild(img);
  }

  async function processButton(btn) {
    const url = btn.dataset.url;
    if (!url) return;

    const icon = await resolveIcon(url);
    if (icon) paintButton(btn, icon);
  }

  async function run() {
    const list = buttons();
    await Promise.all(list.map(processButton));
  }

  function observeDynamicButtons() {
    const root = document.body;
    if (!root) return;

    const mo = new MutationObserver(() => {
      buttons().forEach(btn => {
        if (btn.dataset.diIconDone === '1') return;
        btn.dataset.diIconDone = '1';
        processButton(btn);
      });
    });

    mo.observe(root, { childList: true, subtree: true });
  }

  window.DI_ICON_LOADER = {
    refresh: run,
    clearCache() {
      Object.keys(cache).forEach(k => delete cache[k]);
      saveCache(cache);
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    await run();
    observeDynamicButtons();
  });
})();