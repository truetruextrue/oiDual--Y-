function di_getCurrentName() {
  const input = document.getElementById('inputUser');
  const saved = localStorage.getItem('di_userName') || '';
  const current = input && input.value ? input.value.trim() : '';
  return current || saved || 'Convidado';
}

function di_syncOrbAvatars(name) {
  if (typeof makeOrbAvatar !== 'function') return;

  const safe = name || di_getCurrentName();

  if (window.els) {
    if (els.avatarTgt) els.avatarTgt.innerHTML = makeOrbAvatar(safe, 64);
    if (els.smallMiniAvatar) els.smallMiniAvatar.innerHTML = makeOrbAvatar(safe, 24);
    if (els.actMiniAvatar) els.actMiniAvatar.innerHTML = makeOrbAvatar(safe, 36);
    if (els.actName) els.actName.textContent = safe;
    if (els.lblName) els.lblName.textContent = safe;
  }
}

function di_syncSymbolBarTitle() {
  const hud = document.querySelector('.symbol-bar .hud-info');
  if (!hud) return false;

  const source =
    document.querySelector('#lblName') ||
    document.querySelector('#actName') ||
    document.querySelector('.arch-name') ||
    document.querySelector('[data-di-name]');

  const text = (source?.textContent || source?.innerText || localStorage.getItem('di_userName') || 'Convidado')
    .replace(/\s+/g, ' ')
    .trim();

  hud.textContent = text || 'Convidado';
  return true;
}

function di_bindSymbolBarObserver() {
  let titleObserver = null;

  const attach = () => {
    const source =
      document.querySelector('#lblName') ||
      document.querySelector('#actName') ||
      document.querySelector('.arch-name') ||
      document.querySelector('[data-di-name]');

    const hud = document.querySelector('.symbol-bar .hud-info');
    if (!source || !hud) return false;

    const sync = () => {
      const text = (source.textContent || source.innerText || '').replace(/\s+/g, ' ').trim();
      hud.textContent = text || 'Convidado';
    };

    sync();

    if (titleObserver) titleObserver.disconnect();
    titleObserver = new MutationObserver(sync);
    titleObserver.observe(source, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return true;
  };

  if (attach()) return;

  const bootObserver = new MutationObserver(() => {
    if (attach()) bootObserver.disconnect();
  });

  bootObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function di_bootOrbSystem() {
  const name = di_getCurrentName();

  di_syncOrbAvatars(name);
  di_syncSymbolBarTitle();
  di_bindSymbolBarObserver();

  const input = document.getElementById('inputUser');
  if (input && !input.dataset.diOrbBound) {
    input.dataset.diOrbBound = '1';
    input.addEventListener('input', (e) => {
      const nextName = (e.target.value || '').trim() || 'Convidado';
      localStorage.setItem('di_userName', nextName);

      di_syncOrbAvatars(nextName);
      di_syncSymbolBarTitle();

      if (typeof updateInterface === 'function') {
        updateInterface(nextName);
      }
    });
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'di_userName' || e.key === 'di_infodoseName') {
      const nextName = di_getCurrentName();
      di_syncOrbAvatars(nextName);
      di_syncSymbolBarTitle();
      if (typeof updateInterface === 'function') updateInterface(nextName);
    }
  });
}

window.di_bootOrbSystem = di_bootOrbSystem;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', di_bootOrbSystem);
} else {
  di_bootOrbSystem();
}
