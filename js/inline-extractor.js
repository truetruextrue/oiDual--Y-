(async function inlineStylesAndExtractScripts(){
  // Runner by ChatGPT — inline + extract
  try {
    // collect CSS property names referenced in same-origin stylesheets (best-effort)
    const propSet = new Set();
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (!sheet.cssRules) continue;
        for (const rule of Array.from(sheet.cssRules)) {
          // recursive for media/page/namespace rules
          const walkRules = (r) => {
            if (r.type === CSSRule.STYLE_RULE && r.style) {
              for (let i = 0; i < r.style.length; i++) propSet.add(r.style[i]);
            } else if (r.cssRules && r.cssRules.length) {
              for (const rr of Array.from(r.cssRules)) walkRules(rr);
            }
          };
          walkRules(rule);
        }
      } catch (e) {
        // cross-origin sheet, skip (fallback below will handle)
        // console.warn('sheet blocked', e);
        continue;
      }
    }

    const usePropList = propSet.size > 0 ? Array.from(propSet) : null;
    const origDocEl = document.documentElement;
    const clone = origDocEl.cloneNode(true);

    // Map original elements to clone elements by walk order
    const origEls = Array.from(document.querySelectorAll('*'));
    const cloneEls = Array.from(clone.querySelectorAll('*'));

    // If root <html> and <body> included, include them too
    if (!origEls.length && document.documentElement) {
      origEls.push(document.documentElement);
      cloneEls.push(clone);
    }

    const applyInline = (orig, cln) => {
      const cs = window.getComputedStyle(orig);
      let out = '';
      if (usePropList) {
        for (const p of usePropList) {
          const v = cs.getPropertyValue(p);
          if (v && v !== '' && v !== 'initial' && v !== 'unset') {
            out += `${p}: ${v}; `;
          }
        }
      } else {
        // fallback: iterate computed style keys
        for (let i = 0; i < cs.length; i++) {
          const p = cs[i];
          const v = cs.getPropertyValue(p);
          if (v && v !== '' && v !== 'initial' && v !== 'unset') {
            out += `${p}: ${v}; `;
          }
        }
      }
      if (out.trim()) {
        // preserve existing inline style as well (append)
        const existing = cln.getAttribute('style') || '';
        cln.setAttribute('style', (existing + ' ' + out).trim());
      }
    };

    const len = Math.min(origEls.length, cloneEls.length);
    for (let i = 0; i < len; i++) {
      try { applyInline(origEls[i], cloneEls[i]); } catch(e){/*ignore per-element errors*/}
    }
    // also set computed styles for html and body if present
    try { applyInline(document.documentElement, clone); } catch(e){}
    const origBody = document.body;
    const cloneBody = clone.querySelector('body');
    if (origBody && cloneBody) try { applyInline(origBody, cloneBody); } catch(e){}

    // remove all <style> and <link rel=stylesheet> from clone (we inlined)
    clone.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => n.remove());

    // Extract scripts
    const allScripts = Array.from(document.querySelectorAll('script'));
    const inlineScripts = allScripts.filter(s => !s.src).map(s => s.textContent || '');
    const externalScripts = allScripts.filter(s => s.src).map(s => s.src);

    // Build extracted JS content
    const extractedInlineJS = inlineScripts.join('\n\n/* ---- extracted inline script ---- */\n\n');

    // Build loader for external scripts (keeps original order)
    const externalLoader = externalScripts.length ? `
// external-scripts-loader.js
// This inserts original external scripts in document order
(function loadExternalScripts() {
  const urls = ${JSON.stringify(externalScripts, null, 2)};
  for (const url of urls) {
    try {
      const s = document.createElement('script');
      s.src = url;
      s.async = false;
      document.head.appendChild(s);
    } catch(e) {
      console.warn('failed inject external script', url, e);
    }
  }
})();
` : '';

    // Create final inlined HTML: clone outerHTML + doctype
    const doctype = '<!doctype html>\n';
    // If clone is <html> element, serialise full document
    const inlinedHTML = doctype + clone.outerHTML;

    // helper download
    function downloadBlob(content, filename, type='text/plain;charset=utf-8') {
      const blob = new Blob([content], {type});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=> {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1500);
    }

    // Trigger downloads
    downloadBlob(inlinedHTML, 'inlined.html', 'text/html;charset=utf-8');
    if (extractedInlineJS.trim()) downloadBlob(extractedInlineJS, 'extracted-scripts.js', 'application/javascript;charset=utf-8');
    if (externalLoader.trim()) downloadBlob(externalLoader, 'external-scripts-loader.js', 'application/javascript;charset=utf-8');

    // Quick summary in console
    console.log('✅ Inlining feito. Baixados: inlined.html' +
      (extractedInlineJS.trim()? ', extracted-scripts.js' : '') +
      (externalLoader.trim()? ', external-scripts-loader.js' : '') +
      '\nNota: revise o inlined.html para ajustar pseudo-elements e event-listeners que dependem de scripts in-page.'
    );
  } catch (err) {
    console.error('Erro no processo de inlining/extract:', err);
  }
})();