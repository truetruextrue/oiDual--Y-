

/* ══════════════════════════════════════════════════════════════
   KOBLLUX DNA · V.E.E.B. MATH RENDERER
   Renders KaTeX equations and DNA table from KOBLLUX_DNA object
   Zero design changes — purely adds math layer to existing UI
══════════════════════════════════════════════════════════════ */
(function initVEEBMath() {
  'use strict';

  /* ── Render VEEB formula grid ── */
  function renderVeebGrid() {
    const grid = document.getElementById('veeb-math-grid');
    if (!grid || typeof katex === 'undefined') return;

    const layers = [
      { letter:'V', label:'Vibração', color:'#00e5ff',
        latex:'f_{\\text{total}} = f_{432} + f_{7.83}\\cdot\\sin(\\theta)',
        eq2:'V(n) = V_0\\prod_{k=1}^{n}\\cos\\!\\left(\\dfrac{3\\pi k}{6}\\right)',
        desc:'Frequência base + modulação Schumann' },
      { letter:'E', label:'Energia', color:'#f0c060',
        latex:'E_{\\text{tor}} = \\int_0^T \\Phi(t)\\cdot\\omega(t)\\,dt',
        eq2:'\\bar{E} = \\frac{1}{T}\\int_0^T E(t)\\,dt',
        desc:'Integral toroidal · ciclo 3→6→9' },
      { letter:'E', label:'Estrutura', color:'#8b5cf6',
        latex:'\\chi = V - E + F \\quad g = 1 - \\tfrac{\\chi}{2}',
        eq2:'D = \\dfrac{\\log N}{\\log(1/r)}',
        desc:'Euler χ · genus g · dimensão fractal D' },
      { letter:'B', label:'Base', color:'#39ff5a',
        latex:'S = \\sum_{i=0}^{n-1} b_i \\cdot 2^i, \\quad b_i \\in \\{0,1\\}',
        eq2:'b_i=0\\Rightarrow\\text{vazio}\\quad b_i=1\\Rightarrow\\text{potência}',
        desc:'S=0: vazio · S=2ⁿ-1: manifesto total' }
    ];

    grid.innerHTML = layers.map(l => {
      let html1='', html2='';
      try {
        html1 = katex.renderToString(l.latex, {throwOnError:false,displayMode:true});
        html2 = katex.renderToString(l.eq2,   {throwOnError:false,displayMode:true});
      } catch(e) {
        html1 = `<span style="color:rgba(255,255,255,.4)">${l.latex}</span>`;
        html2 = `<span style="color:rgba(255,255,255,.4)">${l.eq2}</span>`;
      }
      return `
        <div style="background:rgba(0,0,0,.35);border-left:2px solid ${l.color};border-radius:0 8px 8px 0;padding:10px 12px">
          <div style="font-family:'Space Mono',monospace;font-size:var(--fs-d2);color:${l.color};letter-spacing:.25em;text-transform:uppercase;margin-bottom:6px">
            ${l.letter} · ${l.label}
          </div>
          <div style="overflow-x:auto;margin-bottom:4px">${html1}</div>
          <div style="overflow-x:auto;margin-bottom:6px;opacity:.75">${html2}</div>
          <div style="font-size:var(--fs-d2);color:var(--dim);letter-spacing:.06em">${l.desc}</div>
        </div>`;
    }).join('');
  }

  /* ── Render DNA opcode table ── */
  function renderDnaTable() {
    const tbody = document.getElementById('dna-tbody');
    if (!tbody || !window.KOBLLUX_DNA) return;
    tbody.innerHTML = Object.entries(KOBLLUX_DNA.opcodes).map(([code, o]) => `
      <tr style="border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s" 
          onmouseenter="this.style.background='rgba(255,255,255,.03)'"
          onmouseleave="this.style.background='transparent'">
        <td style="padding:4px 8px;color:${o.cor};font-weight:700">${code}</td>
        <td style="padding:4px 8px;color:var(--pearl);letter-spacing:.08em">${o.nome}</td>
        <td style="padding:4px 8px;text-align:center;font-size:1.1rem;filter:drop-shadow(0 0 4px ${o.cor})">${o.geom}</td>
        <td style="padding:4px 8px;text-align:right;color:${o.cor};font-weight:700">${o.freq}</td>
        <td style="padding:4px 8px;color:var(--mist);font-size:var(--fs-d1)">${o.dim}</td>
        <td style="padding:4px 8px;text-align:center;color:var(--dim)">${o.chi}</td>
        <td style="padding:4px 8px">
          <span style="padding:1px 6px;border-radius:10px;border:1px solid ${o.cor}44;color:${o.cor};font-size:var(--fs-d1)">${o.veebKey}</span>
        </td>
      </tr>`).join('');
  }

  /* ── Auto-render KaTeX text in views ── */
  function autoRenderKatex() {
    if (typeof renderMathInElement === 'undefined') return;
    renderMathInElement(document.body, {
      delimiters:[
        {left:'$$',right:'$$',display:true},
        {left:'$',right:'$',display:false}
      ],
      throwOnError:false, strict:false
    });
  }

  /* ── Boot ── */
  function boot() {
    renderDnaTable();
    renderVeebGrid();
    autoRenderKatex();
  }

  // When user navigates to core tab
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-nav]');
    if (btn && btn.dataset.nav === 'core') setTimeout(boot, 200);
  });

  // Boot if already on core
  if (document.querySelector('#v-core.active')) boot();

  // Delayed fallback
  setTimeout(() => {
    if (document.getElementById('dna-tbody') && !document.getElementById('dna-tbody').innerHTML) boot();
  }, 1500);

  // Expose globally
  window.koblluxVEEB = { renderVeebGrid, renderDnaTable, boot };

})();

