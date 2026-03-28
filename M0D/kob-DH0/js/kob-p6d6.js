
(function () {
  'use strict';

  const LP = 1870;

  let currentEditingBtn = null;
  let currentEditingBarId = null;
  let pressTimer = null;

  const back = document.getElementById('kblx-back');
  const ttl  = document.getElementById('kblx-ttl');
  const inp  = document.getElementById('kblx-inp');

  if (!back) return;

  function closeEditor() {
    back.classList.remove('open');
    currentEditingBtn = null;
    currentEditingBarId = null;
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = null;
  }

  function openPanel(btn, barId) {
    currentEditingBtn = btn;
    currentEditingBarId = barId;

    const sym = (btn.textContent.trim() || btn.dataset.id || '?');
    if (ttl) ttl.textContent = 'Botão ' + sym + ' [data-id="' + (btn.dataset.id || '') + '"]';
    if (inp) inp.value = btn.dataset.url || '';

    back.classList.add('open');
    setTimeout(() => inp && inp.focus(), 80);
  }

  function saveUrl() {
    if (!currentEditingBtn || !currentEditingBarId) return closeEditor();

    const v = inp.value.trim();
    if (v) {
      updateButtonInBar(
        currentEditingBarId,
        currentEditingBtn.dataset.id,
        v,
        currentEditingBtn.innerHTML
      );
    }

    closeEditor();
  }

  function deleteCurrentButton() {
    if (!currentEditingBtn || !currentEditingBarId) return;
    deleteButtonFromBar(currentEditingBarId, currentEditingBtn.dataset.id);
    closeEditor();
  }

  function attachLongPressEvents() {
    document.querySelectorAll('.symbol-button[data-url]').forEach(btn => {
      const bar = btn.closest('.symbol-bar');
      if (!bar) return;
      const barId = bar.id;

      if (btn._kblxDown) btn.removeEventListener('pointerdown', btn._kblxDown);
      if (btn._kblxUp) {
        btn.removeEventListener('pointerup', btn._kblxUp);
        btn.removeEventListener('pointerleave', btn._kblxUp);
        btn.removeEventListener('pointercancel', btn._kblxUp);
      }

      const onDown = () => {
        if (currentEditingBtn) return;
        pressTimer = setTimeout(() => openPanel(btn, barId), LP);
      };

      const onUp = () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
      };

      btn._kblxDown = onDown;
      btn._kblxUp = onUp;

      btn.addEventListener('pointerdown', onDown, { passive: true });
      btn.addEventListener('pointerup', onUp, { passive: true });
      btn.addEventListener('pointerleave', onUp, { passive: true });
      btn.addEventListener('pointercancel', onUp, { passive: true });
    });
  }

  function initEditorPanel() {
    const saveBtn  = document.getElementById('kblx-btn-save');
    const closeBtn = document.getElementById('kblx-btn-close');

    if (saveBtn) saveBtn.onclick = saveUrl;
    if (closeBtn) closeBtn.onclick = closeEditor;

    back.addEventListener('click', e => {
      if (e.target === back) closeEditor();
    });

    document.addEventListener('keydown', e => {
      if (!back.classList.contains('open')) return;
      if (e.key === 'Escape') closeEditor();
      if (e.key === 'Enter') saveUrl();
    });
  }

  function addDeleteButtonToPanel() {
    if (document.getElementById('kblx-btn-delete')) return;

    const panel = document.getElementById('kblx-back');
    if (!panel) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.id = 'kblx-btn-delete';
    deleteBtn.className = 'kblx-btn kblx-delete';
    deleteBtn.textContent = '🗑 Remover Botão';
    deleteBtn.style.background = '#ff3366';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.border = 'none';

    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(deleteBtn);

    deleteBtn.onclick = deleteCurrentButton;
  }

  function addFileUploadToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel) return;

    let fileInput = document.getElementById('kblx-file-upload');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'kblx-file-upload';
      fileInput.accept = '.html';
      fileInput.style.marginTop = '10px';
      fileInput.style.width = '100%';
      fileInput.style.padding = '6px';
      fileInput.style.background = '#1e1e2f';
      fileInput.style.color = '#fff';
      fileInput.style.border = '1px solid #2a2a3a';
      fileInput.style.borderRadius = '6px';

      const container = panel.querySelector('.p-lbl');
      if (container && container.parentNode) {
        container.parentNode.insertBefore(fileInput, container.nextSibling);
      } else {
        panel.appendChild(fileInput);
      }
    }

    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file || !currentEditingBtn || !currentEditingBarId) return;

      const reader = new FileReader();
      reader.onload = ev => {
        updateButtonInBar(
          currentEditingBarId,
          currentEditingBtn.dataset.id,
          '',
          currentEditingBtn.innerHTML,
          ev.target.result
        );
        closeEditor();
      };

      reader.readAsText(file);
      fileInput.value = '';
    };
  }

  function addBarSelector() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-bar-selector')) return;

    const selectorDiv = document.createElement('div');
    selectorDiv.id = 'kblx-bar-selector';
    selectorDiv.style.marginTop = '15px';
    selectorDiv.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    selectorDiv.style.paddingTop = '12px';

    const label = document.createElement('div');
    label.textContent = 'BARRA ATIVA:';
    label.style.fontSize = '0.7rem';
    label.style.marginBottom = '6px';
    label.style.color = 'rgba(255,255,255,0.5)';
    selectorDiv.appendChild(label);

    const select = document.createElement('select');
    select.id = 'barSelect';
    select.style.width = '100%';
    select.style.padding = '6px';
    select.style.background = '#1e1e2f';
    select.style.color = '#fff';
    select.style.border = '1px solid #2a2a3a';
    select.style.borderRadius = '6px';

    window.updateBarSelect = () => {
      const currentBars = Object.keys(STATE.symbolBars || {});
      select.innerHTML = '';
      currentBars.forEach(barId => {
        const option = document.createElement('option');
        option.value = barId;
        option.textContent = barId === STATE.activeBarId ? `★ ${barId}` : barId;
        if (barId === STATE.activeBarId) option.selected = true;
        select.appendChild(option);
      });
    };

    select.onchange = () => {
      setActiveBar(select.value);
      if (window.updateBarSelect) window.updateBarSelect();
    };

    selectorDiv.appendChild(select);
    panel.appendChild(selectorDiv);
    window.updateBarSelect();
  }

  function addNewBarButtonToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-btn-newbar')) return;

    const btn = document.createElement('button');
    btn.id = 'kblx-btn-newbar';
    btn.textContent = '➕ Nova Barra';
    btn.className = 'kblx-btn';
    btn.style.background = 'linear-gradient(135deg,#00f2ff,#0066ff)';
    btn.style.color = '#000';
    btn.style.fontWeight = '700';

    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(btn);
    else panel.appendChild(btn);

    btn.onclick = () => {
      createNewBar();
      closeEditor();
    };
  }

  function addDuplicateButtonToPanel() {
    const panel = document.getElementById('kblx-back');
    if (!panel || document.getElementById('kblx-btn-dup')) return;

    const dupBtn = document.createElement('button');
    dupBtn.id = 'kblx-btn-dup';
    dupBtn.textContent = '⧉ Duplicar Barra';
    dupBtn.className = 'kblx-btn';

    const row = panel.querySelector('.kblx-row');
    if (row) row.appendChild(dupBtn);

    dupBtn.onclick = () => {
      duplicateBar(STATE.activeBarId);
      closeEditor();
    };
  }

  function init() {
    attachLongPressEvents();
    initEditorPanel();
    addDeleteButtonToPanel();
    addFileUploadToPanel();
    addBarSelector();
    addNewBarButtonToPanel();
    addDuplicateButtonToPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
