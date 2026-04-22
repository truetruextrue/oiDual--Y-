

/* ══ PREVIEW OVERLAY JS ══════════════════════════════
   koblluxOpenPreview(html) — used by chat ⤢ button
   imgCode panel — Run, FS, Clear buttons
══════════════════════════════════════════════════════ */
(function() {
  'use strict';

  /* ── Preview overlay ── */
  const overlay = document.getElementById('kob-preview-overlay');
  const frame   = document.getElementById('kob-preview-frame');
  const closeBtn = document.getElementById('kob-preview-close');
  const copyBtn  = document.getElementById('kob-preview-copy');

  let _previewSrc = '';

  window.koblluxOpenPreview = function(html) {
    if (!overlay || !frame) return;
    _previewSrc = html;
    // Wrap plain text in minimal HTML if not already HTML
    const isHtml = /<[a-z][\s\S]*>/i.test(html);
    const doc = isHtml ? html : `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <style>
        body { margin:16px; font-family:system-ui,sans-serif; line-height:1.6;
               color:#e8e0f0; background:#0a0a18; }
        pre,code { background:rgba(255,255,255,.06); border-radius:6px; padding:3px 6px;
                   font-family:'Space Mono',monospace; font-size:.85em; }
        pre { padding:10px; overflow-x:auto; }
        h1,h2,h3 { color:#c9a84c; }
        a { color:#4a9eff; }
      </style>
    </head><body>${html.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</body></html>`;
    frame.srcdoc = doc;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  if (closeBtn) closeBtn.onclick = function() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    frame.srcdoc = 'about:blank';
  };

  if (copyBtn) copyBtn.onclick = function() {
    navigator.clipboard.writeText(_previewSrc).then(() => {
      copyBtn.textContent = '✅ Copiado!';
      setTimeout(() => copyBtn.textContent = '📋 Copiar', 2000);
    });
  };

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── imgCode panel ── */
  function initImgCode() {
    const ta   = document.getElementById('imgCodeTA');
    const prev = document.getElementById('imgCodePreview');
    const run  = document.getElementById('imgCodeRun');
    const fs   = document.getElementById('imgCodeFS');
    const clr  = document.getElementById('imgCodeClear');
    if (!ta || !prev) return;

    function runCode() {
      const html = ta.value.trim();
      if (!html) return;
      const isHtml = /<[a-z][\s\S]*>/i.test(html);
      prev.srcdoc = isHtml ? html : `<body style="font-family:sans-serif;padding:14px;color:#222">${html}</body>`;
    }

    if (run) run.onclick = runCode;
    if (clr) clr.onclick = () => { ta.value = ''; prev.srcdoc = 'about:blank'; };
    if (fs)  fs.onclick  = () => {
      const html = ta.value.trim();
      if (html) window.koblluxOpenPreview(html);
    };

    // Auto-run on Ctrl+Enter / Cmd+Enter
    ta.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
    });
  }

  // Init when v-img becomes active
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (btn && btn.dataset.nav === 'img') setTimeout(initImgCode, 150);
  });

  // Also init if already on v-img
  if (document.querySelector('#v-img.active')) initImgCode();
  setTimeout(initImgCode, 1200); // fallback

})();

