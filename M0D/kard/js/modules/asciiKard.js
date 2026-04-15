
  (function () {
    function getNameValue() {
      const input = document.getElementById('inputUser');
      const saved = localStorage.getItem('fusion_user') || '';
      const current = input && input.value ? input.value.trim() : '';
      return current || saved || 'Convidado';
    }

    function root369(name) {
      const clean = (name || '').trim();
      if (!clean) return '--';
      let n = clean.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      while (n > 9) n = String(n).split('').reduce((a, b) => a + Number(b), 0);
      return n;
    }

    function padTo(text, size) {
      text = String(text);
      if (text.length >= size) return text.slice(0, size);
      return text + ' '.repeat(size - text.length);
    }

    function makeMiniAvatarHTML(name, size = 36) {
      const seed = (name || 'DUAL').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const h1 = seed % 360;
      const h2 = (seed * 37) % 360;
      const id = 'g' + seed.toString(36);
      return `
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="hsl(${h1},100%,55%)"/>
              <stop offset="100%" stop-color="hsl(${h2},90%,45%)"/>
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="7" fill="#071018"/>
          <circle cx="16" cy="16" r="7" fill="url(#${id})"/>
          <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
        </svg>
      `;
    }

    function createAsciiActivation(name) {
      const clean = (name || '').trim() || 'Convidado';
      const displayName = `${clean}.Dual Infodose`;
      const title = 'CÉREBRO-ORÁCULO — BASE v1';

      const width = 35;
      const top = `+${'-'.repeat(width)}+`;
      const titleLine = `| ${padTo(title, width - 2)} |`;
      const nameLine = `Ativar: ${displayName}`;

      return {
        ascii: [
          top,
          titleLine,
          top,
          nameLine
        ].join('\n'),
        displayName,
        root: root369(clean),
        title
      };
    }

    function updateActivationBlock(name) {
      const els = {
        actPre: document.getElementById('actPre'),
        actName: document.getElementById('actName'),
        actTitle: document.getElementById('actTitle'),
        actMiniAvatar: document.getElementById('actMiniAvatar'),
        actBadge: document.getElementById('actBadge'),
        smallText: document.getElementById('smallText'),
        smallIdent: document.getElementById('smallIdent')
      };

      const data = createAsciiActivation(name);

      if (els.actPre) els.actPre.innerText = data.ascii;
      if (els.actName) els.actName.innerText = data.displayName;
      if (els.actTitle) els.actTitle.innerText = data.title;
      if (els.actMiniAvatar) els.actMiniAvatar.innerHTML = makeMiniAvatarHTML(name || 'DUAL', 36);

      if (els.actBadge) {
        els.actBadge.innerText = `v:${data.root}`;
        els.actBadge.classList.remove('vibe-gold');
        if (data.root === 3 || data.root === 6 || data.root === 9) {
          els.actBadge.classList.add('vibe-gold');
        }
      }

      if (els.smallText) {
        els.smallText.innerText = (name && name.trim())
          ? `${name.trim()} · canal ASCII ativo`
          : 'Aguardando ativação...';
      }

      if (els.smallIdent) {
        els.smallIdent.innerText = (name && name.trim()) ? `v:${data.root}` : '--';
      }
    }

    window.createAsciiActivation = createAsciiActivation;
    window.updateActivationBlock = updateActivationBlock;

    function bindLiveUpdate() {
      const input = document.getElementById('inputUser');
      if (!input) return;

      const run = () => updateActivationBlock(getNameValue());

      input.addEventListener('input', run);
      input.addEventListener('blur', run);

      run();
    }

    function hookButtons() {
      const copyBtn = document.getElementById('copyActBtn');
      const dlBtn = document.getElementById('downloadActBtn');
      const actCard = document.getElementById('activationCard');

      if (copyBtn) {
        copyBtn.onclick = async () => {
          const pre = document.getElementById('actPre');
          if (!pre) return;
          try {
            await navigator.clipboard.writeText(pre.innerText);
          } catch (_) {
            const ta = document.createElement('textarea');
            ta.value = pre.innerText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
        };
      }

      if (dlBtn) {
        dlBtn.onclick = async () => {
          if (!window.html2canvas || !actCard) return;
          const canvas = await html2canvas(actCard, { backgroundColor: null, scale: 2 });
          const a = document.createElement('a');
          a.download = `activation-${Date.now()}.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        };
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        bindLiveUpdate();
        hookButtons();
      });
    } else {
      bindLiveUpdate();
      hookButtons();
    }
  })();
