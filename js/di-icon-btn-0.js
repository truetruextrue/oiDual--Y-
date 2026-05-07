(() => {
  const CACHE_KEY = 'di_btn_icon_cache_v2';
  const STORAGE_PREFIX = 'symbol_button_';

  const buttons = () =>
    Array.from(document.querySelectorAll('.symbol-button[data-url]'));

  const storageGet = (storage, key) => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const storageSet = (storage, key, value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const storageRemove = (storage, key) => {
    try {
      storage.removeItem(key);
    } catch {}
  };

  const loadCache = () => storageGet(localStorage, CACHE_KEY) || {};
  const saveCache = (cache) => storageSet(localStorage, CACHE_KEY, cache);

  const cache = loadCache();

  const normKey = (url) => {
    try {
      return new URL(url, location.href).href;
    } catch {
      return String(url || '');
    }
  };

  const getStorageKey = (btn) => {
    if (!btn) return null;
    if (btn.id) return `${STORAGE_PREFIX}${btn.id}`;
    if (btn.dataset.storeKey) return `${STORAGE_PREFIX}${btn.dataset.storeKey}`;
    return null;
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
        const manifestUrl = new URL(
          manifestLink.getAttribute('href'),
          base
        ).href;

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

      if (apple?.getAttribute('href')) {
        const resolved = new URL(apple.getAttribute('href'), base).href;
        cache[key] = resolved;
        saveCache(cache);
        return resolved;
      }

      const shortcut = doc.querySelector(
        'link[rel="shortcut icon"], link[rel="icon"]'
      );

      if (shortcut?.getAttribute('href')) {
        const resolved = new URL(shortcut.getAttribute('href'), base).href;
        cache[key] = resolved;
        saveCache(cache);
        return resolved;
      }

      const fallback = new URL('/favicon.ico', base).href;
      cache[key] = fallback;
      saveCache(cache);
      return fallback;
    } catch {
      const fallback = (() => {
        try {
          return new URL('/favicon.ico', new URL(key, location.href)).href;
        } catch {
          return null;
        }
      })();

      if (fallback) {
        cache[key] = fallback;
        saveCache(cache);
      }

      return fallback;
    }
  }

  function paintButton(btn, iconUrl) {
    if (!btn || !iconUrl) return;

    btn.classList.add('di-icon-ready');
    btn.dataset.diIconDone = '1';

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
    const url = btn?.dataset?.url;
    if (!url) return;

    const icon = await resolveIcon(url);
    if (icon) paintButton(btn, icon);
  }

  async function run() {
    await Promise.all(buttons().map(processButton));
  }

  function restoreButtons() {
    document.querySelectorAll('.symbol-button').forEach((btn) => {
      const key = getStorageKey(btn);
      if (!key) return;

      const sessionData = storageGet(sessionStorage, key);
      const localData = storageGet(localStorage, key);
      const data = sessionData || localData;

      if (!data) return;

      if (data.url) {
        btn.dataset.url = data.url;
      }

      if (data.iconUrl) {
        paintButton(btn, data.iconUrl);
      } else if (btn.dataset.url) {
        btn.dataset.diIconDone = '';
        processButton(btn);
      }
    });
  }

  async function updateAttrBtn(
    btn,
    {
      url,
      save = true,
      session = true,
      refresh = true,
      fallback = '◉'
    } = {}
  ) {
    if (!btn || !url) return null;

    const cleanUrl = String(url).trim();
    if (!cleanUrl) return null;

    btn.dataset.url = cleanUrl;
    btn.dataset.fallback = fallback;
    btn.dataset.diIconDone = '';

    let iconUrl = null;

    if (refresh) {
      iconUrl = await resolveIcon(cleanUrl);
      if (iconUrl) paintButton(btn, iconUrl);
    }

    const payload = {
      id: btn.id || '',
      url: cleanUrl,
      iconUrl: iconUrl || '',
      updatedAt: Date.now()
    };

    const key = getStorageKey(btn);
    if (key) {
      if (session) storageSet(sessionStorage, key, payload);
      if (save) storageSet(localStorage, key, payload);
      if (!session && !save) {
        storageRemove(sessionStorage, key);
        storageRemove(localStorage, key);
      }
    }

    window.dispatchEvent(
      new CustomEvent('di-button-updated', { detail: payload })
    );

    return payload;
  }

  function observeDynamicButtons() {
    const root = document.body;
    if (!root) return;

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;

            if (node.matches?.('.symbol-button[data-url]')) {
              processButton(node);
            }

            node
              .querySelectorAll?.('.symbol-button[data-url]')
              .forEach((btn) => processButton(btn));
          });
        }

        if (m.type === 'attributes' && m.attributeName === 'data-url') {
          const btn = m.target;
          if (btn?.classList?.contains('symbol-button')) {
            btn.dataset.diIconDone = '';
            processButton(btn);
          }
        }
      }
    });

    mo.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-url']
    });
  }

  window.DI_ICON_LOADER = {
    refresh: run,
    clearCache() {
      Object.keys(cache).forEach((k) => delete cache[k]);
      saveCache(cache);
    },
    updateAttrBtn,
    restoreButtons
  };

  function init() {
    restoreButtons();
    run();
    observeDynamicButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
